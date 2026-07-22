import { CalendarClock, Users, Package, User } from "lucide-react";
import { BottomTabBar, type BottomTabItem } from "./h5";

export const tenantTabs: BottomTabItem[] = [
  { to: "/tenant", label: "今日", icon: CalendarClock, match: (p) => p === "/tenant" },
  {
    to: "/tenant/partners",
    label: "客户",
    icon: Users,
    match: (p) => p.startsWith("/tenant/partners") || p.startsWith("/tenant/opportunities"),
  },
  {
    to: "/tenant/orders",
    label: "项目",
    icon: Package,
    match: (p) =>
      p.startsWith("/tenant/orders") ||
      p.startsWith("/tenant/execution") ||
      p.startsWith("/tenant/programs") ||
      p.startsWith("/tenant/service-products"),
  },
  {
    to: "/tenant/settlement",
    label: "我的",
    icon: User,
    match: (p) => p.startsWith("/tenant/settlement"),
  },
];

/** 主服务方端统一底部导航 · AI 按钮居中(由 AgentPanelProvider 提供)。 */
export function TenantBottomTabs() {
  return <BottomTabBar aiSlot items={tenantTabs} />;
}
