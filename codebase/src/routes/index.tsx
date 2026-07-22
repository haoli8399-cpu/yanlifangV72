import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Sparkles,
  Wand2,
  Users,
  History,
  FileUp,
  ShieldCheck,
  Clock3,
  BookOpen,
  Play,
} from "lucide-react";
import { actors, cases, programs, projects } from "@/lib/fixtures";
import { getActorAvatar, AI_AVATAR_NOTE } from "@/lib/actor-avatars";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/")({
  component: Index,
});

const paths = [
  {
    title: "我在探索方向",
    desc: "还没想清楚,和 AI 顾问先聊聊",
    icon: Wand2,
    to: "/agent" as const,
  },
  {
    title: "我看中了某位演员/节目",
    desc: "直接从演员或节目出发生成方案",
    icon: Users,
    to: "/discover/actors" as const,
  },
  {
    title: "我想再办一次",
    desc: "从历史活动一键复用",
    icon: History,
    to: "/projects" as const,
  },
  {
    title: "我已经有方案",
    desc: "上传方案,做缺口检查",
    icon: FileUp,
    to: "/gap-checklist" as const,
  },
];

function Index() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-14">
      {/* Hero */}
      <section className="relative mb-10 sm:mb-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-[11px] text-muted-foreground sm:mb-6 sm:text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          面向商演与企业活动的 AI 经营产品 · V7.2
        </div>
        <h1 className="max-w-4xl text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-6xl">
          把模糊的活动需求
          <span className="ml-2 bg-gradient-to-r from-primary to-[color:var(--state-verified)] bg-clip-text text-transparent">
            变成一场确定的演出
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base md:text-lg">
          和一位极其专业的活动总监一起工作 —— AI 顾问帮你理解、比较、决策,
          唯一主服务方为整场活动整体负责,你随时知道下一步是什么、谁在为你负责。
        </p>

        {/* 四条路径 */}
        <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {paths.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="surface-1 group relative overflow-hidden rounded-xl p-5 transition-all hover:border-primary/50"
            >
              <div className="mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background/40 text-primary group-hover:border-primary/60">
                  <p.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-sm font-semibold text-foreground">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <AgentInlineSuggestion
            title="不确定该走哪条路?"
            actions={
              <Link
                to="/agent"
                className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
              >
                和 AI 顾问聊一聊
              </Link>
            }
          >
            告诉我活动类型、大致预算与日期,我会在 30 秒内推荐一条最短路径,并直接生成第一版方向 —— 你随时可以撤回,无金额承诺。
          </AgentInlineSuggestion>
        </div>
      </section>

      {/* 发现 · 演员 */}
      <Section
        eyebrow="发现 · 演员"
        title="先选人，再看他们的作品"
        desc="浏览演员 → 了解他们的代表节目 → 或直接选择打包好的演出服务产品"
        rightLink={{ to: "/discover/actors", label: "浏览全部演员" }}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actors.slice(0, 3).map((a) => (
            <Link
              key={a.id}
              to="/discover/actors/$id"
              params={{ id: a.id }}
              className="surface-1 group flex flex-col rounded-xl p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getActorAvatar(a.avatarSeed) ? (
                    <img
                      src={getActorAvatar(a.avatarSeed)}
                      alt={`${a.name} · ${AI_AVATAR_NOTE}`}
                      title={AI_AVATAR_NOTE}
                      loading="lazy"
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-secondary to-accent" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-foreground">{a.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{a.title}</div>
                  </div>
                </div>
                {a.verified && (
                  <StatusBadge state="verified" label="档案已核验" />
                )}
              </div>
              <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {a.bio}
              </p>
              <div className="mt-auto flex flex-wrap gap-1">
                {a.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* 承诺 · 责任 · 等待 */}
      <section className="mt-20 grid gap-4 md:grid-cols-3">
        <Principle
          icon={ShieldCheck}
          title="唯一主服务方"
          text="正式项目只有一个整体责任主体。多演员、多协作方,你只面对一个负责人。"
        />
        <Principle
          icon={Sparkles}
          title="AI 不越权"
          text="AI 主导理解与生成,结构化 UI 主导确认与决策。所有推进必须经过你或主服务方确认。"
        />
        <Principle
          icon={Clock3}
          title="等待有陪伴"
          text="档期、审批、外部确认 —— 商演大量时间在等待。我们把等待做成一种明确、可追踪的状态。"
        />
      </section>

      {/* 演示项目 */}
      <section className="mt-20">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-1 text-xs font-medium tracking-[0.14em] text-muted-foreground">
              演示 · 我的活动
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              可以立即点开的 4 个演示活动
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-xs text-primary hover:underline"
          >
            打开列表 →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/projects/$id"
              params={{ id: p.id }}
              className="surface-1 group rounded-xl p-4 transition-colors hover:border-primary/40"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--state-ai)]">
                  DEMO
                </span>
                <StageBadge stage={p.stage} />
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                {p.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {p.client} · {p.city} · {p.date}
              </div>
              <div className="mt-3 line-clamp-1 text-xs text-foreground/70">
                {p.headline}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-24 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"><span>© 演立方 · Hao Works</span><Link to="/m" className="text-primary/70 hover:text-primary">H5 测试入口</Link></div>
          <span className="inline-flex items-center gap-1.5">
            <Compass className="h-3 w-3" />
            所有数据为演示 Mock · 非真实业务事实
          </span>
        </div>
      </footer>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  desc,
  rightLink,
  children,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  rightLink?: { to: "/discover/actors" | "/discover/programs" | "/discover/cases" | "/discover/service-products"; label: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="mb-1 text-xs font-medium tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {desc && (
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          )}
        </div>
        {rightLink && (
          <Link to={rightLink.to} className="text-xs text-primary hover:underline">
            {rightLink.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Principle({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="surface-1 rounded-xl p-5">
      <Icon className="mb-3 h-4 w-4 text-primary" />
      <div className="mb-1.5 text-sm font-semibold text-foreground">{title}</div>
      <div className="text-xs leading-relaxed text-muted-foreground">{text}</div>
    </div>
  );
}

function StageBadge({ stage }: { stage: import("@/lib/fixtures").ProjectStage }) {
  const map: Record<string, { label: string; state: import("@/lib/fixtures").EvidenceState }> = {
    exploring: { label: "探索中", state: "declared" },
    planning: { label: "方案中", state: "declared" },
    quoting: { label: "报价中", state: "pending" },
    waiting: { label: "等待中", state: "pending" },
    executing: { label: "执行中", state: "declared" },
    completed: { label: "已完成", state: "verified" },
  };
  const s = map[stage];
  return <StatusBadge state={s.state} label={s.label} />;
}
