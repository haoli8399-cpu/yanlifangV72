import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, ChevronRight } from "lucide-react";
import { programs } from "@/lib/fixtures";
import { DiscoverBottomTabs } from "@/components/yanlicube/h5-discover-nav";

export const Route = createFileRoute("/h5/discover/programs")({ component: H5Programs });

function H5Programs() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <h1 className="text-lg font-bold text-foreground">节目库</h1>
      <p className="mt-1 text-xs text-muted-foreground">后仰喜剧 · {programs.length} 个节目</p>
      <div className="mt-5 space-y-3">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground flex-1">{p.title}</h3>
              <span className="shrink-0 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-600">可预约</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.type} · {p.duration}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.audienceFit.map((a) => <span key={a} className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{a}</span>)}
            </div>
          </div>
        ))}
      </div>
      <DiscoverBottomTabs />
    </div>
  );
}
