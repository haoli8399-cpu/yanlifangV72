import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card, Col, Row, Space, Table, Tag, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { categoryDict, cityDict, industryDict, sceneDict, type DictItem } from "../shared/mock/admin";

export const Route = createFileRoute("/admin/dict")({
  head: () => ({ meta: [{ title: "平台字典 · 演立方 Admin" }] }),
  component: DictPage,
});

function DictPage() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>平台字典</Typography.Title>
        <Typography.Text type="secondary">
          场景、城市、行业、演出品类的公共字典。修改会同步影响 C 端筛选、AI 抽取与作战台过滤。
        </Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={12}><DictCard title="活动场景" items={sceneDict} accent="#6E59F5" /></Col>
        <Col span={12}><DictCard title="演出品类" items={categoryDict} accent="#00B96B" /></Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}><DictCard title="覆盖城市" items={cityDict} accent="#1677FF" /></Col>
        <Col span={12}><DictCard title="客户行业" items={industryDict} accent="#FA8C16" /></Col>
      </Row>
    </div>
  );
}

function DictCard({ title, items, accent }: { title: string; items: DictItem[]; accent: string }) {
  return (
    <Card
      title={<span><Tag color={accent} style={{ borderColor: "transparent" }}>{title}</Tag><Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>共 {items.length} 项</Typography.Text></span>}
      extra={<Button size="small" icon={<PlusOutlined />} onClick={() => message.info("Demo：新增字典未实现")}>新增</Button>}
    >
      <Table<DictItem>
        rowKey="key"
        size="small"
        pagination={false}
        dataSource={items}
        columns={[
          { title: "标识", dataIndex: "key", width: 100, render: (v) => <code>{v}</code> },
          { title: "显示名 / 描述", render: (_, r) => (
            <div>
              <div style={{ fontWeight: 500 }}>{r.label}</div>
              {r.desc && <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>{r.desc}</div>}
            </div>
          ) },
          { title: "关联量", dataIndex: "count", width: 80, align: "right" },
          { title: "状态", dataIndex: "status", width: 80, render: (v) => <Badge status={v === "启用" ? "success" : "default"} text={v} /> },
        ]}
      />
    </Card>
  );
}