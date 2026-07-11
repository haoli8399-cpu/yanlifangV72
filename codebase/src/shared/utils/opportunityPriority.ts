import type { Opportunity } from "../types";

/**
 * Weight rules (PRD §6.3 priority queue):
 *  - 状态权重：谈判中/等待确认 > 已报价 > 有效商机 > 新需求 > 其他
 *  - 预算权重：越高越优先（log scale）
 *  - AI 匹配度：0-100 直接加权
 *  - 活动临近度：距活动日期越近，越优先
 *  - 跟进静默：距上次跟进越久，越优先（避免遗漏）
 *  - 客户优先级：高/中/低
 */

const STATUS_W: Record<string, number> = {
  "谈判中": 30,
  "等待客户确认": 28,
  "已报价": 22,
  "有效商机": 16,
  "新需求": 10,
  "已成交": 2,
  "已丢单": 0,
};

const PRIORITY_W: Record<string, number> = { "高": 15, "中": 8, "低": 3 };

export interface PriorityBreakdown {
  score: number;
  parts: { label: string; value: number }[];
}

export function computePriority(o: Opportunity, now = Date.now()): PriorityBreakdown {
  const statusScore = STATUS_W[o.status] ?? 0;
  const budgetScore = Math.min(20, Math.log10(Math.max(1, o.event.budget)) * 3.5);
  const matchScore = (o.matchScore / 100) * 15;
  const priorityScore = PRIORITY_W[o.priority] ?? 0;

  // 活动临近度：<7天 +20，<30天 +12，<60天 +6，其余 0；已过期 -5
  const eventTs = new Date(o.event.date).getTime();
  const daysToEvent = (eventTs - now) / 86_400_000;
  let eventScore = 0;
  if (daysToEvent < 0) eventScore = -5;
  else if (daysToEvent < 7) eventScore = 20;
  else if (daysToEvent < 30) eventScore = 12;
  else if (daysToEvent < 60) eventScore = 6;

  // 跟进静默：>3天 +10，>1天 +5，其余 0
  const daysSince = (now - new Date(o.lastFollowUpAt).getTime()) / 86_400_000;
  let silenceScore = 0;
  if (daysSince > 3) silenceScore = 10;
  else if (daysSince > 1) silenceScore = 5;

  const score =
    statusScore + budgetScore + matchScore + priorityScore + eventScore + silenceScore;

  return {
    score: Math.round(score * 10) / 10,
    parts: [
      { label: "状态", value: Math.round(statusScore * 10) / 10 },
      { label: "预算", value: Math.round(budgetScore * 10) / 10 },
      { label: "AI 匹配", value: Math.round(matchScore * 10) / 10 },
      { label: "优先级", value: priorityScore },
      { label: "临近度", value: eventScore },
      { label: "跟进静默", value: silenceScore },
    ],
  };
}

export function priorityLevel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "紧急", color: "#F5222D" };
  if (score >= 55) return { label: "优先", color: "#FA8C16" };
  if (score >= 35) return { label: "常规", color: "#6E59F5" };
  return { label: "观察", color: "#8B92A8" };
}