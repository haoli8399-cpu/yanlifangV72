import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { SideDrawer } from "@/components/yanlicube/side-drawer";
import {
  ArrowLeft,
  Sparkles,
  Handshake,
  ShieldCheck,
  ExternalLink,
  Search,
  ChevronRight,
} from "lucide-react";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/attribution")({
  head: () => ({
    meta: [{ title: "平台来源归属确认 · 演立方治理台" }],
  }),
  component: AttributionPage,
});

type Attribution = {
  id: string;
  project: string;
  client: string;
  tenant: string;
  amount: string;
  channel: "platform" | "tenant_referral" | "returning" | "disputed";
  channelLabel: string;
  aiConfidence: number;
  aiRationale: string[];
  evidence: { label: string; kind: "search" | "share" | "case" | "direct" | "outside" }[];
  createdAt: string;
  status: "pending" | "confirmed" | "disputed";
  feeRate: string;
  disputeNote?: string;
};

const initialData: Attribution[] = [
  {
    id: "at1",
    project: "Neo 银行 · 2026 春季客户答谢",
    client: "Neo 银行 · 活动采购",
    tenant: "后仰喜剧",
    amount: "¥ 88 万",
    channel: "platform",
    channelLabel: "平台首发线索",
    aiConfidence: 96,
    aiRationale: [
      "客户于 07-14 通过发现频道搜索'脱口秀 · 金融行业'首次接触",
      "在 3 个候选服务方页面停留后主动发起项目",
      "整条转化路径均在平台内闭环",
    ],
    evidence: [
      { label: "发现频道搜索行为 07-14 09:22", kind: "search" },
      { label: "候选服务方对比访问 07-15", kind: "case" },
      { label: "报价签署来源: 演立方合同凭证 v1", kind: "direct" },
    ],
    createdAt: "1 小时前",
    status: "pending",
    feeRate: "5% (平台首发)",
  },
  {
    id: "at2",
    project: "沐山设计 · 年会",
    client: "沐山设计 · 行政",
    tenant: "浪潮舞美",
    amount: "¥ 42 万",
    channel: "returning",
    channelLabel: "客户复购",
    aiConfidence: 91,
    aiRationale: [
      "该客户于 2025-11 已通过平台达成过 1 次合作",
      "本次直接在'我的服务方'快速下单,未触达发现频道",
      "按 PRD §17.7 复购规则,费率下调至 3%",
    ],
    evidence: [
      { label: "2025-11 历史订单 #ORD-1187", kind: "direct" },
      { label: "跳过发现频道,直达 主服务方主页", kind: "direct" },
    ],
    createdAt: "3 小时前",
    status: "pending",
    feeRate: "3% (复购)",
  },
  {
    id: "at3",
    project: "汇丰私行 · VIP 晚宴",
    client: "汇丰私行 · 活动组",
    tenant: "后仰喜剧",
    amount: "¥ 24 万",
    channel: "tenant_referral",
    channelLabel: "主服务方私域带入",
    aiConfidence: 88,
    aiRationale: [
      "客户于 07-16 通过 主服务方携带的 ShareGrant 链接首次登陆",
      "referrer 域名为 tenant 官网",
      "按 PRD §17.7 私域规则,平台仅收基础凭证服务费",
    ],
    evidence: [
      { label: "ShareGrant 链接 sg_a7f2c3", kind: "share" },
      { label: "首次访问 referrer: houyang.cn", kind: "outside" },
    ],
    createdAt: "昨天",
    status: "pending",
    feeRate: "1% (私域凭证)",
  },
  {
    id: "at4",
    project: "字节游戏 · 开发者 Meetup",
    client: "字节游戏 · Devrel",
    tenant: "喜剧联邦",
    amount: "¥ 18 万",
    channel: "disputed",
    channelLabel: "存在争议",
    aiConfidence: 62,
    aiRationale: [
      "客户既通过发现频道浏览,也存在 主服务方私域接触记录",
      "主服务方主张为私域客户,平台数据显示搜索行为在先",
      "AI 置信度低于阈值,已升级人工仲裁",
    ],
    evidence: [
      { label: "发现频道浏览 07-08", kind: "search" },
      { label: "主服务方声称的线下会议 07-05", kind: "outside" },
    ],
    createdAt: "2 天前",
    status: "disputed",
    feeRate: "5% / 1% (待定)",
    disputeNote: "主服务方已上传线下会议照片作为反证,等待仲裁员核实。",
  },
  {
    id: "at5",
    project: "招行私行 · 客户答谢",
    client: "招行私行 · 高净值组",
    tenant: "浪潮舞美",
    amount: "¥ 56 万",
    channel: "platform",
    channelLabel: "平台首发线索",
    aiConfidence: 94,
    aiRationale: [
      "客户全流程在平台完成,包含从探索到签约",
      "主服务方未主张私域来源",
    ],
    evidence: [
      { label: "AI 顾问会话 conv_a91f", kind: "search" },
      { label: "合同签署来源: 演立方 v1", kind: "direct" },
    ],
    createdAt: "3 天前",
    status: "confirmed",
    feeRate: "5% (平台首发)",
  },
];

const channelTone: Record<Attribution["channel"], string> = {
  platform: "text-primary",
  returning: "text-[color:var(--state-verified)]",
  tenant_referral: "text-[color:var(--state-ai)]",
  disputed: "text-[color:var(--state-expired)]",
};

const evidenceIcon = {
  search: Search,
  share: ExternalLink,
  case: Sparkles,
  direct: ShieldCheck,
  outside: ExternalLink,
};

function AttributionPage() {
  const [items, setItems] = useState(initialData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "confirmed" | "disputed">("pending");

  const filtered = useMemo(() => items.filter((i) => i.status === tab), [items, tab]);
  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    confirmed: items.filter((i) => i.status === "confirmed").length,
    disputed: items.filter((i) => i.status === "disputed").length,
  };

  const confirm = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "confirmed" as const } : i)),
    );
  const dispute = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "disputed" as const } : i)),
    );

  return (
    <AgentPanelProvider scopeLabel="平台归因确认" quickPrompts={["为什么这单被识别为平台归因", "总结归因证据链路", "起草一份归因说明给主服务方"]}>
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> 返回治理台
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">来源归属确认</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        平台基于行为链路 + 主服务方主张 + Evidence,AI 自动归类订单来源。你负责签发或转仲裁,不介入具体金额与商业条款。
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Kpi label="待你签发" value={counts.pending} tone="pending" />
        <Kpi label="本月已签发" value={counts.confirmed} tone="verified" />
        <Kpi label="转入仲裁" value={counts.disputed} tone="expired" />
        <Kpi label="AI 置信平均" value="88%" tone="ai" />
      </div>

      <div className="mt-6 flex gap-1 border-b border-border/60 text-xs">
        {(
          [
            ["pending", "待签发", counts.pending],
            ["confirmed", "已签发", counts.confirmed],
            ["disputed", "转仲裁", counts.disputed],
          ] as const
        ).map(([k, label, c]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`relative px-3 py-2 transition-colors ${
              tab === k
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px]">{c}</span>
            {tab === k && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-center text-xs text-muted-foreground">
            此分类下暂无待处理条目
          </div>
        )}
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className="group flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-wider ${channelTone[item.channel]}`}>
                  {item.channelLabel}
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">
                  AI 置信 {item.aiConfidence}%
                </span>
              </div>
              <div className="mt-1 truncate text-sm font-medium text-foreground">
                {item.project}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {item.client} → {item.tenant} · {item.amount} · {item.feeRate}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          </button>
        ))}
      </div>

      {selected && (
        <SideDrawer
          open
          onClose={() => setSelectedId(null)}
          eyebrow={
            <span className={channelTone[selected.channel]}>{selected.channelLabel}</span>
          }
          title={selected.project}
          subtitle={`${selected.client} → ${selected.tenant}`}
          footer={
            selected.status === "pending" ? (
              <>
                <button
                  onClick={() => dispute(selected.id)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  转入人工仲裁
                </button>
                <button
                  onClick={() => confirm(selected.id)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Handshake className="h-3.5 w-3.5" /> 签发 AI 归类结果
                </button>
              </>
            ) : undefined
          }
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <Row label="订单金额" value={selected.amount} />
            <Row label="平台费率" value={selected.feeRate} />
            <Row label="AI 置信度" value={`${selected.aiConfidence}%`} />
            <Row label="生成时间" value={selected.createdAt} />
          </dl>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" /> AI 归类依据
            </div>
            <ul className="space-y-1 text-[11px] text-foreground/85">
              {selected.aiRationale.map((r, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Evidence 链路
            </div>
            <ul className="space-y-1.5">
              {selected.evidence.map((e, i) => {
                const Icon = evidenceIcon[e.kind];
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded border border-border/50 bg-background/40 px-2.5 py-1.5 text-[11px] text-foreground/85"
                  >
                    <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                    {e.label}
                  </li>
                );
              })}
            </ul>
          </div>

          {selected.disputeNote && (
            <div className="rounded border border-[color:var(--state-expired)]/40 bg-[color:var(--state-expired)]/5 p-2.5 text-[11px] text-foreground/85">
              {selected.disputeNote}
            </div>
          )}

          {selected.status !== "pending" && (
            <div>
              <StatusBadge
                state={selected.status === "confirmed" ? "verified" : "expired"}
                label={selected.status === "confirmed" ? "已签发" : "仲裁中"}
              />
            </div>
          )}

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            平台只对来源归属与费率适用做仲裁,不介入订单金额、服务条款等商业决策。
          </p>
        </SideDrawer>
      )}

    </main>
    </AgentPanelProvider>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "pending" | "verified" | "expired" | "ai";
}) {
  const toneMap = {
    pending: "text-[color:var(--state-pending)]",
    verified: "text-[color:var(--state-verified)]",
    expired: "text-[color:var(--state-expired)]",
    ai: "text-[color:var(--state-ai)]",
  };
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneMap[tone]}`}>{value}</div>
    </div>
  );
}