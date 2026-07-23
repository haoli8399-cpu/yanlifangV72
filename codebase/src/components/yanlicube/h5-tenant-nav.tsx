import { LayoutDashboard, Bell, FolderOpen } from "lucide-react";
import { BottomTabBar, type BottomTabItem } from "./h5";

export const tenantH5Tabs: BottomTabItem[] = [
  { to: "/h5/tenant", label: "今日", icon: LayoutDashboard, match: (p) => p === "/h5/tenant" },
  { to: "/h5/tenant/msa", label: "机会", icon: Bell, match: (p) => p.startsWith("/h5/tenant/msa") },
  { to: "/h5/projects", label: "项目", icon: FolderOpen, match: (p) => p.startsWith("/h5/projects") || p.startsWith("/h5/tenant/orders") || p.startsWith("/h5/tenant/programs") },
];

export function TenantH5BottomTabs() {
  return <BottomTabBar items={tenantH5Tabs} />;
}
