import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield,
  Gavel,
  AlertTriangle,
  Users,
  Activity as ActivityIcon,
  FileWarning,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "平台端 · 治理中心 · 演立方" },
      { name: "description", content: "平台治理:争议仲裁、主服务方审核、账户与内容治理、平台健康度大盘。" },
    ],
  }),
  component: AdminConsole,
});

type Tab = "arbitration" | "vetting" | "governance" | "health";

function AdminConsole() {
  const [tab, setTab] = useState<Tab>("arbitration");
  return (
    <div className="mx-auto max-w-[1300px] px-6 py-8">
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <Shield className="h-3.5 w-3.5" />
        平台端 · 治理中心
      </div>
      <h1 className="text-2xl font-semibold text-foreground">演立方治理台</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        平台不介入具体商业决策 · 只做规则维护、争议仲裁与生态健康度。默认由 AI 起草、人类仲裁员签发。
      </p>

      {/* 首屏聚焦:待处理任务 KPI */}
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Kpi label="待仲裁工单" value="3" sub="其中 1 项 48h 内到期" tone="pending" />
        <Kpi label="主服务方待审核" value="2" sub="含新入驻 1 家" tone="ai" />
        <Kpi label="治理事件(30d)" value="7" sub="较上月 -2" tone="verified" />
        <Kpi label="平台 NPS" value="4.6" sub="活跃主服务方 12 家" tone="verified" />
      </div>

      {/* 跨项目工具 · 收进折叠区,避免与治理任务视觉冲突 */}
      <details className="mt-4 rounded-lg border border-border/60 bg-card/40 group">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            跨项目治理工具 · 归属签发 / AI 差错监控 / 授权矩阵
          </span>
          <span className="text-[11px] group-open:hidden">展开 ▾</span>
          <span className="hidden text-[11px] group-open:inline">收起 ▴</span>
        </summary>
        <div className="grid gap-3 border-t border-border/60 p-3 sm:grid-cols-3">
          <Link to="/admin/attribution" className="group/l flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-3 hover:border-primary/40">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary">
                <Handshake className="h-3 w-3" /> 归属签发
              </div>
              <div className="text-sm font-semibold text-foreground">来源归属确认</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">待签发 3 · 争议 1</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/l:text-foreground" />
          </Link>
          <Link to="/admin/incidents" className="group/l flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-3 hover:border-primary/40">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--state-ai)]">
                <ShieldAlert className="h-3 w-3" /> 跨项目
              </div>
              <div className="text-sm font-semibold text-foreground">AI 差错监控</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">30 天 7 起 · 拦截 71%</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/l:text-foreground" />
          </Link>
          <Link to="/admin/permissions" className="group/l flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-3 hover:border-primary/40">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary">
                <KeyRound className="h-3 w-3" /> 授权透视
              </div>
              <div className="text-sm font-semibold text-foreground">ShareGrant 授权矩阵</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">跨角色分享全景</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/l:text-foreground" />
          </Link>
        </div>
      </details>


      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        {(
          [
            { k: "arbitration", label: "争议仲裁", icon: Gavel },
            { k: "vetting", label: "主服务方审核", icon: Users },
            { k: "governance", label: "账户与内容治理", icon: FileWarning },
            { k: "health", label: "平台健康度", icon: ActivityIcon },
          ] as { k: Tab; label: string; icon: typeof Gavel }[]
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.k
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "arbitration" && <Arbitration />}
        {tab === "vetting" && <Vetting />}
        {tab === "governance" && <Governance />}
        {tab === "health" && <Health />}
      </div>
    </div>
  );
}

function Arbitration() {
  const cases = [
    {
      id: "arb-24",
      title: "客户与主服务方 · 视频交付延后 3 天",
      parties: "Neo 银行 ↔ 后仰喜剧",
      opened: "10-05 14:20",
      due: "10-08 24:00",
      severity: "中",
      state: "pending" as const,
      aiDraft: "AI 已根据变更单#003 与执行时间线起草仲裁意见:主服务方应扣减尾款 8% 作为补偿,已征询双方意见。",
      evidence: "变更单#003 · 履约时间线 · 双方书面回复",
    },
    {
      id: "arb-22",
      title: "演员爽约 · 二次通知未回复",
      parties: "光刻场景 ↔ 演员 K",
      opened: "09-28 10:00",
      due: "10-02 24:00",
      severity: "高",
      state: "pending" as const,
      aiDraft: "AI 判定演员违约 · 建议临时下架档期展示 30 天,并记入信誉分。等待演员申诉窗口。",
      evidence: "邀请回执缺失 · 上一场次 NPS · 主服务方投诉",
    },
  ];
  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <div key={c.id} className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <StatusBadge state="pending" label={`待仲裁 · 严重度 ${c.severity}`} />
                <span className="font-mono text-[10px] text-muted-foreground">#{c.id}</span>
              </div>
              <div className="text-sm font-semibold text-foreground">{c.title}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{c.parties}</div>
              <div className="mt-2 rounded-md border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 p-2.5 text-[12px] text-foreground/85">
                <div className="mb-0.5 inline-flex items-center gap-1 text-[10px] tracking-wide text-[color:var(--state-ai)]">
                  <Sparkles className="h-3 w-3" />
                  AI 起草意见 · 待人类仲裁员签发
                </div>
                {c.aiDraft}
              </div>
              <EvidenceLine source={c.evidence} time={c.opened} className="mt-2">
                依据
              </EvidenceLine>
              <div className="mt-1 text-[11px] text-[color:var(--state-pending)]">⏳ 截止 {c.due}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin/arbitration/$id"
                params={{ id: c.id }}
                className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
              >
                审阅并签发 <ChevronRight className="h-3 w-3" />
              </Link>
              <button onClick={() => demoToast()} className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                要求补充证据
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Vetting() {
  const rows = [
    { id: "t-14", name: "无声剧场文化(北京)", city: "北京", state: "pending" as const, note: "首次入驻 · 已完成资质材料上传", flag: "AI 已核验营业执照与法人身份" },
    { id: "t-11", name: "光刻场景", city: "上海", state: "ai" as const, note: "季度信誉分复审", flag: "AI 观察:近 90 天客户 NPS 下降 0.4" },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <StatusBadge state={r.state} label={r.state === "pending" ? "待审核" : "AI 观察中"} />
              <span className="text-sm font-medium text-foreground">{r.name}</span>
              <span className="text-[11px] text-muted-foreground">· {r.city}</span>
            </div>
            <div className="text-[12px] text-foreground/80">{r.note}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">🔎 {r.flag}</div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/tenants/$id"
              params={{ id: r.id }}
              className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
            >
              查看尽调 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function Governance() {
  const events = [
    { title: "内容举报 · 涉及地域刻板印象", state: "pending" as const, note: "AI 已隐藏该段落,等待仲裁员复核。", when: "今日 11:20" },
    { title: "演员账户异常登录 · 两地同时", state: "expired" as const, note: "已冻结账户 · 待本人二次身份认证。", when: "10-06 03:12" },
    { title: "主服务方违规使用平台外结算", state: "verified" as const, note: "已扣减信誉分 8 · 记入违规档案。", when: "09-28" },
  ];
  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div key={e.title} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--state-pending)]" />
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <StatusBadge state={e.state} label={e.state === "pending" ? "处理中" : e.state === "expired" ? "已冻结" : "已裁决"} />
              <span className="text-[11px] text-muted-foreground">{e.when}</span>
            </div>
            <div className="text-sm text-foreground">{e.title}</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">{e.note}</div>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
            详情 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      ))}
    </div>
  );
}

function Health() {
  const rows: { label: string; value: string; hint: string }[] = [
    { label: "活跃主服务方", value: "12", hint: "过去 30 天有效履约" },
    { label: "活跃演员", value: "58", hint: "至少 1 场已确认档期" },
    { label: "客户复购率", value: "44%", hint: "较上季度 +6%" },
    { label: "履约异常率", value: "3.1%", hint: "低于阈值 5%" },
    { label: "AI 生成占比", value: "62%", hint: "内容/沟通/摘要合计" },
    { label: "AI 差错率", value: "0.4%", hint: "已被人类拦截" },
  ];
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="text-[11px] tracking-wide text-muted-foreground">{r.label}</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{r.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{r.hint}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <AgentInlineSuggestion title="AI 已识别 1 项生态观察点">
          光刻场景近 90 天客户 NPS 下降 0.4,主要集中在"响应速度"维度。建议纳入下季度信誉分复审并邀请其自查。
        </AgentInlineSuggestion>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "pending" | "verified" | "ai";
}) {
  const color =
    tone === "pending"
      ? "text-[color:var(--state-pending)]"
      : tone === "verified"
        ? "text-[color:var(--state-verified)]"
        : "text-[color:var(--state-ai)]";
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-2xl font-semibold", color)}>{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
