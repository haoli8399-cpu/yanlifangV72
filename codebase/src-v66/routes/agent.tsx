import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Badge, Button, Space } from "antd";
import { BellOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { AppTopBar } from "../shared/components/AppTopBar";
import { currentUser } from "../shared/mock/data";
import { unreadCount } from "../shared/mock/messages";

export const Route = createFileRoute("/agent")({
  component: AgentLayout,
});

function AgentLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/agent/login";

  if (isLogin) {
    return <Outlet />;
  }

  const nav = [
    { label: "AI 活动顾问", to: "/agent", active: pathname === "/agent" },
    { label: "方案发现", to: "/agent/solutions", active: pathname.startsWith("/agent/solutions") },
    { label: "AI 对话", to: "/agent/assistant", active: pathname.startsWith("/agent/assistant") },
    { label: "我的方案", to: "/agent/requests", active: pathname.startsWith("/agent/requests") || pathname.startsWith("/agent/quotations") },
    { label: "消息中心", to: "/agent/messages", active: pathname.startsWith("/agent/messages") },
  ];

  const unread = unreadCount();

  return (
    <div style={{ minHeight: "100vh", background: "#F5F6FA" }}>
      <AppTopBar
        title="演立方"
        subtitle="AI企业活动方案平台 · 企业端"
        nav={nav}
        userName={currentUser.userName}
        userRole={`${currentUser.companyName} · ${currentUser.role}`}
        avatarColor={currentUser.avatarColor}
        right={
          <Space>
            <Link to="/agent/messages">
              <Badge count={unread} size="small" offset={[-2, 2]}>
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </Link>
            <Link to="/agent/login">
              <Button type="text" icon={<LogoutOutlined />} />
            </Link>
          </Space>
        }
      />
      <div className="agent-shell-content">
        <Outlet />
      </div>
      <style>{`
        .agent-shell-content { padding: 24px 32px; }
        @media (max-width: 767px) {
          .agent-shell-content { padding: 12px; }
        }
      `}</style>
    </div>
  );
}