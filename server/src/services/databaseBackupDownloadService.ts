/**
 * Create a PostgreSQL custom-format dump for download to the client device.
 * Does not log DATABASE_URL or credentials.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const PG_DUMP_CANDIDATES = [
  process.env.PG_DUMP_PATH,
  'pg_dump',
  '/usr/bin/pg_dump',
  '/usr/lib/postgresql/16/bin/pg_dump',
  '/usr/lib/postgresql/15/bin/pg_dump',
  'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
  'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
].filter(Boolean) as string[];
function resolveDatabaseUrl(): string {
  const url = String(process.env.DATABASE_URL || '').trim();
  if (!url) {
    throw Object.assign(new Error('DATABASE_URL غير مضبوط على الخادم'), { statusCode: 500 });
  }
  return url;
}
function resolvePgDump(): string {
  for (const candidate of PG_DUMP_CANDIDATES) {
    try {
            if (candidate === 'pg_dump')
                return candidate;
            if (fs.existsSync(candidate))
                return candidate;
        }
        catch {
      /* ignore */
    }
  }
  return 'pg_dump';
}
export type DatabaseBackupFile = {
  filePath: string;
  fileName: string;
  sizeBytes: number;
};
export async function createDatabaseBackupFile(): Promise<DatabaseBackupFile> {
  const databaseUrl = resolveDatabaseUrl();
  const pgDump = resolvePgDump();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `clotex-backup-${stamp}-${randomUUID()}.dump`;
  const filePath = path.join(os.tmpdir(), fileName);
    try {
        // Preserve URI options while keeping passwords out of process arguments.
        const connection = new URL(databaseUrl);
        const password = connection.searchParams.get('password') ?? decodeURIComponent(connection.password);
        const hasPassword = Boolean(connection.password) || connection.searchParams.has('password');
        connection.password = '';
        connection.searchParams.delete('password');
        const childEnv = { ...process.env, ...(hasPassword ? { PGPASSWORD: password } : {}) };
        // Unique request-owned file; pg_dump truncates it while preserving owner-only mode on POSIX.
        fs.closeSync(fs.openSync(filePath, 'wx', 0o600));
  await new Promise<void>((resolve, reject) => {
            const child = spawn(pgDump, ['-Fc', '--no-owner', '--no-privileges', '-f', filePath, connection.toString()], {
                env: childEnv,
        stdio: ['ignore', 'ignore', 'pipe'],
        windowsHide: true,
    });
            // Drain stderr, but do not retain or expose libpq diagnostics containing credentials.
            child.stderr?.on('data', () => undefined);
            child.on('error', () => {
                reject(Object.assign(new Error('تعذر تشغيل أداة النسخ الاحتياطي'), { statusCode: 500 }));
    });
    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(filePath)) {
        resolve();
        return;
      }
                reject(Object.assign(new Error('فشل إنشاء النسخة الاحتياطية'), { statusCode: 500 }));
    });
  });
  const stat = fs.statSync(filePath);
  if (!stat.size) {
    try {
      fs.unlinkSync(filePath);
            }
            catch {
      /* ignore */
    }
    throw Object.assign(new Error('ملف النسخة الاحتياطية فارغ'), { statusCode: 500 });
  }
  return { filePath, fileName, sizeBytes: stat.size };
}
    catch {
        safeUnlink(filePath);
        throw Object.assign(new Error('تعذر إنشاء النسخة الاحتياطية بأمان'), { statusCode: 500, code: 'BACKUP_CREATION_FAILED' });
    }
}
export function safeUnlink(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
    }
    catch {
    /* ignore */
  }
}
