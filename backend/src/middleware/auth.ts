// ============================================================
// JWT 认证中间件
// 从 Authorization header 提取 Bearer Token
// 由 Supabase Auth 签发，验证后注入 request.user
// ============================================================

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../types/index.js';
import { errorResponse } from '../utils/response.js';

/**
 * JWT 认证中间件
 * 从 Authorization header 提取 Bearer Token 并验证
 * 验证通过后将 JwtPayload 注入 request.user
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractBearerToken(request);

    if (!token) {
      reply.status(401).send(errorResponse(1001, '未提供认证 Token'));
      return;
    }

    const decoded = await request.jwtVerify<JwtPayload>();

    // 确保 payload 包含必要字段
    if (!decoded.sub || !decoded.role) {
      reply.status(401).send(errorResponse(1002, 'Token 格式无效'));
      return;
    }

    request.user = decoded;
  } catch (err: unknown) {
    const fastifyErr = err as { code?: string };
    if (fastifyErr.code === 'FAST_JWT_EXPIRED') {
      reply.status(401).send(errorResponse(1003, 'Token 已过期'));
      return;
    }
    reply.status(401).send(errorResponse(1004, 'Token 验证失败'));
  }
}

/**
 * 从请求中提取 Bearer Token
 */
function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;

  if (!header) {
    return null;
  }

  const parts = header.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 角色校验中间件工厂函数
 * 生成一个中间件，校验当前用户是否包含指定角色
 */
export function requireRole(
  ...roles: string[]
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async function roleMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user;

    if (!user || !roles.includes(user.role)) {
      reply.status(403).send(errorResponse(1005, '权限不足'));
      return;
    }
  };
}

/**
 * 可选认证中间件
 * 有 Token 则验证注入 user，无 Token 则继续（user 为 null）
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const token = extractBearerToken(request);

  if (!token) {
    return;
  }

  try {
    const decoded = await request.jwtVerify<JwtPayload>();
    if (decoded.sub && decoded.role) {
      request.user = decoded;
    }
  } catch {
    // 可选认证失败不拦截，user 保持 null
  }
}
