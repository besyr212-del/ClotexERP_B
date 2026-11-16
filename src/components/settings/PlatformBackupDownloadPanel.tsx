import React, { useEffect, useRef, useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { backupErrorMessage, BackupDownloadError, downloadDatabaseBackupToDevice, fetchPlatformBackupUser } from '../../lib/api/platformBackupApi';

export function PlatformBackupDownloadPanel() {
  const { t } = useTranslation('settings');
  const [authorized, setAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const inFlight = useRef(false);
  const alive = useRef(true);
  const identity = useRef<string | null>(null);

  const clearPassword = () => { if (passwordInput.current) passwordInput.current.value = ''; };

  useEffect(() => {
    alive.current = true;
    let check = 0;
    const refresh = async () => {
      const request = ++check;
      try {
        const user = await fetchPlatformBackupUser();
        if (!alive.current || request !== check) return;
        const next = `${user.id}:${user.companyId}`;
        if (identity.current && identity.current !== next) {
          controller.current?.abort(); clearPassword(); setConfirming(false);
        }
        identity.current = next;
        setAuthorized(user.isPlatformAdmin === true);
        if (!user.isPlatformAdmin) {
          controller.current?.abort(); clearPassword(); setConfirming(false);
        }
      } catch (error) {
        if (alive.current && request === check) {
          setAuthorized(false); clearPassword(); setConfirming(false);
          controller.current?.abort();
          setMessage({ error: true, text: backupErrorMessage(error) });
        }
      } finally {
        if (alive.current && request === check) setVerifying(false);
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => {
      alive.current = false; ++check;
      window.removeEventListener('focus', refresh);
      controller.current?.abort(); clearPassword(); identity.current = null;
    };
  }, []);

  async function begin() {
    if (inFlight.current) return;
    inFlight.current = true; setVerifying(true); setMessage(null);
    try {
      const user = await fetchPlatformBackupUser();
      if (!alive.current) return;
      if (!user.isPlatformAdmin) { setAuthorized(false); throw new BackupDownloadError('FORBIDDEN', 403); }
      identity.current = `${user.id}:${user.companyId}`;
      clearPassword(); setConfirming(true);
    } catch (error) {
      if (alive.current) {
        setAuthorized(false); setConfirming(false);
        setMessage({ error: true, text: backupErrorMessage(error) });
      }
    } finally {
      inFlight.current = false;
      if (alive.current) setVerifying(false);
    }
  }

  function close() {
    controller.current?.abort(); clearPassword(); setConfirming(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !confirming || !authorized) return;
    const password = passwordInput.current?.value ?? '';
    clearPassword(); // Never store a reauthentication password in React state/storage.
    if (!password) { setMessage({ error: true, text: new BackupDownloadError('VALIDATION', 400).message }); return; }
    inFlight.current = true; setBusy(true); setMessage(null);
    controller.current = new AbortController();
    let authorizationVerified = false;
    try {
      const user = await fetchPlatformBackupUser(controller.current.signal);
      if (!alive.current || controller.current.signal.aborted) return;
      if (!user.isPlatformAdmin) { setAuthorized(false); throw new BackupDownloadError('FORBIDDEN', 403); }
      if (identity.current !== `${user.id}:${user.companyId}`) {
        setConfirming(false); throw new BackupDownloadError('UNAUTHORIZED', 401);
      }
      authorizationVerified = true;
      const result = await downloadDatabaseBackupToDevice(password, controller.current.signal);
      if (alive.current) {
        setConfirming(false);
        setMessage({ error: false, text: t('backup.secure.started', {
          fileName: result.fileName, sizeMb: (result.sizeBytes / (1024 * 1024)).toFixed(2),
        }) });
      }
    } catch (error) {
      if (alive.current && !(error instanceof BackupDownloadError && error.code === 'CANCELLED')) {
        setMessage({ error: true, text: backupErrorMessage(error) });
        if (!authorizationVerified || (error instanceof BackupDownloadError && ['FORBIDDEN', 'UNAUTHORIZED'].includes(error.code))) {
          setAuthorized(false); setConfirming(false);
        }
      }
    } finally {
      clearPassword(); controller.current = null; inFlight.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return <section className="bg-[var(--surface-header)] border border-[var(--border-default)] rounded-xl shadow-sm p-6 space-y-4">
    <h3 className="text-xl font-bold text-[var(--text-heading)]">{t('backup.secure.title')}</h3>
    {verifying && <p role="status">{t('backup.secure.checking')}</p>}
    {message && <p role={message.error ? 'alert' : 'status'} className={message.error ? 'text-red-700' : 'text-emerald-700'}>{message.text}</p>}
    {!verifying && !authorized && <p>{t('backup.secure.platformOnly')}</p>}
    {authorized && <>
      <p className="text-sm text-[var(--text-muted)]">{t('backup.secure.description')}</p>
      <button type="button" disabled={verifying || busy || confirming} onClick={() => void begin()}
        className="inline-flex items-center gap-2 bg-[var(--ui-accent)] text-white px-5 py-2.5 rounded-lg disabled:opacity-50">
        <Download className="w-4 h-4" />{t('backup.secure.open')}
      </button>
    </>}
    {authorized && confirming && <form onSubmit={event => void submit(event)} className="border border-amber-300 rounded-lg p-4 space-y-3">
      <p className="text-amber-800">{t('backup.secure.confirmFullDatabase')}</p>
      <label className="block" htmlFor="platform-backup-current-password">{t('backup.secure.password')}</label>
      <input ref={passwordInput} id="platform-backup-current-password" name="current-password" type="password"
        autoComplete="current-password" required maxLength={1024} disabled={busy} autoFocus
        className="w-full p-2.5 border border-[var(--border-default)] bg-[var(--surface-header)] rounded-lg" />
      <div className="flex gap-3">
        <button type="submit" disabled={busy || verifying} className="bg-[var(--ui-accent)] text-white px-4 py-2 rounded-lg disabled:opacity-50">
          {busy && <Loader2 className="inline w-4 h-4 animate-spin" />} {t(busy ? 'backup.secure.downloading' : 'backup.secure.confirm')}
        </button>
        <button type="button" onClick={close} className="px-4 py-2 border rounded-lg"><X className="inline w-4 h-4" /> {t('backup.secure.cancel')}</button>
      </div>
    </form>}
  </section>;
}
