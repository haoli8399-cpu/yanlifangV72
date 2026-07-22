import { Link, createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { projects } from "@/lib/fixtures";
import type { PlanOption } from "@/lib/fixtures";
import {
  ShieldCheck,
  Sparkles,
  Share2,
  Printer,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Users,
  Building2,
  ClipboardList,
  Calendar,
  Copy,
  Check,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/yanlicube/status-badge";

export const Route = createFileRoute("/plans/$id/public")({
  loader: ({ params }) => {
    // params.id encodes projectId--planId, e.g. proj_neoyear--plan_A
    const [projectId, planId] = params.id.split("--");
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw notFound();
    const plan = project.plans.find((pl) => pl.id === planId) ?? project.plans[0];
    return { project, plan };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "方案已失效 · 演立方" },
          { name: "robots", content: "noindex" },
        ],
      };
    const { project, plan } = loaderData;
    const title = `${project.title} · 方案 ${plan.label} · ${plan.title}`;
    return {
      meta: [
        { title },
        { name: "description", content: plan.positioning },
        { property: "og:title", content: title },
        { property: "og:description", content: plan.positioning },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PublicPlanPage,
  notFoundComponent: PlanGone,
});

function PublicPlanPage() {
  const { project, plan } = Route.useLoaderData();
  const totalDuration = plan.storyboard.reduce((acc: number, s: PlanOption["storyboard"][number]) => {
    const n = parseInt(s.duration.replace(/[^0-9]/g, ""), 10);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Share bar */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2 px-4 py-2.5 md:px-6 md:py-3">
          <div className="inline-flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground md:text-xs">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">演立方 · 只读分享</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Printer className="h-3.5 w-3.5" /> 打印 · 导出 PDF
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] text-primary hover:bg-primary/20 md:px-3 md:text-xs"
            >
              <Share2 className="h-3.5 w-3.5" /> 复制链接
            </button>
          </div>
        </div>
      </div>

      {shareOpen && <ShareDialog project={project} plan={plan} onClose={() => setShareOpen(false)} />}

      <div className="mx-auto max-w-[1100px] px-4 py-6 pb-24 md:px-6 md:py-14 md:pb-14">
        {/* Cover */}
        <header className="mb-8 border-b border-border/60 pb-6 md:mb-14 md:pb-10">
          <div className="mb-3 font-mono text-[10.5px] tracking-[0.2em] text-muted-foreground md:mb-4 md:text-[11px]">
            方案 · {plan.label} / {project.plans.length} · {project.date}
          </div>
          <h1 className="max-w-3xl text-[26px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-5xl">
            {plan.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground md:mt-4 md:text-base">
            {plan.positioning}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
            <Meta icon={Building2} label="项目" value={project.title} />
            <Meta icon={Calendar} label="演出日期" value={project.date} />
            <Meta icon={Users} label="规模" value={project.scale} />
            <Meta icon={ClipboardList} label="预算区间" value={plan.budgetBand} />
          </div>
        </header>

        {/* Positioning: strengths / tradeoffs / unfit */}
        <section className="mb-14 grid gap-4 md:grid-cols-3">
          <Card tone="verified" title="强项" icon={CheckCircle2} items={plan.strengths} />
          <Card tone="pending" title="取舍" icon={AlertTriangle} items={plan.tradeoffs} />
          <Card tone="declared" title="不适合" icon={Lock} items={plan.unfit} />
        </section>

        {/* Storyboard */}
        <section className="mb-14">
          <SectionEyebrow eyebrow="活动流程 · 故事板" title={`总时长 ${totalDuration}′`} />
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border/60" />
            {plan.storyboard.map((s: PlanOption["storyboard"][number], i: number) => (
              <div key={i} className="relative mb-6 last:mb-0">
                <div className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-[11px] tracking-wider text-primary">
                    {s.phase}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {s.duration}
                  </span>
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground">
                  {s.title}
                </div>
                {s.detail && (
                  <div className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {s.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Modules / responsibility */}
        <section className="mb-14">
          <SectionEyebrow eyebrow="内容与责任" title="每一项都可追溯到承担人" />
          <div className="surface-1 divide-y divide-border/50 rounded-2xl">
            {plan.modules.map((m: PlanOption["modules"][number], i: number) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {m.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    承担人 · {m.owner}
                  </div>
                </div>
                <StatusBadge state={m.state} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            主服务方对整体承担唯一责任;协作方与演员的内部责任由主服务方统筹,与客户无直接合同关系。
          </p>
        </section>

        {/* Pending / risks */}
        {plan.pending.length > 0 && (
          <section className="mb-14">
            <SectionEyebrow eyebrow="待确认" title="签约前需要处理的问题" />
            <ul className="space-y-2">
              {plan.pending.map((p: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/8 p-3 text-sm text-foreground/85"
                >
                  <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--state-pending)]" />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* AI summary */}
        <section className="mb-14 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI 观察
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            这个方案的关键假设
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/80">
            方案预算处于 {plan.budgetBand} 区间,匹配 {project.brief.audience}。
            强项集中在{plan.strengths[0]},代价在{plan.tradeoffs[0] ?? "-"}。
            若你希望调整重心,可在 AI 顾问中直接说出关注点,我会重新生成一版差异对比。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/projects/$id/plans"
              params={{ id: project.id }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              进入方案对比 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/agent"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-background px-4 py-2 text-xs text-primary hover:bg-primary/10"
            >
              和 AI 顾问讨论
            </Link>
          </div>
        </section>

        <footer className="border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> 演立方 · 分享链接为只读,不包含金额明细与合同条款
            </span>
            <span className="font-mono">brief · updated {project.brief.updatedAt}</span>
          </div>
        </footer>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden print:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => window.print()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-3 py-2.5 text-xs text-foreground"
        >
          <Printer className="h-3.5 w-3.5" /> 保存为 PDF
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <Share2 className="h-3.5 w-3.5" /> 转发给同事
        </button>
      </div>
    </div>
  );
}

function PlanGone() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <Lock className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
      <h1 className="text-xl font-semibold text-foreground">分享链接已失效</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        该方案可能已被主服务方撤回或替换。请联系发送方获取最新链接。
      </p>
      <button
        onClick={() => router.invalidate()}
        className="mt-6 rounded-md border border-border/60 bg-secondary/40 px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
      >
        重试
      </button>
    </div>
  );
}

type PlanForShare = ReturnType<typeof Route.useLoaderData>["plan"];
type ProjectForShare = ReturnType<typeof Route.useLoaderData>["project"];

function ShareDialog({
  project,
  plan,
  onClose,
}: {
  project: ProjectForShare;
  plan: PlanForShare;
  onClose: () => void;
}) {
  const [expiresDays, setExpiresDays] = useState<7 | 30 | 0>(7);
  const [hideBudget, setHideBudget] = useState(true);
  const [passwordOn, setPasswordOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}/plans/${project.id}--${plan.id}/public`
        : `/plans/${project.id}--${plan.id}/public`;
    const params = new URLSearchParams();
    params.set("t", Math.random().toString(36).slice(2, 10));
    if (expiresDays > 0) params.set("exp", String(expiresDays));
    if (hideBudget) params.set("hb", "1");
    if (passwordOn) params.set("pw", "1");
    return `${base}?${params.toString()}`;
  }, [project.id, plan.id, expiresDays, hideBudget, passwordOn]);

  const password = useMemo(
    () => (passwordOn ? Math.random().toString(36).slice(2, 8).toUpperCase() : ""),
    [passwordOn],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        password ? `${shareUrl}\n访问密码：${password}` : shareUrl,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur print:hidden"
      onClick={onClose}
    >
      <div
        className="surface-1 w-full max-w-lg rounded-2xl border border-border/60 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] text-muted-foreground">
              <Share2 className="h-3 w-3" /> 公开分享
            </div>
            <h3 className="text-lg font-semibold text-foreground">生成只读分享链接</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              收件人无需登录,即可查看该方案的展示版本。链接可随时撤回。
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options */}
        <div className="mb-4 space-y-3">
          <div>
            <div className="mb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground">
              有效期
            </div>
            <div className="flex gap-2">
              {[
                { v: 7, label: "7 天" },
                { v: 30, label: "30 天" },
                { v: 0, label: "永久" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setExpiresDays(o.v as 7 | 30 | 0)}
                  className={`rounded-md border px-3 py-1.5 text-xs ${
                    expiresDays === o.v
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow
            active={hideBudget}
            onToggle={() => setHideBudget((v) => !v)}
            icon={hideBudget ? EyeOff : Eye}
            title="屏蔽预算与报价明细"
            desc="仅保留方案定位、故事板与责任模块;金额、返点不出现。"
          />
          <ToggleRow
            active={passwordOn}
            onToggle={() => setPasswordOn((v) => !v)}
            icon={Lock}
            title="启用访问密码"
            desc="打开链接后需要输入 6 位密码,适合发给不熟悉的收件人。"
          />
        </div>

        {/* Link */}
        <div className="mb-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1 text-[10px] tracking-[0.18em] text-primary">分享链接</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-background/60 px-2 py-1.5 font-mono text-[11px] text-foreground/85">
              {shareUrl}
            </code>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          {passwordOn && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-foreground/80">
              <Lock className="h-3 w-3 text-primary" /> 访问密码:{" "}
              <span className="font-mono tracking-widest text-primary">{password}</span>
              <span className="text-muted-foreground">(与链接一并发送)</span>
            </div>
          )}
        </div>

        {/* Access policy */}
        <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <div className="mb-1 inline-flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="h-3 w-3 text-primary" />
            访问权限说明
          </div>
          <ul className="space-y-1">
            <li>· 只读访问:收件人无法编辑、下载源文件或看到内部备注。</li>
            <li>
              · 内容边界:仅展示方案封面、定位、故事板、责任模块与 AI 观察;
              {hideBudget ? "预算金额被屏蔽。" : "包含预算区间。"}
              合同条款、金额明细与协作方内部分工始终不对外。
            </li>
            <li>
              · 有效期:{expiresDays === 0 ? "永久有效,可随时手动撤回。" : `${expiresDays} 天后自动失效。`}
            </li>
            <li>· 审计:每次访问都会记录时间与来源,主服务方可在项目 · 分享中心查看并撤回。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  active,
  onToggle,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onToggle: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        active
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-secondary/20 hover:bg-secondary/30"
      }`}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-primary/15 text-primary" : "bg-background text-muted-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{desc}</div>
      </div>
      <div
        className={`mt-1 h-4 w-7 rounded-full transition ${
          active ? "bg-primary" : "bg-border"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-background shadow transition ${
            active ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function Card({
  tone,
  title,
  icon: Icon,
  items,
}: {
  tone: "verified" | "pending" | "declared";
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}) {
  const color = {
    verified: "text-[color:var(--state-verified)] border-[color:var(--state-verified)]/30",
    pending: "text-[color:var(--state-pending)] border-[color:var(--state-pending)]/30",
    declared: "text-[color:var(--state-declared)] border-[color:var(--state-declared)]/30",
  }[tone];
  return (
    <div className={`surface-1 rounded-xl p-4 ${color}`}>
      <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      {items.length === 0 ? (
        <div className="text-[11px] text-muted-foreground">—</div>
      ) : (
        <ul className="space-y-1.5 text-xs text-foreground/85">
          {items.map((it, i) => (
            <li key={i}>· {it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionEyebrow({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    </div>
  );
}
