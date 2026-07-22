// ============================================================
// 演立方 V7.2 · ETag / If-Match 并发控制
// SLICE1-SPEC-001 §4.3: resource_version 原子递增 + 409 冲突
// ============================================================
import type { FastifyRequest, FastifyReply } from 'fastify';

const ETAG_HEADER = 'etag';
const IF_MATCH_HEADER = 'if-match';

export function setETag(reply: FastifyReply, version: number): void {
  reply.header(ETAG_HEADER, `"${version}"`);
}

export function checkIfMatch(req: FastifyRequest, reply: FastifyReply, currentVersion: number, resourceLocation: string): boolean {
  const ifMatch = req.headers[IF_MATCH_HEADER] as string | undefined;
  if (!ifMatch) return true; // No If-Match header, allow (for creates)

  const clientVersion = parseInt(ifMatch.replace(/"/g, ''), 10);
  if (isNaN(clientVersion) || clientVersion !== currentVersion) {
    reply.status(409).send({
      code: 4091,
      data: null,
      message: 'Resource version conflict, please refresh and retry',
      error: {
        field_errors: [],
        conflict: {
          kind: 'resource_version' as const,
          current_version: currentVersion,
          current_resource_location: resourceLocation,
        },
        retryable: false,
        next_action: 'refresh_resource' as const,
      },
    });
    return false;
  }
  return true;
}

// Simple in-memory version counter — replace with DB atomic increment
const versions = new Map<string, number>();

export function getVersion(resourceId: string): number {
  return versions.get(resourceId) || 0;
}

export function incrementVersion(resourceId: string): number {
  const next = (versions.get(resourceId) || 0) + 1;
  versions.set(resourceId, next);
  return next;
}
