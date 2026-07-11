import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Form, Input, Segmented, Space, Typography, message } from "antd";
import { MobileOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useState } from "react";

export const Route = createFileRoute("/agent/login")({
  component: AgentLogin,
});

function AgentLogin() {
  const nav = useNavigate();
  const [role, setRole] = useState<string | number>("活动公司");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendCode = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      });
    }, 1000);
    message.success("验证码已发送（Demo：直接使用 123456）");
  };

  const onFinish = async () => {
    message.success(`欢迎回来，${role} 用户`);
    nav({ to: "/agent" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        background: "var(--yl-bg-page)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1B1550, var(--yl-primary-active) 55%, var(--yl-primary))",
          color: "#fff",
          padding: "var(--yl-space-20) var(--yl-space-15)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Space size="var(--yl-space-3)">
          <div style={{ width: 44, height: 44, borderRadius: "var(--yl-radius-lg)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", font: "var(--yl-text-heading-2)", fontWeight: 800 }}>
            演
          </div>
          <div>
            <div style={{ font: "var(--yl-text-heading-3)", fontWeight: 700 }}>演立方</div>
            <div style={{ font: "var(--yl-text-caption)", color: "rgba(255,255,255,.7)" }}>演立方 · AI企业活动方案平台</div>
          </div>
        </Space>

        <div>
          <Typography.Title style={{ color: "#fff", font: "var(--yl-text-heading-1)", fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
            一句话，
            <br />
            拿到专业的企业活动方案。
          </Typography.Title>
          <Typography.Paragraph style={{ color: "rgba(255,255,255,.75)", font: "var(--yl-text-body-md)", marginTop: "var(--yl-space-4)", maxWidth: 420 }}>
            AI 活动方案顾问已服务字节跳动、美团、蔚来汽车等 800+ 家企业客户，帮助你把模糊需求快速转化为完成的成交。
          </Typography.Paragraph>
        </div>

        <div style={{ font: "var(--yl-text-caption)", color: "rgba(255,255,255,.5)" }}>© 演立方 · PRD V4.7 · 前端原型 Demo</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--yl-space-10)" }}>
        <Card style={{ width: 420, borderRadius: "var(--yl-radius-xl)" }} styles={{ body: { padding: "var(--yl-space-9)" } }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            登录 演立方
          </Typography.Title>
          <Typography.Text type="secondary">选择你的企业身份，开启 AI 活动方案服务</Typography.Text>

          <div style={{ marginTop: 24 }}>
            <Segmented
              block
              options={["活动公司", "企业客户"]}
              value={role}
              onChange={setRole}
            />
          </div>

          <Form layout="vertical" style={{ marginTop: 24 }} onFinish={onFinish}>
            <Form.Item label="手机号" name="phone" initialValue="13800002091" rules={[{ required: true, message: "请输入手机号" }]}>
              <Input size="large" prefix={<MobileOutlined />} placeholder="请输入 11 位手机号" maxLength={11} />
            </Form.Item>
            <Form.Item label="短信验证码" required>
              <Space.Compact style={{ width: "100%" }}>
                <Input size="large" prefix={<SafetyCertificateOutlined />} placeholder="6 位验证码" defaultValue="123456" />
                <Button size="large" onClick={sendCode} loading={sending} disabled={cooldown > 0}>
                  {cooldown > 0 ? `${cooldown}s 后重发` : "发送验证码"}
                </Button>
              </Space.Compact>
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block style={{ height: 46, font: "var(--yl-text-heading-4)", marginTop: "var(--yl-space-2)" }}>
              进入 演立方
            </Button>
          </Form>

          <div style={{ marginTop: "var(--yl-space-4)", textAlign: "center", font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
            登录即代表同意《服务协议》与《隐私政策》
          </div>
        </Card>
      </div>
    </div>
  );
}