// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · MainServiceEligibility + CapacityDeclaration API
// PRD §13.10-13.11: 主服务适格评估与容量声明
// ============================================================
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { audit } from '../../core/audit.js';

// ---- Zod schemas ----

const createEligibilitySchema = z.object({
  tenant_id: z.string().uuid(),
  city: z.string().max(50),
  event_type: z.string().max(100),
  scale_max: z.number().int().optional(),
  evidence: z.record(z.unknown()).optional(),
  expires_at: z.string().datetime().optional(),
});
const assessEligibilitySchema = z.object({
  status: z.enum(['conditional', 'eligible', 'ineligible']),
  conditional_reqs: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});
const createCapacitySchema = z.object({
  tenant_id: z.string().uuid(),
  status: z.enum(['available', 'limited', 'unavailable', 'manual_review']).default('manual_review'),
  scope_notes: z.string().optional(),
  effective_until: z.string().datetime(),
});

export async function eligibilityRoutes(app: FastifyInstance) {

  // ================================================================
  // MainServiceEligibility
  // ================================================================

  app.post('/v2/eligibility', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createEligibilitySchema.parse(req.body);
    const userId = req.user?.sub;
    const result = await query(
      `INSERT INTO main_service_eligibility (tenant_id, city, event_type, scale_max, evidence, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [body.tenant_id, body.city, body.event_type, body.scale_max || null, JSON.stringify(body.evidence || {}), body.expires_at || null]
    );
    await audit({ actor_id: userId, actor_type: 'platform_admin', action: 'operation', resource_type: 'main_service_eligibility', resource_id: result.rows[0].id, resource_version: 1, result: 'success' });
    return reply.status(201).send(successResponse(result.rows[0]));
  });

  app.get('/v2/eligibility/tenant/:tenant_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { tenant_id } = req.params;
    const result = await query('SELECT * FROM main_service_eligibility WHERE tenant_id = $1 ORDER BY created_at DESC', [tenant_id]);
    return reply.send(successResponse(result.rows));
  });

  app.patch('/v2/eligibility/:id/assess', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = assessEligibilitySchema.parse(req.body);
    const userId = req.user?.sub;
    const existing = await query('SELECT * FROM main_service_eligibility WHERE id = $1', [id]);
    if (existing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '适格记录不存在'));
    await query(
      `UPDATE main_service_eligibility SET status=$1, conditional_reqs=$2, assessed_by=$3, assessed_at=now() WHERE id=$4`,
      [body.status, JSON.stringify(body.conditional_reqs || []), userId, id]
    );
    await audit({ actor_id: userId, actor_type: 'platform_admin', action: 'operation', resource_type: 'main_service_eligibility', resource_id: id, resource_version: 1, result: 'success' });
    return reply.send(successResponse({ id, status: body.status }));
  });

  app.get('/v2/eligibility/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const result = await query('SELECT * FROM main_service_eligibility WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '适格记录不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // ================================================================
  // CapacityDeclaration
  // ================================================================

  app.post('/v2/capacity', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createCapacitySchema.parse(req.body);
    const userId = req.user?.sub;
    const result = await query(
      `INSERT INTO capacity_declarations (tenant_id, status, scope_notes, declared_by, effective_until)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [body.tenant_id, body.status, body.scope_notes || null, userId, body.effective_until]
    );
    await audit({ actor_id: userId, actor_type: 'tenant_admin', action: 'operation', resource_type: 'capacity_declaration', resource_id: result.rows[0].id, resource_version: 1, result: 'success' });
    return reply.status(201).send(successResponse(result.rows[0]));
  });

  app.get('/v2/capacity/tenant/:tenant_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { tenant_id } = req.params;
    const result = await query('SELECT * FROM capacity_declarations WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1', [tenant_id]);
    return reply.send(successResponse(result.rows));
  });

  app.get('/v2/capacity/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const result = await query('SELECT * FROM capacity_declarations WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '容量声明不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  app.patch('/v2/capacity/:id/renew', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = req.body || {};
    const userId = req.user?.sub;
    if (body.status) await query('UPDATE capacity_declarations SET status=$1 WHERE id=$2', [body.status, id]);
    if (body.scope_notes) await query('UPDATE capacity_declarations SET scope_notes=$1 WHERE id=$2', [body.scope_notes, id]);
    if (body.effective_until) await query('UPDATE capacity_declarations SET effective_until=$1 WHERE id=$2', [body.effective_until, id]);
    await audit({ actor_id: userId, actor_type: 'tenant_admin', action: 'operation', resource_type: 'capacity_declaration', resource_id: id, resource_version: 1, result: 'success' });
    return reply.send(successResponse({ id, updated: true }));
  });

  app.get('/v2/eligibility/health', async (_req, reply) => reply.send({ status: 'ok', module: 'eligibility' }));
}
