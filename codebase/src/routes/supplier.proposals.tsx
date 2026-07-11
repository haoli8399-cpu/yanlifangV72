import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
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
import { CopyOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { mockProposals } from "../shared/mock/data";
import type { Proposal } from "../shared/types";
import { StatusTag } from "../shared/components/StatusTag";
import { relativeTime } from "../shared/components/formatters";

export const Route = createFileRoute("/supplier/proposals")({
  component: ProposalCenter,
});

// ============ 常量 ============

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  internal_review: "内部审核",
  shared: "已分享",
  viewed: "已查看",
  downloaded: "已下载",
  modified_by_client: "客户已修改",
  revised: "已修订",
  approved: "已确认",
  converted_to_order: "已转订单",
  lost: "丢单",
};

const STATUS_TABS = [
  "全部",
  "draft",
  "shared",
  "viewed",
  "downloaded",
  "approved",
  "converted_to_order",
  "lost",
] as const;

// ============ 组件 ============

function ProposalCenter() {
  const nav = useNavigate();
  const routerState = useRouterState();
  const [status, setStatus] = useState<string>("全部");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  // 如果当前在子路由（如 /supplier/proposals/prop-001），渲染子路由内容
  const isChildRoute = routerState.matches.some(
    (m) => m.routeId === '/supplier/proposals/$id'
  );
  if (isChildRoute) {
    return <Outlet />;
  }

  const list = useMemo(() => {
    return mockProposals.filter((p) => {
      if (status !== "全部" && p.status !== status) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (
          !`${p.code}${p.customerName}${p.eventTheme}${p.createdBy ?? ""}`
            .toLowerCase()
            .includes(kw)
        )
          return false;
      }
      return true;
    });
  }, [status, keyword]);

  const handleCopyLink = (record: Proposal) => {
    const link = `https://yanlifang.com/p/${record.code}`;
    navigator.clipboard.writeText(link).then(
      () => message.success("方案链接已复制"),
      () => message.error("复制失败，请手动复制")
    );
  };

  const columns: TableColumnsType<Proposal> = [
    {
      title: "方案编号",
      dataIndex: "code",
      width: 150,
      render: (code: string, record) => (
        <Typography.Link
          style={{ fontFamily: "monospace", fontWeight: 500 }}
          onClick={() =>
            nav({ to: "/supplier/proposals/$id", params: { id: record.id } })
          }
        >
          {code}
        </Typography.Link>
      ),
    },
    {
      title: "客户",
      dataIndex: "customerName",
      width: 150,
      render: (name: string) => (
        <span style={{ fontWeight: 600 }}>{name}</span>
      ),
    },
    {
      title: "活动主题",
      dataIndex: "eventTheme",
      ellipsis: true,
    },
    {
      title: "预算",
      dataIndex: "budget",
      width: 100,
      render: (b: string) => b || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      render: (s: string) => <StatusTag status={s} label={STATUS_LABELS[s]} />,
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      width: 90,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 110,
      render: (t: string) => (
        <span style={{ color: "var(--yl-text-tertiary)" }}>{relativeTime(t)}</span>
      ),
    },
    {
      title: "操作",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined />}
            onClick={() =>
              nav({ to: "/supplier/proposals/$id", params: { id: record.id } })
            }
          >
            编辑
          </Button>
          {(record.status === "shared" || record.status === "approved") && (
            <Button
              size="small"
              type="link"
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(record)}
            >
              复制链接
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "var(--yl-space-5)" }}>
      <Card style={{ borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: "var(--yl-space-4)" } }}>
        {/* 顶部标题栏 */}
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "var(--yl-space-3)",
          }}
        >
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>
              方案管理
            </Typography.Title>
            <Tag color="purple">{list.length} 条方案</Tag>
          </Space>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索方案编号/客户名..."
              style={{ width: 260 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Space>
        </Space>

        {/* 状态筛选 */}
        <Segmented
          block
          options={STATUS_TABS.map((k) => ({
            label: k === "全部" ? "全部" : STATUS_LABELS[k],
            value: k,
          }))}
          value={status}
          onChange={(v) => setStatus(v as string)}
        />

        {/* 表格 */}
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: "var(--yl-space-3)" }} />
        ) : list.length === 0 ? (
          <Empty description="暂无方案" style={{ padding: "var(--yl-space-8) 0" }} />
        ) : (
          <Table<Proposal>
            style={{ marginTop: "var(--yl-space-3)" }}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            dataSource={list}
            columns={columns}
            scroll={{ x: 1100 }}
            onRow={(record) => ({
              style: { cursor: "pointer" },
              onClick: () =>
                nav({
                  to: "/supplier/proposals/$id",
                  params: { id: record.id },
                }),
            })}
          />
        )}
      </Card>
    </div>
  );
}
