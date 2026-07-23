// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · PlanVersion + PlanItem API
// PRD §6.4, §20.3-20.4: 方案版本与交付快照
// PRD §14.12: ChangeRequest 变更流程
// ============================================================
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { audit } from '../../core/audit.js';

// ---- Zod schemas ----

const createProjectSchema = z.object({
  title: z.string().max(300).optional(),
  display_code: z.string().max(50).optional(),
  main_tenant_id: z.string().uuid(),
  demand_id: z.string().uuid(),
  msa_id: z.string().uuid(),
});

const createPlanSchema = z.object({
  title: z.string().max(300).optional(),
  overall_goal: z.string().optional(),
  offering_snapshot: z.record(z.unknown()).optional(),
});

const createPlanItemSchema = z.object({
  source_snapshot: z.object({
    root_type: z.enum(['program_module_version', 'service_offering_version']),
    root_id: z.string().uuid(),
    version_id: z.string().uuid().optional(),
  }),
  responsible_party_id: z.string(),
  responsible_party_type: z.string().max(30),
  name: z.string().max(200).optional(),
  target_duration_minutes: z.number().int().min(1).optional(),
  sequence_order: z.number().int().min(0).default(0),
});

const updateItemStatusSchema = z.object({
  axis: z.enum(['resource_status', 'schedule_status', 'commercial_status', 'fulfillment_status']),
  status: z.string().max(30),
  notes: z.string().max(2000).optional(),
});

const createChangeRequestSchema = z.object({
  title: z.string().max(300),
  reason: z.string().max(2000),
  affected_objects: z.array(z.object({
    object_type: z.string(),
    object_id: z.string(),
  })).optional(),
  impact_summary: z.string().max(2000).optional(),
});

const approveChangeRequestSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().max(2000).optional(),
});

// ---- Valid PlanItem status values per PRD §20.4 ----
const VALID_ITEM_STATUSES: Record<string, string[]> = {
  resource_status: ['proposed', 'checking', 'confirmed_available', 'held', 'locked', 'released', 'replaced', 'conflicted'],
  schedule_status: ['unknown', 'requested', 'available', 'conditional', 'unavailable', 'held', 'confirmed', 'expired'],
  commercial_status: ['not_requested', 'internal_quoting', 'cost_confirmed', 'included_in_customer_quote', 'changed', 'disputed'],
  fulfillment_status: ['planned', 'preparing', 'ready', 'performing', 'fulfilled', 'accepted', 'issue_open', 'remediating', 'cancelled', 'disputed'],
};

// ---- Valid ActivityProject lifecycle per PRD §20.3 ----
const VALID_PROJECT_TRANSITIONS: Record<string, string[]> = {
  briefing: ['planning', 'cancelled'],
  planning: ['decision_pending', 'cancelled'],
  decision_pending: ['quote_pending', 'briefing', 'cancelled', 'disputed'],
  quote_pending: ['commercial_confirmation', 'cancelled'],
  commercial_confirmation: ['funding_and_preparation', 'cancelled', 'disputed'],
  funding_and_preparation: ['confirmed', 'cancelled'],
  confirmed: ['executing', 'cancelled'],
  executing: ['completed', 'cancelled', 'disputed'],
  completed: ['disputed'],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
};

function canTransitionProject(current: string, target: string): boolean {
  return (VALID_PROJECT_TRANSITIONS[current] || []).includes(target);
}

export async function planRoutes(app: FastifyInstance) {

  // ================================================================
  // ActivityProject
  // ================================================================

  // POST /v2/projects — 创建 ActivityProject（MSA 激活时原子创建）
  app.post('/v2/projects', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createProjectSchema.parse(req.body);
    const userId = req.user?.sub;

    const demandResult = await query('SELECT id FROM v72_demands WHERE id = $1', [body.demand_id]);
    if (demandResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '需求不存在'));

    const msaResult = await query(
      "SELECT id, lifecycle_status, customer_decision, tenant_decision FROM main_service_assignments WHERE id = $1",
      [body.msa_id]
    );
    if (msaResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'MSA 记录不存在'));
    const msa = msaResult.rows[0];
    if (msa.lifecycle_status !== 'proposed' && msa.lifecycle_status !== 'pending_dual_confirmation') {
      return reply.status(409).send(errorResponse(4092, 'MSA 未处于可激活状态'));
    }
    if (msa.customer_decision !== 'selected' || msa.tenant_decision !== 'accepted') {
      return reply.status(409).send(errorResponse(4092, '客户或 Tenant 尚未确认'));
    }

    // 检查是否已有活跃项目
    const existingProject = await query(
      "SELECT id FROM activity_projects WHERE demand_id = $1 AND lifecycle_status NOT IN ('completed','cancelled','disputed')",
      [body.demand_id]
    );
    if (existingProject.rows.length > 0) return reply.status(409).send(errorResponse(4092, '该需求已有活跃的活动项目'));

    const displayCode = body.display_code || `PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

    const result = await query(
      `INSERT INTO activity_projects (demand_id, msa_id, main_tenant_id, display_code, title, lifecycle_status)
       VALUES ($1, $2, $3, $4, $5, 'briefing') RETURNING *`,
      [body.demand_id, body.msa_id, body.main_tenant_id, displayCode, body.title || null]
    );
    const project = result.rows[0];

    // 激活 MSA
    await query(
      "UPDATE main_service_assignments SET lifecycle_status = 'active', activated_at = now(), row_version = row_version + 1, updated_at = now() WHERE id = $1",
      [body.msa_id]
    );

    await audit({
      actor_id: userId, actor_type: 'system', action: 'state_transition',
      resource_type: 'activity_project', resource_id: project.id, resource_version: project.row_version,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: project.id,
      display_code: project.display_code,
      title: project.title,
      lifecycle_status: project.lifecycle_status,
      main_tenant_id: project.main_tenant_id,
      demand_id: project.demand_id,
      msa_id: project.msa_id,
      created_at: project.created_at,
    }));
  });

  // GET /v2/projects/:project_id — 获取项目详情
  app.get('/v2/projects/:project_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const result = await query(
      `SELECT id, demand_id, msa_id, main_tenant_id, display_code, title, lifecycle_status, customer_notes, tenant_notes, row_version, created_at, updated_at
       FROM activity_projects WHERE id = $1`,
      [project_id]
    );
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '项目不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // POST /v2/projects/:project_id/change-status — 项目状态迁移
  app.post('/v2/projects/:project_id/change-status', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const { status } = req.body;
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM activity_projects WHERE id = $1', [project_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '项目不存在'));
    const project = result.rows[0];

    if (!canTransitionProject(project.lifecycle_status, status)) {
      return reply.status(409).send(errorResponse(4092,
        `无法从 ${project.lifecycle_status} 转换到 ${status}`));
    }

    const updated = await query(
      `UPDATE activity_projects SET lifecycle_status = $1, row_version = row_version + 1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, project_id]
    );

    await audit({
      actor_id: userId, actor_type: 'system', action: 'state_transition',
      resource_type: 'activity_project', resource_id: project_id, resource_version: updated.rows[0].row_version,
      result: 'success',
    });

    return reply.send(successResponse({ id: updated.rows[0].id, lifecycle_status: updated.rows[0].lifecycle_status }));
  });

  // ================================================================
  // PlanVersion
  // ================================================================

  // POST /v2/projects/:project_id/plans — 创建方案版本
  app.post('/v2/projects/:project_id/plans', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const body = createPlanSchema.parse(req.body);
    const userId = req.user?.sub;

    const projectResult = await query('SELECT id FROM activity_projects WHERE id = $1', [project_id]);
    if (projectResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '项目不存在'));

    const seqResult = await query('SELECT COALESCE(MAX(version_number),0)+1 AS seq FROM plan_versions WHERE project_id = $1', [project_id]);
    const versionNumber = Number(seqResult.rows[0].seq);

    const result = await query(
      `INSERT INTO plan_versions (project_id, version_number, title, overall_goal, offering_snapshot, status)
       VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING *`,
      [project_id, versionNumber, body.title || null, body.overall_goal || null, JSON.stringify(body.offering_snapshot || {})]
    );
    const plan = result.rows[0];

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'plan_version', resource_id: plan.id, resource_version: plan.row_version,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: plan.id,
      project_id: plan.project_id,
      version_number: plan.version_number,
      title: plan.title,
      status: plan.status,
      created_at: plan.created_at,
    }));
  });

  // GET /v2/projects/:project_id/plans — 获取方案的版本列表
  app.get('/v2/projects/:project_id/plans', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const result = await query(
      `SELECT id, project_id, version_number, title, overall_goal, status, row_version, created_at, updated_at
       FROM plan_versions WHERE project_id = $1 ORDER BY version_number DESC`,
      [project_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // GET /v2/plans/:plan_id — 获取方案版本详情
  app.get('/v2/plans/:plan_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { plan_id } = req.params;
    const result = await query(
      `SELECT * FROM plan_versions WHERE id = $1`,
      [plan_id]
    );
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '方案版本不存在'));
    const plan = result.rows[0];

    // 查询关联 PlanItem
    const items = await query(
      `SELECT * FROM plan_items WHERE plan_version_id = $1 ORDER BY sequence_order`,
      [plan_id]
    );
    plan.plan_items = items.rows;

    return reply.send(successResponse(plan));
  });

  // POST /v2/plans/:plan_id/submit-review — 提交方案审核
  app.post('/v2/plans/:plan_id/submit-review', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { plan_id } = req.params;
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM plan_versions WHERE id = $1', [plan_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '方案版本不存在'));
    if (result.rows[0].status !== 'draft') return reply.status(409).send(errorResponse(4092, '只有草稿状态可提交审核'));

    const updated = await query(
      `UPDATE plan_versions SET status = 'pending_review', row_version = row_version + 1, updated_at = now() WHERE id = $1 RETURNING *`,
      [plan_id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'plan_version', resource_id: plan_id, resource_version: updated.rows[0].row_version,
      result: 'success',
    });

    return reply.send(successResponse({ id: plan_id, status: 'pending_review' }));
  });

  // POST /v2/plans/:plan_id/review — 审核方案
  app.post('/v2/plans/:plan_id/review', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { plan_id } = req.params;
    const body = req.body as { decision: 'approved' | 'rejected'; notes?: string };
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM plan_versions WHERE id = $1', [plan_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '方案版本不存在'));
    if (result.rows[0].status !== 'pending_review') return reply.status(409).send(errorResponse(4092, '只有待审核状态可进行审核'));

    const newStatus = body.decision === 'approved' ? 'approved' : 'rejected';
    const updated = await query(
      `UPDATE plan_versions SET status = $1, row_version = row_version + 1, updated_at = now() WHERE id = $2 RETURNING *`,
      [newStatus, plan_id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'plan_version', resource_id: plan_id, resource_version: updated.rows[0].row_version,
      result: 'success',
    });

    return reply.send(successResponse({ id: plan_id, status: newStatus }));
  });

  // ================================================================
  // PlanItem
  // ================================================================

  // POST /v2/plans/:plan_id/items — 创建 PlanItem
  app.post('/v2/plans/:plan_id/items', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { plan_id } = req.params;
    const body = createPlanItemSchema.parse(req.body);
    const userId = req.user?.sub;

    const planResult = await query('SELECT project_id FROM plan_versions WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '方案版本不存在'));

    const result = await query(
      `INSERT INTO plan_items (plan_version_id, project_id, source_snapshot, responsible_party_id, responsible_party_type, name, target_duration_minutes, sequence_order, resource_status, schedule_status, commercial_status, fulfillment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'proposed', 'unknown', 'not_requested', 'planned') RETURNING *`,
      [plan_id, planResult.rows[0].project_id,
       JSON.stringify(body.source_snapshot), body.responsible_party_id, body.responsible_party_type,
       body.name || null, body.target_duration_minutes || null, body.sequence_order]
    );
    const item = result.rows[0];

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'plan_item', resource_id: item.id, resource_version: 1,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: item.id,
      plan_version_id: item.plan_version_id,
      project_id: item.project_id,
      source_snapshot: item.source_snapshot,
      responsible_party_id: item.responsible_party_id,
      name: item.name,
      resource_status: item.resource_status,
      schedule_status: item.schedule_status,
      commercial_status: item.commercial_status,
      fulfillment_status: item.fulfillment_status,
      created_at: item.created_at,
    }));
  });

  // GET /v2/plans/:plan_id/items — 获取方案的 PlanItem 列表
  app.get('/v2/plans/:plan_id/items', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { plan_id } = req.params;
    const result = await query(
      `SELECT id, plan_version_id, project_id, source_snapshot, responsible_party_id, responsible_party_type, name, target_duration_minutes, sequence_order, resource_status, schedule_status, commercial_status, fulfillment_status, row_version, created_at, updated_at
       FROM plan_items WHERE plan_version_id = $1 ORDER BY sequence_order`,
      [plan_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // PATCH /v2/plan-items/:item_id/status — 更新 PlanItem 状态（四维正交）
  app.patch('/v2/plan-items/:item_id/status', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { item_id } = req.params;
    const body = updateItemStatusSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM plan_items WHERE id = $1', [item_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'PlanItem 不存在'));
    const item = result.rows[0];

    const allowedStatuses = VALID_ITEM_STATUSES[body.axis];
    if (!allowedStatuses || !allowedStatuses.includes(body.status)) {
      return reply.status(400).send(errorResponse(4001, `无效的 ${body.axis} 状态值: ${body.status}`));
    }

    const updated = await query(
      `UPDATE plan_items SET ${body.axis} = $1, row_version = row_version + 1, updated_at = now() WHERE id = $2 RETURNING *`,
      [body.status, item_id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'operation',
      resource_type: 'plan_item', resource_id: item_id, resource_version: updated.rows[0].row_version,
      result: 'success',
    });

    return reply.send(successResponse({
      id: item_id,
      [body.axis]: body.status,
      notes: body.notes || null,
    }));
  });

  // ================================================================
  // ChangeRequest
  // ================================================================

  // POST /v2/projects/:project_id/change-requests — 创建变更请求
  app.post('/v2/projects/:project_id/change-requests', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const body = createChangeRequestSchema.parse(req.body);
    const userId = req.user?.sub;

    const projectResult = await query('SELECT id FROM activity_projects WHERE id = $1', [project_id]);
    if (projectResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, '项目不存在'));

    const result = await query(
      `INSERT INTO change_requests (project_id, title, reason, affected_objects, impact_summary, status, requested_by)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6) RETURNING *`,
      [project_id, body.title, body.reason,
       JSON.stringify(body.affected_objects || []), body.impact_summary || null, userId]
    );
    const cr = result.rows[0];

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'change',
      resource_type: 'change_request', resource_id: cr.id, resource_version: cr.row_version,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: cr.id,
      project_id: cr.project_id,
      title: cr.title,
      status: cr.status,
      created_at: cr.created_at,
    }));
  });

  // GET /v2/projects/:project_id/change-requests — 获取变更请求列表
  app.get('/v2/projects/:project_id/change-requests', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { project_id } = req.params;
    const result = await query(
      `SELECT * FROM change_requests WHERE project_id = $1 ORDER BY created_at DESC`,
      [project_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // POST /v2/change-requests/:cr_id/submit — 提交变更申请
  app.post('/v2/change-requests/:cr_id/submit', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { cr_id } = req.params;
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM change_requests WHERE id = $1', [cr_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '变更请求不存在'));
    if (result.rows[0].status !== 'draft') return reply.status(409).send(errorResponse(4092, '只有草稿状态可提交'));

    await query(
      `UPDATE change_requests SET status = 'pending_approval', row_version = row_version + 1, updated_at = now() WHERE id = $1`,
      [cr_id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'change',
      resource_type: 'change_request', resource_id: cr_id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id: cr_id, status: 'pending_approval' }));
  });

  // POST /v2/change-requests/:cr_id/approve — 审批变更
  app.post('/v2/change-requests/:cr_id/approve', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { cr_id } = req.params;
    const body = approveChangeRequestSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await query('SELECT * FROM change_requests WHERE id = $1', [cr_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '变更请求不存在'));
    if (result.rows[0].status !== 'pending_approval') return reply.status(409).send(errorResponse(4092, '只有待审批状态可进行操作'));

    const newStatus = body.decision === 'approved' ? 'approved' : 'rejected';
    await query(
      `UPDATE change_requests SET status = $1, approved_by = $2, approved_at = now(), row_version = row_version + 1, updated_at = now() WHERE id = $3`,
      [newStatus, userId, cr_id]
    );

    await audit({
      actor_id: userId, actor_type: 'tenant_admin', action: 'change',
      resource_type: 'change_request', resource_id: cr_id, resource_version: 1,
      result: 'success',
    });

    return reply.send(successResponse({ id: cr_id, status: newStatus }));
  });

  // ---- Health check ----
  app.get('/v2/plan/health', async (_req, reply) => {
    reply.send({ status: 'ok', module: 'plan' });
  });
}
