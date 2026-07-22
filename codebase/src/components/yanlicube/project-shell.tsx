import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  ScrollText,
  Receipt,
  Activity,
  Trophy,
  MoreHorizontal,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import type { Project } from "@/lib/fixtures";
import { stageLabel, type ProjectStage, type EvidenceState } from "@/lib/fixtures";
import { StatusBadge } from "./status-badge";
import { AgentPanelProvider } from "./agent-side-panel";
import { ThemeToggle } from "./theme-toggle";

// V7.2 优化：客户项目导航精简为 5 个 tab
// 原 15 个入口映射：understand/plans/candidates→需求&方案, quote/contract/payments→商务确认,
// waiting/execution/changes/messages→履约, outcome/review/share→活动总结, team→右侧固定面板
const subnav = [
  { key: "overview", to: "/projects/$id" as const, label: "项目主页", icon: Home },
  { key: "brief", to: "/projects/$id/plans" as const, label: "需求 & 方案", icon: ScrollText },
  { key: "deal", to: "/projects/$id/deal" as const, label: "商务确认", icon: Receipt },
  { key: "execution", to: "/projects/$id/execution" as const, label: "履约", icon: Activity },
  { key: "outcome", to: "/projects/$id/outcome" as const, label: "活动总结", icon: Trophy },
] as const;

type NavKey = (typeof subnav)[number]["key"];

// 按项目阶段把 14 个环节归到 5 组,当前阶段自动展开,其他组只显示组名。
type NavGroup = {
  key: string;
  label: string;
  hint: string;
  items: readonly NavKey[];
  stages: readonly ProjectStage[];
};
const navGroups: readonly NavGroup[] = [
  { key: "brief", label: "需求 & 方案", hint: "理解需求 · 比较方案", items: ["brief"], stages: ["exploring", "planning"] },
  { key: "deal", label: "商务确认", hint: "报价 · 合同 · 付款", items: ["deal"], stages: ["quoting"] },
  { key: "deliver", label: "履约", hint: "执行 · 变更 · 沟通", items: ["execution"], stages: ["waiting", "executing"] },
  { key: "recap", label: "活动总结", hint: "成果 · 评价", items: ["outcome"], stages: ["completed"] },
];

// Mobile bottom nav — 4 nav + 中央 AI 按钮(由 AgentPanelProvider 渲染)
const mobileTabs = ["overview", "brief", "execution", "outcome"] as const;

const stageOrder: ProjectStage[] = [
  "exploring", "planning", "quoting", "waiting", "executing", "completed",
];

const stageState: Record<ProjectStage, EvidenceState> = {
  exploring: "ai",
  planning: "ai",
  quoting: "pending",
  waiting: "pending",
  executing: "declared",
  completed: "verified",
};

export function ProjectShell({
  project,
  children,
  mobileCta,
}: {
  project: Project;
  children: ReactNode;
  /** 移动端专用底部粘性 CTA(在底部 Tab 上方)。桌面端不显示。 */
  mobileCta?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentIdx = stageOrder.indexOf(project.stage);
  const [moreOpen, setMoreOpen] = useState(false);

  const activeKey = useMemo(() => {
    const tab = subnav.find((it) =>
      it.key === "overview"
        ? pathname === `/projects/${project.id}`
        : pathname.startsWith(`/projects/${project.id}/${it.key}`),
    );
    return tab?.key ?? "overview";
  }, [pathname, project.id]);

  const { scopeLabel, quickPrompts } = useMemo(() => {
    const tab = subnav.find((it) => it.key === activeKey) ?? subnav[0];
    const base = `${project.title} · ${tab.label}`;
    const promptsByTab: Record<string, string[]> = {
      overview: ["这个项目现在卡在哪一步?", "把当前进度整理成领导汇报", "下一步我应该做什么?"],
      understand: ["把活动画像用客户视角重写", "有哪些必确认项还没敲定?", "预算区间是否合理?"],
      plans: ["3 个方案的关键差异是什么?", "如果不选推荐方案,失去什么?", "生成领导汇报摘要"],
      team: ["主服务方的责任边界在哪?", "还有哪些演员未确认档期?", "帮我起草一份协作方邀请"],
      quote: ["把报价拆解成给财务的说明", "哪几项最有可能被砍价?", "报价有效期到期怎么处理?"],
      execution: ["最近有异常吗?", "还有哪些依赖等着我?", "把变更记录整理成周报"],
      outcome: ["总结这次活动的三个高光", "对比行业平均 NPS", "帮我起草 2027 版本"],
    };
    return { scopeLabel: base, quickPrompts: promptsByTab[tab.key] ?? promptsByTab.overview };
  }, [activeKey, project.title]);

  return (
    <AgentPanelProvider scopeLabel={scopeLabel} quickPrompts={quickPrompts}>
    <div className="mx-auto max-w-[1400px] px-4 pb-32 pt-4 sm:px-6 sm:pt-8 lg:pb-8">
      {/* Project Header */}
      <div className="mb-4 sm:mb-6">
        <Link
          to="/projects"
          className="mb-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground sm:mb-3 sm:text-xs"
        >
          ← 我的活动
        </Link>
        <div className="mb-2 flex justify-end sm:mb-3">
          <ThemeToggle scope={`project.${project.id}`} scopeLabel="本项目主题" />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:mb-2">
              <StatusBadge state={stageState[project.stage]} label={stageLabel[project.stage]} />
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                路径 {project.path}
              </span>
            </div>
            <h1 className="truncate text-lg font-semibold text-foreground sm:text-2xl">{project.title}</h1>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">
              {project.client} · {project.date} · {project.city} · {project.scale}
            </div>
          </div>
          {project.team.main && (
            <div className="hidden shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 sm:block">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-medium tracking-[0.14em] text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                唯一主服务方
              </div>
              <div className="text-sm font-semibold text-foreground">{project.team.main.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {project.team.main.contact ?? project.team.main.scope}
              </div>
            </div>
          )}
        </div>
        {project.team.main && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] sm:hidden">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="text-primary">主服务方</span>
            <span className="truncate font-medium text-foreground">{project.team.main.name}</span>
          </div>
        )}
      </div>

      {/* 唯一进度维度:极简 6 点胶囊(桌面 + 移动统一),点击回到项目主页 */}
      <StagePill projectId={project.id} currentIdx={currentIdx} currentStage={project.stage} />

      {/* Desktop: 横向分组导航(项目主页 + 5 组胶囊 + 当前组子项摊平在下一行) */}
      <DesktopGroupNav
        projectId={project.id}
        activeKey={activeKey}
        currentStage={project.stage}
        currentIdx={currentIdx}
      />

      <div className="min-w-0">{children}</div>
    </div>



    {/* Mobile: sticky CTA + bottom tab bar */}
    {mobileCta && (
      <div
        className="fixed inset-x-0 z-30 border-t border-border/60 bg-background/95 px-4 py-2 backdrop-blur-md lg:hidden"
        style={{ bottom: "calc(3.25rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-[600px] items-center gap-2">{mobileCta}</div>
      </div>
    )}
    <MobileBottomBar projectId={project.id} activeKey={activeKey} onMore={() => setMoreOpen(true)} />
    {moreOpen && (
      <MobileMoreSheet
        projectId={project.id}
        activeKey={activeKey}
        onClose={() => setMoreOpen(false)}
      />
    )}
    </AgentPanelProvider>
  );
}

function MobileBottomBar({
  projectId,
  activeKey,
  onMore,
}: {
  projectId: string;
  activeKey: string;
  onMore: () => void;
}) {
  const tabs = mobileTabs.map((k) => subnav.find((s) => s.key === k)!);
  // Layout: [tab0, tab1, <AI gap>, tab2, more]
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);
  const moreActive = !mobileTabs.includes(activeKey as (typeof mobileTabs)[number]);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      {left.map((it) => {
        const active = activeKey === it.key;
        return (
          <Link
            key={it.key}
            to={it.to}
            params={{ id: projectId }}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10.5px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <it.icon className="h-4 w-4" />
            <span className="truncate">{it.label}</span>
          </Link>
        );
      })}
      {/* Reserved center column for the raised AI button. */}
      <div aria-hidden className="h-11" />
      {right.map((it) => {
        const active = activeKey === it.key;
        return (
          <Link
            key={it.key}
            to={it.to}
            params={{ id: projectId }}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10.5px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <it.icon className="h-4 w-4" />
            <span className="truncate">{it.label}</span>
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className={cn(
          "flex flex-col items-center gap-0.5 py-2 text-[10.5px]",
          moreActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span>更多</span>
      </button>
    </nav>
  );
}

function MobileMoreSheet({
  projectId,
  activeKey,
  onClose,
}: {
  projectId: string;
  activeKey: string;
  onClose: () => void;
}) {
  const rest = subnav.filter((s) => !mobileTabs.includes(s.key as (typeof mobileTabs)[number]));
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border/60 bg-background p-4 shadow-2xl"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">全部环节</div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {rest.map((it) => {
            const active = activeKey === it.key;
            return (
              <Link
                key={it.key}
                to={it.to}
                params={{ id: projectId }}
                onClick={onClose}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-[11px]",
                  active
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border/60 bg-secondary/40 text-muted-foreground",
                )}
              >
                <it.icon className="h-4 w-4" />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StagePill({
  projectId,
  currentIdx,
  currentStage,
}: {
  projectId: string;
  currentIdx: number;
  currentStage: ProjectStage;
}) {
  const remaining = Math.max(0, stageOrder.length - 1 - currentIdx);
  const ariaLabel = `项目进度:当前阶段 ${stageLabel[currentStage]},第 ${currentIdx + 1} 步,共 ${stageOrder.length} 步,还剩 ${remaining} 步。回到项目主页。`;
  // peek: 悬停/聚焦临时预览,不劫持焦点;modal: 显式打开,启用焦点陷阱与回退
  const [mode, setMode] = useState<"closed" | "peek" | "modal">("closed");
  const open = mode !== "closed";
  const panelId = `stage-pill-panel-${projectId}`;

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const longPressRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  const closeAndRestore = () => {
    const wasModal = mode === "modal";
    setMode("closed");
    if (wasModal) {
      const target = returnFocusRef.current ?? toggleRef.current;
      requestAnimationFrame(() => target?.focus());
    }
  };

  // 打开为 modal 时:记录来源焦点、焦点移入面板、监听 Escape、Tab 环绕陷阱
  useEffect(() => {
    if (mode !== "modal") return;
    returnFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? toggleRef.current;
    const panel = panelRef.current;
    if (!panel) return;
    const getFocusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("aria-hidden"));
    const first = getFocusables()[0] ?? panel;
    // 让面板本身可编程聚焦作为兜底
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
    first.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAndRestore();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusables();
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === firstEl || !panel.contains(active))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (active === lastEl || !panel.contains(active))) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const startLongPress = () => {
    longPressFiredRef.current = false;
    if (longPressRef.current) window.clearTimeout(longPressRef.current);
    longPressRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      returnFocusRef.current = toggleRef.current;
      setMode("modal");
    }, 450);
  };
  const cancelLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const peekOpen = () => {
    if (mode === "closed") setMode("peek");
  };
  const peekClose = () => {
    if (mode === "peek") setMode("closed");
  };

  return (
    <div
      className="group relative mb-4 max-w-full"
      onMouseLeave={peekClose}
    >
      <div className="inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-border/50 bg-card/40 text-[11px] text-muted-foreground transition-colors group-hover:border-primary/40">
        <Link
          to="/projects/$id"
          params={{ id: projectId }}
          aria-label={ariaLabel}
          onMouseEnter={peekOpen}
          onFocus={peekOpen}
          onBlur={peekClose}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onTouchCancel={cancelLongPress}
          onClick={(e) => {
            if (longPressFiredRef.current) {
              e.preventDefault();
              longPressFiredRef.current = false;
            }
          }}
          className="peer inline-flex min-w-0 max-w-full items-center gap-2 px-2.5 py-1.5 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        >
          <ol className="flex shrink-0 items-center gap-1" aria-label="项目阶段进度">
            {stageOrder.map((s, i) => {
              const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
              const stateLabel = state === "done" ? "已完成" : state === "current" ? "当前" : "待开始";
              return (
                <li key={s} className="flex items-center">
                  <span
                    aria-current={state === "current" ? "step" : undefined}
                    className={cn(
                      "block rounded-full transition-all",
                      state === "current" && "h-2 w-2 bg-primary ring-2 ring-primary/25 group-hover:ring-primary/40",
                      state === "done" && "h-1.5 w-1.5 bg-[color:var(--state-verified)]",
                      state === "upcoming" && "h-1.5 w-1.5 bg-border group-hover:bg-muted-foreground/40",
                    )}
                  >
                    <span className="sr-only">
                      {i + 1}. {stageLabel[s]} · {stateLabel}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <span className="truncate text-foreground/80" aria-hidden="true">
            <span className="text-primary">{stageLabel[currentStage]}</span>
            <span className="mx-1 text-border">·</span>
            <span className="text-muted-foreground">
              第 {currentIdx + 1} / {stageOrder.length} 步 · 还剩 {remaining} 步
            </span>
          </span>
        </Link>
        <button
          ref={toggleRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (mode === "modal") {
              closeAndRestore();
            } else {
              returnFocusRef.current = toggleRef.current;
              setMode("modal");
            }
          }}
          aria-expanded={mode === "modal"}
          aria-controls={panelId}
          aria-haspopup="dialog"
          aria-label={mode === "modal" ? "收起阶段详情" : "展开阶段详情"}
          className="inline-flex min-h-11 min-w-11 items-center justify-center border-l border-border/50 px-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 sm:min-h-0 sm:min-w-0 sm:px-2.5 sm:py-1.5"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              mode === "modal" && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* modal 模式:遮罩接管外部点击,不阻塞视觉 */}
      {mode === "modal" && (
        <button
          type="button"
          aria-label="关闭阶段详情"
          tabIndex={-1}
          onClick={closeAndRestore}
          className="fixed inset-0 z-10 cursor-default bg-transparent"
        />
      )}

      {/* 阶段浮层 */}
      <div
        ref={panelRef}
        id={panelId}
        role={mode === "modal" ? "dialog" : "region"}
        aria-modal={mode === "modal" ? true : undefined}
        aria-label="项目阶段详情"
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "absolute left-0 top-full z-20 mt-1 w-[min(320px,calc(100vw-2rem))] rounded-lg border border-border/60 bg-popover p-2 text-[11px] shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open ? "block" : "hidden",
        )}
      >
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
            项目阶段
          </span>
          {mode === "modal" && (
            <button
              type="button"
              onClick={closeAndRestore}
              aria-label="关闭"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <ol className="space-y-0.5">
          {stageOrder.map((s, i) => {
            const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
            return (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-1.5 py-1",
                  state === "current" && "bg-primary/10 text-foreground",
                  state === "done" && "text-muted-foreground",
                  state === "upcoming" && "text-muted-foreground/70",
                )}
              >
                <span
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-mono",
                    state === "done" && "bg-[color:var(--state-verified)]/15 text-[color:var(--state-verified)]",
                    state === "current" && "bg-primary/20 text-primary ring-1 ring-primary/40",
                    state === "upcoming" && "bg-secondary text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                <span className="flex-1 truncate font-medium">{stageLabel[s]}</span>
                {state === "current" && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    当前
                  </span>
                )}
                {state === "done" && (
                  <span className="text-[9px] text-[color:var(--state-verified)]">✓</span>
                )}
              </li>
            );
          })}
        </ol>
        <div className="mt-1 border-t border-border/50 px-1.5 pt-1.5">
          {mode === "modal" ? (
            <Link
              to="/projects/$id"
              params={{ id: projectId }}
              onClick={closeAndRestore}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary/10 px-2 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              回到项目主页
            </Link>
          ) : (
            <span className="block px-1 text-[10px] text-muted-foreground">
              点击胶囊回到项目主页
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


function DesktopGroupNav({
  projectId,
  activeKey,
  currentStage,
  currentIdx,
}: {
  projectId: string;
  activeKey: string;
  currentStage: ProjectStage;
  currentIdx: number;
}) {
  // 当前 activeKey 所属组;overview 时默认选中"当前阶段"组
  const activeGroupKey = useMemo(() => {
    const g = navGroups.find((gr) => gr.items.includes(activeKey as NavKey));
    if (g) return g.key;
    const cs = navGroups.find((gr) => gr.stages.includes(currentStage));
    return cs?.key ?? navGroups[0].key;
  }, [activeKey, currentStage]);

  const [expandedKey, setExpandedKey] = useState<string | null>(activeGroupKey);
  useEffect(() => setExpandedKey(activeGroupKey), [activeGroupKey]);


  const expandedGroup = navGroups.find((g) => g.key === expandedKey);
  const expandedItems = expandedGroup
    ? expandedGroup.items
        .map((k) => subnav.find((s) => s.key === k))
        .filter((x): x is (typeof subnav)[number] => Boolean(x))
    : [];

  return (
    <nav className="mb-6 hidden lg:block">
      {/* Row 1: 项目主页 + 5 组 */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-card/40 p-1.5">
        <Link
          to="/projects/$id"
          params={{ id: projectId }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            activeKey === "overview"
              ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
              : "text-foreground/85 hover:bg-secondary/60",
          )}
        >
          <Home className="h-3.5 w-3.5" />
          项目主页
        </Link>
        <span className="mx-0.5 h-4 w-px bg-border/60" />
        {navGroups.map((group, gi) => {
          const groupMaxStageIdx = Math.max(
            ...group.stages.map((s) => stageOrder.indexOf(s)),
          );
          const passed = groupMaxStageIdx < currentIdx;
          const isCurrentStage = group.stages.includes(currentStage);
          const hasActive = group.items.includes(activeKey as NavKey);
          const isExpanded = expandedKey === group.key;
          return (
            <button
              key={group.key}
              type="button"
              onClick={() =>
                setExpandedKey((k) => (k === group.key ? null : group.key))
              }
              aria-expanded={isExpanded}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                hasActive
                  ? "bg-secondary text-foreground"
                  : isExpanded
                    ? "bg-secondary/60 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] font-mono",
                  passed
                    ? "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]"
                    : isCurrentStage
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border/60 bg-background/40 text-muted-foreground",
                )}
              >
                {passed ? <Check className="h-2.5 w-2.5" /> : gi + 1}
              </span>
              <span>{group.label}</span>
              {isCurrentStage && !hasActive && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                  当前
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground/70 transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Row 2: 展开组的子项 */}
      {expandedGroup && expandedItems.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1 px-1">
          <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
            {expandedGroup.label}
          </span>
          {expandedItems.map((it) => (
            <Link
              key={it.key}
              to={it.to}
              params={{ id: projectId }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                activeKey === it.key
                  ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

