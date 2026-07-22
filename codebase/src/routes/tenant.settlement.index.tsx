import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, TrendingUp, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/tenant/settlement/")({
  head: () => ({
    meta: [
      { title: "结算与信誉分 · 服务方工作台 · 演立方" },
      { name: "description", content: "服务方收付款结算、平台佣金明细、信誉分与信任等级的一站式视图。" },
    ],
  }),
  component: SettlementCenter,
});

type Row = {
  id: string;
  project: string;
  client: string;
  contract: number;
  received: number;
  payout: number; // 平台佣金
  actorFee: number;
  net: number;
  state: "settled" | "in-progress" | "on-hold";
  next: string;
};

const rows: Row[] = [
  {
    id: "s-092",
    project: "Neo 银行 2027 战略客户答谢晚宴",
    client: "Neo 银行",
    contract: 386000,
    received: 231600,
    payout: 23160,
    actorFee: 68000,
    net: 140440,
    state: "in-progress",
    next: "10-25 阶段款 ¥115,800",
  },
  {
    id: "s-088",
    project: "AlphaBio 2026 发布会",
    client: "AlphaBio",
    contract: 268000,
    received: 268000,
    payout: 16080,
    actorFee: 42000,
    net: 209920,
    state: "settled",
    next: "已结清 · 09-30",
  },
  {
    id: "s-081",
    project: "私行答谢晚宴 · 3 月场",
    client: "某私行(NDA)",
    contract: 194000,
    received: 58200,
    payout: 5820,
    actorFee: 28000,
    net: 58380,
    state: "on-hold",
    next: "客户方内部审计中,暂缓开票",
  },
];

const totals = rows.reduce(
  (acc, r) => ({
    contract: acc.contract + r.contract,
    received: acc.received + r.received,
    payout: acc.payout + r.payout,
    net: acc.net + r.net,
  }),
  { contract: 0, received: 0, payout: 0, net: 0 },
);

function fmt(n: number) {
  return `¥${n.toLocaleString()}`;
}

function SettlementCenter() {
  return (
    <div className="mx-auto max-w-[1300px] px-6 py-8">
      <Link
        to="/tenant"
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        ← 服务方工作台
      </Link>
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <Wallet className="h-3.5 w-3.5" />
        结算与信誉分中心
      </div>
      <h1 className="text-2xl font-semibold text-foreground">你的经营账本</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        平台按合同实际到账金额收取 6% 佣金 · 演员劳务由主服务方直接支付 · 结算透明可溯源。
      </p>

      {/* Totals */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Kpi label="合同总额" value={fmt(totals.contract)} sub="共 3 个项目" tone="ai" />
        <Kpi label="已到账" value={fmt(totals.received)} sub={`回款率 ${((totals.received / totals.contract) * 100).toFixed(0)}%`} tone="verified" />
        <Kpi label="平台佣金" value={fmt(totals.payout)} sub="按到账金额 6%" tone="pending" />
        <Kpi label="毛利(税前)" value={fmt(totals.net)} sub="扣除演员劳务与佣金" tone="verified" />
      </div>

      {/* Credit score */}
      <div className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-primary">信誉分</span>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-mono text-4xl font-semibold text-foreground">92</div>
            <div className="text-xs text-muted-foreground">/ 100 · 信任等级 A</div>
          </div>
          <div className="mt-3 grid gap-2 text-[12px] sm:grid-cols-4">
            <ScoreRow label="履约" v={38} m={40} />
            <ScoreRow label="客户 NPS" v={24} m={25} />
            <ScoreRow label="合规" v={20} m={20} />
            <ScoreRow label="响应速度" v={10} m={15} />
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            +2 家客户复购 · -1 项响应超时 · 上次评估 09-30
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/60 p-5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[color:var(--state-pending)]" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-[color:var(--state-pending)]">
              等级带来什么
            </span>
          </div>
          <ul className="mt-1 space-y-1.5 text-[12px] text-foreground/85">
            <li>· 匹配推荐权重 +30%</li>
            <li>· 平台首页曝光位优先</li>
            <li>· 高价值机会优先派单</li>
            <li>· 佣金费率 6%(A 级最低档)</li>
          </ul>
          <div className="mt-3 text-[11px] text-muted-foreground">
            距离 S 级差 6 分 · 建议补齐"响应速度"维度
          </div>
        </div>
      </div>

      {/* Settlement table */}
      <div className="mt-6 rounded-xl border border-border/60 bg-card/40">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 text-xs">
          <div className="font-medium text-foreground">结算明细</div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Link to="/tenant/settlement/$month" params={{ month: "2027-01" }} className="text-primary hover:underline">
              查看 2027-01 月度全景 →
            </Link>
            <span>按项目 · 到账口径</span>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {rows.map((r) => (
            <div key={r.id} className="grid gap-2 p-4 lg:grid-cols-[1.7fr_1fr_1fr_1fr_auto]">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    state={r.state === "settled" ? "verified" : r.state === "on-hold" ? "expired" : "pending"}
                    label={r.state === "settled" ? "已结清" : r.state === "on-hold" ? "暂缓" : "进行中"}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">#{r.id}</span>
                </div>
                <div className="text-sm font-medium text-foreground">{r.project}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{r.client}</div>
              </div>
              <Cell label="合同" value={fmt(r.contract)} />
              <Cell label="已到账" value={fmt(r.received)} tone="verified" />
              <Cell label="毛利" value={fmt(r.net)} tone="ai" />
              <div className="flex flex-col items-end gap-1 text-right">
                <div className="text-[10px] tracking-wide text-muted-foreground">下一步</div>
                <div className="text-[12px] text-foreground/85">{r.next}</div>
                <Link
                  to="/tenant/settlement/$month"
                  params={{ month: "2027-01" }}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  查看流水 <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <EvidenceLine source="演立方结算规则 v2.4 · 2026-06-01 生效" className="justify-end">
          费率与信誉分算法依据
        </EvidenceLine>
      </div>

      <div className="mt-6">
        <AgentInlineSuggestion
          title="AI 已发现 1 项可优化"
          actions={
            <button onClick={() => demoToast()} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
              让 AI 起草催收邮件
            </button>
          }
        >
          Neo 银行阶段款 ¥115,800 应于 10-25 到账,历史平均延迟 3-5 天。建议本周三提前发送温和提醒。
          <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <Sparkles className="h-3 w-3" /> 依据:该客户过去 4 期到账平均延迟 3.8 天
          </div>
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

function Cell({ label, value, tone }: { label: string; value: string; tone?: "verified" | "ai" }) {
  const color = tone === "verified"
    ? "text-[color:var(--state-verified)]"
    : tone === "ai"
      ? "text-[color:var(--state-ai)]"
      : "text-foreground";
  return (
    <div className="flex flex-col">
      <div className="text-[10px] tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-sm font-semibold", color)}>{value}</div>
    </div>
  );
}

function ScoreRow({ label, v, m }: { label: string; v: number; m: number }) {
  const pct = (v / m) * 100;
  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{v}/{m}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border/60">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 90 ? "bg-[color:var(--state-verified)]" : pct >= 70 ? "bg-primary" : "bg-[color:var(--state-pending)]",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
