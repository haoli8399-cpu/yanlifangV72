import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BriefVersionBanner,
  ConfirmationReceipt,
  ConsentInactiveNote,
  ConsentSummary,
  SourceIntentCard,
  StatusResponsibilityBar,
  TruthItemCard,
  formatDT,
  formatDTChinese,
  getPreferenceDisplay,
} from "@/features/demand/components";

import {
  BriefSummaryList,
  CustomerTopBar,
  DemoBar,
  FlowStepper,
  PageHeading,
  type FlowStep,
  type SummaryRow,
} from "@/features/demand/ui";
import { FIXTURE_LABELS, getCustomerFixture, type FixtureKey } from "@/features/demand/fixtures";
import type {
  BriefItem,
  BriefVersionView,
  ConfirmationReceiptView,
  DemandBriefCustomerView,
  SourceIntentView,
} from "@/features/demand/types";
import { setSession, useSession, buildFlowReceipt } from "@/features/demand/session-state";

type Search = { fixture?: FixtureKey };

// 稳定演示时间戳 —— 避免 render 期使用 new Date() 造成 SSR/CSR 不一致(React #418)。
const DEMO_NOW = "2026-07-17T09:20:00+08:00";
const DEMO_CONSENT_EXPIRES = "2027-01-31T23:59:59+08:00";

export const Route = createFileRoute("/m/demands/$demandId/brief")({
  head: () => ({
    meta: [
      { title: "确认活动需求 — 演立方（演示）" },
      {
        name: "description",
        content: "核对 AI 整理好的活动需求内容，并单独决定是否同意寻找服务团队。",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    fixture: typeof s.fixture === "string" ? (s.fixture as FixtureKey) : undefined,
  }),
  component: BriefCustomerPage,
});

function BriefCustomerPage() {
  const { demandId } = useParams({ from: "/m/demands/$demandId/brief" });
  const search = useSearch({ from: "/m/demands/$demandId/brief" }) as Search;

  if (demandId === "session") {
    return <SessionBriefPage />;
  }

  const fixture = search.fixture ?? "program_intent_ready";
  const resp = getCustomerFixture(fixture);
  if (!resp || !resp.data) {
    return <NotFoundBlock />;
  }
  return <BriefCustomerInner demandId={demandId} fixture={fixture} resp={resp} />;
}


function BriefCustomerInner({
  demandId,
  fixture,
  resp,
}: {
  demandId: string;
  fixture: FixtureKey;
  resp: NonNullable<ReturnType<typeof getCustomerFixture>>;
}) {
  const [confirmedReceipt, setConfirmedReceipt] = useState<null | ReturnType<
    typeof buildBriefReceipt
  >>(null);
  const [consentReceipt, setConsentReceipt] = useState<null | ReturnType<
    typeof buildConsentReceipt
  >>(null);
  const [revokeReceipt, setRevokeReceipt] = useState<null | ReturnType<typeof buildRevokeReceipt>>(
    null,
  );

  const view = resp.data!.resource;
  const meta = resp.data!.meta;
  const brief = view.current_brief;

  const summaryRows: SummaryRow[] = useMemo(() => {
    if (!brief) return [];
    // Only fact + gap items go into the compact summary; conflict/inference get their own block.
    return brief.items
      .filter((it) => it.classification === "fact" || it.classification === "gap")
      .map<SummaryRow>((it) => ({
        key: it.key,
        label: it.label,
        value: it.display_value ?? "—",
        status: it.classification === "fact" ? "fact" : "gap",
        hint: it.classification === "gap" ? it.gap_impact : undefined,
      }));
  }, [brief]);

  const attentionItems: BriefItem[] = useMemo(() => {
    if (!brief) return [];
    return brief.items.filter(
      (it) => it.classification === "conflict" || it.classification === "inference",
    );
  }, [brief]);

  const isBlocked = (brief?.blocker_keys.length ?? 0) > 0;
  const isSuperseded = brief?.confirmation_status === "superseded";

  const responsibility =
    view.lifecycle_status === "withdrawn"
      ? "这份活动需求已撤回，无需操作"
      : view.lifecycle_status === "expired"
        ? "如仍要办活动，请重新发起"
        : isSuperseded
          ? "这是历史版本，请查看当前版本"
          : brief?.confirmation_status === "ready_for_confirmation"
            ? "先核对活动需求内容，再决定是否同意寻找服务团队"
            : brief?.confirmation_status === "confirmed" &&
                view.lifecycle_status === "pending_consent"
              ? "请决定是否同意寻找服务团队"
              : view.lifecycle_status === "matchable"
                ? "服务团队正在核实，如需停止可停止寻找服务团队"
                : "补充必要信息";

  const nextStep = isSuperseded
    ? "查看当前版本"
    : view.lifecycle_status === "matchable"
      ? "服务团队正在核实（尚未接单）"
      : brief?.confirmation_status === "confirmed" && view.lifecycle_status === "pending_consent"
        ? "查看要分享的内容，并同意寻找服务团队"
        : brief?.confirmation_status === "ready_for_confirmation"
          ? "确认以上需求（第 " + brief.sequence + " 版）"
          : "补充或修改内容";

  const canConfirm =
    meta.available_actions.includes("brief.confirm_own") && !isBlocked && !confirmedReceipt;
  const canGrant =
    meta.available_actions.includes("demand.matching_consent.manage_own") &&
    view.matching_consent?.status !== "active" &&
    view.lifecycle_status !== "matchable" &&
    !consentReceipt;
  const canRevoke =
    view.matching_consent?.status === "active" &&
    meta.available_actions.includes("demand.matching_consent.manage_own") &&
    !revokeReceipt;

  // Determine active step
  const step: FlowStep =
    view.lifecycle_status === "matchable"
      ? 3
      : brief?.confirmation_status === "confirmed" && view.lifecycle_status === "pending_consent"
        ? 3
        : 2;

  const isReadOnly =
    isSuperseded || view.lifecycle_status === "withdrawn" || view.lifecycle_status === "expired";

  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="确认活动需求" />

      <main className="mx-auto max-w-[720px] space-y-6 px-5 py-6 pb-24 sm:px-8 sm:py-8">
        <DemoBar
          page="确认活动需求"
          fixtureKey={fixture}
          fixtureLabel={FIXTURE_LABELS[fixture]}
          demandCode={view.display_code}
        />

        {!isReadOnly && <FlowStepper current={step} />}

        <PageHeading
          eyebrow={
            isReadOnly ? undefined : step === 3 ? "第 3 步 · 同意寻找服务团队" : "第 2 步 · 确认活动需求"
          }
          title={
            isSuperseded
              ? "这是历史版本（只读）"
              : view.lifecycle_status === "withdrawn"
                ? "活动需求已撤回"
                : view.lifecycle_status === "expired"
                  ? "分享同意已过期"
                  : brief?.confirmation_status === "confirmed" &&
                      view.lifecycle_status === "pending_consent"
                    ? "是否需要我们帮你寻找服务团队？"
                    : "请核对你的活动需求"
          }
          subtitle={
            isSuperseded
              ? "这是较早的版本，仅供查看。最新的活动需求以当前版本为准。"
              : brief?.confirmation_status === "ready_for_confirmation"
                ? "AI 帮你把填写的内容整理成了下面这份活动需求。请核对后确认；确认只表示内容无误，不代表已经开始寻找服务团队。"
                : brief?.confirmation_status === "confirmed"
                  ? "活动需求内容已确认。是否同意寻找服务团队是另一个独立选择，你可以现在同意，也可以先不同意。"
                  : undefined
          }
          aside={
            brief && (
              <div className="text-[12px] text-[var(--yl-text-tertiary)]">
                <div>当前需求（第 {brief.sequence} 版）</div>
                <div className="mt-0.5">更新 {formatDT(brief.updated_at)}</div>
              </div>
            )
          }
        />

        <StatusResponsibilityBar
          displayStatus={meta.display_status}
          responsibility={responsibility}
          nextStep={nextStep}
        />

        {brief && <BriefVersionBanner brief={brief} />}

        {isSuperseded && (
          <div className="rounded-[12px] border border-[var(--yl-border)] bg-[var(--yl-bg-muted)] p-4">
            <div className="text-[15px] font-medium text-[var(--yl-text-primary)]">
              你正在查看历史版本，内容只读。
            </div>
            <Link
              to="/m/demands/$demandId/brief"
              params={{ demandId }}
              search={{ fixture: "brief_confirmed_pending_consent" }}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--yl-primary)] px-4 text-[14px] font-medium text-white hover:bg-[var(--yl-primary-hover)]"
            >
              查看当前版本
            </Link>
          </div>
        )}

        <SourceIntentCard intent={view.source_intent} />

        {/* Unified Brief Summary */}
        {brief && summaryRows.length > 0 && (
          <section
            aria-label="需求摘要"
            className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">需求摘要</h2>
              {brief.ai_assisted && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--yl-bg-primary-soft)] px-2 py-0.5 text-[12px] text-[var(--yl-primary)]">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--yl-primary)]" />
                  AI 辅助整理
                </span>
              )}
            </div>
            <div className="mt-4">
              <BriefSummaryList rows={summaryRows} />
            </div>
          </section>
        )}

        {/* Attention items — AI suggestions & conflicts */}
        {attentionItems.length > 0 && (
          <section aria-label="需要注意的项目" className="space-y-2.5">
            <h2 className="text-[16px] font-semibold text-[var(--yl-text-primary)]">
              需要注意 · {attentionItems.length} 项
            </h2>
            <div className="space-y-2.5">
              {attentionItems.map((it) => (
                <TruthItemCard key={it.key} item={it} />
              ))}
            </div>
          </section>
        )}

        {isBlocked && brief && (
          <div className="rounded-[12px] border border-[var(--yl-border-error)] bg-[var(--yl-bg-error)] p-4">
            <div className="text-[15px] font-medium text-[var(--yl-error)]">
              有几项还需要处理，才能确认这份活动需求
            </div>
            <ul className="mt-2 list-disc pl-5 text-[13px] leading-relaxed text-[var(--yl-error)]">
              {brief.blocker_keys.map((k) => (
                <li key={k}>{k} · 请在上方对应项目里处理</li>
              ))}
            </ul>
          </div>
        )}

        {/* Brief 确认区 —— 主操作 */}
        {brief && !isReadOnly && brief.confirmation_status !== "confirmed" && (
          <section
            aria-label="确认以上需求"
            className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
          >
            <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">
              确认以上需求
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
              点击确认后，这一版将作为最新的活动需求。
              <br />
              确认只表示内容无误，不代表演员档期、报价、服务团队或合同已确定。
            </p>
            {confirmedReceipt ? (
              <div className="mt-4">
                <ConfirmationReceipt receipt={confirmedReceipt} />
              </div>
            ) : canConfirm ? (
              <button
                type="button"
                onClick={() => setConfirmedReceipt(buildBriefReceipt(brief.id, brief.sequence))}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-[12px] bg-[var(--yl-primary)] px-6 text-[16px] font-semibold text-white shadow-[var(--yl-shadow-sm)] transition-colors hover:bg-[var(--yl-primary-hover)] sm:w-auto"
              >
                确认以上需求
              </button>
            ) : (
              <div className="mt-4 rounded-[10px] bg-[var(--yl-bg-muted)] p-3 text-[13px] leading-relaxed text-[var(--yl-text-secondary)]">
                现在还不能确认，原因：
                {isBlocked
                  ? "还有信息不一致或必填项没填，请先在上方处理。"
                  : "当前状态不允许确认。"}
              </div>
            )}
          </section>
        )}

        {/* 已完成 Brief 确认，展示服务端回执 */}
        {!confirmedReceipt &&
          view.latest_receipts
            .filter((r) => r.receipt_type === "brief_confirmation")
            .map((r) => <ConfirmationReceipt key={r.receipt_id} receipt={r} />)}

        {/* Consent 区块 —— 只有在 Brief 已确认后独立出现 */}
        {brief && brief.confirmation_status === "confirmed" && !isReadOnly && (
          <section
            aria-label="是否需要我们帮你寻找服务团队"
            className="space-y-4 rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
          >
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">
                是否需要我们帮你寻找服务团队？
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
                这一步和确认需求内容是分开的。只有你同意后，我们才会用下面这些本次活动的必要信息，帮你去找合适的服务团队。
              </p>
            </div>
            <ConsentSummary
              briefVersion={brief.sequence}
              sharedFields={[
                { label: "活动类型" },
                { label: "活动目标" },
                { label: "活动日期" },
                { label: "城市" },
                { label: "场地情况" },
                { label: "观众规模" },
                { label: "预算范围" },
                { label: "所需服务" },
                { label: "内容注意事项" },
                { label: "演员意向（不含个人身份信息）" },
              ]}
              purposeLabel="用于帮你找合适的服务团队"
              recipientRule="符合平台资质的候选服务团队"
              expiresAt={view.matching_consent?.expires_at ?? DEMO_CONSENT_EXPIRES}
              scopeVersion="matching_minimum_fields_v1"
            />

            {view.matching_consent?.status === "active" ? (
              <>
                {view.latest_receipts
                  .filter((r) => r.receipt_type === "matching_consent")
                  .map((r) => (
                    <ConfirmationReceipt key={r.receipt_id} receipt={r} />
                  ))}
                {consentReceipt && <ConfirmationReceipt receipt={consentReceipt} />}
                {revokeReceipt ? (
                  <ConfirmationReceipt receipt={revokeReceipt} />
                ) : (
                  <RevokeAction
                    canRevoke={canRevoke}
                    onRevoke={() =>
                      setRevokeReceipt(buildRevokeReceipt(view.matching_consent!.grant_id))
                    }
                  />
                )}
              </>
            ) : consentReceipt ? (
              <ConfirmationReceipt receipt={consentReceipt} />
            ) : canGrant ? (
              <button
                type="button"
                onClick={() => setConsentReceipt(buildConsentReceipt(brief.id, brief.sequence))}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[12px] bg-[var(--yl-primary)] px-6 text-[16px] font-semibold text-white shadow-[var(--yl-shadow-sm)] transition-colors hover:bg-[var(--yl-primary-hover)] sm:w-auto"
              >
                同意并开始寻找服务团队
              </button>
            ) : (
              <div className="rounded-[10px] bg-[var(--yl-bg-muted)] p-3 text-[13px] leading-relaxed text-[var(--yl-text-secondary)]">
                当前状态不允许同意。
              </div>
            )}

            {view.matching_consent?.status === "expired" && (
              <ConsentInactiveNote status="expired" />
            )}
          </section>
        )}

        {(view.lifecycle_status === "withdrawn" || view.lifecycle_status === "expired") && (
          <section className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8">
            <div className="text-[16px] font-semibold text-[var(--yl-text-primary)]">
              {view.lifecycle_status === "withdrawn" ? "活动需求已撤回" : "分享同意已过期"}
            </div>
            <div className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
              页面只读；如果还要办活动，请重新发起。
            </div>
            <div className="mt-4 space-y-3">
              {view.latest_receipts.map((r) => (
                <ConfirmationReceipt key={r.receipt_id} receipt={r} />
              ))}
            </div>
            <Link
              to="/m/actors/$actorId"
              params={{ actorId: "actor-linzhou" }}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--yl-border-strong)] bg-[var(--yl-bg-surface)] px-4 text-[14px] font-medium text-[var(--yl-text-primary)] hover:border-[var(--yl-primary)] hover:text-[var(--yl-primary)]"
            >
              重新发起
            </Link>
          </section>
        )}

        <div className="rounded-[10px] bg-[var(--yl-bg-muted)] p-3 text-[12px] leading-relaxed text-[var(--yl-text-tertiary)]">
          请注意：确认内容和同意寻找服务团队，都不代表演员档期、报价、服务团队或合同已经确定。
        </div>
      </main>
    </div>
  );
}

function RevokeAction({ canRevoke, onRevoke }: { canRevoke: boolean; onRevoke: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (!canRevoke) return null;
  return (
    <div className="rounded-[12px] border border-dashed border-[var(--yl-border-error)] bg-[var(--yl-bg-surface)] p-4">
      <div className="text-[15px] font-medium text-[var(--yl-text-primary)]">如果想停止寻找服务团队</div>
      <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--yl-error)]">
        停止后会同时结束这次活动需求，无法再回到“待同意”状态。
      </div>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--yl-border-error)] bg-[var(--yl-bg-surface)] px-4 text-[14px] font-medium text-[var(--yl-error)] hover:bg-[var(--yl-bg-error)]"
        >
          停止寻找服务团队
        </button>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRevoke}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--yl-error)] px-4 text-[14px] font-medium text-white"
          >
            确认停止并结束这次需求
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] px-4 text-[14px] text-[var(--yl-text-secondary)]"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

function NotFoundBlock() {
  return (
    <div className="yl-app flex min-h-screen items-center justify-center p-6">
      <div className="max-w-sm rounded-[12px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 text-center">
        <div className="text-[14px] text-[var(--yl-text-secondary)]">
          资源不存在，或者你没有查看权限。
        </div>
      </div>
    </div>
  );
}

function buildBriefReceipt(objectId: string, sequence: number) {
  return {
    receipt_type: "brief_confirmation" as const,
    receipt_id: "rcpt-local-" + Math.random().toString(36).slice(2, 8),
    object_id: objectId,
    object_version: sequence,
    actor_display_name: "陈女士",
    occurred_at: new Date().toISOString(),
    effect_summary: `已确认这份活动需求。`,
    next_step: "查看要分享的内容，并决定是否同意寻找服务团队",
  };
}

function buildConsentReceipt(briefId: string, sequence: number) {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 86400 * 1000);
  return {
    receipt_type: "matching_consent" as const,
    receipt_id: "rcpt-local-" + Math.random().toString(36).slice(2, 8),
    object_id: briefId,
    object_version: sequence,
    actor_display_name: "陈女士",
    occurred_at: now.toISOString(),
    effect_summary: `你已同意我们在 ${expires.toISOString().slice(0, 10)} 前，将本次活动的必要信息提供给符合条件的服务团队，用于帮你寻找合适方案。`,
    next_step: "接下来，服务团队会确认是否能承接、档期和合作条件；有结果后我们会通知你。",
  };
}

function buildRevokeReceipt(grantId: string) {
  return {
    receipt_type: "matching_consent_revocation" as const,
    receipt_id: "rcpt-local-" + Math.random().toString(36).slice(2, 8),
    object_id: grantId,
    object_version: 1,
    actor_display_name: "陈女士",
    occurred_at: new Date().toISOString(),
    effect_summary: "已停止寻找服务团队，这次活动需求同时结束。",
    next_step: "如果还想办活动，可以重新发起需求。",
  };
}

// ==================================================================
// 会话模式 —— 主流程页面 C（压缩后：提交 = 已确认；独立授权寻找服务团队）
// ==================================================================
function SessionBriefPage() {
  const { session, hydrated } = useSession();
  const [tempDeclined, setTempDeclined] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);

  if (!hydrated) {
    return <BriefSkeleton />;
  }

  if (!session?.source || !session.form || !session.briefConfirmed) {
    return (
      <div className="yl-app min-h-screen">
        <CustomerTopBar subtitle="活动需求" />
        <main className="mx-auto max-w-[720px] px-5 py-10 sm:px-8">
          <DemoBar page="活动需求" fixtureKey="session_flow" />
          <div className="mt-6 rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6">
            <div className="text-[16px] font-medium text-[var(--yl-text-primary)]">
              还没有提交活动需求
            </div>
            <div className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
              请先从演员公开资料页发起，填写活动信息后再回到这里。
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/m/demands/new"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--yl-primary)] px-4 text-[14px] font-medium text-white hover:bg-[var(--yl-primary-hover)]"
              >
                去填写活动需求
              </Link>
              <Link
                to="/m/actors/$actorId"
                params={{ actorId: "actor-linzhou" }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--yl-border-strong)] bg-[var(--yl-bg-surface)] px-4 text-[14px] font-medium text-[var(--yl-text-primary)]"
              >
                返回演员公开资料
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const src = session.source;
  const form = session.form;
  const consentGranted = session.consentGranted;

  const summaryRows: SummaryRow[] = [
    {
      key: "event_type",
      label: "活动类型",
      value: form.event_type_label,
      status: "fact",
    },
    {
      key: "event_goals",
      label: "活动目标",
      value: form.event_goals.join("、") || "—",
      status: "fact",
    },
    {
      key: "venue_status",
      label: "场地情况",
      value: form.venue_status_label,
      status: "fact",
    },
    {
      key: "content_constraints",
      label: "需要避开的话题",
      value: form.content_constraints.trim() || "暂无",
      status: form.content_constraints.trim() ? "fact" : "gap",
    },
    {
      key: "source_intent",
      label: "感兴趣的演员",
      value: `${getPreferenceDisplay(src.preference, "演员")}·${src.actorName}`,
      status: "fact",
    },
  ];

  const onGrant = () => {
    setSession({
      consentGranted: buildFlowReceipt(
        `你已同意平台使用本次活动的必要信息，帮你寻找合适的服务团队，有效期至 ${DEMO_CONSENT_EXPIRES.slice(0, 10)}。`,
        "服务团队会确认能否承接、档期和合作条件，有结果后我们会通知你。",
      ),
    });
    setTempDeclined(false);
  };

  const onStop = () => {
    setSession({ consentGranted: null });
    setConfirmingRevoke(false);
    setTempDeclined(false);
  };

  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="活动需求" />
      <main className="mx-auto max-w-[720px] space-y-6 px-5 py-6 pb-16 sm:px-8 sm:py-8">
        <DemoBar page="活动需求" fixtureKey="session_flow" />

        {/* ============ 已授权成功态 ============ */}
        {consentGranted ? (
          <>
            <PageHeading
              title="正在为你寻找合适的服务团队"
              subtitle="服务团队会确认能否承接、档期和合作条件，有结果后我们会通知你。"
            />

            <section className="rounded-[14px] border border-[var(--yl-border-success)] bg-[var(--yl-bg-success)] p-5 sm:p-6">
              <div className="text-[15px] font-medium text-[var(--yl-success)]">
                寻找服务团队进行中
              </div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--yl-text-secondary)]">
                我们已经开始把本次活动的必要信息提供给符合条件的服务团队。你可以随时查看活动需求、授权记录，或停止寻找。
              </div>
            </section>

            <CollapsibleCard
              title="查看活动需求"
              open={showSummary}
              onToggle={() => setShowSummary((v) => !v)}
            >
              <div className="pt-2">
                <BriefSummaryList rows={summaryRows} />
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="查看授权记录"
              open={showRecord}
              onToggle={() => setShowRecord((v) => !v)}
            >
              <div className="pt-3 text-[14px] leading-relaxed text-[var(--yl-text-primary)]">
                陈女士于 {formatDTChinese(consentGranted.occurred_at)}{" "}
                同意平台使用本次活动的必要信息寻找服务团队，有效期至{" "}
                {formatDTChinese(DEMO_CONSENT_EXPIRES).replace(/\s\d{2}:\d{2}$/, "")}。
              </div>
              <div className="mt-2 text-[12px] text-[var(--yl-text-tertiary)]">
                本次授权只用于寻找服务团队，不代表演员档期、报价或合同已确定。
              </div>
            </CollapsibleCard>

            <section className="rounded-[14px] border border-dashed border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-5 sm:p-6">
              <div className="text-[15px] font-medium text-[var(--yl-text-primary)]">
                停止寻找服务团队
              </div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--yl-text-secondary)]">
                停止后，我们不会再把本次活动信息提供给新的服务团队。你之后仍然可以重新开始寻找。
              </div>
              {!confirmingRevoke ? (
                <button
                  type="button"
                  onClick={() => setConfirmingRevoke(true)}
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--yl-border-error)] bg-[var(--yl-bg-surface)] px-4 text-[14px] font-medium text-[var(--yl-error)] hover:bg-[var(--yl-bg-error)]"
                >
                  停止寻找
                </button>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onStop}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--yl-error)] px-4 text-[14px] font-medium text-white"
                  >
                    确认停止
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRevoke(false)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] px-4 text-[14px] text-[var(--yl-text-secondary)]"
                  >
                    取消
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* ============ 已提交，独立授权决策 ============ */}
            <PageHeading
              title="活动需求已提交"
              subtitle="你可以先检查活动信息，再决定是否现在开始寻找服务团队。"
            />

            <section
              aria-label="活动信息摘要"
              className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">
                  活动信息
                </h2>
                <Link
                  to="/m/demands/new"
                  className="text-[13px] font-medium text-[var(--yl-primary)] hover:underline"
                >
                  修改活动需求
                </Link>
              </div>
              <div className="mt-4">
                <BriefSummaryList rows={summaryRows} />
              </div>
            </section>

            <SourceIntentCard
              intent={{
                resource_type: "actor_profile",
                resource_id: src.actorId,
                resource_version_id: src.actorId + "@public",
                display_name: src.actorName,
                kind_label: "演员",
                cover_image_url: null,
                preference_strength: src.preference,
                preference_label: src.preferenceLabel,
                public_updated_at: DEMO_NOW,
                evidence_status: "verified",
                non_commitment_notice: "偏好已保留，档期与合作条件仍需确认。",
              }}
            />

            {/* 独立授权寻找服务团队 */}
            <section
              aria-label="是否现在开始寻找服务团队"
              className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
            >
              <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">
                是否现在开始寻找服务团队？
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
                开始后，我们会把本次活动所需的信息提供给符合条件的服务团队，请他们确认能否承接、档期和合作条件。
              </p>

              {/* 默认折叠：查看将提供给服务团队的信息 */}
              <div className="mt-4 rounded-[10px] border border-[var(--yl-border)] bg-[var(--yl-bg-page)]">
                <button
                  type="button"
                  aria-expanded={showDetails}
                  onClick={() => setShowDetails((v) => !v)}
                  className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-[14px] font-medium text-[var(--yl-text-primary)]">
                    查看将提供给服务团队的信息
                  </span>
                  <span
                    aria-hidden
                    className={[
                      "text-[var(--yl-text-tertiary)] transition-transform",
                      showDetails ? "rotate-180" : "",
                    ].join(" ")}
                  >
                    ▾
                  </span>
                </button>
                {showDetails && (
                  <div className="space-y-3 border-t border-[var(--yl-border)] px-4 py-3 text-[13px] leading-relaxed text-[var(--yl-text-secondary)]">
                    <div>
                      <div className="text-[12px] text-[var(--yl-text-tertiary)]">提供的信息</div>
                      <div className="mt-1 text-[var(--yl-text-primary)]">
                        活动类型、活动目标、场地情况、需要避开的话题，以及你感兴趣的演员（不含姓名、手机号、邮箱等个人身份信息）。
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--yl-text-tertiary)]">用途</div>
                      <div className="mt-1 text-[var(--yl-text-primary)]">
                        仅用于让符合条件的服务团队判断能否承接你的活动。
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--yl-text-tertiary)]">接收范围</div>
                      <div className="mt-1 text-[var(--yl-text-primary)]">
                        符合平台资质的候选服务团队。
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--yl-text-tertiary)]">有效期</div>
                      <div className="mt-1 text-[var(--yl-text-primary)]">
                        至 {DEMO_CONSENT_EXPIRES.slice(0, 10)}。
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--yl-text-tertiary)]">停止方式</div>
                      <div className="mt-1 text-[var(--yl-text-primary)]">
                        你可以随时在这里停止寻找，之后不会再把本次活动信息提供给新的服务团队。
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse sm:items-center">
                <button
                  type="button"
                  onClick={onGrant}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-[var(--yl-primary)] px-6 text-[16px] font-semibold text-white shadow-[var(--yl-shadow-sm)] transition-colors hover:bg-[var(--yl-primary-hover)]"
                >
                  开始寻找服务团队
                </button>
                <button
                  type="button"
                  onClick={() => setTempDeclined(true)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[12px] border border-[var(--yl-border-strong)] bg-[var(--yl-bg-surface)] px-6 text-[15px] font-medium text-[var(--yl-text-primary)]"
                >
                  暂时不用
                </button>
              </div>

              {tempDeclined && (
                <div
                  role="status"
                  className="mt-4 rounded-[10px] border border-[var(--yl-border)] bg-[var(--yl-bg-muted)] px-3 py-2 text-[13px] leading-relaxed text-[var(--yl-text-secondary)]"
                >
                  好的，本次活动需求已保留。我们没有开始寻找服务团队，你可以随时回到这里点击"开始寻找服务团队"。
                </div>
              )}
            </section>
          </>
        )}

        <div className="rounded-[10px] bg-[var(--yl-bg-muted)] p-3 text-[12px] leading-relaxed text-[var(--yl-text-tertiary)]">
          提交内容和是否寻找服务团队都不代表演员档期、报价或合同已经确定。
        </div>
      </main>
    </div>
  );
}

function CollapsibleCard({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="text-[15px] font-medium text-[var(--yl-text-primary)]">{title}</span>
        <span
          aria-hidden
          className={[
            "text-[var(--yl-text-tertiary)] transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-[var(--yl-border)] px-5 pb-4">{children}</div>}
    </section>
  );
}

// Silence unused-import warning for symbols kept for fixture mode.
void ConsentInactiveNote;

function BriefSkeleton() {
  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="活动需求" />
      <main className="mx-auto max-w-[720px] space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--yl-bg-muted)]" />
        <div className="h-40 animate-pulse rounded-[14px] bg-[var(--yl-bg-muted)]" />
      </main>
    </div>
  );
}
