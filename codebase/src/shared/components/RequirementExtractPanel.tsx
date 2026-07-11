import { Alert, Button, Card, Input, Progress, Space, Tag, Typography } from "antd";
import { CheckCircleFilled, ExclamationCircleFilled, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { Opportunity } from "../types";

interface Props {
  opportunity: Opportunity;
  editable?: boolean;
  onConfirm?: (payload: { extracted: string[]; missingFilled: Record<string, string> }) => void;
  confirmed?: boolean;
}

export function RequirementExtractPanel({ opportunity: o, editable, onConfirm, confirmed }: Props) {
  const [editing, setEditing] = useState(false);
  const [extracted, setExtracted] = useState<string[]>(o.aiExtracted);
  const [fills, setFills] = useState<Record<string, string>>({});

  const updateTag = (idx: number, v: string) =>
    setExtracted((prev) => prev.map((t, i) => (i === idx ? v : t)));
  const removeTag = (idx: number) => setExtracted((prev) => prev.filter((_, i) => i !== idx));

  return (
    <Card
      title={
        <Space>
          <Typography.Text strong>AI 需求识别</Typography.Text>
          <Tag color="purple" style={{ borderRadius: 4 }}>
            匹配度 {o.matchScore}%
          </Tag>
          {confirmed && (
            <Tag color="green" icon={<CheckOutlined />} style={{ borderRadius: 4 }}>
              已确认
            </Tag>
          )}
        </Space>
      }
      extra={
        editable && !confirmed ? (
          <Button
            size="small"
            type={editing ? "primary" : "default"}
            icon={editing ? <CheckOutlined /> : <EditOutlined />}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "完成编辑" : "编辑"}
          </Button>
        ) : undefined
      }
      styles={{ body: { padding: 16 } }}
    >
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        {editable && !confirmed && (
          <Alert
            type="warning"
            showIcon
            message="请确认 AI 抽取的信息无误"
            description="点击「编辑」修改字段，或补充缺失项，再点「确认并匹配方案」。"
            style={{ background: "#FFF7E6", borderColor: "#FFE1A8" }}
          />
        )}
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            匹配度
          </Typography.Text>
          <Progress percent={o.matchScore} strokeColor={{ from: "#6E59F5", to: "#00B96B" }} size="small" />
        </div>
        <div>
          <Typography.Text strong style={{ fontSize: 13 }}>
            <CheckCircleFilled style={{ color: "#00B96B", marginRight: 6 }} />
            已识别信息
          </Typography.Text>
          <Space wrap size={6} style={{ marginTop: 8 }}>
            {extracted.map((s, i) =>
              editing ? (
                <Input
                  key={i}
                  size="small"
                  value={s}
                  style={{ width: 200 }}
                  onChange={(e) => updateTag(i, e.target.value)}
                  onBlur={(e) => !e.target.value && removeTag(i)}
                  suffix={<span style={{ cursor: "pointer", color: "#8B92A8" }} onClick={() => removeTag(i)}>×</span>}
                />
              ) : (
                <Tag key={`${s}-${i}`} color="green" style={{ borderRadius: 4 }}>
                  {s}
                </Tag>
              ),
            )}
            {extracted.length === 0 && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>暂无识别信息</Typography.Text>
            )}
          </Space>
        </div>
        <div>
          <Typography.Text strong style={{ fontSize: 13 }}>
            <ExclamationCircleFilled style={{ color: "#FA8C16", marginRight: 6 }} />
            缺失信息（建议追问）
          </Typography.Text>
          {o.aiMissing.length === 0 ? (
            <div style={{ marginTop: 6, fontSize: 13, color: "#8B92A8" }}>信息已齐全 ✓</div>
          ) : (
            <Space orientation="vertical" size={6} style={{ marginTop: 8, width: "100%" }}>
              {o.aiMissing.map((s) =>
                editable && !confirmed ? (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag color="orange" style={{ borderRadius: 4, marginRight: 0, minWidth: 72, textAlign: "center" }}>
                      {s}
                    </Tag>
                    <Input
                      size="small"
                      placeholder={`补充 ${s}`}
                      value={fills[s] ?? ""}
                      onChange={(e) => setFills((prev) => ({ ...prev, [s]: e.target.value }))}
                      style={{ flex: 1 }}
                    />
                  </div>
                ) : (
                  <Tag key={s} color="orange" style={{ borderRadius: 4 }}>
                    {s}
                  </Tag>
                ),
              )}
            </Space>
          )}
        </div>
        {editable && !confirmed && (
          <Button
            type="primary"
            block
            icon={<CheckOutlined />}
            onClick={() => onConfirm?.({ extracted, missingFilled: fills })}
          >
            确认无误，开始匹配方案
          </Button>
        )}
      </Space>
    </Card>
  );
}