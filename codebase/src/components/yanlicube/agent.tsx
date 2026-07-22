import type React from "react";
import { Sparkle, User2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Agent 消息:AI Native 风格,不做机器人拟人化 */
export function AgentMessage({
  children,
  by = "AI 顾问",
  time,
}: {
  children: ReactNode;
  by?: string;
  time?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]">
        <Wand2 className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{by}</span>
          {time && <span>· {time}</span>}
        </div>
        <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

export function HumanMessage({
  children,
  by,
  time,
}: {
  children: ReactNode;
  by: string;
  time?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
        <User2 className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{by}</span>
          {time && <span>· {time}</span>}
        </div>
        <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

/** 内联 Agent 建议卡 · 需用户确认才生效 */
export function AgentInlineSuggestion({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/[0.04] p-4">
      <div className="absolute left-0 top-0 h-full w-0.5 bg-[color:var(--state-ai)]/60" />
      <div className="mb-2 flex items-center gap-2">
        <Sparkle className="h-3.5 w-3.5 text-[color:var(--state-ai)]" />
        <span className="text-xs font-medium tracking-wide text-[color:var(--state-ai)]">
          AI 建议 · 待你确认
        </span>
      </div>
      <div className="mb-3 text-sm font-medium text-foreground">{title}</div>
      <div className="mb-3 text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EvidenceLine({
  source,
  time,
  className,
  children,
}: {
  source: string;
  time?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      {children ? (
        <span className="text-foreground/85">{children}</span>
      ) : (
        <span>依据</span>
      )}
      <span className="text-foreground/70">· {source}</span>
      {time && <><span>·</span><span>{time}</span></>}
    </div>
  );
}