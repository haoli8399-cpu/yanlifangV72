import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, ChevronRight } from "lucide-react";
import { msaFixtures } from "../lib/fixtures";

export const Route = createFileRoute("/h5/tenant/orders")({ component: H5TenantOrders });

function H5TenantOrders() {
  const items = msaFixtures.map((m) => ({
    id: m.id, title: m.brief_summary, status: m.lifecycle_status === "active" ? "进行中" : "待处理",
    date: m.created_at,
  }));

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <h1 className="text-lg font-bold text-foreground">订单</h1>
      <p className="mt-1 text-xs text-muted-foreground">{items.length} 个关联项目</p>
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <Link key={item.id} to="/h5/tenant/msa" className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 active:bg-secondary/40">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.status} · {item.date}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </Link>
        ))}
      </div>
    </div>
  );
}
