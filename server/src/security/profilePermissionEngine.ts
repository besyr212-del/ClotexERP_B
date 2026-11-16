import { permissionCatalog } from './permissionPolicies.js';

export type Override = 'INHERIT' | 'ALLOW' | 'DENY';
export type ProfileState = {
 userId: string; companyId: string; active: boolean; companyActive: boolean;
 published: readonly string[]; overrides: Record<string, Override>;
 warehouseMode: 'ALL' | 'LIST'; warehouseIds: readonly string[];
};
export type ResourceScope = { companyId: string; warehouseIds: readonly string[]; verified: boolean };
const known = new Set(permissionCatalog.map(p => p.code));
export const isKnownPermission = (code: string) => known.has(code);
export const isPlatformPermission = (code: string) => code.startsWith('platform.');

/** No role/JWT/legacy UNION or platform bypass. Scope always precedes user overrides. */
export function decideProfilePermission(profile: ProfileState, code: string, scope: ResourceScope) {
 const deny = (reason: string, source = 'SECURITY_BOUNDARY') => ({ code, allowed: false, reason, source });
 if (!profile.active || !profile.companyActive) return deny('ACCOUNT_OR_COMPANY_INACTIVE');
 if (!known.has(code)) return deny('UNKNOWN_PERMISSION');
 if (isPlatformPermission(code)) return deny('PLATFORM_GUARD_REQUIRED');
 if (!scope.verified) return deny('TRUSTED_RESOURCE_CONTEXT_REQUIRED');
 if (scope.companyId !== profile.companyId) return deny('COMPANY_SCOPE_DENIED');
 if (profile.warehouseMode !== 'ALL' && scope.warehouseIds.some(id => !profile.warehouseIds.includes(id))) return deny('WAREHOUSE_SCOPE_DENIED');
 const override = Object.hasOwn(profile.overrides, code) ? profile.overrides[code] : 'INHERIT';
 if (override === 'DENY') return deny('INDIVIDUAL_DENY', 'USER_DENY');
 if (override === 'ALLOW') return { code, allowed: true, reason: 'INDIVIDUAL_ALLOW', source: 'USER_ALLOW' };
 if (override !== 'INHERIT') return deny('INVALID_OVERRIDE');
 return profile.published.includes(code)
  ? { code, allowed: true, reason: 'PUBLISHED_TEMPLATE_ALLOW', source: 'TEMPLATE' }
  : deny('NOT_GRANTED', 'DEFAULT_DENY');
}

export function permissionChanges(before: ProfileState, after: ProfileState) {
 const scope = { companyId: before.companyId, warehouseIds: [], verified: true };
 return permissionCatalog.flatMap(p => {
  const old = decideProfilePermission(before, p.code, scope), next = decideProfilePermission(after, p.code, scope);
  return old.allowed === next.allowed ? [] : [{ code: p.code, before: old.allowed, after: next.allowed, source: next.source }];
 });
}
