import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Wand2,
  ClipboardList,
  ShieldCheck,
  Wallet,
  Users,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "30 秒看懂演立方 · Demo" },
      { name: "description", content: "用 30 秒走完:理解 · 方案 · 合同 · 履约 · 复盘,五步看懂演立方如何为一场活动整体负责" },
      { property: "og:title", content: "30 秒看懂演立方" },
      { property: "og:description", content: "五步演示 · 每步只需 6 秒" },
    ],
  }),
  component: DemoPage,
});

type Step = {
  id: string;
  seconds: number;
  eyebrow: string;
  title: string;
  narration: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  cta: { label: string; to: string };
};

const steps: Step[] = [
  {
    id: "s1",
    seconds: 6,
    eyebrow: "第 1 步 · 理解",
    title: "AI 顾问 30 秒里问对 5 件事",
    narration:
      "不用填 40 项表单。AI 顾问只问关键 5 件事:行业、日期、预算区间、场地类型、参与规模,然后立刻给你一版方向。",
    bullets: ["最短路径推荐", "承诺前必二次确认", "对话可撤回"],
    icon: Wand2,
    accent: "from-primary/40 to-primary/10",
    cta: { label: "打开 AI 顾问", to: "/agent" },
  },
  {
    id: "s2",
    seconds: 6,
    eyebrow: "第 2 步 · 方案",
    title: "3 版方案 + 差异矩阵 + 故事板",
    narration:
      "AI 直接生成 3 版方案。差异矩阵告诉你每版的取舍,故事板告诉你整场活动的节奏起伏。",
    bullets: ["预算 / 体验 / 风险 三轴对比", "复购洞察复用历史资产", "每一列都可追溯 AI 依据"],
    icon: ClipboardList,
    accent: "from-[color:var(--state-ai)]/40 to-[color:var(--state-ai)]/10",
    cta: { label: "看示例方案", to: "/projects" },
  },
  {
    id: "s3",
    seconds: 6,
    eyebrow: "第 3 步 · 合同与付款",
    title: "责任树 + 3 种付款方案任选",
    narration:
      "无论内部涉及几家协作方,主服务方对你承担唯一整体责任。付款方式支持定金/阶段/尾款、分期里程碑、月结框架。",
    bullets: ["AI 条款摘要 · 风险标红", "多合同责任树", "双确认才生效"],
    icon: ShieldCheck,
    accent: "from-[color:var(--state-verified)]/40 to-[color:var(--state-verified)]/10",
    cta: { label: "查看合同凭证", to: "/projects" },
  },
  {
    id: "s4",
    seconds: 6,
    eyebrow: "第 4 步 · 履约",
    title: "开演前 24 小时的交接包",
    narration:
      "灯光、音响、主演、主持、直播分发 —— 每个角色一份交接包,逐项签收,签收进度 100% 才算就绪。",
    bullets: ["现场交接包可信时间戳存证", "异常自动升级到对接人", "现场看板实时同步"],
    icon: Users,
    accent: "from-[color:var(--state-pending)]/40 to-[color:var(--state-pending)]/10",
    cta: { label: "看履约看板", to: "/tenant/execution" },
  },
  {
    id: "s5",
    seconds: 6,
    eyebrow: "第 5 步 · 复盘",
    title: "分层评价 + 复购洞察",
    narration:
      "评价按层级:整体 / 主服务方 / 演员 / 协作方。AI 会自动生成可复用的复盘卡,下一场直接从这里开始。",
    bullets: ["评价脱敏,不含金额", "AI 复盘卡进入案例库", "变更单只标差异"],
    icon: Trophy,
    accent: "from-[color:var(--state-declared)]/40 to-[color:var(--state-declared)]/10",
    cta: { label: "看案例库", to: "/discover/cases" },
  },
];

function DemoPage() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSeconds = useMemo(() => steps.reduce((s, x) => s + x.seconds, 0), []);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1;
        if (next >= totalSeconds) {
          setPlaying(false);
          return totalSeconds;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(t);
  }, [playing, totalSeconds]);

  useEffect(() => {
    let acc = 0;
    for (let i = 0; i < steps.length; i++) {
      acc += steps[i].seconds;
      if (elapsed < acc) {
        setActive(i);
        return;
      }
    }
    setActive(steps.length - 1);
  }, [elapsed]);

  const current = steps[active];
  const CurrentIcon = current.icon;
  const progressPct = Math.min(100, (elapsed / totalSeconds) * 100);
  const done = elapsed >= totalSeconds;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> 30 秒 Demo · 引导游览
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            30 秒看懂演立方
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            五步串起一场活动的全生命周期。每步 6 秒,读完 30 秒,你会知道每一个页面存在的理由。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "暂停" : "继续"}
          </button>
          <button
            onClick={() => {
              setElapsed(0);
              setPlaying(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> 重播
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-secondary/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-[color:var(--state-verified)] to-[color:var(--state-declared)] transition-[width] duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mb-8 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">
          {elapsed.toFixed(1).padStart(4, "0")}s / {totalSeconds}s
        </span>
        <span>{active + 1} / {steps.length}</span>
      </div>

      {/* Stage */}
      <div className={`surface-1 relative overflow-hidden rounded-2xl p-8`}>
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${current.accent} opacity-60`}
          aria-hidden
        />
        <div className="relative grid gap-8 md:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground">
              {current.eyebrow}
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              {current.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85">
              {current.narration}
            </p>
            <ul className="mt-5 space-y-1.5 text-xs text-foreground/80">
              {current.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to={current.cta.to}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              {current.cta.label} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border border-primary/30 bg-background/50 shadow-lg shadow-primary/10 backdrop-blur">
              <CurrentIcon className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 grid gap-3 md:grid-cols-5">
        {steps.map((s, i) => {
          const StepIcon = s.icon;
          const passed = i < active;
          const isActive = i === active;
          return (
            <button
              key={s.id}
              onClick={() => {
                let acc = 0;
                for (let k = 0; k < i; k++) acc += steps[k].seconds;
                setElapsed(acc + 0.1);
              }}
              className={`surface-1 rounded-xl p-3 text-left transition ${
                isActive
                  ? "border-primary/60 ring-1 ring-primary/40"
                  : passed
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-50 hover:opacity-100"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <StepIcon className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {s.seconds}s
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">{s.eyebrow}</div>
              <div className="mt-0.5 text-xs font-medium text-foreground line-clamp-2">
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* End state */}
      {done && (
        <div className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1 text-xs font-medium tracking-[0.14em] text-primary">
                30 秒 已结束
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                现在,选一条路径开始你的第一场活动
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                四条路径 · 覆盖 A 探索 / B 演员 / C 复用 / D 已有方案
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/"
                className="rounded-lg border border-border/60 bg-secondary/40 px-4 py-2 text-xs text-foreground hover:border-primary/40"
              >
                回首页选路径
              </Link>
              <Link
                to="/guides"
                className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs text-primary hover:bg-primary/20"
              >
                打开指南库
              </Link>
              <Link
                to="/agent"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                直接问 AI 顾问
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
