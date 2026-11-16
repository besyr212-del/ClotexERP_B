import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createReadStream } from 'node:fs';
import { getPool } from '../db/pool.js';
import { authenticateRequest } from '../middleware/auth.js';
import { sendError } from '../middleware/errorHandler.js';
import { requireLiveActor, SecurityAccessError } from '../services/liveAuthorizationService.js';
import { logPlatformAction, type PlatformAuditAction } from '../services/platformAuditService.js';
import { createDatabaseBackupFile, safeUnlink } from '../services/databaseBackupDownloadService.js';
import { verifyCurrentUserPassword } from '../utils/reauthGuard.js';
const backupBody = z.object({
    password: z.string().min(1).max(1024),
    confirmPhrase: z.literal('FULL_PLATFORM_BACKUP'),
}).strict();
export const platformBackupRoutes: FastifyPluginAsync = async (app) => {
    const audit = (req: FastifyRequest, action: PlatformAuditAction, details: Record<string, unknown> = {}) => logPlatformAction(getPool(), {
        actorUserId: req.user!.sub, action, fromCompanyId: req.user!.companyId,
        // req.ip is controlled by the application's trustProxy policy; do not trust an arbitrary header.
        ip: req.ip, userAgent: String(req.headers['user-agent'] ?? '').slice(0, 500),
        details: { requestId: req.id, ...details },
    });
    const reauthorize = async (req: FastifyRequest, password: string, action: PlatformAuditAction) => {
        const client = await getPool().connect();
        try {
            await client.query('BEGIN');
            await requireLiveActor(client, req.user!, { lock: true, token: req.authToken, platformOnly: true });
            await verifyCurrentUserPassword(client, req.user!.sub, password);
            await logPlatformAction(client, {
                actorUserId: req.user!.sub, action, fromCompanyId: req.user!.companyId,
                ip: req.ip, userAgent: String(req.headers['user-agent'] ?? '').slice(0, 500),
                details: { requestId: req.id, scope: 'FULL_DATABASE' },
            });
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    };
    // No password in query strings, no credential-free GET, no company-admin bypass.
    app.get('/backup/download', { preHandler: authenticateRequest }, async (req, reply) => {
        reply.header('Cache-Control', 'no-store');
        try {
            await audit(req, 'FULL_BACKUP_DENIED', { reason: 'LEGACY_GET_DISABLED' });
        }
        catch {
            req.log.error({ event: 'platform_backup_audit_failed', requestId: req.id });
            return sendError(reply, 500, 'تعذر تسجيل طلب التنزيل بأمان', 'BACKUP_FAILED');
        }
        if (!req.user!.isPlatformAdmin)
            return sendError(reply, 403, 'النسخة الكاملة خاصة بمدير المنصة', 'FORBIDDEN');
        reply.header('Allow', 'POST');
        return sendError(reply, 405, 'يلزم طلب POST وإعادة المصادقة لتنزيل نسخة المنصة الكاملة', 'REAUTH_REQUIRED');
    });
    app.post('/backup/download', { preHandler: authenticateRequest }, async (req, reply) => {
        reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache').header('X-Content-Type-Options', 'nosniff')
            .header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Encoding');
        let backup: Awaited<ReturnType<typeof createDatabaseBackupFile>> | null = null;
        let authorized = false;
        try {
            // Durable attempt record is mandatory; audit failure prevents dump creation.
            await audit(req, 'FULL_BACKUP_ATTEMPT');
            await requireLiveActor(getPool(), req.user!, { token: req.authToken, platformOnly: true });
            const parsed = backupBody.safeParse(req.body);
            if (!parsed.success) {
                await audit(req, 'FULL_BACKUP_DENIED', { reason: 'REAUTH_INPUT_REQUIRED' });
                return sendError(reply, 400, 'يلزم تأكيد FULL_PLATFORM_BACKUP وكلمة المرور الحالية في جسم الطلب', 'VALIDATION');
            }
            await reauthorize(req, parsed.data.password, 'FULL_BACKUP_AUTHORIZED');
            authorized = true;
            backup = await createDatabaseBackupFile();
            // A platform grant/account/password/session may change while pg_dump is running.
            // No response bytes are released until this second live check and audit commit.
            await reauthorize(req, parsed.data.password, 'FULL_BACKUP_READY');
            if (req.raw.aborted || reply.raw.destroyed)
                throw new SecurityAccessError('أُغلق طلب التنزيل', 409, 'REQUEST_ABORTED');
            const filePath = backup.filePath;
            const stream = createReadStream(filePath);
            const cleanup = () => safeUnlink(filePath);
            stream.once('close', cleanup);
            stream.once('error', cleanup);
            reply.raw.once('close', () => { stream.destroy(); cleanup(); });
            return reply
                .header('Content-Type', 'application/octet-stream')
                .header('Content-Disposition', `attachment; filename="${backup.fileName}"`)
                .header('Content-Length', String(backup.sizeBytes))
                .send(stream);
        }
        catch (error) {
            if (backup)
                safeUnlink(backup.filePath);
            const e = error as {
                code?: string;
            };
            const code = e.code ?? 'INTERNAL';
            try {
                await audit(req, authorized ? 'FULL_BACKUP_FAILED' : 'FULL_BACKUP_DENIED', { reason: code });
            }
            catch {
                req.log.error({ event: 'platform_backup_audit_failed', requestId: req.id });
            }
            // Never return/log pg_dump stderr, paths, connection strings, SQL or request passwords.
            if (error instanceof SecurityAccessError)
                return sendError(reply, error.statusCode, error.message, error.code);
            if (code === 'PASSWORD_INVALID')
                return sendError(reply, 403, 'كلمة المرور الحالية غير صحيحة', code);
            if (code === 'REAUTH_RATE_LIMITED')
                return sendError(reply, 429, 'محاولات إعادة مصادقة كثيرة؛ حاول لاحقاً', code);
            req.log.error({ event: 'platform_backup_failed', requestId: req.id });
            return sendError(reply, 500, 'تعذر إتمام تنزيل النسخة الكاملة بأمان', 'BACKUP_FAILED');
        }
    });
};
