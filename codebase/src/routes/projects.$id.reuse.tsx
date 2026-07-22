import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CalendarClock,
  Users,
  Wallet,
  MapPin,
  Sparkle,
  Check,
  Minus,
} from "lucide-react";
import { getProject, type Project } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

type Change = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  previous: string;
  proposed: string;
  reason: string;
  needsAction: boolean;
  category: "date" | "audience" | "budget" | "actor" | "content";
};

export const Route = createFileRoute("/projects/$id/reuse")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `再办一次 · ${loaderData?.project.title ?? "活动"}` },
      {
        name: "description",
        content: "基于上次活动一键起草新版本,AI 顾问标注需要更新的变化项。",
      },
    ],
  }),
  component: Reuse,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Reuse() {
  const { project } = Route.useLoaderData() as { project: Project };

  // 模拟基于上次活动生成的下一版本变化项
  const changes: Change[] = [
    {
      key: "date",
      label: "活动日期",
      icon: CalendarClock,
      previous: project.date,
      proposed: nextYearDate(project.date),
      reason: "沿用农历新年后第一个工作周,方便全员到岗",
      needsAction: true,
      category: "date",
    },
    {
      key: "city",
      label: "城市",
      icon: MapPin,
      previous: project.city,
      proposed: project.city,
      reason: "组织总部所在地,复用同一场地关系",
      needsAction: false,
      category: "audience",
    },
    {
      key: "audience",
      label: "参会规模",
      icon: Users,
      previous: project.scale,
      proposed: bumpScale(project.scale),
      reason: "组织净新增员工约 15%,建议同步扩容",
      needsAction: true,
      category: "audience",
    },
    {
      key: "budget",
      label: "预算区间",
      icon: Wallet,
      previous: project.brief.budgetBand,
      proposed: bumpBudget(project.brief.budgetBand),
      reason: "上次结算已明确 CFO 认可 10% 上浮空间",
      needsAction: true,
      category: "budget",
    },
    {
      key: "actor_lead",
      label: "领衔演员",
      icon: Users,
      previous: project.team.actors[0]?.name ?? "—",
      proposed: project.team.actors[0]?.name ?? "—",
      reason: "上次 NPS 极高,建议优先锁档",
      needsAction: true,
      category: "actor",
    },
    {
      key: "content",
      label: "核心内容模块",
      icon: Sparkle,
      previous: project.snapshot.includes[0] ?? "—",
      proposed: `${project.snapshot.includes[0] ?? "—"} + 新增 15 分钟客户共创`,
      reason: "去年反馈'希望多一点参与感',AI 建议加入共创",
      needsAction: true,
      category: "content",
    },
  ];

  const [decisions, setDecisions] = useState<Record<string, "keep" | "update" | "skip">>({});
  const decide = (k: string, v: "keep" | "update" | "skip") =>
    setDecisions((d) => ({ ...d, [k]: v }));

  const pendingCount = changes.filter(
    (c) => c.needsAction && !decisions[c.key],
  ).length;
  const readyCount = changes.length - pendingCount;

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/projects/$id/outcome"
          params={{ id: project.id }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 回到成果
        </Link>
        <StatusBadge state="ai" label="AI 起草的下一版" />
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
          <RotateCw className="h-4 w-4 text-primary" />
          再办一次
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          基于《{project.title}》,我为你起草了下一版本
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          我把上次活动的画像、方案、团队与成果都复制了过来,只把你可能想更新的地方标了出来。
          你逐项决定"沿用"或"更新",我会自动同步到新的项目空间。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Changes */}
        <div className="space-y-3">
          {changes.map((c) => {
            const d = decisions[c.key];
            return (
              <div
                key={c.key}
                className={cn(
                  "surface-1 rounded-xl border p-5 transition-colors",
                  d === "update" && "border-primary/50 bg-primary/[0.05]",
                  d === "keep" && "border-[color:var(--state-verified)]/40",
                  !d && c.needsAction && "border-[color:var(--state-pending)]/40",
                  !d && !c.needsAction && "border-border/50",
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <c.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-semibold text-foreground">{c.label}</div>
                    {c.needsAction ? (
                      <StatusBadge state="pending" label="建议更新" />
                    ) : (
                      <StatusBadge state="verified" label="可直接沿用" />
                    )}
                  </div>
                  {d && (
                    <span className="text-[11px] text-muted-foreground">
                      你选择了 · {d === "keep" ? "沿用" : d === "update" ? "采纳 AI 建议" : "跳过"}
                    </span>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_24px_1fr]">
                  <Side label="上次" tone="muted">
                    {c.previous}
                  </Side>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Side label="AI 建议" tone={c.needsAction ? "primary" : "verified"}>
                    {c.proposed}
                  </Side>
                </div>

                <div className="mt-3 rounded-md border border-border/40 bg-background/40 p-3 text-[11px] text-foreground/75">
                  <span className="text-muted-foreground">依据 · </span>
                  {c.reason}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => decide(c.key, "update")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium",
                      d === "update"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-card/50 text-foreground/85 hover:border-primary/40",
                    )}
                  >
                    <Check className="h-3 w-3" /> 采纳 AI 建议
                  </button>
                  <button
                    onClick={() => decide(c.key, "keep")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium",
                      d === "keep"
                        ? "bg-secondary text-foreground"
                        : "border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Minus className="h-3 w-3" /> 沿用上次
                  </button>
                  <button
                    onClick={() => decide(c.key, "skip")}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    先跳过
                  </button>
                </div>
              </div>
            );
          })}

          <EvidenceLine
            source={`基于《${project.title}》· 上次成果 NPS ${project.outcome?.npsBand ?? "—"}`}
            time="AI 顾问 · 今日"
            className="pt-2"
          />
        </div>

        {/* Sidebar summary */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="surface-2 rounded-xl p-5">
            <div className="mb-3 text-xs tracking-[0.14em] text-muted-foreground">
              起草进度
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-foreground">
                {readyCount}
              </div>
              <div className="text-xs text-muted-foreground">/ {changes.length} 项已决定</div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(readyCount / changes.length) * 100}%` }}
              />
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              还有 {pendingCount} 项建议更新等你决定
            </div>
          </div>

          <div className="surface-1 rounded-xl p-5">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              自动沿用的部分
            </div>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li>· 主服务方 · {project.team.main?.name}</li>
              <li>· 核心团队与联系人</li>
              <li>· 结算流程与合同模板</li>
              <li>· 上次调性与 must-avoid 清单</li>
            </ul>
          </div>

          <button
            disabled={pendingCount > 0}
            className={cn(
              "w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
              pendingCount === 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed border border-border/60 bg-card/40 text-muted-foreground",
            )}
          >
            {pendingCount === 0
              ? "生成 2027 版活动空间"
              : `还有 ${pendingCount} 项待决定`}
          </button>
        </aside>
      </div>

      <div className="mt-8">
        <AgentInlineSuggestion
          title="要不要我先把上次 NPS 极高的三段内容直接锁进新版?"
          actions={
            <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              锁进新版 <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          上次的即兴共创、CEO 收尾致辞、以及何轩的开场都拿到了 4.7/5 以上的评分。
          我可以直接把这三段作为新版的骨架,你只需要决定要不要新增第 4 段。
        </AgentInlineSuggestion>
      </div>
    </div>
  );
}

function Side({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "muted" | "primary" | "verified";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "muted" && "border-border/50 bg-background/30",
        tone === "primary" && "border-primary/40 bg-primary/[0.06]",
        tone === "verified" &&
          "border-[color:var(--state-verified)]/30 bg-[color:var(--state-verified)]/[0.05]",
      )}
    >
      <div className="mb-1 text-[10px] tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function nextYearDate(d: string) {
  const m = d.match(/^(\d{4})(-\d{2}-\d{2})$/);
  if (!m) return d;
  return `${Number(m[1]) + 1}${m[2]}`;
}

function bumpScale(s: string) {
  const m = s.match(/(\d+)/);
  if (!m) return s;
  const n = Math.round(Number(m[1]) * 1.15);
  return s.replace(m[1], String(n));
}

function bumpBudget(b: string) {
  const nums = b.match(/\d+/g);
  if (!nums || nums.length < 2) return b;
  const lo = Math.round(Number(nums[0]) * 1.1);
  const hi = Math.round(Number(nums[1]) * 1.1);
  return b.replace(nums[0], String(lo)).replace(nums[1], String(hi));
}