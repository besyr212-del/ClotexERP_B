import { SecurityAccessError } from '../services/liveAuthorizationService.js';
/** PostgreSQL INTEGER boundary; neither counters nor optimistic inputs may overflow it. */
export const PERMISSION_REVISION_MAX = 2147483647;
export function validatePermissionRevision(value: unknown, minimum: number): asserts value is number {
 if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > PERMISSION_REVISION_MAX)
  throw new SecurityAccessError('رقم المراجعة غير صالح', 400, 'INVALID_REVISION');
}
export function requireRevisionCapacity(value: number) {
 if (value >= PERMISSION_REVISION_MAX)
  throw new SecurityAccessError('بلغ عداد المراجعة الحد الأقصى؛ راجع مسؤول النظام', 409, 'REVISION_EXHAUSTED');
}
