import { useState, type ReactNode, type ComponentType } from "react";
import { ChevronDown, ArrowRight, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 任务驱动型页面骨架
 * ────────────────────
 * 每个企业用户端页面推荐用三层结构:
 *   1) <NextActionHero>  ── 顶部只放"此刻该做的事"
 *   2) <FocusZone>       ── 完成任务需要的 1-2 个关键信息块
 *   3) <DetailBlock>     ── 参考信息全部折叠,默认收起
 * 目标:一屏内让用户看到 CTA,不再被 8 张平铺卡片淹没。
 */

export function NextActionHero({
  eyebrow,
  title,
  context,
  primary,
  secondary,
  meta,
  tone = "default",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  context?: ReactNode;
  primary?: { label: string; onClick?: () => void; to?: string; icon?: ReactNode };
  secondary?: { label: string; onClick?: () => void; to?: string };
  /** 右侧一小段辅助元信息(如"平均等待 2 天") */
  meta?: ReactNode;
  tone?: "default" | "waiting" | "warn" | "done";
}) {
  const toneClass =
    tone === "waiting"
      ? "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/[0.06]"
      : tone === "warn"
        ? "border-[color:var(--state-warn)]/50 bg-[color:var(--state-warn)]/[0.06]"
        : tone === "done"
          ? "border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/[0.06]"
          : "border-primary/25 bg-gradient-to-br from-primary/[0.08] via-background/40 to-background/0";

  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-sm sm:p-7",
        toneClass,
      )}
      aria-label="此刻该做"
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {eyebrow}
            </div>
          )}
          <h1 className="text-lg font-semibold leading-snug text-foreground sm:text-2xl">
            {title}
          </h1>
          {context && (
            <div className="mt-2 text-sm leading-relaxed text-foreground/75">
              {context}
            </div>
          )}
          {(primary || secondary) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {primary && (
                <ActionButton {...primary} variant="primary" />
              )}
              {secondary && (
                <ActionButton {...secondary} variant="ghost" />
              )}
            </div>
          )}
        </div>
        {meta && (
          <div className="shrink-0 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-[11px] text-muted-foreground md:min-w-[160px]">
            {meta}
          </div>
        )}
      </div>
    </section>
  );
}

function ActionButton({
  label,
  onClick,
  to,
  icon,
  variant,
}: {
  label: string;
  onClick?: () => void;
  to?: string;
  icon?: ReactNode;
  variant: "primary" | "ghost";
}) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border/60 bg-card/50 text-foreground/80 hover:border-primary/40 hover:text-foreground",
  );
  if (to) {
    return (
      <a href={to} className={cls}>
        {label}
        {icon ?? <ArrowRight className="h-3.5 w-3.5" />}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
      {icon ?? <ArrowRight className="h-3.5 w-3.5" />}
    </button>
  );
}

/**
 * FocusZone: 承载完成 NextAction 需要的 1-2 张关键卡。
 * 只是一个语义包装,给设计留 rhythm,不加边框。
 */
export function FocusZone({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 md:grid-cols-2", className)}>{children}</div>;
}

/**
 * DetailBlock: 参考类信息的可折叠卡。默认收起,标题旁允许放摘要预览。
 */
export function DetailBlock({
  title,
  summary,
  defaultOpen = false,
  children,
  right,
}: {
  title: ReactNode;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  right?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40 sm:px-5"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {summary && !open && (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{summary}</div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          {right}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </div>
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4 sm:px-5">{children}</div>}
    </section>
  );
}

/**
 * DetailStack: 一组 DetailBlock 的垂直堆叠容器。
 */
export function DetailStack({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-2 px-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/**
 * EmptyState: 空态提示 + 主 CTA + 次要 CTA + "接下来会出现什么"清单。
 * 目标:让新项目/新阶段不再是一句冷冷的"暂无数据",而是知道从哪一步开始。
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
  whatShowsUp,
  tone = "default",
}: {
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  description?: ReactNode;
  primary?: { label: string; to?: string; onClick?: () => void };
  secondary?: { label: string; to?: string; onClick?: () => void };
  /** 这里稍后会出现的内容清单 */
  whatShowsUp?: string[];
  tone?: "default" | "waiting";
}) {
  const toneClass =
    tone === "waiting"
      ? "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/[0.05]"
      : "border-dashed border-border/70 bg-card/40";
  return (
    <section className={cn("rounded-2xl border p-6 sm:p-8", toneClass)}>
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {Icon ? <Icon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <h3 className="text-base font-semibold text-foreground sm:text-lg">{title}</h3>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {(primary || secondary) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {primary && <EmptyBtn {...primary} variant="primary" />}
            {secondary && <EmptyBtn {...secondary} variant="ghost" />}
          </div>
        )}
      </div>
      {whatShowsUp && whatShowsUp.length > 0 && (
        <div className="mx-auto mt-6 max-w-xl rounded-lg border border-border/50 bg-background/40 p-4 text-left">
          <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            这里稍后会出现
          </div>
          <ul className="space-y-1.5 text-xs text-foreground/80">
            {whatShowsUp.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function EmptyBtn({
  label,
  to,
  onClick,
  variant,
}: {
  label: string;
  to?: string;
  onClick?: () => void;
  variant: "primary" | "ghost";
}) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border/60 bg-card/50 text-foreground/80 hover:border-primary/40 hover:text-foreground",
  );
  const content = (
    <>
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </>
  );
  if (to) return <a href={to} className={cls}>{content}</a>;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

/**
 * OnboardingSteps: 4-6 步的启动清单,用于新项目主页告诉用户"从哪里开始"。
 * 已完成的步骤显示 ✓,当前步骤高亮,未来步骤置灰。
 */
export function OnboardingSteps({
  title = "从这里开始",
  steps,
}: {
  title?: string;
  steps: Array<{
    label: string;
    hint?: string;
    to?: string;
    onClick?: () => void;
    done?: boolean;
    current?: boolean;
  }>;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const Row = (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors sm:px-4",
                s.current
                  ? "border-primary/40 bg-primary/[0.06]"
                  : s.done
                    ? "border-border/50 bg-card/30"
                    : "border-border/40 bg-card/20",
              )}
            >
              <div className="shrink-0">
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--state-verified)]" />
                ) : s.current ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/60" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-sm",
                    s.current
                      ? "font-semibold text-foreground"
                      : s.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground/80",
                  )}
                >
                  {s.label}
                </div>
                {s.hint && !s.done && (
                  <div className="mt-0.5 text-xs text-muted-foreground">{s.hint}</div>
                )}
              </div>
              {(s.to || s.onClick) && !s.done && (
                <ArrowRight
                  className={cn(
                    "h-4 w-4 shrink-0",
                    s.current ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}
            </div>
          );
          if (s.to && !s.done) {
            return (
              <li key={i}>
                <a href={s.to} className="block">
                  {Row}
                </a>
              </li>
            );
          }
          if (s.onClick && !s.done) {
            return (
              <li key={i}>
                <button type="button" onClick={s.onClick} className="block w-full">
                  {Row}
                </button>
              </li>
            );
          }
          return <li key={i}>{Row}</li>;
        })}
      </ol>
    </section>
  );
}

