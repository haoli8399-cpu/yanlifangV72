import { useState } from "react";
import { Button, Input, Popover, Space, Tag, Typography, message } from "antd";
import { CheckCircleFilled, LikeOutlined, MessageOutlined } from "@ant-design/icons";
import { addFeedback, type FeedbackKind } from "../mock/feedbackLog";

interface Dimension {
  key: string;
  label: string;
  positive?: boolean;
}

interface Props {
  kind: FeedbackKind;
  opportunityId: string;
  operator?: string;
  dimensions: Dimension[];
  compact?: boolean;
}

const kindColor: Record<FeedbackKind, string> = {
  需求识别: "#1677FF",
  方案推荐: "#6E59F5",
  报价: "#FA8C16",
  艺人推荐: "#D4A017",
};

export function AIFeedbackBar({ kind, opportunityId, operator = "张运营", dimensions, compact }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const submit = (d: Dimension) => {
    addFeedback({
      kind,
      dimension: d.label,
      positive: !!d.positive,
      opportunityId,
      operator,
    });
    setPicked(d.label);
    message.success(`已记录 AI ${kind} 反馈：${d.label}`);
  };

  const submitNote = () => {
    if (!note.trim()) return;
    addFeedback({
      kind,
      dimension: "补充说明",
      positive: false,
      opportunityId,
      operator,
      note: note.trim(),
    });
    message.success("补充意见已记录");
    setNote("");
    setNoteOpen(false);
  };

  return (
    <div
      style={{
        padding: compact ? "8px 10px" : "10px 12px",
        background: "#FAFBFD",
        border: "1px dashed #E5E7EF",
        borderRadius: 8,
      }}
    >
      <Space size={8} style={{ marginBottom: 8 }}>
        <Tag color={kindColor[kind]} style={{ borderRadius: 4, color: "#fff", border: "none", margin: 0 }}>
          AI {kind}
        </Tag>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {picked ? `已反馈：${picked}` : "帮我打个分（用于 AI 优化）"}
        </Typography.Text>
      </Space>
      <Space wrap size={6}>
        {dimensions.map((d) => (
          <Button
            key={d.key}
            size="small"
            type={picked === d.label ? "primary" : "default"}
            icon={d.positive ? <LikeOutlined /> : undefined}
            danger={!d.positive && picked !== d.label}
            onClick={() => submit(d)}
          >
            {d.label}
          </Button>
        ))}
        <Popover
          open={noteOpen}
          onOpenChange={setNoteOpen}
          trigger="click"
          title="补充意见"
          content={
            <div style={{ width: 260 }}>
              <Input.TextArea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例：客户明确要求全女性演员，AI 没识别到"
              />
              <Space style={{ marginTop: 8, width: "100%", justifyContent: "flex-end" }}>
                <Button size="small" onClick={() => setNoteOpen(false)}>取消</Button>
                <Button size="small" type="primary" icon={<CheckCircleFilled />} onClick={submitNote}>
                  记录
                </Button>
              </Space>
            </div>
          }
        >
          <Button size="small" type="text" icon={<MessageOutlined />}>
            补充
          </Button>
        </Popover>
      </Space>
    </div>
  );
}

// Preset dimension sets per PRD §9.2.4
export const FEEDBACK_PRESETS = {
  需求识别: [
    { key: "ok", label: "准确", positive: true },
    { key: "headcount", label: "人数错" },
    { key: "date", label: "日期错" },
    { key: "budget", label: "预算错" },
    { key: "type", label: "活动类型错" },
    { key: "scene", label: "场景错" },
  ],
  方案推荐: [
    { key: "ok", label: "合适", positive: true },
    { key: "sku", label: "方案不匹配" },
    { key: "tier", label: "级别不合适" },
    { key: "duration", label: "时长不合适" },
    { key: "count", label: "演员人数不合适" },
  ],
  报价: [
    { key: "ok", label: "合理", positive: true },
    { key: "high", label: "价格偏高" },
    { key: "low", label: "价格偏低" },
    { key: "margin", label: "毛利不足" },
  ],
  艺人推荐: [
    { key: "ok", label: "合适", positive: true },
    { key: "date", label: "档期不符" },
    { key: "tier", label: "咖位不符" },
    { key: "style", label: "风格不符" },
    { key: "trust", label: "信誉不足" },
  ],
} as const;