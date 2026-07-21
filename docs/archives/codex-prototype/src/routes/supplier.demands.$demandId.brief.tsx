import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BriefSection,
  BriefVersionBanner,
  DemoDataBadge,
  formatDT,
  SourceIntentCard,
  StatusResponsibilityBar,
  TruthItemCard,
} from "@/features/demand/components";
import { getTenantFixture, type FixtureKey } from "@/features/demand/fixtures";
import type { BriefItem, MatchingSharedFieldKey } from "@/features/demand/types";
import { getSharedFieldLabel } from "@/features/demand/field-labels";

type Search = { fixture?: FixtureKey };

// 纯显示层：把旧的团队备注文案替换为业务化表达，不修改 fixture。
function displayTenantSuggestion(content: string): string {
  return content.replace(
    "建议在核验时确认场地音响与后台条件。",
    "建议在确认能否承接时，了解场地音响和后台条件。",
  );
}

export const Route = createFileRoute("/supplier/demands/$demandId/brief")({
  head: () => ({
    meta: [
      { title: "客户活动需求 — 后仰喜剧（演示）" },
      { name: "description", content: "内部工作台：销售、策划查看客户已同意分享的活动需求内容。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    fixture: (s.fixture as FixtureKey) ?? "tenant_authorized_workspace",
  }),
  component: TenantWorkspaceRoute,
});

function TenantWorkspaceRoute() {
  const search = useSearch({ from: "/supplier/demands/$demandId/brief" }) as Search;
  const fixture = search.fixture ?? "tenant_authorized_workspace";

  const resp = getTenantFixture(fixture);
  if (!resp.data) {
    return <NoRelationPage />;
  }
  return <TenantWorkspacePage view={resp.data.resource} meta={resp.data.meta} />;
}

function TenantWorkspacePage({
  view,
  meta,
}: {
  view: ReturnType<typeof getTenantFixture> extends infer R
    ? R extends { data: { resource: infer V } | null }
      ? V
      : never
    : never;
  meta: NonNullable<ReturnType<typeof getTenantFixture>["data"]>["meta"];
}) {
  const brief = view.shared_brief;

  const [clarifyReason, setClarifyReason] = useState("");
  const [clarifyKey, setClarifyKey] = useState<MatchingSharedFieldKey>("event_date");
  const [requests, setRequests] = useState(view.clarification_requests);

  const grouped = useMemo(() => {
    const map = new Map<BriefItem["section"], BriefItem[]>();
    brief.items.forEach((it) => {
      const arr = map.get(it.section) ?? [];
      arr.push(it);
      map.set(it.section, arr);
    });
    return map;
  }, [brief]);

  const submitClarify = () => {
    if (!clarifyReason.trim()) return;
    setRequests((cur) => [
      ...cur,
      {
        id: "cr-" + Math.random().toString(36).slice(2, 8),
        brief_item_key: clarifyKey,
        reason: clarifyReason.trim(),
        status: "requested",
        requested_at: new Date().toISOString(),
      },
    ]);
    setClarifyReason("");
  };

  return (
    <div className="yl-app min-h-screen">
      <div className="border-b border-[var(--yl-border)] bg-[var(--yl-bg-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div>
            <div className="text-sm font-semibold text-[var(--yl-text-primary)]">
              客户需求工作台
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--yl-text-tertiary)]">后仰喜剧</div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--yl-text-tertiary)]">
            <DemoDataBadge />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* 1. 顶部状态 */}
        <StatusResponsibilityBar
          displayStatus={meta.display_status}
          responsibility={"查看客户已经确认的信息，需要时请客户补充"}
          nextStep={"确认是否能够承接，并补充档期和合作条件"}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--yl-bg-primary-soft)] px-2 py-0.5 text-[11px] text-[var(--yl-primary)]">
            {view.demand.mode_label}
          </span>
          <span className="rounded-full bg-[var(--yl-bg-muted)] px-2 py-0.5 text-[11px] text-[var(--yl-text-secondary)]">
            客户已同意分享本次活动的必要信息
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <SourceIntentCard intent={view.demand.source_intent} />

            <BriefVersionBanner brief={brief} />

            {(["event", "audience", "budget", "service", "constraints"] as const).map((s) => (
              <BriefSection
                key={s}
                section={s}
                items={grouped.get(s) ?? []}
                renderItem={(it) => <TruthItemCard item={it} />}
              />
            ))}

            {/* 独立的 团队内部备注区 */}
            <section className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--yl-text-primary)]">
                  团队内部备注
                </h3>
                <span className="text-[11px] text-[var(--yl-text-tertiary)]">
                  仅团队可见，不会发送给客户
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {view.tenant_suggestions.length === 0 && (
                  <div className="text-[12px] text-[var(--yl-text-tertiary)]">暂无</div>
                )}
                {view.tenant_suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-[var(--yl-radius-sm)] border border-dashed border-[var(--yl-border)] bg-[var(--yl-bg-page)] p-2 text-[13px] text-[var(--yl-text-secondary)]"
                  >
                    <div>{displayTenantSuggestion(s.content)}</div>
                    <div className="mt-1 text-[11px] text-[var(--yl-text-tertiary)]">
                      {s.created_by_display_name} · {formatDT(s.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 侧栏 */}
          <aside className="space-y-4">
            <section className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--yl-text-primary)]">
                请客户补充信息
              </h3>
              <p className="mt-1 text-[11px] text-[var(--yl-text-tertiary)]">
                告诉客户需要哪一项、以及为什么需要；客户能看到。
              </p>
              <label className="mt-3 block text-[12px] text-[var(--yl-text-secondary)]">
                要补充的项目
                <select
                  className="mt-1 min-h-[36px] w-full rounded-[var(--yl-radius-sm)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] px-2 text-[13px]"
                  value={clarifyKey}
                  onChange={(e) => setClarifyKey(e.target.value as MatchingSharedFieldKey)}
                >
                  {view.authorization.shared_field_keys.map((k) => (
                    <option key={k} value={k}>
                      {getSharedFieldLabel(k)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-[12px] text-[var(--yl-text-secondary)]">
                说明原因
                <div className="mt-1 mb-1 text-[11px] text-[var(--yl-text-tertiary)]">
                  请说明为什么需要客户补充“{getSharedFieldLabel(clarifyKey)}”。
                </div>
                <textarea
                  rows={3}
                  value={clarifyReason}
                  onChange={(e) => setClarifyReason(e.target.value)}
                  placeholder="例如：需要确认场地音响情况，以判断专场是否可行。"
                  className="w-full rounded-[var(--yl-radius-sm)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-2 text-[13px]"
                />
              </label>
              <button
                type="button"
                onClick={submitClarify}
                disabled={!clarifyReason.trim()}
                className="mt-3 w-full rounded-[var(--yl-radius-md)] bg-[var(--yl-primary)] px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                发送补充信息请求
              </button>

              {!clarifyReason.trim() && (
                <div className="mt-1 text-[11px] text-[var(--yl-text-tertiary)]">
                  请先填写说明原因后再提交。
                </div>
              )}
              <div className="mt-3 space-y-2">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-[var(--yl-radius-sm)] border border-[var(--yl-border)] bg-[var(--yl-bg-page)] p-2 text-[12px]"
                  >
                    <div className="font-medium text-[var(--yl-text-primary)]">
                      {getSharedFieldLabel(r.brief_item_key as MatchingSharedFieldKey)}
                    </div>
                    <div className="mt-0.5 text-[var(--yl-text-secondary)]">{r.reason}</div>
                    <div className="mt-1 text-[11px] text-[var(--yl-text-tertiary)]">
                      {r.status} · {formatDT(r.requested_at)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--yl-text-primary)]">
                客户确认与授权
              </h3>
              <dl className="mt-2 space-y-1.5 text-[12px]">
                <Kv k="客户确认版本">客户已确认第 {brief.sequence} 版需求</Kv>
                <Kv k="客户确认时间">{brief.confirmed_at ? formatDT(brief.confirmed_at) : "—"}</Kv>
                <Kv k="授权范围">本次需求的必要信息</Kv>
                <Kv k="授权字段">{view.authorization.shared_field_keys.length} 项</Kv>
                <Kv k="授权有效期">{formatDT(view.authorization.expires_at)}</Kv>
              </dl>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--yl-text-tertiary)]">
                你只能查看客户同意分享的信息，不能查看其他资料，也不能修改客户填写的内容。
              </p>
            </section>

            <section className="rounded-[var(--yl-radius-sm)] bg-[var(--yl-bg-muted)] p-3 text-[11px] leading-relaxed text-[var(--yl-text-tertiary)]">
              这里只显示客户同意分享的信息。当前页面不代表已经接单。
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Kv({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-[var(--yl-text-tertiary)]">{k}</dt>
      <dd className="text-[var(--yl-text-primary)]">{children}</dd>
    </div>
  );
}

function NoRelationPage() {
  return (
    <div className="yl-app flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 text-center">
        <h1 className="text-lg font-semibold text-[var(--yl-text-primary)]">页面无法访问</h1>
        <p className="mt-2 text-[13px] text-[var(--yl-text-secondary)]">
          该需求可能不存在，或者你没有查看权限。如有疑问，请联系管理员。
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center justify-center rounded-[var(--yl-radius-md)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] px-4 py-2 text-sm text-[var(--yl-text-primary)]"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
