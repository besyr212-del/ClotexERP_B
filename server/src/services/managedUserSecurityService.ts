import bcrypt from 'bcryptjs';
import type { PoolClient } from 'pg';
import { getPool } from '../db/pool.js';
import type { JwtPayload } from '../middleware/auth.js';
import { requireLiveActor, SecurityAccessError, type LiveUserAuthorization } from './liveAuthorizationService.js';
import { verifyCurrentUserPassword } from '../utils/reauthGuard.js';
import { logPlatformAction } from './platformAuditService.js';
import { protectC1ManagedUser, applyNewUserDefault } from './userPermissionProfileService.js';
type UserInput = {
    username: string;
    fullName: string;
    password?: string;
    role: string;
    isActive: boolean;
    notes: string;
    companyId?: string;
    currentPassword?: string;
};
async function rolePermissions(client: PoolClient, role: string) {
    const found = await client.query('SELECT id FROM roles WHERE code=$1 FOR SHARE', [role]);
    if (!found.rowCount)
        throw new SecurityAccessError('الدور المحدد غير موجود', 400, 'VALIDATION');
    const result = await client.query<{
        code: string;
    }>(`SELECT p.code FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id
     WHERE rp.role_id=$1 FOR SHARE OF rp`, [found.rows[0].id]);
    return result.rows.map(row => row.code);
}
/** TASK 004 is not merged here. Read its grants only if its existing table is present.
 * No dependency on 081, no writes to TASK 004 grants and no new permission model. */
async function optionalTask004Grants(client: PoolClient, companyId: string, userId: string) {
    const catalog = await client.query<{
        present: boolean;
    }>("SELECT to_regclass('public.task004_user_permissions') IS NOT NULL AS present");
    if (!catalog.rows[0]?.present)
        return [];
    const result = await client.query<{
        code: string;
    }>(`SELECT permission_code AS code FROM task004_user_permissions
     WHERE company_id=$1 AND user_id=$2 FOR SHARE`, [companyId, userId]);
    return result.rows.map(row => row.code);
}
async function assertDelegation(client: PoolClient, actor: LiveUserAuthorization, scopeCompanyId: string, requestedRole: string, target: LiveUserAuthorization | undefined) {
    const proposed = await rolePermissions(client, requestedRole);
    if (actor.is_platform_admin)
        return;
    if (scopeCompanyId !== actor.company_id || target?.company_id && target.company_id !== actor.company_id) {
        throw new SecurityAccessError('لا يمكن إدارة مستخدم خارج الشركة');
    }
    if (target?.is_platform_admin)
        throw new SecurityAccessError('لا يمكن تعديل حساب مدير منصة');
    // admin still has legacy bypasses outside phase A; a permission-subset comparison alone
    // cannot safely delegate that role. Existing admins can maintain their own account.
    const ownUnchangedAdmin = target?.id === actor.id && actor.role === 'admin' && requestedRole === 'admin';
    if ((requestedRole === 'admin' && !ownUnchangedAdmin) || (target?.role === 'admin' && target.id !== actor.id)) {
        throw new SecurityAccessError('إسناد دور admin أو تعديل حساب مدير آخر يتطلب مدير منصة');
    }
    const actorCodes = new Set([...actor.permissions, ...await optionalTask004Grants(client, actor.company_id, actor.id)]);
    const targetCodes = target ? [
        ...await rolePermissions(client, target.role),
        ...await optionalTask004Grants(client, target.company_id, target.id),
    ] : [];
    if ([...proposed, ...targetCodes].some(code => code.startsWith('platform.') || !actorCodes.has(code))) {
        throw new SecurityAccessError('صلاحيات الدور أو الحساب المطلوب تتجاوز حدود تفويضك');
    }
}
export async function saveManagedUser(claims: JwtPayload, input: UserInput, targetId?: string, token?: string) {
    // Hashing outside the transaction; authorization is checked AFTER this work.
    const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : null;
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        // Rare administrative writes are serialized to avoid mutually disabling admins,
        // concurrent role replacement and lock upgrades. No persistent schema/state is added.
        await client.query('SELECT pg_advisory_xact_lock(5005, 1)');
        const actor = await requireLiveActor(client, claims, { lock: true, token, permission: 'users.manage' });
        let target: LiveUserAuthorization | undefined;
        if (targetId) {
            const existing = await client.query<LiveUserAuthorization>('SELECT id,company_id,username,full_name,role,is_active,is_platform_admin FROM users WHERE id=$1 FOR UPDATE', [targetId]);
            target = existing.rows[0];
            // Do not disclose whether an inaccessible company's user exists.
            if (!target || (!actor.is_platform_admin && target.company_id !== claims.companyId)) {
                throw new SecurityAccessError('المستخدم غير موجود في الشركة المسموحة', 404, 'NOT_FOUND');
            }
        }
        const companyId = target?.company_id ?? (actor.is_platform_admin ? input.companyId ?? claims.companyId : claims.companyId);
        if (input.companyId && input.companyId !== companyId)
            throw new SecurityAccessError('لا يمكن نقل حساب مستخدم بين الشركات بهذا المسار');
        if (!actor.is_platform_admin && companyId !== actor.company_id)
            throw new SecurityAccessError();
        const company = await client.query('SELECT id FROM companies WHERE id=$1 AND is_active', [companyId]);
        if (!company.rowCount)
            throw new SecurityAccessError('الشركة المحددة غير متاحة', 400, 'COMPANY_NOT_FOUND');
        if (!targetId && !passwordHash)
            throw new SecurityAccessError('كلمة مرور المستخدم الجديد مطلوبة', 400, 'VALIDATION');
        if (target?.id === actor.id && (!input.isActive || input.role !== actor.role)) {
            throw new SecurityAccessError('لا يمكن تعطيل حسابك أو تغيير دورك من جلسة الإدارة نفسها');
        }
        await assertDelegation(client, actor, companyId, input.role, target);
        await protectC1ManagedUser(client, actor, target, input.isActive, input.currentPassword);
        // Prevent a stolen management JWT from resetting a platform password and then
        // satisfying the full-backup reauthentication challenge with the new password.
        if (target?.is_platform_admin || (target?.id === actor.id && passwordHash)) {
            await verifyCurrentUserPassword(client, actor.id, input.currentPassword ?? '');
        }
        const result = targetId
            ? await client.query(`UPDATE users SET username=$3,full_name=$4,role=$5,is_active=$6,
          password_hash=COALESCE($7,password_hash),notes=$8,updated_at=now()
         WHERE id=$1 AND company_id=$2
         RETURNING id,username,full_name,role,is_active,notes,updated_at`, [targetId, companyId, input.username.trim(), input.fullName || null, input.role, input.isActive, passwordHash, input.notes || null])
            : await client.query(`INSERT INTO users(company_id,username,full_name,password_hash,role,is_active,notes)
         VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,username,full_name,role,is_active,notes,created_at`, [companyId, input.username.trim(), input.fullName || null, passwordHash, input.role, input.isActive, input.notes || null]);
        const saved = result.rows[0];
        if (!targetId) await applyNewUserDefault(client, actor, companyId, saved.id);
        await client.query(`INSERT INTO audit_logs(company_id,user_id,action,entity_type,entity_id,details)
       VALUES($1,$2,$3,'USER',$4,$5::jsonb)`, [companyId, actor.id, targetId ? 'SECURITY_USER_UPDATED' : 'SECURITY_USER_CREATED', saved.id, JSON.stringify({
                previousRole: target?.role ?? null, role: input.role, previousActive: target?.is_active ?? null,
                isActive: input.isActive, passwordChanged: Boolean(passwordHash),
            })]);
        if (actor.is_platform_admin && companyId !== actor.company_id) {
            await logPlatformAction(client, {
                actorUserId: actor.id, action: targetId ? 'UPDATE_USER_IN_OTHER_COMPANY' : 'CREATE_USER_IN_OTHER_COMPANY',
                fromCompanyId: actor.company_id, toCompanyId: companyId, details: { userId: saved.id, role: input.role },
            });
        }
        await client.query('COMMIT');
        return saved;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
