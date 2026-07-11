import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(700px 500px at 30% 20%, rgba(75,52,209,.18), transparent), #0B0E1E" }}>
      <Card style={{ width: 420, background: "#141830", border: "1px solid #1E2138", borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: 36 } }}>
        <Space size={12}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--yl-radius-md)", background: "linear-gradient(135deg, var(--yl-primary-active), var(--yl-primary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>演</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700 }}>演立方 · Admin Console</div>
            <div style={{ color: "var(--yl-text-tertiary)", fontSize: "var(--yl-text-caption)" }}>平台运营与治理后台</div>
          </div>
        </Space>
        <Typography.Title level={3} style={{ color: "#fff", marginTop: "var(--yl-space-6)" }}>
          管理员登录
        </Typography.Title>
        <Form layout="vertical" initialValues={{ user: "admin", pwd: "demo123" }} onFinish={() => { message.success("登录成功"); nav({ to: "/admin/dashboard" }); }}>
          <Form.Item name="user" label={<span style={{ color: "var(--yl-text-tertiary)" }}>账号</span>} rules={[{ required: true }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="管理员账号" />
          </Form.Item>
          <Form.Item name="pwd" label={<span style={{ color: "var(--yl-text-tertiary)" }}>密码</span>} rules={[{ required: true }]}>
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="管理员密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block style={{ height: 46 }}>登录</Button>
        </Form>
        <div style={{ color: "var(--yl-text-secondary)", fontSize: "var(--yl-text-caption)", textAlign: "center", marginTop: "var(--yl-space-4)" }}>Demo：admin / demo123</div>
      </Card>
    </div>
  );
}