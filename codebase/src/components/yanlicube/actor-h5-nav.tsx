import { Home, CalendarDays, Inbox, User } from "lucide-react";
import { BottomTabBar, type BottomTabItem } from "./h5";

export const actorTabs: BottomTabItem[] = [
  { to: "/actor", label: "首页", icon: Home, match: (p) => p === "/actor" },
  {
    to: "/actor/calendar",
    label: "日程",
    icon: CalendarDays,
    match: (p) => p.startsWith("/actor/calendar"),
  },
  {
    to: "/actor/services",
    label: "任务",
    icon: Inbox,
    match: (p) => p.startsWith("/actor/services"),
  },
  {
    to: "/actor/preferences",
    label: "我的",
    icon: User,
    match: (p) =>
      p.startsWith("/actor/preferences") || p.startsWith("/actor/disputes"),
  },
];

/** 演员端统一底部导航 · AI 按钮居中(由 AgentPanelProvider 提供)。 */
export function ActorBottomTabs() {
  return <BottomTabBar aiSlot items={actorTabs} />;
}
