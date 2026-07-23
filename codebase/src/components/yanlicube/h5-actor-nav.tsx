import { Home, CalendarDays, Inbox } from "lucide-react";
import { BottomTabBar, type BottomTabItem } from "./h5";

export const actorH5Tabs: BottomTabItem[] = [
  { to: "/h5/actor", label: "首页", icon: Home, match: (p) => p === "/h5/actor" },
  { to: "/h5/actor/calendar", label: "日程", icon: CalendarDays, match: (p) => p.startsWith("/h5/actor/calendar") },
  { to: "/h5/actor/services", label: "任务", icon: Inbox, match: (p) => p.startsWith("/h5/actor/services") },
];

export function ActorH5BottomTabs() {
  return <BottomTabBar items={actorH5Tabs} />;
}
