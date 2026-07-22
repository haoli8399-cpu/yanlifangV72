import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Receipt, FileText, CreditCard, AlertCircle } from "lucide-react";
import { projects } from "../lib/fixtures";

export const Route = createFileRoute("/h5/projects/deal")({ component: H5Deal });

function H5Deal() {
  const { id } = useParams({ from: Route.id });
  const project = projects.find((p) => p.id === id);
  if (!project) return <div className="p-4 text-sm text-muted-foreground">活动未找到</div>;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-4">
      <Link to="/h5/projects/$id" params={{ id }} className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />返回
      </Link>
      <h1 className="text-base font-bold text-foreground">商务确认</h1>
      <p className="mt-1 text-xs text-muted-foreground">{project.title}</p>

      <div className="mt-5 space-y-4">
        {project.quote && (
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">正式报价</h3>
            </div>
            <div className="mt-3 text-2xl font-bold text-foreground">{project.quote.total}</div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground">接受报价</button>
              <button className="flex-1 rounded-lg border border-border/60 py-2.5 text-xs text-muted-foreground">拒绝</button>
            </div>
          </div>
        )}
        {project.credential && (
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">合作凭证</h3>
            </div>
            <p className="mt-2 text-sm text-foreground/80">{project.credential.title}</p>
            <button className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">确认合作</button>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="text-[10px] text-muted-foreground">演示状态 · 不产生真实业务确认</div>
      </div>
    </div>
  );
}
