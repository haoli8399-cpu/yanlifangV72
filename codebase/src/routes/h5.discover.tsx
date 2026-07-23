import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Users, Sparkles, FolderOpen, Building2, MapPin } from "lucide-react";
import { useCapabilities } from "../lib/hooks";
import { actors } from "../lib/fixtures";
import { DiscoverBottomTabs } from "@/components/yanlicube/h5-discover-nav";

export const Route = createFileRoute("/h5/discover")({ component: H5Discover });

function ActorCard({ a }: { a: (typeof actors)[number] }) {
  return (
    <Link
      to="/h5/discover/actors"
      params={{ id: a.id }}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 active:bg-secondary/40"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        <img
          src={`https://picsum.photos/seed/${a.avatarSeed}/150/150`}
          alt={a.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{a.name}</span>
          {a.verified && <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-600">已核验</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.title}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {a.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function H5Discover() {
  const { data: capabilities } = useCapabilities();
  const featured = actors.slice(0, 4);

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      {/* 顶栏 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">发现</h1>
        <p className="mt-1 text-xs text-muted-foreground">浏览演员、案例和服务产品</p>
      </div>

      {/* 搜索框 */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground/70">搜索演员、节目或活动类型...</span>
      </div>

      {/* 分类入口 */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Link to="/h5/discover/actors" className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/10 py-4 text-primary active:bg-primary/20">
          <Users className="h-5 w-5" />
          <span className="text-xs font-medium">找演员</span>
        </Link>
        <Link to="/h5/discover/cases" className="flex flex-col items-center gap-1.5 rounded-xl bg-amber-500/10 py-4 text-amber-600 active:bg-amber-500/20">
          <FolderOpen className="h-5 w-5" />
          <span className="text-xs font-medium">看案例</span>
        </Link>
        <Link to="/h5/discover/service-products" className="flex flex-col items-center gap-1.5 rounded-xl bg-violet-500/10 py-4 text-violet-600 active:bg-violet-500/20">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-medium">服务产品</span>
        </Link>
      </div>

      {/* 推荐演员 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />推荐演员
          </h2>
          <Link to="/h5/discover/actors" className="text-xs text-primary/70">查 看全部 →</Link>
        </div>
        <div className="space-y-3">
          {featured.map((a) => <ActorCard key={a.id} a={a} />)}
        </div>
      </div>

      {/* 节目库/更多入口 */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">更多发现</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/h5/discover/programs" className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground active:bg-secondary/40">🎭 节目库</Link>
          <Link to="/h5/snapshot" className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground active:bg-secondary/40">⚡ 匿名快照</Link>
          <Link to="/h5/discover/cases" className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground active:bg-secondary/40">📂 案例库</Link>
          <Link to="/guides" className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground active:bg-secondary/40">📖 活动指南</Link>
        </div>
      </div>

      {/* 脚注 */}
      <div className="border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        Demo 数据 · V7.2 开发中
      </div>
      <DiscoverBottomTabs />
    </div>
  );
}
