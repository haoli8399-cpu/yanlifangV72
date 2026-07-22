import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card, Col, List, Row, Space, Table, Tag, Typography, message } from "antd";
import { CheckCircleFilled, ExperimentOutlined, PlusOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { promptTemplates, type PromptTemplate, type PromptVersion } from "../shared/mock/admin";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/admin/prompts")({
  head: () => ({ meta: [{ title: "Prompt 库 · 演立方 Admin" }] }),
  component: PromptsPage,
});

const purposeColor: Record<PromptTemplate["purpose"], string> = {
  需求抽取: "purple",
  方案生成: "geekblue",
  话术推荐: "gold",
  邮件生成: "cyan",
};

function PromptsPage() {
  const [activeId, setActiveId] = useState(promptTemplates[0].id);
  const active = useMemo(() => promptTemplates.find((p) => p.id === activeId)!, [activeId]);
  const activeVersion = active.versions.find((v) => v.active) ?? active.versions[0];
  const [previewVersion, setPreviewVersion] = useState<string>(activeVersion.version);
  const preview = active.versions.find((v) => v.version === previewVersion) ?? activeVersion;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>Prompt · 话术库</Typography.Title>
        <Typography.Text type="secondary">
          AI 的每一句话都来自这里。所有 Prompt 支持版本管理、A/B 灰度、回滚。
        </Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={8}>
          <Card
            title="模板列表"
            extra={<Button size="small" icon={<PlusOutlined />} onClick={() => message.info("Demo：新增模板未实现")}>新增</Button>}
            styles={{ body: { padding: 0 } }}
          >
            <List
              dataSource={promptTemplates}
              renderItem={(t) => {
                const isActive = t.id === activeId;
                const av = t.versions.find((v) => v.active) ?? t.versions[0];
                return (
                  <List.Item
                    onClick={() => { setActiveId(t.id); setPreviewVersion(av.version); }}
                    style={{ padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${isActive ? "#6E59F5" : "transparent"}`, background: isActive ? "#FAF9FF" : undefined }}
                  >
                    <List.Item.Meta
                      title={<Space><span style={{ fontWeight: 600 }}>{t.name}</span><StatusTag status={t.purpose} /></Space>}
                      description={<Space size={4}><Tag>{t.scene}</Tag><Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>当前 {av.version} · 好评 {av.metrics.goodRate}%</Typography.Text></Space>}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card
            title={<Space><span>{active.name}</span><StatusTag status={active.purpose} /><Tag>{active.scene}</Tag></Space>}
            extra={
              <Space>
                <Button icon={<ExperimentOutlined />} onClick={() => message.info(`Demo：将 ${preview.version} 加入 A/B 实验`)}>A/B 灰度</Button>
                <Button type="primary" disabled={preview.active} onClick={() => message.success(`已启用 ${preview.version}`)}>启用此版本</Button>
              </Space>
            }
          >
            <Table<PromptVersion>
              size="small"
              rowKey="version"
              pagination={false}
              dataSource={active.versions}
              onRow={(r) => ({ onClick: () => setPreviewVersion(r.version), style: { cursor: "pointer", background: r.version === previewVersion ? "#FAF9FF" : undefined } })}
              columns={[
                { title: "版本", dataIndex: "version", width: 90, render: (v: string, r) => <Space><b>{v}</b>{r.active && <Tag color="green" icon={<CheckCircleFilled />}>启用中</Tag>}</Space> },
                { title: "更新时间", dataIndex: "updatedAt", width: 130 },
                { title: "编辑者", dataIndex: "editor", width: 100 },
                { title: "变更说明", dataIndex: "changeNote" },
                { title: "采纳率", width: 90, align: "right", render: (_, r) => `${r.metrics.adopt}%` },
                { title: "好评率", width: 90, align: "right", render: (_, r) => <Tag color={r.metrics.goodRate > 80 ? "green" : r.metrics.goodRate > 60 ? "orange" : "red"}>{r.metrics.goodRate}%</Tag> },
                { title: "样本", width: 80, align: "right", render: (_, r) => r.metrics.sample },
              ]}
            />

            <Card size="small" style={{ marginTop: 16, background: "#0F1222" }} title={<span style={{ color: "#fff" }}>Prompt 预览 · {preview.version}</span>}>
              <pre style={{ margin: 0, color: "#B5B9C9", fontSize: "var(--yl-text-body-sm)", whiteSpace: "pre-wrap", fontFamily: "SF Mono, Menlo, monospace" }}>{preview.content}</pre>
            </Card>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

void Badge;