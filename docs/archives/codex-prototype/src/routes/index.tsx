import { createFileRoute, Link } from "@tanstack/react-router";
import { FIXTURE_LABELS, type FixtureKey } from "@/features/demand/fixtures";
import { DemoDataBadge } from "@/features/demand/components";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "演立方 V7.2 · Slice1 演示中心" },
      {
        name: "description",
        content:
          "MVP-SLICE1-DEMAND-BRIEF 单切片：公开演员详情 → 补充必要信息 → Brief 查看与确认 → 后仰喜剧工作台。",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoIndex,
});

type Row = {
  key: FixtureKey;
  target: "customer_brief" | "customer_new" | "tenant" | "actor";
  hint: string;
};

const ROWS: Row[] = [
  { key: "actor_intent_draft", target: "customer_new", hint: "页面 B · Demand draft" },
  {
    key: "program_intent_ready",
    target: "customer_brief",
    hint: "页面 C · ready_for_confirmation",
  },
  {
    key: "brief_confirmed_pending_consent",
    target: "customer_brief",
    hint: "页面 C · pending_consent",
  },
  { key: "brief_matchable", target: "customer_brief", hint: "页面 C · matchable + active 授权" },
  { key: "brief_conflict", target: "customer_brief", hint: "页面 C · 冲突阻断" },
  { key: "ai_unavailable", target: "customer_new", hint: "页面 B · AI 不可用" },
  { key: "brief_superseded", target: "customer_brief", hint: "页面 C · 旧版本只读" },
  { key: "tenant_authorized_workspace", target: "tenant", hint: "页面 D · 已授权工作台" },
  { key: "tenant_not_related", target: "tenant", hint: "页面 D · 404 / 无对象关系" },
  { key: "demand_withdrawn", target: "customer_brief", hint: "页面 C · Demand withdrawn" },
  { key: "demand_authorization_expired", target: "customer_brief", hint: "页面 C · expired" },
];

function DemoIndex() {
  return (
    <div className="yl-app min-h-screen">
      <div className="border-b border-[var(--yl-border)] bg-[var(--yl-bg-surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-base font-semibold text-[var(--yl-text-primary)]">
              演立方 V7.2 · Slice1 演示中心
            </div>
            <div className="text-[12px] text-[var(--yl-text-tertiary)]">
              MVP-SLICE1-DEMAND-BRIEF · 展示层与 UI/UX 原型
            </div>
          </div>
          <DemoDataBadge />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <section className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-5">
          <h1 className="text-lg font-semibold text-[var(--yl-text-primary)]">四个页面入口</h1>
          <p className="mt-1 text-[13px] text-[var(--yl-text-secondary)]">
            全部为脱敏 Fixture 演示，不含真实客户/演员/价格/合同。顶部状态使用
            <code className="mx-1 rounded bg-[var(--yl-bg-muted)] px-1 text-[12px]">
              display_status
            </code>
            ； CTA 可用性以
            <code className="mx-1 rounded bg-[var(--yl-bg-muted)] px-1 text-[12px]">
              available_actions
            </code>
            为准；资源状态用于展示版本、授权和回执事实。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <EntryCard
              title="页面 A"
              subtitle="公开演员详情"
              to={{ path: "/m/actors/$actorId", params: { actorId: "actor-linzhou" } }}
              path="/m/actors/actor-linzhou"
            />
            <EntryCard
              title="页面 B"
              subtitle="补充必要信息"
              to={{ path: "/m/demands/new" }}
              path="/m/demands/new"
            />
            <EntryCard
              title="页面 C"
              subtitle="Brief 查看与确认"
              to={{
                path: "/m/demands/$demandId/brief",
                params: { demandId: "demand-fx2" },
                search: { fixture: "program_intent_ready" },
              }}
              path="/m/demands/demand-fx2/brief"
            />
            <EntryCard
              title="页面 D"
              subtitle="后仰喜剧工作台"
              to={{
                path: "/supplier/demands/$demandId/brief",
                params: { demandId: "demand-fx8" },
                search: { fixture: "tenant_authorized_workspace" },
              }}
              path="/supplier/demands/demand-fx8/brief"
            />
          </div>
        </section>

        <section className="mt-6 rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-5">
          <h2 className="text-base font-semibold text-[var(--yl-text-primary)]">
            11 个 Fixture 切换
          </h2>
          <p className="mt-1 text-[12px] text-[var(--yl-text-tertiary)]">
            仅在演示/预览中可见；不进入正式导航。
          </p>
          <ul className="mt-3 divide-y divide-[var(--yl-border)] rounded-[var(--yl-radius-md)] border border-[var(--yl-border)]">
            {ROWS.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--yl-text-primary)]">
                    {FIXTURE_LABELS[r.key]}
                  </div>
                  <div className="text-[11px] text-[var(--yl-text-tertiary)]">{r.hint}</div>
                </div>
                <FixtureLink row={r} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 grid gap-3 rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-5 text-[12px] text-[var(--yl-text-secondary)]">
          <h2 className="text-base font-semibold text-[var(--yl-text-primary)]">交付说明</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              仅新增：<code>src/features/demand/*</code>、<code>src/routes/m.*</code>、
              <code>src/routes/supplier.*</code>、<code>src/styles.css</code> 追加
              <code>--yl-*</code> Token。未新增依赖。
            </li>
            <li>
              当前已冻结原型所需 View 类型（<code>DemandBriefCustomerView</code> /
              <code>TenantBriefWorkspaceView</code>）；真实 Request、认证、幂等和错误响应在 API
              接入阶段确认。
            </li>
            <li>
              顶部状态使用 <code>display_status</code>；CTA 可用性以 <code>available_actions</code>{" "}
              为准；资源状态用于展示版本、授权和回执事实。
            </li>
            <li>
              未实现（<code>BLOCKED_BY_PRODUCT_OR_API</code>）：真实 API、认证、Idempotency-Key
              幂等查询、Toast/i18n、版本差异视图、报价/合同/路由。
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function EntryCard({
  title,
  subtitle,
  to,
  path,
}: {
  title: string;
  subtitle: string;
  to:
    | { path: "/m/actors/$actorId"; params: { actorId: string } }
    | { path: "/m/demands/new" }
    | {
        path: "/m/demands/$demandId/brief";
        params: { demandId: string };
        search: { fixture: FixtureKey };
      }
    | {
        path: "/supplier/demands/$demandId/brief";
        params: { demandId: string };
        search: { fixture: FixtureKey };
      };
  path: string;
}) {
  return (
    <div className="rounded-[var(--yl-radius-md)] border border-[var(--yl-border)] bg-[var(--yl-bg-page)] p-3">
      <div className="text-[11px] text-[var(--yl-text-tertiary)]">{title}</div>
      <div className="mt-0.5 text-sm font-semibold text-[var(--yl-text-primary)]">{subtitle}</div>
      <div className="mt-1 text-[11px] text-[var(--yl-text-tertiary)]">{path}</div>
      <FixtureBridge to={to}>
        <span className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-[var(--yl-radius-sm)] bg-[var(--yl-primary)] px-3 text-[13px] text-white">
          打开
        </span>
      </FixtureBridge>
    </div>
  );
}

function FixtureBridge({
  to,
  children,
}: {
  to:
    | { path: "/m/actors/$actorId"; params: { actorId: string } }
    | { path: "/m/demands/new" }
    | {
        path: "/m/demands/$demandId/brief";
        params: { demandId: string };
        search: { fixture: FixtureKey };
      }
    | {
        path: "/supplier/demands/$demandId/brief";
        params: { demandId: string };
        search: { fixture: FixtureKey };
      };
  children: React.ReactNode;
}) {
  if (to.path === "/m/actors/$actorId") {
    return (
      <Link to={to.path} params={to.params}>
        {children}
      </Link>
    );
  }
  if (to.path === "/m/demands/new") {
    return <Link to={to.path}>{children}</Link>;
  }
  if (to.path === "/m/demands/$demandId/brief") {
    return (
      <Link to={to.path} params={to.params} search={to.search}>
        {children}
      </Link>
    );
  }
  return (
    <Link to={to.path} params={to.params} search={to.search}>
      {children}
    </Link>
  );
}

function FixtureLink({ row }: { row: Row }) {
  const cls =
    "inline-flex min-h-[36px] items-center justify-center rounded-[var(--yl-radius-sm)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] px-3 text-[13px] text-[var(--yl-text-primary)] hover:border-[var(--yl-primary)] hover:text-[var(--yl-primary)]";
  if (row.target === "customer_new") {
    return (
      <Link to="/m/demands/new" search={{ fixture: row.key } as never} className={cls}>
        打开
      </Link>
    );
  }
  if (row.target === "actor") {
    return (
      <Link to="/m/actors/$actorId" params={{ actorId: "actor-linzhou" }} className={cls}>
        打开
      </Link>
    );
  }
  if (row.target === "tenant") {
    return (
      <Link
        to="/supplier/demands/$demandId/brief"
        params={{ demandId: row.key === "tenant_not_related" ? "unknown-demand" : "demand-fx8" }}
        search={{ fixture: row.key }}
        className={cls}
      >
        打开
      </Link>
    );
  }
  // customer_brief
  return (
    <Link
      to="/m/demands/$demandId/brief"
      params={{ demandId: "demand-" + row.key.slice(0, 6) }}
      search={{ fixture: row.key }}
      className={cls}
    >
      打开
    </Link>
  );
}
