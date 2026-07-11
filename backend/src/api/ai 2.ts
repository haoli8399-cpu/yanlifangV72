/**
 * AI 端点 — 商机评分 / 方案推荐 / 跟进话术
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { errorResponse, successResponse } from '../utils/response.js';
import { chat, scoreOpportunity, recommendPlan, generateFollowUp } from '../services/ai/deepseek.js';
import { speechToText } from '../services/ai/speech.js';

const scoreBody = z.object({
  opportunity_id: z.string().uuid(),
});

const recommendBody = z.object({
  performance_type: z.string().optional(),
  activity_type: z.string().optional(),
  audience_count: z.number().optional(),
  budget: z.number().optional(),
  opportunity_id: z.string().uuid().optional(),
});

const askBody = z.object({
  conversation: z.array(z.object({
    role: z.enum(['user', 'ai']),
    content: z.string(),
  })).min(1),
});

const followUpBody = z.object({
  opportunity_id: z.string().uuid(),
  last_contact_at: z.string().optional(),
  context: z.string().optional(),
});

const defaultScore = {
  score: 50, priority: 'medium', reasoning: '商机不存在',
  riskTags: [],
};

const defaultFollowUp = {
  script: '商机不存在，建议先确认商机信息后再跟进客户。',
  suggestedAction: 'manual_check',
};

const defaultPlans = {
  budget: { tier: 'T4', duration: 45, price: 4800, reason: '省钱版' },
  recommended: { tier: 'T3', duration: 60, price: 6000, reason: '主推版' },
  upgrade: { tier: 'T2', duration: 90, price: 9000, reason: '升级版' },
};

function parseJsonObject(raw: string) {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('AI response is not JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function fallbackAsk(conversation: Array<{ role: 'user' | 'ai'; content: string }>) {
  const text = conversation.map(x => x.content).join('\n');
  if (!/(\d{2,5}\s*人|人数|观众|参加)/.test(text)) {
    return {
      action: 'ask',
      field: 'audience_count',
      question: '请问预计多少人参加？',
      options: ['50-100人', '100-300人', '300-500人', '500人以上'],
    };
  }
  if (!/(预算|费用|价格|报价|钱|元|块|万|千)/.test(text)) {
    return {
      action: 'ask',
      field: 'budget',
      question: '预算大概多少？',
      options: ['5千以内', '5千-1万', '1万-2万', '2万以上'],
    };
  }
  if (!/(日期|时间|\d{1,2}\s*月\s*\d{1,2}\s*日|\d{4}[-/年.]\d{1,2}[-/月.]\d{1,2})/.test(text)) {
    return {
      action: 'ask',
      field: 'event_date',
      question: '活动日期是哪天？',
      options: [],
    };
  }
  return { action: 'recommend', plans: defaultPlans };
}

export default async function aiRoutes(app: FastifyInstance) {
  // POST /v1/ai/score-opportunity — AI 商机评分
  app.post('/ai/score-opportunity', { preHandler: [authMiddleware] }, async (req, reply) => {
    const parsed = scoreBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.send(successResponse(defaultScore, '使用默认评分'));
    }

    const body = parsed.data;

    // 获取商机和关联需求信息
    const opp = await query(
      `SELECT o.*, COALESCE(u.name, '') as company_name, d.comedy_style as performance_type,
        d.event_type as activity_type, d.audience_count, d.budget, d.city,
        d.special_requirements as description
       FROM opportunities o
       LEFT JOIN demands d ON o.demand_id = d.id
       LEFT JOIN users u ON d.client_id = u.id
       WHERE o.id = $1`,
      [body.opportunity_id]
    );

    if (opp.rows.length === 0) {
      return reply.send(successResponse(defaultScore, '使用默认评分'));
    }

    const d = opp.rows[0];
    try {
      const result = await scoreOpportunity({
        activityType: d.activity_type,
        performanceType: d.performance_type,
        audienceCount: d.audience_count,
        budget: d.budget,
        city: d.city,
        description: d.description,
      });

      // 更新商机 AI 评分
      await query(
        'UPDATE opportunities SET ai_score = $1, priority = $2, updated_at = now() WHERE id = $3',
        [result.score, result.priority, body.opportunity_id]
      );

      return reply.send(successResponse(result, 'AI 评分完成'));
    } catch (err: any) {
      return reply.send(successResponse({
        score: 50, priority: 'medium', reasoning: 'AI 服务暂时不可用',
        riskTags: [],
      }, '使用默认评分'));
    }
  });

  // POST /v1/ai/ask — AI 多轮追问或直接推荐
  app.post('/ai/ask', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = askBody.parse(req.body);
    const conversation = body.conversation as Array<{ role: 'user' | 'ai'; content: string }>;
    const systemPrompt = `
你是「喜剧工厂」演出撮合平台的需求追问助手。
目标：判断活动公司提交演出需求时，是否已经具备生成三档演出方案所需信息。

必需字段：
- performance_type：演出类型，例如脱口秀、即兴喜剧、漫才、新喜剧
- activity_type：活动类型，例如年会、团建、品牌活动、客户答谢
- audience_count：预计参与人数
- budget：预算范围或金额
- event_date：活动日期

只返回 JSON，不要输出解释。
如果还缺关键信息，返回：
{"action":"ask","field":"budget","question":"预算大概多少？","options":["5千以内","5千-1万","1万-2万","2万以上"]}
field 只能是 performance_type、activity_type、audience_count、budget、event_date 之一。
如果信息足够生成方案，返回：
{"action":"recommend","plans":{"budget":{"tier":"T4","duration":45,"price":4800,"reason":"省钱版"},"recommended":{"tier":"T3","duration":60,"price":6000,"reason":"主推版"},"upgrade":{"tier":"T2","duration":90,"price":9000,"reason":"升级版"}}}
`.trim();

    try {
      const content = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ conversation }) },
      ], 700);
      const parsed = parseJsonObject(content);
      if (parsed?.action === 'ask' && parsed.field && parsed.question) {
        return reply.send({
          action: 'ask',
          field: parsed.field,
          question: parsed.question,
          options: Array.isArray(parsed.options) ? parsed.options : [],
        });
      }
      if (parsed?.action === 'recommend' && parsed.plans) {
        return reply.send({ action: 'recommend', plans: parsed.plans });
      }
      return reply.send(fallbackAsk(conversation));
    } catch {
      return reply.send(fallbackAsk(conversation));
    }
  });

  // POST /v1/ai/recommend-plan — AI 推荐方案（三档）
  app.post('/ai/recommend-plan', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = recommendBody.parse(req.body);
    try {
      const result = await recommendPlan({
        performanceType: body.performance_type,
        activityType: body.activity_type,
        audienceCount: body.audience_count,
        budget: body.budget,
      });
      return reply.send(successResponse(result, '方案推荐完成'));
    } catch {
      return reply.send(successResponse({
        ...defaultPlans,
      }, '使用默认方案'));
    }
  });

  // POST /v1/ai/generate-follow-up — AI 生成跟进话术
  app.post('/ai/generate-follow-up', { preHandler: [authMiddleware] }, async (req, reply) => {
    const parsed = followUpBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.send(successResponse(defaultFollowUp, '使用默认话术'));
    }

    const body = parsed.data;

    const opp = await query(
      `SELECT o.*, COALESCE(u.name, '') as company_name, d.comedy_style as performance_type
       FROM opportunities o
       LEFT JOIN demands d ON o.demand_id = d.id
       LEFT JOIN users u ON d.client_id = u.id
       WHERE o.id = $1`,
      [body.opportunity_id]
    );

    if (opp.rows.length === 0) {
      return reply.send(successResponse(defaultFollowUp, '使用默认话术'));
    }

    const d = opp.rows[0];
    try {
      const result = await generateFollowUp({
        companyName: d.company_name,
        performanceType: d.performance_type,
        lastContactAt: body.last_contact_at,
        status: d.status,
      });
      return reply.send(successResponse(result, '话术生成完成'));
    } catch {
      return reply.send(successResponse({
        script: '您好，关于之前的演出方案，想了解您的想法和进展。如有需要调整的地方请随时联系我。',
        suggestedAction: 'wechat',
      }, '使用默认话术'));
    }
  });

  // POST /v1/ai/speech-to-text — 语音转文字
  app.post('/ai/speech-to-text', { preHandler: [authMiddleware] }, async (req, reply) => {
    if (!req.isMultipart()) {
      return reply.status(400).send(errorResponse(9101, '请使用 multipart/form-data 上传音频文件'));
    }

    const file = await req.file({
      limits: {
        fileSize: 3 * 1024 * 1024,
      },
    });
    if (!file) {
      return reply.status(400).send(errorResponse(9102, '未收到音频文件'));
    }

    try {
      const audioBuffer = await file.toBuffer();
      const text = await speechToText(audioBuffer, file.filename || 'voice.mp3');
      return reply.send(successResponse({ text }, '语音识别完成'));
    } catch (err: any) {
      const message = err?.message || '语音识别失败';
      return reply.status(500).send(errorResponse(9103, message));
    }
  });
}
