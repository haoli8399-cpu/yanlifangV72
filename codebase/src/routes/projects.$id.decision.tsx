import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Printer,
  Sparkle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { getProject, type Project, type PlanOption } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/decision")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project.title ?? "活动"} · 决策摘要` },
      {
        name: "description",
        content: "面向领导汇报的一页式决策摘要:推荐方向、依据、影响、风险与需要拍板的事项。",
      },
    ],
  }),
  component: DecisionSummary,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function DecisionSummary() {
  const { project } = Route.useLoaderData() as { project: Project };
  const [selectedId, setSelectedId] = useState<string>(
    project.selectedPlanId ?? project.plans[0]?.id ?? "",
  );

  if (project.plans.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="surface-1 rounded-xl p-8">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            决策摘要将在方案生成后自动整理。回到活动空间继续把《理解》推进到《方案》。
          </div>
          <Link
            to="/projects/$id"
            params={{ id: project.id }}
            className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            返回活动空间 →
          </Link>
        </div>
      </div>
    );
  }

  const recommended =
    project.plans.find((p) => p.id === selectedId) ?? project.plans[0];
  const alternatives = project.plans.filter((p) => p.id !== recommended.id);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-5 pb-24 md:px-6 md:py-10 md:pb-10">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden md:mb-6 md:gap-3">
        <Link
          to="/projects/$id/plans"
          params={{ id: project.id }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 回到方案
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-x-auto rounded-md border border-border/60 bg-card/50 p-0.5 text-[11px]">
            {project.plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "shrink-0 rounded px-2.5 py-1",
                  p.id === recommended.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                方案 {p.label}
              </button>
            ))}
          </div>
          <button onClick={() => demoToast()} className="hidden md:inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
            <Copy className="h-3 w-3" /> 复制到邮件
          </button>
          <button
            onClick={() => window.print()}
            className="hidden md:inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
          >
            <Printer className="h-3 w-3" /> 打印 / PDF
          </button>
        </div>
      </div>

      {/* Document card */}
      <article className="surface-2 rounded-2xl border border-border/60 p-5 shadow-2xl md:p-10">
        {/* Header */}
        <header className="border-b border-border/50 pb-6">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>决策摘要 · 面向领导汇报</span>
            <span>V1 · AI 顾问整理</span>
          </div>
          <h1 className="mt-3 text-[26px] font-semibold leading-tight text-foreground">
            {project.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{project.client}</span>
            <span>{project.date} · {project.city}</span>
            <span>{project.scale}</span>
            <span>预算区间 · {project.brief.budgetBand}</span>
          </div>
        </header>

        {/* TL;DR */}
        <Section title="一句话结论" hint="给领导 30 秒读完">
          <p className="text-[15px] leading-relaxed text-foreground">
            建议采用<strong className="mx-1 text-primary">方案 {recommended.label}「{recommended.title}」</strong>
            推进,预算 <span className="font-mono">{recommended.budgetBand}</span>,
            核心理由:{recommended.strengths[0]}。需在<strong>本周内</strong>
            拍板方向以确保 1 月旺季演员档期。
          </p>
        </Section>

        {/* Why this */}
        <Section title="为什么是这个方向" hint="三条支撑理由,可展开">
          <ol className="space-y-3">
            {recommended.strengths.slice(0, 3).map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="text-sm leading-relaxed text-foreground/90">{s}</div>
              </li>
            ))}
          </ol>
          <EvidenceLine
            source={`来自方案 ${recommended.label} · AI 顾问与主服务方共同起草`}
            time="今日"
            className="mt-4"
          />
        </Section>

        {/* Cost vs value */}
        <Section title="花在哪 · 换到什么">
          <div className="grid gap-3 md:grid-cols-2">
            <ValueBox label="预算范围" tone="primary">
              <div className="font-mono text-lg text-foreground">{recommended.budgetBand}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                较最省方向高 <ComparePct plans={project.plans} rec={recommended} />
              </div>
            </ValueBox>
            <ValueBox label="换到的价值">
              <ul className="space-y-1 text-xs text-foreground/85">
                {recommended.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--state-verified)]" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </ValueBox>
          </div>
        </Section>

        {/* Trade-offs & risks */}
        <Section title="牺牲了什么 · 有什么风险" hint="领导最想问的两件事">
          <div className="grid gap-3 md:grid-cols-2">
            <RiskBox
              icon={AlertTriangle}
              tone="warn"
              title="选这个方向的牺牲"
              items={recommended.tradeoffs}
            />
            <RiskBox
              icon={AlertTriangle}
              tone="warn"
              title="推进过程中的风险"
              items={project.snapshot.risks}
            />
          </div>
        </Section>

        {/* Pending decisions */}
        <Section title="需要你拍板的事" hint="每一项都会在报价与合同前锁定">
          <ul className="divide-y divide-border/50 rounded-lg border border-border/50 bg-background/30">
            {[...recommended.pending, ...project.snapshot.pending].map((p, i) => (
              <li key={i} className="flex items-start gap-3 p-3">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--state-pending)]" />
                <div className="flex-1 text-sm text-foreground/90">{p}</div>
                <StatusBadge state="pending" />
              </li>
            ))}
            {recommended.pending.length + project.snapshot.pending.length === 0 && (
              <li className="p-4 text-center text-xs text-muted-foreground">
                当前无待拍板事项,可直接进入报价
              </li>
            )}
          </ul>
        </Section>

        {/* Alternatives */}
        <Section title="备选方向 · 一目了然" hint="如果不选推荐方案">
          <div className="grid gap-3 md:grid-cols-2">
            {alternatives.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-border/50 bg-background/30 p-4"
              >
                <div className="mb-1 text-[10px] tracking-[0.14em] text-muted-foreground">
                  方案 {p.label} · 备选
                </div>
                <div className="text-sm font-semibold text-foreground">{p.title}</div>
                <div className="mt-1 font-mono text-xs text-foreground/70">{p.budgetBand}</div>
                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                  <div>· 若选它:{p.strengths[0]}</div>
                  <div>· 但要接受:{p.tradeoffs[0] ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Team */}
        <Section title="谁在为你负责">
          <div className="rounded-lg border border-primary/30 bg-primary/[0.05] p-4">
            <div className="mb-1 text-[10px] tracking-[0.14em] text-primary">唯一主服务方</div>
            <div className="text-sm font-semibold text-foreground">
              {project.team.main?.name ?? "尚未分配"}
            </div>
            {project.team.main && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {project.team.main.contact ?? project.team.main.scope}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {project.team.actors.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-card/40 px-2 py-1"
              >
                {a.name} · {a.scope}
                {a.confirmed ? (
                  <StatusBadge state="verified" label="已确认" />
                ) : (
                  <StatusBadge state="pending" label="待档期" />
                )}
              </span>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between border-t border-border/50 pt-5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sparkle className="h-3 w-3 text-[color:var(--state-ai)]" />
            由 AI 顾问基于当前活动画像与方案自动整理 · 每次方案更新会同步刷新
          </div>
          <div>演立方 · 面向领导汇报的一页式摘要</div>
        </footer>
      </article>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden print:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => demoToast()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-3 py-2.5 text-xs text-foreground"
        >
          <Copy className="h-3.5 w-3.5" /> 复制到邮件
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <Printer className="h-3.5 w-3.5" /> 保存 PDF
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </section>
  );
}

function ValueBox({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "primary";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "primary"
          ? "border-primary/30 bg-primary/[0.05]"
          : "border-border/50 bg-background/30",
      )}
    >
      <div className="mb-1.5 text-[11px] tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function RiskBox({
  icon: Icon,
  tone,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "warn";
  title: string;
  items: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "warn" &&
          "border-[color:var(--state-warn)]/40 bg-[color:var(--state-warn)]/[0.05]",
      )}
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground/90">
        <Icon className="h-3.5 w-3.5 text-[color:var(--state-warn)]" />
        {title}
      </div>
      <ul className="space-y-1 text-xs text-foreground/85">
        {items.map((x) => (
          <li key={x}>· {x}</li>
        ))}
        {items.length === 0 && <li className="text-muted-foreground">— 无</li>}
      </ul>
    </div>
  );
}

function ComparePct({ plans, rec }: { plans: PlanOption[]; rec: PlanOption }) {
  const pct = useMemo(() => {
    const parse = (s: string) =>
      Number((s.match(/[\d.]+/g) ?? ["0"])[0]);
    const recLow = parse(rec.budgetBand);
    const min = Math.min(...plans.map((p) => parse(p.budgetBand)));
    if (!min) return "—";
    return `${Math.round(((recLow - min) / min) * 100)}%`;
  }, [plans, rec]);
  return <span className="font-mono text-foreground/80">{pct}</span>;
}