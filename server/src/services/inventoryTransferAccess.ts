import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendError } from '../middleware/errorHandler.js';

// Applied only to transfer writes and the single-roll move endpoint.
// Authentication, session revocation and tenant switching remain in the existing middleware.
export async function requireInventoryTransferAccess(request: FastifyRequest, reply: FastifyReply) {
  if (request.user?.role === 'admin' || request.user?.permissions.includes('inventory.manage')) return;
  return sendError(reply, 403, 'ليس لديك صلاحية إجراء مناقلات المخزون', 'FORBIDDEN');
}
