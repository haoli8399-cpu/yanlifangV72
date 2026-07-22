import { Button, Card, Divider, Space, Tag, Tooltip, Typography } from "antd";
import { CheckCircleFilled, InfoCircleOutlined, StarFilled } from "@ant-design/icons";
import type { Solution } from "../types";
import { yuan } from "./formatters";
import { ConfidenceTag } from "./StatusTag";

const tierColor: Record<string, string> = {
  经济方案: "var(--yl-text-secondary)",
  推荐方案: "var(--yl-primary)",
  升级方案: "var(--yl-gold)",
};

const tierBgColor: Record<string, string> = {
  经济方案: "var(--yl-bg-sunken)",
  推荐方案: "var(--yl-primary-subtle)",
  升级方案: "var(--yl-warning-bg)",
};

interface Props {
  solution: Solution;
  onGetQuote?: (s: Solution) => void;
  onView?: (s: Solution) => void;
  showCost?: boolean;
  highlight?: boolean;
  compact?: boolean;
}

export function SolutionCard({ solution: s, onGetQuote, onView, showCost, highlight, compact = false }: Props) {
  return (
    <Card
      hoverable
      style={{
        borderColor: highlight ? tierColor[s.tier] : "var(--yl-border-subtle)",
        borderWidth: highlight ? 2 : 1,
        boxShadow: highlight ? "var(--yl-shadow-lg)" : "var(--yl-shadow-sm)",
        borderRadius: "var(--yl-radius-lg)",
        transition: "all var(--yl-duration-fast) var(--yl-ease-default)",
      }}
      styles={{ body: { padding: compact ? "var(--yl-space-4)" : "var(--yl-space-5)" } }}
    >
      <Space orientation="vertical" size={compact ? 8 : 12} style={{ width: "100%" }}>
        <Space wrap size={8}>
          <Tag style={{ borderRadius: "var(--yl-radius-sm)", backgroundColor: tierBgColor[s.tier], color: tierColor[s.tier], border: "none", font: "var(--yl-text-caption)", padding: "var(--yl-space-1) var(--yl-space-2)" }}>
            {s.tier}
          </Tag>
          <ConfidenceTag level={s.aiConfidence} />
        </Space>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography.Title level={compact ? 5 : 4} style={{ margin: 0, font: compact ? "var(--yl-text-heading-3)" : "var(--yl-text-heading-2)", color: "var(--yl-text-primary)" }}>
            {s.name}
          </Typography.Title>
          {s.recommendScore && (
            <div style={{ display: "flex", alignItems: "center", gap: 2, font: "var(--yl-text-caption)", color: "var(--yl-gold)" }}>
              <StarFilled style={{ fontSize: "var(--yl-space-3)" }} />
              {s.recommendScore}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--yl-space-3)", font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
          <span>👥 {s.headcountRange[0]}-{s.headcountRange[1]}人</span>
          <span>⏱ {s.durationMinutes}分钟</span>
        </div>

        {!compact && (
          <Typography.Text style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
            SKU · {s.sku}
          </Typography.Text>
        )}

        <Typography.Paragraph
          ellipsis={compact ? { rows: 2 } : false}
          style={{ margin: 0, font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)", lineHeight: 1.6 }}
        >
          {s.description}
        </Typography.Paragraph>

        {!compact && (
          <div style={{ background: "var(--yl-bg-page)", borderRadius: "var(--yl-radius-md)", padding: "var(--yl-space-3)" }}>
            <Typography.Text strong style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-text-primary)" }}>
              艺人配置
            </Typography.Text>
            <div style={{ marginTop: "var(--yl-space-2)", display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
              {s.items.map((it) => (
                <div key={it.artistId} style={{ display: "flex", justifyContent: "space-between", font: "var(--yl-text-body-sm)" }}>
                  <span style={{ color: "var(--yl-text-primary)" }}>
                    {it.artistName} <span style={{ color: "var(--yl-text-tertiary)" }}>· {it.category}</span>
                  </span>
                  <span style={{ color: "var(--yl-text-tertiary)" }}>{it.duration} 分钟</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {s.aiReason && (
          <div
            style={{
              background: "var(--yl-bg-ai)",
              borderRadius: "var(--yl-radius-md)",
              padding: "var(--yl-space-3)",
              border: "1px solid var(--yl-border-ai)",
            }}
          >
            <Space size={8} align="start">
              <InfoCircleOutlined style={{ color: "var(--yl-primary)", fontSize: 14, marginTop: 1 }} />
              <div>
                <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-primary)", marginBottom: "var(--yl-space-1)" }}>AI 推荐</div>
                <Typography.Text style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)", lineHeight: 1.5 }}>
                  {s.aiReason}
                </Typography.Text>
              </div>
            </Space>
          </div>
        )}

        <Divider style={{ margin: "var(--yl-space-3) 0", borderColor: "var(--yl-border-subtle)" }} />

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <Typography.Text style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
              方案价
            </Typography.Text>
            <div style={{ font: "var(--yl-text-numeric-md)", fontWeight: 700, color: tierColor[s.tier], fontVariantNumeric: "tabular-nums" }}>
              {yuan(s.price)}
            </div>
            {showCost && (
              <Typography.Text style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                成本 {yuan(s.cost)} · 毛利 <span style={{ color: "var(--yl-success)" }}>{yuan(s.grossProfit)}</span>
              </Typography.Text>
            )}
          </div>
          <Space size={8}>
            {onView && <Button onClick={() => onView(s)} style={{ borderRadius: "var(--yl-radius-md)", height: 32, font: "var(--yl-text-body-sm)" }}>查看详情</Button>}
            {onGetQuote && (
              <Tooltip title="生成正式报价单">
                <Button type="primary" icon={<CheckCircleFilled />} onClick={() => onGetQuote(s)} style={{ borderRadius: "var(--yl-radius-md)", height: 32, font: "var(--yl-text-body-sm)" }}>
                  获取方案
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  );
}