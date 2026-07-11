import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Card, Descriptions, Drawer, Input, Progress, Segmented, Space, Table, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { customerAccounts, type CustomerAccount, type KaLevel } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "企业客户 · 演立方 Admin" }] }),
  component: CustomersPage,
});

const kaColor: Record<KaLevel, string> = {
  "S · 战略": "purple",
  "A · 重点": "geekblue",
  "B · 常规": "blue",
  "C · 长尾": "default",
};

function CustomersPage() {
  const [level, setLevel] = useState<"全部" | KaLevel>("全部");
  const [kw, setKw] = useState("");
  const [detail, setDetail] = useState<CustomerAccount | null>(null);

  const list = useMemo(
    () => customerAccounts.filter((c) => (level === "全部" || c.kaLevel === level) && (!kw || c.companyName.includes(kw) || c.contactName.includes(kw) || c.industry.includes(kw))),
    [level, kw],
  );

  return (
    <div style={{ padding: "var(--yl-space-6)", display: "flex", flexDirection: "column", gap: "var(--yl-space-4)" }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>企业客户 / KA</Typography.Title>
        <Typography.Text type="secondary">按 KA 分级管理客户账户、联系人、信用额度与开票信息</Typography.Text>
      </Space>

      <Card>
        <Space style={{ marginBottom: "var(--yl-space-4)", width: "100%", justifyContent: "space-between" }}>
          <Segmented value={level} onChange={(v) => setLevel(v as typeof level)} options={["全部", "S · 战略", "A · 重点", "B · 常规", "C · 长尾"]} />
          <Input allowClear prefix={<SearchOutlined />} placeholder="搜索公司 / 联系人 / 行业" value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 280 }} />
        </Space>
        <Table<CustomerAccount>
          rowKey="id"
          dataSource={list}
          pagination={{ pageSize: 10 }}
          onRow={(r) => ({ onClick: () => setDetail(r), style: { cursor: "pointer" } })}
          columns={[
            {
              title: "客户", dataIndex: "companyName",
              render: (v: string, r) => (
                <Space>
                  <Avatar style={{ background: "var(--yl-primary)" }}>{v.slice(0, 1)}</Avatar>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                    <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{r.industry} · {r.city}</div>
                  </div>
                </Space>
              ),
            },
            { title: "KA 分级", dataIndex: "kaLevel", width: 110, render: (v: KaLevel) => <StatusTag status={v} /> },
            { title: "对接人", dataIndex: "contactName", width: 100 },
            { title: "累计 GMV", dataIndex: "lifetimeGmv", width: 130, align: "right", render: (v: number) => <b style={{ fontVariantNumeric: "tabular-nums" }}>{yuan(v)}</b> },
            {
              title: "信用额度使用", width: 200,
              render: (_, r) => {
                const pct = r.creditLimit ? Math.round((r.creditUsed / r.creditLimit) * 100) : 0;
                return <div><Progress percent={pct} size="small" showInfo={false} strokeColor={pct > 80 ? "#F5222D" : pct > 50 ? "var(--yl-warning)" : "var(--yl-success)"} /><div style={{ fontSize: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)" }}>{yuan(r.creditUsed)} / {yuan(r.creditLimit)}</div></div>;
              },
            },
            { title: "进行中商机", dataIndex: "activeOpps", width: 100, align: "right" },
            { title: "最近下单", dataIndex: "lastOrderAt", width: 110 },
            { title: "负责人", dataIndex: "owner", width: 90 },
            { title: "状态", dataIndex: "status", width: 100, render: (v) => <Badge status={v === "活跃" ? "success" : v === "沉睡" ? "warning" : "error"} text={v} /> },
          ]}
        />
      </Card>

      <Drawer open={!!detail} onClose={() => setDetail(null)} width={640} title={detail?.companyName}>
        {detail && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="行业">{detail.industry}</Descriptions.Item>
              <Descriptions.Item label="城市">{detail.city}</Descriptions.Item>
              <Descriptions.Item label="KA 分级"><StatusTag status={detail.kaLevel} /></Descriptions.Item>
              <Descriptions.Item label="负责人">{detail.owner}</Descriptions.Item>
              <Descriptions.Item label="联系人">{detail.contactName} · {detail.contactTitle}</Descriptions.Item>
              <Descriptions.Item label="电话">{detail.phone}</Descriptions.Item>
              <Descriptions.Item label="累计 GMV">{yuan(detail.lifetimeGmv)}</Descriptions.Item>
              <Descriptions.Item label="进行中商机">{detail.activeOpps}</Descriptions.Item>
              <Descriptions.Item label="信用额度">{yuan(detail.creditLimit)}</Descriptions.Item>
              <Descriptions.Item label="已用">{yuan(detail.creditUsed)}</Descriptions.Item>
              <Descriptions.Item label="发票抬头" span={2}>{detail.invoiceTitle}</Descriptions.Item>
              <Descriptions.Item label="税号" span={2}><code>{detail.taxId}</code></Descriptions.Item>
            </Descriptions>
            <Card size="small" title="AI 客户画像提示">
              <Typography.Paragraph style={{ marginBottom: 0, fontSize: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
                该客户历史偏好 <b>推荐档位方案</b>，平均客单价 {yuan(Math.round(detail.lifetimeGmv / Math.max(1, detail.activeOpps + 3)))}，
                建议在触达时强调「性价比 + 复购权益」。
              </Typography.Paragraph>
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
}