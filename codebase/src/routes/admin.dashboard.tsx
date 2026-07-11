import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Card, Col, Progress, Row, Skeleton, Space, Statistic, Table, Tag, Typography } from "antd";
import { ArrowUpOutlined, RobotOutlined } from "@ant-design/icons";
import { platformKpi } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";

const DashboardCharts = lazy(() => import("./-admin.dashboard.charts"));

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "平台大盘 · 演立方 Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const k = platformKpi;

  return (
    <div style={{ padding: "var(--yl-space-6)", display: "flex", flexDirection: "column", gap: "var(--yl-space-4)" }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>平台大盘</Typography.Title>
        <Typography.Text type="secondary">GMV、转化漏斗、AI 采纳率与团队表现 · 数据每 5 分钟刷新</Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Statistic title="本月成交额 (GMV)" value={k.monthGmv} formatter={(v) => yuan(Number(v))} styles={{ content: { color: "var(--yl-primary)" } }} />
            <Tag color="green" style={{ marginTop: 8 }}><ArrowUpOutlined /> {k.monthGmvDelta}% vs 上月</Tag>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Statistic title="本月成交单数" value={k.monthWins} suffix="单" styles={{ content: { color: "var(--yl-success)" } }} />
            <Tag color="green" style={{ marginTop: 8 }}><ArrowUpOutlined /> +{k.monthWinsDelta} vs 上月</Tag>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Statistic title="平均客单价" value={k.avgOrder} formatter={(v) => yuan(Number(v))} styles={{ content: { color: "var(--yl-info)" } }} />
            <Tag color="green" style={{ marginTop: 8 }}><ArrowUpOutlined /> {k.avgOrderDelta}%</Tag>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Statistic title="AI 方案采纳率" value={k.aiAdoptRate} suffix="%" prefix={<RobotOutlined />} styles={{ content: { color: "var(--yl-warning)" } }} />
            <Tag color="green" style={{ marginTop: 8 }}><ArrowUpOutlined /> +{k.aiAdoptDelta}pp</Tag>
          </Card>
        </Col>
      </Row>

      <ClientOnly fallback={<ChartsFallback />}>
        <Suspense fallback={<ChartsFallback />}>
          <DashboardCharts />
        </Suspense>
      </ClientOnly>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="关键健康指标" style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Space orientation="vertical" size={14} style={{ width: "100%" }}>
              <MiniGauge label="报价率" value={k.quotationRate} color="var(--yl-info)" />
              <MiniGauge label="成交率" value={k.winRate} color="var(--yl-success)" />
              <MiniGauge label="AI 采纳率" value={k.aiAdoptRate} color="var(--yl-primary)" />
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="平台规模" style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Row gutter={16}>
              <Col span={12}><Statistic title="活跃客户" value={k.activeCustomers} /></Col>
              <Col span={12}><Statistic title="在售艺人" value={k.activeArtists} /></Col>
            </Row>
            <Typography.Paragraph type="secondary" style={{ marginTop: "var(--yl-space-3)", marginBottom: 0, fontSize: "var(--yl-text-caption)" }}>
              过去 30 天有成交或询单行为的口径；含 KA 与自然流量。
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="销售 Leaderboard（本月）" style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }}>
            <Table
              size="small"
              pagination={false}
              rowKey="name"
              columns={[
                { title: "销售", dataIndex: "name" },
                { title: "成交", dataIndex: "wins", width: 70 },
                { title: "GMV", dataIndex: "gmv", render: (v: number) => yuan(v) },
              ]}
              dataSource={[
                { name: "张运营", wins: 18, gmv: 1420000 },
                { name: "李运营", wins: 15, gmv: 1180000 },
                { name: "王运营", wins: 11, gmv: 860000 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function ChartsFallback() {
  return (
    <Row gutter={16}>
      <Col span={16}>
        <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }} title={
          <Space direction="vertical" size={0}>
            <Typography.Text strong>近 30 天 GMV 趋势</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: "var(--yl-font-caption)" }}>单位：元 · 每日汇总成交金额</Typography.Text>
          </Space>
        }>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }} title={
          <Space direction="vertical" size={0}>
            <Typography.Text strong>转化漏斗</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: "var(--yl-font-caption)" }}>近 30 天 · 线索→报价→成交</Typography.Text>
          </Space>
        }>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </Col>
    </Row>
  );
}

function MiniGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--yl-text-body-sm)", marginBottom: 4 }}>
        <span>{label}</span>
        <b style={{ fontVariantNumeric: "tabular-nums", color }}>{value}%</b>
      </div>
      <Progress percent={value} showInfo={false} strokeColor={color} />
    </div>
  );
}
