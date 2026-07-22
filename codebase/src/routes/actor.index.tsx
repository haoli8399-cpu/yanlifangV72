import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarX2,
  Sparkles,
  ShieldCheck,
  Clock3,
  MapPin,
  ChevronRight,
  UserCircle2,
  BadgeCheck,
  Home,
  Inbox,
  CalendarDays,
  User,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";
import { BottomTabBar } from "@/components/yanlicube/h5";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";

export const Route = createFileRoute("/actor/")({
  head: () => ({
    meta: [
      { title: "演员端 · 档期管理 · 演立方" },
      { name: "description", content: "以演员身份查看待确认档期、已确认演出、隐私边界与 AI 陪伴,不接受商务谈判、只做档期与内容确认。" },
    ],
  }),
  component: ActorWorkbench,
});

type Booking = {
  id: string;
  title: string;
  tenant: string;
  date: string;
  time: string;
  city: string;
  duration: string;
  content: string; // 只显示与你相关的内容,不显示预算/客户敏感信息
  privacyNote: string; // 客户身份/预算等对你屏蔽的说明
  requestedAt: string;
  expiresAt?: string;
  state: "pending" | "declined" | "confirmed" | "past";
  hint?: string;
};

const initial: Booking[] = [
  {
    id: "bk1",
    title: "私行答谢晚宴 · 开场脱口秀 20min",
    tenant: "后仰喜剧",
    date: "2027-03-06",
    time: "19:15",
    city: "北京 · 金融街",
    duration: "20 分钟",
    content: "金融从业者观众 · 偏克制风格 · 避免宏观经济梗与政治话题",
    privacyNote: "客户身份与合同金额对你不可见,依约由主服务方承担。",
    requestedAt: "10-06 14:20 · 后仰喜剧 · 沈斌",
    expiresAt: "10-09 24:00 前回复",
    state: "pending",
    hint: "上次为同主服务方的类似场次 NPS 4.8,建议直接确认。",
  },
  {
    id: "bk2",
    title: "AlphaBio 发布会 · 中场脱口秀",
    tenant: "后仰喜剧",
    date: "2026-10-22",
    time: "20:30",
    city: "北京 · 国际会议中心",
    duration: "15 分钟",
    content: "生物科技行业受众 · 主题严肃,内容需回避病人叙事",
    privacyNote: "客户方与主服务方尚在合同流程,你只需先决定档期是否可留。",
    requestedAt: "07-18 09:00 · 后仰喜剧 · 沈斌",
    state: "confirmed",
  },
  {
    id: "bk3",
    title: "某地产项目 · 年会开场",
    tenant: "光刻场景",
    date: "2026-12-18",
    time: "20:00",
    city: "上海",
    duration: "25 分钟",
    content: "内容要求存在多个禁忌项,你曾明确表达不愿承接同类场次",
    privacyNote: "客户身份对你不可见,依约由主服务方承担。",
    requestedAt: "09-30 11:00 · 光刻场景 · 郑潇",
    state: "declined",
    hint: "AI 已根据你先前偏好自动礼貌回绝,已同步主服务方。",
  },
  {
    id: "bk4",
    title: "Neo 银行 2025 战略客户答谢",
    tenant: "后仰喜剧",
    date: "2025-11-08",
    time: "19:20",
    city: "北京",
    duration: "20 分钟",
    content: "已完成 · NPS 4.8",
    privacyNote: "客户已同意脱敏,该场次沉淀为你的公开代表作。",
    requestedAt: "已履约",
    state: "past",
  },
];

const stateLabel: Record<Booking["state"], string> = {
  pending: "待你确认",
  declined: "已回绝",
  confirmed: "已确认档期",
  past: "已履约",
};

function ActorWorkbench() {
  const [bookings, setBookings] = useState(initial);
  const [tab, setTab] = useState<"pending" | "confirmed" | "past">("pending");

  const buckets = useMemo(
    () => ({
      pending: bookings.filter((b) => b.state === "pending"),
      confirmed: bookings.filter((b) => b.state === "confirmed" || b.state === "declined"),
      past: bookings.filter((b) => b.state === "past"),
    }),
    [bookings],
  );

  const confirm = (id: string) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, state: "confirmed" } : b)));
  const decline = (id: string) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, state: "declined" } : b)));

  return (
    <AgentPanelProvider scopeLabel="演员端 · 档期工作台" quickPrompts={["我该接下周三这个通告吗", "帮我起草一段婉拒话术", "把本周确认档期整理成一句话"]}>
    <>
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <UserCircle2 className="h-3.5 w-3.5" />
        演员端 · 档期管理
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">程小夕的档期</h1>
        <Link
          to="/actor/preferences"
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] text-primary hover:bg-primary/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          偏好
        </Link>
      </div>
      <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
        <Link to="/actor/services" className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
          <BadgeCheck className="h-3.5 w-3.5" />我的服务片段
        </Link>
        <Link to="/actor/calendar" className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
          <CalendarCheck2 className="h-3.5 w-3.5" />履约日历
        </Link>
        <Link to="/actor/disputes" className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
          异议与申诉
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        你只处理"档期是否可留、内容是否可接",商务谈判与合同由主服务方承担。演立方在你和客户之间保留严格隐私边界。
      </p>

      {/* KPI */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi label="待你确认" value={String(buckets.pending.length)} sub={buckets.pending.length ? "最近 3 天内到期 1 项" : "无待办"} tone="pending" />
        <Kpi label="已确认档期" value={String(bookings.filter((b) => b.state === "confirmed").length)} sub="下一场 92 天后" tone="verified" />
        <Kpi label="过去 12 个月履约" value="7 场" sub="平均 NPS 4.7" tone="ai" />
      </div>

      {/* Privacy banner */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--state-verified)]" />
        <div className="flex-1 text-[12px] leading-relaxed text-foreground/85">
          <div className="mb-0.5 text-xs font-medium text-foreground">隐私边界</div>
          客户身份、合同金额与主服务方内部利润对你不可见。你看到的只有内容要求、档期时间、场地与观众画像 —— 保护你不被卷入商务谈判。
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        {(["pending", "confirmed", "past"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
              tab === k ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k === "pending" ? `待确认 · ${buckets.pending.length}` : k === "confirmed" ? `已确认/回绝 · ${buckets.confirmed.length}` : `已履约 · ${buckets.past.length}`}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {(tab === "pending" ? buckets.pending : tab === "confirmed" ? buckets.confirmed : buckets.past).map((b) => (
          <BookingCard key={b.id} b={b} onConfirm={() => confirm(b.id)} onDecline={() => decline(b.id)} />
        ))}
        {(tab === "pending" ? buckets.pending : tab === "confirmed" ? buckets.confirmed : buckets.past).length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-6 text-center text-xs text-muted-foreground">
            这里空空的 · 主服务方还没有向你发起邀请
          </div>
        )}
      </div>

      {/* AI companion */}
      <div className="mt-8">
        <AgentInlineSuggestion
          title="根据你的偏好,AI 已代你处理 1 项"
          actions={
            <Link
              to="/agent"
              className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
            >
              查看代处理策略
            </Link>
          }
        >
          你曾表明不愿承接房地产年会类场次,AI 已根据这条偏好回绝上海 12-18 的邀请,并同步主服务方。你随时可以调整偏好。
        </AgentInlineSuggestion>
      </div>
    </div>
    <BottomTabBar
      aiSlot
      items={[
        { to: "/actor", label: "首页", icon: Home, match: (p) => p === "/actor" },
        { to: "/actor/calendar", label: "日程", icon: CalendarDays, match: (p) => p.startsWith("/actor/calendar") },
        { to: "/actor/services", label: "任务", icon: Inbox, match: (p) => p.startsWith("/actor/services") },
        { to: "/actor/preferences", label: "我的", icon: User, match: (p) => p.startsWith("/actor/preferences") || p.startsWith("/actor/disputes") },
      ]}
    />
    </>
    </AgentPanelProvider>
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

function BookingCard({
  b,
  onConfirm,
  onDecline,
}: {
  b: Booking;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <StatusBadge
              state={
                b.state === "confirmed" || b.state === "past"
                  ? "verified"
                  : b.state === "declined"
                    ? "expired"
                    : "pending"
              }
              label={stateLabel[b.state]}
            />
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              <BadgeCheck className="h-3 w-3" />
              主服务方 · {b.tenant}
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground">{b.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{b.date} · {b.time} · {b.duration}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{b.city}</span>
          </div>
          <div className="mt-2 rounded-md border border-border/60 bg-background/40 p-2 text-[12px] text-foreground/85">
            <div className="mb-0.5 text-[10px] tracking-wide text-muted-foreground">内容要求</div>
            {b.content}
          </div>
          <EvidenceLine source={b.requestedAt} className="mt-2">发起邀请</EvidenceLine>
          {b.expiresAt && (
            <div className="mt-1 text-[11px] text-[color:var(--state-pending)]">⏳ {b.expiresAt}</div>
          )}
          {b.hint && (
            <div className="mt-2 rounded-md border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 px-2.5 py-1.5 text-[11px] text-foreground/85">
              <Sparkles className="mr-1 inline h-3 w-3 text-[color:var(--state-ai)]" />
              {b.hint}
            </div>
          )}
          <div className="mt-2 text-[10.5px] text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3 w-3" />
            {b.privacyNote}
          </div>
        </div>

        {b.state === "pending" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1 rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 px-3 py-1.5 text-xs text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/20"
            >
              <CalendarCheck2 className="h-3.5 w-3.5" />
              可留档期
            </button>
            <button
              onClick={onDecline}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <CalendarX2 className="h-3.5 w-3.5" />
              礼貌回绝
            </button>
            <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
              让 AI 陪我决定 <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
