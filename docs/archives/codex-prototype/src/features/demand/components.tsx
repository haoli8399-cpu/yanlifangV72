import type { ReactNode } from "react";
import type {
  BriefItem,
  BriefVersionView,
  ConfirmationReceiptView,
  MatchingConsentView,
  SourceIntentView,
} from "./types";

// ============================================================
// Shared demo badge
// ============================================================
export function DemoDataBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--yl-border-warning)] bg-[var(--yl-bg-warning)] px-2 py-0.5 text-[11px] font-medium text-[var(--yl-warning)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--yl-warning)]" />
      演示数据
    </span>
  );
}

// ============================================================
// SourceIntentCard
// ============================================================
export function getPreferenceDisplay(
  strength: SourceIntentView["preference_strength"],
  kindLabel: string,
): string {
  const isActor = kindLabel === "演员";
  if (strength === "reference") {
    return isActor ? "可以推荐相似演员" : "可以推荐相似节目";
  }
  if (strength === "preferred") {
    return isActor ? "优先联系这位演员" : "优先考虑这个节目";
  }
  return isActor ? "只考虑这位演员" : "只考虑这个节目";
}

export function SourceIntentCard({ intent }: { intent: SourceIntentView }) {
  const notice = "请注意：档期、价格和合作条件都还需要确认，选择偏好不代表已经预订。";
  const displayPreference = getPreferenceDisplay(intent.preference_strength, intent.kind_label);
  return (
    <section
      aria-label="你感兴趣的演员或节目"
      className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--yl-bg-muted)] text-[var(--yl-text-secondary)] text-sm font-medium">
          {intent.kind_label === "演员" ? "艺" : "节"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--yl-text-tertiary)]">
              你感兴趣的{intent.kind_label}
            </span>
            <span className="rounded-full bg-[var(--yl-bg-primary-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--yl-primary)]">
              {displayPreference}
            </span>
          </div>
          <div className="mt-1 text-base font-semibold text-[var(--yl-text-primary)]">
            {intent.display_name}
          </div>
          <div className="mt-1 text-xs text-[var(--yl-text-tertiary)]">
            公开资料更新于 {formatDT(intent.public_updated_at)}
          </div>
          <div className="mt-2 rounded-[var(--yl-radius-sm)] bg-[var(--yl-bg-page)] px-2 py-1.5 text-[12px] leading-relaxed text-[var(--yl-text-secondary)]">
            {notice}
          </div>
        </div>
      </div>
    </section>
  );
}


// ============================================================
// TruthItemCard
// ============================================================
const CLASS_LABEL: Record<BriefItem["classification"], string> = {
  fact: "已提供",
  inference: "AI 建议",
  gap: "待补充",
  conflict: "信息不一致",
};

const SRC_LABEL: Record<BriefItem["source"]["kind"], string> = {
  customer_input: "你填写的",
  public_content: "公开资料",
  ai_inference: "AI 建议",
};

// 纯显示层：把旧的项目名替换为自然中文。不修改 item 或 fixture。
const ITEM_LABEL_DISPLAY: Record<string, string> = {
  内容禁忌: "需要避开的话题",
  "内容禁忌 · AI 建议": "需要避开的话题 · AI 建议",
  场地状态: "场地情况",
  来源意向: "感兴趣的演员或节目",
};
function displayItemLabel(label: string): string {
  return ITEM_LABEL_DISPLAY[label] ?? label;
}

export function TruthItemCard({
  item,
  onEdit,
  onCorrect,
  onResolveConflict,
}: {
  item: BriefItem;
  onEdit?: () => void;
  onCorrect?: () => void;
  onResolveConflict?: () => void;
}) {
  const isAI = item.classification === "inference";
  const isConflict = item.classification === "conflict";
  const isGap = item.classification === "gap";
  const shownLabel = displayItemLabel(item.label);

  return (
    <div
      className={[
        "rounded-[var(--yl-radius-md)] border p-3",
        isAI
          ? "border-[var(--yl-border-ai)] bg-[var(--yl-bg-ai)]"
          : isConflict
            ? "border-[var(--yl-border-error)] bg-[var(--yl-bg-error)]"
            : isGap
              ? "border-dashed border-[var(--yl-border)] bg-[var(--yl-bg-surface)]"
              : "border-[var(--yl-border)] bg-[var(--yl-bg-surface)]",
      ].join(" ")}
      role="group"
      aria-label={`${shownLabel} · ${CLASS_LABEL[item.classification]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--yl-text-tertiary)]">
            <ClassPill classification={item.classification} />
            <span>· {SRC_LABEL[item.source.kind]}</span>
          </div>
          <div className="mt-1 text-sm font-medium text-[var(--yl-text-primary)]">{shownLabel}</div>
        </div>
      </div>

      {item.display_value && !isConflict && (
        <div className="mt-1 text-sm text-[var(--yl-text-secondary)]">{item.display_value}</div>
      )}

      {isAI && item.inference_basis && (
        <div className="mt-2 text-[12px] leading-relaxed text-[var(--yl-text-secondary)]">
          <span className="font-medium text-[var(--yl-primary)]">依据：</span>
          {item.inference_basis}
        </div>
      )}

      {isConflict && item.conflict_sources && (
        <div className="mt-2 space-y-1.5">
          {item.conflict_sources.map((s, i) => (
            <div
              key={i}
              className="rounded-[var(--yl-radius-sm)] bg-[var(--yl-bg-surface)] px-2 py-1.5 text-[12px]"
            >
              <div className="text-[var(--yl-text-tertiary)]">{s.label}</div>
              <div className="text-[var(--yl-text-primary)]">{s.value}</div>
            </div>
          ))}
          <div className="text-[12px] text-[var(--yl-error)]">
            这条信息前后不一致，需要你选择或补充说明后我们才能继续。
          </div>
        </div>
      )}

      {isGap && item.gap_impact && (
        <div className="mt-1 text-[12px] text-[var(--yl-text-secondary)]">
          {item.gap_impact}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {isAI && onCorrect && (
          <button
            type="button"
            onClick={onCorrect}
            className="rounded-[var(--yl-radius-sm)] border border-[var(--yl-border-ai)] bg-[var(--yl-bg-surface)] px-2.5 py-1 text-[12px] text-[var(--yl-primary)] hover:bg-[var(--yl-bg-primary-soft)]"
          >
            修改这条建议
          </button>
        )}
        {isGap && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-[var(--yl-radius-sm)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] px-2.5 py-1 text-[12px] text-[var(--yl-text-primary)] hover:bg-[var(--yl-bg-page)]"
          >
            补充这一项
          </button>
        )}
        {isConflict && onResolveConflict && (
          <button
            type="button"
            onClick={onResolveConflict}
            className="rounded-[var(--yl-radius-sm)] border border-[var(--yl-border-error)] bg-[var(--yl-bg-surface)] px-2.5 py-1 text-[12px] text-[var(--yl-error)] hover:bg-[var(--yl-bg-error)]"
          >
            处理这条信息
          </button>
        )}
        {onEdit && !isGap && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-[var(--yl-radius-sm)] px-2 py-1 text-[12px] text-[var(--yl-text-tertiary)] hover:text-[var(--yl-text-primary)]"
          >
            编辑
          </button>
        )}
      </div>
    </div>
  );
}

function ClassPill({ classification }: { classification: BriefItem["classification"] }) {
  const map: Record<BriefItem["classification"], { bg: string; fg: string }> = {
    fact: { bg: "var(--yl-bg-success)", fg: "var(--yl-success)" },
    inference: { bg: "var(--yl-bg-primary-soft)", fg: "var(--yl-primary)" },
    gap: { bg: "var(--yl-bg-muted)", fg: "var(--yl-text-secondary)" },
    conflict: { bg: "var(--yl-bg-error)", fg: "var(--yl-error)" },
  };
  const s = map[classification];
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {CLASS_LABEL[classification]}
    </span>
  );
}

// (affectsLabel removed — impact copy now written directly in user language.)

// ============================================================
// BriefSection
// ============================================================
const SECTION_LABEL: Record<BriefItem["section"], string> = {
  event: "活动",
  audience: "观众",
  budget: "预算",
  service: "所需服务",
  constraints: "注意事项",
  source_intent: "你感兴趣的演员或节目",
};

export function BriefSection({
  section,
  items,
  renderItem,
}: {
  section: BriefItem["section"];
  items: BriefItem[];
  renderItem: (item: BriefItem) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={SECTION_LABEL[section]} className="space-y-2">
      <h3 className="text-[13px] font-semibold text-[var(--yl-text-secondary)]">
        {SECTION_LABEL[section]}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.key}>{renderItem(it)}</div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// BriefVersionBanner
// ============================================================
export function BriefVersionBanner({ brief }: { brief: BriefVersionView }) {
  const isSuperseded = brief.confirmation_status === "superseded";
  const isConfirmed = brief.confirmation_status === "confirmed";
  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-2 rounded-[var(--yl-radius-md)] border px-3 py-2 text-[13px]",
        isSuperseded
          ? "border-[var(--yl-border)] bg-[var(--yl-bg-muted)] text-[var(--yl-text-secondary)]"
          : isConfirmed
            ? "border-[var(--yl-border-success)] bg-[var(--yl-bg-success)] text-[var(--yl-success)]"
            : "border-[var(--yl-border-info)] bg-[var(--yl-bg-info)] text-[var(--yl-info)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">当前需求（第 {brief.sequence} 版）</span>
        <span className="text-[var(--yl-text-tertiary)]">·</span>
        <span>
          {isSuperseded
            ? "已被新版本替代（仅供查看）"
            : isConfirmed
              ? "已确认"
              : brief.confirmation_status === "ready_for_confirmation"
                ? "待你确认"
                : "编辑中"}
        </span>
        {brief.ai_assisted && (
          <span className="rounded-full bg-[var(--yl-bg-primary-soft)] px-1.5 py-0.5 text-[10px] text-[var(--yl-primary)]">
            AI 辅助整理
          </span>
        )}
      </div>
      <span className="text-[11px] text-[var(--yl-text-tertiary)]">
        更新于 {formatDT(brief.updated_at)}
      </span>
    </div>
  );
}

// ============================================================
// StatusResponsibilityBar
// ============================================================
// 纯显示层：把旧的状态短语映射为面向用户的自然中文，不改状态本身。
const DISPLAY_STATUS_MAP: Record<string, string> = {
  请确认当前需求版本: "请核对你的活动需求",
  "已确认需求 · 请决定是否授权匹配": "需求已确认，请决定是否需要我们寻找服务团队",
  "已授权 · 等待进入服务方核验": "正在寻找合适的服务团队",
};

export function StatusResponsibilityBar({
  displayStatus,
  responsibility,
  nextStep,
}: {
  displayStatus: string;
  responsibility: string;
  nextStep: string;
}) {
  const shownStatus = DISPLAY_STATUS_MAP[displayStatus] ?? displayStatus;
  return (
    <div className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-4">
      <div className="text-[11px] uppercase tracking-wider text-[var(--yl-text-tertiary)]">
        当前状态
      </div>
      <div className="mt-1 text-lg font-semibold text-[var(--yl-text-primary)]">
        {shownStatus}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <InfoBlock label="你现在需要做什么" body={responsibility} />
        <InfoBlock label="接下来会发生什么" body={nextStep} />
      </div>
    </div>
  );
}

function InfoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-[var(--yl-radius-sm)] bg-[var(--yl-bg-page)] p-3">
      <div className="text-[11px] text-[var(--yl-text-tertiary)]">{label}</div>
      <div className="mt-0.5 text-sm text-[var(--yl-text-primary)]">{body}</div>
    </div>
  );
}

// ============================================================
// AIWorkingState / AIRecoveryPanel
// ============================================================
export function AIWorkingState({ label = "AI 正在整理…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--yl-radius-md)] border border-[var(--yl-border-ai)] bg-[var(--yl-bg-ai)] p-3 text-[13px] text-[var(--yl-primary)]">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--yl-primary)]" />
      {label}
    </div>
  );
}

export function AIRecoveryPanel({
  onRetry,
  onManual,
}: {
  onRetry: () => void;
  onManual: () => void;
}) {
  return (
    <div className="rounded-[var(--yl-radius-md)] border border-[var(--yl-border-warning)] bg-[var(--yl-bg-warning)] p-3">
      <div className="text-sm font-medium text-[var(--yl-warning)]">AI 暂时不可用</div>
      <div className="mt-1 text-[12px] text-[var(--yl-text-secondary)]">
        你刚才填的内容不会丢失。你可以再试一次，也可以自己动手填写。
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[var(--yl-radius-sm)] border border-[var(--yl-border-warning)] bg-[var(--yl-bg-surface)] px-3 py-1.5 text-[13px] text-[var(--yl-warning)] hover:opacity-90"
        >
          再试一次
        </button>
        <button
          type="button"
          onClick={onManual}
          className="rounded-[var(--yl-radius-sm)] bg-[var(--yl-primary)] px-3 py-1.5 text-[13px] text-white hover:opacity-90"
        >
          我自己填
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ConsentSummary
// ============================================================
export function ConsentSummary({
  briefVersion,
  sharedFields,
  purposeLabel,
  recipientRule,
  expiresAt,
  scopeVersion: _scopeVersion,
}: {
  briefVersion: number;
  sharedFields: Array<{ label: string }>;
  purposeLabel: string;
  recipientRule: string;
  expiresAt: string;
  scopeVersion: string;
}) {
  void _scopeVersion;
  return (
    <div className="rounded-[var(--yl-radius-lg)] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-4">
      <div className="text-[11px] uppercase tracking-wider text-[var(--yl-text-tertiary)]">
        将向服务团队提供的信息
      </div>
      <div className="mt-2 space-y-2 text-[13px] text-[var(--yl-text-primary)]">
        <Row label="本次授权适用于">当前需求（第 {briefVersion} 版）；如需求更新，需要重新授权</Row>
        <Row label="将提供这些信息">
          <div className="flex flex-wrap gap-1">
            {sharedFields.map((f) => (
              <span
                key={f.label}
                className="rounded-full bg-[var(--yl-bg-muted)] px-2 py-0.5 text-[11px] text-[var(--yl-text-secondary)]"
              >
                {f.label}
              </span>
            ))}
          </div>
        </Row>
        <Row label="用来做什么">{purposeLabel}</Row>
        <Row label="谁可以看到">{recipientRule}</Row>
        <Row label="授权有效期">{formatDT(expiresAt)}</Row>
      </div>
      <div className="mt-3 rounded-[var(--yl-radius-sm)] bg-[var(--yl-bg-page)] p-2 text-[12px] text-[var(--yl-text-secondary)]">
        我们不会提供你的姓名、手机号、邮箱、微信、精确场地、原始文件、完整聊天记录或活动名称。这次授权也不代表演员档期、价格、承接团队或合同已经确定。
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
      <div className="text-[12px] text-[var(--yl-text-tertiary)]">{label}</div>
      <div>{children}</div>
    </div>
  );
}

// ============================================================
// ConfirmationReceipt
// ============================================================
export function ConfirmationReceipt({ receipt }: { receipt: ConfirmationReceiptView }) {
  const t = receipt.receipt_type;
  const name = receipt.actor_display_name;
  const when = formatDTChinese(receipt.occurred_at);

  let title: string;
  let body: string;
  let operatorLine: string;
  let nextLine: string;

  if (t === "brief_confirmation") {
    title = "需求已确认";
    body = "你已确认以上活动信息。";
    operatorLine = `${name}于 ${when} 完成确认。`;
    const raw = receipt.next_step ?? "";
    nextLine = raw.startsWith("接下来") ? raw : `接下来：${raw}`;
  } else if (t === "matching_consent") {
    title = "已同意平台帮你寻找服务团队";
    const raw = receipt.effect_summary;
    const containsLegacy = /Brief|最小字段|主服务方|候选主服务方/.test(raw);
    body = containsLegacy
      ? "你已同意将本次活动的必要信息提供给符合条件的服务团队，用于帮你寻找合适方案。"
      : raw;
    operatorLine = `${name}于 ${when} 完成授权。`;
    nextLine = "接下来，服务团队会确认是否能承接、档期和合作条件；有结果后我们会通知你。";
  } else {
    title = "已停止寻找服务团队";
    body = "本次需求已经结束，服务团队不能再查看相关信息。";
    operatorLine = `${name}于 ${when} 停止寻找。`;
    nextLine = "如果仍需举办活动，请重新发起需求。";
  }

  return (
    <div className="rounded-[var(--yl-radius-md)] border border-[var(--yl-border-success)] bg-[var(--yl-bg-success)] p-3">
      <div className="text-[12px] font-medium text-[var(--yl-success)]">{title}</div>
      <div className="mt-2 space-y-1 text-[13px] text-[var(--yl-text-primary)]">
        <div>{body}</div>
        <div className="text-[12px] text-[var(--yl-text-secondary)]">{operatorLine}</div>
        <div className="mt-1 text-[12px] text-[var(--yl-text-secondary)]">{nextLine}</div>
      </div>
    </div>
  );
}

// ============================================================
// ConsentReceipt (for revoke display when consent is null)
// ============================================================
export function ConsentInactiveNote({
  status,
}: {
  status: NonNullable<MatchingConsentView>["status"] | "none";
}) {
  const map: Record<string, string> = {
    revoked: "已停止寻找服务团队，本次需求已经结束。",
    expired: "授权已到期，服务团队不会再看到你的活动信息。如仍需办活动，请重新发起需求。",
    none: "尚未同意寻找服务团队。",
  };
  return (
    <div className="rounded-[var(--yl-radius-md)] border border-dashed border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-3 text-[13px] text-[var(--yl-text-secondary)]">
      {map[status]}
    </div>
  );
}

/**
 * 中文自然语言时间格式化器 —— Asia/Shanghai (UTC+8)，
 * 输出形如 "2026 年 7 月 18 日 17:39"。纯函数，SSR/CSR 一致。
 */
export function formatDTChinese(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const p = (n: number) => String(n).padStart(2, "0");
    const y = shifted.getUTCFullYear();
    const mo = shifted.getUTCMonth() + 1;
    const da = shifted.getUTCDate();
    const hh = p(shifted.getUTCHours());
    const mm = p(shifted.getUTCMinutes());
    return `${y} 年 ${mo} 月 ${da} 日 ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

// ============================================================
// Utils
// ============================================================
/**
 * 纯函数时间格式化器 —— 始终以 Asia/Shanghai（UTC+8）呈现，
 * 不依赖运行环境默认时区/Locale，保证 SSR 与 CSR 首屏逐字一致。
 * 输入相同 → 输出相同。
 */
export function formatDT(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${shifted.getUTCFullYear()}-${p(shifted.getUTCMonth() + 1)}-${p(shifted.getUTCDate())} ${p(shifted.getUTCHours())}:${p(shifted.getUTCMinutes())}`;
  } catch {
    return iso;
  }
}
