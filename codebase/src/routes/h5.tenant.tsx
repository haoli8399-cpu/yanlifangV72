import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import {
  Briefcase, Bell, Users, ClipboardList,
  ChevronRight, Clock,
} from "lucide-react";
import { msaFixtures, projects } from "../lib/fixtures";

export const Route = createFileRoute("/h5/tenant")({ component: H5Tenant });

// ── 待办行 ──

function TaskRow({
  icon,
  label,
  count,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  href: string;
  color: string;
}) {
  return (
    <Link
      to={href as never}
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-3 active:bg-secondary/40"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        {React.createElement(icon, { className: "h-4 w-4" })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{count > 0 ? `${count} 项待处理` : "暂无待办"}</div>
      </div>
      {count > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    </Link>
  );
}

// ── 项目行 ──

function ProjectRow({ p }: { p: (typeof projects)[number] }) {
  const stageLabels: Record<string, string> = {
    exploring: "探索中", planning: "方案中", quoting: "报价中",
    waiting: "等待中", executing: "执行中", completed: "已完成",
  };
  return (
    <Link
      to="/h5/projects/$id"
      params={{ id: p.id } as never}
      className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/30 px-3 py-2.5 active:bg-secondary/30"
    >
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm text-foreground">{p.title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{stageLabels[p.stage] || p.stage} · {p.date}</div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
    </Link>
  );
}

// ── 主页面 ──

function H5Tenant() {
  const pendingMsa = msaFixtures.filter((m) => m.tenant_decision === "pending" && m.lifecycle_status !== "active").length;
  const activeMsa = msaFixtures.filter((m) => m.lifecycle_status === "active" || m.customer_decision === "selected").length;
  const activeProjects = projects.filter((p) => p.stage !== "completed").length;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      {/* 顶栏 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">经营工作台</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          后仰喜剧 · {activeProjects > 0 ? `${activeProjects} 个进行中项目` : "暂无进行中"}
        </p>
      </div>

      {/* 待办汇总 */}
      <div className="mb-6 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">今日待办</h2>

        <TaskRow
          icon={Bell}
          label="新服务机会"
          count={pendingMsa}
          href="/h5/tenant/msa"
          color="bg-primary/10 text-primary"
        />
        <TaskRow
          icon={ClipboardList}
          label="项目中待处理"
          count={activeMsa}
          href="/h5/tenant/msa"
          color="bg-amber-500/10 text-amber-600"
        />
        <TaskRow
          icon={Users}
          label="演员协作响应"
          count={0}
          href="/tenant/programs"
          color="bg-violet-500/10 text-violet-600"
        />
        <TaskRow
          icon={Briefcase}
          label="执行中项目"
          count={activeProjects}
          href="/projects"
          color="bg-green-500/10 text-green-600"
        />
      </div>

      {/* 快捷入口 */}
      <div className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">快捷操作</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/h5/tenant" className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">
            <ClipboardList className="h-4 w-4 text-primary" />工作台
          </Link>
          <Link to="/h5/tenant/programs" className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">
            <Briefcase className="h-4 w-4 text-primary" />节目库
          </Link>
          <Link to="/tenant/service-products" className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">
            <Briefcase className="h-4 w-4 text-primary" />服务产品
          </Link>
          <Link to="/h5/tenant/orders" className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">
            <ClipboardList className="h-4 w-4 text-primary" />订单
          </Link>
        </div>
      </div>

      {/* 进行中项目 */}
      {activeProjects > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">进行中项目</h2>
            <Link to="/h5/projects" className="text-xs text-primary/70">全部 →</Link>
          </div>
          <div className="space-y-1.5">
            {projects.filter((p) => p.stage !== "completed").slice(0, 3).map((p) => <ProjectRow key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* 脚注 */}
      <div className="border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        Demo 数据 · V7.2 开发中
      </div>
    </div>
  );
}
