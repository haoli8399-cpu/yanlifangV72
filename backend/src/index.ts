// ============================================================
// 演出撮合平台 · Fastify 入口文件
// 启动 HTTP 服务、注册插件和中间件
// ============================================================

import Fastify from 'fastify';
import { capabilityRoutes } from './api/v2/capabilities.js';
import { programModuleRoutes } from './api/v2/program-modules.js';
import { slice1Routes } from './api/v2/slice1.js';
import { commercialRoutes } from './api/v2/commercial.js';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import { registerErrorHandler } from './middleware/error.js';
import type { JwtPayload } from './types/index.js';
import skuRoutes from './api/skus.js';
import skuCustomFieldRoutes from './api/sku-custom-fields.js';
import demandRoutes from './api/demands.js';
import orderRoutes from './api/orders.js';
import contractRoutes from './api/contracts.js';
import paymentRoutes from './api/payments.js';
import performerRoutes from './api/performers.js';
import priceConfigRoutes from './api/price-configs.js';
import settlementRoutes from './api/settlements.js';
import assignmentRoutes from './api/assignments.js';
import reviewRoutes from './api/reviews.js';
import companyRoutes from './api/companies.js';
import adminRoutes from './api/admin.js';
import notificationRoutes from './api/notifications.js';
import authRoutes from './api/auth.js';
import caseRoutes from './api/cases.js';
import aiTemplateRoutes from './api/ai-templates.js';
import aiRoutes from './api/ai.js';
import opportunityRoutes from './api/opportunities.js';
import quoteRoutes from './api/quotes.js';
import followUpRoutes from './api/follow-ups.js';
import aiFeedbackRoutes from './api/ai-feedback.js';
import supplierPerformersRoutes from './api/supplier-performers.js';
import supplierStatsRoutes from './api/supplier-stats.js';
import supplierDispatchRoutes from './api/supplier-dispatch.js';
// ---- V4.7 新增路由 ----
import toolRoutes from './api/tools.js';
import leadRoutes from './api/leads.js';
import proposalRoutes from './api/proposals.js';
import talentRoutes from './api/talents.js';
import venueRoutes from './api/venues.js';
import caseStudyRoutes from './api/case-studies.js';
import downloadRoutes from './api/downloads.js';

// ---- 扩展 @fastify/jwt 类型 ----
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

// ---- 环境变量 ----
const PORT = Number(process.env.PORT) || 3002;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ---- Fastify 实例 ----
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

// ============================================================
// 插件注册
// ============================================================

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
});

await app.register(fjwt, {
  secret: JWT_SECRET,
  verify: {
    algorithms: ['HS256'],
  },
});

// ============================================================
// 错误处理
// ============================================================
registerErrorHandler(app);

// ============================================================
// 健康检查路由
// ============================================================
app.get('/v1/health', async (_request, reply) => {
  reply.status(200).send({
    code: 0,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'ok',
  });
});

// ============================================================
// 业务路由注册
// ============================================================

await app.register(skuRoutes, { prefix: '/v1/skus' });
await app.register(capabilityRoutes);
await app.register(programModuleRoutes);
await app.register(slice1Routes);
await app.register(commercialRoutes);
await app.register(skuCustomFieldRoutes, { prefix: '/v1/sku-custom-fields' });
await app.register(demandRoutes, { prefix: '/v1/demands' });
await app.register(orderRoutes, { prefix: '/v1/orders' });
await app.register(contractRoutes, { prefix: '/v1/contracts' });
await app.register(paymentRoutes, { prefix: '/v1/payments' });
await app.register(performerRoutes, { prefix: '/v1/performers' });
await app.register(priceConfigRoutes, { prefix: '/v1/price-configs' });
await app.register(settlementRoutes, { prefix: '/v1/settlements' });
await app.register(assignmentRoutes, { prefix: '/v1/assignments' });
await app.register(authRoutes, { prefix: '/v1/auth' });
await app.register(reviewRoutes, { prefix: '/v1/reviews' });
await app.register(companyRoutes, { prefix: '/v1/companies' });
await app.register(adminRoutes, { prefix: '/v1/admin' });
await app.register(notificationRoutes, { prefix: '/v1/notifications' });
await app.register(caseRoutes, { prefix: '/v1/cases' });
await app.register(aiTemplateRoutes, { prefix: '/v1/ai-templates' });
await app.register(opportunityRoutes, { prefix: '/v1/opportunities' });
await app.register(quoteRoutes, { prefix: '/v1/quotes' });
await app.register(followUpRoutes, { prefix: '/v1/follow-ups' });
await app.register(aiFeedbackRoutes, { prefix: '/v1/ai-feedback' });
await app.register(supplierPerformersRoutes, { prefix: '/v1/supplier' });
await app.register(supplierStatsRoutes, { prefix: '/v1/supplier' });
await app.register(supplierDispatchRoutes, { prefix: '/v1/supplier' });
await app.register(aiRoutes, { prefix: '/v1/ai' });
// ---- V4.7 新增路由注册 ----
await app.register(toolRoutes, { prefix: '/v1/tools' });
await app.register(leadRoutes, { prefix: '/v1/leads' });
await app.register(proposalRoutes, { prefix: '/v1/proposals' });
await app.register(talentRoutes, { prefix: '/v1/talents' });
await app.register(venueRoutes, { prefix: '/v1/venues' });
await app.register(caseStudyRoutes, { prefix: '/v1/case-studies' });
await app.register(downloadRoutes, { prefix: '/v1' });

// ============================================================
// 启动服务器
// ============================================================
async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info('Service started on http://' + HOST + ':' + PORT);
    
  // Connect Redis
  try {
    const { getRedis } = await import('./utils/redis.js');
    await getRedis().connect();
    app.log.info('Redis connected: ' + (process.env.REDIS_URL || 'redis://127.0.0.1:6379'));
  } catch (err) {
    app.log.warn('Redis not available, running without cache');
  }

    app.log.info('Health check: http://' + HOST + ':' + PORT + '/v1/health');
  } catch (err) {
    app.log.error(err, 'Service start failed');
    process.exit(1);
  }
}

// ============================================================
// 优雅关闭
// ============================================================
async function shutdown(signal: string): Promise<void> {
  app.log.info('Received ' + signal + ', shutting down...');
  await app.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
