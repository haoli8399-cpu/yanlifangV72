import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, ChevronRight } from "lucide-react";
import { serviceProducts } from "@/lib/fixtures";
import { DiscoverBottomTabs } from "@/components/yanlicube/h5-discover-nav";

export const Route = createFileRoute("/h5/discover/service-products")({ component: H5ServiceProducts });

function H5ServiceProducts() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <h1 className="text-lg font-bold text-foreground">服务产品</h1>
      <p className="mt-1 text-xs text-muted-foreground">后仰喜剧 · {serviceProducts.length} 项服务</p>
      <div className="mt-5 space-y-3">
        {serviceProducts.map((sp) => (
          <div key={sp.id} className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">{sp.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground truncate">{sp.oneLiner}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-primary">{sp.priceBand}</span>
              <span className="text-[10px] text-muted-foreground">{sp.audienceScale}</span>
            </div>
            {sp.addOns && sp.addOns.length > 0 && (
              <div className="mt-2 border-t border-border/50 pt-2">
                <span className="text-[10px] text-muted-foreground">可选增值：{sp.addOns.slice(0, 2).map((a) => a.label).join("、")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <DiscoverBottomTabs />
    </div>
  );
}
