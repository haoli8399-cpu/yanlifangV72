// Presentation-only mapping: internal MatchingSharedFieldKey → Chinese business label.
// Underlying field values, types, fixtures and request payloads are unchanged.

import type { MatchingSharedFieldKey } from "./types";

export const SHARED_FIELD_LABELS: Record<MatchingSharedFieldKey, string> = {
  event_type: "活动类型",
  event_goals: "活动目标",
  event_date: "活动日期",
  city: "活动城市",
  venue_status: "场地情况",
  audience_size: "观众规模",
  budget_range: "预算范围",
  service_need: "所需服务",
  content_constraints: "内容注意事项",
  source_intent: "感兴趣的演员或节目",
};

export function getSharedFieldLabel(key: MatchingSharedFieldKey): string {
  const label = SHARED_FIELD_LABELS[key];
  if (!label) {
    if (import.meta.env.DEV) {
      // Expose missing mapping loudly in development.
      console.error(
        `[demand] Missing Chinese label for MatchingSharedFieldKey="${key}". Please update SHARED_FIELD_LABELS.`,
      );
    }
    return "待补充信息";
  }
  return label;
}
