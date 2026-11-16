import type { FastifyPluginAsync } from 'fastify';
import https from 'node:https';
import { z } from 'zod';
import { getPool } from '../db/pool.js';
import { authenticateRequest, requirePlatformAdmin } from '../middleware/auth.js';
import { sendError } from '../middleware/errorHandler.js';
import { ArabicErrors } from '../utils/arabicErrors.js';
import { purgeBusinessData } from '../services/purgeBusinessDataService.js';
import { listActiveSessions, revokeActiveSession, buildSessionKey } from '../services/activeSessionsService.js';
import { platformBackupRoutes } from './platformBackupRoutes.js';
import { saveManagedUser } from '../services/managedUserSecurityService.js';
import { canManageUsers, requireLiveActor, SecurityAccessError } from '../services/liveAuthorizationService.js';
import { verifyCurrentUserPassword } from '../utils/reauthGuard.js';
import { logPlatformAction } from '../services/platformAuditService.js';
const settingBody = z.object({
  key: z.string().min(1),
  value: z.record(z.unknown()).default({}),
});
const userBody = z.object({
  username: z.string().min(2),
  fullName: z.string().optional().default(''),
    password: z.string().min(6).max(1024).optional(),
    currentPassword: z.string().max(1024).optional(),
  role: z.string().min(1).default('viewer'),
  isActive: z.boolean().default(true),
  notes: z.string().optional().default(''),
  // يُقبَل فقط من مدير المنصة (isPlatformAdmin) — غير ذلك يُتجاهَل ويُستخدم
  // company_id المستخدم المُنشئ نفسه دائماً، كما كان الحال قبل هذا الحقل.
  companyId: z.string().uuid().optional(),
}).strict();
const roleBody = z.object({
  name: z.string().min(1),
  permissionCodes: z.array(z.string()).default([]),
});
const telegramTestBody = z.object({
  botToken: z.string().trim().optional().default(''),
  chatId: z.string().trim().optional().default(''),
});
const purgeBusinessDataBody = z.object({
  confirmPhrase: z.literal('مسح البيانات'),
  password: z.string().min(1),
});
function requirePermission(user: {
    role: string;
    permissions: string[];
} | undefined, code: string) {
    if (!user)
        return false;
  return user.role === 'admin' || user.permissions.includes(code);
}
function maskToken(token: unknown): string {
  const value = String(token || '').trim();
    if (!value)
        return '';
    if (value.length <= 12)
        return '********';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
function sanitizeSettings(key: string, value: unknown): unknown {
    if (key !== 'mail' || !value || typeof value !== 'object' || Array.isArray(value))
        return value;
  const mail = { ...(value as Record<string, unknown>) };
  const token = String(mail.telegramBotToken || '');
  delete mail.telegramBotToken;
  mail.telegramBotTokenMasked = maskToken(token);
  mail.telegramBotTokenConfigured = Boolean(token.trim());
  return mail;
}
async function getSavedTelegramToken(companyId: string): Promise<string> {
    const row = await getPool().query<{
        value: Record<string, unknown>;
    }>(`SELECT value FROM system_settings WHERE company_id=$1 AND key='mail'`, [companyId]);
  return String(row.rows[0]?.value?.telegramBotToken || '').trim();
}
function telegramRequest<T>(botToken: string, method: string, payload?: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : '';
        const req = https.request({
        method: body ? 'POST' : 'GET',
        hostname: 'api.telegram.org',
        path: `/bot${encodeURIComponent(botToken)}/${method}`,
        headers: body
          ? { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }
          : undefined,
            timeout: 15000,
        }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          try {
                    const json = JSON.parse(text) as T & {
                        ok?: boolean;
                        description?: string;
                    };
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(json.description || `Telegram HTTP ${res.statusCode}`));
              return;
            }
            resolve(json);
                }
                catch {
            reject(new Error(text || 'Telegram returned an invalid response'));
          }
        });
        });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Telegram request timeout')));
        if (body)
            req.write(body);
    req.end();
  });
}
export const systemRoutes: FastifyPluginAsync = async (app) => {
    await app.register(platformBackupRoutes);
  app.get('/info', async () => ({
    ok: true,
    name: 'fabric-warehouse-api',
    version: '0.1.0',
    phase: 1,
  }));
  app.get('/settings', { preHandler: authenticateRequest }, async (req, reply) => {
    const { companyId } = req.user!;
    if (!requirePermission(req.user, 'settings.view')) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
        const rows = await getPool().query(`SELECT key, value FROM system_settings WHERE company_id=$1 ORDER BY key ASC`, [companyId]);
    return reply.send({
      ok: true,
      data: Object.fromEntries(rows.rows.map((row) => [row.key, sanitizeSettings(row.key, row.value)])),
    });
  });
  app.put('/settings/:key', { preHandler: authenticateRequest }, async (req, reply) => {
    const { companyId } = req.user!;
    if (!requirePermission(req.user, 'settings.manage')) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
        const { key } = req.params as {
            key: string;
        };
    const parsed = settingBody.safeParse({ ...(req.body as object), key });
        if (!parsed.success)
            return sendError(reply, 400, ArabicErrors.validation, 'VALIDATION');
    let valueToSave = parsed.data.value;
    if (parsed.data.key === 'mail') {
            const current = await getPool().query<{
                value: Record<string, unknown>;
            }>(`SELECT value FROM system_settings WHERE company_id=$1 AND key='mail'`, [companyId]);
      const next = { ...(current.rows[0]?.value ?? {}), ...valueToSave };
      if (!String(next.telegramBotToken || '').trim() && current.rows[0]?.value?.telegramBotToken) {
        next.telegramBotToken = current.rows[0].value.telegramBotToken;
      }
      delete next.telegramBotTokenMasked;
      delete next.telegramBotTokenConfigured;
      valueToSave = next;
    }
        const row = await getPool().query(`INSERT INTO system_settings(company_id, key, value)
       VALUES($1,$2,$3::jsonb)
       ON CONFLICT (company_id, key) DO UPDATE SET value=EXCLUDED.value
       RETURNING key, value`, [companyId, parsed.data.key, JSON.stringify(valueToSave)]);
    return reply.send({ ok: true, data: { key: row.rows[0].key, value: sanitizeSettings(row.rows[0].key, row.rows[0].value) } });
  });
  app.post('/telegram/test', { preHandler: authenticateRequest }, async (req, reply) => {
    const { companyId } = req.user!;
    if (!requirePermission(req.user, 'settings.manage')) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
    const parsed = telegramTestBody.safeParse(req.body);
        if (!parsed.success)
            return sendError(reply, 400, ArabicErrors.validation, 'VALIDATION');
    const token = parsed.data.botToken || await getSavedTelegramToken(companyId);
        if (!token)
            return sendError(reply, 400, 'توكن بوت تيليغرام غير محفوظ', 'TELEGRAM_TOKEN_MISSING');
    try {
            const me = await telegramRequest<{
                ok: boolean;
                result: {
                    id: number;
                    username?: string;
                    first_name?: string;
                };
            }>(token, 'getMe');
      if (parsed.data.chatId) {
        await telegramRequest(token, 'sendMessage', {
          chat_id: parsed.data.chatId,
          text: 'رسالة اختبار من نظام CLOTEX. تم ربط تيليغرام بنجاح.',
        });
      }
      return reply.send({ ok: true, data: me.result });
        }
        catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return sendError(reply, 502, `فشل اختبار تيليغرام: ${message}`, 'TELEGRAM_FAILED');
    }
  });
  app.get('/telegram/updates', { preHandler: authenticateRequest }, async (req, reply) => {
    const { companyId } = req.user!;
    if (!requirePermission(req.user, 'settings.manage')) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
    const token = await getSavedTelegramToken(companyId);
        if (!token)
            return sendError(reply, 400, 'احفظ توكن بوت تيليغرام أولا', 'TELEGRAM_TOKEN_MISSING');
    try {
      const data = await telegramRequest<{
        ok: boolean;
        result: Array<{
          update_id: number;
          message?: {
            date?: number;
            text?: string;
                        chat?: {
                            id: number;
                            type: string;
                            first_name?: string;
                            last_name?: string;
                            username?: string;
                            title?: string;
                        };
                        from?: {
                            first_name?: string;
                            last_name?: string;
                            username?: string;
                        };
          };
        }>;
      }>(token, 'getUpdates');
      const byChat = new Map<string, {
        chatId: string;
        chatType: string;
        name: string;
        username: string;
        lastMessage: string;
        lastUpdateId: number;
        lastMessageAt: string;
      }>();
      for (const item of data.result) {
        const chat = item.message?.chat;
                if (!chat)
                    continue;
        const chatId = String(chat.id);
        const name = [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.title || item.message?.from?.first_name || chatId;
        byChat.set(chatId, {
          chatId,
          chatType: chat.type,
          name,
          username: chat.username || item.message?.from?.username || '',
          lastMessage: item.message?.text || '',
          lastUpdateId: item.update_id,
          lastMessageAt: item.message?.date ? new Date(item.message.date * 1000).toISOString() : '',
        });
      }
      return reply.send({
        ok: true,
        data: Array.from(byChat.values()).sort((a, b) => b.lastUpdateId - a.lastUpdateId).slice(0, 50),
      });
        }
        catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return sendError(reply, 502, `فشل جلب محادثات تيليغرام: ${message}`, 'TELEGRAM_FAILED');
    }
  });
  app.get('/permissions', { preHandler: authenticateRequest }, async (req, reply) => {
        if (!canManageUsers(req.user)) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
    const pool = getPool();
    const [roles, permissions, rolePermissions] = await Promise.all([
      pool.query(`SELECT id, code, name FROM roles ORDER BY code ASC`),
      pool.query(`SELECT id, code, name, category FROM permissions ORDER BY category ASC, code ASC`),
            pool.query(`SELECT r.code AS role_code, p.code AS permission_code
         FROM role_permissions rp
         JOIN roles r ON r.id=rp.role_id
         JOIN permissions p ON p.id=rp.permission_id
         ORDER BY r.code, p.code`),
    ]);
    return reply.send({
      ok: true,
      roles: roles.rows,
      permissions: permissions.rows,
      rolePermissions: rolePermissions.rows,
    });
  });
  app.put('/roles/:code', { preHandler: authenticateRequest }, async (req, reply) => {
    // الأدوار/الصلاحيات (roles/permissions/role_permissions) عالمية بلا
    // company_id — تعديلها يؤثر على كل الحسابات دفعة واحدة، فيُسمح لمدير
    // المنصة فقط، وليس أي "أدمن" شركة عادية.
    if (!requirePlatformAdmin(req.user)) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
        const { code } = req.params as {
            code: string;
        };
    const parsed = roleBody.safeParse(req.body);
        if (!parsed.success)
            return sendError(reply, 400, ArabicErrors.validation, 'VALIDATION');
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
            await client.query('SELECT pg_advisory_xact_lock(5005, 1)');
            await requireLiveActor(client, req.user!, { lock: true, token: req.authToken, platformOnly: true });
            const roleRow = await client.query(`INSERT INTO roles(code, name) VALUES($1,$2)
         ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name
         RETURNING id, code, name`, [code, parsed.data.name]);
      await client.query('DELETE FROM role_permissions WHERE role_id=$1', [roleRow.rows[0].id]);
      for (const permissionCode of parsed.data.permissionCodes) {
                await client.query(`INSERT INTO role_permissions(role_id, permission_id)
           SELECT $1, id FROM permissions WHERE code=$2
           ON CONFLICT DO NOTHING`, [roleRow.rows[0].id, permissionCode]);
      }
            await logPlatformAction(client, {
                actorUserId: req.user!.sub, action: 'UPDATE_ROLE_PERMISSIONS',
                fromCompanyId: req.user!.companyId,
                details: { roleCode: code, permissionCodes: parsed.data.permissionCodes },
            });
      await client.query('COMMIT');
      return reply.send({ ok: true, data: roleRow.rows[0] });
        }
        catch (error) {
      await client.query('ROLLBACK');
      throw error;
        }
        finally {
      client.release();
    }
  });
  app.get('/users', { preHandler: authenticateRequest }, async (req, reply) => {
    const { companyId } = req.user!;
        if (!canManageUsers(req.user)) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
        const q = req.query as {
            companyId?: string;
        };
    // لمدير المنصة فقط: عرض مستخدمي حساب آخر (فرع) دون تبديل الجلسة النشطة فعلياً.
    const targetCompanyId = requirePlatformAdmin(req.user) && q.companyId ? q.companyId : companyId;
        const rows = await getPool().query(`SELECT id, username, full_name, role, is_active, notes, created_at, updated_at
       FROM users WHERE company_id=$1 ORDER BY created_at DESC`, [targetCompanyId]);
    return reply.send({ ok: true, data: rows.rows });
  });
    const userWriteError = (reply: import('fastify').FastifyReply, error: unknown) => {
        if (error instanceof SecurityAccessError)
            return sendError(reply, error.statusCode, error.message, error.code);
        const code = (error as {
            code?: string;
        }).code;
        if (code === 'PASSWORD_INVALID')
            return sendError(reply, 403, 'يلزم تقديم كلمة المرور الحالية الصحيحة لهذا التعديل', 'PASSWORD_INVALID');
        if (code === 'REAUTH_RATE_LIMITED')
            return sendError(reply, 429, 'محاولات كثيرة؛ حاول لاحقاً', 'REAUTH_RATE_LIMITED');
        if (code === '23505')
            return sendError(reply, 409, 'اسم المستخدم مستخدم مسبقاً', 'DUPLICATE');
        if (code === '23503')
            return sendError(reply, 400, 'الشركة أو الدور غير صالح', 'VALIDATION');
        if (code === '40P01' || code === '40001')
            return sendError(reply, 409, 'تعارض تعديل متزامن؛ حدّث البيانات وحاول مجدداً', 'CONFLICT');
        throw error;
    };
  app.post('/users', { preHandler: authenticateRequest }, async (req, reply) => {
        if (!canManageUsers(req.user))
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    const parsed = userBody.required({ password: true }).safeParse(req.body);
        if (!parsed.success)
            return sendError(reply, 400, ArabicErrors.validation, 'VALIDATION');
    try {
            return reply.status(201).send({ ok: true, data: await saveManagedUser(req.user!, parsed.data, undefined, req.authToken) });
      }
        catch (error) {
            return userWriteError(reply, error);
    }
  });
  app.put('/users/:id', { preHandler: authenticateRequest }, async (req, reply) => {
        if (!canManageUsers(req.user))
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
        const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    const parsed = userBody.safeParse(req.body);
        if (!params.success || !parsed.success)
            return sendError(reply, 400, ArabicErrors.validation, 'VALIDATION');
        try {
            return reply.send({ ok: true, data: await saveManagedUser(req.user!, parsed.data, params.data.id, req.authToken) });
        }
        catch (error) {
            return userWriteError(reply, error);
        }
  });
  app.get('/active-sessions', { preHandler: authenticateRequest }, async (req, reply) => {
        if (!req.user!.permissions.includes('settings.manage') && !req.user!.isPlatformAdmin) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
    const data = listActiveSessions(req.user!.companyId);
        const currentSessionKey = req.user && req.authToken ? buildSessionKey(req.user.sub, req.authToken) : null;
    return reply.send({ ok: true, data, currentSessionKey });
  });
  app.delete('/active-sessions/:sessionKey', { preHandler: authenticateRequest }, async (req, reply) => {
        if (!req.user!.permissions.includes('settings.manage') && !req.user!.isPlatformAdmin) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
        const sessionKeyValue = String((req.params as {
            sessionKey?: string;
        }).sessionKey || '').trim();
    if (!sessionKeyValue) {
      return sendError(reply, 400, ArabicErrors.validation, 'VALIDATION');
    }
    const ok = revokeActiveSession(sessionKeyValue, req.user!.companyId);
    if (!ok) {
      return sendError(reply, 404, 'الجلسة غير موجودة أو انتهت', 'NOT_FOUND');
    }
    return reply.send({ ok: true });
  });
  app.post('/purge-business-data', { preHandler: authenticateRequest }, async (req, reply) => {
    const user = req.user!;
        if (user.role !== 'admin' || !user.permissions.includes('settings.manage')) {
      return sendError(reply, 403, ArabicErrors.forbidden, 'FORBIDDEN');
    }
    const parsed = purgeBusinessDataBody.safeParse(req.body);
    if (!parsed.success) {
      return sendError(reply, 400, 'يجب كتابة «مسح البيانات» وتأكيد كلمة المرور', 'VALIDATION');
    }
        const client = await getPool().connect();
        try {
            const current = await requireLiveActor(client, user, { token: req.authToken });
            if (current.role !== 'admin' || !current.permissions.includes('settings.manage') || current.company_id !== user.companyId)
                throw new SecurityAccessError();
            await verifyCurrentUserPassword(client, user.sub, parsed.data.password);
    }
        catch (error) {
            return userWriteError(reply, error);
        }
        finally {
            client.release();
    }
    try {
      const summary = await purgeBusinessData(user.companyId, user.sub);
      return reply.send({ ok: true, data: summary });
        }
        catch (error) {
      req.log.error({ err: error }, 'purge-business-data failed');
      return sendError(reply, 500, 'تعذر مسح بيانات الأعمال. حاول بعد أخذ نسخة احتياطية.', 'PURGE_FAILED');
    }
  });
};
