import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin } from "lucide-react";
import { actors } from "../lib/fixtures";

export const Route = createFileRoute("/h5/discover/actors")({ component: H5Actors });

function H5Actors() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <h1 className="mb-1 text-lg font-bold text-foreground">演员</h1>
      <p className="mb-4 text-xs text-muted-foreground">浏览合作演员</p>

      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 mb-5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground/70">搜索演员...</span>
      </div>

      <div className="space-y-3">
        {actors.map((a) => (
          <Link
            key={a.id} to="/h5/discover/actors" params={{ id: a.id }}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 active:bg-secondary/40"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
              <img src={`https://picsum.photos/seed/${a.avatarSeed}/150/150`} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{a.name}</span>
                {a.verified && <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-600">已核验</span>}
              </div>
              <p className="truncate text-xs text-muted-foreground">{a.title}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {a.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
