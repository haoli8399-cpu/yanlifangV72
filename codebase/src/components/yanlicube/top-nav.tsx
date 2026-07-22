import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Compass, FolderKanban, Sparkle, UserCircle2, Menu, X } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";

const items = [
  { to: "/", label: "发现", icon: Compass, match: (p: string) => p === "/" || p.startsWith("/discover") },
  { to: "/projects", label: "我的活动", icon: FolderKanban, match: (p: string) => p.startsWith("/projects") },
  { to: "/agent", label: "AI 顾问", icon: Sparkle, match: (p: string) => p.startsWith("/agent") || p.startsWith("/snapshot") },
] as const;

const rolePortals = [
  { to: "/tenant", label: "服务方" },
  { to: "/actor", label: "演员" },
  { to: "/admin", label: "平台" },
  { to: "/dev-login", label: "切换" },
];

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-[color:var(--state-verified)]/70 shadow-[0_0_20px_var(--stage-glow)]">
            <span className="font-mono text-[13px] font-bold text-primary-foreground">演</span>
          </div>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-semibold tracking-tight">演立方</span>
            <span className="hidden text-[10px] font-medium tracking-[0.14em] text-muted-foreground sm:inline">
              YANLICUBE
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((it) => {
            const active = it.match(pathname);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <it.icon className="h-3.5 w-3.5" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CommandPalette />
          <ThemeToggle />
          <div className="hidden items-center gap-1 rounded-md border border-border/60 bg-secondary/40 p-0.5 text-[11px] lg:flex">
            {rolePortals.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className={cn(
                  "rounded px-2 py-0.5 text-muted-foreground transition-colors hover:text-foreground",
                  pathname.startsWith(r.to) && "bg-background text-foreground",
                )}
              >
                {r.label}
              </Link>
            ))}
          </div>
          <button className="hidden h-8 items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground lg:inline-flex">
            <UserCircle2 className="h-4 w-4" />
            演示身份 · Neo 银行
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="菜单"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-secondary/40 text-muted-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="px-4 py-3">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">导航</div>
            <div className="grid grid-cols-3 gap-2">
              {items.map((it) => {
                const active = it.match(pathname);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs",
                      active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border/60 bg-secondary/40 text-muted-foreground",
                    )}
                  >
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">角色端</div>
            <div className="grid grid-cols-4 gap-2">
              {rolePortals.map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  className={cn(
                    "rounded-md border px-2 py-2 text-center text-xs",
                    pathname.startsWith(r.to)
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/60 bg-secondary/40 text-muted-foreground",
                  )}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
