import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, ChevronRight } from "lucide-react";
import { ActorH5BottomTabs } from "@/components/yanlicube/h5-actor-nav";
import { programs } from "../lib/fixtures";

export const Route = createFileRoute("/h5/actor/services")({ component: H5ActorServices });

function H5ActorServices() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <h1 className="text-lg font-bold text-foreground">我的节目</h1>
      <p className="mt-1 text-xs text-muted-foreground">{programs.length} 个可演出节目</p>
      <div className="mt-5 space-y-3">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.type} · {p.duration}</p>
            <p className="mt-1 text-xs text-foreground/70 line-clamp-2">{p.summary}</p>
          </div>
        ))}
      </div>
      <ActorH5BottomTabs />
    </div>
  );
}
