import { createFileRoute } from "@tanstack/react-router";
import { Card, Col, Progress, Row, Space, Table, Tag, Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { aggregateFeedback, skuHitMatrix } from "../shared/mock/admin";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/admin/ai-feedback")({
  head: () => ({ meta: [{ title: "AI 反馈 · 演立方 Admin" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const agg = aggregateFeedback();
  const kinds = Object.entries(agg.byKind);
  const dims = Object.entries(agg.byDim);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <RobotOutlined /> AI 反馈聚合
        </Typography.Title>
        <Typography.Text type="secondary">
          团队对 AI 的每一次「有用/无用」反馈，都会回流到 SKU 权重与推荐排序。此页展示训练数据健康度。
        </Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="全平台反馈总数">
            <Typography.Title level={2} style={{ margin: 0, color: "#6E59F5" }}>{agg.total}</Typography.Title>
            <Typography.Text type="secondary">累计带标签的 AI 反馈样本</Typography.Text>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="按能力维度分布（好评 / 差评）">
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              {kinds.map(([k, v]) => {
                const total = v.pos + v.neg;
                const pct = total ? Math.round((v.pos / total) * 100) : 0;
                return (
                  <div key={k}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--yl-text-body-sm)", marginBottom: 4 }}>
                      <b>{k}</b>
                      <span>好评率 <b>{pct}%</b> · <Tag color="green">+{v.pos}</Tag><Tag color="red">−{v.neg}</Tag></span>
                    </div>
                    <Progress percent={pct} showInfo={false} strokeColor={pct > 60 ? "#00B96B" : pct > 40 ? "#FA8C16" : "#F5222D"} />
                  </div>
                );
              })}
              {kinds.length === 0 && <Typography.Text type="secondary">暂无反馈。</Typography.Text>}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Bad Case 高频维度（Top）">
            <Table
              size="small"
              pagination={false}
              rowKey={(r) => r[0]}
              dataSource={dims.sort((a, b) => b[1].neg - a[1].neg).slice(0, 6)}
              columns={[
                { title: "维度", dataIndex: 0 },
                { title: "差评", width: 100, render: (_, r) => <Tag color="red">{(r as [string, { neg: number }])[1].neg}</Tag> },
                { title: "好评", width: 100, render: (_, r) => <Tag color="green">{(r as [string, { pos: number }])[1].pos}</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近反馈流水">
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={agg.recent}
              columns={[
                { title: "时间", dataIndex: "time", width: 120, render: (v: string) => new Date(v).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
                { title: "运营", dataIndex: "operator", width: 80 },
                { title: "能力", dataIndex: "kind", width: 90 },
                { title: "维度", dataIndex: "dimension", width: 100 },
                { title: "评价", dataIndex: "positive", width: 60, render: (v: boolean) => v ? <StatusTag status="好" /> : <StatusTag status="差" /> },
                { title: "备注", dataIndex: "note", ellipsis: true },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card title="SKU 命中率热力（推荐 → 采纳 → 成交）">
        <Table
          size="small"
          rowKey="sku"
          pagination={false}
          dataSource={skuHitMatrix}
          columns={[
            { title: "SKU", dataIndex: "sku", width: 150, render: (v) => <code>{v}</code> },
            { title: "方案", dataIndex: "name" },
            { title: "场景", dataIndex: "scene", width: 100 },
            { title: "AI 置信", dataIndex: "aiConfidence", width: 100, render: (v: string) => <StatusTag status={v} /> },
            { title: "推荐次数", dataIndex: "recommend", width: 100, align: "right" },
            { title: "采纳", dataIndex: "adopt", width: 100, align: "right", render: (v: number, r) => `${v} (${Math.round((v / r.recommend) * 100)}%)` },
            { title: "成交", dataIndex: "win", width: 100, align: "right", render: (v: number, r) => `${v} (${Math.round((v / r.recommend) * 100)}%)` },
          ]}
        />
      </Card>
    </div>
  );
}