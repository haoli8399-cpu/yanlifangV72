// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · TenantEngagement + RoutingDecision API
// PRD §13.4-13.8: 需求路由与 Tenant 承接
// PRD §20.2: Engagement 状态机
// ============================================================
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { audit } from '../../core/audit.js';

// ---- Zod schemas ----

const createEngagementSchema = z.object({
  tenant_id: z.string().uuid(),
  engagement_type: z.enum(['main_service', 'module_collaboration']).default('main_service'),
  response_deadline: z.string().datetime().optional(),
});

const respondSchema = z.object({
  decision: z.enum(['accepted', 'declined', 'request_supplement']),
  notes: z.string().max(2000).optional(),
});

const routingCreateSchema = z.object({
  source_description: z.string().max(500).optional(),
  candidates: z.array(z.object({
    tenant_id: z.string().uuid(),
    reason: z.string().max(500),
    sort_order: z.number().int().min(1),
  })).min(1).max(3),
  excluded_tenants: z.array(z.object({
    tenant_id: z.string().uuid(),
    reason: z.string().max(500),
  })).optional(),
});

const customerSelectSchema = z.object({
  tenant_id: z.string().uuid(),
  is_replacement: z.boolean().default(false),
});

const reassignSchema = z.object({
  reason: z.enum(['tenant_declined', 'timeout', 'customer_requested', 'capacity_failed', 'conflict_of_interest']),
  new_candidates: z.array(z.object({
    tenant_id: z.string().uuid(),
    reason: z.string().max(500),
    sort_order: z.number().int().min(1),
  })).min(1).max(3),
});

// ---- Valid state transitions (PRD §20.2) ----
const VALID_TRANSITIONS: Record<string, string[]> = {
  candidate: ['awaiting_response', 'expired'],
  awaiting_response: ['accepted', 'declined', 'expired', 'clarifying'],
  accepted: ['clarifying', 'planning', 'declined', 'expired'],
  clarifying: ['planning', 'quoting', 'awaiting_response', 'declined', 'expired'],
  planning: ['quoting', 'declined', 'expired'],
  quoting: ['selected', 'not_selected', 'declined', 'expired'],
  selected: ['expired'],
  not_selected: ['expired'],
  declined: ['expired'],
  expired: [],
};

function canTransition(current: string, target: string): boolean {
  return (VALID_TRANSITIONS[current] || []).includes(target);
}

export async function engagementRoutingRoutes(app: FastifyInstance) {

  // ================================================================
  // TenantEngagement
  // ================================================================

  // POST /v2/demands/:demand_id/engagements — 创建承接关系
  app.post('/v2/demands/:demand_id/engagements', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const body = createEngagementSchema.parse(req.body);
    const userId = req.user?.sub;

    const demandResult = await query('SELECT id, lifecycle FROM v72_demands WHERE id = $1', [demand_id]);
    if (demandResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '需求不存在'));

    const existing = await query(
      `SELECT id FROM tenant_engagements 
       WHERE demand_id = $1 AND tenant_id = $2 AND lifecycle_status NOT IN ('declined','expired','not_selected')`,
      [demand_id, body.tenant_id]
    );
    if (existing.rows.length > 0) return reply.status(409).send(errorResponse(4092, '该 Tenant 已有活跃的承接记录'));

    const activeCount = await query(
      `SELECT COUNT(*) AS cnt FROM tenant_engagements 
       WHERE demand_id = $1 AND lifecycle_status IN ('candidate','awaiting_response','accepted','clarifying','planning','quoting')`,
      [demand_id]
    );
    if (Number(activeCount.rows[0].cnt) >= 3) return reply.status(409).send(errorResponse(4093, '最多三家候选 Tenant'));

    const result = await query(
      `INSERT INTO tenant_engagements (demand_id, tenant_id, engagement_type, lifecycle_status, response_deadline)
       VALUES ($1, $2, $3, 'candidate', $4) RETURNING *`,
      [demand_id, body.tenant_id, body.engagement_type, body.response_deadline || null]
    );
    const engagement = result.rows[0];

    await audit({
      actor_id: userId, actor_type: 'system', action: 'engagement_created',
      resource_type: 'tenant_engagement', resource_id: engagement.id, resource_version: Number(engagement.row_version),
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: engagement.id,
      demand_id: engagement.demand_id,
      tenant_id: engagement.tenant_id,
      engagement_type: engagement.engagement_type,
      lifecycle_status: engagement.lifecycle_status,
      response_deadline: engagement.response_deadline,
      created_at: engagement.created_at,
    }));
  });

  // GET /v2/demands/:demand_id/engagements — 查询需求的承接列表
  app.get('/v2/demands/:demand_id/engagements', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const result = await query(
      `SELECT id, tenant_id, engagement_type, lifecycle_status, response_deadline, responded_at, response_notes, row_version, created_at, updated_at
       FROM tenant_engagements WHERE demand_id = $1 ORDER BY created_at DESC`,
      [demand_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // GET /v2/engagements/:id — 获取承接详情
  app.get('/v2/engagements/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const result = await query(
      `SELECT id, demand_id, tenant_id, engagement_type, lifecycle_status, response_deadline, responded_at, response_notes, row_version, created_at, updated_at
       FROM tenant_engagements WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '承接记录不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // PATCH /v2/engagements/:id/respond — Tenant 响应承接 (PRD §20.2)
  app.patch('/v2/engagements/:id/respond', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = respondSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM tenant_engagements WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '承接记录不存在'));
    const eng = result.rows[0];

    const targetStatus = body.decision === 'accepted' ? 'accepted' :
                         body.decision === 'declined' ? 'declined' : 'clarifying';
    if (!canTransition(eng.lifecycle_status, targetStatus)) {
      return reply.status(409).send(errorResponse(4092,
        `无法从 ${eng.lifecycle_status} 转换到 ${targetStatus}`));
    }

    // PRD §20.2: accepted 不等于接受主服务整体责任
    const updated = await query(
      `UPDATE tenant_engagements 
       SET lifecycle_status = $1, responded_at = now(), response_notes = $2, row_version = row_version + 1, updated_at = now()
       WHERE id = $3 RETURNING *`,
      [targetStatus, body.notes || null, id]
    );

    const auditAction = body.decision === 'accepted' ? 'engagement_accepted' :
                        body.decision === 'declined' ? 'engagement_declined' : 'engagement_request_supplement';
    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: auditAction,
      resource_type: 'tenant_engagement', resource_id: id, resource_version: Number(updated.rows[0].row_version),
      result: 'success',
    });

    return reply.send(successResponse({
      id: updated.rows[0].id,
      lifecycle_status: updated.rows[0].lifecycle_status,
      responded_at: updated.rows[0].responded_at,
      response_notes: updated.rows[0].response_notes,
    }));
  });

  // POST /v2/engagements/:id/change-status — 状态迁移
  app.post('/v2/engagements/:id/change-status', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM tenant_engagements WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '承接记录不存在'));
    const eng = result.rows[0];

    if (!canTransition(eng.lifecycle_status, status)) {
      return reply.status(409).send(errorResponse(4092,
        `无法从 ${eng.lifecycle_status} 转换到 ${status}`));
    }

    const updated = await query(
      `UPDATE tenant_engagements SET lifecycle_status = $1, row_version = row_version + 1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    const statusActionMap: Record<string, string> = {
      awaiting_response: 'engagement_status_awaiting_response',
      planning: 'engagement_status_planning',
      quoting: 'engagement_status_quoting',
      selected: 'engagement_status_selected',
      not_selected: 'engagement_status_not_selected',
      expired: 'engagement_status_expired',
    };
    await audit({
      actor_id: userId, actor_type: 'system', action: (statusActionMap[status] || 'state_transition'),
      resource_type: 'tenant_engagement', resource_id: id, resource_version: Number(updated.rows[0].row_version),
      result: 'success',
    });

    return reply.send(successResponse({ id: updated.rows[0].id, lifecycle_status: updated.rows[0].lifecycle_status }));
  });

  // ================================================================
  // RoutingDecision
  // ================================================================

  // POST /v2/demands/:demand_id/routing — 创建/更新路由决策
  app.post('/v2/demands/:demand_id/routing', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const body = routingCreateSchema.parse(req.body);
    const userId = req.user?.sub;

    const demandResult = await query('SELECT id FROM v72_demands WHERE id = $1', [demand_id]);
    if (demandResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '需求不存在'));

    const existing = await query('SELECT id FROM routing_decisions WHERE demand_id = $1', [demand_id]);
    const candidates = body.candidates.map(c => ({
      tenant_id: c.tenant_id,
      reason: c.reason,
      sort_order: c.sort_order,
      status: 'pending',
      shared_brief: c.sort_order === 1,
    }));

    let routingId;
    if (existing.rows.length > 0) {
      await query(
        `UPDATE routing_decisions SET candidates = $1, excluded_reasons = $2, updated_at = now() WHERE id = $3`,
        [JSON.stringify(candidates), JSON.stringify(body.excluded_tenants || []), existing.rows[0].id]
      );
      routingId = existing.rows[0].id;
    } else {
      const insert = await query(
        `INSERT INTO routing_decisions (demand_id, candidates, excluded_reasons, source_description)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [demand_id, JSON.stringify(candidates), JSON.stringify(body.excluded_tenants || []), body.source_description || null]
      );
      routingId = insert.rows[0].id;
    }

    // 为每个候选创建 TenantEngagement
    for (const c of body.candidates) {
      const exists = await query(
        `SELECT id FROM tenant_engagements WHERE demand_id = $1 AND tenant_id = $2`,
        [demand_id, c.tenant_id]
      );
      if (exists.rows.length === 0) {
        const deadline = c.sort_order === 1 ? new Date(Date.now() + 7 * 86400000).toISOString() : null;
        await query(
          `INSERT INTO tenant_engagements (demand_id, tenant_id, engagement_type, lifecycle_status, response_deadline)
           VALUES ($1, $2, 'main_service', 'awaiting_response', $3)`,
          [demand_id, c.tenant_id, deadline]
        );
      }
    }

    // 首名候选自动获得 Brief 访问授权 (PRD §13.5)
    const topCandidate = body.candidates.find(c => c.sort_order === 1);
    if (topCandidate) {
      const engResult = await query(
        `SELECT id FROM tenant_engagements WHERE demand_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1`,
        [demand_id, topCandidate.tenant_id]
      );
      if (engResult.rows.length > 0) {
        await query(
          `INSERT INTO tenant_brief_access_grants (demand_id, tenant_id, engagement_id, brief_access_scope, status)
           VALUES ($1, $2, $3, 'full', 'active')
           ON CONFLICT DO NOTHING`,
          [demand_id, topCandidate.tenant_id, engResult.rows[0].id]
        );
      }
    }

    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['routing', demand_id]);

    await audit({
      actor_id: userId, actor_type: 'system', action: 'routing_created',
      resource_type: 'routing_decision', resource_id: routingId, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({
      routing_id: routingId,
      demand_id,
      candidate_count: body.candidates.length,
      top_candidate_shared_brief: true,
      lifecycle_status: 'routing',
    }));
  });

  // GET /v2/demands/:demand_id/routing — 获取路由决策
  app.get('/v2/demands/:demand_id/routing', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const result = await query('SELECT * FROM routing_decisions WHERE demand_id = $1 ORDER BY created_at DESC LIMIT 1', [demand_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '未找到路由决策'));
    return reply.send(successResponse(result.rows[0]));
  });

  // POST /v2/demands/:demand_id/routing/select — 客户选择 Tenant (PRD §13.5)
  app.post('/v2/demands/:demand_id/routing/select', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const body = customerSelectSchema.parse(req.body);
    const userId = req.user?.sub;

    const routing = await query(
      'SELECT * FROM routing_decisions WHERE demand_id = $1 ORDER BY created_at DESC LIMIT 1',
      [demand_id]
    );
    if (routing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '未找到路由决策'));
    const routingRec = routing.rows[0];

    const candidates = routingRec.candidates || [];
    const selectedInCandidates = candidates.find(c => String(c.tenant_id) === body.tenant_id);
    if (!selectedInCandidates) return reply.status(400).send(errorResponse(4001, '所选 Tenant 不在候选列表中'));

    const existingSelection = routingRec.customer_selection?.tenant_id;
    if (existingSelection && !body.is_replacement) {
      return reply.status(409).send(errorResponse(4092, '已有选择的 Tenant，需设置 is_replacement=true 更换'));
    }

    const selection = {
      tenant_id: body.tenant_id,
      selected_at: new Date().toISOString(),
      previous_tenant_id: existingSelection || null,
      is_replacement: body.is_replacement,
    };

    await query(
      `UPDATE routing_decisions SET customer_selection = $1, final_tenant_id = $2, updated_at = now() WHERE id = $3`,
      [JSON.stringify(selection), body.tenant_id, routingRec.id]
    );

    await query(
      `UPDATE tenant_engagements SET lifecycle_status = 'selected', row_version = row_version + 1, updated_at = now()
       WHERE demand_id = $1 AND tenant_id = $2 AND lifecycle_status NOT IN ('declined','expired','not_selected')`,
      [demand_id, body.tenant_id]
    );

    for (const c of candidates) {
      if (String(c.tenant_id) !== body.tenant_id) {
        await query(
          `UPDATE tenant_engagements SET lifecycle_status = 'not_selected', row_version = row_version + 1, updated_at = now()
           WHERE demand_id = $1 AND tenant_id = $2 AND lifecycle_status NOT IN ('declined','expired','not_selected')`,
          [demand_id, String(c.tenant_id)]
        );
      }
    }

    const engResult = await query(
      `SELECT id FROM tenant_engagements WHERE demand_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [demand_id, body.tenant_id]
    );
    if (engResult.rows.length > 0) {
      await query(
        `INSERT INTO tenant_brief_access_grants (demand_id, tenant_id, engagement_id, brief_access_scope, status)
         VALUES ($1, $2, $3, 'full', 'active')
         ON CONFLICT DO NOTHING`,
        [demand_id, body.tenant_id, engResult.rows[0].id]
      );
    }

    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['routed', demand_id]);

    await audit({
      actor_id: userId, actor_type: 'customer', action: 'customer_selected_tenant',
      resource_type: 'routing_decision', resource_id: routingRec.id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({
      demand_id,
      selected_tenant_id: body.tenant_id,
      is_replacement: body.is_replacement,
      lifecycle_status: 'routed',
      remaining_candidates: candidates.length - 1,
    }));
  });

  // POST /v2/demands/:demand_id/routing/reassign — 受控改派 (PRD §13.6)
  app.post('/v2/demands/:demand_id/routing/reassign', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const body = reassignSchema.parse(req.body);
    const userId = req.user?.sub;

    const routing = await query(
      'SELECT id, reassignment_log FROM routing_decisions WHERE demand_id = $1 ORDER BY created_at DESC LIMIT 1',
      [demand_id]
    );
    if (routing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '未找到路由决策'));
    const routingRec = routing.rows[0];

    const logEntry = {
      reason: body.reason,
      reassigned_at: new Date().toISOString(),
      reassigned_by: userId,
      new_candidates: body.new_candidates,
    };
    const existingLog = routingRec.reassignment_log || [];
    const updatedLog = [...existingLog, logEntry];

    const candidates = body.new_candidates.map(c => ({
      tenant_id: c.tenant_id,
      reason: c.reason,
      sort_order: c.sort_order,
      status: 'pending',
      shared_brief: c.sort_order === 1,
    }));

    await query(
      `UPDATE routing_decisions SET candidates = $1, reassignment_log = $2, updated_at = now() WHERE id = $3`,
      [JSON.stringify(candidates), JSON.stringify(updatedLog), routingRec.id]
    );

    for (const c of body.new_candidates) {
      await query(
        `INSERT INTO tenant_engagements (demand_id, tenant_id, engagement_type, lifecycle_status, response_deadline)
         VALUES ($1, $2, 'main_service', 'awaiting_response', $3)`,
        [demand_id, c.tenant_id, c.sort_order === 1 ? new Date(Date.now() + 7 * 86400000).toISOString() : null]
      );
    }

    const topCandidate = body.new_candidates.find(c => c.sort_order === 1);
    if (topCandidate) {
      const engResult = await query(
        `SELECT id FROM tenant_engagements WHERE demand_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1`,
        [demand_id, topCandidate.tenant_id]
      );
      if (engResult.rows.length > 0) {
        await query(
          `INSERT INTO tenant_brief_access_grants (demand_id, tenant_id, engagement_id, brief_access_scope, status)
           VALUES ($1, $2, $3, 'full', 'active')
           ON CONFLICT DO NOTHING`,
          [demand_id, topCandidate.tenant_id, engResult.rows[0].id]
        );
      }
    }

    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['routing', demand_id]);

    await audit({
      actor_id: userId, actor_type: 'system', action: 'routing_reassigned',
      resource_type: 'routing_decision', resource_id: routingRec.id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({
      demand_id,
      reason: body.reason,
      new_candidate_count: body.new_candidates.length,
      reassignment_count: updatedLog.length,
      lifecycle_status: 'routing',
    }));
  });

  // POST /v2/demands/:demand_id/routing/withdraw — 客户撤回路由授权
  app.post('/v2/demands/:demand_id/routing/withdraw', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const userId = req.user?.sub;

    const routing = await query('SELECT id FROM routing_decisions WHERE demand_id = $1 ORDER BY created_at DESC LIMIT 1', [demand_id]);
    if (routing.rows.length === 0) return reply.status(404).send(errorResponse(4040, '未找到路由决策'));

    await query(`UPDATE tenant_brief_access_grants SET status = 'revoked', revoked_at = now() WHERE demand_id = $1 AND status = 'active'`, [demand_id]);
    await query(`UPDATE tenant_engagements SET lifecycle_status = 'expired', row_version = row_version + 1, updated_at = now() WHERE demand_id = $1 AND lifecycle_status NOT IN ('expired')`, [demand_id]);
    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['withdrawn', demand_id]);

    await audit({
      actor_id: userId, actor_type: 'customer', action: 'routing_withdrawn',
      resource_type: 'routing_decision', resource_id: routing.rows[0].id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ demand_id, lifecycle_status: 'withdrawn' }));
  });

  // ================================================================
  // Brief Access Grants
  // ================================================================

  // POST /v2/demands/:demand_id/brief-access — 授予/撤销 Brief 访问权限
  app.post('/v2/demands/:demand_id/brief-access', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const body = req.body;
    const userId = req.user?.sub;

    if (body.action === 'grant') {
      const engResult = await query(
        `SELECT id FROM tenant_engagements WHERE demand_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1`,
        [demand_id, body.tenant_id]
      );
      await query(
        `INSERT INTO tenant_brief_access_grants (demand_id, tenant_id, engagement_id, brief_access_scope, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (demand_id, tenant_id) DO UPDATE SET status = 'active', brief_access_scope = $4, revoked_at = NULL`,
        [demand_id, body.tenant_id, (engResult.rows[0] && engResult.rows[0].id) || null, body.scope || 'full']
      );
      await audit({
        actor_id: userId, actor_type: 'customer', action: 'brief_access_granted',
        resource_type: 'tenant_brief_access_grant', resource_id: demand_id, resource_version: 1,
        result: 'success',
      });
      return reply.send(successResponse({ demand_id, tenant_id: body.tenant_id, status: 'active' }));
    } else {
      await query(
        `UPDATE tenant_brief_access_grants SET status = 'revoked', revoked_at = now() WHERE demand_id = $1 AND tenant_id = $2 AND status = 'active'`,
        [demand_id, body.tenant_id]
      );
      await audit({
        actor_id: userId, actor_type: 'customer', action: 'brief_access_revoked',
        resource_type: 'tenant_brief_access_grant', resource_id: demand_id, resource_version: 1,
        result: 'success',
      });
      return reply.send(successResponse({ demand_id, tenant_id: body.tenant_id, status: 'revoked' }));
    }
  });

  // ---- Health check ----
  app.get('/v2/engagement-routing/health', async (_req, reply) => {
    reply.send({ status: 'ok', module: 'engagement-routing' });
  });
}
