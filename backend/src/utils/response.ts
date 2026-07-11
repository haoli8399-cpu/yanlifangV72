// ============================================================
// 统一响应格式工具函数
// 格式：{ code: number, data: T, message: string }
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../types/index.js';

/**
 * 成功响应
 * code 默认为 0，message 默认为 "ok"
 */
export function successResponse<T>(data: T, message: string = 'ok', code: number = 0): ApiResponse<T> {
  return { code, data, message };
}

/**
 * 创建资源成功响应（HTTP 201）
 */
export function createdResponse<T>(data: T, message: string = '创建成功'): ApiResponse<T> {
  return { code: 0, data, message };
}

/**
 * 错误响应
 * code 为错误码，data 为 null
 */
export function errorResponse(code: number, message: string): ApiResponse<null> {
  return { code, data: null, message };
}

/**
 * 分页响应
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'ok'
): ApiResponse<PaginatedResponse<T>> {
  return {
    code: 0,
    data: { items, total, page, pageSize },
    message,
  };
}

/**
 * 分页参数默认值处理
 * 确保 page >= 1，pageSize 在合理范围
 */
export function normalizePagination(
  page?: number,
  pageSize?: number
): { page: number; pageSize: number; offset: number } {
  const normalizedPage = Math.max(1, page ?? 1);
  const normalizedPageSize = Math.min(100, Math.max(1, pageSize ?? 20));
  const offset = (normalizedPage - 1) * normalizedPageSize;

  return { page: normalizedPage, pageSize: normalizedPageSize, offset };
}
