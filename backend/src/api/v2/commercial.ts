// @ts-nocheck — Fastify internal types
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { setETag, incrementVersion } from '../../core/concurrency.js';
import { audit } from '../../core/audit.js';

export async function commercialRoutes(app: FastifyInstance) {
  // Quote accept — moved to quote.ts with full workflow
  // Credential confirm
  app.post('/v2/credentials/:id/confirm', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user?.sub;
    await query("UPDATE collaboration_credentials SET status = 'effective', updated_at = now() WHERE id = $1 AND status = 'pending_confirmation'", [id]);
    const v = incrementVersion(id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'credential_confirmed', resource_type: 'credential', resource_id: id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ id, status: 'effective' }));
  });

  // Payer claim
  app.post('/v2/payments/:schedule_id/declare', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { schedule_id } = req.params;
    const userId = req.user?.sub;
    await query("INSERT INTO payment_records (schedule_id, statement_type, declared_by, amount, status) VALUES ($1,'payer_claim',$2,'0','reported')", [schedule_id, userId]);
    const v = incrementVersion(schedule_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'payment_declared', resource_type: 'payment', resource_id: schedule_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ schedule_id, statement_type: 'payer_claim', status: 'reported' }));
  });

  // Payee receipt
  app.post('/v2/payments/:schedule_id/confirm-receipt', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { schedule_id } = req.params;
    const userId = req.user?.sub;
    await query("INSERT INTO payment_records (schedule_id, statement_type, declared_by, amount, status) VALUES ($1,'payee_receipt',$2,'0','reported')", [schedule_id, userId]);
    const v = incrementVersion(schedule_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'tenant_admin', action: 'receipt_confirmed', resource_type: 'payment', resource_id: schedule_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ schedule_id, statement_type: 'payee_receipt', status: 'reported' }));
  });
}
