import { useState } from "react";
import { Button, Divider, Dropdown, Input, Modal, Radio, Space, Steps, Tag, Typography, message } from "antd";
import { CheckCircleFilled, CloseCircleOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons";
import type { OpportunityStatus } from "../types";
import { STATUS_TRANSITIONS, recordStatusChange, type LostReason } from "../mock/feedbackLog";
import { StatusTag } from "./StatusTag";

const FLOW: OpportunityStatus[] = [
  "新需求",
  "有效商机",
  "已报价",
  "谈判中",
  "等待客户确认",
  "已成交",
];

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
  opportunityId: string;
  current: OpportunityStatus;
  operator?: string;
  onChange?: (next: OpportunityStatus, reason?: LostReason) => void;
}

const LOST_CATEGORIES: LostReason["category"][] = [
  "价格过高",
  "档期不符",
  "竞品胜出",
  "客户预算变化",
  "需求取消",
  "其他",
];

export function OpportunityStatusFlow({ opportunityId, current, operator = "张运营", onChange }: Props) {
  const [status, setStatus] = useState<OpportunityStatus>(current);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState<LostReason["category"]>("价格过高");
  const [lostNote, setLostNote] = useState("");

  const allowed = STATUS_TRANSITIONS[status] ?? [];
  const currentIdx = FLOW.indexOf(status);

  const doTransition = (next: OpportunityStatus, reason?: LostReason) => {
    recordStatusChange({ opportunityId, from: status, to: next, operator, reason });
    setStatus(next);
    onChange?.(next, reason);
    message.success(`商机状态更新为「${STATUS_LABELS[next] ?? next}」`);
  };

  const handleClick = (next: OpportunityStatus) => {
    if (next === "已丢单") {
      setLostOpen(true);
      return;
    }
    doTransition(next);
  };

  const confirmLost = () => {
    doTransition("已丢单", { category: lostReason, note: lostNote.trim() || undefined });
    setLostOpen(false);
    setLostNote("");
  };

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: "#FFFFFF",
        border: "1px solid #E5E7EF",
      }}
    >
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <Space size={8}>
          <Typography.Text strong>商机状态</Typography.Text>
          <StatusTag status={status} label={STATUS_LABELS[status]} />
        </Space>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          按 PRD §6.4 状态机流转
        </Typography.Text>
      </Space>

      <Steps
        size="small"
        current={currentIdx === -1 ? 0 : currentIdx}
        status={status === "已丢单" ? "error" : currentIdx === FLOW.length - 1 ? "finish" : "process"}
        items={FLOW.map((s) => ({ title: STATUS_LABELS[s] ?? s }))}
      />

      <Divider style={{ margin: "14px 0 12px" }} />

      {allowed.length === 0 ? (
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          终态：{STATUS_LABELS[status] ?? status}，不可再流转
        </Typography.Text>
      ) : (
        <Space wrap size={8}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            可流转至：
          </Typography.Text>
          {allowed
            .filter((next) => next !== "已丢单")
            .map((next) => (
            <Button
              key={next}
              size="small"
              type={next === "已成交" ? "primary" : "default"}
              icon={next === "已成交" ? <CheckCircleFilled /> : <RightOutlined />}
              onClick={() => handleClick(next)}
            >
              {STATUS_LABELS[next] ?? next}
            </Button>
          ))}
          {allowed.includes("已丢单") && (
            <Dropdown menu={{ items: [{ key: "lost", label: "已丢单", danger: true, onClick: () => handleClick("已丢单") }] }}>
              <Button size="small" type="text" danger icon={<MoreOutlined />}>更多</Button>
            </Dropdown>
          )}
        </Space>
      )}

      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: "#F5222D" }} />
            <span>标记为已丢单 · 请填写丢单原因</span>
          </Space>
        }
        open={lostOpen}
        onCancel={() => setLostOpen(false)}
        onOk={confirmLost}
        okText="确认丢单"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
          按 PRD 要求：<Tag color="red">丢单原因记录率 100%</Tag>
          数据将用于每周复盘和 AI 推荐模型训练。
        </Typography.Paragraph>
        <Radio.Group
          value={lostReason}
          onChange={(e) => setLostReason(e.target.value)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {LOST_CATEGORIES.map((c) => (
            <Radio key={c} value={c}>
              {c}
            </Radio>
          ))}
        </Radio.Group>
        <Divider style={{ margin: "12px 0" }} />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          补充说明（可选）
        </Typography.Text>
        <Input.TextArea
          rows={3}
          value={lostNote}
          onChange={(e) => setLostNote(e.target.value)}
          placeholder="例如：客户对比后选择了另一家的价格方案"
          style={{ marginTop: 6 }}
        />
      </Modal>
    </div>
  );
}