// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · FulfillmentCollaboration + 内部报价/凭证/应付 API
// PRD §13.13: 邀请制模块协作, 候选期 feasibility_check vs 正式 confirmed_fulfillment
// PRD §14.14-16: 内部报价/凭证/应付隔离
// ============================================================
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { audit } from '../../core/audit.js';

// ---- Zod schemas ----

const createCollaborationSchema = z.object({
  invited_party_type: z.enum(['tenant', 'independent_actor', 'external']),
  invited_party_id: z.string().max(100),
  purpose: z.enum(['feasibility_check', 'confirmed_fulfillment']).default('feasibility_check'),
  shared_brief_scope: z.record(z.unknown()).optional(),
});

const respondCollaborationSchema = z.object({
  decision: z.enum(['accepted', 'declined', 'request_supplement']),
  notes: z.string().max(2000).optional(),
});

const createInternalQuoteSchema = z.object({
  scope: z.string().optional(),
  amount: z.string().max(50),
  conditions: z.record(z.unknown()).optional(),
});

const submitInternalQuoteSchema = z.object({
  version_number: z.number().int().min(1),
});

const createInternalCredentialSchema = z.object({
  plan_item_ids: z.array(z.string().uuid()).optional(),
  terms: z.record(z.unknown()).optional(),
});

const createPayableSchema = z.object({
  amount: z.string().max(50),
});

const declarePayableSchema = z.object({
  role: z.enum(['payer', 'payee']),
  amount: z.string().max(50).optional(),
  evidence: z.string().optional(),
});

export async function collaborationRoutes(app: FastifyInstance) {

  // ================================================================
  // FulfillmentCollaboration
  // ================================================================

  // POST /v2/projects/:project_id/collaborations — 发起协作邀请
  app.post('/v2/projects/:project_id/collaborations', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const body = createCollaborationSchema.parse(req.body);
    const userId = req.user?.sub;
    const tenantId = req.user?.tenant_id;

    const project = await query('SELECT id, main_tenant_id FROM activity_projects WHERE id = $1', [project_id]);
    if (project.rows.length === 0) return reply.status(404).send(errorResponse(4040, '项目不存在'));

    // 只有主 Tenant 可以发起协作
    const inviterTenantId = tenantId || project.rows[0].main_tenant_id;

    // PRD §13.13: feasibility_check 只能停留在 draft/invited/negotiating
    if (body.purpose === 'confirmed_fulfillment') {
      const msaResult = await query(
        "SELECT id FROM main_service_assignments WHERE lifecycle_status = 'active' AND tenant_id = $1",
        [inviterTenantId]
      );
      if (msaResult.rows.length === 0) {
        return reply.status(409).send(errorResponse(4092, 'confirmed_fulfillment 需要 active 主服务分配'));
      }
    }

    const result = await query(
      `INSERT INTO fulfillment_collaborations (project_id, inviting_tenant_id, invited_party_type, invited_party_id, purpose, status, shared_brief_scope)
       VALUES ($1, $2, $3, $4, $5, 'invited', $6) RETURNING *`,
      [project_id, inviterTenantId, body.invited_party_type, body.invited_party_id, body.purpose, JSON.stringify(body.shared_brief_scope || {})]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'fulfillment_collaboration', resource_id: result.rows[0].id, resource_version: 1,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: result.rows[0].id,
      project_id,
      purpose: body.purpose,
      status: 'invited',
      invited_party_type: body.invited_party_type,
      created_at: result.rows[0].created_at,
    }));
  });

  // GET /v2/projects/:project_id/collaborations — 获取项目协作列表
  app.get('/v2/projects/:project_id/collaborations', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const result = await query(
      `SELECT * FROM fulfillment_collaborations WHERE project_id = $1 ORDER BY created_at DESC`,
      [project_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // PATCH /v2/collaborations/:id/respond — 协作方响应邀请
  app.patch('/v2/collaborations/:id/respond', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = respondCollaborationSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM fulfillment_collaborations WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '协作邀请不存在'));

    const collab = result.rows[0];
    if (!['invited', 'negotiating'].includes(collab.status)) {
      return reply.status(409).send(errorResponse(4092, `当前状态 ${collab.status} 不可响应`));
    }

    const newStatus = body.decision === 'accepted' ? 'negotiating' :
                      body.decision === 'declined' ? 'declined' : 'negotiating';

    await query(
      `UPDATE fulfillment_collaborations SET status = $1, updated_at = now() WHERE id = $2`,
      [newStatus, id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'fulfillment_collaboration', resource_id: id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id, status: newStatus }));
  });

  // POST /v2/collaborations/:id/confirm — 确认正式协作（需 active MSA）
  app.post('/v2/collaborations/:id/confirm', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM fulfillment_collaborations WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '协作邀请不存在'));
    if (result.rows[0].purpose !== 'feasibility_check' && result.rows[0].status !== 'negotiating') {
      return reply.status(409).send(errorResponse(4092, '确认协作需要经过候选协商阶段'));
    }

    await query(
      `UPDATE fulfillment_collaborations SET purpose = 'confirmed_fulfillment', status = 'confirmed', updated_at = now() WHERE id = $1`,
      [id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'fulfillment_collaboration', resource_id: id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id, purpose: 'confirmed_fulfillment', status: 'confirmed' }));
  });

  // ================================================================
  // CollaborationQuoteVersion (内部报价)
  // ================================================================

  // POST /v2/collaborations/:id/quotes — 创建内部报价
  app.post('/v2/collaborations/:id/quotes', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id: collabId } = req.params;
    const body = createInternalQuoteSchema.parse(req.body);
    const userId = req.user?.sub;

    const collabResult = await query('SELECT * FROM fulfillment_collaborations WHERE id = $1', [collabId]);
    if (collabResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '协作记录不存在'));

    const seqResult = await query('SELECT COALESCE(MAX(version_number),0)+1 AS seq FROM collaboration_quote_versions WHERE collaboration_id = $1', [collabId]);

    const result = await query(
      `INSERT INTO collaboration_quote_versions (collaboration_id, version_number, scope, amount, conditions, status)
       VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING *`,
      [collabId, Number(seqResult.rows[0].seq), body.scope || null, body.amount, JSON.stringify(body.conditions || {})]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'collaboration_quote', resource_id: result.rows[0].id, resource_version: 1,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: result.rows[0].id,
      collaboration_id: collabId,
      version_number: result.rows[0].version_number,
      amount: result.rows[0].amount,
      status: 'draft',
    }));
  });

  // GET /v2/collaborations/:id/quotes — 获取内部报价列表
  app.get('/v2/collaborations/:id/quotes', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id: collabId } = req.params;
    const result = await query(
      `SELECT * FROM collaboration_quote_versions WHERE collaboration_id = $1 ORDER BY version_number DESC`,
      [collabId]
    );
    return reply.send(successResponse(result.rows));
  });

  // POST /v2/collaboration-quotes/:id/submit — 提交内部报价
  app.post('/v2/collaboration-quotes/:id/submit', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    await query(`UPDATE collaboration_quote_versions SET status = 'submitted' WHERE id = $1 AND status = 'draft'`, [id]);
    return reply.send(successResponse({ id, status: 'submitted' }));
  });

  // POST /v2/collaboration-quotes/:id/accept — 接受内部报价
  app.post('/v2/collaboration-quotes/:id/accept', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    await query(`UPDATE collaboration_quote_versions SET status = 'accepted' WHERE id = $1 AND status = 'submitted'`, [id]);
    return reply.send(successResponse({ id, status: 'accepted' }));
  });

  // ================================================================
  // InternalFulfillmentCredential (内部凭证)
  // ================================================================

  // POST /v2/collaborations/:id/credentials — 创建内部凭证
  app.post('/v2/collaborations/:id/credentials', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id: collabId } = req.params;
    const body = createInternalCredentialSchema.parse(req.body);
    const userId = req.user?.sub;

    const collabResult = await query(
      "SELECT * FROM fulfillment_collaborations WHERE id = $1 AND purpose = 'confirmed_fulfillment'",
      [collabId]
    );
    if (collabResult.rows.length === 0) return reply.status(409).send(errorResponse(4092, '内部凭证仅对已确认的正式协作可用'));

    const result = await query(
      `INSERT INTO internal_fulfillment_credentials (collaboration_id, plan_item_ids, terms, status)
       VALUES ($1, $2, $3, 'draft') RETURNING *`,
      [collabId, JSON.stringify(body.plan_item_ids || []), JSON.stringify(body.terms || {})]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'internal_fulfillment_credential', resource_id: result.rows[0].id, resource_version: 1,
      result: 'success',
    });

    return reply.status(201).send(successResponse({ id: result.rows[0].id, status: 'draft' }));
  });

  // POST /v2/internal-credentials/:id/confirm — 双方确认内部凭证
  app.post('/v2/internal-credentials/:id/confirm', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    await query(`UPDATE internal_fulfillment_credentials SET status = 'effective', updated_at = now() WHERE id = $1 AND status = 'draft'`, [id]);
    return reply.send(successResponse({ id, status: 'effective' }));
  });

  // ================================================================
  // CollaborationPayable (内部应付)
  // ================================================================

  // POST /v2/collaborations/:id/payables — 创建内部应付
  app.post('/v2/collaborations/:id/payables', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id: collabId } = req.params;
    const body = createPayableSchema.parse(req.body);

    const result = await query(
      `INSERT INTO collaboration_payables (collaboration_id, amount, status)
       VALUES ($1, $2, 'planned') RETURNING *`,
      [collabId, body.amount]
    );

    return reply.status(201).send(successResponse({ id: result.rows[0].id, amount: result.rows[0].amount, status: 'planned' }));
  });

  // GET /v2/collaborations/:id/payables — 获取内部应付列表
  app.get('/v2/collaborations/:id/payables', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id: collabId } = req.params;
    const result = await query(
      `SELECT * FROM collaboration_payables WHERE collaboration_id = $1 ORDER BY created_at DESC`,
      [collabId]
    );
    return reply.send(successResponse(result.rows));
  });

  // PATCH /v2/payables/:id/declare — 声明付款/收款
  app.patch('/v2/payables/:id/declare', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const body = declarePayableSchema.parse(req.body);
    const userId = req.user?.sub;

    if (body.role === 'payer') {
      await query(
        `UPDATE collaboration_payables SET payer_declaration = $1, updated_at = now() WHERE id = $2`,
        [JSON.stringify({ declared_by: userId, declared_at: new Date().toISOString(), amount: body.amount, evidence: body.evidence }), id]
      );
    } else {
      await query(
        `UPDATE collaboration_payables SET payee_declaration = $1, updated_at = now() WHERE id = $2`,
        [JSON.stringify({ declared_by: userId, declared_at: new Date().toISOString(), amount: body.amount, evidence: body.evidence }), id]
      );
    }

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'collaboration_payable', resource_id: id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id, role: body.role, status: 'declared' }));
  });

  // ---- Health check ----
  app.get('/v2/collaboration/health', async (_req, reply) => {
    reply.send({ status: 'ok', module: 'collaboration' });
  });
}
