import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Clock3,
  MapPin,
  Plane,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { ActorBottomTabs } from "@/components/yanlicube/actor-h5-nav";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/actor/calendar")({
  head: () => ({
    meta: [
      { title: "履约日历 · 演员端 · 演立方" },
      { name: "description", content: "查看本人档期、拟约、旅行日与硬禁忌;支持一键与个人日历同步,内容对你可见、金额与客户身份对你屏蔽。" },
    ],
  }),
  component: ActorCalendar,
});

type Slot =
  | { kind: "confirmed"; title: string; tenant: string; city: string; time: string; duration: string }
  | { kind: "pending"; title: string; tenant: string; city: string; time: string; expiresAt: string }
  | { kind: "travel"; from: string; to: string; time: string }
  | { kind: "blocked"; reason: string }
  | { kind: "past"; title: string; tenant: string; city: string };

const BASE_YEAR = 2027;
const BASE_MONTH = 2; // March (0-indexed)

const data: Record<string, Slot[]> = {
  "2027-03-02": [{ kind: "blocked", reason: "个人 · 家庭日" }],
  "2027-03-05": [
    { kind: "travel", from: "上海", to: "北京", time: "15:00 CA1858" },
  ],
  "2027-03-06": [
    {
      kind: "confirmed",
      title: "私行答谢晚宴 · 开场脱口秀",
      tenant: "后仰喜剧",
      city: "北京 · 金融街",
      time: "19:15",
      duration: "20 分钟",
    },
  ],
  "2027-03-07": [
    { kind: "travel", from: "北京", to: "上海", time: "11:20 MU5108" },
  ],
  "2027-03-12": [
    {
      kind: "pending",
      title: "科技公司年会 · 双语主持",
      tenant: "光弦舞美",
      city: "上海 · 徐汇",
      time: "18:30",
      expiresAt: "10-09 24:00",
    },
  ],
  "2027-03-15": [{ kind: "blocked", reason: "硬禁忌 · 宗教节日" }],
  "2027-03-19": [
    {
      kind: "past",
      title: "汽车品牌上市 · 沉浸剧场",
      tenant: "光弦舞美",
      city: "上海",
    },
  ],
  "2027-03-22": [
    {
      kind: "pending",
      title: "私人生日派对 · 定制脱口秀 30min",
      tenant: "后仰喜剧",
      city: "杭州 · 千岛湖",
      time: "20:00",
      expiresAt: "10-14 24:00",
    },
  ],
  "2027-03-28": [
    {
      kind: "confirmed",
      title: "开年论坛 · 圆桌主持",
      tenant: "后仰喜剧",
      city: "北京 · 国贸",
      time: "14:00",
      duration: "60 分钟",
    },
  ],
};

function ActorCalendar() {
  const [year, setYear] = useState(BASE_YEAR);
  const [month, setMonth] = useState(BASE_MONTH);
  const [selected, setSelected] = useState<string | null>("2027-03-06");

  const monthLabel = `${year} 年 ${month + 1} 月`;
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0-6, 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  const leading = (startDow + 6) % 7; // Monday first
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(key);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const stats = useMemo(() => {
    const all = Object.values(data).flat();
    return {
      confirmed: all.filter((s) => s.kind === "confirmed").length,
      pending: all.filter((s) => s.kind === "pending").length,
      travel: all.filter((s) => s.kind === "travel").length,
      blocked: all.filter((s) => s.kind === "blocked").length,
    };
  }, []);

  const shift = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const selectedSlots = selected ? data[selected] : undefined;

  return (
    <AgentPanelProvider scopeLabel="演员端 · 履约日历" quickPrompts={["这周有没有旅行冲突", "帮我找出可以接单的空档", "如果拒绝这个拟约会失去什么"]}>
    <>
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-8 sm:px-6 sm:py-10 md:pb-10">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
          <CalIcon className="h-3.5 w-3.5 text-primary" /> 演员端 · 履约日历
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              你的本月档期一览
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              金额与客户身份对你屏蔽;你只需确认档期、内容边界与到场时间。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => demoToast()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> 同步日历
            </button>
            <Link
              to="/actor/preferences"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Ban className="h-4 w-4" /> 设置硬禁忌
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Calendar column */}
        <div className="surface-1 overflow-hidden rounded-2xl">
          {/* KPI strip */}
          <div className="grid grid-cols-2 divide-x divide-y divide-border/60 border-b border-border/60 sm:grid-cols-4 sm:divide-y-0">
            <KpiCell label="本月已确认" value={stats.confirmed} icon={CheckCircle2} tone="verified" />
            <KpiCell label="待确认拟约" value={stats.pending} icon={Clock3} tone="pending" />
            <KpiCell label="旅行日" value={stats.travel} icon={Plane} tone="ai" />
            <KpiCell label="禁忌 / 屏蔽" value={stats.blocked} icon={Ban} tone="declared" />
          </div>

          <div className="p-4 sm:p-6">
            {/* Month nav + legend */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => shift(-1)}
                  aria-label="上一月"
                  className="rounded-md border border-border bg-secondary/40 p-2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[7rem] text-center font-mono text-base font-medium text-foreground">
                  {monthLabel}
                </div>
                <button
                  onClick={() => shift(1)}
                  aria-label="下一月"
                  className="rounded-md border border-border bg-secondary/40 p-2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <Legend tone="verified" label="已确认" />
                <Legend tone="pending" label="拟约" />
                <Legend tone="ai" label="旅行" />
                <Legend tone="declared" label="屏蔽" />
                <Legend tone="muted" label="已完成" />
              </div>
            </div>

            {/* Weekday header */}
            <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
              {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                <div key={d} className="py-1">周{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {cells.map((key, i) => {
                if (!key) return <div key={i} className="h-24 sm:h-28 lg:h-32" />;
                const day = Number(key.slice(-2));
                const slots = data[key];
                const isSelected = selected === key;
                const isWeekend = i % 7 >= 5;
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={cn(
                      "flex h-24 flex-col rounded-lg border p-2 text-left transition sm:h-28 lg:h-32",
                      isSelected
                        ? "border-primary/60 bg-primary/10 ring-1 ring-primary/40"
                        : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-primary" : isWeekend ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {day}
                      </span>
                      {slots && slots.length > 2 && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          +{slots.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                      {slots?.slice(0, 2).map((s, si) => (
                        <SlotChip key={si} slot={s} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected day panel */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="mb-4 flex items-baseline justify-between border-b border-border/60 pb-3">
              <div className="text-sm font-semibold text-foreground">
                {selected ?? "选一个日期"}
              </div>
              {selectedSlots && (
                <span className="font-mono text-xs text-muted-foreground">
                  共 {selectedSlots.length} 项
                </span>
              )}
            </div>
            {!selectedSlots || selectedSlots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                当日无安排 · 视为开放档
              </div>
            ) : (
              <div className="space-y-3">
                {selectedSlots.map((s, i) => (
                  <SlotDetail key={i} slot={s} />
                ))}
              </div>
            )}
          </div>

          <AgentInlineSuggestion title="AI · 档期陪伴">
            检测到 3 月 5 - 7 日为跨城连排,已建议主服务方为你安排接送与酒店。你无需自行沟通,行程一旦确认会同步到这里。
          </AgentInlineSuggestion>

          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> 隐私边界
            </div>
            <ul className="grid gap-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">·</span>客户真实姓名 / 单位对你屏蔽</li>
              <li className="flex gap-2"><span className="text-primary">·</span>合同金额与利润结构对你屏蔽</li>
              <li className="flex gap-2"><span className="text-primary">·</span>你的联系方式不会被推送给客户</li>
              <li className="flex gap-2"><span className="text-primary">·</span>所有沟通经主服务方,平台留痕可回溯</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
    <ActorBottomTabs />
    </>
    </AgentPanelProvider>
  );
}

function KpiCell({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "verified" | "pending" | "ai" | "declared";
}) {
  const color = {
    verified: "text-[color:var(--state-verified)]",
    pending: "text-[color:var(--state-pending)]",
    ai: "text-[color:var(--state-ai)]",
    declared: "text-[color:var(--state-declared)]",
  }[tone];
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</div>
      </div>
      <Icon className={cn("h-5 w-5 shrink-0", color)} />
    </div>
  );
}

function SlotChip({ slot }: { slot: Slot }) {
  const map = {
    confirmed: "border-l-[color:var(--state-verified)] bg-[color:var(--state-verified)]/12 text-[color:var(--state-verified)]",
    pending: "border-l-[color:var(--state-pending)] bg-[color:var(--state-pending)]/12 text-[color:var(--state-pending)]",
    travel: "border-l-[color:var(--state-ai)] bg-[color:var(--state-ai)]/12 text-[color:var(--state-ai)]",
    blocked: "border-l-[color:var(--state-declared)] bg-[color:var(--state-declared)]/12 text-[color:var(--state-declared)]",
    past: "border-l-muted-foreground/40 bg-muted/40 text-muted-foreground",
  } as const;
  const label =
    slot.kind === "confirmed"
      ? slot.title
      : slot.kind === "pending"
        ? `拟 · ${slot.title}`
        : slot.kind === "travel"
          ? `✈ ${slot.from}→${slot.to}`
          : slot.kind === "blocked"
            ? `⛔ ${slot.reason}`
            : slot.title;
  return (
    <div
      className={cn(
        "truncate rounded-sm border-l-2 px-1.5 py-0.5 text-[11px] font-medium leading-tight",
        map[slot.kind],
      )}
      title={label}
    >
      {label}
    </div>
  );
}

function SlotDetail({ slot }: { slot: Slot }) {
  if (slot.kind === "confirmed")
    return (
      <div className="rounded-lg border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{slot.title}</span>
          <span className="shrink-0 rounded-full bg-[color:var(--state-verified)]/20 px-2 py-0.5 font-mono text-[10px] text-[color:var(--state-verified)]">
            已确认
          </span>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {slot.time} · {slot.duration}</div>
          <div className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {slot.city}</div>
          <div>主服务方 · <span className="text-foreground/80">{slot.tenant}</span></div>
        </div>
      </div>
    );
  if (slot.kind === "pending")
    return (
      <div className="rounded-lg border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{slot.title}</span>
          <span className="shrink-0 rounded-full bg-[color:var(--state-pending)]/20 px-2 py-0.5 font-mono text-[10px] text-[color:var(--state-pending)]">
            拟约
          </span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>{slot.city} · {slot.time}</div>
          <div className="text-[color:var(--state-warn)]">
            请在 {slot.expiresAt} 前回复
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => demoToast()} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            确认接约
          </button>
          <button onClick={() => demoToast()} className="rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            婉拒
          </button>
        </div>
      </div>
    );
  if (slot.kind === "travel")
    return (
      <div className="rounded-lg border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/10 p-4">
        <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Plane className="h-4 w-4 text-[color:var(--state-ai)]" />
          {slot.from} → {slot.to}
        </div>
        <div className="text-xs text-muted-foreground">{slot.time}</div>
      </div>
    );
  if (slot.kind === "blocked")
    return (
      <div className="rounded-lg border border-[color:var(--state-declared)]/30 bg-[color:var(--state-declared)]/10 p-4">
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          <AlertTriangle className="h-4 w-4 text-[color:var(--state-declared)]" />
          屏蔽日
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{slot.reason}</div>
      </div>
    );
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30 p-4">
      <div className="mb-1 text-sm font-medium text-foreground">{slot.title}</div>
      <div className="text-xs text-muted-foreground">
        {slot.city} · {slot.tenant} · 已完成
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: "verified" | "pending" | "ai" | "declared" | "muted"; label: string }) {
  const color = {
    verified: "bg-[color:var(--state-verified)]",
    pending: "bg-[color:var(--state-pending)]",
    ai: "bg-[color:var(--state-ai)]",
    declared: "bg-[color:var(--state-declared)]",
    muted: "bg-muted-foreground/40",
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}
