import type { OpportunityStatus } from "../types";

export type FeedbackKind = "需求识别" | "方案推荐" | "报价" | "艺人推荐";

export interface AIFeedbackEntry {
  id: string;
  time: string;
  kind: FeedbackKind;
  dimension: string;
  positive: boolean;
  opportunityId: string;
  note?: string;
  operator: string;
}

const listeners = new Set<() => void>();
const log: AIFeedbackEntry[] = [
  { id: "fb1", time: new Date(Date.now() - 3600_000 * 3).toISOString(), kind: "需求识别", dimension: "预算", positive: false, opportunityId: "o1", operator: "张运营", note: "AI 识别预算偏低" },
  { id: "fb2", time: new Date(Date.now() - 3600_000 * 6).toISOString(), kind: "方案推荐", dimension: "SKU 类型", positive: true, opportunityId: "o1", operator: "张运营" },
  { id: "fb3", time: new Date(Date.now() - 3600_000 * 9).toISOString(), kind: "艺人推荐", dimension: "档期", positive: false, opportunityId: "o2", operator: "李运营", note: "呼兰当日无档期" },
  { id: "fb4", time: new Date(Date.now() - 3600_000 * 24).toISOString(), kind: "报价", dimension: "毛利率", positive: false, opportunityId: "o3", operator: "张运营", note: "毛利率 < 25%" },
];

export function addFeedback(entry: Omit<AIFeedbackEntry, "id" | "time">) {
  log.unshift({ ...entry, id: `fb-${Date.now()}`, time: new Date().toISOString() });
  listeners.forEach((l) => l());
}

export function getFeedback(): AIFeedbackEntry[] {
  return log.slice();
}

export function subscribeFeedback(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============= Opportunity status transitions =============

export interface LostReason {
  category: "价格过高" | "档期不符" | "竞品胜出" | "客户预算变化" | "需求取消" | "其他";
  note?: string;
}

export interface StatusChange {
  id: string;
  opportunityId: string;
  from: OpportunityStatus;
  to: OpportunityStatus;
  time: string;
  operator: string;
  reason?: LostReason;
}

const statusLog: StatusChange[] = [];
const statusListeners = new Set<() => void>();

export function recordStatusChange(entry: Omit<StatusChange, "id" | "time">) {
  statusLog.unshift({ ...entry, id: `sc-${Date.now()}`, time: new Date().toISOString() });
  statusListeners.forEach((l) => l());
}

export function getStatusChanges(opportunityId?: string): StatusChange[] {
  return opportunityId ? statusLog.filter((s) => s.opportunityId === opportunityId) : statusLog.slice();
}

export function subscribeStatus(fn: () => void): () => void {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

// Allowed forward transitions per PRD §6.4
export const STATUS_TRANSITIONS: Record<OpportunityStatus, OpportunityStatus[]> = {
  新需求: ["有效商机", "已丢单"],
  有效商机: ["已报价", "已丢单"],
  已报价: ["谈判中", "等待客户确认", "已成交", "已丢单"],
  谈判中: ["等待客户确认", "已报价", "已成交", "已丢单"],
  等待客户确认: ["已成交", "谈判中", "已丢单"],
  已成交: [],
  已丢单: [],
};