// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · QuoteVersion API
// PRD §14.2: 确定性报价、审批、接受
// PRD §20.3: quote_pending → commercial_confirmation
// ============================================================
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { audit } from '../../core/audit.js';

const createQuoteSchema = z.object({
  total_amount: z.string().max(50),
  currency: z.string().max(10).default('CNY'),
  tax_amount: z.string().max(50).optional(),
  valid_until: z.string().optional(),
  items: z.array(z.object({
    plan_item_id: z.string().uuid().optional(),
    name: z.string().max(200),
    description: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
    unit_price: z.string().max(50),
    total: z.string().max(50),
  })).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  payment_terms: z.array(z.object({
    node_name: z.string().max(100),
    percentage: z.number().min(0).max(100).optional(),
    amount: z.string().max(50).optional(),
    trigger: z.string().max(200).optional(),
    due_days: z.number().int().min(0).optional(),
  })).optional(),
  cancellation_rules: z.record(z.unknown()).optional(),
  refund_rules: z.record(z.unknown()).optional(),
  change_rules: z.record(z.unknown()).optional(),
});

const approveQuoteSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().max(2000).optional(),
});

const acceptQuoteSchema = z.object({
  accept: z.literal(true),
  notes: z.string().max(2000).optional(),
});

export async function quoteV2Routes(app: FastifyInstance) {

  // POST /v2/projects/:project_id/quotes — 创建报价版本
  app.post('/v2/projects/:project_id/quotes', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const body = createQuoteSchema.parse(req.body);
    const userId = req.user?.sub;
    const tenantId = req.user?.tenant_id;

    const project = await query('SELECT id, main_tenant_id FROM activity_projects WHERE id = $1', [project_id]);
    if (project.rows.length === 0) return reply.status(404).send(errorResponse(4040, '项目不存在'));

    const seqResult = await query('SELECT COALESCE(MAX(version_number),0)+1 AS seq FROM quote_versions WHERE project_id = $1', [project_id]);
    const versionNumber = Number(seqResult.rows[0].seq);

    const result = await query(
      `INSERT INTO quote_versions (project_id, tenant_id, version_number, total_amount, currency, tax_amount, valid_until, items, includes, excludes, payment_terms, cancellation_rules, refund_rules, change_rules, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'draft') RETURNING *`,
      [project_id, tenantId || project.rows[0].main_tenant_id, versionNumber,
       body.total_amount, body.currency, body.tax_amount || null, body.valid_until || null,
       JSON.stringify(body.items || []), JSON.stringify(body.includes || []), JSON.stringify(body.excludes || []),
       JSON.stringify(body.payment_terms || []), JSON.stringify(body.cancellation_rules || {}),
       JSON.stringify(body.refund_rules || {}), JSON.stringify(body.change_rules || {})]
    );
    const quote = result.rows[0];

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'quote_version', resource_id: quote.id, resource_version: quote.row_version,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: quote.id,
      project_id: quote.project_id,
      version_number: quote.version_number,
      total_amount: quote.total_amount,
      currency: quote.currency,
      status: quote.status,
      valid_until: quote.valid_until,
      created_at: quote.created_at,
    }));
  });

  // GET /v2/projects/:project_id/quotes — 获取报价版本列表
  app.get('/v2/projects/:project_id/quotes', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const result = await query(
      `SELECT id, project_id, version_number, total_amount, currency, status, valid_until, approved_by, approved_at, accepted_by, accepted_at, row_version, created_at, updated_at
       FROM quote_versions WHERE project_id = $1 ORDER BY version_number DESC`,
      [project_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // GET /v2/quotes/:quote_id — 获取报价详情
  app.get('/v2/quotes/:quote_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { quote_id } = req.params;
    const result = await query('SELECT * FROM quote_versions WHERE id = $1', [quote_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '报价不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // POST /v2/quotes/:quote_id/submit-approval — 提交审批
  app.post('/v2/quotes/:quote_id/submit-approval', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { quote_id } = req.params;

    const result = await query('SELECT * FROM quote_versions WHERE id = $1', [quote_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '报价不存在'));
    if (result.rows[0].status !== 'draft') return reply.status(409).send(errorResponse(4092, '只有草稿报价可提交审批'));

    await query(`UPDATE quote_versions SET status = 'pending_review', row_version = row_version + 1, updated_at = now() WHERE id = $1`, [quote_id]);

    return reply.send(successResponse({ id: quote_id, status: 'pending_review' }));
  });

  // POST /v2/quotes/:quote_id/approve — 审批报价 (PRD §14.2: 正式报价需要有权限人员审批)
  app.post('/v2/quotes/:quote_id/approve', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { quote_id } = req.params;
    const body = approveQuoteSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM quote_versions WHERE id = $1', [quote_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '报价不存在'));
    if (result.rows[0].status !== 'pending_review') return reply.status(409).send(errorResponse(4092, '只有待审批报价可操作'));

    const newStatus = body.decision === 'approved' ? 'approved' : 'rejected';
    await query(
      `UPDATE quote_versions SET status = $1, approved_by = $2, approved_at = now(), row_version = row_version + 1, updated_at = now() WHERE id = $3`,
      [newStatus, userId, quote_id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'quote_version', resource_id: quote_id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id: quote_id, status: newStatus }));
  });

  // POST /v2/quotes/:quote_id/send — 发送报价给客户
  app.post('/v2/quotes/:quote_id/send', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { quote_id } = req.params;

    const result = await query('SELECT * FROM quote_versions WHERE id = $1', [quote_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '报价不存在'));
    if (result.rows[0].status !== 'approved') return reply.status(409).send(errorResponse(4092, '只有已审批报价可发送'));

    await query(`UPDATE quote_versions SET status = 'sent', row_version = row_version + 1, updated_at = now() WHERE id = $1`, [quote_id]);

    // 更新项目状态为 quote_pending
    const projectResult = await query(
      `UPDATE activity_projects SET lifecycle_status = 'quote_pending', row_version = row_version + 1, updated_at = now() WHERE id = $1 AND lifecycle_status NOT IN ('completed','cancelled','disputed')`,
      [result.rows[0].project_id]
    );

    await audit({
      actor_id: result.rows[0].approved_by, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'quote_version', resource_id: quote_id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id: quote_id, status: 'sent' }));
  });

  // POST /v2/quotes/:quote_id/accept — 客户接受报价 (PRD §14.2: 接受后不自动等于合同成立)
  app.post('/v2/quotes/:quote_id/accept', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { quote_id } = req.params;
    const body = acceptQuoteSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM quote_versions WHERE id = $1', [quote_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '报价不存在'));
    if (result.rows[0].status !== 'sent') return reply.status(409).send(errorResponse(4092, '只有已发送报价可接受'));

    // 检查有效期
    if (result.rows[0].valid_until) {
      const validUntil = new Date(result.rows[0].valid_until);
      if (validUntil < new Date()) return reply.status(409).send(errorResponse(4094, '报价已过期'));
    }

    await query(
      `UPDATE quote_versions SET status = 'accepted', accepted_by = $1, accepted_at = now(), row_version = row_version + 1, updated_at = now() WHERE id = $2`,
      [userId, quote_id]
    );

    // 更新项目状态为 commercial_confirmation (PRD §20.3)
    await query(
      `UPDATE activity_projects SET lifecycle_status = 'commercial_confirmation', row_version = row_version + 1, updated_at = now() WHERE id = $1`,
      [result.rows[0].project_id]
    );

    await audit({
      actor_id: userId, actor_type: 'customer', action: 'operation',
      resource_type: 'quote_version', resource_id: quote_id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({
      id: quote_id,
      status: 'accepted',
      project_status: 'commercial_confirmation',
      // PRD §14.2: 报价被接受后只表示商业意向确认
      non_commitment_notice: '报价接受表示商业意向确认，不自动等于合同成立、付款到账或演员锁定',
    }));
  });

  // POST /v2/quotes/:quote_id/reject — 客户拒绝报价
  app.post('/v2/quotes/:quote_id/reject', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { quote_id } = req.params;
    const body = req.body as { reason?: string };
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM quote_versions WHERE id = $1', [quote_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '报价不存在'));
    if (!['sent', 'draft', 'pending_review', 'approved'].includes(result.rows[0].status)) {
      return reply.status(409).send(errorResponse(4092, '该状态报价不可拒绝'));
    }

    await query(
      `UPDATE quote_versions SET status = 'rejected', row_version = row_version + 1, updated_at = now() WHERE id = $1`,
      [quote_id]
    );

    await audit({
      actor_id: userId, actor_type: 'customer', action: 'operation',
      resource_type: 'quote_version', resource_id: quote_id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id: quote_id, status: 'rejected' }));
  });

  // ---- Health check ----
  app.get('/v2/quote/health', async (_req, reply) => {
    reply.send({ status: 'ok', module: 'quote' });
  });
}
