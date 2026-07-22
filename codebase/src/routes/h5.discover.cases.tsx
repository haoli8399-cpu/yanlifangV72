import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, ChevronRight } from "lucide-react";
import { verifiedCases } from "../lib/verified-cases";

export const Route = createFileRoute("/h5/discover/cases")({ component: H5Cases });

function H5Cases() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <h1 className="text-lg font-bold text-foreground">案例</h1>
      <p className="mt-1 text-xs text-muted-foreground">后仰喜剧真实合作案例</p>
      <div className="mt-5 space-y-3">
        {verifiedCases.map((c) => (
          <div key={c.id} className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
            {c.industry && <p className="mt-1 text-xs text-muted-foreground">{c.industry}</p>}
            <div className="mt-2 text-[10px] text-muted-foreground/60">
              来源：后仰喜剧公众号
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
