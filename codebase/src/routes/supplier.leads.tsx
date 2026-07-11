import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { SearchOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { leads } from "../shared/mock/data";
import type { Lead, LeadStatus, LeadToolType } from "../shared/types";
import { LeadScoreBadge } from "../shared/components/LeadScoreBadge";
import { relativeTime } from "../shared/components/formatters";

export const Route = createFileRoute("/supplier/leads")({
  component: LeadCenter,
});

// ============ 常量 ============

const STATUS_LABELS: Record<LeadStatus | "全部", string> = {
  全部: "全部",
  new: "新线索",
  contacted: "已联系",
  proposal_sent: "已发方案",
  viewed: "已查看",
  won: "成交",
  lost: "丢单",
};

const STATUS_TABS: (LeadStatus | "全部")[] = [
  "全部", "new", "contacted", "proposal_sent", "viewed", "won", "lost",
];

const TOOL_TYPE_LABELS: Record<LeadToolType, string> = {
  budget_calculator: "预算计算器",
  insurance_plan: "保险方案生成器",
  annual_plan: "年度方案",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

// ============ API 预留（Mock 模式） ============

async function fetchLeads(params?: {
  status?: string;
  priority?: string;
  tool_type?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Lead[]; total: number }> {
  // TODO: 替换为真实 API 调用
  // const qs = new URLSearchParams(params as any).toString();
  // const res = await fetch(`/v1/leads?${qs}`);
  // const json = await res.json();
  // if (json.code !== 0) throw new Error(json.message ?? "请求失败");
  // return json.data;

  let filtered = leads;

  if (params?.status && params.status !== "全部") {
    filtered = filtered.filter((l) => l.status === params.status);
  }
  if (params?.priority) {
    filtered = filtered.filter((l) => l.priority === params.priority);
  }
  if (params?.tool_type) {
    filtered = filtered.filter((l) => l.tool_type === params.tool_type);
  }

  return { items: filtered, total: filtered.length };
}

async function convertLead(id: string): Promise<{ proposal_id: string; code: string }> {
  // TODO: 替换为真实 API 调用
  // const res = await fetch(`/v1/leads/${id}/convert`, { method: "POST" });
  // const json = await res.json();
  // if (json.code !== 0) throw new Error(json.message ?? "转换失败");
  // return json.data;

  return { proposal_id: `prop-${id}`, code: `YLF-2026-0${Math.floor(Math.random() * 900 + 100)}` };
}

// ============ 组件 ============

function LeadCenter() {
  const nav = useNavigate();
  const [status, setStatus] = useState<string>("全部");
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [toolType, setToolType] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");
  const [converting, setConverting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "全部" && l.status !== status) return false;
      if (priority && l.priority !== priority) return false;
      if (toolType && l.tool_type !== toolType) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (
          !`${l.customer_name ?? ""}${l.company ?? ""}${l.phone ?? ""}${l.source_channel ?? ""}`
            .toLowerCase()
            .includes(kw)
        )
          return false;
      }
      return true;
    });
  }, [status, priority, toolType, keyword]);

  const handleConvert = async (id: string) => {
    setConverting(id);
    try {
      const result = await convertLead(id);
      message.success(`方案已生成：${result.code}`);
    } catch (e: any) {
      message.error(e.message ?? "生成失败");
    } finally {
      setConverting(null);
    }
  };

  const columns: TableColumnsType<Lead> = [
    {
      title: "线索评分",
      dataIndex: "score",
      width: 110,
      render: (s: number) => <LeadScoreBadge score={s} />,
      sorter: (a, b) => a.score - b.score,
      defaultSortOrder: "descend",
    },
    {
      title: "客户",
      render: (_, l) => (
        <Space size={10}>
          <Avatar
            size={30}
            style={{ background: "var(--yl-primary)", fontSize: "var(--yl-text-caption)" }}
          >
            {(l.customer_name ?? l.company ?? "?").slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "var(--yl-text-primary)" }}>
              {l.customer_name ?? "未知"}
            </div>
            <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
              {l.company ?? ""}
              {l.phone ? ` · ${l.phone}` : ""}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "工具类型",
      dataIndex: "tool_type",
      width: 130,
      render: (t: LeadToolType) => (
        <Tag color={t === "budget_calculator" ? "blue" : t === "insurance_plan" ? "green" : "purple"}>
          {TOOL_TYPE_LABELS[t]}
        </Tag>
      ),
    },
    {
      title: "活动类型",
      width: 110,
      render: (_, l) => <span>{l.answers["活动类型"] ?? "-"}</span>,
    },
    {
      title: "预算",
      width: 100,
      render: (_, l) => <span>{l.answers["预算"] ?? "-"}</span>,
    },
    {
      title: "人数",
      width: 80,
      render: (_, l) => <span>{l.answers["人数"] ? `${l.answers["人数"]}人` : "-"}</span>,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (s: LeadStatus) => (
        <Tag
          style={{ margin: 0, borderRadius: "var(--yl-radius-sm)", fontWeight: 500 }}
          color={
            s === "new" ? "blue" :
            s === "contacted" ? "cyan" :
            s === "proposal_sent" ? "purple" :
            s === "viewed" ? "default" :
            s === "won" ? "green" :
            "red"
          }
        >
          {STATUS_LABELS[s]}
        </Tag>
      ),
    },
    {
      title: "负责人",
      dataIndex: "assigned_to",
      width: 90,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      width: 110,
      render: (t: string) => (
        <span style={{ color: "var(--yl-text-tertiary)" }}>{relativeTime(t)}</span>
      ),
    },
    {
      title: "操作",
      width: 180,
      fixed: "right",
      render: (_, l) => (
        <Space size={4}>
          <Button
            size="small"
            type="link"
            onClick={() =>
              nav({ to: "/supplier/leads/$id", params: { id: l.id } })
            }
          >
            查看详情
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<ThunderboltOutlined />}
            loading={converting === l.id}
            disabled={l.status === "won" || l.status === "lost"}
            onClick={() => handleConvert(l.id)}
          >
            生成方案
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "var(--yl-space-5)" }}>
      <Card style={{ borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: "var(--yl-space-4)" } }}>
        {/* 顶部标题栏 */}
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: "var(--yl-space-3)" }}>
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>
              线索中心
            </Typography.Title>
            <Tag color="purple">{list.length} 条线索</Tag>
          </Space>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索客户名 / 公司 / 手机号"
              style={{ width: 280 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Space>
        </Space>

        {/* 筛选栏 */}
        <Space size={12} wrap style={{ marginBottom: "var(--yl-space-3)" }}>
          <Segmented
            block
            options={STATUS_TABS.map((k) => ({ label: STATUS_LABELS[k], value: k }))}
            value={status}
            onChange={(v) => setStatus(v as string)}
          />
        </Space>
        <Space size={12} wrap>
          <Select
            allowClear
            placeholder="优先级筛选"
            style={{ width: 130 }}
            value={priority}
            onChange={(v) => setPriority(v)}
            options={[
              { value: "high", label: "高优先级" },
              { value: "medium", label: "中优先级" },
              { value: "low", label: "低优先级" },
            ]}
          />
          <Select
            allowClear
            placeholder="工具类型筛选"
            style={{ width: 160 }}
            value={toolType}
            onChange={(v) => setToolType(v)}
            options={Object.entries(TOOL_TYPE_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
          />
        </Space>

        {/* 表格 */}
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: "var(--yl-space-3)" }} />
        ) : list.length === 0 ? (
          <Empty description="暂无线索" style={{ padding: "var(--yl-space-8) 0" }} />
        ) : (
          <Table<Lead>
            style={{ marginTop: "var(--yl-space-3)" }}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            dataSource={list}
            columns={columns}
            scroll={{ x: 1300 }}
            onRow={(record) => ({
              style: { cursor: "pointer" },
              onClick: () =>
                nav({ to: "/supplier/leads/$id", params: { id: record.id } }),
            })}
          />
        )}
      </Card>
    </div>
  );
}
