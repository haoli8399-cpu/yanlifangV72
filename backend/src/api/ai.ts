import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse } from '../utils/response.js';

const insightBody = z.object({
  context_type: z.enum(['opportunity', 'sku', 'profit', 'order', 'performer']).optional(),
  opportunity_id: z.string().uuid().optional(),
  sku_id: z.string().uuid().optional(),
  time_range: z.enum(['today', 'week', 'month']).optional(),
});

export default async function aiRoutes(app: FastifyInstance) {
  app.post('/insight', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { context_type, opportunity_id, sku_id, time_range: _time_range } = insightBody.parse(req.body);

    // Generate context-aware insights without calling external AI (fast, free)
    const insights: string[] = [];

    if (opportunity_id) {
      const opp = await query(
        `SELECT o.*, d.title, d.performer_count, d.budget 
         FROM opportunities o LEFT JOIN demands d ON d.id = o.demand_id 
         WHERE o.id = $1`, [opportunity_id]);
      if (opp.rows.length > 0) {
        const o = opp.rows[0];
        const hoursAgo = Math.round((Date.now() - new Date(String(o.created_at)).getTime()) / 3600000);
        
        if (o.status === 'new' && hoursAgo > 2) {
          insights.push(`🔴 ${o.title} 已等待 ${hoursAgo} 小时，建议立即处理`);
        }
        if (o.status === 'quoted') {
          insights.push(`💡 ${o.title} 报价已发送，建议 24h 内电话跟进确认`);
        }
        if (o.status === 'negotiating') {
          insights.push(`🟡 ${o.title} 处于谈判阶段，可考虑降价 5-10% 促成`);
        }
        if (o.status === 'won') {
          insights.push(`✅ ${o.title} 已成交！记得安排排期和演出执行`);
        }
        if (o.priority === 'high') {
          insights.push(`⭐ ${o.title} 为高优先级商机，建议优先处理`);
        }
      }
    }

    if (sku_id) {
      const sku = await query('SELECT name, base_price, status FROM skus WHERE id = $1', [sku_id]);
      if (sku.rows.length > 0) {
        const s = sku.rows[0];
        // orders query (available for future use)
        insights.push(`📊 ${s.name} 标准价 ¥${s.base_price}`);
      }
    }

    if (context_type === 'profit') {
      const stats = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE o.status = 'won') as won,
          SUM(q.total_price) FILTER (WHERE o.status = 'won') as revenue,
          SUM(q.total_price - q.cost_price) FILTER (WHERE o.status = 'won') as profit
        FROM opportunities o 
        LEFT JOIN quotes q ON q.opportunity_id = o.id
        WHERE o.created_at >= now() - interval '7 days'
      `);
      const s = stats.rows[0];
      const won = parseInt(String(s.won)) || 0;
      const revenue = parseInt(String(s.revenue)) || 0;
      const profit = parseInt(String(s.profit)) || 0;
      if (won > 0) {
        insights.push(`📈 近 7 天成交 ${won} 单，收入 ¥${revenue.toLocaleString()}，毛利 ¥${profit.toLocaleString()}`);
      } else {
        insights.push(`⚠️ 近 7 天尚无成交，需要加大跟进力度`);
      }
    }

    // 独立艺人洞察：排期/信誉分/近期收入（Phase 1 扩展）
    if (context_type === 'performer') {
      const uid = (req.user as { sub?: string } | undefined)?.sub ?? '';

      // 近 7 天演出场数 + 总收入
      try {
        const week = await query<{ cnt: number; income: number }>(
          `SELECT COUNT(*)::int AS cnt, COALESCE(SUM(negotiated_price), 0)::int AS income
           FROM assignments WHERE performer_id = $1 AND arrival_time >= now() - interval '7 days'`,
          [uid]
        );
        const w = week.rows[0] ?? { cnt: 0, income: 0 };
        insights.push(`📅 近 7 天你有 ${Number(w.cnt)} 场演出，总收入 ¥${Number(w.income).toLocaleString()}`);
      } catch {
        insights.push('📅 近 7 天演出数据暂不可用');
      }

      // 下周空档提醒
      try {
        const gap = await query<{ dow: string }>(
          `SELECT to_char(arrival_time, 'FMDay') AS dow FROM assignments
           WHERE performer_id = $1 AND arrival_time >= now() AND arrival_time < now() + interval '7 days'
           ORDER BY arrival_time`,
          [uid]
        );
        const days = gap.rows.map((r) => r.dow);
        insights.push(days.length ? `🗓️ 下周 ${days.join('/')} 有演出` : '🗓️ 下周暂无安排，空档可接单');
      } catch {
        insights.push('🗓️ 下周档期数据暂不可用');
      }

      // 信誉分状态（较上周变化）
      try {
        const credit = await query<{ score: number }>(
          `SELECT score FROM credit_score_logs WHERE performer_id = $1 ORDER BY created_at DESC LIMIT 2`,
          [uid]
        );
        if (credit.rows.length > 0) {
          const cur = Number(credit.rows[0].score);
          const prev = credit.rows[1] ? Number(credit.rows[1].score) : cur;
          const diff = cur - prev;
          insights.push(`⭐ 信誉分 ${cur}，较上周 ${diff >= 0 ? '+' : ''}${diff}`);
        } else {
          insights.push('⭐ 暂无信誉分记录');
        }
      } catch {
        insights.push('⭐ 信誉分数据暂不可用');
      }

      // 收入趋势（本月预计 vs 上月）
      try {
        const trend = await query<{ this_month: number; last_month: number }>(
          `SELECT
             COALESCE(SUM(negotiated_price) FILTER (WHERE arrival_time >= date_trunc('month', now())), 0)::int AS this_month,
             COALESCE(SUM(negotiated_price) FILTER (WHERE arrival_time >= date_trunc('month', now()) - interval '1 month' AND arrival_time < date_trunc('month', now())), 0)::int AS last_month
           FROM assignments WHERE performer_id = $1`,
          [uid]
        );
        const t = trend.rows[0] ?? { this_month: 0, last_month: 0 };
        const pct = t.last_month > 0 ? Math.round(((t.this_month - t.last_month) / t.last_month) * 100) : (t.this_month > 0 ? 100 : 0);
        insights.push(`💰 本月预计收入 ¥${Number(t.this_month).toLocaleString()}，较上月 ${pct >= 0 ? '+' : ''}${pct}%`);
      } catch {
        insights.push('💰 收入趋势数据暂不可用');
      }
    }

    if (insights.length === 0) {
      insights.push('👋 你好！我是小演，需要我帮你分析什么？');
    }

    return reply.send(successResponse({ insights }));
  });
}
