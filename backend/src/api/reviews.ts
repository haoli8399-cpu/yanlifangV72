// @ts-nocheck — pre-existing Fastify framework type issues
// 评价API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';

const reviewBody = z.object({
  demand_id: z.string().uuid(), overall_rating: z.number().min(1).max(5),
  performance_rating: z.number().min(1).max(5).optional(),
  punctuality_rating: z.number().min(1).max(5).optional(),
  content_rating: z.number().min(1).max(5).optional(),
  interaction_rating: z.number().min(1).max(5).optional(),
  satisfaction_rating: z.number().min(1).max(5).optional(),
  text_content: z.string().optional(),
});

export default async function reviewRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [authMiddleware, requireRole('agent','performer'), validate({ body: reviewBody })] },
    async (req, reply) => {
      const b = req.body as z.infer<typeof reviewBody>;
      const dup = await query('SELECT id FROM reviews WHERE demand_id=$1 AND from_user_id=$2', [b.demand_id, req.user?.sub]);
      if (dup.rows.length > 0) return reply.status(409).send(errorResponse(8001, '该订单已评价'));

      const result = await query(
        `INSERT INTO reviews (demand_id, from_user_id, from_type, overall_rating, performance_rating, punctuality_rating, content_rating, interaction_rating, satisfaction_rating, text_content)
         VALUES ($1,$2,(SELECT role FROM users WHERE id=$2),$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [b.demand_id, req.user?.sub, b.overall_rating, b.performance_rating, b.punctuality_rating, b.content_rating, b.interaction_rating, b.satisfaction_rating, b.text_content]
      );
      return reply.status(201).send(createdResponse({ id: result.rows[0].id }, '评价已提交'));
    });

  app.get('/', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { performer_id, demand_id, page, pageSize } = req.query as Record<string,string>;
    const cond: string[] = []; const p: unknown[] = []; let i=1;
    if (performer_id) { cond.push(`r.to_performer_id=$${i++}`); p.push(performer_id); }
    if (demand_id) { cond.push(`r.demand_id=$${i++}`); p.push(demand_id); }
    const w=cond.length?`WHERE ${cond.join(' AND ')}`:'';
    const pg=Math.max(1,Number(page)||1); const ps=Math.min(100,Number(pageSize)||20);
    const [items,count] = await Promise.all([
      query(`SELECT r.*, u.name as from_name FROM reviews r JOIN users u ON r.from_user_id=u.id ${w} ORDER BY r.created_at DESC LIMIT $${i++} OFFSET $${i++}`,[...p,ps,(pg-1)*ps]),
      query(`SELECT COUNT(*) FROM reviews r ${w}`,p)
    ]);
    return reply.send({code:0,data:{items:items.rows,total:Number(count.rows[0].count),page:pg,pageSize:ps},message:'ok'});
  });
}
