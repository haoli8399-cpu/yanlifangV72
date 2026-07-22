import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  TrendingDown,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/incidents")({
  head: () => ({
    meta: [
      { title: "AI 差错监控中心 · 演立方治理台" },
      { name: "description", content: "跨项目 AI 差错监控:识别路径、影响范围、恢复流程与全局趋势。" },
    ],
  }),
  component: IncidentsCenter,
});

type Severity = "high" | "mid" | "low";
type Stage = "detected" | "recovering" | "resolved";

const incidents: {
  id: string;
  title: string;
  project: string;
  projectId: string;
  severity: Severity;
  stage: Stage;
  detectedBy: "AI 自检" | "人类反馈" | "客户申诉";
  affected: string;
  when: string;
  summary: string;
  next: string;
}[] = [
  {
    id: "inc-071",
    title: "方案 B 预算表口径错误 · 少列 15% 场地税费",
    project: "Neo 银行 · 2027 客户答谢晚宴",
    projectId: "proj_neoyear",
    severity: "high",
    stage: "recovering",
    detectedBy: "AI 自检",
    affected: "客户决策人 · 财务总监 · 主服务方",
    when: "10-06 09:12",
    summary: "AI 生成的预算表在方案 B 中遗漏 15% 场地税费,已在决策摘要中出现错误金额。",
    next: "已生成修正版本,需 3 位相关人员逐项复核。",
  },
  {
    id: "inc-070",
    title: "AI 将 PDF 附录误读为主体条款",
    project: "光刻场景 · 品牌沙龙",
    projectId: "proj_light",
    severity: "mid",
    stage: "resolved",
    detectedBy: "人类反馈",
    affected: "主服务方 · 主服务方商务",
    when: "10-04 15:40",
    summary: "上传方案时 AI 把 PDF 附录 A 中的过期报价识别为主报价,并写入了活动画像摘要。",
    next: "已修正 · 相关人员均已确认新版本。",
  },
  {
    id: "inc-068",
    title: "档期显示时区错乱 · 12h 偏移",
    project: "多项目通用组件",
    projectId: "proj_all",
    severity: "low",
    stage: "resolved",
    detectedBy: "AI 自检",
    affected: "演员端 3 位",
    when: "10-02 22:10",
    summary: "档期展示组件在跨时区场景下出现 12 小时偏移,影响演员端 3 位排期展示。",
    next: "已通过组件热修复解决,追溯校准所有历史数据。",
  },
];

const kpis = [
  { label: "近 30 天 AI 差错", value: "7", hint: "较上月 -3", tone: "verified" as const },
  { label: "被 AI 自检拦截", value: "5", hint: "占比 71%", tone: "ai" as const },
  { label: "扩散到客户", value: "1", hint: "已完成修正确认", tone: "pending" as const },
  { label: "平均恢复时长", value: "3.2h", hint: "从识别到全部确认", tone: "verified" as const },
];

function IncidentsCenter() {
  const [filter, setFilter] = useState<"all" | Stage>("all");
  const shown = incidents.filter((i) => filter === "all" || i.stage === filter);

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-8">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> 返回治理台
      </Link>

      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <ShieldAlert className="h-3.5 w-3.5" /> 平台端 · AI 差错监控
      </div>
      <h1 className="text-2xl font-semibold text-foreground">跨项目 AI 差错中心</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        统一记录 AI 在识别、生成、判断中的所有差错。每一条都可追溯识别路径、影响范围与恢复过程 · 人类始终是最终确认人。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface-1 rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-muted-foreground">{k.label}</div>
            <div
              className={cn(
                "mt-1 font-mono text-2xl font-semibold",
                k.tone === "pending"
                  ? "text-[color:var(--state-pending)]"
                  : k.tone === "ai"
                    ? "text-[color:var(--state-ai)]"
                    : "text-[color:var(--state-verified)]",
              )}
            >
              {k.value}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        <span className="inline-flex items-center gap-1 px-2 text-[11px] text-muted-foreground">
          <Filter className="h-3 w-3" /> 阶段
        </span>
        {(
          [
            { k: "all", label: "全部" },
            { k: "detected", label: "刚识别" },
            { k: "recovering", label: "恢复中" },
            { k: "resolved", label: "已闭环" },
          ] as { k: "all" | Stage; label: string }[]
        ).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={cn(
              "rounded px-3 py-1 text-[11px] font-medium transition-colors",
              filter === f.k
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {shown.map((i) => (
          <article key={i.id} className="rounded-xl border border-border/60 bg-card/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    state={
                      i.stage === "resolved"
                        ? "verified"
                        : i.stage === "recovering"
                          ? "ai"
                          : "pending"
                    }
                    label={
                      i.stage === "resolved"
                        ? "已闭环"
                        : i.stage === "recovering"
                          ? "恢复中"
                          : "刚识别"
                    }
                  />
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      i.severity === "high"
                        ? "border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]"
                        : i.severity === "mid"
                          ? "border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]"
                          : "border border-border/50 bg-background text-muted-foreground",
                    )}
                  >
                    严重度 · {i.severity === "high" ? "高" : i.severity === "mid" ? "中" : "低"}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">#{i.id}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{i.title}</h3>
                <div className="mt-0.5 text-[11px] text-muted-foreground">项目 · {i.project}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-foreground/85">{i.summary}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>识别路径 · {i.detectedBy}</span>
                  <span>影响 · {i.affected}</span>
                  <span>发生 · {i.when}</span>
                </div>
                <EvidenceLine source={`识别路径 · ${i.detectedBy}`} time={i.when} className="mt-2">
                  {i.next}
                </EvidenceLine>
              </div>
              <div className="flex flex-col gap-2">
                {i.projectId !== "proj_all" && (
                  <Link
                    to="/projects/$id/incidents"
                    params={{ id: i.projectId }}
                    className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] text-primary hover:bg-primary/20"
                  >
                    打开项目恢复流程 <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
                {i.stage !== "resolved" ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-3 py-1.5 text-[11px] text-[color:var(--state-pending)]">
                    <AlertTriangle className="h-3 w-3" /> 需要确认
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 px-3 py-1.5 text-[11px] text-[color:var(--state-verified)]">
                    <CheckCircle2 className="h-3 w-3" /> 已全部确认
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <AgentInlineSuggestion
          title="AI 治理观察 · 30 天趋势"
          actions={
            <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--state-verified)]">
              <TrendingDown className="h-3 w-3" /> 差错率下降
            </span>
          }
        >
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-[color:var(--state-ai)]" />
            过去 30 天,AI 自检拦截率上升到 71%,只有 1 项差错扩散到客户端,且已在 3 小时内完成全员确认。建议下个月起把"AI 自检拦截率"纳入平台健康度大盘。
          </div>
        </AgentInlineSuggestion>
      </div>
    </div>
  );
}