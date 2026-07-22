import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, MapPin, Calendar, ChevronRight } from "lucide-react";
import { projects } from "../lib/fixtures";

export const Route = createFileRoute("/h5/projects")({ component: H5Projects });

const stageLabels: Record<string, string> = {
  exploring: "探索中", planning: "方案中", quoting: "报价中",
  waiting: "等待中", executing: "执行中", completed: "已完成",
};
const stageColors: Record<string, string> = {
  exploring: "border-[var(--state-declared)]/40 bg-[var(--state-declared)]/10 text-[var(--state-declared)]",
  planning: "border-[var(--state-ai)]/40 bg-[var(--state-ai)]/10 text-[var(--state-ai)]",
  quoting: "border-[var(--state-pending)]/40 bg-[var(--state-pending)]/10 text-[var(--state-pending)]",
  waiting: "border-[var(--state-pending)]/40 bg-[var(--state-pending)]/10 text-[var(--state-pending)]",
  executing: "border-primary/40 bg-primary/10 text-primary",
  completed: "border-[var(--state-verified)]/40 bg-[var(--state-verified)]/10 text-[var(--state-verified)]",
};

function ProjectCard({ p }: { p: (typeof projects)[number] }) {
  return (
    <Link
      to="/h5/projects/$id"
      params={{ id: p.id }}
      className="block rounded-xl border border-border/60 bg-card p-4 active:bg-secondary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground flex-1">{p.title}</h3>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${stageColors[p.stage] || stageColors.exploring}`}>
          {stageLabels[p.stage] || p.stage}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</span>
      </div>
      {p.stage === "completed" && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/70">
          已完成 · 可查看活动总结
        </div>
      )}
    </Link>
  );
}

function H5Projects() {
  const active = projects.filter((p) => p.stage !== "completed");
  const done = projects.filter((p) => p.stage === "completed");

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">我的活动</h1>
          <p className="text-xs text-muted-foreground">{active.length} 个进行中</p>
        </div>
      </div>

      <div className="space-y-3">
        {active.map((p) => <ProjectCard key={p.id} p={p} />)}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">已完成</h2>
          <div className="space-y-3">
            {done.map((p) => <ProjectCard key={p.id} p={p} />)}
          </div>
        </>
      )}

      <div className="mt-8 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        V7.2 开发中 · 演示数据
      </div>
    </div>
  );
}
