import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../utils/db.js';
import { successResponse } from '../../utils/response.js';

export async function programModuleRoutes(app: FastifyInstance) {
  app.get('/v2/program-modules', async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await query(
      'SELECT pm.*, pmv.name, pmv.version_number, pmv.standard_duration_minutes, pmv.readiness_level FROM program_modules pm JOIN program_module_versions pmv ON pmv.program_module_id = pm.id AND pmv.lifecycle_status = $1 WHERE pm.lifecycle_status != $2 ORDER BY pm.category',
      ['active', 'retired']
    );
    return reply.send(successResponse(result.rows));
  });
}
