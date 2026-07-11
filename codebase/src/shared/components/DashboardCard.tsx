import { Card, Space, Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { DashboardMetric } from "../types";

const toneMap: Record<string, string> = {
  primary: "var(--yl-primary)",
  success: "var(--yl-success)",
  warning: "var(--yl-warning)",
  info: "var(--yl-info)",
};

export function DashboardCard({ metric, subLabel }: { metric: DashboardMetric; subLabel?: string }) {
  const color = toneMap[metric.tone];
  const Arrow = metric.trend === "up" ? ArrowUpOutlined : metric.trend === "down" ? ArrowDownOutlined : null;
  return (
    <Card styles={{ body: { padding: "var(--yl-space-4)" } }} style={{ borderRadius: "var(--yl-radius-lg)", borderColor: "var(--yl-border-default)" }}>
      <Space orientation="vertical" size={4} style={{ width: "100%" }}>
        <Typography.Text style={{ fontSize: "var(--yl-font-body-sm)", color: "var(--yl-text-secondary)" }}>
          {metric.label}
        </Typography.Text>
        <Typography.Title level={2} style={{ margin: 0, color, fontVariantNumeric: "tabular-nums" }}>
          {metric.value}
          {subLabel && (
            <Typography.Text style={{ display: "block", fontSize: 12, color: "var(--yl-text-tertiary)", fontWeight: 400, marginTop: 2 }}>
              {subLabel}
            </Typography.Text>
          )}
        </Typography.Title>
        <Typography.Text style={{ color: metric.trend === "down" ? "var(--yl-error)" : "var(--yl-success)", fontSize: "var(--yl-font-caption)" }}>
          {Arrow ? <Arrow /> : null} {metric.delta} · 环比昨日
        </Typography.Text>
      </Space>
    </Card>
  );
}