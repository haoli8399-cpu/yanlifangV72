import { cn } from "@/lib/utils";
import type { EvidenceState } from "@/lib/fixtures";
import { evidenceCopy } from "@/lib/status-copy";
import type { UserRole } from "@/lib/glossary";

const styles: Record<EvidenceState, string> = {
  verified:
    "border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]",
  declared:
    "border-[color:var(--state-declared)]/40 bg-[color:var(--state-declared)]/10 text-[color:var(--state-declared)]",
  supported: "border-muted-foreground/30 bg-muted/10 text-muted-foreground",
  conflict: "border-red-500/40 bg-red-500/10 text-red-500",
  not_public: "border-muted-foreground/20 bg-muted/5 text-muted-foreground",
  ai: "border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]",
  pending:
    "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]",
  expired:
    "border-[color:var(--state-expired)]/40 bg-[color:var(--state-expired)]/10 text-[color:var(--state-expired)]",
};

const dots: Record<EvidenceState, string> = {
  verified: "bg-[color:var(--state-verified)]",
  declared: "bg-[color:var(--state-declared)]",
  supported: "bg-muted-foreground",
  conflict: "bg-red-500",
  not_public: "bg-muted",
  ai: "bg-[color:var(--state-ai)]",
  pending: "bg-[color:var(--state-pending)] animate-pulse",
  expired: "bg-[color:var(--state-expired)]",
};

export function StatusBadge({
  state,
  label,
  hint,
  who,
  what,
  role,
  className,
}: {
  state: EvidenceState;
  label?: string;
  /** 悬停提示,不传则自动用 status-copy 生成 */
  hint?: string;
  who?: string;
  what?: string;
  role?: UserRole;
  className?: string;
}) {
  const copy = evidenceCopy(state, role ?? "client", who, what);
  return (
    <span
      title={hint ?? copy.hint}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        styles[state],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[state])} />
      {label ?? copy.label}
    </span>
  );
}