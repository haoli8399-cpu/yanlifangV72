// ============================================================
// V4.7 方案下载 API — 请求下载 / 状态查询 / Mock 文件
// POST /v1/proposals/:id/download | GET /v1/downloads/:id/status |
// GET /v1/downloads/:id/file
// P0 Mock 模式：不实际生成 PDF/Word，不连接真实数据库
// ============================================================

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import { successResponse } from '../utils/response.js';

// ============================================================
// Zod Schemas
// ============================================================

const idParamSchema = z.object({ id: z.string() });

const downloadBodySchema = z.object({
  format: z.enum(['pdf', 'word']),
  version: z.enum(['approval', 'proposal', 'executive', 'brief']).optional(),
});

// ============================================================
// Mock Store
// ============================================================

type DownloadStatus = 'processing' | 'ready';
type DownloadFormat = z.infer<typeof downloadBodySchema>['format'];
type DownloadVersion = NonNullable<z.infer<typeof downloadBodySchema>['version']>;

interface MockDownload {
  id: string;
  proposal_id: string;
  format: DownloadFormat;
  version: DownloadVersion;
  status: DownloadStatus;
  download_url: string;
  created_at: string;
}

const mockDownloads = new Map<string, MockDownload>();

// ============================================================
// Routes
// ============================================================

export default async function downloadRoutes(app: FastifyInstance) {

  // POST /v1/proposals/:id/download — 请求下载方案
  app.post('/proposals/:id/download', {
    preHandler: [validate({ params: idParamSchema, body: downloadBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id: proposalId } = idParamSchema.parse(req.params);
    const { format, version = 'proposal' } = downloadBodySchema.parse(req.body);

    const downloadId = `dl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const downloadUrl = `/v1/downloads/${downloadId}/file`;
    const download: MockDownload = {
      id: downloadId,
      proposal_id: proposalId,
      format,
      version,
      status: 'ready',
      download_url: downloadUrl,
      created_at: new Date().toISOString(),
    };

    mockDownloads.set(downloadId, download);

    return reply.status(201).send(successResponse({
      download_id: downloadId,
      status: download.status,
      estimated_time: '约1分钟',
      download_url: download.download_url,
    }, '下载任务已创建'));
  });

  // GET /v1/downloads/:id/status — 查询下载状态
  app.get('/downloads/:id/status', {
    preHandler: [validate({ params: idParamSchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const download = mockDownloads.get(id);
    const downloadUrl = download?.download_url ?? `/v1/downloads/${id}/file`;

    return reply.send(successResponse({
      status: download?.status ?? 'ready',
      download_url: downloadUrl,
      error: null,
    }));
  });

  // GET /v1/downloads/:id/file — Mock 文件响应
  app.get('/downloads/:id/file', {
    preHandler: [validate({ params: idParamSchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const download = mockDownloads.get(id);
    const extension = download?.format === 'word' ? 'docx' : 'pdf';
    const message = `Mock download file for ${id}. P0 does not generate real ${extension.toUpperCase()} files.`;

    return reply
      .header('content-type', 'text/plain; charset=utf-8')
      .header('content-disposition', `attachment; filename="${id}.${extension}"`)
      .send(message);
  });
}
