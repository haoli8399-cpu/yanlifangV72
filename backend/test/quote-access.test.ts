import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import { createQuoteRoutes } from '../src/api/quotes.js';
import type { query as QueryFunction } from '../src/utils/db.js';
import {
  canAccessQuote,
  canListQuotes,
  canViewInternalPrices,
  projectQuoteForViewer,
  type QuoteRecord,
  type QuoteViewer,
} from '../src/domain/quote-access.js';

const quote: QuoteRecord = {
  id: 'quote-1',
  demand_id: 'demand-1',
  opportunity_id: 'opportunity-1',
  version: 2,
  total_price: '10000.00',
  channel_price: '7000.00',
  cost_price: '6000.00',
  margin: '40.00',
  status: 'active',
  rejection_reason: '内部审批原因',
  operator_modified: true,
  created_by: 'admin-1',
  _client_id: 'owner-1',
};

const client: QuoteViewer = { sub: 'owner-1', role: 'client' };
const agent: QuoteViewer = { sub: 'owner-1', role: 'agent' };

const IDS = {
  owner: '11111111-1111-4111-8111-111111111111',
  other: '22222222-2222-4222-8222-222222222222',
  performer: '33333333-3333-4333-8333-333333333333',
  finance: '44444444-4444-4444-8444-444444444444',
  editor: '55555555-5555-4555-8555-555555555555',
  demand: '66666666-6666-4666-8666-666666666666',
  opportunity: '77777777-7777-4777-8777-777777777777',
  quote: '88888888-8888-4888-8888-888888888888',
} as const;

const databaseUsers: Record<string, { role: QuoteViewer['role']; admin_role: string | null }> = {
  [IDS.owner]: { role: 'client', admin_role: null },
  [IDS.other]: { role: 'agent', admin_role: null },
  [IDS.performer]: { role: 'performer', admin_role: null },
  [IDS.finance]: { role: 'admin', admin_role: 'finance' },
  [IDS.editor]: { role: 'admin', admin_role: 'content_editor' },
};

const routeQuote: QuoteRecord = {
  ...quote,
  id: IDS.quote,
  demand_id: IDS.demand,
  opportunity_id: IDS.opportunity,
  _client_id: IDS.owner,
};

type QueryCall = { text: string; params: unknown[] };

function createFakeQuery(calls: QueryCall[]) {
  return (async <T>(text: string, params: unknown[] = []) => {
    calls.push({ text, params });

    if (text.includes('FROM users')) {
      const user = databaseUsers[String(params[0])];
      return { rows: user ? [user] : [] } as Awaited<ReturnType<typeof QueryFunction<T>>>;
    }

    if (text.includes('FROM quotes q')) {
      const isDetail = text.includes('WHERE q.id = $1');
      const idMatches = isDetail
        ? params[0] === IDS.quote
        : text.includes('q.demand_id')
          ? params[0] === IDS.demand
          : params[0] === IDS.opportunity;
      const ownerMatches = params.length < 2 || params[1] === routeQuote._client_id;
      return {
        rows: idMatches && ownerMatches ? [routeQuote] : [],
      } as Awaited<ReturnType<typeof QueryFunction<T>>>;
    }

    throw new Error(`测试未处理 SQL: ${text}`);
  }) as typeof QueryFunction;
}

async function createRouteTestApp(calls: QueryCall[]) {
  const app = Fastify();
  await app.register(fjwt, { secret: 'quote-route-test-secret' });
  await app.register(createQuoteRoutes(createFakeQuery(calls)), { prefix: '/v1/quotes' });
  return app;
}

async function authHeader(
  app: Awaited<ReturnType<typeof createRouteTestApp>>,
  sub: string,
  role: QuoteViewer['role']
) {
  const token = app.jwt.sign({ sub, role });
  return { authorization: `Bearer ${token}` };
}

test('客户和销售只能访问自己旧版需求关联的报价', () => {
  assert.equal(canAccessQuote(client, 'owner-1'), true);
  assert.equal(canAccessQuote(client, 'other-owner'), false);
  assert.equal(canAccessQuote(agent, 'owner-1'), true);
  assert.equal(canAccessQuote(agent, 'other-owner'), false);
});

test('演员不能列出或读取报价', () => {
  const performer: QuoteViewer = { sub: 'performer-1', role: 'performer' };
  assert.equal(canListQuotes(performer), false);
  assert.equal(canAccessQuote(performer, 'performer-1'), false);
});

test('客户报价投影删除内部价格和内部操作字段', () => {
  const projected = projectQuoteForViewer(quote, client);

  assert.equal(projected.total_price, '10000.00');
  for (const field of [
    'channel_price',
    'cost_price',
    'margin',
    'rejection_reason',
    'operator_modified',
    'created_by',
    '_client_id',
  ]) {
    assert.equal(field in projected, false, `${field} 不应出现在客户响应中`);
  }
});

test('销售报价投影删除内部价格', () => {
  const projected = projectQuoteForViewer(quote, agent);

  assert.equal(projected.total_price, '10000.00');
  assert.equal('channel_price' in projected, false);
  assert.equal('cost_price' in projected, false);
  assert.equal('margin' in projected, false);
});

test('只有旧版授权后台角色可查看内部价格', () => {
  for (const adminRole of ['super_admin', 'operator', 'finance']) {
    const viewer: QuoteViewer = { sub: 'admin-1', role: 'admin', adminRole };
    assert.equal(canViewInternalPrices(viewer), true);
    assert.equal(projectQuoteForViewer(quote, viewer).cost_price, '6000.00');
  }

  const contentEditor: QuoteViewer = {
    sub: 'editor-1',
    role: 'admin',
    adminRole: 'content_editor',
  };
  assert.equal(canViewInternalPrices(contentEditor), false);
  assert.equal('cost_price' in projectQuoteForViewer(quote, contentEditor), false);
});

test('后台角色可跨旧版需求读取，响应不会泄露查询辅助字段', () => {
  const finance: QuoteViewer = {
    sub: 'finance-1',
    role: 'admin',
    adminRole: 'finance',
  };
  assert.equal(canAccessQuote(finance, 'other-owner'), true);
  assert.equal('_client_id' in projectQuoteForViewer(quote, finance), false);
});

test('by-demand 路由对客户执行 SQL 归属过滤并返回脱敏响应', async (t) => {
  const calls: QueryCall[] = [];
  const app = await createRouteTestApp(calls);
  t.after(() => app.close());

  const ownResponse = await app.inject({
    method: 'GET',
    url: `/v1/quotes/by-demand/${IDS.demand}`,
    headers: await authHeader(app, IDS.owner, 'client'),
  });
  assert.equal(ownResponse.statusCode, 200);
  const ownBody = ownResponse.json();
  assert.equal(ownBody.data.length, 1);
  assert.equal('cost_price' in ownBody.data[0], false);
  assert.equal('margin' in ownBody.data[0], false);
  assert.equal('created_by' in ownBody.data[0], false);

  const otherResponse = await app.inject({
    method: 'GET',
    url: `/v1/quotes/by-demand/${IDS.demand}`,
    headers: await authHeader(app, IDS.other, 'agent'),
  });
  assert.equal(otherResponse.statusCode, 200);
  assert.deepEqual(otherResponse.json().data, []);

  const listCall = calls.find((call) => call.text.includes('q.demand_id = $1'));
  assert.ok(listCall?.text.includes('d.client_id = $2'));
  assert.deepEqual(listCall?.params, [IDS.demand, IDS.owner]);
});

test('by-opportunity 路由阻止销售读取他人报价', async (t) => {
  const calls: QueryCall[] = [];
  const app = await createRouteTestApp(calls);
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: `/v1/quotes/by-opportunity/${IDS.opportunity}`,
    headers: await authHeader(app, IDS.other, 'agent'),
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().data, []);

  const listCall = calls.find((call) => call.text.includes('q.opportunity_id = $1'));
  assert.ok(listCall?.text.includes('d.client_id = $2'));
  assert.deepEqual(listCall?.params, [IDS.opportunity, IDS.other]);
});

test('详情路由对越权用户返回 404，对演员返回 403', async (t) => {
  const calls: QueryCall[] = [];
  const app = await createRouteTestApp(calls);
  t.after(() => app.close());

  const otherResponse = await app.inject({
    method: 'GET',
    url: `/v1/quotes/${IDS.quote}`,
    headers: await authHeader(app, IDS.other, 'agent'),
  });
  assert.equal(otherResponse.statusCode, 404);

  const performerResponse = await app.inject({
    method: 'GET',
    url: `/v1/quotes/${IDS.quote}`,
    headers: await authHeader(app, IDS.performer, 'performer'),
  });
  assert.equal(performerResponse.statusCode, 403);
});

test('详情路由仅向授权后台角色返回内部价格', async (t) => {
  const calls: QueryCall[] = [];
  const app = await createRouteTestApp(calls);
  t.after(() => app.close());

  const financeResponse = await app.inject({
    method: 'GET',
    url: `/v1/quotes/${IDS.quote}`,
    headers: await authHeader(app, IDS.finance, 'admin'),
  });
  assert.equal(financeResponse.statusCode, 200);
  assert.equal(financeResponse.json().data.cost_price, '6000.00');

  const editorResponse = await app.inject({
    method: 'GET',
    url: `/v1/quotes/${IDS.quote}`,
    headers: await authHeader(app, IDS.editor, 'admin'),
  });
  assert.equal(editorResponse.statusCode, 200);
  assert.equal('cost_price' in editorResponse.json().data, false);
  assert.equal('margin' in editorResponse.json().data, false);
});
