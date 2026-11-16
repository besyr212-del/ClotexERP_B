import type { FastifyInstance } from 'fastify';
import { evaluateApiPolicy, lookupApiPolicy } from './permissionPolicies.js';

type Counter = { policyId: string; observation: string; reason: string; count: number; missing: string[]; scope: string };
type ShadowLog = { event: 'permission_shadow_difference'; mode: 'SHADOW_AUDIT_ONLY'; policyId: string; observation: string; reason: string; count: number; missing: string[]; scope: string };
export class BoundedPermissionShadowAudit {
  private counters = new Map<string, Counter>();
  private windowStart: number;
  private emitted = 0;
  private dropped = 0;
  private failures = 0;
  readonly maxBuckets = 512;
  readonly maxLogsPerWindow = 10;
  readonly windowMs = 60_000;
  constructor(private emit: (entry: ShadowLog) => void, private now: () => number = Date.now) { this.windowStart = now(); }

  observe(method: string, routeTemplate: string, status: number, actor: Parameters<typeof evaluateApiPolicy>[1], body: unknown) {
    try {
      const time = this.now();
      if (time - this.windowStart >= this.windowMs) {
        // A minute has elapsed: flush at most ten aggregated records. No timers or per-request IO.
        this.emitted = 0;
        for (const counter of this.counters.values()) {
          if (this.emitted >= this.maxLogsPerWindow) { this.dropped = Math.min(this.dropped + 1, 2_147_483_647); continue; }
          try { this.emit({ event: 'permission_shadow_difference', mode: 'SHADOW_AUDIT_ONLY', ...counter }); this.emitted++; }
          catch { this.failures = Math.min(this.failures + 1, 2_147_483_647); this.emitted++; }
        }
        this.counters.clear(); this.windowStart = time;
      }
      if (method === 'OPTIONS') return; // Existing framework CORS still owns this protocol request.
      const policy = lookupApiPolicy(method, routeTemplate);
      if (policy?.kind === 'PUBLIC') return; // Login validation failures are not authorization differences.
      const evaluation = policy ? evaluateApiPolicy(policy, actor, body) : null;
      const observation = !policy ? 'UNMAPPED_ROUTE_TEMPLATE'
        : status >= 200 && status < 300 && evaluation?.permission === 'DENY' ? 'PROPOSED_DENY_AFTER_HTTP_SUCCESS'
        : [401, 403].includes(status) && evaluation?.permission === 'ALLOW' ? 'PROPOSED_PERMISSION_ALLOW_AFTER_HTTP_AUTH_REJECTION'
        : null;
      if (!observation) return;
      const policyId = policy?.id ?? 'UNMAPPED';
      const key = policyId + '|' + observation + '|' + (evaluation?.reason ?? 'MISSING_EXPLICIT_POLICY');
      const current = this.counters.get(key);
      if (current) { current.count = Math.min(current.count + 1, 2_147_483_647); return; }
      if (this.counters.size >= this.maxBuckets) { this.dropped = Math.min(this.dropped + 1, 2_147_483_647); return; }
      this.counters.set(key, { policyId, observation, reason: evaluation?.reason ?? 'MISSING_EXPLICIT_POLICY', count: 1,
        missing: evaluation?.missing.slice(0, 8) ?? [], scope: evaluation?.scope ?? 'UNKNOWN' });
    } catch { this.failures = Math.min(this.failures + 1, 2_147_483_647); }
  }
  stats() { return { mode: 'SHADOW_AUDIT_ONLY', buckets: this.counters.size, dropped: this.dropped, failures: this.failures, maxBuckets: this.maxBuckets, maxLogsPerWindow: this.maxLogsPerWindow }; }
}

/** Install on the root instance, not an encapsulated child plugin. Never calls reply/send,
 * changes a status, short-circuits a hook, alters req.user, reads SQL or persists any grants. */
export function installPermissionShadowAudit(app: FastifyInstance, observer = new BoundedPermissionShadowAudit(entry => app.log.info(entry))) {
  app.addHook('onResponse', (request, reply, done) => {
    try { observer.observe(request.method, request.routeOptions.url ?? '', reply.statusCode, request.user, request.body); }
    catch { /* Shadow diagnostics must never affect existing authorization or responses. */ }
    done();
  });
  return observer;
}
