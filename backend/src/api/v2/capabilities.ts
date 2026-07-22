import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../utils/db.js';
import { successResponse } from '../../utils/response.js';

export async function capabilityRoutes(app: FastifyInstance) {
  app.get('/v1/capabilities', async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await query('SELECT * FROM capabilities WHERE lifecycle_status = $1 ORDER BY category', ['active']);
    return reply.send(successResponse(result.rows));
  });
}
