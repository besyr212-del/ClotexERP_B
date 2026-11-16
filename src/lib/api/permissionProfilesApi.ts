import { apiFetch } from './client';

export type PermissionDecision = { code: string; allowed: boolean; reason: string; source: string };
export type UserPermissionProfile = {
  userId: string; companyId: string; accountActive: boolean; companyActive: boolean;
  canUseSystem: boolean; configured: boolean; legacyBusinessEnforcementUnchanged: true;
  template: { id: string; name: string; version: number } | null; revision: number;
  overrides: Record<string, 'INHERIT' | 'ALLOW' | 'DENY'>;
  warehouseMode: 'ALL' | 'LIST'; warehouseIds: string[];
  delegation: { enabled: boolean; grantableCodes: string[] };
  platformAuthorization: { isPlatformAdmin: boolean; managedOutsideTemplates: true; requiresLiveGuardAndReauth: true };
  decisions: PermissionDecision[]; note: string;
};
/** No persistent/local cache. Identity comes from the authenticated server, never device data.
 * apiFetch rejects in-flight responses after an account/session changes. */
export async function fetchCurrentPermissionProfile(): Promise<UserPermissionProfile> {
  const result = await apiFetch<{ ok: true; profile: UserPermissionProfile }>('/api/permission-profiles/me');
  return result.profile;
}
