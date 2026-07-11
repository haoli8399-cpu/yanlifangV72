import { createFileRoute } from "@tanstack/react-router";
import { Badge, Card, Col, Input, Progress, Row, Segmented, Space, Statistic, Table, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { orders, type OrderRecord } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "订单与合同 · 演立方 Admin" }] }),
  component: OrdersPage,
});

const statusColor: Record<OrderRecord["status"], string> = {
  待签约: "orange",
  已签约: "blue",
  履约中: "purple",
  已完成: "green",
  已退款: "red",
};

function OrdersPage() {
  const [tab, setTab] = useState<"全部" | OrderRecord["status"]>("全部");
  const [kw, setKw] = useState("");
  const list = useMemo(
    () => orders.filter((o) => (tab === "全部" || o.status === tab) && (!kw || o.customerName.includes(kw) || o.code.toLowerCase().includes(kw.toLowerCase()))),
    [tab, kw],
  );

  const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
  const totalPaid = orders.reduce((s, o) => s + o.paidAmount, 0);
  const totalPayable = orders.reduce((s, o) => s + o.supplierPayable - o.supplierPaid, 0);
  const activeOrders = orders.filter((o) => o.status === "履约中" || o.status === "已签约").length;

  return (
    <div style={{ padding: "var(--yl-space-6)", display: "flex", flexDirection: "column", gap: "var(--yl-space-4)" }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>订单与合同</Typography.Title>
        <Typography.Text type="secondary">合同 → 收款 → 履约 → 结算的全生命周期。财务对账入口。</Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="订单总额" value={totalAmount} formatter={(v) => yuan(Number(v))} styles={{ content: { color: "var(--yl-primary)" } }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已收客户款" value={totalPaid} formatter={(v) => yuan(Number(v))} styles={{ content: { color: "var(--yl-success)" } }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待付供应商" value={totalPayable} formatter={(v) => yuan(Number(v))} styles={{ content: { color: "var(--yl-warning)" } }} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中订单" value={activeOrders} suffix="单" /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: "var(--yl-space-4)", width: "100%", justifyContent: "space-between" }}>
          <Segmented value={tab} onChange={(v) => setTab(v as typeof tab)} options={["全部", "待签约", "已签约", "履约中", "已完成", "已退款"]} />
          <Input allowClear prefix={<SearchOutlined />} placeholder="搜索订单号 / 客户" value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 260 }} />
        </Space>
        <Table<OrderRecord>
          rowKey="id"
          dataSource={list}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: "订单号", dataIndex: "code", width: 160, render: (v) => <code>{v}</code> },
            { title: "客户", dataIndex: "customerName", width: 140 },
            { title: "活动", dataIndex: "eventType" },
            { title: "活动日", dataIndex: "eventDate", width: 110 },
            { title: "金额", dataIndex: "amount", width: 120, align: "right", render: (v: number) => yuan(v) },
            {
              title: "收款进度", width: 160,
              render: (_, r) => {
                const pct = r.amount ? Math.round((r.paidAmount / r.amount) * 100) : 0;
                return <div><Progress percent={pct} size="small" showInfo={false} strokeColor={pct === 100 ? "var(--yl-success)" : "var(--yl-info)"} /><div style={{ fontSize: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)" }}>{yuan(r.paidAmount)} / {yuan(r.amount)}</div></div>;
              },
            },
            { title: "供应商应付", width: 130, align: "right", render: (_, r) => <span style={{ color: r.supplierPaid < r.supplierPayable ? "var(--yl-warning)" : "var(--yl-text-secondary)" }}>{yuan(r.supplierPayable - r.supplierPaid)}</span> },
            { title: "开票", dataIndex: "invoiceStatus", width: 90, render: (v: string) => <StatusTag status={v} /> },
            { title: "合同号", dataIndex: "contractNo", width: 130, render: (v) => v || <Typography.Text type="secondary">未签</Typography.Text> },
            { title: "负责人", dataIndex: "owner", width: 90 },
            { title: "状态", dataIndex: "status", width: 100, render: (v: OrderRecord["status"]) => <Badge color={statusColor[v]} text={v} /> },
          ]}
        />
      </Card>
    </div>
  );
}