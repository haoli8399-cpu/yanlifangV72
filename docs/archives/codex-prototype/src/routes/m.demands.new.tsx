import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCustomerFixture,
  aiUnavailableResponse,
  type FixtureKey,
} from "@/features/demand/fixtures";
import {
  AIRecoveryPanel,
  AIWorkingState,
  SourceIntentCard,
  TruthItemCard,
} from "@/features/demand/components";
import {
  CustomerTopBar,
  DemoBar,
  FlowStepper,
  PageHeading,
  useActionBarHeight,
} from "@/features/demand/ui";
import {
  EVENT_TYPE_OPTIONS,
  VENUE_STATUS_OPTIONS,
  setSession,
  useSession,
  buildFlowReceipt,
  type FlowVenueStatus,
} from "@/features/demand/session-state";
import type { SourceIntentView } from "@/features/demand/types";

type Search = { fixture?: FixtureKey };

const DEMO_NOW = "2026-07-17T09:20:00+08:00";

export const Route = createFileRoute("/m/demands/new")({
  head: () => ({
    meta: [
      { title: "填写活动需求 — 演立方（演示）" },
      {
        name: "description",
        content: "填写本次活动的基本信息，提交后可以再决定是否开始寻找服务团队。",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    fixture: typeof s.fixture === "string" ? (s.fixture as FixtureKey) : undefined,
  }),
  component: NewDemandPage,
});

function NewDemandPage() {
  const search = useSearch({ from: "/m/demands/new" }) as Search;
  if (search.fixture) {
    return <FixtureModeInner fixture={search.fixture} />;
  }
  return <SessionModeInner />;
}

// ==================================================================
// 会话模式 —— 主流程 A → B → C 使用
// ==================================================================
function SessionModeInner() {
  const { session, hydrated } = useSession();
  const navigate = useNavigate();

  const source = session?.source ?? null;

  const [eventType, setEventType] = useState(session?.form?.event_type ?? "");
  const [goals, setGoals] = useState<string[]>(session?.form?.event_goals ?? []);
  const [venueStatus, setVenueStatus] = useState<FlowVenueStatus>(
    session?.form?.venue_status ?? "unknown",
  );
  const [constraints, setConstraints] = useState<string>(
    session?.form?.content_constraints ?? "",
  );

  const [errors, setErrors] = useState<{
    event_type?: string;
    event_goals?: string;
  }>({});

  useEffect(() => {
    if (!hydrated) return;
    if (session?.form) {
      setEventType(session.form.event_type ?? "");
      setGoals(session.form.event_goals ?? []);
      setVenueStatus(session.form.venue_status ?? "unknown");
      setConstraints(session.form.content_constraints ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const actionBarRef = useRef<HTMLDivElement>(null);
  useActionBarHeight(actionBarRef);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToField = (key: string) => {
    const el = fieldRefs.current[key];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top - 88;
    window.scrollTo({ top, behavior: "smooth" });
    const target = el.querySelector<HTMLElement>("select, input, textarea, button");
    if (target) window.setTimeout(() => target.focus({ preventScroll: true }), 250);
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!eventType) next.event_type = "请选择活动类型。";
    if (goals.length === 0) next.event_goals = "请至少选择一个活动目标。";
    setErrors(next);
    const firstErr = (["event_type", "event_goals"] as const).find((k) => next[k]);
    if (firstErr) {
      scrollToField(firstErr);
      return;
    }
    const evtLabel =
      EVENT_TYPE_OPTIONS.find((o) => o.code === eventType)?.label ?? eventType;
    const venueLabel =
      VENUE_STATUS_OPTIONS.find((o) => o.code === venueStatus)?.label ?? venueStatus;
    // 提交即视为客户确认当前需求（内部保留 brief_confirmation 语义），
    // 但客户不会再看到独立的“确认以上需求”步骤。
    setSession({
      form: {
        event_type: eventType,
        event_type_label: evtLabel,
        event_goals: goals,
        venue_status: venueStatus,
        venue_status_label: venueLabel,
        content_constraints: constraints,
      },
      briefConfirmed: buildFlowReceipt(
        "已提交并确认这份活动需求。",
        "你可以再决定是否现在开始寻找服务团队。",
      ),
      consentGranted: null,
    });
    navigate({ to: "/m/demands/$demandId/brief", params: { demandId: "session" } });
  };

  const sessionSourceIntent: SourceIntentView | null = source
    ? {
        resource_type: "actor_profile",
        resource_id: source.actorId,
        resource_version_id: source.actorId + "@public",
        display_name: source.actorName,
        kind_label: "演员",
        cover_image_url: null,
        preference_strength: source.preference,
        preference_label: source.preferenceLabel,
        public_updated_at: DEMO_NOW,
        evidence_status: "verified",
        non_commitment_notice: "偏好已保留，档期与合作条件仍需确认。",
      }
    : null;

  if (!hydrated) {
    return <SkeletonNewDemand />;
  }

  if (!sessionSourceIntent) {
    return (
      <div className="yl-app min-h-screen">
        <CustomerTopBar subtitle="填写活动需求" />
        <main className="mx-auto max-w-[720px] px-5 py-10 sm:px-8">
          <DemoBar page="填写活动需求" />
          <div className="mt-6 rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6">
            <div className="text-[16px] font-medium text-[var(--yl-text-primary)]">
              还没有选择你感兴趣的演员
            </div>
            <div className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
              请先从演员公开资料页发起，或返回演示中心查看其他场景。
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/m/actors/$actorId"
                params={{ actorId: "actor-linzhou" }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--yl-primary)] px-4 text-[14px] font-medium text-white hover:bg-[var(--yl-primary-hover)]"
              >
                去看演员公开资料
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--yl-border-strong)] bg-[var(--yl-bg-surface)] px-4 text-[14px] font-medium text-[var(--yl-text-primary)]"
              >
                返回演示中心
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="填写活动需求" />

      <main className="yl-main-with-actionbar mx-auto max-w-[720px] space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <DemoBar page="填写活动需求" fixtureKey="session_flow" />
        <PageHeading
          title="填写活动需求"
          subtitle="填写本次活动的基本信息，提交后你可以决定是否开始寻找服务团队。"
        />

        <SourceIntentCard intent={sessionSourceIntent} />

        <section
          aria-label="活动信息"
          className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
        >
          <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">活动信息</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
            带 <span className="text-[var(--yl-error)]">*</span> 的是必填。
          </p>

          <div className="mt-4 space-y-5">
            <div
              ref={(el) => {
                fieldRefs.current.event_type = el;
              }}
            >
              <FieldGroup
                label="活动类型"
                htmlFor="event_type"
                required
                error={errors.event_type}
              >
                <select
                  id="event_type"
                  aria-invalid={errors.event_type ? true : undefined}
                  className={[
                    "min-h-[48px] w-full rounded-[10px] border bg-[var(--yl-bg-surface)] px-3 text-[15px] text-[var(--yl-text-primary)]",
                    errors.event_type
                      ? "border-[var(--yl-error)]"
                      : "border-[var(--yl-border)]",
                  ].join(" ")}
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    if (errors.event_type) setErrors((x) => ({ ...x, event_type: undefined }));
                  }}
                >
                  <option value="" disabled>
                    请选择
                  </option>
                  {EVENT_TYPE_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.event_goals = el;
              }}
            >
              <FieldGroup
                label="你希望通过这次活动达成什么（可多选）"
                htmlFor="event_goals"
                required
                error={errors.event_goals}
              >
                <div className="flex flex-wrap gap-2">
                  {["团队激励", "回顾年度", "品牌传播", "客户答谢"].map((g) => {
                    const on = goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setGoals((cur) => (on ? cur.filter((x) => x !== g) : [...cur, g]));
                          if (errors.event_goals)
                            setErrors((x) => ({ ...x, event_goals: undefined }));
                        }}
                        className={[
                          "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-4 text-[14px] transition-colors",
                          on
                            ? "border-[var(--yl-primary)] bg-[var(--yl-bg-primary-soft)] text-[var(--yl-primary)] font-medium"
                            : "border-[var(--yl-border)] bg-[var(--yl-bg-surface)] text-[var(--yl-text-secondary)]",
                        ].join(" ")}
                      >
                        {on && <span aria-hidden>✓</span>}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </FieldGroup>
            </div>

            <div>
              <FieldGroup label="场地情况" htmlFor="venue_status">
                <div className="grid gap-2 sm:grid-cols-2">
                  {VENUE_STATUS_OPTIONS.map((opt) => {
                    const selected = venueStatus === opt.code;
                    return (
                      <label
                        key={opt.code}
                        className={[
                          "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] border-2 px-4 text-[15px] transition-colors",
                          selected
                            ? "border-[var(--yl-primary)] bg-[var(--yl-bg-primary-soft)] text-[var(--yl-primary)]"
                            : "border-[var(--yl-border)] bg-[var(--yl-bg-surface)] text-[var(--yl-text-primary)]",
                        ].join(" ")}
                      >
                        <span
                          aria-hidden
                          className={[
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                            selected
                              ? "border-[var(--yl-primary)] bg-[var(--yl-primary)]"
                              : "border-[var(--yl-border-strong)]",
                          ].join(" ")}
                        >
                          {selected && (
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <input
                          type="radio"
                          name="venue_status"
                          className="sr-only"
                          checked={selected}
                          onChange={() => setVenueStatus(opt.code)}
                        />
                        <span className={selected ? "font-medium" : ""}>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </FieldGroup>
            </div>

            <div>
              <FieldGroup label="需要避开的话题（选填）" htmlFor="constraints">
                <div className="mb-2 text-[12px] leading-relaxed text-[var(--yl-text-tertiary)]">
                  比如不能拿谁开玩笑、不能提到哪些品牌或话题。填清楚可以避免现场出现让人不舒服的内容。
                </div>
                <textarea
                  id="constraints"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  rows={3}
                  placeholder="例如：不拿公司高管开玩笑；不提竞品品牌；不涉政治宗教话题。"
                  className="w-full rounded-[10px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-3 text-[15px] leading-relaxed"
                />
              </FieldGroup>
            </div>
          </div>
        </section>
      </main>

      <div ref={actionBarRef} className="yl-action-bar">
        <div className="mx-auto flex max-w-[720px] flex-col gap-2 px-5 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 yl-safe-bottom">
          <Link
            to="/m/actors/$actorId"
            params={{ actorId: "actor-linzhou" }}
            className="inline-flex min-h-[44px] items-center justify-center self-start px-2 text-[14px] text-[var(--yl-text-secondary)] hover:text-[var(--yl-text-primary)] sm:self-auto"
          >
            ← 返回演员公开资料
          </Link>
          <button
            type="button"
            onClick={submit}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-[var(--yl-primary)] px-6 text-[16px] font-semibold text-white shadow-[var(--yl-shadow-sm)] transition-colors hover:bg-[var(--yl-primary-hover)]"
          >
            提交活动需求
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonNewDemand() {
  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="填写活动需求" />
      <main className="mx-auto max-w-[720px] space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--yl-bg-muted)]" />
        <div className="h-32 animate-pulse rounded-[14px] bg-[var(--yl-bg-muted)]" />
      </main>
    </div>
  );
}

// ==================================================================
// Fixture 模式 —— 保留原演示中心入口（不进入正常客户主流程）。
// ==================================================================
function FixtureModeInner({ fixture }: { fixture: FixtureKey }) {
  const isAIDown = fixture === "ai_unavailable";
  const resp = getCustomerFixture(fixture);
  const view = resp?.data?.resource;

  const [goals, setGoals] = useState<string[]>([]);
  const [venueStatus, setVenueStatus] = useState<string>(view?.facts.venue_status ?? "unknown");
  const [constraints, setConstraints] = useState<string>("");
  const [knownOpen, setKnownOpen] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "working" | "failed">(
    isAIDown ? "failed" : "idle",
  );

  const known = useMemo(() => {
    if (!view) return [];
    const f = view.facts;
    const list: Array<[string, string]> = [];
    if (f.event_date)
      list.push([
        "活动日期",
        `${f.event_date.start_date} · ${flexLabel(f.event_date.flexibility)}`,
      ]);
    if (f.city) list.push(["城市", f.city.label]);
    if (f.audience_size)
      list.push(["观众规模", `${f.audience_size.min}–${f.audience_size.max} 人`]);
    if (f.budget_range?.min && f.budget_range.max)
      list.push([
        "预算范围",
        `¥${fmtMoney(f.budget_range.min)} – ¥${fmtMoney(f.budget_range.max)}`,
      ]);
    return list;
  }, [view]);

  const actionBarRef = useRef<HTMLDivElement>(null);
  useActionBarHeight(actionBarRef);

  if (!view) return <NotFound />;

  const startGenerate = () => {
    if (isAIDown) {
      setAiState("failed");
      return;
    }
    setAiState("working");
    setTimeout(() => setAiState("idle"), 800);
  };

  const gaps: Array<{ key: string; label: string; impact: string }> = [
    {
      key: "event_type",
      label: "活动类型与目标",
      impact: "填写后，我们才能判断适合哪些演出方向。",
    },
    {
      key: "venue_status",
      label: "场地情况",
      impact: "填写后，我们才能确认活动是否具备执行条件。",
    },
  ];

  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="填写活动需求" />
      <main className="yl-main-with-actionbar mx-auto max-w-[720px] space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <DemoBar page="填写活动需求" fixtureKey={fixture} />
        <FlowStepper current={1} />
        <PageHeading
          eyebrow="第 1 步 · 填写活动需求"
          title="再告诉我们一些活动信息"
          subtitle="演示中心预置场景数据。"
        />
        <SourceIntentCard intent={view.source_intent} />

        {known.length > 0 && (
          <section
            aria-label="已知信息"
            className="rounded-[12px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)]"
          >
            <button
              type="button"
              onClick={() => setKnownOpen((v) => !v)}
              aria-expanded={knownOpen}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 px-5 py-3 text-left"
            >
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-[var(--yl-text-primary)]">
                  已知信息（{known.length} 项）
                </div>
              </div>
              <span
                aria-hidden
                className={[
                  "shrink-0 text-[var(--yl-text-tertiary)] transition-transform",
                  knownOpen ? "rotate-180" : "",
                ].join(" ")}
              >
                ▾
              </span>
            </button>
            {knownOpen && (
              <dl className="grid gap-3 border-t border-[var(--yl-border)] px-5 py-4 sm:grid-cols-2">
                {known.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[12px] text-[var(--yl-text-tertiary)]">{k}</dt>
                    <dd className="mt-0.5 text-[15px] text-[var(--yl-text-primary)]">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        )}

        <section
          aria-label="必要补充"
          className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
        >
          <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">
            我们还需要你告诉我们这些
          </h2>
          <div className="mt-4 space-y-5">
            <FieldGroup label="活动目标（可多选）" htmlFor="event_goals">
              <div className="flex flex-wrap gap-2">
                {["团队激励", "回顾年度", "品牌传播", "客户答谢"].map((g) => {
                  const on = goals.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setGoals((cur) => (on ? cur.filter((x) => x !== g) : [...cur, g]))
                      }
                      className={[
                        "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-4 text-[14px]",
                        on
                          ? "border-[var(--yl-primary)] bg-[var(--yl-bg-primary-soft)] text-[var(--yl-primary)]"
                          : "border-[var(--yl-border)] bg-[var(--yl-bg-surface)] text-[var(--yl-text-secondary)]",
                      ].join(" ")}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </FieldGroup>
            <FieldGroup label="场地情况" htmlFor="venue_status_fx">
              <select
                id="venue_status_fx"
                className="min-h-[48px] w-full rounded-[10px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] px-3 text-[15px]"
                value={venueStatus}
                onChange={(e) => setVenueStatus(e.target.value)}
              >
                {VENUE_STATUS_OPTIONS.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="需要避开的话题（选填）" htmlFor="constraints_fx">
              <textarea
                id="constraints_fx"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                rows={2}
                className="w-full rounded-[10px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-3 text-[15px]"
              />
            </FieldGroup>
          </div>
        </section>

        <section className="rounded-[14px] border border-[var(--yl-border-ai)] bg-[var(--yl-bg-ai)] p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-[var(--yl-primary)]">AI 辅助整理</h2>
          {aiState === "working" && (
            <div className="mt-4">
              <AIWorkingState />
            </div>
          )}
          {aiState === "failed" && (
            <div className="mt-4">
              <AIRecoveryPanel
                onRetry={() => {
                  setAiState("working");
                  setTimeout(() => setAiState("failed"), 500);
                }}
                onManual={() => setAiState("idle")}
              />
              <div className="mt-2 text-[12px] text-[var(--yl-text-tertiary)]">
                （演示错误响应：{aiUnavailableResponse().message}）
              </div>
            </div>
          )}
          {aiState === "idle" && (
            <div className="mt-4 space-y-2.5">
              {gaps.map((g) => (
                <TruthItemCard
                  key={g.key}
                  item={{
                    key: g.key,
                    label: g.label,
                    section: "event",
                    value: null,
                    display_value: null,
                    classification: "gap",
                    source: {
                      kind: "customer_input",
                      reference_id: null,
                      captured_at: DEMO_NOW,
                    },
                    evidence_status: "declared",
                    affects: ["feasibility"],
                    requires_customer_confirmation: true,
                    gap_impact: g.impact,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <div ref={actionBarRef} className="yl-action-bar">
        <div className="mx-auto flex max-w-[720px] flex-col gap-2 px-5 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 yl-safe-bottom">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center self-start px-2 text-[14px] text-[var(--yl-text-secondary)] sm:self-auto"
          >
            ← 返回演示中心
          </Link>
          <button
            type="button"
            onClick={startGenerate}
            disabled={aiState === "working"}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-[var(--yl-primary)] px-6 text-[16px] font-semibold text-white shadow-[var(--yl-shadow-sm)] hover:bg-[var(--yl-primary-hover)] disabled:opacity-60"
          >
            {view.current_brief ? "更新并查看活动需求（演示）" : "整理并查看活动需求（演示）"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-1 text-[14px] font-medium text-[var(--yl-text-primary)]"
      >
        {label}
        {required && (
          <span aria-label="必填" className="text-[var(--yl-error)]">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <div className="mt-1.5 text-[13px] text-[var(--yl-error)]" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="yl-app flex min-h-screen items-center justify-center p-6">
      <div className="max-w-sm rounded-[12px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 text-center">
        <div className="text-[14px] text-[var(--yl-text-secondary)]">
          该资源不存在或您没有访问权限。
        </div>
      </div>
    </div>
  );
}

function fmtMoney(s: string) {
  return Number(s).toLocaleString("zh-CN");
}
function flexLabel(f: string) {
  return (
    (
      {
        fixed: "固定",
        plus_minus_3_days: "可 ±3 天",
        within_month: "本月内可调",
        negotiable: "可协商",
      } as Record<string, string>
    )[f] || f
  );
}
