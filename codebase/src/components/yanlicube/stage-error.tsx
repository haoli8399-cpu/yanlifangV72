import { useRouter, Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, ArrowLeft, Home, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StageError / StageNotFound
 * ─────────────────────────
 * 每个项目子环节都会用这两个组件作为 errorComponent / notFoundComponent,
 * 目的:数据加载失败或路径不存在时,给出明确的"重试 / 返回上一环节 / 回到项目主页"三条路径。
 */

type FallbackTone = "error" | "notfound";

function FallbackShell({
  tone,
  title,
  description,
  detail,
  onRetry,
  backTo,
  backLabel,
  homeTo,
}: {
  tone: FallbackTone;
  title: string;
  description: string;
  detail?: string;
  onRetry?: () => void;
  backTo?: string;
  backLabel?: string;
  homeTo?: string;
}) {
  const iconWrap = cn(
    "flex h-11 w-11 items-center justify-center rounded-full",
    tone === "error"
      ? "bg-[color:var(--state-warn)]/12 text-[color:var(--state-warn)]"
      : "bg-primary/10 text-primary",
  );
  const Icon = tone === "error" ? AlertTriangle : Compass;

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded-2xl border p-6 sm:p-8",
        tone === "error"
          ? "border-[color:var(--state-warn)]/40 bg-[color:var(--state-warn)]/[0.05]"
          : "border-dashed border-border/70 bg-card/40",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={iconWrap}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          {detail && (
            <details className="mt-3 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none text-foreground/70">
                查看技术细节
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
                {detail}
              </pre>
            </details>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重新加载
              </button>
            )}
            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/50 px-3.5 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground sm:text-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {backLabel ?? "返回上一环节"}
              </Link>
            )}
            {homeTo && (
              <Link
                to={homeTo}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/50 px-3.5 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground sm:text-sm"
              >
                <Home className="h-3.5 w-3.5" />
                回到项目主页
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 项目子环节的 errorComponent */
export function StageError({
  error,
  reset,
  backTo,
  backLabel,
  homeTo,
}: {
  error: Error;
  reset: () => void;
  backTo?: string;
  backLabel?: string;
  homeTo?: string;
}) {
  const router = useRouter();
  const message = error?.message || "未知错误";
  return (
    <FallbackShell
      tone="error"
      title="这个环节加载失败了"
      description="可能是网络波动或临时故障。你可以重试,或先返回上一环节继续推进。"
      detail={message}
      onRetry={() => {
        router.invalidate();
        reset();
      }}
      backTo={backTo}
      backLabel={backLabel}
      homeTo={homeTo}
    />
  );
}

/** 项目子环节的 notFoundComponent */
export function StageNotFound({
  backTo,
  backLabel,
  homeTo,
  title = "没有找到这个环节的数据",
  description = "可能对应资源已被移除或还未生成。你可以返回上一环节,或回到项目主页从入口重新进入。",
}: {
  backTo?: string;
  backLabel?: string;
  homeTo?: string;
  title?: string;
  description?: string;
}) {
  return (
    <FallbackShell
      tone="notfound"
      title={title}
      description={description}
      backTo={backTo}
      backLabel={backLabel}
      homeTo={homeTo}
    />
  );
}

/**
 * 便捷工厂:在 createFileRoute 里直接展开,一行拿到 error + notFound 兜底。
 * 用法:
 *   ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页" })
 */
export function stageBoundaries(opts: {
  backTo?: string;
  backLabel?: string;
  homeTo?: string;
}) {
  return {
    errorComponent: ({ error, reset }: { error: Error; reset: () => void }) => (
      <StageError error={error} reset={reset} {...opts} />
    ),
    notFoundComponent: () => <StageNotFound {...opts} />,
  };
}
