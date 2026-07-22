import { Tag } from "antd";
import { statusColorMap } from "../theme";

export function StatusTag({ status, label }: { status: string; label?: string }) {
  const color = statusColorMap[status] ?? "default";
  return (
    <Tag color={color} style={{ margin: 0, fontWeight: 500, borderRadius: 4 }}>
      {label ?? status}
    </Tag>
  );
}

export function PriorityTag({ priority }: { priority: "高" | "中" | "低" }) {
  const map: Record<string, string> = { 高: "red", 中: "orange", 低: "default" };
  return (
    <Tag color={map[priority]} style={{ margin: 0, borderRadius: 4 }}>
      优先级·{priority}
    </Tag>
  );
}

export function ConfidenceTag({ level }: { level: "高" | "中" | "低" }) {
  const map: Record<string, string> = { 高: "green", 中: "gold", 低: "default" };
  return (
    <Tag color={map[level]} style={{ margin: 0, borderRadius: 4 }}>
      AI 置信度 · {level}
    </Tag>
  );
}