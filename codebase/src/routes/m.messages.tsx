import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Badge, Empty, List, Segmented, Space, Tag, Typography } from "antd";
import { BellFilled, RobotFilled } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { notifications as seed, type AppNotification } from "../shared/mock/messages";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/m/messages")({
  component: MMessages,
});

const TABS = ["全部", "系统", "报价", "AI提醒", "客服"] as const;
type Tab = (typeof TABS)[number];

const typeColor: Record<AppNotification["type"], string> = {
  系统: "default",
  报价: "purple",
  AI提醒: "geekblue",
  客服: "orange",
};

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

function MMessages() {
  const nav = useNavigate();
  const [list, setList] = useState(seed);
  const [tab, setTab] = useState<Tab>("全部");
  const filtered = useMemo(
    () => (tab === "全部" ? list : list.filter((n) => n.type === tab)),
    [list, tab],
  );
  const unread = list.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ padding: "var(--yl-space-5) var(--yl-space-5) var(--yl-space-3)", background: "#fff", borderBottom: "1px solid var(--yl-border-subtle)" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          消息 {unread > 0 && <Badge count={unread} style={{ marginLeft: 8, background: "#F5222D" }} />}
        </Typography.Title>
        <div style={{ marginTop: "var(--yl-space-3)" }}>
          <Segmented block size="small" value={tab} onChange={(v) => setTab(v as Tab)} options={TABS.slice()} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "var(--yl-space-10)" }}><Empty description="暂无消息" /></div>
      ) : (
        <List
          style={{ background: "#fff", margin: "var(--yl-space-3)", borderRadius: "var(--yl-radius-lg)", overflow: "hidden" }}
          dataSource={filtered}
          renderItem={(n) => (
            <List.Item
              style={{ padding: "var(--yl-space-3) var(--yl-space-4)", background: n.read ? "#fff" : "#FAF9FF", cursor: "pointer" }}
              onClick={() => {
                setList((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                if (n.link) nav({ to: n.link.to as never, params: n.link.params as never });
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!n.read}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: n.type === "AI提醒" ? "var(--yl-primary-subtle)" : "var(--yl-bg-page)",
                      color: "var(--yl-primary)", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {n.type === "AI提醒" ? <RobotFilled /> : <BellFilled />}
                    </div>
                  </Badge>
                }
                title={
                  <Space size={6}>
                    <StatusTag status={n.type} />
                    <span style={{ font: "var(--yl-text-body-sm)", fontWeight: n.read ? 500 : 700 }}>{n.title}</span>
                  </Space>
                }
                description={
                  <div>
                    <div style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)", lineHeight: 1.6 }}>{n.body}</div>
                    <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}