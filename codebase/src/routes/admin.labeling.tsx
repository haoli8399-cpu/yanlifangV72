import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card, Col, Empty, Input, List, Row, Space, Tag, Typography, message } from "antd";
import { CheckCircleFilled, EditFilled, StopFilled } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { labelTasks, type LabelTask } from "../shared/mock/admin";

export const Route = createFileRoute("/admin/labeling")({
  head: () => ({ meta: [{ title: "AI 标注台 · 演立方 Admin" }] }),
  component: LabelingPage,
});

const statusColor: Record<LabelTask["status"], string> = {
  待标注: "orange",
  已确认: "green",
  已修正: "blue",
  已废弃: "default",
};

function LabelingPage() {
  const [tab, setTab] = useState<"待标注" | "全部">("待标注");
  const [selectedId, setSelectedId] = useState(labelTasks[0].id);
  const list = useMemo(() => (tab === "待标注" ? labelTasks.filter((t) => t.status === "待标注") : labelTasks), [tab]);
  const active = useMemo(() => labelTasks.find((t) => t.id === selectedId) ?? list[0], [selectedId, list]);

  const waiting = labelTasks.filter((t) => t.status === "待标注").length;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          AI 需求抽取标注台 <Tag color="orange" style={{ marginLeft: 8 }}>{waiting} 待标注</Tag>
        </Typography.Title>
        <Typography.Text type="secondary">
          人工确认 / 修正 AI 抽取结果，样本回流到需求抽取 Prompt 与 SKU 匹配模型。
        </Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={9}>
          <Card
            title={<Space>任务队列<Button size="small" type={tab === "待标注" ? "primary" : "default"} onClick={() => setTab("待标注")}>待标注</Button><Button size="small" type={tab === "全部" ? "primary" : "default"} onClick={() => setTab("全部")}>全部</Button></Space>}
            styles={{ body: { padding: 0 } }}
          >
            {list.length === 0 ? <Empty style={{ padding: 40 }} /> : (
              <List
                dataSource={list}
                renderItem={(t) => (
                  <List.Item
                    onClick={() => setSelectedId(t.id)}
                    style={{ padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${t.id === active?.id ? "#6E59F5" : "transparent"}`, background: t.id === active?.id ? "#FAF9FF" : undefined }}
                  >
                    <List.Item.Meta
                      title={<Space><span style={{ fontWeight: 600 }}>{t.customerName}</span><Badge color={statusColor[t.status]} text={t.status} /></Space>}
                      description={
                        <Space orientation="vertical" size={2} style={{ width: "100%" }}>
                          <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>{t.createdAt} · {t.source}</Typography.Text>
                          <Typography.Text style={{ fontSize: "var(--yl-text-caption)" }} ellipsis={{ tooltip: t.rawText }}>{t.rawText}</Typography.Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col span={15}>
          {active ? <LabelWorkspace task={active} /> : <Empty />}
        </Col>
      </Row>
    </div>
  );
}

function LabelWorkspace({ task }: { task: LabelTask }) {
  return (
    <Card
      title={<Space><span>{task.customerName}</span><Badge color={statusColor[task.status]} text={task.status} /></Space>}
      extra={
        <Space>
          <Button icon={<StopFilled />} danger onClick={() => message.warning("已标记为废弃")}>废弃</Button>
          <Button icon={<EditFilled />} onClick={() => message.info("Demo：修正后提交训练集")}>修正后提交</Button>
          <Button type="primary" icon={<CheckCircleFilled />} onClick={() => message.success("已确认为正样本")}>确认为正样本</Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Card size="small" title="客户原文" styles={{ header: { background: "#F5F6FA" } }}>
          <Typography.Paragraph style={{ margin: 0, fontSize: "var(--yl-text-body-md)", lineHeight: 1.8 }}>{task.rawText}</Typography.Paragraph>
        </Card>

        <Card size="small" title="AI 抽取结果" extra={<Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>点击字段可修正</Typography.Text>}>
          <Space orientation="vertical" size={10} style={{ width: "100%" }}>
            {task.aiExtract.map((e) => (
              <Row key={e.key} gutter={12} align="middle">
                <Col span={4}><Typography.Text strong>{e.key}</Typography.Text></Col>
                <Col span={14}><Input defaultValue={e.value} /></Col>
                <Col span={6}><Tag color={e.confidence === "高" ? "green" : e.confidence === "中" ? "orange" : "red"}>置信 {e.confidence}</Tag></Col>
              </Row>
            ))}
          </Space>
        </Card>

        {task.aiMissing.length > 0 && (
          <Card size="small" title="AI 缺失字段" styles={{ header: { background: "#FFF7E6" } }}>
            <Space wrap>
              {task.aiMissing.map((m) => <Tag key={m} color="orange">{m}</Tag>)}
            </Space>
            <Typography.Paragraph type="secondary" style={{ fontSize: "var(--yl-text-caption)", marginTop: 8, marginBottom: 0 }}>
              标注员补齐这些字段后，样本将回流到「需求抽取 · 主 Prompt」的训练集。
            </Typography.Paragraph>
          </Card>
        )}
      </Space>
    </Card>
  );
}