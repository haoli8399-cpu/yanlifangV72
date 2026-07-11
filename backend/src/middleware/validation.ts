// ============================================================
// Zod 输入校验中间件
// 对请求的 query / params / body 进行类型安全校验
// ============================================================

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ZodSchema, ZodType } from 'zod';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

/**
 * 校验请求配置
 */
export interface ValidationSchemas {
  /** Query 参数 schema */
  query?: ZodSchema;
  /** 路径参数 schema */
  params?: ZodSchema;
  /** 请求体 schema */
  body?: ZodSchema;
}

/**
 * 校验中间件工厂
 * 生成 Fastify preHandler，按配置校验 query/params/body
 */
export function validate(
  schemas: ValidationSchemas
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async function validationMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      if (schemas.query) {
        request.query = schemas.query.parse(request.query) as Record<string, string>;
      }

      if (schemas.params) {
        request.params = schemas.params.parse(request.params) as Record<string, string>;
      }

      if (schemas.body) {
        request.body = schemas.body.parse(request.body);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => {
          const path = e.path.length > 0 ? e.path.join('.') : '(root)';
          return `${path}: ${e.message}`;
        });

        reply.status(400).send(
          errorResponse(9902, `参数校验失败: ${messages.join('; ')}`)
        );
        return;
      }

      throw err;
    }
  };
}

/**
 * 创建 Zod 校验的 JSON Schema（兼容 Fastify 内置校验）
 * 用于声明式路由注册
 */
export function zodToJsonSchema(_schema: ZodType): object {
  // 将 Zod schema 转为 JSON Schema 供 Fastify schema 选项使用
  // 简化实现：生产环境建议使用 @fastify/type-provider-zod 或 zod-to-json-schema
  return {
    type: 'object',
    properties: {},
  };
}

/**
 * 常用校验 schema 片段（可复用）
 */
export const CommonSchemas = {
  /** UUID 格式 */
  uuid: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',

  /** 手机号（中国大陆 11 位） */
  phone: '^1[3-9]\\d{9}$',

  /** 日期 YYYY-MM-DD */
  date: '^\\d{4}-\\d{2}-\\d{2}$',

  /** 月份 YYYY-MM */
  month: '^\\d{4}-\\d{2}$',
} as const;
