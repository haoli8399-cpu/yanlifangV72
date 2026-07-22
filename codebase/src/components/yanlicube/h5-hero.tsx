import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * H5Hero — 移动端全宽首屏 Hero(仅 <md 显示)。
 * 让访客在 3 秒内看到：这是什么、为什么值得看、下一步。
 */
export function H5Hero({
  eyebrow,
  title,
  subtitle,
  badges,
  cover,
  gradient = "from-primary/20 via-primary/5 to-background",
  backTo,
  backLabel = "返回",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  cover?: string | ReactNode;
  gradient?: string;
  backTo?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-border/60 px-4 pb-5 pt-4 md:hidden",
        "bg-gradient-to-b",
        gradient,
        className,
      )}
    >
      {backTo && (
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {backLabel}
        </Link>
      )}
      {typeof cover === "string" ? (
        <div className="mb-3 overflow-hidden rounded-xl">
          <img
            src={cover}
            alt=""
            className="aspect-[16/10] w-full object-cover"
            loading="eager"
          />
        </div>
      ) : cover ? (
        <div className="mb-3">{cover}</div>
      ) : null}
      {eyebrow && (
        <div className="mb-1 text-[10.5px] font-medium tracking-[0.16em] text-primary">
          {eyebrow}
        </div>
      )}
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/75">{subtitle}</p>
      )}
      {badges && <div className="mt-3 flex flex-wrap items-center gap-1.5">{badges}</div>}
    </header>
  );
}

/**
 * MobileSection — 移动端下语义段落容器,统一间距。
 */
export function MobileSection({
  title,
  hint,
  children,
  className,
}: {
  title?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-border/40 px-4 py-5 md:hidden", className)}>
      {title && (
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold tracking-wide text-foreground">{title}</h2>
          {hint && <span className="text-[10.5px] text-muted-foreground">{hint}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
