import { useEffect, type ReactNode, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import type { FixtureKey } from "./fixtures";

/**
 * 测量固定操作栏实际高度，写入 :root 的 --yl-action-bar-h。
 * 正文通过 .yl-main-with-actionbar 使用同一 Token 预留空间，禁止硬编码。
 */
export function useActionBarHeight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h > 0) root.style.setProperty("--yl-action-bar-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      root.style.removeProperty("--yl-action-bar-h");
    };
  }, [ref]);
}

/**
 * 演示工具栏 — 将演示元数据（Fixture、Demand 编号、页面代号）与业务页面隔离显示。
 * 视觉上使用暖黄底 + 细边框，位于业务卡片外层。
 */
export function DemoBar({
  page,
  fixtureKey,
  fixtureLabel,
  demandCode,
}: {
  page: string;
  fixtureKey?: FixtureKey | string;
  fixtureLabel?: string;
  demandCode?: string;
}) {
  const hasInternal = Boolean(fixtureLabel || fixtureKey || demandCode);
  return (
    <div
      role="note"
      aria-label="演示信息"
      className="rounded-[var(--yl-radius-md)] border border-dashed border-[var(--yl-border-warning)] bg-[var(--yl-bg-warning)]/60 px-3 py-2 text-[13px] text-[var(--yl-warning)]"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--yl-warning)]" />
          演示数据
        </span>
        <span className="text-[var(--yl-text-tertiary)]">|</span>
        <span className="text-[var(--yl-text-secondary)]">{page}</span>
        <span className="text-[var(--yl-text-tertiary)]">|</span>
        <span className="text-[var(--yl-text-secondary)]">页面上的信息不代表真实合作</span>
      </div>
      {hasInternal && (
        <details className="mt-1">
          <summary className="cursor-pointer text-[12px] text-[var(--yl-text-tertiary)]">
            查看演示信息（仅供内部调试）
          </summary>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--yl-text-tertiary)]">
            {fixtureLabel && (
              <span>
                场景：{fixtureLabel}
                {fixtureKey && (
                  <code className="ml-1 rounded bg-white/60 px-1">{fixtureKey}</code>
                )}
              </span>
            )}
            {demandCode && <span>需求编号：{demandCode}</span>}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * 顶部导航（客户侧极简）。
 */
export function CustomerTopBar({ subtitle }: { subtitle?: string }) {
  return (
    <div className="border-b border-[var(--yl-border)] bg-[var(--yl-bg-surface)]">
      <div className="mx-auto flex max-w-[960px] items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="text-[17px] font-semibold tracking-tight text-[var(--yl-text-primary)]"
        >
          演立方
        </Link>
        {subtitle && <span className="text-[13px] text-[var(--yl-text-tertiary)]">{subtitle}</span>}
      </div>
    </div>
  );
}

/**
 * 三步进度：填写需求 → 确认需求 → 授权匹配。
 */
export type FlowStep = 1 | 2 | 3;

export function FlowStepper({ current }: { current: FlowStep }) {
  const steps: Array<{ n: FlowStep; label: string }> = [
    { n: 1, label: "填写活动需求" },
    { n: 2, label: "确认需求内容" },
    { n: 3, label: "同意寻找服务团队" },
  ];
  return (
    <nav aria-label="流程进度" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((s, i) => {
          const active = s.n === current;
          const done = s.n < current;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span
                  aria-current={active ? "step" : undefined}
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                    active
                      ? "bg-[var(--yl-primary)] text-white"
                      : done
                        ? "bg-[var(--yl-bg-primary-soft)] text-[var(--yl-primary)]"
                        : "bg-[var(--yl-bg-muted)] text-[var(--yl-text-tertiary)]",
                  ].join(" ")}
                >
                  {done ? "✓" : s.n}
                </span>
                <span
                  className={[
                    "whitespace-nowrap text-[14px]",
                    active
                      ? "font-semibold text-[var(--yl-text-primary)]"
                      : "text-[var(--yl-text-tertiary)]",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={[
                    "h-px flex-1",
                    done ? "bg-[var(--yl-primary)]/50" : "bg-[var(--yl-border)]",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * 需求摘要 —— 使用两列描述列表在移动端自动切换为单列，减少卡片数量。
 */
export type SummaryStatus = "fact" | "gap" | "conflict" | "inference";
export type SummaryRow = {
  key: string;
  label: string;
  value: ReactNode;
  status: SummaryStatus;
  hint?: string;
};

export function BriefSummaryList({ rows }: { rows: SummaryRow[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
      {rows.map((r) => (
        <div
          key={r.key}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-[var(--yl-border)] py-3 last:border-b-0 sm:py-4"
        >
          <div className="min-w-0">
            <dt className="text-[13px] text-[var(--yl-text-tertiary)]">{r.label}</dt>
            <dd
              className={[
                "mt-1 text-[15px] leading-relaxed",
                r.status === "conflict"
                  ? "text-[var(--yl-error)]"
                  : r.status === "gap"
                    ? "text-[var(--yl-text-tertiary)]"
                    : "text-[var(--yl-text-primary)]",
              ].join(" ")}
            >
              {r.value}
            </dd>
            {r.hint && (
              <div className="mt-1 text-[12px] text-[var(--yl-text-tertiary)]">{r.hint}</div>
            )}
          </div>
          <StatusChip status={r.status} />
        </div>
      ))}
    </dl>
  );
}

function StatusChip({ status }: { status: SummaryStatus }) {
  const map: Record<SummaryStatus, { label: string; dot: string; bg: string; fg: string }> = {
    fact: {
      label: "已提供",
      dot: "var(--yl-success)",
      bg: "var(--yl-bg-success)",
      fg: "var(--yl-success)",
    },
    inference: {
      label: "AI 建议",
      dot: "var(--yl-primary)",
      bg: "var(--yl-bg-primary-soft)",
      fg: "var(--yl-primary)",
    },
    gap: {
      label: "待补充",
      dot: "var(--yl-warning)",
      bg: "var(--yl-bg-warning)",
      fg: "var(--yl-warning)",
    },
    conflict: {
      label: "信息不一致",
      dot: "var(--yl-error)",
      bg: "var(--yl-bg-error)",
      fg: "var(--yl-error)",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}

/**
 * 页面主标题块（标题 + 辅助说明）。
 */
export function PageHeading({
  eyebrow,
  title,
  subtitle,
  aside,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[13px] font-medium text-[var(--yl-primary)]">{eyebrow}</div>
        )}
        <h1 className="mt-1 text-[24px] font-semibold leading-[1.25] tracking-tight text-[var(--yl-text-primary)] sm:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-[640px] text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0 text-right">{aside}</div>}
    </header>
  );
}
