import { Avatar, Button, Drawer, Space } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useIsMobile } from "../../hooks/use-mobile";

interface Props {
  title: string;
  subtitle?: string;
  logo?: ReactNode;
  right?: ReactNode;
  nav?: { label: string; to: string; active?: boolean }[];
  variant?: "light" | "dark";
  userName?: string;
  userRole?: string;
  avatarColor?: string;
}

export function AppTopBar({ title, subtitle, logo, right, nav, variant = "light", userName, userRole, avatarColor }: Props) {
  const dark = variant === "dark";
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);
  return (
    <div
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        padding: isMobile ? "0 12px" : "0 24px",
        background: dark ? "#0F1222" : "#fff",
        borderBottom: `1px solid ${dark ? "#1E2138" : "#EEF0F5"}`,
        color: dark ? "#fff" : "#0F1222",
        gap: isMobile ? 8 : 32,
      }}
    >
      {isMobile && nav && (
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: dark ? "#fff" : "#0F1222" }} />}
          onClick={() => setOpen(true)}
        />
      )}
      <Space size={12}>
        {logo ?? (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6E59F5, #4B34D1)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "var(--yl-text-heading-4)",
            }}
          >
            演
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 700, color: dark ? "#fff" : "#0F1222" }}>{title}</div>
          {subtitle && !isMobile && (
            <div style={{ font: "var(--yl-text-caption-xs)", color: "#8B92A8", marginTop: -2 }}>{subtitle}</div>
          )}
        </div>
      </Space>

      {nav && !isMobile && (
        <Space size={4}>
          {nav.map((n) => (
            <Link
                key={n.to}
                to={n.to as never}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  color: n.active ? (dark ? "#fff" : "#0F1222") : dark ? "#B5B9C9" : "#5B6178",
                  background: n.active ? (dark ? "#1E2138" : "#F4F1FF") : "transparent",
                  fontWeight: n.active ? 600 : 500,
                  font: "var(--yl-text-body-sm)",
                  textDecoration: "none",
                }}
              >
              {n.label}
            </Link>
          ))}
        </Space>
      )}

      <div style={{ flex: 1 }} />
      {right}
      {userName && !isMobile && (
        <Space size={10}>
          <Avatar style={{ background: avatarColor ?? "#6E59F5" }}>{userName.slice(0, 1)}</Avatar>
          <div style={{ textAlign: "right" }}>
            <div style={{ font: "var(--yl-text-body-sm)", fontWeight: 600, color: dark ? "#fff" : "#0F1222" }}>{userName}</div>
            <div style={{ font: "var(--yl-text-caption-xs)", color: "#8B92A8" }}>{userRole}</div>
          </div>
        </Space>
      )}
      {userName && isMobile && (
        <Avatar size={32} style={{ background: avatarColor ?? "#6E59F5" }}>{userName.slice(0, 1)}</Avatar>
      )}

      {nav && (
        <Drawer
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          size={280}
          title={title}
          styles={{ body: { padding: 12 } }}
        >
          {userName && (
            <Space size={10} style={{ marginBottom: 16 }}>
              <Avatar style={{ background: avatarColor ?? "#6E59F5" }}>{userName.slice(0, 1)}</Avatar>
              <div>
                <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 600 }}>{userName}</div>
                <div style={{ font: "var(--yl-text-caption)", color: "#8B92A8" }}>{userRole}</div>
              </div>
            </Space>
          )}
          <Space orientation="vertical" size={4} style={{ width: "100%" }}>
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to as never}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 8,
                  color: n.active ? "#6E59F5" : "#0F1222",
                  background: n.active ? "#F4F1FF" : "transparent",
                  fontWeight: n.active ? 600 : 500,
                  font: "var(--yl-text-body-md)",
                  textDecoration: "none",
                }}
              >
                {n.label}
              </Link>
            ))}
          </Space>
        </Drawer>
      )}
    </div>
  );
}
