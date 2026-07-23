import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Calendar, Users, ChevronRight } from "lucide-react";
import { useProject } from "../lib/hooks";
import { projects } from "../lib/fixtures";
import { TenantH5BottomTabs } from "@/components/yanlicube/h5-tenant-nav";

export const Route = createFileRoute("/h5/projects/$id")({ component: H5ProjectDetail });

const stageLabels: Record<string, string> = {
  exploring: "探索中", planning: "方案中", quoting: "报价中",
  waiting: "等待中", executing: "执行中", completed: "已完成",
};

function H5ProjectDetail() {
  const { id } = useParams({ from: Route.id });
  const { data: projectData } = useProject(id);
  const project = projectData || projects.find((p) => p.id === id);

  if (!project) return <div className="p-4 text-sm text-muted-foreground">项目未找到</div>;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-4">
      <Link to="/h5/projects" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />返回列表
      </Link>

      <h1 className="text-lg font-bold text-foreground">{project.title}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.city}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.date}</span>
        <span>{stageLabels[project.stage] || project.stage}</span>
      </div>

      {/* 快捷操作 */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link to="/h5/projects/$id" params={{ id }} className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-sm text-center text-foreground active:bg-secondary/40">📋 查看详情</Link>
        <Link to="/h5/projects/deal" search={{ id }} className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-sm text-center text-foreground active:bg-secondary/40">💰 商务确认</Link>
      </div>

      <div className="mt-8 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        V7.2 开发中 · 演示数据
      </div>
      <TenantH5BottomTabs />
    </div>
  );
}
