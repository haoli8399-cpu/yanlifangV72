import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  FileSignature,
  AlertCircle,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { TenantBottomTabs } from "@/components/yanlicube/tenant-h5-nav";

type OrderDetail = {
  id: string;
  title: string;
  client: string;
  contact: { name: string; role: string };
  date: string;
  city: string;
  scale: string;
  amount: string;
  contractState: "signed" | "pending" | "framework";
  brief: string;
  responsibilities: { who: string; role: "main" | "partner" | "actor"; scope: string; state: "verified" | "declared" | "pending" }[];
  payments: { title: string; amount: string; due: string; state: "paid" | "due" | "pending"; evidence?: string }[];
  timeline: { at: string; title: string; by: "you" | "ai" | "client" | "system"; note: string }[];
  aiReady: { title: string; body: string }[];
  risks: { text: string; source: string }[];
};

const orders: Record<string, OrderDetail> = {
  ord_neobank2: {
    id: "ord_neobank2",
    title: "Neo 银行 · 私行专场答谢晚宴",
    client: "Neo 银行 · 战略客户部",
    contact: { name: "陆思远", role: "战略客户部 · 总监" },
    date: "2027-03-06",
    city: "北京 · 金融街丽思卡尔顿",
    scale: "260 人 · VIP 客户",
    amount: "¥ 72.4 万",
    contractState: "signed",
    brief: "沿用 2025 版基调,克制、内容驱动。客户希望在 2 月中旬对齐主视觉,不希望复用去年的开场表演。",
    responsibilities: [
      { who: "后仰喜剧", role: "main", scope: "主服务方 · 端到端交付", state: "verified" },
      { who: "光刻场景", role: "partner", scope: "舞美 · 灯光", state: "declared" },
      { who: "王家卫式内容组", role: "partner", scope: "视频短片", state: "pending" },
      { who: "程小夕", role: "actor", scope: "开场脱口秀 · 20min", state: "declared" },
    ],
    payments: [
      { title: "定金 30%", amount: "¥ 21.7 万", due: "2026-09-08", state: "paid", evidence: "客户财务已声明支付 · 09-05 14:20" },
      { title: "阶段款 40%", amount: "¥ 28.9 万", due: "演员定档后 5 天", state: "due" },
      { title: "尾款 30%", amount: "¥ 21.8 万", due: "活动后 15 天", state: "pending" },
    ],
    timeline: [
      { at: "09-01", title: "客户点名沿用上届主服务方", by: "client", note: "陆思远 · 微信留言" },
      { at: "09-03", title: "AI 抓取上届 NPS 与档期,推荐接单", by: "ai", note: "匹配度 92" },
      { at: "09-05", title: "你接受机会 · 主服务方身份确认", by: "you", note: "唯一责任人签名" },
      { at: "09-12", title: "合作凭证签署完成", by: "system", note: "电子合同 · 双方已签" },
      { at: "10-08", title: "AI 起草阶段款提醒邮件", by: "ai", note: "等你复核后发送" },
    ],
    aiReady: [
      { title: "阶段款提醒邮件", body: "AI 已根据合同拟好一封给客户财务的礼貌邮件,附上定档凭证与发票信息,复核后可一键发送。" },
      { title: "领导汇报卡", body: "AI 已把上届 vs 本届的差异、可复用与需要重做的内容整理成一页决策卡,面向客户方领导。" },
    ],
    risks: [
      { text: "视频短片协作方尚未回执档期", source: "王家卫式内容组 · 10-02 已发出邀请,未回复" },
    ],
  },
  ord_alpha: {
    id: "ord_alpha",
    title: "AlphaBio · 产品发布会",
    client: "AlphaBio · 品牌部",
    contact: { name: "何星辰", role: "品牌部 · 副总监" },
    date: "2026-10-22",
    city: "北京 · 国际会议中心",
    scale: "180 人 · 客户与媒体",
    amount: "¥ 58.0 万",
    contractState: "pending",
    brief: "客户上传了原有 RFP,AI 已完成缺口检查。合同已发出 3 天,对方法务未回执。",
    responsibilities: [
      { who: "后仰喜剧", role: "main", scope: "主服务方 · 端到端交付", state: "verified" },
      { who: "AlphaBio 法务", role: "partner", scope: "合同审阅", state: "pending" },
    ],
    payments: [
      { title: "定金 30%", amount: "¥ 17.4 万", due: "签约后 5 天", state: "pending" },
      { title: "阶段款 40%", amount: "¥ 23.2 万", due: "活动前 15 天", state: "pending" },
      { title: "尾款 30%", amount: "¥ 17.4 万", due: "活动后 15 天", state: "pending" },
    ],
    timeline: [
      { at: "07-10", title: "客户上传原 RFP · 12 页", by: "client", note: "PDF · 已归档" },
      { at: "07-11", title: "AI 完成缺口检查", by: "ai", note: "识别 5 项关键缺口" },
      { at: "07-18", title: "你接受机会并回填缺口", by: "you", note: "3 项完全解决 · 2 项待客户确认" },
      { at: "07-22", title: "合同已发出", by: "system", note: "等待客户方法务回执" },
    ],
    aiReady: [
      { title: "礼貌催办邮件", body: "AI 已起草一封面向 AlphaBio 法务的催办邮件,附合同摘要与关键条款高亮,复核后可发送。" },
    ],
    risks: [
      { text: "对方法务 3 天未回复,预计影响制作启动窗口", source: "订单时间线 · 07-22 后无新动作" },
    ],
  },
  ord_neobank1: {
    id: "ord_neobank1",
    title: "Neo 银行 · 2025 战略客户答谢",
    client: "Neo 银行 · 战略客户部",
    contact: { name: "陆思远", role: "战略客户部 · 总监" },
    date: "2025-11-08",
    city: "北京 · 中海广场",
    scale: "240 人",
    amount: "¥ 68.9 万",
    contractState: "framework",
    brief: "已完成活动,NPS 68。客户同意脱敏后作为你的案例证据复用。",
    responsibilities: [
      { who: "后仰喜剧", role: "main", scope: "主服务方 · 已履约", state: "verified" },
    ],
    payments: [
      { title: "全款", amount: "¥ 68.9 万", due: "已结清", state: "paid", evidence: "客户方财务声明 · 2025-12-01" },
    ],
    timeline: [
      { at: "2025-11-08", title: "活动执行完成", by: "system", note: "现场 240 人 · 零投诉" },
      { at: "2025-11-20", title: "评价提交 · NPS 68", by: "client", note: "主服务方 5.0 · 演员 4.8" },
      { at: "2025-12-05", title: "AI 生成脱敏案例", by: "ai", note: "已加入案例库,可复用" },
    ],
    aiReady: [
      { title: "复用为案例证据", body: "AI 已把这场活动脱敏为一份案例卡,含预算区间、内容结构、NPS 与关键节奏点,可直接复用于 Neo 银行 2027 版本。" },
    ],
    risks: [],
  },
};

const stateLabel: Record<OrderDetail["contractState"], string> = {
  signed: "已签约",
  pending: "待客户签署",
  framework: "框架订单",
};

export const Route = createFileRoute("/tenant/orders/$id")({
  loader: ({ params }) => {
    const order = orders[params.id];
    if (!order) throw notFound();
    return { order };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.order.title ?? "订单"} · 服务方 · 演立方` }],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { order } = Route.useLoaderData() as { order: OrderDetail };

  return (
    <AgentPanelProvider scopeLabel={`订单 · ${order.title}`} quickPrompts={["帮我给客户写一段项目进展", "当前订单的风险点在哪", "帮我列一份收付款提醒"]}>
    <>
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <Link to="/tenant/orders" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> 订单管理
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge
              state={order.contractState === "signed" ? "verified" : order.contractState === "pending" ? "pending" : "declared"}
              label={stateLabel[order.contractState]}
            />
            <span className="font-mono text-[10px] text-muted-foreground">订单 {order.id}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{order.title}</h1>
          <div className="mt-1 text-xs text-muted-foreground">
            {order.client} · {order.date} · {order.city} · {order.scale}
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="text-[10px] tracking-wide text-primary">合同总额</div>
          <div className="mt-0.5 font-mono text-xl font-semibold text-foreground">{order.amount}</div>
          <div className="text-[11px] text-muted-foreground">对接 · {order.contact.name} · {order.contact.role}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/60 p-4 text-sm text-foreground/85">
        {order.brief}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Responsibilities */}
          <Section icon={<Users className="h-4 w-4" />} title="责任结构">
            <div className="space-y-2">
              {order.responsibilities.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-background/40 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{r.who}</span>
                      {r.role === "main" && (
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-px text-[10px] text-primary">
                          唯一主服务方
                        </span>
                      )}
                      {r.role === "actor" && (
                        <span className="rounded-full border border-border bg-secondary px-2 py-px text-[10px] text-muted-foreground">
                          演员
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{r.scope}</div>
                  </div>
                  <StatusBadge state={r.state} label={r.state === "verified" ? "已核验" : r.state === "declared" ? "已声明" : "待确认"} />
                </div>
              ))}
            </div>
          </Section>

          {/* Payments */}
          <Section icon={<CircleDollarSign className="h-4 w-4" />} title="付款节点">
            <div className="space-y-2">
              {order.payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 p-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      到期 · {p.due}
                      {p.evidence && <> · <span className="text-foreground/70">{p.evidence}</span></>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">{p.amount}</div>
                    <StatusBadge
                      state={p.state === "paid" ? "verified" : p.state === "due" ? "pending" : "declared"}
                      label={p.state === "paid" ? "已声明支付" : p.state === "due" ? "临近到期" : "未到期"}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              演立方不托管资金,仅追踪各方声明与核销。
            </div>
          </Section>

          {/* Timeline */}
          <Section icon={<Activity className="h-4 w-4" />} title="全周期时间线">
            <ol className="space-y-2">
              {order.timeline.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{t.at}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{t.title}</span>
                      <span
                        className={
                          "rounded-full px-2 py-px text-[10px] " +
                          (t.by === "ai"
                            ? "border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]"
                            : t.by === "you"
                              ? "border border-primary/40 bg-primary/10 text-primary"
                              : t.by === "client"
                                ? "border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]"
                                : "border border-border bg-secondary text-muted-foreground")
                        }
                      >
                        {t.by === "ai" ? "AI" : t.by === "you" ? "你" : t.by === "client" ? "客户" : "系统"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{t.note}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <aside className="space-y-4">
          {order.risks.length > 0 && (
            <div className="rounded-lg border border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[color:var(--state-risk)]">
                <AlertCircle className="h-3.5 w-3.5" /> 需关注
              </div>
              <ul className="space-y-2 text-sm text-foreground/85">
                {order.risks.map((r, i) => (
                  <li key={i}>
                    {r.text}
                    <EvidenceLine source={r.source} className="mt-0.5" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {order.aiReady.map((a, i) => (
            <AgentInlineSuggestion
              key={i}
              title={a.title}
              actions={
                <>
                  <button onClick={() => demoToast()} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
                    复核并发送
                  </button>
                  <button onClick={() => demoToast()} className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                    先不用
                  </button>
                </>
              }
            >
              {a.body}
            </AgentInlineSuggestion>
          ))}

          <div className="rounded-lg border border-border/60 bg-card/60 p-4 text-[11px] text-muted-foreground">
            <div className="mb-1 inline-flex items-center gap-1 text-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" /> 责任提醒
            </div>
            你作为唯一主服务方,对本单的交付质量、履约与投诉处理承担全部对客责任。协作方与演员的问题由你先出面。
          </div>
        </aside>
      </div>
    </div>
    <TenantBottomTabs />
    </>
    </AgentPanelProvider>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/80">
        {icon} {title}
      </div>
      {children}
    </section>
  );
}

export { CheckCircle2, Clock3, FileSignature };
