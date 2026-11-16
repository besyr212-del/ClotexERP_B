import data from './permission-policy-manifest.json' with { type: 'json' };
import type { ApiPolicy, PolicyManifest } from './policyTypes.js';

function freezeMetadata<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeMetadata(child);
    Object.freeze(value);
  }
  return value;
}
export const permissionManifest = freezeMetadata(data as PolicyManifest);
export const permissionCatalog = permissionManifest.permissions;
export const apiPolicies = permissionManifest.policies;
const knownCodes = new Set(permissionCatalog.map(p => p.code));
const canonicalPath = (path: string) => path.replace(/\/$/, '') || '/';
const policyIndex = new Map(apiPolicies.map(p => [`${p.method} ${canonicalPath(p.path)}`, p]));

/** Match framework route templates, NEVER raw URLs/IDs or a public path-prefix wildcard. */
export function lookupApiPolicy(method: string, routeTemplate: string): ApiPolicy | null {
  return policyIndex.get(`${method === 'HEAD' ? 'GET' : method} ${canonicalPath(routeTemplate)}`) ?? null;
}

export type PolicyActor = { companyId: string; permissions: readonly string[]; isPlatformAdmin: boolean };
export type ShadowEvaluation = {
  permission: 'ALLOW' | 'DENY' | 'UNRESOLVED';
  decision: 'ALLOW' | 'DENY' | 'INDETERMINATE';
  scope: 'NOT_APPLICABLE' | 'SESSION_CONTEXT_ONLY' | 'RESOURCE_CONTEXT_REQUIRED';
  reason: string; missing: string[]; projectionRequired: boolean;
};

/** Pure foundation evaluator. No DB, templates, writes, implicit admin grant or legacy UNION.
 * explicitDenies is a future integration input only; no user overrides are created in Phase B. */
export function evaluateApiPolicy(policy: ApiPolicy, actor: PolicyActor | undefined, body: unknown, explicitDenies: readonly string[] = []): ShadowEvaluation {
  const result = (permission: ShadowEvaluation['permission'], reason: string, missing: string[] = []): ShadowEvaluation => {
    const scope = policy.company === 'PUBLIC' || policy.company === 'SELF' ? 'NOT_APPLICABLE'
      : policy.resolver || policy.warehouse !== 'NONE' ? 'RESOURCE_CONTEXT_REQUIRED' : 'SESSION_CONTEXT_ONLY';
    return { permission, reason, missing,
      decision: permission === 'DENY' ? 'DENY' : permission === 'UNRESOLVED' || scope === 'RESOURCE_CONTEXT_REQUIRED' || (policy.company === 'SESSION' && scope === 'SESSION_CONTEXT_ONLY') || policy.sensitive.length > 0 ? 'INDETERMINATE' : 'ALLOW',
      scope, projectionRequired: policy.sensitive.length > 0 };
  };
  if (policy.kind === 'RETIRED') return result('DENY', 'RETIRED_ENDPOINT');
  if (policy.kind === 'PUBLIC') return result('ALLOW', 'EXACT_PUBLIC_EXCEPTION');
  if (!actor) return result('DENY', 'AUTHENTICATION_REQUIRED');
  if (policy.kind === 'PLATFORM' && !actor.isPlatformAdmin) return result('DENY', 'LIVE_PLATFORM_FLAG_REQUIRED');
  if (policy.c1Control) return result('UNRESOLVED', 'LIVE_C1_CONTROL_CHECKED_BY_ROUTE_NOT_LEGACY_GRANTS');
  if (policy.kind === 'SELF') return result('ALLOW', 'AUTHENTICATED_SELF_ONLY');
  if (policy.company === 'SESSION' && !actor.companyId) return result('DENY', 'COMPANY_CONTEXT_REQUIRED');
  const b = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const wanted = new Set(policy.required);
  for (const condition of policy.conditions) {
    // Read only bounded facts. Never inspect passwords, JWTs, HTML, row contents or amounts in logs.
    const matches = condition.when === 'CONFIRM_TRUE' ? b.confirm === true
      : condition.when === 'CONFIRM_AND_PAID' ? b.confirm === true && typeof b.paidAmount === 'number' && b.paidAmount > 0
      : condition.when === 'SALE_LINES_PRESENT' ? Array.isArray(b.saleLines) && b.saleLines.length > 0
      : condition.when === 'PAYMENTS_PRESENT' ? Array.isArray(b.payments) && b.payments.length > 0
      : Array.isArray(b.returnPayments) && b.returnPayments.length > 0;
    if (matches) for (const code of condition.required) wanted.add(code);
  }
  let unresolvedVariant = false;
  if (policy.variant) {
    const field = policy.variant.source === 'BODY: voucherType' ? 'voucherType' : policy.variant.source === 'BODY: returnType' ? 'returnType' : null;
    const value = field ? b[field] : undefined;
    const branch = typeof value === 'string' && Object.hasOwn(policy.variant.cases, value) ? policy.variant.cases[value] : undefined;
    if (branch) for (const code of branch) wanted.add(code);
    else unresolvedVariant = true; // Query/body claims cannot stand in for a persisted document type.
  }
  const denies = new Set(explicitDenies);
  const explicitlyDenied = [...wanted].filter(code => denies.has(code));
  if (explicitlyDenied.length) return result('DENY', 'EXPLICIT_DENY_WINS', explicitlyDenied);
  if (unresolvedVariant && policy.variant && Object.values(policy.variant.cases).some(codes => codes.some(code => denies.has(code)))) {
    return result('UNRESOLVED', 'TRUSTED_VARIANT_CONTEXT_REQUIRED');
  }
  const allowed = new Set(actor.permissions);
  const missing = [...wanted].filter(code => !knownCodes.has(code) || !allowed.has(code));
  if (missing.length) return result('DENY', 'EXPLICIT_PERMISSION_MISSING', missing);
  return unresolvedVariant ? result('UNRESOLVED', 'TRUSTED_VARIANT_CONTEXT_REQUIRED') : result('ALLOW', 'EXPLICIT_PERMISSION_SET_ONLY');
}
