import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Smartphone, Users, Sparkles, Compass,
  ChevronRight, MapPin, Calendar,
} from "lucide-react";
import { actors, projects } from "../lib/fixtures";

export const Route = createFileRoute("/m")({ component: MobileHub });

// ── 子组件 ──────────────────────────────────────────

function ActorCard({ a }: { a: (typeof actors)[number] }) {
  const imgSrc = a.avatarSeed
    ? `https://picsum.photos/seed/${a.avatarSeed}/200/200`
    : "https://picsum.photos/seed/default/200/200";

  return (
    <Link
      to="/discover/actors/$id"
      params={{ id: a.id }}
      className="flex shrink-0 flex-col items-start rounded-xl border border-border/60 bg-card p-3 w-[150px] snap-start active:bg-secondary/40"
    >
      <div className="mb-2 h-14 w-14 overflow-hidden rounded-full bg-muted">
        <img src={imgSrc} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <span className="text-sm font-semibold text-foreground">{a.name}</span>
      <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{a.title}</span>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {a.tags.slice(0, 2).map((t) => (
          <span key={t} className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
        ))}
      </div>
    </Link>
  );
}

function ProjectRow({ p }: { p: (typeof projects)[number] }) {
  const stageColors: Record<string, string> = {
    exploring: "border-[color:var(--state-declared)]/40 bg-[color:var(--state-declared)]/10 text-[color:var(--state-declared)]",
    planning: "border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]",
    quoting: "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]",
    executing: "border-[color:var(--stage-glow)]/40 bg-[color:var(--stage-glow)]/10 text-[color:var(--stage-glow)]",
    completed: "border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]",
  };
  const stageLabels: Record<string, string> = {
    exploring: "探索中", planning: "方案中", quoting: "报价中",
    waiting: "等待中", executing: "执行中", completed: "已完成",
  };

  return (
    <Link
      to="/projects/$id"
      params={{ id: p.id }}
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-3 active:bg-secondary/40"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{p.title}</span>
          <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${stageColors[p.stage] || stageColors.exploring}`}>
            {stageLabels[p.stage] || p.stage}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
    </Link>
  );
}

// ── 主页面 ──────────────────────────────────────────

function MobileHub() {
  const featured = actors.slice(0, 6);
  const active = projects.filter((p) => p.stage !== "completed").slice(0, 3);

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      {/* ── 顶栏 ── */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">演立方 · H5</h1>
          <p className="text-[11px] text-muted-foreground">活动经营协作平台</p>
        </div>
      </div>

      {/* ── 快捷入口 ── */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        <Link to="/discover/actors" className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary/30 py-3 active:bg-secondary/60">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-[10px] text-muted-foreground">找演员</span>
        </Link>
        <Link to="/discover/cases" className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary/30 py-3 active:bg-secondary/60">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-[10px] text-muted-foreground">看案例</span>
        </Link>
        <Link to="/projects" className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary/30 py-3 active:bg-secondary/60">
          <Compass className="h-5 w-5 text-primary" />
          <span className="text-[10px] text-muted-foreground">我的活动</span>
        </Link>
        <Link to="/agent" className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary/30 py-3 active:bg-secondary/60">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-[10px] text-muted-foreground">AI 顾问</span>
        </Link>
      </div>

      {/* ── 进行中的活动 ── */}
      {active.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">进行中的活动</span>
            <Link to="/projects" className="text-[11px] text-primary/70 hover:text-primary">查看全部 →</Link>
          </div>
          <div className="space-y-1.5">
            {active.map((p) => <ProjectRow key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* ── 推荐演员 ── */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">推荐演员</span>
          <Link to="/discover/actors" className="text-[11px] text-primary/70 hover:text-primary">查看全部 →</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {featured.map((a) => <ActorCard key={a.id} a={a} />)}
        </div>
      </div>

      {/* ── 发现更多 ── */}
      <div className="mb-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">发现更多</div>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/discover/cases" className="rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">📂 案例库</Link>
          <Link to="/discover/service-products" className="rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">📦 服务产品</Link>
          <Link to="/discover/programs" className="rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">🎭 节目库</Link>
          <Link to="/snapshot" className="rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm text-foreground active:bg-secondary/40">⚡ 匿名快照</Link>
        </div>
      </div>

      {/* ── 脚注 ── */}
      <div className="mt-8 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        V7.2 开发中 · 数据为演示 Mock
      </div>
    </div>
  );
}
