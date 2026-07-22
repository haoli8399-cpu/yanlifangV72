// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · 幂等中间件
// SLICE1-SPEC-001 §10: Idempotency-Key + 请求哈希 + 作用域隔离
// ============================================================
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createHash } from 'node:crypto';

const IDEMPOTENCY_HEADER = 'idempotency-key';
const IF_MATCH_HEADER = 'if-match';

interface IdempotentRecord {
  key: string;
  principal: string;
  method: string;
  route: string;
  resourceId: string;
  requestHash: string;
  status: 'processing' | 'completed' | 'failed';
  httpStatus?: number;
  responseBody?: string;
  errorCode?: string;
  retryable?: boolean;
  startedAt: string;
  completedAt?: string;
}

// In-memory store — replace with PostgreSQL table when ready
const store = new Map<string, IdempotentRecord>();

function hashRequest(req: FastifyRequest): string {
  const body = req.body ? JSON.stringify(req.body) : '';
  return createHash('sha256').update(body).digest('hex').slice(0, 16);
}

function buildKey(req: FastifyRequest): string {
  const principal = (req as Record<string,unknown>).user?.sub || 'anonymous';
  const user = (req as unknown as Record<string,unknown>).user as Record<string,unknown> | undefined;
  const tenant = (user?.tenant_id as string) || '';
  const method = req.method;
  const route = req.routeOptions.url || req.url;
  const resourceId = (req.params as Record<string,string>)?.id || '';
  return `${principal}:${tenant}:${method}:${route}:${resourceId}`;
}

export async function idempotencyGuard(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const idemKey = req.headers[IDEMPOTENCY_HEADER] as string | undefined;
  if (!idemKey) return; // Not a write request, skip

  const scope = buildKey(req);
  const requestHash = hashRequest(req);
  const existing = store.get(idemKey);

  if (existing) {
    if (existing.requestHash !== requestHash) {
      reply.status(409).send({
        code: 4093,
        data: null,
        message: 'Idempotency key reuse with different request body',
        error: { conflict: { kind: 'idempotency_key_reuse' as const, current_version: null, current_resource_location: null }, retryable: false, next_action: 'manual_continue' as const },
      });
      return;
    }
    if (existing.status === 'completed') {
      reply.status(existing.httpStatus || 200).send(JSON.parse(existing.responseBody || '{}'));
      return;
    }
    // Still processing, return operation query location
    reply.status(202).send({
      code: 0,
      data: {
        meta: {
          operation: { idempotency_key: idemKey, status: 'processing' as const, replayed: false },
          resource_location: `/v1/idempotent-operations/${idemKey}`,
        },
      },
      message: 'Operation in progress',
    });
    return;
  }

  // Create new record
  store.set(idemKey, {
    key: idemKey,
    principal: scope,
    method: req.method,
    route: req.routeOptions.url || req.url,
    resourceId: (req.params as Record<string,string>)?.id || '',
    requestHash,
    status: 'processing',
    startedAt: new Date().toISOString(),
  });
}

export function completeOperation(idemKey: string, httpStatus: number, body: unknown): void {
  const record = store.get(idemKey);
  if (record) {
    record.status = 'completed';
    record.httpStatus = httpStatus;
    record.responseBody = JSON.stringify(body);
    record.completedAt = new Date().toISOString();
  }
}

export function failOperation(idemKey: string, errorCode: string, retryable = false): void {
  const record = store.get(idemKey);
  if (record) {
    record.status = 'failed';
    record.errorCode = errorCode;
    record.retryable = retryable;
    record.completedAt = new Date().toISOString();
  }
}

export function getOperation(key: string): IdempotentRecord | undefined {
  return store.get(key);
}
