import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Avatar, Button, Card, Space, Table, Tag, Tooltip, Typography } from "antd";
import { ClockCircleOutlined, EyeOutlined, EyeInvisibleOutlined, CheckCircleFilled } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { opportunities, quotations } from "../shared/mock/data";
import { StatusTag } from "../shared/components/StatusTag";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/supplier/quotations/")({
  component: QuotationList,
});

function expiryTag(validUntil?: string) {
  if (!validUntil) return <Tag>无期限</Tag>;
  const remain = (new Date(validUntil).getTime() - Date.now()) / 3600000;
  if (remain <= 0) return <Tag color="red" icon={<ClockCircleOutlined />}>已过期 {Math.round(-remain)}h</Tag>;
  if (remain <= 48) return <Tag color="orange" icon={<ClockCircleOutlined />}>剩 {Math.round(remain)}h 到期</Tag>;
  return <Tag color="green" icon={<ClockCircleOutlined />}>{Math.round(remain / 24)} 天有效</Tag>;
}

function receiptTag(q: (typeof quotations)[number]) {
  if (q.customerConfirmStatus === "已确认") return <Tag color="green" icon={<CheckCircleFilled />}>客户已确认</Tag>;
  if (q.customerConfirmStatus === "已拒绝") return <Tag color="red">客户已拒</Tag>;
  if (q.readAt) return (
    <Tooltip title={`已阅：${new Date(q.readAt).toLocaleString("zh-CN")}`}>
      <Tag color="blue" icon={<EyeOutlined />}>已阅未回</Tag>
    </Tooltip>
  );
  if (q.sentAt) return <Tag icon={<EyeInvisibleOutlined />}>已发送未读</Tag>;
  return <Tag>草稿</Tag>;
}

function QuotationList() {
  const nav = useNavigate();

  const rows = quotations.map((q) => {
    const cur = q.versions.find((v) => v.version === q.currentVersion) ?? q.versions[0]!;
    const opp = opportunities.find((o) => o.id === q.opportunityId);
    return { q, cur, opp };
  });

  const columns: TableColumnsType<(typeof rows)[number]> = [
    { title: "报价编号", render: (_, r) => <Tag color="purple">{r.q.code}</Tag>, width: 140 },
    {
      title: "客户",
      render: (_, r) => (
        <Space size="var(--yl-space-2)">
          <Avatar size={28} style={{ background: r.opp?.customer.avatarColor ?? "var(--yl-primary)", fontSize: "var(--yl-text-caption)" }}>
            {r.q.customerName.slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.q.customerName}</div>
            <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{r.q.eventType}</div>
          </div>
        </Space>
      ),
    },
    { title: "方案", render: (_, r) => r.cur.solutionName },
    { title: "当前版本", render: (_, r) => <Tag color="geekblue">{r.q.currentVersion} · 共{r.q.versions.length}版</Tag>, width: 130 },
    { title: "最终报价", render: (_, r) => <span style={{ color: "var(--yl-primary)", fontWeight: 700 }}>{yuan(r.cur.finalPrice)}</span>, width: 130 },
    { title: "毛利", render: (_, r) => <span style={{ color: "var(--yl-success)" }}>{yuan(r.cur.finalPrice - r.cur.totalCost)}</span>, width: 110 },
    { title: "状态", render: (_, r) => <StatusTag status={r.q.status} />, width: 120 },
    { title: "有效期", render: (_, r) => expiryTag(r.q.validUntil), width: 150 },
    { title: "客户回执", render: (_, r) => receiptTag(r.q), width: 150 },
    {
      title: "操作",
      width: 100,
      render: (_, r) => (
        <Button size="small" type="link" onClick={() => nav({ to: "/supplier/quotations/$id", params: { id: r.q.id } })}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "var(--yl-space-5)" }}>
      <Card
        style={{ borderRadius: "var(--yl-radius-lg)" }}
        styles={{ body: { padding: "var(--yl-space-4)" } }}
        title={
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>报价管理</Typography.Title>
            <Tag color="purple">{rows.length} 份</Tag>
          </Space>
        }
      >
        <Table<(typeof rows)[number]>
          rowKey={(r) => r.q.id}
          dataSource={rows}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  );
}