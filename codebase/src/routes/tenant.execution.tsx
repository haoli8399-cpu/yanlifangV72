import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertCircle, CheckCircle2, Clock3, Radio, Sparkles, Users } from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { TenantBottomTabs } from "@/components/yanlicube/tenant-h5-nav";

export const Route = createFileRoute("/tenant/execution")({
  head: () => ({
    meta: [
      { title: "履约看板 · 服务方 · 演立方" },
      { name: "description", content: "现场当日的执行视图:签到、彩排、演出、异常、结束确认,一屏可视化。" },
    ],
  }),
  component: ExecutionBoard,
});

type Slot = {
  time: string;
  title: string;
  who: string;
  state: "done" | "live" | "next" | "pending";
  note?: string;
};

const today = {
  title: "Neo 银行 · 2027 私行答谢晚宴",
  date: "预演 · 2027-03-06 · 北京",
  now: "18:42",
  main: "后仰喜剧",
  onsite: [
    { name: "陆思远", role: "客户方决策人" },
    { name: "程小夕", role: "开场演员" },
    { name: "光刻场景 · 沈斌", role: "舞美协作" },
  ],
};

const slots: Slot[] = [
  { time: "16:00", title: "布场完成 · 灯光过场", who: "光刻场景", state: "done", note: "客户方陆总 16:20 到场确认" },
  { time: "17:30", title: "演员到场 · 走位彩排", who: "程小夕", state: "done", note: "麦位调整 2 次,已通过" },
  { time: "18:30", title: "客户签到开始", who: "后仰喜剧 · 前厅组", state: "live", note: "已到 128/260 · 客户领导预计 19:05" },
  { time: "19:15", title: "开场脱口秀 · 20min", who: "程小夕", state: "next" },
  { time: "19:40", title: "主宾致辞", who: "客户方 · 陆思远", state: "pending" },
  { time: "20:00", title: "视频短片首映", who: "王家卫式内容组", state: "pending" },
  { time: "20:30", title: "自由交流环节", who: "后仰喜剧 · 全组", state: "pending" },
  { time: "22:00", title: "结束 · 客户确认交付", who: "客户方 · 陆思远", state: "pending" },
];

const incidents = [
  {
    text: "王家卫式内容组的视频短片交付延后 20 分钟,不影响首映时间",
    source: "18:15 · 现场组反馈",
    resolved: true,
  },
  {
    text: "签到区第 2 通道扫码机偶发失败,已切至人工核对",
    source: "18:32 · 现场组反馈",
    resolved: false,
  },
];

function ExecutionBoard() {
  const doneCount = slots.filter((s) => s.state === "done").length;
  const liveSlot = slots.find((s) => s.state === "live");
  const progress = Math.round((doneCount / slots.length) * 100);

  return (
    <AgentPanelProvider scopeLabel="履约看板 · 现场执行" quickPrompts={["下一环节需要注意什么", "如果出现异常怎么处理", "帮我写一段给客户的现场简讯"]}>
    <>
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <Link to="/tenant" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> 服务方工作台
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 px-2 py-0.5 text-[11px] text-[color:var(--state-verified)]">
              <Radio className="h-3 w-3 animate-pulse" />
              执行中 · 现场直连
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">当前时间 {today.now}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{today.title}</h1>
          <div className="mt-1 text-xs text-muted-foreground">{today.date} · 主服务方 {today.main}</div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="text-[10px] tracking-wide text-primary">整体进度</div>
          <div className="mt-0.5 font-mono text-2xl font-semibold text-foreground">{progress}%</div>
          <div className="text-[11px] text-muted-foreground">{doneCount}/{slots.length} 节点完成</div>
        </div>
      </div>

      {/* Live now */}
      {liveSlot && (
        <div className="mt-6 rounded-xl border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-[color:var(--state-verified)]">
            <Radio className="h-3 w-3 animate-pulse" /> 正在进行
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-foreground">{liveSlot.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{liveSlot.time} · {liveSlot.who}</div>
              {liveSlot.note && <div className="mt-1 text-[11px] text-foreground/80">{liveSlot.note}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => demoToast()} className="rounded-md border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 px-3 py-1.5 text-xs text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/20">
                标记完成
              </button>
              <button onClick={() => demoToast()} className="rounded-md border border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/10 px-3 py-1.5 text-xs text-[color:var(--state-risk)] hover:bg-[color:var(--state-risk)]/20">
                上报异常
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/80">
            <Clock3 className="h-4 w-4" /> 当日时间线
          </div>
          <ol className="space-y-2">
            {slots.map((s, i) => (
              <li
                key={i}
                className={
                  "flex items-start gap-3 rounded-md border p-3 transition-colors " +
                  (s.state === "live"
                    ? "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/5"
                    : s.state === "done"
                      ? "border-border/50 bg-background/40 opacity-70"
                      : "border-border/60 bg-background/40")
                }
              >
                <div className="w-14 shrink-0 font-mono text-xs text-foreground">{s.time}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{s.title}</span>
                    <StatusBadge
                      state={
                        s.state === "done" ? "verified" : s.state === "live" ? "declared" : s.state === "next" ? "pending" : "ai"
                      }
                      label={s.state === "done" ? "已完成" : s.state === "live" ? "进行中" : s.state === "next" ? "紧接下一步" : "待启动"}
                    />
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    <Users className="mr-1 inline h-3 w-3" />
                    {s.who}
                    {s.note && <> · {s.note}</>}
                  </div>
                </div>
                {s.state === "done" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--state-verified)]/70" />}
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/80">
              <AlertCircle className="h-4 w-4" /> 现场异常
            </div>
            <div className="space-y-2">
              {incidents.map((it, i) => (
                <div
                  key={i}
                  className={
                    "rounded-md border p-3 " +
                    (it.resolved
                      ? "border-[color:var(--state-verified)]/30 bg-[color:var(--state-verified)]/5"
                      : "border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/5")
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-foreground/85">{it.text}</div>
                    <StatusBadge state={it.resolved ? "verified" : "pending"} label={it.resolved ? "已核实处理" : "处理中"} />
                  </div>
                  <EvidenceLine source={it.source} className="mt-1" />
                </div>
              ))}
            </div>
          </div>

          <AgentInlineSuggestion
            title="生成客户结束确认卡"
            actions={
              <>
                <button onClick={() => demoToast()} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
                  复核并生成
                </button>
                <button onClick={() => demoToast()} className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  先不用
                </button>
              </>
            }
          >
            AI 已根据当日执行时间线拟好一份客户方决策人的结束确认摘要:主要节奏点、异常与处理、演员表现。你可在 22:00 请客户在移动端一键签署。
          </AgentInlineSuggestion>

          <div className="rounded-lg border border-border/60 bg-card/60 p-4">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/80">
              <Users className="h-4 w-4" /> 现场关键人
            </div>
            <ul className="space-y-1.5 text-[12px]">
              {today.onsite.map((p, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/60 p-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" /> 责任提醒
            </span>
            <div className="mt-1">
              作为主服务方,现场任何异常都由你先响应,然后再联动协作方与演员。所有节点的确认动作都会沉淀为下次履约的证据。
            </div>
          </div>
        </aside>
      </div>
    </div>
    <TenantBottomTabs />
    </>
    </AgentPanelProvider>
  );
}
