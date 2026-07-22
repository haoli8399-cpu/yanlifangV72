import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Badge } from "antd";
import { HomeFilled, AppstoreFilled, MessageFilled, UserOutlined } from "@ant-design/icons";
import { RobotFilled } from "@ant-design/icons";
import { unreadCount } from "../shared/mock/messages";

export const Route = createFileRoute("/m")({
  component: MobileShell,
});

const TABS = [
  { key: "/m", label: "首页", icon: <HomeFilled /> },
  { key: "/m/discover", label: "找方案", icon: <AppstoreFilled /> },
  { key: "/m/submit", label: "提需求", icon: <RobotFilled />, primary: true },
  { key: "/m/messages", label: "消息", icon: <MessageFilled /> },
  { key: "/m/me", label: "我的", icon: <UserOutlined /> },
];

function MobileShell() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const unread = unreadCount();

  const isActive = (key: string) =>
    key === "/m" ? pathname === "/m" : pathname === key || pathname.startsWith(`${key}/`);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--yl-bg-page)",
        position: "relative",
        boxShadow: "0 0 40px rgba(0,0,0,.06)",
        paddingBottom: 68,
      }}
    >
      <Outlet />

      {/* Bottom tab bar */}
      <nav
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 0,
          width: "100%",
          maxWidth: 480,
          height: 60,
          background: "#fff",
          borderTop: "1px solid var(--yl-border-subtle)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          zIndex: 20,
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        {TABS.map((t) => {
          const active = isActive(t.key);
          return (
            <button
              key={t.key}
              onClick={() => nav({ to: t.key as never })}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                color: active ? "var(--yl-primary)" : "var(--yl-text-tertiary)",
                font: "var(--yl-text-caption-xs)",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {t.primary ? (
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--yl-primary),var(--yl-primary-active))",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 24px rgba(91,79,214,.4)",
                    fontSize: "var(--yl-font-heading-3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(91,79,214,.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 10px 24px rgba(91,79,214,.4)";
                  }}
                >
                  {t.icon}
                </div>
              ) : (
                <div style={{ fontSize: "var(--yl-font-heading-4)", position: "relative" }}>
                  {t.icon}
                  {t.key === "/m/messages" && unread > 0 && (
                    <Badge
                      count={unread}
                      size="small"
                      style={{ position: "absolute", top: -6, right: -12 }}
                    />
                  )}
                </div>
              )}
              <span style={{ marginTop: t.primary ? 30 : 0 }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}