import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  FileCheck2,
  UserCheck,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  Star,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";

type Tenant = {
  id: string;
  name: string;
  applicant: string;
  city: string;
  years: number;
  headline: string;
  submitted: string;
  aiRisk: "low" | "mid" | "high";
  aiSummary: string;
  identity: { label: string; verified: boolean; note: string }[];
  portfolio: { name: string; scale: string; client: string; year: number; verified: boolean }[];
  references: { who: string; relation: string; contact: string; note: string; status: "verified" | "pending" }[];
  flags: { level: "info" | "warn" | "block"; text: string }[];
};

const tenants: Record<string, Tenant> = {
  "t-091": {
    id: "t-091",
    name: "浮光文化 · Fuguang",
    applicant: "陈伊 · 合伙人",
    city: "上海",
    years: 4,
    headline: "沉浸式品牌年会 · 高端客户答谢",
    submitted: "2 天前",
    aiRisk: "low",
    aiSummary:
      "身份文件全部核验,过往 3 场案例中 2 场可与客户方公开报道交叉验证。团队规模 8 人,与已有主服务方生态无冲突。建议:通过并授予初级信誉分 B。",
    identity: [
      { label: "营业执照 · 统一社会信用代码", verified: true, note: "国家企业信用信息公示系统一致" },
      { label: "法定代表人身份", verified: true, note: "活体核验通过" },
      { label: "银行对公账户", verified: true, note: "小额打款验证通过" },
      { label: "税务信息", verified: true, note: "近 2 年无重大异常" },
    ],
    portfolio: [
      { name: "某新能源车企 2026 品牌之夜", scale: "600 人", client: "已授权公开", year: 2026, verified: true },
      { name: "某消费品牌 5 周年答谢晚宴", scale: "320 人", client: "已授权公开", year: 2025, verified: true },
      { name: "某互联网公司年会", scale: "1200 人", client: "客户匿名", year: 2025, verified: false },
    ],
    references: [
      { who: "某新能源车企 · 市场部张女士", relation: "甲方联系人", contact: "***@***.com", note: "评价:执行到位、变更响应快", status: "verified" },
      { who: "灯光供应商 · 亮见", relation: "长期协作方", contact: "已核验", note: "协作 3 次,无欠款记录", status: "verified" },
      { who: "某消费品牌", relation: "甲方联系人", contact: "待回访", note: "等待反馈中", status: "pending" },
    ],
    flags: [
      { level: "info", text: "AI 未识别到黑名单、失信执行或行业负面舆情" },
      { level: "warn", text: "案例 3 客户为匿名,权重降低,不影响整体判断" },
    ],
  },
};

export const Route = createFileRoute("/admin/tenants/$id")({
  loader: ({ params }): { tenant: Tenant } => {
    const tenant = tenants[params.id] ?? tenants["t-091"];
    if (!tenant) throw notFound();
    return { tenant };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.tenant.name ?? "主服务方"} · 主服务方审核 · 演立方` },
      { name: "description", content: "主服务方入驻审核详情:身份、案例、推荐人、AI 风险总结与人工签发。" },
    ],
  }),
  component: TenantVettingDetail,
});

function TenantVettingDetail() {
  const { tenant } = Route.useLoaderData();
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">("pending");
  const [note, setNote] = useState("");

  const riskColor =
    tenant.aiRisk === "low"
      ? "text-[color:var(--state-verified)]"
      : tenant.aiRisk === "mid"
        ? "text-[color:var(--state-pending)]"
        : "text-[color:var(--state-risk)]";

  return (
    <AgentPanelProvider scopeLabel="主服务方审核详情" quickPrompts={["综合评估这家主服务方 的风险", "对比同类主服务方 的资质水平", "起草一段拒绝或通过的说明"]}>
    <div className="mx-auto max-w-[1300px] px-6 py-8">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" /> 返回治理中心
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Building2 className="h-3 w-3" /> 主服务方入驻审核 · 编号 {tenant.id.toUpperCase()}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{tenant.name}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {tenant.applicant} · {tenant.city} · 从业 {tenant.years} 年 · 定位「{tenant.headline}」
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3 w-3" /> 提交于 {tenant.submitted}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            state={
              decision === "approved" ? "verified" : decision === "rejected" ? "expired" : "pending"
            }
            label={
              decision === "approved" ? "已通过" : decision === "rejected" ? "已驳回" : "待审核"
            }
          />
          <span className={`inline-flex items-center gap-1 text-xs ${riskColor}`}>
            <ShieldAlert className="h-3.5 w-3.5" /> AI 风险等级 · {tenant.aiRisk.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border/60 bg-card/60 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-[color:var(--state-ai)]" /> AI 尽调总结
            </h2>
            <p className="text-sm leading-relaxed text-foreground/85">{tenant.aiSummary}</p>
            <div className="mt-4 space-y-2">
              {tenant.flags.map((f: Tenant["flags"][number], i: number) => (
                <EvidenceLine
                  key={i}
                  source={f.level === "block" ? "阻塞" : f.level === "warn" ? "提醒" : "信息"}
                >
                  {f.text}
                </EvidenceLine>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border/60 bg-card/60 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileCheck2 className="h-4 w-4" /> 身份与合规
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {tenant.identity.map((i: Tenant["identity"][number]) => (
                <li
                  key={i.label}
                  className="rounded border border-border/50 bg-background/40 p-3 text-xs"
                >
                  <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                    {i.verified ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--state-verified)]" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-[color:var(--state-pending)]" />
                    )}
                    {i.label}
                  </div>
                  <div className="text-muted-foreground">{i.note}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-border/60 bg-card/60 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4" /> 案例作品
            </h2>
            <div className="space-y-2">
              {tenant.portfolio.map((p: Tenant["portfolio"][number]) => (
                <div
                  key={p.name}
                  className="flex items-start justify-between gap-3 rounded border border-border/50 bg-background/40 p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {p.year} · {p.scale} · 甲方 {p.client}
                    </div>
                  </div>
                  <StatusBadge
                    state={p.verified ? "verified" : "declared"}
                    label={p.verified ? "可交叉核验" : "客户匿名"}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border/60 bg-card/60 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserCheck className="h-4 w-4" /> 推荐人 · 回访记录
            </h2>
            <ul className="space-y-2">
              {tenant.references.map((r: Tenant["references"][number], i: number) => (
                <li
                  key={i}
                  className="rounded border border-border/50 bg-background/40 p-3 text-xs"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-foreground">{r.who}</span>
                    <StatusBadge
                      state={r.status === "verified" ? "verified" : "pending"}
                      label={r.status === "verified" ? "已回访" : "等待回访"}
                    />
                  </div>
                  <div className="text-muted-foreground">
                    {r.relation} · {r.contact}
                  </div>
                  <div className="mt-1 text-foreground/80">{r.note}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card/60 p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-[color:var(--state-verified)]" /> 人工签发
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              AI 已完成尽调,由平台运营在此签发。通过后授予初级信誉分,可承接主服务方任务。
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="签发备注(可选):将写入审计日志,不对该主服务方 展示"
              className="mb-3 h-20 w-full resize-none rounded border border-border/60 bg-background/60 p-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setDecision("approved")}
                className="flex-1 rounded bg-[color:var(--state-verified)]/15 px-3 py-2 text-xs font-medium text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/25"
              >
                通过
              </button>
              <button
                onClick={() => setDecision("rejected")}
                className="flex-1 rounded border border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/10 px-3 py-2 text-xs font-medium text-[color:var(--state-risk)] hover:bg-[color:var(--state-risk)]/20"
              >
                驳回
              </button>
            </div>
            {decision !== "pending" && (
              <div className="mt-3 rounded border border-border/40 bg-background/50 p-2 text-[11px] text-muted-foreground">
                已{decision === "approved" ? "通过" : "驳回"} · 该操作将同步写入平台审计与 主服务方通知。
              </div>
            )}
          </div>

          <AgentInlineSuggestion
            title="AI 建议:通过并授予信誉分 B"
            actions={
              <button onClick={() => demoToast()} className="rounded bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                采纳建议
              </button>
            }
          >
            身份 4/4 已核验,案例 2/3 可交叉验证,推荐人 2/3 已回访且评价正向。无失信/舆情异常。建议:通过、初级信誉分 B、首单需平台过程复核。
          </AgentInlineSuggestion>
        </aside>
      </div>
    </div>
    </AgentPanelProvider>
  );
}