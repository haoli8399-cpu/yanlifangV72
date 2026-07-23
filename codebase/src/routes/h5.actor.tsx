import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar, Bell, CheckCircle2, XCircle, ChevronRight,
  MapPin, Clock, User,
} from "lucide-react";
import { actors } from "../lib/fixtures";
import { useCapabilities } from "../lib/hooks";
import { ActorH5BottomTabs } from "@/components/yanlicube/h5-actor-nav";
import { StatusBadge } from "@/components/yanlicube/status-badge";

export const Route = createFileRoute("/h5/actor")({ component: H5Actor });

// ── 类型 ──

interface Invitation {
  id: string;
  actorName: string;
  projectTitle: string;
  date: string;
  city: string;
  program: string;
  role: string;
  status: "pending" | "confirmed" | "declined";
  matchReason: string;
}

const mockInvitations: Invitation[] = [
  {
    id: "inv_001",
    actorName: "程小夕",
    projectTitle: "Neo 银行 · 2027 年度客户答谢晚宴",
    date: "2027-01-18",
    city: "上海",
    program: "单口喜剧 20min",
    role: "开场演员",
    status: "pending",
    matchReason: "擅长年会开场 · 同城市 · 档期匹配",
  },
  {
    id: "inv_002",
    actorName: "程小夕",
    projectTitle: "华创科技 · 经销商大会",
    date: "2026-08-22",
    city: "成都",
    program: "互动脱口秀 15min",
    role: "压轴演员",
    status: "confirmed",
    matchReason: "往期合作好评 · 风格匹配",
  },
];

const performanceTasks = [
  {
    id: "perf_001",
    project: "华创科技 · 经销商大会",
    date: "2026-08-22",
    time: "14:00-14:15",
    venue: "成都世纪城天堂洲际大饭店",
    contact: "王经理 138****6789",
    status: "upcoming",
  },
];

// ── 组件 ──

function InviteCard({
  inv,
  onAction,
}: {
  inv: Invitation;
  onAction: (id: string, action: "confirm" | "decline") => void;
}) {
  const isPending = inv.status === "pending";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      {/* 状态 + 匹配理由 */}
      <div className="flex items-center justify-between">
        <StatusBadge
          state={inv.status === "confirmed" ? "verified" : inv.status === "declined" ? "expired" : "pending"}
          label={inv.status === "confirmed" ? "已确认" : inv.status === "declined" ? "已婉拒" : "待确认"}
        />
        {isPending && <span className="text-[10px] text-muted-foreground">{inv.matchReason}</span>}
      </div>

      {/* 项目信息 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">{inv.projectTitle}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{inv.date}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inv.city}</span>
        </div>
        <div className="mt-1.5 text-xs text-foreground/70">
          {inv.program} · {inv.role}
        </div>
      </div>

      {/* 操作 */}
      {isPending && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAction(inv.id, "decline")}
            className="flex-1 rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground active:bg-secondary/30"
          >
            婉拒
          </button>
          <button
            onClick={() => onAction(inv.id, "confirm")}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground active:opacity-80"
          >
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />确认档期
          </button>
        </div>
      )}
    </div>
  );
}

function TaskRow({ t }: { t: (typeof performanceTasks)[number] }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{t.project}</div>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.date} {t.time}</div>
            <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t.venue}</div>
            <div className="flex items-center gap-1"><User className="h-3 w-3" />{t.contact}</div>
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" />
      </div>
    </div>
  );
}

// ── 主页面 ──

function H5Actor() {
  const { data: capabilities } = useCapabilities();
  const [invites, setInvites] = useState(mockInvitations);
  const actor = actors.find((a) => a.id === "act_hexuan");

  const handleAction = (id: string, action: "confirm" | "decline") => {
    setInvites((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: action === "confirm" ? "confirmed" as const : "declined" as const } : i))
    );
  };

  const pendingCount = invites.filter((i) => i.status === "pending").length;
  const upcomingTasks = performanceTasks;
  const confirmedCount = invites.filter((i) => i.status === "confirmed").length;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      {/* 头像 + 概览 */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-muted">
          <img
            src="https://picsum.photos/seed/actor-female/200/200"
            alt="演员"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{actor?.name || "程小夕"}</h1>
          <p className="text-xs text-muted-foreground">{actor?.title || "脱口秀演员"}</p>
          <div className="mt-1.5 flex gap-3 text-xs">
            <span className="font-medium text-primary">{pendingCount} 待确认</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-medium text-green-600">{confirmedCount} 已确认</span>
          </div>
        </div>
      </div>

      {/* 快捷按钮 */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Link to="/h5/actor" className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 py-3 text-primary text-xs font-medium">
          <Bell className="h-5 w-5" />邀约
        </Link>
        <Link to="/h5/actor/calendar" className="flex flex-col items-center gap-1 rounded-xl bg-secondary/30 py-3 text-xs text-muted-foreground">
          <Calendar className="h-5 w-5" />档期
        </Link>
        <Link to="/h5/actor" className="flex flex-col items-center gap-1 rounded-xl bg-secondary/30 py-3 text-xs text-muted-foreground">
          <User className="h-5 w-5" />我的
        </Link>
      </div>

      {/* 待确认邀约 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {pendingCount > 0 ? `待确认邀约 (${pendingCount})` : "邀约"}
          </h2>
        </div>
        <div className="space-y-3">
          {invites.map((inv) => (
            <InviteCard key={inv.id} inv={inv} onAction={handleAction} />
          ))}
          {invites.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">暂无邀约</div>
          )}
        </div>
      </div>

      {/* 即将演出 */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">即将演出</h2>
            <Link to="/h5/actor/calendar" className="text-xs text-primary/70"> 查看全部 →</Link>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map((t) => <TaskRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* 脚注 */}
      <div className="border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        Demo 数据 · 不产生真实业务事实
      </div>
      <ActorH5BottomTabs />
    </div>
  );
}
