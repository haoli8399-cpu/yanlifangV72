import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * StickyActionBar
 * 底部固定操作栏(移动端为主,PC 上也可显示)
 */
export function StickyActionBar({
  children,
  className,
  desktop = false,
}: {
  children: ReactNode;
  className?: string;
  desktop?: boolean;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md",
        !desktop && "md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * BottomTabBar — 移动端底部导航(演员端 / 客户项目端)
 */
export type BottomTabItem = {
  to: string;
  params?: Record<string, string>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
};

export function BottomTabBar({
  items,
  aiSlot = false,
}: {
  items: BottomTabItem[];
  /** When true, leaves an empty center column so the AI raised button
   * (rendered by AgentPanelProvider on mobile) visually sits inside the tabbar. */
  aiSlot?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const midIdx = aiSlot ? Math.ceil(items.length / 2) : -1;
  const cols = aiSlot ? items.length + 1 : items.length;
  const slots: (BottomTabItem | "gap")[] = aiSlot
    ? [...items.slice(0, midIdx), "gap", ...items.slice(midIdx)]
    : items;
  return (
    <nav
      className={cn(
        "sticky bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden",
      )}
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className="mx-auto grid max-w-[600px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
      >
        {slots.map((it, i) => {
          if (it === "gap") {
            // Reserved column for the raised AI button (rendered by AgentPanelProvider).
            return <div key={`gap-${i}`} aria-hidden className="h-11" />;
          }
          const active = it.match ? it.match(pathname) : pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to + it.label}
              to={it.to}
              params={it.params as never}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-2 text-[10.5px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * MobileHint — 移动端提示 "此功能建议 PC"
 */
export function DesktopRecommended({ children }: { children?: ReactNode }) {
  const KEY = 'yl-desktop-recommended-shown';
  if (typeof window !== 'undefined') {
    if (window.sessionStorage.getItem(KEY)) return null;
    window.sessionStorage.setItem(KEY, '1');
  }
  return (
    <div className="mb-3 rounded-md border border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/5 px-3 py-2 text-[11px] leading-relaxed text-foreground/80 md:hidden">
      <span className="mr-1 font-medium text-[color:var(--state-pending)]">建议 PC 使用 ·</span>
      {children ?? "此页面在桌面端体验更完整,手机端为只读摘要。"}
    </div>
  );
}
