// ============================================================
// 统一错误处理中间件
// 捕获所有未处理异常，按统一响应格式返回
// ============================================================

import type { FastifyInstance, FastifyError } from 'fastify';
import type { ApiResponse } from '../types/index.js';

/**
 * 应用级错误类
 * 业务逻辑中抛出此错误，由 error handler 统一处理
 */
export class AppError extends Error {
  public readonly code: number;
  public readonly statusCode: number;
  public override readonly cause: unknown;

  constructor(
    code: number,
    message: string,
    statusCode: number = 400,
    cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

/**
 * 常见错误工厂
 */
export const Errors = {
  /** 资源不存在 */
  notFound: (resource: string): AppError =>
    new AppError(9901, `${resource}不存在`, 404),

  /** 参数校验失败 */
  validation: (message: string): AppError =>
    new AppError(9902, message, 400),

  /** 未授权 */
  unauthorized: (message: string = '未授权'): AppError =>
    new AppError(1001, message, 401),

  /** 权限不足 */
  forbidden: (message: string = '权限不足'): AppError =>
    new AppError(1005, message, 403),

  /** 冲突（如重复创建） */
  conflict: (message: string): AppError =>
    new AppError(9903, message, 409),

  /** 内部错误 */
  internal: (message: string = '服务器内部错误'): AppError =>
    new AppError(9999, message, 500),
} as const;

/**
 * 注册全局错误处理器到 Fastify 实例
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    // 已发送响应则快速退出
    if (reply.sent) {
      return;
    }

    // AppError — 业务异常
    if (error instanceof AppError) {
      const body: ApiResponse<null> = {
        code: error.code,
        data: null,
        message: error.message,
      };

      reply.status(error.statusCode).send(body);
      return;
    }

    // Fastify 参数校验错误
    if (error.validation) {
      const body: ApiResponse<null> = {
        code: 9902,
        data: null,
        message: `参数校验失败: ${error.message}`,
      };

      reply.status(400).send(body);
      return;
    }

    // 未知错误 — 记录日志后返回通用错误
    const traceId = crypto.randomUUID();
    request.log.error({ traceId, err: error }, '未处理的服务器异常');

    const body: ApiResponse<null> = {
      code: 9999,
      data: null,
      message: `服务器内部错误 (traceId: ${traceId})`,
    };

    reply.status(500).send(body);
  });

  // 404 处理
  app.setNotFoundHandler((_request, reply) => {
    const body: ApiResponse<null> = {
      code: 9904,
      data: null,
      message: '请求的接口不存在',
    };

    reply.status(404).send(body);
  });
}
