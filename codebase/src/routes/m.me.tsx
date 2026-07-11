import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Avatar, Card, List, Space, Tag, Typography } from "antd";
import {
  FileTextOutlined,
  HeartFilled,
  SettingOutlined,
  RightOutlined,
  ShopOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { currentUser, quotations } from "../shared/mock/data";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/m/me")({
  component: MMe,
});

function MMe() {
  const nav = useNavigate();

  const menu = [
    { icon: <FileTextOutlined />, label: "我的订单", extra: `${quotations.length} 单`, to: "/agent/requests" },
    { icon: <HeartFilled />, label: "收藏方案", extra: "3 条", to: "/m/discover" },
    { icon: <ShopOutlined />, label: "企业信息", extra: currentUser.companyName, to: "/m/me" },
    { icon: <CustomerServiceOutlined />, label: "联系客服", extra: "在线", to: "/m/messages" },
    { icon: <SettingOutlined />, label: "沟通偏好设置", extra: "松弛感喜剧", to: "/m/me" },
    { icon: <LogoutOutlined />, label: "退出登录", to: "/agent/login" },
  ];

  return (
    <div>
      <div style={{
        padding: "36px var(--yl-space-5) var(--yl-space-10)",
        background: "linear-gradient(160deg,var(--yl-primary),var(--yl-primary-active))",
        color: "#fff",
        borderBottomLeftRadius: "var(--yl-radius-xl)",
        borderBottomRightRadius: "var(--yl-radius-xl)",
      }}>
        <Space size={14}>
          <Avatar size={56} style={{ background: currentUser.avatarColor, font: "var(--yl-text-heading-2)", fontWeight: 700 }}>
            {currentUser.userName.slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ font: "var(--yl-text-heading-3)", fontWeight: 700 }}>{currentUser.userName}</div>
            <div style={{ font: "var(--yl-text-caption)", opacity: 0.85 }}>{currentUser.role} · {currentUser.companyName}</div>
            <StatusTag status="VIP" />
          </div>
        </Space>
      </div>

      <div style={{ padding: "var(--yl-space-4)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--yl-space-2)" }}>
        {[
          { v: quotations.length, l: "历史报价" },
          { v: 3, l: "已成交" },
          { v: 5, l: "收藏方案" },
        ].map((s) => (
          <Card key={s.l} styles={{ body: { padding: "var(--yl-space-3)" } }} style={{ borderRadius: "var(--yl-radius-lg)", textAlign: "center" }}>
            <div style={{ font: "var(--yl-text-numeric-sm)", fontWeight: 800, color: "var(--yl-primary)" }}>{s.v}</div>
            <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)", marginTop: 2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card style={{ margin: "0 var(--yl-space-3) var(--yl-space-5)", borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: 0 } }}>
        <List
          dataSource={menu}
          renderItem={(m) => (
            <List.Item style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => nav({ to: m.to as never })}>
              <List.Item.Meta
                avatar={
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: "var(--yl-primary-subtle)",
                    color: "var(--yl-primary)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{m.icon}</div>
                }
                title={<span style={{ font: "var(--yl-text-body-md)" }}>{m.label}</span>}
              />
              <Space>
                {m.extra && <Typography.Text type="secondary" style={{ font: "var(--yl-text-caption)" }}>{m.extra}</Typography.Text>}
                <RightOutlined style={{ color: "#C4C8D4", font: "var(--yl-text-caption)" }} />
              </Space>
            </List.Item>
          )}
        />
      </Card>

      <div style={{ textAlign: "center", padding: "0 0 24px", color: "var(--yl-text-tertiary)", fontSize: 11 }}>
        演立方 · V3.3.3
      </div>
    </div>
  );
}