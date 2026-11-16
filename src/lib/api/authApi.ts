import { apiFetch, setStoredToken, getStoredToken, getAuthSessionRevision, withAuthSessionLock, ApiRequestError } from './client';

export type AuthUser = {
  id: string;
  username: string;
  fullName: string | null;
  /** الحساب النشط حالياً (قد يختلف عن homeCompanyId بعد تبديل حساب). */
  companyId: string;
  companyCode: string;
  companyName: string;
  /** لغة الواجهة الافتراضية للفرع الحالي (سوريا=ar، تركيا=tr) — تُطبَّق تلقائياً ما لم يبدّل المستخدم يدوياً. */
  companyDefaultLanguage: 'ar' | 'tr';
  /** حساب المستخدم الأصلي في قاعدة البيانات — لا يتغيّر بتبديل الحساب. */
  homeCompanyId: string;
  role: string;
  permissions: string[];
  /** مدير منصة clotex نفسه — منفصل عن "أدمن" أي شركة عميل. */
  isPlatformAdmin: boolean;
};

export type LoginResponse = {
  ok: true;
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  ok: true;
  user: AuthUser;
};

export type PublicCompanyOption = { id: string; code: string; name: string };

/** بلا مصادقة — قائمة الفروع (سوريا/تركيا) لعرضها بشاشة تسجيل الدخول قبل إدخال بيانات الاعتماد. */
export async function listPublicCompanies(): Promise<PublicCompanyOption[]> {
  const data = await apiFetch<{ ok: boolean; data: PublicCompanyOption[] }>('/api/companies/public', {
    skipAuth: true,
  });
  return data.data;
}

export async function loginApi(username: string, password: string, companyId?: string): Promise<LoginResponse> {
  const revision = await withAuthSessionLock(() => {
    if (!setStoredToken(null)) throw new ApiRequestError('تعذر مسح الجلسة السابقة بأمان.', 409, { code: 'SESSION_STORAGE' });
    return getAuthSessionRevision();
  });
  const data = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, companyId }),
    skipAuth: true,
  });
  await withAuthSessionLock(() => {
    if (revision !== getAuthSessionRevision() || getStoredToken() !== null) throw new ApiRequestError('تغيرت جلسة تسجيل الدخول.', 409, { code: 'SESSION_CHANGED' });
    if (!data.token || !setStoredToken(data.token)) throw new ApiRequestError('تعذر حفظ الجلسة بأمان.', 409, { code: 'SESSION_STORAGE' });
  });
  return data;
}

export async function logoutApi(): Promise<void> {
  const intent = await withAuthSessionLock(() => {
    const token = getStoredToken();
    if (!setStoredToken(null)) throw new ApiRequestError('تعذر إنهاء الجلسة محلياً بأمان.', 409, { code: 'SESSION_STORAGE' });
    return { token, revision: getAuthSessionRevision() };
  });
  // Revoke exactly the departing session, never whichever account signs in while waiting.
  await apiFetch<{ ok: boolean }>('/api/auth/logout', {
    method: 'POST', skipAuth: true,
    headers: intent.token ? { Authorization: `Bearer ${intent.token}` } : {},
  });
  if (intent.revision !== getAuthSessionRevision() || getStoredToken() !== null) throw new ApiRequestError('تغيرت جلسة المستخدم.', 409, { code: 'SESSION_CHANGED' });
}

export async function fetchMe(): Promise<AuthUser> {
  const data = await apiFetch<MeResponse>('/api/auth/me');
  return data.user;
}

/** لمدير المنصة فقط: يُصدر توكناً جديداً لمشاهدة/العمل ضمن حساب آخر. */
export async function switchCompanyApi(companyId: string): Promise<AuthUser> {
  const revision = getAuthSessionRevision();
  const data = await apiFetch<LoginResponse>('/api/auth/switch-company', {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
  await withAuthSessionLock(() => {
    if (revision !== getAuthSessionRevision()) throw new ApiRequestError('تغيرت جلسة المستخدم.', 409, { code: 'SESSION_CHANGED' });
    if (!data.token || !setStoredToken(data.token)) throw new ApiRequestError('تعذر حفظ الجلسة بأمان.', 409, { code: 'SESSION_STORAGE' });
  });
  return data.user;
}

/** يُبقي الجلسة ظاهرة في «الأجهزة النشطة» أثناء بقاء المستخدم داخل النظام */
export async function pingSessionPresence(): Promise<void> {
  await apiFetch<{ ok: boolean }>('/api/auth/presence');
}
