import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card, Descriptions, Drawer, Input, Segmented, Space, Table, Tag, Typography, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { skuLibrary, type SkuRecord } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/admin/sku")({
  head: () => ({ meta: [{ title: "SKU 库 · 演立方 Admin" }] }),
  component: SkuPage,
});

function SkuPage() {
  const [tab, setTab] = useState<"全部" | "上架" | "下架" | "草稿">("全部");
  const [kw, setKw] = useState("");
  const [detail, setDetail] = useState<SkuRecord | null>(null);

  const list = useMemo(() => {
    return skuLibrary.filter((s) => {
      const okTab = tab === "全部" || s.status === tab;
      const okKw = !kw || s.name.includes(kw) || s.sku.toLowerCase().includes(kw.toLowerCase());
      return okTab && okKw;
    });
  }, [tab, kw]);

  return (
    <div style={{ padding: "var(--yl-space-6)", display: "flex", flexDirection: "column", gap: "var(--yl-space-4)" }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>SKU 库</Typography.Title>
        <Typography.Text type="secondary">
          客户端方案发现与运营端「AI 三档方案」的唯一数据源。上架 SKU 会实时影响 AI 推荐。
        </Typography.Text>
      </Space>

      <Card>
        <Space style={{ marginBottom: "var(--yl-space-4)", width: "100%", justifyContent: "space-between" }}>
          <Space>
            <Segmented value={tab} onChange={(v) => setTab(v as typeof tab)} options={["全部", "上架", "下架", "草稿"]} />
            <Input allowClear prefix={<SearchOutlined />} placeholder="搜索 SKU 编码 / 名称" value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 260 }} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info("Demo：新增 SKU 表单未实现")}>新增 SKU</Button>
        </Space>

        <Table<SkuRecord>
          rowKey="id"
          dataSource={list}
          pagination={{ pageSize: 10 }}
          onRow={(r) => ({ onClick: () => setDetail(r), style: { cursor: "pointer" } })}
          columns={[
            { title: "SKU", dataIndex: "sku", width: 150, render: (v) => <code>{v}</code> },
            { title: "方案名称", dataIndex: "name" },
            { title: "档位", dataIndex: "tier", width: 100, render: (v) => <Tag color={v === "推荐方案" ? "purple" : v === "升级方案" ? "gold" : "default"}>{v}</Tag> },
            { title: "场景", dataIndex: "scene", width: 100 },
            { title: "人数", width: 110, render: (_, r) => `${r.headcountRange[0]}–${r.headcountRange[1]}` },
            { title: "指导价", dataIndex: "price", width: 120, align: "right", render: (v: number) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{yuan(v)}</span> },
            { title: "毛利率", dataIndex: "grossMargin", width: 90, align: "right", render: (v: number) => <Tag color={v > 35 ? "green" : v > 25 ? "orange" : "red"}>{v}%</Tag> },
            { title: "被推荐", dataIndex: "usedCount", width: 80, align: "right" },
            { title: "成交率", dataIndex: "winRate", width: 90, align: "right", render: (v: number) => `${v}%` },
            { title: "状态", dataIndex: "status", width: 90, render: (v) => <Badge status={v === "上架" ? "success" : v === "草稿" ? "warning" : "default"} text={v} /> },
            { title: "负责人", dataIndex: "owner", width: 100 },
          ]}
        />
      </Card>

      <Drawer open={!!detail} onClose={() => setDetail(null)} width={640} title={detail ? `${detail.sku} · ${detail.name}` : ""} extra={detail && (
        <Space>
          <Button onClick={() => message.success(`${detail.status === "上架" ? "已下架" : "已上架"} ${detail.sku}`)}>
            {detail.status === "上架" ? "下架" : "上架"}
          </Button>
          <Button type="primary" onClick={() => message.info("Demo：编辑表单未实现")}>编辑</Button>
        </Space>
      )}>
        {detail && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="档位">{detail.tier}</Descriptions.Item>
              <Descriptions.Item label="场景">{detail.scene}</Descriptions.Item>
              <Descriptions.Item label="适用场景" span={2}>{detail.applicableScenes.map((s) => <Tag key={s}>{s}</Tag>)}</Descriptions.Item>
              <Descriptions.Item label="人数区间">{detail.headcountRange[0]}–{detail.headcountRange[1]} 人</Descriptions.Item>
              <Descriptions.Item label="时长">{detail.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="指导价">{yuan(detail.price)}</Descriptions.Item>
              <Descriptions.Item label="成本">{yuan(detail.cost)}</Descriptions.Item>
              <Descriptions.Item label="毛利率">{detail.grossMargin}%</Descriptions.Item>
              <Descriptions.Item label="状态">{detail.status}</Descriptions.Item>
              <Descriptions.Item label="被推荐次数">{detail.usedCount}</Descriptions.Item>
              <Descriptions.Item label="成交率">{detail.winRate}%</Descriptions.Item>
              <Descriptions.Item label="最近更新" span={2}>{detail.updatedAt} · {detail.owner}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="AI 训练提示">
              <Typography.Paragraph style={{ marginBottom: 0, fontSize: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
                该 SKU 在过去 90 天被 AI 推荐 <b>{detail.usedCount}</b> 次，成交率 <b>{detail.winRate}%</b>。修改指导价、成本或档位会自动重训「三档方案生成器」的权重。
              </Typography.Paragraph>
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
}