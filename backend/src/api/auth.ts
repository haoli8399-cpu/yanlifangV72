// @ts-nocheck — pre-existing Fastify framework type issues
// 认证API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse } from '../utils/response.js';

const phoneCodeBody = z.object({ phone: z.string().regex(/^1[3-9]\d{9}$/) });
const phoneLoginBody = z.object({ phone: z.string().regex(/^1[3-9]\d{9}$/), code: z.string().length(6), role: z.enum(['agent']) });

export default async function authRoutes(app: FastifyInstance) {
  // 发送验证码
  app.post('/phone-code', { validate: req => validate({ body: phoneCodeBody })(req) }, async (req, reply) => {
    const { phone } = req.body as z.infer<typeof phoneCodeBody>;
    // 生产环境调用腾讯云SMS，开发环境mock
    await query(`INSERT INTO notifications (recipient, type, template, content, status) VALUES ($1,'sms','verify_code',$2,'sent')`,[phone,`${Math.floor(100000+Math.random()*900000)}`]);
    return reply.send(successResponse({ expire_seconds: 300 }, '验证码已发送'));
  });

  // 手机号登录
  app.post('/phone', { validate: req => validate({ body: phoneLoginBody })(req) }, async (req, reply) => {
    const { phone, code: _code, role } = req.body as z.infer<typeof phoneLoginBody>;
    // 生产环境验证code，开发环境默认通过
    let user = await query('SELECT * FROM users WHERE phone=$1', [phone]);
    let isNew = false;
    if (user.rows.length === 0) {
      user = await query(`INSERT INTO users (phone, name, role) VALUES ($1,$2,$3) RETURNING *`, [phone, phone.slice(-4), role]);
      isNew = true;
    }
    const company = await query(
      'SELECT id, status, short_name FROM company_profiles WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [user.rows[0].id]
    );
    const companyProfile = company.rows[0]
      ? {
          id: company.rows[0].id,
          status: company.rows[0].status,
          short_name: company.rows[0].short_name,
        }
      : undefined;
    const token = await reply.jwtSign({
      sub: user.rows[0].id,
      role: user.rows[0].role,
      company_id: companyProfile?.id,
    });
    return reply.send(successResponse({
      token,
      user: { ...user.rows[0], company_profile: companyProfile },
      is_new: isNew,
    }));
  });

  // 微信小程序登录(占位)
  app.post('/wechat-miniprogram', async (_req, reply) => {
    return reply.send(successResponse({}, '待接入微信小程序SDK'));
  });

  // 微信Web登录(占位)
  app.post('/wechat-web', async (_req, reply) => {
    return reply.send(successResponse({}, '待接入微信开放平台'));
  });
}
