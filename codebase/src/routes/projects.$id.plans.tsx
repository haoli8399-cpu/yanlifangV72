import { createFileRoute, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  FileText,
  Sparkles,
  TrendingUp,
  Repeat,
  Film,
  Share2,
} from "lucide-react";
import { getProject, cases, type Project, type PlanOption } from "@/lib/fixtures";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { NextActionHero, EmptyState } from "@/components/yanlicube/focus-page";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/plans")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: Plans,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Plans() {
  const { project } = Route.useLoaderData() as { project: Project };
  const [selected, setSelected] = useState<string>(project.plans[0]?.id ?? "");
  const [view, setView] = useState<"matrix" | "storyboard" | "reuse">("matrix");

  if (project.plans.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="方案还没生成"
        description="AI 顾问会基于《理解》里的活动画像 起草 2-3 个方向,主服务方补充细节后同步到这里。补全 活动画像里的待确认信息可以让方案更贴合。"
        primary={{ label: "去补全活动画像", to: `/projects/${project.id}/understand` }}
        secondary={{ label: "让 AI 顾问先起草一版", to: "/agent" }}
        whatShowsUp={[
          "2-3 个不同定位的方案(如内容型 / 视觉型 / 复合型)",
          "每个方案的优势 / 牺牲 / 不适用 / 待确认对比",
          "故事板视图与可复用度分析",
        ]}
      />
    );
  }

  const current = project.plans.find((p) => p.id === selected)!;

  return (
    <div className="space-y-5">
      <NextActionHero
        eyebrow="此刻该做 · 方案决策"
        title={`比较 ${project.plans.length} 个方向,选定后推进报价`}
        context="每个方案已由 AI 顾问 + 主服务方共同起草,决策权在你。先看差异矩阵,再看故事板。"
        primary={{
          label: "生成领导汇报摘要",
          to: `/projects/${project.id}/decision`,
        }}
        secondary={{
          label: "生成只读分享链接",
          to: `/plans/${project.id}--${current.id}/public`,
        }}
        meta={
          <div>
            <div className="font-medium text-foreground/80">当前选定</div>
            <div className="mt-0.5">方案 {current.label} · {current.title}</div>
            <div className="mt-0.5 font-mono">{current.budgetBand}</div>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">切换视角</div>
        <div className="flex rounded-lg border border-border/60 bg-card/50 p-1 text-xs">
          <button
            onClick={() => setView("matrix")}
            className={cn(
              "rounded px-3 py-1.5",
              view === "matrix" ? "bg-secondary text-foreground" : "text-muted-foreground"
            )}
          >
            差异矩阵
          </button>
          <button
            onClick={() => setView("storyboard")}
            className={cn(
              "rounded px-3 py-1.5",
              view === "storyboard" ? "bg-secondary text-foreground" : "text-muted-foreground"
            )}
          >
            故事板
          </button>
          <button
            onClick={() => setView("reuse")}
            className={cn(
              "rounded px-3 py-1.5",
              view === "reuse" ? "bg-secondary text-foreground" : "text-muted-foreground"
            )}
          >
            复购洞察
          </button>
        </div>
      </div>


      {view === "matrix" && (
        <MatrixView plans={project.plans} selectedId={selected} onSelect={setSelected} />
      )}
      {view === "storyboard" && (
        <StoryboardView plans={project.plans} selectedId={selected} onSelect={setSelected} />
      )}
      {view === "reuse" && <ReuseInsightsView plans={project.plans} />}

      {view === "storyboard" && (
        <div className="surface-1 rounded-xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Film className="h-3 w-3" /> 方案 {current.label} · 可视化故事板
              </div>
              <div className="text-lg font-semibold text-foreground">{current.title}</div>
            </div>
            <div className="text-sm font-mono text-foreground">{current.budgetBand}</div>
          </div>
          <StoryboardTimeline plan={current} />
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-muted-foreground">模块与责任方</div>
            <div className="grid gap-2 md:grid-cols-2">
              {current.modules.map((m) => (
                <div key={m.title} className="flex items-center justify-between rounded-md border border-border/40 bg-background/30 px-3 py-2">
                  <div>
                    <div className="text-sm text-foreground">{m.title}</div>
                    <div className="text-[11px] text-muted-foreground">{m.owner}</div>
                  </div>
                  <StatusBadge state={m.state} />
                </div>
              ))}
            </div>
          </div>
          <EvidenceLine source={`方案 ${current.label} · AI 生成 · 待你确认`} time="刚刚" className="mt-4" />
        </div>
      )}

      <AgentInlineSuggestion
        title="选好方向了吗?我可以基于选定方案生成一份可发送的报价"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/projects/$id/decision"
              params={{ id: project.id }}
              className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              <FileText className="h-3 w-3" /> 生成领导汇报摘要
            </Link>
            <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              生成报价 <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        }
      >
        选定方向不代表最终确认,你在报价页面还可以继续调整。
      </AgentInlineSuggestion>
    </div>
  );
}

function MatrixView({
  plans,
  selectedId,
  onSelect,
}: {
  plans: PlanOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const current = plans.find((p) => p.id === selectedId) ?? plans[0];
  const others = plans.filter((p) => p.id !== current.id);

  const sections: {
    label: string;
    items: string[];
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    { label: "优势", items: current.strengths, icon: CheckCircle2, color: "text-[color:var(--state-verified)]" },
    { label: "牺牲", items: current.tradeoffs, icon: XCircle, color: "text-muted-foreground" },
    { label: "不适用于", items: current.unfit, icon: AlertTriangle, color: "text-[color:var(--state-warn)]" },
    { label: "待确认", items: current.pending, icon: HelpCircle, color: "text-[color:var(--state-pending)]" },
  ];

  return (
    <div className="space-y-3">
      {/* Hero: 当前选定方案完整详情 */}
      <div className="surface-1 rounded-xl border-2 border-primary/40 p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> 正在对比 · 方案 {current.label}
            </div>
            <div className="mt-1 truncate text-lg font-semibold text-foreground">{current.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{current.positioning}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[11px] text-muted-foreground">预算区间</div>
            <div className="mt-0.5 font-mono text-sm text-foreground">{current.budgetBand}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <div key={s.label} className="rounded-md border border-border/40 bg-background/30 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <s.icon className={cn("h-3 w-3", s.color)} /> {s.label}
              </div>
              {s.items.length === 0 ? (
                <div className="text-xs text-muted-foreground">—</div>
              ) : (
                <ul className="space-y-1.5">
                  {s.items.map((x) => (
                    <li key={x} className="flex items-start gap-1.5 text-xs text-foreground/85">
                      <s.icon className={cn("mt-0.5 h-3 w-3 shrink-0", s.color)} />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 其余方案:一行式摘要,点击换到顶部对比 */}
      {others.length > 0 && (
        <div className="space-y-2">
          <div className="px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            切换到其他方案对比
          </div>
          {others.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-card/70"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    方案 {p.label}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">{p.title}</span>
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {p.positioning} · {p.strengths[0] ?? "—"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-xs text-foreground/80">{p.budgetBand}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {p.strengths.length} 优势 · {p.tradeoffs.length} 牺牲
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryboardView({ plans, selectedId, onSelect }: { plans: PlanOption[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:overflow-visible">
      {plans.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            "min-w-[62%] shrink-0 snap-start rounded-lg border p-4 text-left transition-colors sm:min-w-0 sm:flex-1 sm:shrink",
            p.id === selectedId
              ? "border-primary/50 bg-primary/10"
              : "border-border/60 bg-card/40 hover:border-border"
          )}
        >
          <div className="text-xs text-muted-foreground">方案 {p.label}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{p.title}</div>
          <div className="mt-1 font-mono text-xs text-foreground/70">{p.budgetBand}</div>
        </button>
      ))}
    </div>
  );
}

function StoryboardTimeline({ plan }: { plan: PlanOption }) {
  const phaseTone = (phase: string): string => {
    if (phase.includes("签到") || phase.includes("迎宾")) return "bg-muted-foreground/40";
    if (phase.includes("开场")) return "bg-primary/70";
    if (phase.includes("高潮")) return "bg-[color:var(--state-warn)]/80";
    if (phase.includes("收尾") || phase.includes("退场")) return "bg-muted-foreground/30";
    return "bg-primary/50";
  };
  return (
    <div className="space-y-3">
      {/* Horizontal ribbon */}
      <div className="flex overflow-hidden rounded-md border border-border/40 bg-background/40">
        {plan.storyboard.map((s, i) => {
          const mins = parseInt(s.duration) || 10;
          return (
            <div
              key={i}
              className={cn("group relative border-r border-border/40 last:border-r-0 py-3 px-2 text-center", phaseTone(s.phase))}
              style={{ flex: mins }}
              title={`${s.phase} · ${s.duration} · ${s.title}`}
            >
              <div className="text-[10px] font-medium text-background/90">{s.phase}</div>
              <div className="font-mono text-[10px] text-background/70">{s.duration}</div>
            </div>
          );
        })}
      </div>
      {/* Detailed cards */}
      <div className="space-y-2">
        {plan.storyboard.map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-md border border-border/40 bg-background/30 p-3 sm:grid-cols-[40px_80px_80px_minmax(0,1fr)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 font-mono text-xs text-muted-foreground">
              {i + 1}
            </div>
            <div className="min-w-0 sm:hidden">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-medium">{s.phase}</span>
                <span className="font-mono">{s.duration}</span>
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{s.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.detail}</div>
            </div>
            <div className="hidden self-center text-xs font-medium text-muted-foreground sm:block">{s.phase}</div>
            <div className="hidden self-center font-mono text-xs text-foreground/80 sm:block">{s.duration}</div>
            <div className="hidden min-w-0 sm:block">
              <div className="text-sm font-medium text-foreground">{s.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReuseInsightsView({ plans }: { plans: PlanOption[] }) {
  // 从案例库中挑出与方案匹配度较高的历史项目作为复购洞察示例
  const insights = [
    {
      caseId: cases[0].id,
      title: cases[0].title,
      industry: cases[0].industry,
      outcome: cases[0].outcome,
      similarity: 87,
      matchedPlan: plans[0]?.label ?? "A",
      matchedReason: "调性相近(私行/高净值)· 定制脱口秀 + 双语主持结构一致",
      reusable: ["脱口秀改稿模板", "双语主持流程稿", "近景魔术道具清单"],
      lessons: ["首轮内容评审预留 5 天以上", "客户方审批链路长,合同需前置 10 天"],
    },
    {
      caseId: cases[2].id,
      title: cases[2].title,
      industry: cases[2].industry,
      outcome: cases[2].outcome,
      similarity: 64,
      matchedPlan: plans[1]?.label ?? "B",
      matchedReason: "视觉记忆点结构可参考,近景魔术演员相同",
      reusable: ["近景魔术 VIP 巡桌走位图"],
      lessons: ["'不可思议'主线在金融场景需重写,不能直接复用"],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="surface-1 rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold text-foreground">AI 复购洞察</div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
            基于 3 个相似历史项目
          </span>
        </div>
        <p className="text-xs text-foreground/80">
          我在你的案例库与全平台相似项目中,找到 2 段可以直接被本次方案沿用的经验。复用不会跳过评审,只是替你省掉从零起草的时间。
        </p>
      </div>

      {insights.map((it) => (
        <div key={it.caseId} className="surface-1 rounded-xl p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <div className="text-sm font-semibold text-foreground">{it.title}</div>
                <span className="rounded border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {it.industry}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{it.outcome}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                <span className="font-mono">{it.similarity}% 相似度</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                最匹配方案 {it.matchedPlan}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/40 bg-background/30 p-3 text-xs text-foreground/85">
            {it.matchedReason}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-[color:var(--state-verified)]" /> 可复用
              </div>
              <ul className="space-y-1">
                {it.reusable.map((r) => (
                  <li key={r} className="text-xs text-foreground/85">· {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-[color:var(--state-warn)]" /> 需要注意
              </div>
              <ul className="space-y-1">
                {it.lessons.map((r) => (
                  <li key={r} className="text-xs text-foreground/85">· {r}</li>
                ))}
              </ul>
            </div>
          </div>

          <EvidenceLine
            source={`历史案例 · ${it.title} · AI 相似度分析`}
            time="AI 生成"
            className="mt-3"
          />
        </div>
      ))}
    </div>
  );
}