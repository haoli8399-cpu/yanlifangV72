// ============================================================
// V4.7 线索管理 API — 线索 CRUD / 列表 / 转方案
// POST /v1/leads | GET /v1/leads | GET /v1/leads/:id |
// PATCH /v1/leads/:id | POST /v1/leads/:id/convert
// P0 Mock 模式：不连接真实数据库，全部使用 Mock 数据
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  normalizePagination,
} from '../utils/response.js';
import { mockLeads, mockToolResults, mockProposals } from '../mock/v47-data.js';

// ============================================================
// Zod Schemas
// ============================================================

const idParamSchema = z.object({ id: z.string() });

const toolTypeEnum = z.enum(['budget_calculator', 'insurance_plan', 'annual_plan']);

const statusEnum = z.enum(['new', 'contacted', 'proposal_sent', 'viewed', 'won', 'lost']);
const priorityEnum = z.enum(['high', 'medium', 'low']);

const listQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assigned_to: z.string().optional(),
  tool_type: toolTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const createBodySchema = z.object({
  tool_type: toolTypeEnum,
  tool_result_id: z.string().optional(),
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  wechat: z.string().optional(),
});

const updateBodySchema = z.object({
  status: statusEnum.optional(),
  assigned_to: z.string().optional(),
  priority: priorityEnum.optional(),
  notes: z.string().optional(),
});

// ============================================================
// Routes
// ============================================================

export default async function leadRoutes(app: FastifyInstance) {

  // POST /v1/leads — 创建线索（留资后）
  app.post('/', {
    preHandler: [validate({ body: createBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { tool_type, tool_result_id: _toolResultId, name, company, phone, wechat } = createBodySchema.parse(req.body);

    // Mock: 创建新线索
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const score = Math.floor(50 + Math.random() * 45); // 50-95

    const mockLead = {
      id: leadId,
      tool_type,
      source_channel: 'direct',
      source_user: null,
      answers: {},
      ai_result_summary: null,
      ai_result_json: {},
      score,
      priority: score >= 75 ? 'high' as const : score >= 60 ? 'medium' as const : 'low' as const,
      status: 'new' as const,
      assigned_to: null,
      customer_name: name || null,
      company: company || null,
      phone: phone || null,
      wechat: wechat || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return reply.status(201).send(successResponse({
      lead_id: leadId,
      score,
      priority: mockLead.priority,
    }, '线索已创建'));
  });

  // GET /v1/leads — 线索列表（CRM）
  app.get('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { status, priority, assigned_to, tool_type, page, pageSize } = listQuerySchema.parse(req.query);
    const { offset } = normalizePagination(page, pageSize);

    // Mock: 过滤
    let filtered = [...mockLeads];
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (priority) filtered = filtered.filter((l) => l.priority === priority);
    if (assigned_to) filtered = filtered.filter((l) => l.assigned_to === assigned_to);
    if (tool_type) filtered = filtered.filter((l) => l.tool_type === tool_type);

    // 按创建时间倒序
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    const data = filtered.slice(offset, offset + pageSize);

    return reply.send(paginatedResponse(data, total, page, pageSize));
  });

  // GET /v1/leads/:id — 线索详情
  app.get('/:id', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    const lead = mockLeads.find((l) => l.id === id);
    if (!lead) {
      return reply.status(404).send(errorResponse(9101, '线索不存在'));
    }

    // 查找关联的工具结果
    const toolResult = mockToolResults.find((t) => t.lead_id === id) || null;

    // 查找关联的方案
    const proposal = mockProposals.find((p) =>
      p.customer_name === lead.company
    ) || null;

    return reply.send(successResponse({
      lead,
      tool_result: toolResult,
      proposal: proposal || null,
    }));
  });

  // PATCH /v1/leads/:id — 更新线索状态/分配
  app.patch('/:id', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: updateBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const { status, assigned_to, priority, notes } = updateBodySchema.parse(req.body);

    const leadIdx = mockLeads.findIndex((l) => l.id === id);
    if (leadIdx === -1) {
      return reply.status(404).send(errorResponse(9101, '线索不存在'));
    }

    // Mock: 更新
    if (status) mockLeads[leadIdx].status = status;
    if (assigned_to !== undefined) mockLeads[leadIdx].assigned_to = assigned_to;
    if (priority) mockLeads[leadIdx].priority = priority;
    mockLeads[leadIdx].updated_at = new Date().toISOString();

    return reply.send(successResponse({
      ...mockLeads[leadIdx],
      _notes: notes || null,
    }, '线索已更新'));
  });

  // POST /v1/leads/:id/convert — 线索转正式方案
  app.post('/:id/convert', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    const lead = mockLeads.find((l) => l.id === id);
    if (!lead) {
      return reply.status(404).send(errorResponse(9101, '线索不存在'));
    }

    // Mock: 创建方案
    const proposalId = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const code = `YLF-${new Date().getFullYear()}-${String(mockProposals.length + 1).padStart(4, '0')}`;

    // Mock: 更新线索状态
    lead.status = 'proposal_sent';
    lead.updated_at = new Date().toISOString();

    return reply.status(201).send(successResponse({
      proposal_id: proposalId,
      lead_id: id,
      code,
    }, '已转为正式方案'));
  });
}
