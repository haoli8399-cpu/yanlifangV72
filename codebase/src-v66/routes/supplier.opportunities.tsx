import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { ExportOutlined, SearchOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { opportunities } from "../shared/mock/data";
import type { Opportunity, OpportunityStatus } from "../shared/types";
import { PriorityTag, StatusTag } from "../shared/components/StatusTag";
import { relativeTime, wan } from "../shared/components/formatters";

export const Route = createFileRoute("/supplier/opportunities")({
  component: OpportunityCenter,
});

const STATUS_TABS: (OpportunityStatus | "全部")[] = [
  "全部", "新需求", "有效商机", "已报价", "谈判中", "等待客户确认", "已成交", "已丢单",
];

function OpportunityCenter() {
  const nav = useNavigate();
  const [status, setStatus] = useState<string>("全部");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    return opportunities.filter((o) => {
      if (status !== "全部" && o.status !== status) return false;
      if (keyword && !`${o.customer.companyName}${o.customer.contactName}${o.event.type}${o.code}`.includes(keyword)) return false;
      return true;
    });
  }, [status, keyword]);

  const columns: TableColumnsType<Opportunity> = [
    {
      title: "客户",
      dataIndex: ["customer", "companyName"],
      render: (_, o) => (
        <Space size={8}>
          <Avatar size={30} style={{ background: o.customer.avatarColor, fontSize: "var(--yl-text-caption)" }}>
            {o.customer.companyName.slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "var(--yl-text-primary)" }}>{o.customer.companyName}</div>
            <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
              {o.customer.contactName} · {o.customer.contactTitle}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "商机 / 活动",
      render: (_, o) => (
        <div>
          <div style={{ fontWeight: 600 }}>{o.event.type} · {o.event.scene}</div>
          <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{o.code} · {o.event.date} · {o.event.location}</div>
        </div>
      ),
    },
    { title: "人数", dataIndex: ["event", "headcount"], render: (n: number) => `${n} 人`, width: 90 },
    { title: "预算", dataIndex: ["event", "budget"], render: (n: number) => wan(n), width: 110 },
    { title: "状态", dataIndex: "status", render: (s: OpportunityStatus) => <StatusTag status={s} />, width: 110 },
    { title: "优先级", dataIndex: "priority", render: (p) => <PriorityTag priority={p} />, width: 90 },
    { title: "AI 匹配度", dataIndex: "matchScore", render: (n: number) => <Tag color={n >= 85 ? "green" : n >= 70 ? "gold" : "default"}>{n}%</Tag>, width: 100 },
    { title: "负责运营", dataIndex: "ownerName", width: 100 },
    { title: "最近跟进", dataIndex: "lastFollowUpAt", render: (t: string) => <span style={{ color: "var(--yl-text-tertiary)" }}>{relativeTime(t)}</span>, width: 110 },
    {
      title: "操作",
      width: 140,
      fixed: "right",
      render: (_, o) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => nav({ to: "/supplier/opportunities/$id", params: { id: o.id } })}>
            详情
          </Button>
          <Button size="small" type="link" onClick={() => nav({ to: "/supplier/workspace" })}>作战台</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "var(--yl-space-5)" }}>
      <Card style={{ borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: "var(--yl-space-4)" } }}>
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: "var(--yl-space-3)" }}>
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>商机中心</Typography.Title>
            <Tag color="purple">{list.length} 条商机</Tag>
          </Space>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索客户 / 联系人 / 编号"
              style={{ width: 260 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button icon={<ExportOutlined />}>导出</Button>
          </Space>
        </Space>

        <Segmented block options={STATUS_TABS} value={status} onChange={(v) => setStatus(v as string)} />

        {selected.length > 0 && (
          <div
            style={{
              marginTop: "var(--yl-space-3)",
              padding: "var(--yl-space-2) var(--yl-space-3)",
              background: "var(--yl-primary-subtle)",
              borderRadius: "var(--yl-radius-md)",
              border: "1px solid var(--yl-border-ai)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Text>
              已选择 <strong style={{ color: "var(--yl-primary)" }}>{selected.length}</strong> 条商机
            </Typography.Text>
            <Space>
              <Button size="small" icon={<UserSwitchOutlined />} onClick={() => message.success(`已批量分配给 张运营`)}>
                批量分配
              </Button>
              <Button size="small" onClick={() => message.success("已批量标记为「有效商机」")}>批量转有效</Button>
              <Button size="small" onClick={() => message.success("已提醒批量跟进")}>批量提醒跟进</Button>
              <Button size="small" danger onClick={() => message.success("已批量归档")}>批量归档</Button>
            </Space>
          </div>
        )}

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: "var(--yl-space-3)" }} />
        ) : list.length === 0 ? (
          <Empty description="暂无商机" style={{ padding: "var(--yl-space-8) 0" }} />
        ) : (
          <Table<Opportunity>
            style={{ marginTop: "var(--yl-space-3)" }}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            dataSource={list}
            columns={columns}
            scroll={{ x: 1200 }}
            rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
          />
        )}
      </Card>
    </div>
  );
}