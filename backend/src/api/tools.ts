// ============================================================
// V4.7 增长工具 API — 工具提交 / 结果获取 / 分享记录
// POST /v1/tools/submit | GET /v1/tools/:id/result | POST /v1/tools/:id/share
// P0 Mock 模式：不连接真实数据库，全部使用 Mock 数据
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import { successResponse } from '../utils/response.js';
import {
  mockToolResults,
  generateToolResult,
  getFallbackResult,
} from '../mock/v47-data.js';

// ============================================================
// Zod Schemas
// ============================================================

const toolTypeEnum = z.enum(['budget_calculator', 'insurance_plan', 'annual_plan']);

const submitBodySchema = z.object({
  tool_type: toolTypeEnum,
  answers: z.record(z.unknown()),
  source_channel: z.string().optional(),
  source_user: z.string().optional(),
  useFallback: z.boolean().optional(),
});

const idParamSchema = z.object({ id: z.string() });

const shareBodySchema = z.object({
  source_channel: z.string().optional(),
});

// ============================================================
// Routes
// ============================================================

export default async function toolRoutes(app: FastifyInstance) {

  // POST /v1/tools/submit — 提交工具答案，生成AI结果
  app.post('/submit', {
    preHandler: [validate({ body: submitBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { tool_type, answers, source_channel, source_user, useFallback } = submitBodySchema.parse(req.body);

    const source: 'ai' | 'fallback' = useFallback ? 'fallback' : 'ai';
    const fallbackAnswers = Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, String(value ?? '')])
    );
    const { result_json, ai_output } = useFallback
      ? getFallbackResult(tool_type, fallbackAnswers)
      : generateToolResult(tool_type, answers as Record<string, unknown>);

    // Mock: 生成新的 result ID
    const resultId = `r${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Mock: 创建关联线索
    const leadId = `l${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const mockResult = {
      id: resultId,
      lead_id: leadId,
      tool_type,
      source,
      result_json,
      ai_output,
      share_count: 0,
      download_count: 0,
      created_at: new Date().toISOString(),
    };
    mockToolResults.push(mockResult);

    const mockLead = {
      id: leadId,
      tool_type,
      source_channel: source_channel || 'direct',
      source_user: source_user || null,
      answers,
      ai_result_summary: `${tool_type} 工具结果`,
      ai_result_json: result_json,
      score: Math.floor(60 + Math.random() * 35), // 60-95
      priority: 'medium',
      status: 'new',
      assigned_to: null,
      customer_name: null,
      company: null,
      phone: null,
      wechat: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return reply.status(201).send(successResponse({
      result_id: resultId,
      result: result_json,
      source,
      lead_id: leadId,
      _mock: { result: mockResult, lead: mockLead },
    }, '工具结果已生成'));
  });

  // GET /v1/tools/:id/result — 获取工具结果
  app.get('/:id/result', {
    preHandler: [validate({ params: idParamSchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    // Mock: 查找匹配的 tool result，找不到就返回第一个
    const result = mockToolResults.find((r) => r.id === id)
      || { ...mockToolResults[0], id };

    // 返回公开数据（不包含敏感信息）
    return reply.send(successResponse({
      result_json: result.result_json,
      ai_output: result.ai_output,
      source: result.source,
      share_url: `https://yanli.com/tools/result/${id}`,
      created_at: result.created_at,
    }));
  });

  // POST /v1/tools/:id/share — 记录分享行为
  app.post('/:id/share', {
    preHandler: [validate({ params: idParamSchema, body: shareBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const { source_channel } = shareBodySchema.parse(req.body);

    // Mock: 找到结果并增加分享计数
    const result = mockToolResults.find((r) => r.id === id);
    if (result) {
      result.share_count += 1;
    }

    return reply.send(successResponse({
      share_count: (result?.share_count || 0) + 1,
      channel: source_channel || 'unknown',
    }, '分享已记录'));
  });
}
