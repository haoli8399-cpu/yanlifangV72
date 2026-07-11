import { Card, Col, Row, Space, Typography } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { funnelData, trend30d } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";

interface FunnelBarDatum {
  name: string;
  value: number;
  rate: number;
}

const funnelChartData: FunnelBarDatum[] = funnelData.map((item, index) => ({
  name: item.stage,
  value: item.value,
  rate: index === 0 ? 100 : Math.round((item.value / funnelData[index - 1].value) * 100),
}));

export function GMVTrendChart() {
  return (
    <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }} title={
      <Space direction="vertical" size={0}>
        <Typography.Text strong>近 30 天 GMV 趋势</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>单位：元 · 每日汇总成交金额</Typography.Text>
      </Space>
    }>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trend30d}>
          <defs>
            <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B4FD6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5B4FD6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#8B92A8" }}
            axisLine={{ stroke: "#EEF0F5" }}
            tickLine={{ stroke: "#EEF0F5" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8B92A8" }}
            axisLine={{ stroke: "#EEF0F5" }}
            tickLine={{ stroke: "#EEF0F5" }}
            tickFormatter={(value: number) => yuan(value)}
          />
          <Tooltip
            formatter={(value: number) => [`¥${value.toLocaleString()}`, "GMV"]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EF",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="gmv"
            stroke="#5B4FD6"
            strokeWidth={2}
            fill="url(#gmvGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#5B4FD6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

function FunnelTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FunnelBarDatum }> }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EF",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 8px 24px rgba(15, 18, 34, 0.08)",
      }}
    >
      <div style={{ fontWeight: 600, color: "#0F1222", marginBottom: 4 }}>{item.name}</div>
      <div style={{ color: "#5B6178", fontSize: 12 }}>数量：{item.value} 单</div>
      <div style={{ color: item.rate >= 60 ? "#00B96B" : item.rate >= 40 ? "#FA8C16" : "#ef4444", fontSize: 12 }}>
        阶段转化：{item.rate}%
      </div>
    </div>
  );
}

export function ConversionFunnelChart() {
  return (
    <Card style={{ borderRadius: 12, boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-default)" }} title={
      <Space direction="vertical" size={0}>
        <Typography.Text strong>转化漏斗</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>近 30 天 · 线索→报价→成交</Typography.Text>
      </Space>
    }>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart layout="vertical" data={funnelChartData} margin={{ left: 18, right: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#8B92A8" }}
            axisLine={{ stroke: "#EEF0F5" }}
            tickLine={{ stroke: "#EEF0F5" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fontSize: 12, fill: "#0F1222", fontWeight: 500 }}
            axisLine={{ stroke: "#EEF0F5" }}
            tickLine={{ stroke: "#EEF0F5" }}
          />
          <Tooltip content={<FunnelTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {funnelChartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? "#5B4FD6" : `rgba(91, 79, 214, ${0.85 - index * 0.1})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default function DashboardCharts() {
  return (
    <Row gutter={16}>
      <Col span={16}>
        <GMVTrendChart />
      </Col>
      <Col span={8}>
        <ConversionFunnelChart />
      </Col>
    </Row>
  );
}
