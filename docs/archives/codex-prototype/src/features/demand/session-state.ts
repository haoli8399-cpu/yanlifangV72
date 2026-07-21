// Slice1 前端演示会话状态 —— 仅用于 UI/UX 原型主流程连通。
// 不与后端 API、幂等、状态机、Fixture 契约耦合；关闭浏览器会话即恢复初始状态。
import { useEffect, useState } from "react";

export type FlowPreference = "reference" | "preferred" | "only_consider";
export type FlowVenueStatus =
  | "unknown"
  | "searching"
  | "tentative"
  | "confirmed_by_customer";

export type FlowSource = {
  kind: "actor";
  actorId: string;
  actorName: string;
  preference: FlowPreference;
  preferenceLabel: "作为参考" | "优先考虑" | "仅考虑";
};

export type FlowForm = {
  event_type: string;
  event_type_label: string;
  event_goals: string[];
  venue_status: FlowVenueStatus;
  venue_status_label: string;
  content_constraints: string;
};

export type FlowReceipt = {
  receipt_id: string;
  occurred_at: string;
  effect_summary: string;
  next_step: string;
};

export type FlowSession = {
  createdAt: string;
  source: FlowSource | null;
  form: FlowForm | null;
  briefConfirmed: FlowReceipt | null;
  consentGranted: FlowReceipt | null;
};

const KEY = "yl-slice1-session";
const EVT = "yl-slice1-session-change";

function readRaw(): FlowSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FlowSession) : null;
  } catch {
    return null;
  }
}

export function getSession(): FlowSession | null {
  return readRaw();
}

export function setSession(patch: Partial<FlowSession>): FlowSession {
  const cur = readRaw() ?? {
    createdAt: new Date().toISOString(),
    source: null,
    form: null,
    briefConfirmed: null,
    consentGranted: null,
  };
  const next: FlowSession = { ...cur, ...patch };
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
  return next;
}

export function resetSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

/**
 * 客户端专用 hook：SSR 时返回 { session: null, hydrated: false }，
 * 避免 sessionStorage 造成 SSR/CSR 内容不一致（React #418）。
 */
export function useSession(): { session: FlowSession | null; hydrated: boolean } {
  const [state, setState] = useState<FlowSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setState(readRaw());
    setHydrated(true);
    const h = () => setState(readRaw());
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return { session: state, hydrated };
}

export function buildFlowReceipt(effect: string, next: string): FlowReceipt {
  return {
    receipt_id: "rcpt-local-" + Math.random().toString(36).slice(2, 10),
    occurred_at: new Date().toISOString(),
    effect_summary: effect,
    next_step: next,
  };
}

export const EVENT_TYPE_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "corp_annual", label: "企业年会 / 团建" },
  { code: "brand_activation", label: "品牌互动之夜" },
  { code: "internal_kickoff", label: "内部启动会暖场" },
  { code: "other", label: "其他" },
];

export const VENUE_STATUS_OPTIONS: Array<{ code: FlowVenueStatus; label: string }> = [
  { code: "unknown", label: "未知" },
  { code: "searching", label: "正在寻找" },
  { code: "tentative", label: "已初步锁定" },
  { code: "confirmed_by_customer", label: "客户已确认" },
];
