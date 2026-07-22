import { createFileRoute, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import {
  ArrowLeft,
  QrCode,
  Users2,
  Radio,
  Copy,
  Check,
  ShieldCheck,
  Signal,
  TrendingUp,
  Sparkles,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { getProject, type Project } from "@/lib/fixtures";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";

// 观众预登记与到场感知(PRD V7.2 §14.9 §16.5 §18.5):
// 主服务方为活动生成登记表 / 二维码,现场以脱敏方式感知到场与关键情绪节点,
// 事后将数据回流至复盘,不采集手机号/身份证等敏感字段。

type RsvpField = { id: string; label: string; required: boolean; sensitive: boolean };
type CheckinBucket = { at: string; count: number };
type LiveMoment = { at: string; label: string; signal: string; state: "up" | "flat" | "down" };

const rsvpFields: RsvpField[] = [
  { id: "name", label: "姓名 / 昵称", required: true, sensitive: false },
  { id: "company", label: "所在机构", required: true, sensitive: false },
  { id: "seat", label: "偏好桌次", required: false, sensitive: false },
  { id: "diet", label: "餐饮忌口", required: false, sensitive: false },
  { id: "phone", label: "手机号", required: false, sensitive: true },
];

const checkinBuckets: CheckinBucket[] = [
  { at: "17:30", count: 12 },
  { at: "17:45", count: 68 },
  { at: "18:00", count: 214 },
  { at: "18:15", count: 356 },
  { at: "18:30", count: 428 },
  { at: "18:45", count: 461 },
];

const liveMoments: LiveMoment[] = [
  { at: "19:12", label: "开场脱口秀 · 高潮段", signal: "笑声密度峰值 +38%", state: "up" },
  { at: "19:44", label: "客户案例短片", signal: "手机低头率下降至 12%", state: "up" },
  { at: "20:21", label: "颁奖间隙", signal: "离席率 8%,略高于均值", state: "down" },
  { at: "21:05", label: "近景魔术 · VIP 桌", signal: "现场拍照/短视频 +54%", state: "up" },
];

export const Route = createFileRoute("/projects/$id/execution/audience")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: AudiencePage,
  ...stageBoundaries({ backTo: "/projects/$id/execution", backLabel: "返回上一环节", homeTo: "/projects/$id" }),
});

function AudiencePage() {
  const { project } = Route.useLoaderData() as { project: Project };
  const [copied, setCopied] = useState(false);
  const [maskSensitive, setMaskSensitive] = useState(true);

  const rsvpUrl = `https://yanlicube.app/r/${project.id.slice(-6)}`;
  const registered = 512;
  const checkedIn = checkinBuckets[checkinBuckets.length - 1].count;
  const arrivalRate = Math.round((checkedIn / registered) * 100);
  const maxBucket = Math.max(...checkinBuckets.map((b) => b.count));

  return (
    <div className="space-y-6">
      <Link
        to="/projects/$id/execution"
        params={{ id: project.id }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        返回履约时间线
      </Link>

      <div>
        <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">履约 · 观众感知</div>
        <h2 className="text-xl font-semibold text-foreground">观众预登记与到场感知</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          用最小必要字段收集报名,现场以脱敏方式感知到场与关键情绪节点,回流至复盘。手机号等敏感字段由主服务方保管,不进入 AI 与协作方视野。
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Kpi icon={<Users2 className="h-4 w-4" />} label="预登记" value={String(registered)} sub="报名总数" />
        <Kpi icon={<Signal className="h-4 w-4" />} label="已到场" value={String(checkedIn)} sub="截至 18:45" />
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="到场率" value={`${arrivalRate}%`} sub="≥ 85% 优" />
        <Kpi icon={<ShieldCheck className="h-4 w-4" />} label="脱敏字段" value={maskSensitive ? "开" : "关"} sub="仅主服务方可见" />
      </div>

      {/* 登记表 & 分享 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="surface-1 rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">登记表字段</div>
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={maskSensitive}
                onChange={(e) => setMaskSensitive(e.target.checked)}
                className="h-3 w-3"
              />
              对协作方脱敏敏感字段
            </label>
          </div>
          <ul className="divide-y divide-border/60">
            {rsvpFields.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="text-foreground">{f.label}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {f.required ? "必填" : "选填"}
                    {f.sensitive && " · 敏感字段"}
                  </div>
                </div>
                {f.sensitive ? (
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px]",
                      maskSensitive
                        ? "border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-600",
                    )}
                  >
                    {maskSensitive ? "对外脱敏" : "对协作方可见"}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">对外可见</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-1 rounded-xl p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <QrCode className="h-4 w-4 text-primary" />
            报名入口
          </div>
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-background p-6">
            <div className="grid h-32 w-32 grid-cols-8 gap-[2px]">
              {Array.from({ length: 64 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block",
                    (i * 13 + 7) % 3 === 0 ? "bg-foreground" : "bg-transparent",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-[11px]">
            <span className="flex-1 truncate text-muted-foreground">{rsvpUrl}</span>
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(rsvpUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-primary-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            访问链接对外开放,填写内容仅回流至本项目;报名截止后自动关闭,并生成可信时间戳存档。
          </p>
        </div>
      </div>

      {/* 到场曲线 */}
      <div className="surface-1 rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          到场曲线(每 15 分钟)
        </div>
        <div className="flex items-end gap-2 h-32">
          {checkinBuckets.map((b) => (
            <div key={b.at} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary/70"
                style={{ height: `${(b.count / maxBucket) * 100}%` }}
                title={`${b.at} · ${b.count} 人`}
              />
              <div className="text-[10px] text-muted-foreground">{b.at}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 现场感知 */}
      <div className="surface-1 rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Radio className="h-4 w-4 text-primary" />
          现场关键节点(脱敏聚合指标)
        </div>
        <ul className="space-y-2">
          {liveMoments.map((m) => (
            <li
              key={m.at}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-md border border-border/70 bg-background/40 px-3 py-2 text-sm"
            >
              <span className="text-xs text-muted-foreground">{m.at}</span>
              <div>
                <div className="text-foreground">{m.label}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{m.signal}</div>
              </div>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px]",
                  m.state === "up" && "bg-[color:var(--state-verified)]/15 text-[color:var(--state-verified)]",
                  m.state === "flat" && "bg-muted text-muted-foreground",
                  m.state === "down" && "bg-amber-500/15 text-amber-600",
                )}
              >
                {m.state === "up" ? "↑ 正向" : m.state === "down" ? "↓ 需关注" : "→ 持平"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <AgentInlineSuggestion title="AI 观察 · 到场与情绪">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-primary">
            <Sparkles className="h-3 w-3" />
            {arrivalRate}% 到场率高于同预算档均值(78%),开场脱口秀高潮段和 VIP 桌魔术是本场记忆点。
          </div>
          <div>
            20:21 颁奖间隙离席率略高,建议下次将颁奖切为两段并前置。以上信号已入库,复盘时可一键作为归因证据。
          </div>
        </div>
      </AgentInlineSuggestion>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
