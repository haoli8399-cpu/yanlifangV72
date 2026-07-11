export interface AppNotification {
  id: string;
  type: "系统" | "报价" | "AI提醒" | "客服";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: { to: string; params?: Record<string, string> };
}

const now = Date.now();
const iso = (offsetMin: number) => new Date(now - offsetMin * 60_000).toISOString();

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "报价",
    title: "报价 QUO-2091 已更新至 v2",
    body: "运营已按你的偏好把总价从 25.8 万调整到 18 万，方案 PDF 附在报价页。有效期还剩 46 小时。",
    createdAt: iso(12),
    read: false,
    link: { to: "/agent/quotations/$id", params: { id: "q1" } },
  },
  {
    id: "n2",
    type: "AI提醒",
    title: "AI 建议：确认档期",
    body: "推荐方案中的刘旸教主 1 月 18 日档期仅剩 1 个，建议尽快确认，避免被其他客户抢占。",
    createdAt: iso(55),
    read: false,
    link: { to: "/agent/assistant" },
  },
  {
    id: "n3",
    type: "系统",
    title: "欢迎使用演立方 AI 活动顾问",
    body: "在「AI 需求助手」用一句话描述你的活动需求，3 秒即可获得 3 套方案推荐。",
    createdAt: iso(60 * 6),
    read: true,
  },
  {
    id: "n4",
    type: "报价",
    title: "报价即将到期",
    body: "QUO-1802（春季发布会）报价将在 24 小时后过期，请及时确认或联系运营续期。",
    createdAt: iso(60 * 9),
    read: false,
    link: { to: "/agent/quotations/$id", params: { id: "q1" } },
  },
  {
    id: "n5",
    type: "客服",
    title: "运营 张运营 想加你微信",
    body: "「方便加个微信吗？后续档期沟通更快，也能第一时间发送方案。」",
    createdAt: iso(60 * 20),
    read: true,
  },
  {
    id: "n6",
    type: "AI提醒",
    title: "偏好已更新",
    body: "AI 已根据你的最近 3 次浏览把「松弛感喜剧」加入你的偏好，后续推荐将优先展示。",
    createdAt: iso(60 * 24),
    read: true,
  },
];

export function unreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}