import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { projects, stageLabel, type EvidenceState, type ProjectStage } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { NextActionHero, DetailBlock, DetailStack } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "我的活动 · 演立方" },
      { name: "description", content: "查看所有活动项目空间,快速定位需要处理的项目。" },
    ],
  }),
  component: ProjectsList,
});

const stageState: Record<ProjectStage, EvidenceState> = {
  exploring: "ai",
  planning: "ai",
  quoting: "pending",
  waiting: "pending",
  executing: "declared",
  completed: "verified",
};

// 阶段紧迫性排序:需要客户操作的排最前
const urgencyOrder: ProjectStage[] = ["planning", "quoting", "exploring", "executing", "waiting", "completed"];
const needAction = (s: ProjectStage) => ["planning", "quoting", "exploring"].includes(s);

function ProjectsList() {
  const active = projects.filter((p) => p.stage !== "completed");
  const done = projects.filter((p) => p.stage === "completed");

  const sorted = [...active].sort(
    (a, b) => urgencyOrder.indexOf(a.stage) - urgencyOrder.indexOf(b.stage),
  );
  const topPriority = sorted.find((p) => needAction(p.stage)) ?? sorted[0];
  const waitingCount = active.filter((p) => !needAction(p.stage)).length;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
        <div className="min-w-0">
          <div className="mb-1 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">我的活动</div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">你的活动空间</h1>
        </div>
        <Link
          to="/agent"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground sm:px-4 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          新活动
        </Link>
      </div>

      {topPriority && (
        <NextActionHero
          eyebrow={`此刻该处理 · ${stageLabel[topPriority.stage]}`}
          title={topPriority.title}
          context={topPriority.nextAction}
          primary={{
            label: "打开这个活动",
            to: `/projects/${topPriority.id}`,
          }}
          secondary={
            waitingCount > 0
              ? { label: `另有 ${waitingCount} 场等待中` }
              : undefined
          }
          meta={
            <div>
              <div className="font-medium text-foreground/80">{topPriority.client}</div>
              <div className="mt-0.5">{topPriority.date} · {topPriority.city}</div>
            </div>
          }
        />
      )}

      <div className="mt-6 sm:mt-8">
        <DetailStack label={`进行中 · ${active.length} 场`}>
          {sorted.map((p) => (
            <ProjectRow key={p.id} p={p} />
          ))}
        </DetailStack>
      </div>

      {done.length > 0 && (
        <div className="mt-8">
          <DetailStack label={`已完成 · ${done.length} 场 · 可再办一次`}>
            {done.map((p) => (
              <ProjectRow key={p.id} p={p} />
            ))}
          </DetailStack>
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        所有数据为演示 · 非真实业务事实
      </div>
    </div>
  );
}

function ProjectRow({ p }: { p: (typeof projects)[number] }) {
  return (
    <Link
      to="/projects/$id"
      params={{ id: p.id }}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card/60 sm:px-5 sm:py-4"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <StatusBadge state={stageState[p.stage]} label={stageLabel[p.stage]} />
          <span className="text-[10px] text-muted-foreground">{p.date} · {p.city}</span>
        </div>
        <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
          {p.title}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {p.client} · {p.headline}
        </div>
      </div>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary sm:block" />
    </Link>
  );
}
