import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import {
  Wallet,
  CalendarClock,
  Repeat,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/projects/$id/payments/scheme")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "付款方式选择 · 演立方" }] }),
  component: SchemePage,
  ...stageBoundaries({ backTo: "/projects/$id/payments", backLabel: "返回上一环节", homeTo: "/projects/$id" }),
});

type SchemeKey = "deposit" | "installment" | "monthly";

type Scheme = {
  key: SchemeKey;
  icon: typeof Wallet;
  name: string;
  tagline: string;
  fit: string;
  nodes: { label: string; ratio: string; timing: string }[];
  advantages: string[];
  tradeoffs: string[];
  aiRisk: { level: "low" | "mid" | "high"; note: string };
  requires: string[];
};

const TOTAL = "¥ 88.0 万";

const schemes: Scheme[] = [
  {
    key: "deposit",
    icon: Wallet,
    name: "定金 · 阶段 · 尾款",
    tagline: "首次合作 · 单场活动 · 最常见",
    fit: "适合首次合作、单次项目、金额 <200 万",
    nodes: [
      { label: "定金", ratio: "30%", timing: "合同签署后 5 个工作日" },
      { label: "阶段款", ratio: "40%", timing: "演出前 3 天" },
      { label: "尾款", ratio: "30%", timing: "演后 15 天内" },
    ],
    advantages: [
      "现金流对称,双方风险最小",
      "与演员/协作方付款节点天然对齐",
      "合同模板成熟,变更单可继承此结构",
    ],
    tradeoffs: [
      "客户财务侧需三次走对公流程",
      "尾款依赖演后结算,主服务方现金流延迟 15 天",
    ],
    aiRisk: { level: "low", note: "已依据同规模项目 32 单历史数据推荐" },
    requires: ["主服务方已签合同", "客户对公账户可用"],
  },
  {
    key: "installment",
    icon: CalendarClock,
    name: "分期 · 里程碑触发",
    tagline: "复杂项目 · 多阶段交付",
    fit: "适合含内容评审、彩排、正式演出多个交付里程碑的项目",
    nodes: [
      { label: "定金", ratio: "20%", timing: "合同签署后 5 个工作日" },
      { label: "内容评审通过", ratio: "20%", timing: "第 2 轮评审签字后" },
      { label: "彩排完成", ratio: "30%", timing: "带装彩排验收单签字" },
      { label: "正式演出", ratio: "20%", timing: "演出结束当日" },
      { label: "尾款", ratio: "10%", timing: "演后 15 天内" },
    ],
    advantages: [
      "每笔付款绑定可核验的里程碑证据",
      "客户对交付质量有更强抓手",
    ],
    tradeoffs: [
      "财务节点多,需 5 次走审批与开票",
      "任一里程碑争议会阻塞下一笔付款",
      "主服务方需与协作方对齐里程碑,否则内部现金流不匹配",
    ],
    aiRisk: { level: "mid", note: "本项目当前无带装彩排安排,里程碑 3 缺证据来源" },
    requires: ["每个里程碑有明确验收人", "合同附件需列出验收单模板"],
  },
  {
    key: "monthly",
    icon: Repeat,
    name: "月结 · 框架订单",
    tagline: "老客户 · 多场次年度合作",
    fit: "适合已签署年度框架协议、每月 1-3 场活动的长期合作",
    nodes: [
      { label: "月度对账", ratio: "100%", timing: "次月 5 日前主服务方出账" },
      { label: "客户复核", ratio: "—", timing: "次月 10 日前完成" },
      { label: "月结付款", ratio: "100%", timing: "次月 25 日前到账" },
    ],
    advantages: [
      "现金流最简,单次项目无独立财务动作",
      "适合媒体/金融行业年度框架合作",
    ],
    tradeoffs: [
      "主服务方需承担整月现金流垫付",
      "任一月度争议会累积到下一个月",
      "需已签署年度框架协议,否则不可用",
    ],
    aiRisk: { level: "high", note: "客户 Neo 银行尚未签署年度框架,当前项目不满足月结前置条件" },
    requires: ["已签署年度框架协议", "客户信用等级 A/A+"],
  },
];

const riskMeta = {
  low: { label: "低风险 · AI 推荐", state: "verified" as const },
  mid: { label: "中风险 · 需补齐前置", state: "pending" as const },
  high: { label: "高风险 · 前置未满足", state: "expired" as const },
};

function SchemePage() {
  const { project } = Route.useLoaderData();
  const [selected, setSelected] = useState<SchemeKey>("deposit");
  const [confirmed, setConfirmed] = useState<SchemeKey | null>("deposit");

  const scheme = useMemo(() => schemes.find((s) => s.key === selected)!, [selected]);

  return (
    <>
      <div className="space-y-6">
        <Link
          to="/projects/$id/payments"
          params={{ id: project.id }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 返回收付款
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">付款方式选择</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              合同总额 {TOTAL}。付款方式一旦客户与主服务方双方确认,将写入合同附件并同步至收付款页。变更需通过变更单流程。
            </p>
          </div>
          {confirmed && (
            <div className="rounded border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 px-4 py-3 text-xs text-[color:var(--state-verified)]">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> 当前生效方案
              </div>
              <div className="mt-1 text-foreground/85">
                {schemes.find((s) => s.key === confirmed)?.name}
              </div>
            </div>
          )}
        </header>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/85">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI 顾问建议
          </div>
          <p>
            基于 Neo 银行为首次合作、项目金额 88 万、单场次结构,AI 推荐「定金 · 阶段 · 尾款」方案。分期方案在本项目缺少「带装彩排」里程碑证据;月结方案要求年度框架协议,当前不满足前置条件。
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {schemes.map((s) => {
            const Icon = s.icon;
            const active = selected === s.key;
            const isConfirmed = confirmed === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSelected(s.key)}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]"
                    : "border-border/60 bg-card/60 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  {isConfirmed && (
                    <span className="ml-auto rounded bg-[color:var(--state-verified)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--state-verified)]">
                      已确认
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.tagline}</div>
                <div className="mt-3">
                  <StatusBadge state={riskMeta[s.aiRisk.level].state} label={riskMeta[s.aiRisk.level].label} />
                </div>
              </button>
            );
          })}
        </div>

        <article className="rounded-lg border border-border/60 bg-card/60">
          <div className="border-b border-border/50 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{scheme.name} · 详细结构</h3>
              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                {scheme.fit}
              </span>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 md:grid-cols-[1.5fr_1fr]">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                付款节点
              </div>
              <ol className="space-y-2">
                {scheme.nodes.map((n, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded border border-border/50 bg-background/40 px-3 py-2.5"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 text-[10px] font-mono text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-foreground">
                        {n.label} <span className="font-mono text-primary">{n.ratio}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{n.timing}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--state-verified)]">
                  <ShieldCheck className="h-3 w-3" /> 优势
                </div>
                <ul className="space-y-1 text-xs text-foreground/85">
                  {scheme.advantages.map((a) => (
                    <li key={a} className="flex gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-verified)]" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--state-expired)]">
                  <AlertTriangle className="h-3 w-3" /> 牺牲与代价
                </div>
                <ul className="space-y-1 text-xs text-foreground/85">
                  {scheme.tradeoffs.map((t) => (
                    <li key={t} className="flex gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-expired)]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 px-5 py-4">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              前置条件
            </div>
            <div className="flex flex-wrap gap-2">
              {scheme.requires.map((r) => (
                <span
                  key={r}
                  className="rounded border border-border/60 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {r}
                </span>
              ))}
            </div>
            <div className="mt-3 rounded border border-border/50 bg-background/40 px-3 py-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">AI 风险说明:</span> {scheme.aiRisk.note}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-5 py-4">
            <div className="text-xs text-muted-foreground">
              选择后将进入双方确认流程,主服务方与客户各需签字一次。
            </div>
            <div className="flex gap-2 text-xs">
              <button
                disabled={scheme.aiRisk.level === "high"}
                onClick={() => setConfirmed(scheme.key)}
                className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 className="h-3 w-3" />
                {scheme.aiRisk.level === "high"
                  ? "前置条件未满足"
                  : confirmed === scheme.key
                  ? "已生效 · 重新确认"
                  : "确认采用此方案"}
              </button>
              <Link
                to="/projects/$id/payments"
                params={{ id: project.id }}
                className="rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground"
              >
                查看付款节点执行
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}