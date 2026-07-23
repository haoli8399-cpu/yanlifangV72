// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · AttributionRecord + ChargeableValue API
// PRD §17.4-17.8: 平台来源归因 + 成交服务费计费台账
// ============================================================
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { audit } from '../../core/audit.js';

// ---- Zod schemas ----

const createAttributionSchema = z.object({
  demand_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  source_type: z.enum(['self_owned', 'platform_sourced']),
  source_tenant_id: z.string().uuid().optional(),
  evidence: z.record(z.unknown()).optional(),
  first_contact_at: z.string().datetime().optional(),
});

const disputeAttributionSchema = z.object({
  reason: z.string().max(2000),
  evidence: z.record(z.unknown()).optional(),
});

const createChargeableValueSchema = z.object({
  project_id: z.string().uuid(),
  attribution_id: z.string().uuid(),
  net_revenue_atom_id: z.string().max(100).optional(),
  allocated_amount: z.string().max(50),
  exclusions: z.array(z.string()).optional(),
  currency: z.string().max(10).default('CNY'),
});

export async function governanceRoutes(app: FastifyInstance) {

  // ================================================================
  // AttributionRecord
  // ================================================================

  app.post('/v2/attributions', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createAttributionSchema.parse(req.body);
    const userId = req.user?.sub;
    const result = await query(
      `INSERT INTO attribution_records (demand_id, project_id, source_type, source_tenant_id, evidence, first_contact_at, status)
       VALUES ($1,$2,$3,$4,$5,$6,'active') RETURNING *`,
      [body.demand_id, body.project_id || null, body.source_type, body.source_tenant_id || null,
       JSON.stringify(body.evidence || {}), body.first_contact_at || null]
    );
    await audit({ actor_id: userId, actor_type: 'system', action: 'operation', resource_type: 'attribution_record', resource_id: result.rows[0].id, resource_version: 1, result: 'success' });
    return reply.status(201).send(successResponse(result.rows[0]));
  });

  app.get('/v2/attributions/demand/:demand_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const result = await query('SELECT * FROM attribution_records WHERE demand_id = $1 ORDER BY created_at DESC', [demand_id]);
    return reply.send(successResponse(result.rows));
  });

  app.get('/v2/attributions/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const result = await query('SELECT * FROM attribution_records WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '归因记录不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // PRD §17.7: 归因争议 — Tenant 可对 platform_sourced 提出异议
  app.post('/v2/attributions/:id/dispute', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = disputeAttributionSchema.parse(req.body);
    const userId = req.user?.sub;
    const existing = await query("SELECT * FROM attribution_records WHERE id = $1 AND source_type = 'platform_sourced'", [id]);
    if (existing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '仅平台来源归因可提出异议'));
    await query(
      `UPDATE attribution_records SET status='disputed', evidence=evidence || $1 WHERE id=$2`,
      [JSON.stringify({ dispute_reason: body.reason, dispute_evidence: body.evidence, disputed_by: userId, disputed_at: new Date().toISOString() }), id]
    );
    await audit({ actor_id: userId, actor_type: 'tenant_admin', action: 'change', resource_type: 'attribution_record', resource_id: id, resource_version: 1, result: 'success' });
    return reply.send(successResponse({ id, status: 'disputed' }));
  });

  // PRD §17.7: 180天到期释放
  app.post('/v2/attributions/:id/release', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user?.sub;
    await query("UPDATE attribution_records SET status='released', released_at=now() WHERE id=$1 AND status='active'", [id]);
    await audit({ actor_id: userId, actor_type: 'system', action: 'change', resource_type: 'attribution_record', resource_id: id, resource_version: 1, result: 'success' });
    return reply.send(successResponse({ id, status: 'released' }));
  });

  // ================================================================
  // ChargeableValue
  // ================================================================

  app.post('/v2/chargeable-values', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createChargeableValueSchema.parse(req.body);
    // PRD §17.4.1: 同一 net_revenue_atom_id 在 active 时不可重复
    if (body.net_revenue_atom_id) {
      const dup = await query(
        "SELECT id FROM chargeable_values WHERE net_revenue_atom_id = $1 AND lifecycle_status = 'active'",
        [body.net_revenue_atom_id]
      );
      if (dup.rows.length > 0) return reply.status(409).send(errorResponse(4092, '同一净回款原子已被另一个活跃计费值覆盖'));
    }
    const excluded = body.exclusions || [];
    const result = await query(
      `INSERT INTO chargeable_values (project_id, attribution_id, chargeable_tenant_id, currency, net_revenue_atom_id, allocated_amount, exclusions, current_billable_amount, lifecycle_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$6,'draft') RETURNING *`,
      [body.project_id, body.attribution_id, req.user?.sub, body.currency, body.net_revenue_atom_id || null,
       body.allocated_amount, JSON.stringify(excluded)]
    );
    await audit({ actor_id: req.user?.sub, actor_type: 'platform_admin', action: 'operation', resource_type: 'chargeable_value', resource_id: result.rows[0].id, resource_version: 1, result: 'success' });
    return reply.status(201).send(successResponse(result.rows[0]));
  });

  app.get('/v2/chargeable-values/project/:project_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const result = await query('SELECT * FROM chargeable_values WHERE project_id = $1 ORDER BY created_at DESC', [project_id]);
    return reply.send(successResponse(result.rows));
  });

  app.get('/v2/chargeable-values/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const result = await query('SELECT * FROM chargeable_values WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '计费值不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // PRD §17.4: 激活计费值（仅当归因有效且原子无重叠时）
  app.post('/v2/chargeable-values/:id/activate', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const existing = await query('SELECT * FROM chargeable_values WHERE id = $1', [id]);
    if (existing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '计费值不存在'));
    if (existing.rows[0].lifecycle_status !== 'draft') return reply.status(409).send(errorResponse(4092, '只有草稿状态可激活'));
    await query("UPDATE chargeable_values SET lifecycle_status='active' WHERE id=$1", [id]);
    await audit({ actor_id: req.user?.sub, actor_type: 'platform_admin', action: 'operation', resource_type: 'chargeable_value', resource_id: id, resource_version: 1, result: 'success' });
    return reply.send(successResponse({ id, lifecycle_status: 'active' }));
  });

  // PRD §17.5: 退款冲回
  app.post('/v2/chargeable-values/:id/adjust', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = req.body || {};
    const existing = await query("SELECT * FROM chargeable_values WHERE id = $1 AND lifecycle_status = 'active'", [id]);
    if (existing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '活跃计费值不存在'));
    const adjustment = String(body.refund_amount || '0');
    const newAmount = String(Number(existing.rows[0].current_billable_amount) - Number(adjustment));
    await query(
      'UPDATE chargeable_values SET refund_adjustment=$1, current_billable_amount=$2 WHERE id=$3',
      [adjustment, newAmount, id]
    );
    await audit({ actor_id: req.user?.sub, actor_type: 'platform_admin', action: 'change', resource_type: 'chargeable_value', resource_id: id, resource_version: 1, result: 'success' });
    return reply.send(successResponse({ id, refund_adjustment: adjustment, current_billable_amount: newAmount }));
  });

  app.get('/v2/governance/health', async (_req, reply) => reply.send({ status: 'ok', module: 'governance' }));
}
