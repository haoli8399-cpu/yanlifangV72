import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

export const Route = createFileRoute("/supplier/login")({
  component: SupplierLogin,
});

function SupplierLogin() {
  const nav = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(800px 500px at 20% 20%, rgba(110,89,245,.2), transparent), radial-gradient(700px 500px at 80% 60%, rgba(0,185,107,.15), transparent), #0B0E1E",
      }}
    >
      <Card style={{ width: 420, background: "#141830", border: "1px solid #1E2138", borderRadius: 16 }} styles={{ body: { padding: 36 } }}>
        <Space size={12}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #6E59F5, #4B34D1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>演</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700 }}>演立方 · 运营端</div>
            <div style={{ color: "#8B92A8", fontSize: "var(--yl-text-caption)" }}>AI 销售作战台</div>
          </div>
        </Space>
        <Typography.Title level={3} style={{ color: "#fff", marginTop: 24 }}>
          运营账号登录
        </Typography.Title>
        <Form
          layout="vertical"
          initialValues={{ user: "zhang.op", pwd: "demo123" }}
          onFinish={() => {
            message.success("登录成功，进入作战台");
            nav({ to: "/supplier/workspace" });
          }}
        >
          <Form.Item name="user" label={<span style={{ color: "#B5B9C9" }}>工号 / 邮箱</span>} rules={[{ required: true }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="请输入运营账号" />
          </Form.Item>
          <Form.Item name="pwd" label={<span style={{ color: "#B5B9C9" }}>密码</span>} rules={[{ required: true }]}>
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block style={{ height: 46 }}>
            登录
          </Button>
        </Form>
        <div style={{ color: "#5B6178", fontSize: "var(--yl-text-caption)", textAlign: "center", marginTop: 16 }}>
          Demo 账号：zhang.op / demo123
        </div>
      </Card>
    </div>
  );
}