// 运营工具API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const operationLogsQuerySchema = z.object({
  module: z.string().optional(),
  operator_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
});

const undoBodySchema = z.object({
  log_id: z.string().uuid().optional(),
});

export default async function adminRoutes(app: FastifyInstance) {
  app.get('/dashboard', { preHandler: [authMiddleware, requireRole('admin')] }, async (_req, reply) => {
    const r = await Promise.all(
      ['SELECT COUNT(*) FROM demands WHERE status NOT IN ($1,$2,$3)', // pending
       'SELECT COUNT(*) FROM assignments WHERE status=$1',
       'SELECT COUNT(*) FROM settlements WHERE status=$1',
       'SELECT COALESCE(SUM(amount),0) FROM payment_records WHERE received_at>=date_trunc($1,NOW())',
       'SELECT COUNT(*) FROM performers WHERE status=$1',
       'SELECT COUNT(*) FROM company_profiles WHERE status=$1'
      ].map((sql,i) => query(sql, [
        ...(i===0?['finished','cancelled','settled']:[]),
        ...(i===1?['pending']:[]),
        ...(i===2?['pending']:[]),
        ...(i===3?['month']:[]),
        ...(i===4?['active']:[]),
        ...(i===5?['certified']:[])
      ]))
    );
    return reply.send(successResponse({
      pending_demands: Number(r[0].rows[0].count),
      pending_assignments: Number(r[1].rows[0].count),
      pending_settlements: Number(r[2].rows[0].count),
      monthly_revenue: Number(r[3].rows[0].coalesce),
      active_performers: Number(r[4].rows[0].count),
      active_companies: Number(r[5].rows[0].count),
    }));
  });

  app.get('/operation-logs', { preHandler: [authMiddleware, requireRole('admin')] }, async (req, reply) => {
    const { module, operator_id, page, pageSize } = operationLogsQuerySchema.parse(req.query);
    const cond: string[] = []; const p: unknown[] = []; let i=1;
    if (module) { cond.push(`module=$${i++}`); p.push(module); }
    if (operator_id) { cond.push(`operator_id=$${i++}`); p.push(operator_id); }
    const w=cond.length?`WHERE ${cond.join(' AND ')}`:'';
    const pg=page; const ps=pageSize;
    const [items,count]=await Promise.all([
      query(`SELECT o.*, u.name as operator_name FROM operation_logs o LEFT JOIN users u ON o.operator_id=u.id ${w} ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i++}`,[...p,ps,(pg-1)*ps]),
      query(`SELECT COUNT(*) FROM operation_logs ${w}`,p)
    ]);
    return reply.send(successResponse({items:items.rows,total:Number(count.rows[0].count),page:pg,pageSize:ps}));
  });

  app.get('/search', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { q } = searchQuerySchema.parse(req.query);
    const like = `%${q}%`;
    const [performers,skus,demands,companies] = await Promise.all([
      query('SELECT id,name,tier FROM performers WHERE name ILIKE $1 OR style_tags::text ILIKE $1 LIMIT 20',[like]),
      query('SELECT id,name,business_line FROM skus WHERE name ILIKE $1 LIMIT 20',[like]),
      query('SELECT id,title,city,status FROM demands WHERE title ILIKE $1 LIMIT 20',[like]),
      query('SELECT id,short_name,city FROM company_profiles WHERE short_name ILIKE $1 OR full_name ILIKE $1 LIMIT 20',[like])
    ]);
    return reply.send(successResponse({performers:performers.rows,skus:skus.rows,demands:demands.rows,companies:companies.rows}));
  });

  // ==========================================================
  // POST /v1/admin/undo - 操作撤销 (P-06)
  // 查询最近5分钟内的操作日志，支持撤销（回滚现场/更新/删除）
  // ==========================================================
  app.post('/undo', { preHandler: [authMiddleware, requireRole('admin')] }, async (req, reply) => {
    const { log_id } = undoBodySchema.parse(req.body ?? {});

    if (!log_id) {
      return reply.status(400).send(errorResponse(9991, '请提供要撤销的操作日志ID'));
    }

    // 查询该操作日志（限5分钟内）
    const logResult = await query(
      `SELECT * FROM operation_logs
       WHERE id = $1 AND created_at >= NOW() - INTERVAL '5 minutes'`,
      [log_id]
    );

    if (logResult.rows.length === 0) {
      return reply.status(404).send(errorResponse(9992, '操作日志不存在或已超过5分钟撤销窗口'));
    }

    const log = logResult.rows[0] as {
      id: string; module: string; action: string;
      target_type: string; target_id: string;
      before_data: Record<string,unknown> | null;
      after_data: Record<string,unknown> | null;
      operator_id: string;
    };

    // 仅支持 update/delte 类操作的撤销
    if (!['update', 'delete', 'create'].includes(log.action)) {
      return reply.status(400).send(errorResponse(9993, `不支持撤销 ${log.action} 类型的操作`));
    }

    try {
      if (log.action === 'delete') {
        // 删除操作的撤销：如果有 before_data，尝试重新插入
        if (log.before_data && log.target_type && log.target_id) {
          // 简单场景下，无法完全恢复；标记日志为已撤销
          await query(
            `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
             VALUES ($1, $2, 'undo_delete', $3, $4, $5)`,
            [req.user?.sub, log.module, log.target_type, log.target_id,
             JSON.stringify({ undone_log_id: log.id, note: '删除操作已标记撤销，数据需手动恢复' })]
          );
          return reply.send(successResponse({ undone: log.id }, '删除操作撤销已记录，部分数据需人工恢复'));
        }
        return reply.status(400).send(errorResponse(9994, '无法撤销：缺少原始数据'));
      }

      if (log.action === 'create') {
        // 创建操作的撤销：删除创建的数据
        if (log.target_type && log.target_id) {
          const tables: Record<string,string> = {
            performer: 'performers',
            demand: 'demands',
            sku: 'skus',
            case: 'cases',
            ai_template: 'ai_templates',
            assignment: 'assignments',
          };
          const tableName = tables[log.target_type];
          if (!tableName) {
            return reply.status(400).send(errorResponse(9994, `不支持撤销目标类型: ${log.target_type}`));
          }
          await query(`DELETE FROM ${tableName} WHERE id = $1`, [log.target_id]);
          await query(
            `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
             VALUES ($1, $2, 'undo_create', $3, $4, $5)`,
            [req.user?.sub, log.module, log.target_type, log.target_id,
             JSON.stringify({ undone_log_id: log.id })]
          );
          return reply.send(successResponse({ undone: log.id }, '创建操作已撤销'));
        }
        return reply.status(400).send(errorResponse(9994, '无法撤销：缺少目标信息'));
      }

      // update 操作的撤销：回滚 before_data
      if (log.action === 'update' && log.before_data && log.target_type && log.target_id) {
        const tables: Record<string,string> = {
          performer: 'performers',
          demand: 'demands',
          sku: 'skus',
          case: 'cases',
          ai_template: 'ai_templates',
          price_config: 'price_configs',
          company: 'company_profiles',
        };
        const tableName = tables[log.target_type];
        if (!tableName) {
          return reply.status(400).send(errorResponse(9994, `不支持撤销目标类型: ${log.target_type}`));
        }

        const setClauses: string[] = [];
        const params: unknown[] = [];
        let idx = 0;
        for (const [key, value] of Object.entries(log.before_data)) {
          idx++;
          setClauses.push(`${key} = $${idx}`);
          params.push(value);
        }
        idx++;
        setClauses.push(`updated_at = NOW()`);
        idx++;
        params.push(log.target_id);

        await query(
          `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = $${idx}`,
          params
        );

        await query(
          `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
           VALUES ($1, $2, 'undo_update', $3, $4, $5)`,
          [req.user?.sub, log.module, log.target_type, log.target_id,
           JSON.stringify({ undone_log_id: log.id, restored_fields: Object.keys(log.before_data) })]
        );

        return reply.send(successResponse({ undone: log.id }, '更新操作已回滚'));
      }

      return reply.status(400).send(errorResponse(9994, '无法撤销：缺少回滚数据'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(500).send(errorResponse(9999, `撤销失败: ${msg}`));
    }
  });

  // ==========================================================
  // POST /v1/admin/mark-timeout - 超时自动标记 (P-27)
  // 查询超时的 demand，标记 urgency=urgent
  // ==========================================================
  app.post('/mark-timeout', { preHandler: [authMiddleware, requireRole('admin')] }, async (_req, reply) => {
    // 定义各状态超时阈值（小时）
    const timeoutConfig: Record<string, number> = {
      pending_ai: 2,           // AI 生成超时 2h
      ai_generated: 24,        // 运营未处理超时 24h
      pending_operator: 48,    // 运营未调整超时 48h
      operator_adjusted: 48,   // 客户未确认超时 48h
      pending_client_confirm: 72, // 客户确认超时 72h
      confirmed: 48,           // 确认后未推进超时 48h
      pending_deposit: 48,     // 定金超时 48h
      deposit_received: 24,    // 演员确认超时 24h
      pending_performer: 24,   // 演员确认超时 24h
      performer_confirmed: 4,  // 演出前超时 4h
      performing: 6,           // 演出超时 6h
      finished: 24,            // 尾款超时 24h
      pending_final_payment: 48,
    };

    const statuses = Object.keys(timeoutConfig);
    const result: { status: string; marked: number }[] = [];

    for (const status of statuses) {
      const thresholdHours = timeoutConfig[status];
      const updateResult = await query(
        `UPDATE demands
         SET urgency = 'urgent', updated_at = NOW()
         WHERE status = $1
           AND urgency = 'normal'
           AND updated_at <= NOW() - INTERVAL '1 hour' * $2
         RETURNING id`,
        [status, thresholdHours]
      );
      if (updateResult.rows.length > 0) {
        result.push({ status, marked: updateResult.rows.length });
      }
    }

    return reply.send(successResponse({
      marked_total: result.reduce((sum, r) => sum + r.marked, 0),
      details: result,
    }, '超时标记完成'));
  });
}
