import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { errorResponse, successResponse } from '../utils/response.js';

const calendarQuerySchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

const settlementQuerySchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

type AuthedRequest = FastifyRequest & {
  user?: {
    sub: string;
    role: string;
    company_id?: string;
  };
};

async function resolveCompanyId(request: AuthedRequest): Promise<string | null> {
  if (request.user?.company_id) {
    return request.user.company_id;
  }

  if (!request.user?.sub) {
    return null;
  }

  const result = await query<{ id: string }>(
    'SELECT id FROM company_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [request.user.sub]
  );

  return result.rows[0]?.id ?? null;
}

async function requireCompanyScope(request: AuthedRequest, reply: FastifyReply): Promise<string | null> {
  const companyId = await resolveCompanyId(request);

  if (!companyId) {
    reply.status(403).send(errorResponse(1006, '未找到当前用户公司资料'));
    return null;
  }

  return companyId;
}

function resolveCalendarRange(queryParams: z.infer<typeof calendarQuerySchema>): { start: string; end: string } {
  if (queryParams.start && queryParams.end) {
    return { start: queryParams.start, end: queryParams.end };
  }

  const month = queryParams.month ?? new Date().toISOString().slice(0, 7);
  const [year, monthIndex] = month.split('-').map(Number);
  const endDay = new Date(year, monthIndex, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${String(endDay).padStart(2, '0')}` };
}

export default async function supplierStatsRoutes(app: FastifyInstance) {
  app.get('/stats/calendar', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const range = resolveCalendarRange(calendarQuerySchema.parse(request.query));
    const result = await query(
      `SELECT a.id, a.arrival_time, a.status, a.performance_role,
              p.id AS performer_id, p.name AS performer_name, p.tier,
              d.id AS demand_id, d.title AS demand_title, d.event_date, d.city
       FROM assignments a
       JOIN performers p ON p.id = a.performer_id
       JOIN demands d ON d.id = a.demand_id
       WHERE p.company_id = $1
         AND a.arrival_time >= $2
         AND a.arrival_time <= $3
         AND a.status NOT IN ('cancelled', 'rejected')
       ORDER BY a.arrival_time ASC`,
      [companyId, range.start, range.end]
    );

    return reply.send(successResponse({ items: result.rows }));
  });

  app.get('/stats/checkins-today', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const result = await query(
      `SELECT a.id, a.arrival_time, a.checkin_time, a.status,
              CASE
                WHEN a.checkin_time IS NULL AND a.arrival_time < now() THEN 'late'
                WHEN a.checkin_time IS NULL THEN 'not_checked'
                WHEN a.checkin_time > a.arrival_time THEN 'late'
                ELSE 'checked'
              END AS checkin_status,
              p.id AS performer_id, p.name AS performer_name, p.tier,
              d.id AS demand_id, d.title AS demand_title, d.city
       FROM assignments a
       JOIN performers p ON p.id = a.performer_id
       JOIN demands d ON d.id = a.demand_id
       WHERE p.company_id = $1
         AND a.arrival_time::date = CURRENT_DATE
         AND a.status NOT IN ('cancelled', 'rejected')
       ORDER BY a.arrival_time ASC`,
      [companyId]
    );

    const summary = result.rows.reduce<{ total: number; checked: number; not_checked: number; late: number }>(
      (acc, row) => {
        const status = String(row.checkin_status);
        acc.total += 1;
        if (status === 'checked') acc.checked += 1;
        if (status === 'not_checked') acc.not_checked += 1;
        if (status === 'late') acc.late += 1;
        return acc;
      },
      { total: 0, checked: 0, not_checked: 0, late: 0 }
    );

    return reply.send(successResponse({ summary, items: result.rows }));
  });

  app.get('/stats/settlements', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { period = new Date().toISOString().slice(0, 7) } = settlementQuerySchema.parse(request.query);
    const result = await query(
      `SELECT p.id AS performer_id, p.name AS performer_name, p.tier,
              COALESCE(SUM(s.amount), 0) AS total_amount,
              COALESCE(SUM(s.amount) FILTER (WHERE s.status = 'pending'), 0) AS pending_amount,
              COALESCE(SUM(s.amount) FILTER (WHERE s.status = 'settled'), 0) AS settled_amount,
              COUNT(s.id)::int AS settlement_count
       FROM performers p
       LEFT JOIN settlements s ON s.performer_id = p.id AND s.period = $2
       WHERE p.company_id = $1
       GROUP BY p.id
       ORDER BY total_amount DESC`,
      [companyId, period]
    );

    const summary = result.rows.reduce<{ period: string; total_pending: number; total_settled: number; total_amount: number }>(
      (acc, row) => {
        acc.total_pending += Number(row.pending_amount);
        acc.total_settled += Number(row.settled_amount);
        acc.total_amount += Number(row.total_amount);
        return acc;
      },
      { period, total_pending: 0, total_settled: 0, total_amount: 0 }
    );

    return reply.send(successResponse({ summary, by_performer: result.rows }));
  });

  app.get('/stats/credit', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const [summary, lowWarnings, trend] = await Promise.all([
      query(
        `SELECT
           COALESCE(AVG(credit_score), 0) AS average_score,
           COALESCE(MIN(credit_score), 0) AS lowest_score,
           COUNT(*)::int AS performer_count
         FROM performers
         WHERE company_id = $1 AND status = 'active'`,
        [companyId]
      ),
      query(
        `SELECT id, name, tier, credit_score, credit_level
         FROM performers
         WHERE company_id = $1 AND status = 'active' AND credit_score < 3
         ORDER BY credit_score ASC
         LIMIT 10`,
        [companyId]
      ),
      query(
        `SELECT to_char(date_trunc('day', l.created_at), 'YYYY-MM-DD') AS date,
                COALESCE(SUM(l.change_amount), 0) AS change_amount
         FROM credit_score_logs l
         JOIN performers p ON p.id = l.performer_id
         WHERE p.company_id = $1
           AND l.created_at >= now() - interval '30 days'
         GROUP BY date_trunc('day', l.created_at)
         ORDER BY date ASC`,
        [companyId]
      ),
    ]);

    return reply.send(successResponse({
      summary: {
        average_score: Number(summary.rows[0].average_score),
        lowest_score: Number(summary.rows[0].lowest_score),
        performer_count: Number(summary.rows[0].performer_count),
      },
      low_score_warnings: lowWarnings.rows,
      trend: trend.rows,
    }));
  });
}
