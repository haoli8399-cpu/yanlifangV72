import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button, Space } from "antd";
import { BellOutlined, LogoutOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { AppTopBar } from "../shared/components/AppTopBar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { pathname } = useLocation();
  if (pathname === "/admin/login") return <Outlet />;

  const nav = [
    { label: "平台大盘", to: "/admin/dashboard", active: pathname.startsWith("/admin/dashboard") || pathname === "/admin" || pathname === "/admin/" },
    { label: "SKU 库", to: "/admin/sku", active: pathname.startsWith("/admin/sku") },
    { label: "艺人库", to: "/admin/artists", active: pathname.startsWith("/admin/artists") },
    { label: "经纪公司", to: "/admin/agencies", active: pathname.startsWith("/admin/agencies") },
    { label: "企业客户", to: "/admin/customers", active: pathname.startsWith("/admin/customers") },
    { label: "订单合同", to: "/admin/orders", active: pathname.startsWith("/admin/orders") },
    { label: "平台字典", to: "/admin/dict", active: pathname.startsWith("/admin/dict") },
    { label: "AI 反馈", to: "/admin/ai-feedback", active: pathname.startsWith("/admin/ai-feedback") },
    { label: "AI 标注", to: "/admin/labeling", active: pathname.startsWith("/admin/labeling") },
    { label: "Prompt 库", to: "/admin/prompts", active: pathname.startsWith("/admin/prompts") },
    { label: "团队与权限", to: "/admin/rbac", active: pathname.startsWith("/admin/rbac") },
    { label: "审计日志", to: "/admin/audit", active: pathname.startsWith("/admin/audit") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--yl-bg-page)" }}>
      <AppTopBar
        variant="light"
        title="演立方"
        subtitle="平台运营端 · Admin Console"
        nav={nav}
        userName="王总"
        userRole="超级管理员"
        avatarColor="var(--yl-primary-active)"
        right={
          <Space>
            <Button type="text" icon={<SafetyCertificateOutlined />} />
            <Button type="text" icon={<BellOutlined />} />
            <Link to="/admin/login">
              <Button type="text" icon={<LogoutOutlined />} />
            </Link>
          </Space>
        }
      />
      <Outlet />
    </div>
  );
}