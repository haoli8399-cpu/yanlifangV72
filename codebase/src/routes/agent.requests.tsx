import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Space, Table, Tabs, Typography } from "antd";
import { useState } from "react";
import { opportunities } from "../shared/mock/data";
import type { Opportunity, RequestStatus } from "../shared/types";
import { StatusTag } from "../shared/components/StatusTag";
import { relativeTime, wan } from "../shared/components/formatters";

export const Route = createFileRoute("/agent/requests")({
  component: RequestsPage,
});

const TABS: (RequestStatus | "全部")[] = ["全部", "新需求", "需求确认", "已报价", "沟通中", "已成交", "已结束"];

function RequestsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<string>("全部");

  const filtered = tab === "全部" ? opportunities : opportunities.filter((o) => o.requestStatus === tab);

  const columns = [
    { title: "需求编号", dataIndex: "code", render: (v: string) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span> },
    { title: "活动类型", render: (_: unknown, r: Opportunity) => `${r.event.type} · ${r.event.scene}` },
    { title: "活动日期", dataIndex: ["event", "date"] },
    { title: "人数", dataIndex: ["event", "headcount"], render: (v: number) => `${v} 人` },
    { title: "预算", dataIndex: ["event", "budget"], render: (v: number) => wan(v) },
    { title: "状态", dataIndex: "requestStatus", render: (v: string) => <StatusTag status={v} /> },
    { title: "最近更新", dataIndex: "lastFollowUpAt", render: (v: string) => relativeTime(v) },
    {
      title: "操作",
      render: (_: unknown, r: Opportunity) => (
        <Space>
          <Button type="link" onClick={() => nav({ to: "/agent/quotations/$id", params: { id: "q1" } })}>
            查看报价
          </Button>
          <Button type="link" onClick={() => nav({ to: "/agent/assistant", search: { q: r.rawRequirement } as never })}>
            继续沟通
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            我的方案
          </Typography.Title>
          <Typography.Text type="secondary">跟踪你在演立方发起的所有活动方案需求。</Typography.Text>
        </div>
        <Button type="primary" size="large" onClick={() => nav({ to: "/agent/assistant" })}>
          + 新建方案
        </Button>
      </div>

      <Card style={{ marginTop: "var(--yl-space-4)", borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: "var(--yl-space-2)" } }}>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={TABS.map((t) => ({
            key: t,
            label: `${t} · ${t === "全部" ? opportunities.length : opportunities.filter((o) => o.requestStatus === t).length}`,
          }))}
          style={{ padding: "0 var(--yl-space-4)" }}
        />
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={false}
          size="middle"
          style={{ padding: "var(--yl-space-2)" }}
        />
      </Card>
    </div>
  );
}