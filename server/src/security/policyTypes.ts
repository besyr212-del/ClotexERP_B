export type PermissionDefinition = {
  code: string; section: string; page: string; operation: string;
  description: { ar: string; tr: string }; status: 'LEGACY' | 'PROPOSED' | 'TASK004_COMPAT';
};
export type ApiPolicy = {
  id: string; method: string; path: string; domain: string;
  kind: 'BUSINESS' | 'PUBLIC' | 'SELF' | 'PLATFORM' | 'RETIRED';
  authentication: boolean; required: string[]; approval: string[]; sensitive: string[];
  company: 'SESSION' | 'SELF' | 'PLATFORM' | 'PUBLIC';
  warehouse: 'NONE' | 'ENTITY_LOOKUP' | 'ENTITY_OR_ALLOWED_LIST' | 'SOURCE_AND_DESTINATION';
  resolver: string | null; compound: string[]; currentGuard: string;
  c1Control?: 'SELF_PROFILE' | 'INDEPENDENT_PERMISSION_ADMIN' | 'LIVE_PLATFORM_REAUTH';
  conditions: { when: 'CONFIRM_TRUE' | 'CONFIRM_AND_PAID' | 'SALE_LINES_PRESENT' | 'PAYMENTS_PRESENT' | 'RETURN_PAYMENTS_PRESENT'; required: string[] }[];
  variant?: { source: string; cases: Record<string, string[]> };
  exemptionReason: { ar: string; tr: string } | null;
  source: { file: string; plugin: string; localPath: string };
};
export type PolicyManifest = {
  schemaVersion: number; mode: 'SHADOW_AUDIT_ONLY';
  permissions: PermissionDefinition[]; policies: ApiPolicy[];
  pages: { path: string; index: boolean; component: string; demo: boolean; required: string[]; note: string }[];
  sourceCounts: { apiDeclarations: number; registeredApiRoutes: number; routeFiles: number; frontendRoutes: number; reports: number };
  task004Compatibility: { referenceCommit: string; merged: boolean; keys: string[]; rule: string };
  frameworkOptions: { method: string; kind: string; reason: string };
};
