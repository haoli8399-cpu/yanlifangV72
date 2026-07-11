// 通知API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse } from '../utils/response.js';

const listQuerySchema = z.object({
  type: z.enum(['sms', 'wechat']).optional(),
  status: z.enum(['sent', 'failed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export default async function notificationRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authMiddleware, requireRole('admin')] }, async (req, reply) => {
    const { type, status, page, pageSize } = listQuerySchema.parse(req.query);
    const cond: string[] = []; const p: unknown[] = []; let i=1;
    if (type) { cond.push(`type=$${i++}`); p.push(type); }
    if (status) { cond.push(`status=$${i++}`); p.push(status); }
    const w=cond.length?`WHERE ${cond.join(' AND ')}`:'';
    const pg=page; const ps=pageSize;
    const [items,count]=await Promise.all([
      query(`SELECT * FROM notifications ${w} ORDER BY sent_at DESC LIMIT $${i++} OFFSET $${i++}`,[...p,ps,(pg-1)*ps]),
      query(`SELECT COUNT(*) FROM notifications ${w}`,p)
    ]);
    return reply.send(successResponse({items:items.rows,total:Number(count.rows[0].count),page:pg,pageSize:ps}));
  });
}
