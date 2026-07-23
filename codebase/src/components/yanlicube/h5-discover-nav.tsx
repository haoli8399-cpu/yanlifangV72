import { Compass, Users, Package, Zap } from "lucide-react";
import { BottomTabBar, type BottomTabItem } from "./h5";

export const discoverTabs: BottomTabItem[] = [
  { to: "/h5/discover", label: "发现", icon: Compass, match: (p) => p === "/h5/discover" },
  { to: "/h5/discover/actors", label: "演员", icon: Users, match: (p) => p.startsWith("/h5/discover/actors") },
  { to: "/h5/discover/service-products", label: "服务", icon: Package, match: (p) => p.startsWith("/h5/discover/service-products") || p.startsWith("/h5/discover/programs") || p.startsWith("/h5/discover/cases") },
  { to: "/h5/snapshot", label: "快照", icon: Zap, match: (p) => p === "/h5/snapshot" },
];

export function DiscoverBottomTabs() {
  return <BottomTabBar items={discoverTabs} />;
}
