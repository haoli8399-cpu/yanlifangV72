import { Avatar, Button, Space, Tooltip, Typography } from "antd";
import { HolderOutlined, PushpinFilled, PushpinOutlined } from "@ant-design/icons";
import type { Opportunity } from "../types";
import { PriorityTag, StatusTag } from "./StatusTag";
import { relativeTime, wan } from "./formatters";
import { computePriority, priorityLevel } from "../utils/opportunityPriority";

const STATUS_LABELS: Record<string, string> = {
  新需求: "新线索",
  有效商机: "需求确认",
  已报价: "已报价",
  谈判中: "谈判中",
  等待客户确认: "等待确认",
  已成交: "已成交",
  已丢单: "已丢单",
};

interface Props {
  opportunity: Opportunity;
  active?: boolean;
  onClick?: () => void;
  pinned?: boolean;
  onPin?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
  dragging?: boolean;
  showPriorityScore?: boolean;
}

export function OpportunityCard({
  opportunity: o,
  active,
  onClick,
  pinned,
  onPin,
  dragHandleProps,
  dragging,
  showPriorityScore,
}: Props) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const priority = showPriorityScore ? computePriority(o) : null;
  const level = priority ? priorityLevel(priority.score) : null;
  const partsText = priority
    ? priority.parts.map((p) => `${p.label} ${p.value >= 0 ? "+" : ""}${p.value}`).join(" · ")
    : "";
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "var(--yl-space-3)",
        borderRadius: "var(--yl-radius-md)",
        border: `1px solid ${active ? "var(--yl-primary)" : pinned ? "var(--yl-warning-border)" : "var(--yl-border-default)"}`,
        background: active ? "var(--yl-primary-subtle)" : "var(--yl-bg-surface)",
        boxShadow: dragging
          ? "0 12px 24px rgba(26,29,46,0.18)"
          : active
          ? "var(--yl-shadow-lg)"
          : "none",
        transition: "all .18s ease",
        position: "relative",
        opacity: dragging ? 0.9 : 1,
      }}
    >
      {pinned && (
        <PushpinFilled
          style={{ position: "absolute", top: "var(--yl-space-2)", right: "var(--yl-space-2)", color: "var(--yl-warning)", fontSize: "var(--yl-font-caption)" }}
        />
      )}
      <Space orientation="vertical" size={8} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space size={8}>
            {dragHandleProps && (
              <span
                {...dragHandleProps}
                onClick={stop}
                style={{ cursor: "grab", color: "var(--yl-text-tertiary)", fontSize: "var(--yl-font-body-md)", display: "inline-flex", touchAction: "none" }}
                title="拖拽调整顺序"
              >
                <HolderOutlined />
              </span>
            )}
            <Avatar size={28} style={{ background: o.customer.avatarColor, fontSize: "var(--yl-font-caption)" }}>
              {o.customer.companyName.slice(0, 1)}
            </Avatar>
            <Typography.Text strong>{o.customer.companyName}</Typography.Text>
          </Space>
          <StatusTag status={o.status} label={STATUS_LABELS[o.status] || o.status} />
        </Space>
        <Typography.Text style={{ fontSize: "var(--yl-font-body-sm)", color: "var(--yl-text-secondary)" }}>
          {o.event.type} · {o.event.headcount}人 · {o.event.date}
        </Typography.Text>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Text style={{ fontSize: "var(--yl-font-caption)", color: "var(--yl-text-tertiary)" }}>
            预算 <span style={{ color: "var(--yl-text-primary)", fontWeight: 600 }}>{wan(o.event.budget)}</span>
          </Typography.Text>
          <PriorityTag priority={o.priority} />
        </Space>
        <Typography.Text style={{ fontSize: "var(--yl-font-caption)", color: "var(--yl-text-tertiary)" }}>
          最近跟进 · {relativeTime(o.lastFollowUpAt)} · {o.ownerName}
        </Typography.Text>
        {priority && level && (
          <Tooltip title={partsText}>
            <div
              onClick={stop}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--yl-space-2)",
                padding: "var(--yl-space-1) var(--yl-space-2)",
                background: "var(--yl-bg-page)",
                borderRadius: "var(--yl-radius-sm)",
                border: "1px solid var(--yl-border-subtle)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 4, background: level.color }} />
              <Typography.Text style={{ fontSize: "var(--yl-font-caption)", color: level.color, fontWeight: 600 }}>
                {level.label}
              </Typography.Text>
              <Typography.Text style={{ fontSize: "var(--yl-font-caption)", color: "var(--yl-text-tertiary)" }}>
                权重 {priority.score}
              </Typography.Text>
              <div style={{ flex: 1 }} />
              {onPin && (
                <Tooltip title={pinned ? "取消置顶" : "置顶"}>
                  <Button
                    size="small"
                    type="text"
                    icon={pinned ? <PushpinFilled style={{ color: "var(--yl-warning)" }} /> : <PushpinOutlined />}
                    onClick={onPin}
                  />
                </Tooltip>
              )}
            </div>
          </Tooltip>
        )}
        {!priority && onPin && (
          <div onClick={stop} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title={pinned ? "取消置顶" : "置顶"}>
              <Button
                size="small"
                type="text"
                icon={pinned ? <PushpinFilled style={{ color: "var(--yl-warning)" }} /> : <PushpinOutlined />}
                onClick={onPin}
              />
            </Tooltip>
          </div>
        )}
      </Space>
    </div>
  );
}