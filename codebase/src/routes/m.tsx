import { createFileRoute } from "@tanstack/react-router";
import { Smartphone, Users, FolderOpen, Building2, Compass, Sparkles } from "lucide-react";

export const Route = createFileRoute("/m")({ component: MobileHub });

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "公开发现",
    items: [
      { label: "演员列表", href: "/discover/actors", icon: Users },
      { label: "案例库", href: "/discover/cases", icon: FolderOpen },
      { label: "服务产品", href: "/discover/service-products", icon: Building2 },
    ],
  },
  {
    title: "客户操作",
    items: [
      { label: "项目列表", href: "/projects", icon: Compass },
      { label: "AI 顾问", href: "/agent", icon: Sparkles },
    ],
  },
  {
    title: "演示项目",
    items: [
      { label: "Neo 银行答谢宴 (方案中)", href: "/projects/proj_neoyear" },
      { label: "Miracle 汽车上市 (等待中)", href: "/projects/proj_waiting" },
      { label: "SciTech Kickoff (已完成)", href: "/projects/proj_reuse" },
      { label: "AlphaBio 发布会 (探索中)", href: "/projects/proj_rfp" },
    ],
  },
];

function NavItemRow({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 active:bg-secondary/60"
    >
      {item.icon ? <item.icon className="h-4 w-4 shrink-0 text-primary" /> : <div className="h-4 w-4 shrink-0" />}
      <span className="text-sm text-foreground">{item.label}</span>
    </a>
  );
}

function MobileHub() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">演立方 · H5</h1>
          <p className="text-[11px] text-muted-foreground">开发测试聚合入口</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 px-3 py-2 text-[11px] text-foreground/80">
        H5 端为只读简化体验。复杂操作（方案比较、合同查看）建议桌面端使用。
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="mb-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {sec.title}
          </div>
          <div className="space-y-1.5">
            {sec.items.map((it) => (
              <NavItemRow key={it.label + it.href} item={it} />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        V7.2 开发中 · 数据为演示 Mock
      </div>
    </div>
  );
}
