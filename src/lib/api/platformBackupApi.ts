import { getApiBaseUrl, getStoredToken } from './client';
import { detectClientPlatform } from '../clientPlatform';
import i18n from '../../i18n/config';

export type BackupErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'PASSWORD_INVALID' | 'REAUTH_RATE_LIMITED'
  | 'VALIDATION' | 'BACKUP_FAILED' | 'NETWORK' | 'CANCELLED' | 'INVALID_RESPONSE';

export class BackupDownloadError extends Error {
  constructor(public code: BackupErrorCode, public status = 0) {
    // Only fixed translated messages: never retain a response body or raw network diagnostic.
    super(i18n.t(`backup.secure.error.${code}`, { ns: 'settings' }));
  }
}

export function backupErrorMessage(error: unknown): string {
  if (error instanceof BackupDownloadError) return error.message;
  const status = (error as { statusCode?: number; status?: number } | null)?.statusCode
    ?? (error as { status?: number } | null)?.status;
  return new BackupDownloadError(status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'NETWORK').message;
}

/** Uses the existing /auth/me contract and token storage, including same-origin base ''.
 * Kept local to this download flow; shared JSON settings APIs are not changed. */
export async function fetchPlatformBackupUser(signal?: AbortSignal): Promise<{ id: string; companyId: string; isPlatformAdmin: boolean }> {
  const token = getStoredToken();
  if (!token) throw new BackupDownloadError('UNAUTHORIZED', 401);
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Client-Platform': detectClientPlatform() },
      credentials: 'same-origin', cache: 'no-store', redirect: 'error',
      signal,
    });
  } catch (error) {
    throw new BackupDownloadError(signal?.aborted || (error as { name?: string }).name === 'AbortError' ? 'CANCELLED' : 'NETWORK');
  }
  if (!response.ok) throw new BackupDownloadError(response.status === 401 ? 'UNAUTHORIZED' : response.status === 403 ? 'FORBIDDEN' : 'NETWORK', response.status);
  try {
    const data = await response.json();
    if (typeof data?.user?.id !== 'string' || typeof data?.user?.companyId !== 'string' || typeof data?.user?.isPlatformAdmin !== 'boolean') {
      throw new Error('invalid profile');
    }
    return { id: data.user.id, companyId: data.user.companyId, isPlatformAdmin: data.user.isPlatformAdmin };
  } catch { throw new BackupDownloadError('INVALID_RESPONSE'); }
}

export function backupFileName(disposition: string | null): string {
  const fallback = () => `clotex-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.dump`;
  if (!disposition) return fallback();
  const extended = /(?:^|;)\s*filename\*\s*=\s*UTF-8'[^']*'([^;]+)/i.exec(disposition);
  const plain = /(?:^|;)\s*filename\s*=\s*(?:"((?:\\.|[^"\\])*)"|([^;]+))/i.exec(disposition);
  let name = plain?.[1]?.replace(/\\(.)/g, '$1') ?? plain?.[2] ?? '';
  if (extended) {
    try { name = decodeURIComponent(extended[1].trim()); }
    catch { /* A valid plain name or a generated fallback remains available. */ }
  }
  name = name.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069<>:"/\\|?*]/g, '_').trim().replace(/^[. ]+/, '');
  return name.length > 0 && name.length <= 200 && /\.dump$/i.test(name) ? name : fallback();
}

/** Raw authenticated response is necessary here: apiFetch consumes JSON, not binary files. */
export async function downloadDatabaseBackupToDevice(
  password: string,
  signal?: AbortSignal,
): Promise<{ fileName: string; sizeBytes: number }> {
  const token = getStoredToken();
  if (!token) throw new BackupDownloadError('UNAUTHORIZED', 401);
  if (!password || password.length > 1024) throw new BackupDownloadError('VALIDATION', 400);
  if (signal?.aborted) throw new BackupDownloadError('CANCELLED');
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/system/backup/download`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-Platform': detectClientPlatform(),
      },
      body: JSON.stringify({ password, confirmPhrase: 'FULL_PLATFORM_BACKUP' }),
      cache: 'no-store',
      credentials: 'same-origin',
      // Never forward a reauthentication password through a 307/308 redirect.
      redirect: 'error',
      signal,
    });
  } catch (error) {
    throw new BackupDownloadError(signal?.aborted || (error as { name?: string }).name === 'AbortError' ? 'CANCELLED' : 'NETWORK');
  }
  if (!response.ok) {
    let code = '';
    try {
      if ((response.headers.get('Content-Type') ?? '').includes('application/json')) {
        const body: unknown = await response.json();
        if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') code = body.code;
      }
    } catch { /* Do not display arbitrary proxy/server text. */ }
    const mapped: BackupErrorCode = response.status === 401 ? 'UNAUTHORIZED'
      : response.status === 403 ? code === 'PASSWORD_INVALID' ? 'PASSWORD_INVALID' : 'FORBIDDEN'
      : response.status === 429 ? 'REAUTH_RATE_LIMITED'
      : response.status === 400 ? 'VALIDATION' : 'BACKUP_FAILED';
    throw new BackupDownloadError(mapped, response.status);
  }
  const mime = (response.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
  if (response.status !== 200 || mime !== 'application/octet-stream') throw new BackupDownloadError('INVALID_RESPONSE', response.status);
  let blob: Blob;
  try { blob = await response.blob(); }
  catch (error) {
    throw new BackupDownloadError(signal?.aborted || (error as { name?: string }).name === 'AbortError' ? 'CANCELLED' : 'NETWORK');
  }
  if (signal?.aborted) throw new BackupDownloadError('CANCELLED');
  const length = response.headers.get('Content-Length');
  const encoding = response.headers.get('Content-Encoding');
  if (!blob.size || ((!encoding || encoding === 'identity') && length !== null && (!/^\d+$/.test(length) || Number(length) !== blob.size))) {
    throw new BackupDownloadError('INVALID_RESPONSE');
  }
  const fileName = backupFileName(response.headers.get('Content-Disposition'));
  let objectUrl: string;
  try { objectUrl = URL.createObjectURL(blob); }
  catch { throw new BackupDownloadError('BACKUP_FAILED'); }
  let anchor: HTMLAnchorElement | null = null;
  try {
    anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
  } catch {
    throw new BackupDownloadError('BACKUP_FAILED');
  } finally {
    anchor?.remove();
    // Preserve the existing mobile/browser download mechanism and release the Blob URL.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
  }
  // Browser download was initiated; this is not a claim that the file reached disk.
  return { fileName, sizeBytes: blob.size };
}
