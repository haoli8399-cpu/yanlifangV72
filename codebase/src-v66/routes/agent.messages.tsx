import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Badge, Button, Card, Empty, List, Segmented, Space, Tag, Typography } from "antd";
import { BellFilled, CheckOutlined, RobotFilled } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { notifications as seed, type AppNotification } from "../shared/mock/messages";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/agent/messages")({
  component: MessagesPage,
});

const TABS = ["全部", "系统", "报价", "AI提醒", "客服"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<string, string> = {
  全部: "全部",
  系统: "系统",
  报价: "方案",
  AI提醒: "AI提醒",
  客服: "客服",
};

const typeColor: Record<AppNotification["type"], string> = {
  系统: "default",
  报价: "purple",
  AI提醒: "geekblue",
  客服: "orange",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

function MessagesPage() {
  const nav = useNavigate();
  const [list, setList] = useState<AppNotification[]>(seed);
  const [tab, setTab] = useState<Tab>("全部");

  const filtered = useMemo(
    () => (tab === "全部" ? list : list.filter((n) => n.type === tab)),
    [list, tab],
  );

  const unread = list.filter((n) => !n.read).length;

  const markAllRead = () => setList((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Space style={{ justifyContent: "space-between", width: "100%", marginBottom: "var(--yl-space-3)" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            <BellFilled style={{ color: "var(--yl-primary)", marginRight: 8 }} />
            消息中心
            {unread > 0 && (
              <Badge count={unread} style={{ marginLeft: 8, backgroundColor: "#F5222D" }} />
            )}
          </Typography.Title>
          <Typography.Text type="secondary">系统通知 · 方案通知 · AI 提醒 · 客服消息</Typography.Text>
        </div>
        <Button icon={<CheckOutlined />} disabled={unread === 0} onClick={markAllRead}>
          全部标为已读
        </Button>
      </Space>

      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: "var(--yl-radius-lg)" }}>
        <div style={{ padding: "var(--yl-space-4)", borderBottom: "1px solid var(--yl-border-subtle)" }}>
          <Segmented
            block
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            options={TABS.map((t) => ({
              value: t,
              label:
                t === "全部"
                  ? `全部 (${list.length})`
                  : `${TAB_LABELS[t]} (${list.filter((n) => n.type === t).length})`,
            }))}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "var(--yl-space-10)" }}>
            <Empty description="暂无消息" />
          </div>
        ) : (
          <List
            dataSource={filtered}
            renderItem={(n) => (
              <List.Item
                style={{
                  padding: "var(--yl-space-4) var(--yl-space-5)",
                  background: n.read ? "#fff" : "var(--yl-bg-ai)",
                  cursor: n.link ? "pointer" : "default",
                  alignItems: "flex-start",
                }}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) nav({ to: n.link.to as never, params: n.link.params as never });
                }}
                actions={[
                  <Typography.Text type="secondary" style={{ font: "var(--yl-text-caption)" }} key="t">
                    {timeAgo(n.createdAt)}
                  </Typography.Text>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!n.read} offset={[-4, 4]}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--yl-radius-md)",
                          background: n.type === "AI提醒" ? "var(--yl-primary-subtle)" : "var(--yl-bg-page)",
                          color: "var(--yl-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {n.type === "AI提醒" ? <RobotFilled /> : <BellFilled />}
                      </div>
                    </Badge>
                  }
                  title={
                    <Space>
                      <StatusTag status={n.type} />
                      <span style={{ fontWeight: n.read ? 500 : 700, font: "var(--yl-text-body-md)" }}>{n.title}</span>
                    </Space>
                  }
                  description={
                    <span style={{ color: "var(--yl-text-secondary)", font: "var(--yl-text-body-sm)" }}>{n.body}</span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}