import { createFileRoute } from "@tanstack/react-router";
import { Card, Col, Empty, Row, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { RobotFilled } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  getFeedback,
  subscribeFeedback,
  type AIFeedbackEntry,
  type FeedbackKind,
} from "../shared/mock/feedbackLog";
import { opportunities } from "../shared/mock/data";
import { relativeTime } from "../shared/components/formatters";

export const Route = createFileRoute("/supplier/feedback")({
  component: FeedbackCenter,
});

const KIND_COLOR: Record<FeedbackKind, string> = {
  需求识别: "blue",
  方案推荐: "purple",
  报价: "orange",
  艺人推荐: "gold",
};

function FeedbackCenter() {
  const [items, setItems] = useState<AIFeedbackEntry[]>(getFeedback());

  useEffect(() => subscribeFeedback(() => setItems(getFeedback())), []);

  const stats = useMemo(() => {
    const byKind: Record<FeedbackKind, { total: number; positive: number }> = {
      需求识别: { total: 0, positive: 0 },
      方案推荐: { total: 0, positive: 0 },
      报价: { total: 0, positive: 0 },
      艺人推荐: { total: 0, positive: 0 },
    };
    for (const it of items) {
      byKind[it.kind].total += 1;
      if (it.positive) byKind[it.kind].positive += 1;
    }
    return byKind;
  }, [items]);

  const oppMap = useMemo(() => Object.fromEntries(opportunities.map((o) => [o.id, o])), []);

  const columns: TableColumnsType<AIFeedbackEntry> = [
    { title: "时间", dataIndex: "time", render: (t: string) => relativeTime(t), width: 110 },
    {
      title: "类型",
      dataIndex: "kind",
      render: (k: FeedbackKind) => <Tag color={KIND_COLOR[k]}>{k}</Tag>,
      width: 110,
    },
    {
      title: "维度",
      dataIndex: "dimension",
      render: (d: string, r) => (
        <Space>
          <span>{d}</span>
          <Tag color={r.positive ? "green" : "red"} style={{ borderRadius: 4 }}>
            {r.positive ? "✓ 认可" : "✗ 需改进"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "商机",
      dataIndex: "opportunityId",
      render: (id: string) => {
        const o = oppMap[id];
        return o ? (
          <span>
            <Tag color="purple">{o.code}</Tag>
            {o.customer.companyName}
          </span>
        ) : (
          <span style={{ color: "#8B92A8" }}>{id}</span>
        );
      },
    },
    { title: "运营", dataIndex: "operator", width: 100 },
    { title: "补充说明", dataIndex: "note", render: (n?: string) => n ?? <span style={{ color: "#B5B9C9" }}>—</span> },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {(Object.keys(stats) as FeedbackKind[]).map((k) => {
          const s = stats[k];
          const rate = s.total === 0 ? 0 : Math.round((s.positive / s.total) * 100);
          return (
            <Col xs={12} md={6} key={k}>
              <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 12 }}>
                <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-body-sm)" }}>{k} 反馈</Typography.Text>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "var(--yl-text-display-md)", fontWeight: 700, color: "#6E59F5" }}>{s.total}</div>
                    <Tag color={rate >= 70 ? "green" : rate >= 40 ? "gold" : "red"}>
                      认可率 {rate}%
                    </Tag>
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>
                    ✓ {s.positive} · ✗ {s.total - s.positive}
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: 16 } }}
        title={
          <Space>
            <RobotFilled style={{ color: "#6E59F5" }} />
            <Typography.Text strong>AI 反馈日志</Typography.Text>
            <Tag color="purple">{items.length} 条</Tag>
          </Space>
        }
        extra={
          <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>
            用于每周 AI 模型优化 · 数据点会进入 RLHF 训练集
          </Typography.Text>
        }
      >
        {items.length === 0 ? (
          <Empty description="暂无反馈，去销售作战台点击方案下方按钮打分" />
        ) : (
          <Table<AIFeedbackEntry>
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 15 }}
            dataSource={items}
            columns={columns}
          />
        )}
      </Card>
    </div>
  );
}