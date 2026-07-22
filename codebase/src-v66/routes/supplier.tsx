import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Button, Space } from "antd";
import { BellOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { AppTopBar } from "../shared/components/AppTopBar";
import { currentOperator } from "../shared/mock/data";

export const Route = createFileRoute("/supplier")({
  component: SupplierLayout,
});

function SupplierLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/supplier/login";
  if (isLogin) return <Outlet />;

  const nav = [
    { label: "销售作战台", to: "/supplier/workspace", active: pathname.startsWith("/supplier/workspace") || pathname === "/supplier" },
    { label: "商机中心", to: "/supplier/opportunities", active: pathname.startsWith("/supplier/opportunities") },
    { label: "线索中心", to: "/supplier/leads", active: pathname.startsWith("/supplier/leads") },
    { label: "方案管理", to: "/supplier/proposals", active: pathname.startsWith("/supplier/proposals") },
    { label: "艺人库", to: "/supplier/artists", active: pathname.startsWith("/supplier/artists") },
    { label: "跟进中心", to: "/supplier/followups", active: pathname.startsWith("/supplier/followups") },
    { label: "报价管理", to: "/supplier/quotations", active: pathname.startsWith("/supplier/quotations") },
    { label: "AI 反馈", to: "/supplier/feedback", active: pathname.startsWith("/supplier/feedback") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0B0E1E" }}>
      <AppTopBar
        variant="dark"
        title="演立方"
        subtitle="AI 销售作战台 · 运营端"
        nav={nav}
        userName={currentOperator.name}
        userRole={`${currentOperator.team} · ${currentOperator.role}`}
        avatarColor={currentOperator.avatarColor}
        right={
          <Space>
            <Button type="text" icon={<BellOutlined style={{ color: "#B5B9C9" }} />} />
            <Button type="text" icon={<SettingOutlined style={{ color: "#B5B9C9" }} />} />
            <Link to="/supplier/login">
              <Button type="text" icon={<LogoutOutlined style={{ color: "#B5B9C9" }} />} />
            </Link>
          </Space>
        }
      />
      <Outlet />
    </div>
  );
}