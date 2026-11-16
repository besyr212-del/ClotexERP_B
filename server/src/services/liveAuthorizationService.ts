import type { Pool, PoolClient } from 'pg';
import type { JwtPayload } from '../middleware/auth.js';
import { isSessionRevoked } from './activeSessionsService.js';
export type LiveUserAuthorization = {
    id: string;
    company_id: string;
    username: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
    is_platform_admin: boolean;
    permissions: string[];
};
export class SecurityAccessError extends Error {
    constructor(message = 'لا تملك التفويض الحالي المطلوب', public statusCode = 403, public code = 'FORBIDDEN') {
        super(message);
    }
}
/** Same existing JWT/session format; the database is the authority for mutable claims. */
export async function readLiveUserAuthorization(db: Pool | PoolClient, userId: string, lock = false) {
    const result = await db.query<LiveUserAuthorization>(`SELECT u.id,u.company_id,u.username,u.full_name,u.role,u.is_active,u.is_platform_admin,
       ARRAY(SELECT p.code FROM roles r
         JOIN role_permissions rp ON rp.role_id=r.id JOIN permissions p ON p.id=rp.permission_id
         WHERE r.code=u.role ORDER BY p.code ${lock ? 'FOR SHARE OF r,rp' : ''}) AS permissions
     FROM users u WHERE u.id=$1 ${lock ? 'FOR SHARE OF u' : ''}`, [userId]);
    return result.rows[0] ?? null;
}
export function applyLiveClaims(claims: JwtPayload, current: LiveUserAuthorization): JwtPayload {
    return {
        ...claims,
        username: current.username,
        role: current.role,
        permissions: current.permissions,
        isPlatformAdmin: current.is_platform_admin === true,
    };
}
export async function requireLiveActor(db: Pool | PoolClient, claims: JwtPayload, options: {
    lock?: boolean;
    token?: string;
    platformOnly?: boolean;
    permission?: string;
} = {}) {
    const current = await readLiveUserAuthorization(db, claims.sub, options.lock);
    if (!current?.is_active)
        throw new SecurityAccessError('الحساب غير موجود أو غير فعّال', 401, 'UNAUTHORIZED');
    if (claims.companyId !== current.company_id && !current.is_platform_admin)
        throw new SecurityAccessError();
    if (options.token && isSessionRevoked(claims.sub, options.token)) {
        throw new SecurityAccessError('تم إنهاء الجلسة', 401, 'SESSION_REVOKED');
    }
    if (options.platformOnly && !current.is_platform_admin)
        throw new SecurityAccessError('هذه العملية خاصة بمدير المنصة');
    if (options.permission && !current.is_platform_admin && !current.permissions.includes(options.permission)) {
        throw new SecurityAccessError();
    }
    return current;
}
export function canManageUsers(user: JwtPayload | undefined) {
    return Boolean(user && (user.isPlatformAdmin || user.permissions.includes('users.manage')));
}
