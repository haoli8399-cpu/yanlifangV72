import { Tag, Timeline, Typography } from "antd";
import type { FollowUp } from "../types";
import { relativeTime } from "./formatters";

const actorColor: Record<string, string> = { 客户: "blue", 运营: "purple", AI: "gold" };

export function FollowUpTimeline({ items }: { items: FollowUp[] }) {
  if (items.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        暂无跟进记录
      </Typography.Text>
    );
  }
  return (
    <Timeline
      items={items.map((f) => ({
        color: f.actor === "AI" ? "gold" : f.actor === "运营" ? "purple" : "blue",
        children: (
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <Tag color={actorColor[f.actor]} style={{ borderRadius: 4, margin: 0 }}>
                {f.actor}
              </Tag>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {f.channel} · {relativeTime(f.time)}
              </Typography.Text>
            </div>
            <Typography.Text style={{ fontSize: 13 }}>{f.content}</Typography.Text>
          </div>
        ),
      }))}
    />
  );
}