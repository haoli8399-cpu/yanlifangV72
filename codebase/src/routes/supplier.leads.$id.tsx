import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PhoneOutlined,
  RobotFilled,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { leads } from "../shared/mock/data";
import { LeadScoreBadge } from "../shared/components/LeadScoreBadge";
import { relativeTime } from "../shared/components/formatters";
import type { Lead, LeadPriority, LeadStatus } from "../shared/types";

export const Route = createFileRoute("/supplier/leads/$id")({
  component: LeadDetail,
  notFoundComponent: () => (
    <div style={{ padding: 48, textAlign: "center", color: "#fff" }}>线索不存在</div>
  ),
});

// ============ 常量 ============

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "新线索",
  contacted: "已联系",
  proposal_sent: "已发方案",
  viewed: "已查看",
  won: "成交",
  lost: "丢单",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([k, v]) => ({
  value: k,
  label: v,
}));

const TOOL_TYPE_LABELS: Record<string, string> = {
  budget_calculator: "预算计算器",
  insurance_plan: "保险方案生成器",
  annual_plan: "年度方案",
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const PRIORITY_COLORS: Record<LeadPriority, string> = {
  high: "red",
  medium: "orange",
  low: "default",
};

// ============ API 预留（Mock 模式） ============

async function fetchLeadDetail(id: string): Promise<Lead> {
  // TODO: 替换为真实 API 调用
  // const res = await fetch(`/v1/leads/${id}`);
  // const json = await res.json();
  // if (json.code !== 0) throw new Error(json.message ?? "请求失败");
  // return json.data;

  const lead = leads.find((l) => l.id === id);
  if (!lead) throw new Error("线索不存在");
  return lead;
}

async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  // TODO: 替换为真实 API 调用
  // const res = await fetch(`/v1/leads/${id}`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // const json = await res.json();
  // if (json.code !== 0) throw new Error(json.message ?? "更新失败");
  // return json.data;

  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("线索不存在");
  Object.assign(leads[idx]!, data);
  return leads[idx]!;
}

async function convertLead(id: string): Promise<{ proposal_id: string; code: string }> {
  // TODO: 替换为真实 API 调用
  // const res = await fetch(`/v1/leads/${id}/convert`, { method: "POST" });
  // const json = await res.json();
  // if (json.code !== 0) throw new Error(json.message ?? "转换失败");
  // return json.data;

  return { proposal_id: `prop-${id}`, code: `YLF-2026-0${Math.floor(Math.random() * 900 + 100)}` };
}

// ============ 评分明细卡片 ============

function ScoreDetailCard({ lead }: { lead: Lead }) {
  const scoreItems = [
    { label: "需求完整度", value: lead.score >= 80 ? "高" : lead.score >= 50 ? "中" : "低" },
    { label: "预算匹配度", value: lead.score >= 80 ? "高" : lead.score >= 50 ? "中" : "低" },
    { label: "行业意向度", value: lead.score >= 80 ? "强" : lead.score >= 50 ? "中" : "弱" },
    { label: "转化概率", value: `${Math.min(lead.score + 5, 99)}%` },
  ];

  return (
    <Card
      style={{ borderRadius: "var(--yl-radius-lg)", textAlign: "center" }}
      styles={{ body: { padding: "var(--yl-space-5)" } }}
    >
      <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>
        线索评分
      </Typography.Text>
      <div style={{ margin: "var(--yl-space-3) 0" }}>
        <span
          style={{
            fontSize: "var(--yl-text-display-lg)",
            fontWeight: 800,
            lineHeight: 1,
            color:
              lead.score >= 80
                ? "#10B981"
                : lead.score >= 50
                  ? "#F59E0B"
                  : "#9CA3AF",
          }}
        >
          {lead.score}
        </span>
        <span style={{ fontSize: "var(--yl-text-heading-2)", color: "var(--yl-text-tertiary)", marginLeft: "var(--yl-space-sm)" }}>
          分
        </span>
      </div>
      <LeadScoreBadge score={lead.score} />
      <Divider style={{ margin: "var(--yl-space-3) 0" }} />
      <div style={{ textAlign: "left" }}>
        {scoreItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "var(--yl-space-sm) 0",
              fontSize: "var(--yl-text-body-sm)",
            }}
          >
            <span style={{ color: "var(--yl-text-tertiary)" }}>{item.label}</span>
            <span style={{ fontWeight: 500, color: "var(--yl-text-primary)" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============ 主组件 ============

function LeadDetail() {
  const { id } = useParams({ from: "/supplier/leads/$id" });
  const nav = useNavigate();
  const lead = leads.find((l) => l.id === id) ?? leads[0]!;

  const [editStatus, setEditStatus] = useState<LeadStatus>(lead.status);
  const [editPriority, setEditPriority] = useState<LeadPriority>(lead.priority);
  const [editOwner, setEditOwner] = useState(lead.assigned_to ?? "");
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateLead(id, {
        status: editStatus,
        priority: editPriority,
        assigned_to: editOwner || undefined,
      });
      message.success("线索已更新");
    } catch (e: any) {
      message.error(e.message ?? "更新失败");
    } finally {
      setUpdating(false);
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const result = await convertLead(id);
      message.success(
        `方案已生成：${result.code}，正在跳转...`,
        2,
        () => nav({ to: "/supplier/quotations/$id", params: { id: "q1" } })
      );
    } catch (e: any) {
      message.error(e.message ?? "转换失败");
    } finally {
      setConverting(false);
    }
  };

  const answerEntries = Object.entries(lead.answers);

  return (
    <div style={{ padding: "var(--yl-space-5)", background: "var(--yl-bg-page)", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* 顶部面包屑 */}
        <Space style={{ marginBottom: "var(--yl-space-3)" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => nav({ to: "/supplier/leads" })}
          >
            返回线索中心
          </Button>
          <Tag color="purple">
            {TOOL_TYPE_LABELS[lead.tool_type] ?? lead.tool_type}
          </Tag>
          {lead.proposal && (
            <Tag icon={<CheckCircleOutlined />} color="green">
              已转方案 · {lead.proposal.code}
            </Tag>
          )}
        </Space>

        <Row gutter={16}>
          {/* ===== 左栏：主内容 ===== */}
          <Col xs={24} lg={16}>
            {/* 客户信息卡片 */}
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)", marginBottom: "var(--yl-space-4)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={
                <Space size="var(--yl-space-3)">
                  <Avatar
                    size={40}
                    style={{ background: "var(--yl-primary)" }}
                  >
                    {(lead.customer_name ?? lead.company ?? "?").slice(0, 1)}
                  </Avatar>
                  <div>
                    <div style={{ fontSize: "var(--yl-text-heading-3)", fontWeight: 700 }}>
                      {lead.customer_name ?? "未知客户"}
                    </div>
                    <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                      {lead.company ?? "未填写公司"}
                      {lead.phone ? ` · ${lead.phone}` : ""}
                    </div>
                  </div>
                </Space>
              }
              extra={
                <Space>
                  {lead.phone && (
                    <Button
                      icon={<PhoneOutlined />}
                      onClick={() => message.success("正在呼叫...")}
                    >
                      电话
                    </Button>
                  )}
                </Space>
              }
            >
              <Descriptions column={2} size="small" bordered styles={{ label: { width: 110 } }}>
                <Descriptions.Item label="来源渠道">
                  {lead.source_channel ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="来源用户">
                  {lead.source_user ?? "-"}
                </Descriptions.Item>
                {lead.wechat && (
                  <Descriptions.Item label="微信">
                    {lead.wechat}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="创建时间">
                  {new Date(lead.created_at).toLocaleString("zh-CN")}
                </Descriptions.Item>
                <Descriptions.Item label="最近更新">
                  {relativeTime(lead.updated_at)}
                </Descriptions.Item>
                <Descriptions.Item label="负责人">
                  {lead.assigned_to ?? "未分配"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 结构化答案卡片 */}
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)", marginBottom: "var(--yl-space-4)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={<Typography.Text strong>结构化答案</Typography.Text>}
            >
              <Descriptions column={2} size="small" bordered styles={{ label: { width: 120 } }}>
                {answerEntries.map(([key, val]) => (
                  <Descriptions.Item key={key} label={key}>
                    {val}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>

            {/* AI 结果摘要卡片 */}
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)", marginBottom: "var(--yl-space-4)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={
                <Space>
                  <RobotFilled style={{ color: "var(--yl-primary)" }} />
                  <Typography.Text strong>AI 结果摘要</Typography.Text>
                </Space>
              }
            >
              <Alert
                type="info"
                showIcon={false}
                message={null}
                description={
                  <Typography.Paragraph
                    style={{ margin: 0, whiteSpace: "pre-wrap", color: "#374151" }}
                  >
                    {lead.ai_result_summary ?? "暂无 AI 摘要"}
                  </Typography.Paragraph>
                }
                style={{
                  background: "var(--yl-bg-ai)",
                  borderColor: "var(--yl-border-ai)",
                  borderRadius: "var(--yl-radius-md)",
                }}
              />
              {lead.proposal && (
                <div style={{ marginTop: "var(--yl-space-3)" }}>
                  <Tag icon={<CheckCircleOutlined />} color="green">
                    已关联方案：{lead.proposal.code}
                  </Tag>
                </div>
              )}
            </Card>

            {/* 跟进记录区（预留） */}
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={<Typography.Text strong>跟进记录</Typography.Text>}
              extra={
                <Button size="small" icon={<EditOutlined />}>
                  添加记录
                </Button>
              }
            >
              <Typography.Text type="secondary">
                暂无跟进记录。线索来源增长工具自动入库后，可在此记录电话/微信沟通内容。
              </Typography.Text>
            </Card>
          </Col>

          {/* ===== 右栏：侧边栏 ===== */}
          <Col xs={24} lg={8}>
            {/* 线索评分大卡片 */}
            <ScoreDetailCard lead={lead} />

            {/* 状态操作卡片 */}
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)", marginTop: "var(--yl-space-4)" }}
              styles={{ body: { padding: "var(--yl-space-4)" } }}
              title={<Typography.Text strong>线索管理</Typography.Text>}
            >
              <Space orientation="vertical" size="var(--yl-space-3)" style={{ width: "100%" }}>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)", display: "block", marginBottom: "var(--yl-space-sm)" }}>
                    状态
                  </Typography.Text>
                  <Select
                    style={{ width: "100%" }}
                    value={editStatus}
                    onChange={(v) => setEditStatus(v)}
                    options={STATUS_OPTIONS}
                  />
                </div>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)", display: "block", marginBottom: "var(--yl-space-sm)" }}>
                    优先级
                  </Typography.Text>
                  <Select
                    style={{ width: "100%" }}
                    value={editPriority}
                    onChange={(v) => setEditPriority(v)}
                    options={[
                      { value: "high", label: "高" },
                      { value: "medium", label: "中" },
                      { value: "low", label: "低" },
                    ]}
                  />
                </div>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)", display: "block", marginBottom: "var(--yl-space-sm)" }}>
                    负责人
                  </Typography.Text>
                  <Select
                    style={{ width: "100%" }}
                    mode="tags"
                    maxCount={1}
                    placeholder="选择或输入负责人"
                    value={editOwner ? [editOwner] : []}
                    onChange={(vals) => setEditOwner(vals[vals.length - 1] ?? "")}
                    options={[
                      { value: "张运营", label: "张运营" },
                      { value: "李运营", label: "李运营" },
                      { value: "王运营", label: "王运营" },
                    ]}
                  />
                </div>
                <Button
                  type="primary"
                  block
                  loading={updating}
                  onClick={handleUpdate}
                >
                  更新
                </Button>
              </Space>
            </Card>

            {/* 一键生成正式方案 */}
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)", marginTop: "var(--yl-space-4)" }}
              styles={{ body: { padding: "var(--yl-space-4)" } }}
            >
              <Button
                type="primary"
                block
                size="large"
                icon={<ThunderboltOutlined />}
                loading={converting}
                disabled={lead.status === "won" || lead.status === "lost"}
                onClick={handleConvert}
                style={{
                  height: 44,
                  fontSize: "var(--yl-text-body-lg)",
                  fontWeight: 600,
                  borderRadius: "var(--yl-radius-md)",
                  background: "var(--yl-primary-active)",
                  borderColor: "var(--yl-primary-active)",
                }}
              >
                {lead.proposal
                  ? "重新生成方案"
                  : "一键生成正式方案"}
              </Button>
              <Typography.Text
                type="secondary"
                style={{ fontSize: "var(--yl-text-caption-xs)", display: "block", textAlign: "center", marginTop: "var(--yl-space-2)" }}
              >
                基于 AI 摘要和客户答案，自动生成报价方案并进入编辑
              </Typography.Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
