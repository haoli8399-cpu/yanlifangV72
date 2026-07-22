import { createFileRoute, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { useState } from "react";
import {
  Sparkles,
  BookOpenCheck,
  Users,
  Package,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { getProject, type Project } from "@/lib/fixtures";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/projects/$id/retrospective")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: RetrospectivePage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Harvest = {
  id: string;
  target: "sku" | "program" | "actor" | "partner" | "risk";
  targetLabel: string;
  title: string;
  detail: string;
  evidence: { source: string; time?: string; note: string };
  suggestion: string;
};

const HARVESTS: Harvest[] = [
  {
    id: "h1",
    target: "sku",
    targetLabel: "服务产品《周年庆·三幕式》v2.3",
    title: "开场时长应从 12 分钟调整为 9 分钟",
    detail: "现场到场曲线显示 76% 观众在第 8 分钟入座完成,现有 12 分钟开场造成前排等待、后排未到并存。",
    evidence: {
      source: "观众到场感知 · 12/14 19:08-19:20",
      time: "10 分钟前",
      note: "arrival curve + 现场沟通记录",
    },
    suggestion: "更新 SKU 结构模板的第 1 幕时长字段,并写入版本更新日志。",
  },
  {
    id: "h2",
    target: "program",
    targetLabel: "节目《光影记忆》",
    title: "此节目在 300 人以上宴会厅存在最后一排看不清的风险",
    detail: "客户签收卡片提到「后排看不清远景演员表情」,与上一场 500 人现场的观察一致。",
    evidence: {
      source: "客户签收 · Lily / 交付包回执",
      time: "1 天前",
      note: "客户原话 + 交付节点",
    },
    suggestion: "在节目库该条目的「适配场景」加上 ≤250 人 边界,大规模需搭配双屏方案。",
  },
  {
    id: "h3",
    target: "actor",
    targetLabel: "演员 · 阿旬(主持)",
    title: "在金融/严肃场表现稳定,建议加入「合规致辞衔接」标签",
    detail: "客户 NPS 与协作方一致反馈:控场稳、无越界玩笑,适合上市公司/年会正式段。",
    evidence: {
      source: "复盘沉淀 · NPS 9.4 / 协作评价",
      note: "3 次同类场景 100% 好评",
    },
    suggestion: "在演员资料自动打上「合规致辞衔接」软标签(演员可拒绝)。",
  },
  {
    id: "h4",
    target: "risk",
    targetLabel: "全局风险图谱",
    title: "冬季华东场地音响接口不匹配已第 3 次出现",
    detail: "本次执行看板记录 19:32 出现 XLR-TRS 转接缺失,过去 90 天同类事件累计 3 次。",
    evidence: {
      source: "执行看板 · 事故 #INC-231",
      time: "6 小时前",
      note: "共 3 次同类事故",
    },
    suggestion: "在交付包默认清单中,把「XLR↔TRS 转接头 x2」列为华东冬季默认物料。",
  },
  {
    id: "h5",
    target: "partner",
    targetLabel: "协作方 · 星耀灯光",
    title: "履约稳定但沟通响应偏慢(平均 4.2 小时)",
    detail: "对比同类协作方(1.6 小时),响应偏慢已影响本次布场节奏,但最终交付无问题。",
    evidence: {
      source: "消息中心 · 分类=决策/变更 响应时长",
      note: "本项目 12 条决策消息",
    },
    suggestion: "记入协作方档案的「沟通响应」维度,不改评级、仅作调度参考。",
  },
];

const TARGET_META: Record<
  Harvest["target"],
  { label: string; icon: typeof Package; tone: string }
> = {
  sku: { label: "服务产品", icon: Package, tone: "text-primary" },
  program: { label: "节目库", icon: BookOpenCheck, tone: "text-[color:var(--state-verified)]" },
  actor: { label: "演员资料", icon: Users, tone: "text-[color:var(--state-ai)]" },
  partner: { label: "协作方档案", icon: Users, tone: "text-foreground/80" },
  risk: { label: "风险图谱", icon: ShieldAlert, tone: "text-[color:var(--state-warning,#c98a2b)]" },
};

function RetrospectivePage() {
  const { project } = Route.useLoaderData() as { project: Project };
  return (
    <>
      <Body />
    </>
  );
}

function Body() {
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "dismissed" | undefined>>(
    {},
  );
  const [filter, setFilter] = useState<Harvest["target"] | "pending" | "all">("pending");
  const accepted = Object.values(decisions).filter((v) => v === "accepted").length;
  const dismissed = Object.values(decisions).filter((v) => v === "dismissed").length;
  const pending = HARVESTS.length - accepted - dismissed;

  const visible = HARVESTS.filter((h) => {
    if (filter === "all") return true;
    if (filter === "pending") return !decisions[h.id];
    return h.target === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-[color:var(--state-ai)]" />
            复盘知识沉淀 · 一次一条地采纳,避免一次面对太多决策
          </div>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            AI 已提取 {HARVESTS.length} 条 · 待你 {pending} 条
          </h2>
        </div>
        <div className="flex gap-2 text-xs">
          <Chip label={`待确认 ${pending}`} />
          <Chip label={`已采纳 ${accepted}`} tone="verified" />
          <Chip label={`已忽略 ${dismissed}`} tone="muted" />
        </div>
      </div>

      {/* 分类筛选 · 首屏默认只看待确认 */}
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {([
          ["pending", `待确认 (${pending})`],
          ["all", `全部 (${HARVESTS.length})`],
          ["sku", "服务产品"],
          ["program", "节目库"],
          ["actor", "演员"],
          ["partner", "协作方"],
          ["risk", "风险"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-2.5 py-1 transition ${
              filter === k
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            此分类下已全部处理 · 切换到「全部」查看历史决策
          </div>
        )}
        {visible.map((h) => {

          const meta = TARGET_META[h.target];
          const Icon = meta.icon;
          const state = decisions[h.id];
          return (
            <div
              key={h.id}
              className={`surface-1 rounded-xl border p-5 transition ${
                state === "accepted"
                  ? "border-[color:var(--state-verified)]/50"
                  : state === "dismissed"
                    ? "border-border/40 opacity-60"
                    : "border-border/60"
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-foreground">
                <Icon className={`h-3.5 w-3.5 ${meta.tone}`} />
                <span>{meta.label}</span>
                <ArrowRight className="h-3 w-3 text-foreground/40" />
                <span className="text-foreground/80">{h.targetLabel}</span>
              </div>
              <div className="text-base font-medium text-foreground">{h.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{h.detail}</p>

              <div className="mt-3 rounded-md bg-[color:var(--state-ai)]/[0.05] p-3 text-sm text-foreground/85">
                <div className="mb-1 text-[11px] font-medium tracking-wide text-[color:var(--state-ai)]">
                  AI 建议动作
                </div>
                {h.suggestion}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <EvidenceLine source={h.evidence.source} time={h.evidence.time}>
                  {h.evidence.note}
                </EvidenceLine>
                {state ? (
                  <span className="text-xs text-muted-foreground">
                    {state === "accepted" ? "✓ 已采纳,将写入对应资产" : "已忽略"}
                    <button
                      className="ml-2 underline hover:text-foreground"
                      onClick={() =>
                        setDecisions((d) => ({ ...d, [h.id]: undefined }))
                      }
                    >
                      撤销
                    </button>
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setDecisions((d) => ({ ...d, [h.id]: "dismissed" }))
                      }
                    >
                      <X className="h-3 w-3" /> 忽略
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-md bg-[color:var(--state-verified)]/15 px-3 py-1.5 text-xs font-medium text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/25"
                      onClick={() =>
                        setDecisions((d) => ({ ...d, [h.id]: "accepted" }))
                      }
                    >
                      <Check className="h-3 w-3" /> 采纳
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface-2 rounded-xl p-5">
        <div className="mb-2 text-xs tracking-[0.14em] text-muted-foreground">流向去处</div>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <FlowCard
            to="/tenant/service-products"
            title="服务产品库"
            desc="结构模板/时长/风险边界的沉淀"
          />
          <FlowCard to="/tenant/programs" title="节目库" desc="适配规模、观演距离等" />
          <FlowCard to="/actor" title="演员资料" desc="软标签,演员可拒绝" />
        </div>
      </div>

      <div className="text-right">
        <Link
          to="/projects/$id/outcome"
          params={{ id: (Route.useLoaderData() as { project: Project }).project.id }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← 返回成果沉淀
        </Link>
      </div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone?: "verified" | "muted" }) {
  const cls =
    tone === "verified"
      ? "bg-[color:var(--state-verified)]/15 text-[color:var(--state-verified)]"
      : tone === "muted"
        ? "bg-muted text-muted-foreground"
        : "bg-[color:var(--state-ai)]/15 text-[color:var(--state-ai)]";
  return <span className={`rounded-full px-2.5 py-1 ${cls}`}>{label}</span>;
}

function FlowCard({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-border/60 p-3 transition hover:border-primary/40 hover:bg-primary/[0.03]"
    >
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </Link>
  );
}
