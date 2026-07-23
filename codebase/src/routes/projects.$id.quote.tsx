import { createFileRoute } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { FileText, CheckCircle2 } from "lucide-react";
import { getProject, type Project } from "@/lib/fixtures";
import { listQuotes } from "@/lib/api-client";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { demoToast } from "@/lib/demo-toast";
import { EmptyState } from "@/components/yanlicube/focus-page";
import { StickyActionBar } from "@/components/yanlicube/h5";

export const Route = createFileRoute("/projects/$id/quote")({
  loader: async ({ params }): Promise<{ project: Project }> => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    try { const res = await listQuotes(params.id); (project as any).realQuoteData = res.data; } catch {}
    return { project };
  },
  component: Quote,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Quote() {
  const { project } = Route.useLoaderData() as { project: Project };
  const q = project.quote;

  if (!q) {
    const hasPlans = project.plans.length > 0;
    return (
      <EmptyState
        icon={FileText}
        title={hasPlans ? "先选一个方向,报价才会生成" : "报价会在方案选定后由主服务方生成"}
        description={
          hasPlans
            ? "在《方案》页选中一个方向并点击「推进报价」,主服务方与 AI 顾问会在 24 小时内出具正式报价。"
            : "先补全活动画像、生成方案并选定一个方向。整个流程由 AI 顾问陪跑,你只需要做关键决策。"
        }
        primary={
          hasPlans
            ? { label: "打开方案对比", to: `/projects/${project.id}/plans` }
            : { label: "去补全活动画像", to: `/projects/${project.id}/understand` }
        }
        secondary={{ label: "让 AI 顾问解释报价流程", to: "/agent" }}
        whatShowsUp={[
          "总额 · 分项(主持 / 演员 / 舞美 / 全案统筹)",
          "包含 / 不包含 / 价格驱动 3 张明细卡",
          "一键生成可粘贴给领导的中文摘要",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">报价 & 合作确认</div>
          <h2 className="text-xl font-semibold text-foreground">一份可直接用于内部审批的报价</h2>
        </div>
        <StatusBadge
          state={q.status === "confirmed" ? "verified" : q.status === "sent" ? "pending" : "ai"}
          label={q.status === "confirmed" ? "已确认" : q.status === "sent" ? "已发送 · 等待确认" : "草稿"}
        />
      </div>

      <div className="surface-2 rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            报价单 · 有效期至 {q.validUntil}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">总额</div>
            <div className="font-mono text-2xl font-semibold text-foreground">{q.total}</div>
          </div>
        </div>
        <div className="divide-y divide-border/50 rounded-lg border border-border/50 bg-background/30">
          {q.breakdown.map((b, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-foreground">{b.label}</div>
                {b.note && <div className="mt-0.5 text-xs text-muted-foreground">{b.note}</div>}
              </div>
              <div className="font-mono text-sm text-foreground">{b.amount}</div>
            </div>
          ))}
        </div>
        <EvidenceLine
          source={`主服务方 ${project.team.main?.name ?? "—"} · 与 AI 顾问共同整理`}
          time="今天"
          className="mt-4"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <IncludeCard title="包含" tone="verified" items={project.snapshot.includes} />
        <IncludeCard title="不包含" tone="muted" items={project.snapshot.excludes} />
        <IncludeCard title="价格驱动" tone="declared" items={project.snapshot.priceDrivers} />
      </div>

      <AgentInlineSuggestion title="需要一份 4 段式的报价摘要用于向领导汇报吗?">
        我可以基于这份报价 + 方案要点生成一段可直接粘贴到邮件里的中文摘要,重点覆盖:目的、方案要点、预算、下一步。
      </AgentInlineSuggestion>

      <StickyActionBar>
        <button onClick={() => demoToast()} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:flex-none">
          <CheckCircle2 className="h-4 w-4" />
          确认合作(演示)
        </button>
        <button onClick={() => demoToast()} className="shrink-0 rounded-md border border-border px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary/40">
          我要提出调整
        </button>
      </StickyActionBar>
    </div>
  );
}

function IncludeCard({ title, items, tone }: { title: string; items: string[]; tone: "verified" | "muted" | "declared" }) {
  const color =
    tone === "verified" ? "text-[color:var(--state-verified)]" :
    tone === "declared" ? "text-[color:var(--state-declared)]" : "text-muted-foreground";
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className={`mb-2 text-xs font-medium tracking-wide ${color}`}>{title}</div>
      <ul className="space-y-1.5 text-xs text-foreground/85">
        {items.map((i) => <li key={i}>· {i}</li>)}
        {items.length === 0 && <li className="text-muted-foreground">—</li>}
      </ul>
    </div>
  );
}