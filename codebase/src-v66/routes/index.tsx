import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Card, Space, Typography } from "antd";
import { ArrowRightOutlined, RobotFilled, ThunderboltFilled, CalculatorOutlined, BankOutlined, GiftOutlined } from "@ant-design/icons";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 500px at 20% 0%, rgba(91,79,214,.18), transparent), radial-gradient(900px 500px at 90% 30%, rgba(0,135,90,.10), transparent), var(--yl-bg-page)",
        color: "var(--yl-text-on-primary)",
        padding: "var(--yl-space-10) var(--yl-space-10) var(--yl-space-6)",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* 品牌Logo */}
        <Space size={12}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--yl-radius-lg)",
              background: "linear-gradient(135deg, var(--yl-primary), var(--yl-primary-active))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--yl-font-heading-3)",
              fontWeight: 800,
            }}
          >
            演
          </div>
          <div>
            <div style={{ font: "var(--yl-text-heading-3)", fontWeight: 700 }}>演立方</div>
            <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>AI提案获客与内容供应链平台 · 前端原型 V4.7</div>
          </div>
        </Space>

        {/* Hero区 */}
        <div style={{ marginTop: "var(--yl-space-10)", maxWidth: 780, textAlign: "center", margin: "var(--yl-space-10) auto 0" }}>
          <Typography.Title style={{ color: "#fff", font: "var(--yl-text-display-lg)", fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
            让每一场企业活动，
            <br />
            都从「一句话」开始成交。
          </Typography.Title>
          <Typography.Paragraph style={{ color: "var(--yl-text-tertiary)", font: "var(--yl-text-body-md)", marginTop: "var(--yl-space-5)" }}>
            AI帮助企业10分钟生成专业活动方案，无需懂演出，说出来就行
          </Typography.Paragraph>
        </div>

        {/* 增长工具入口 — 3卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--yl-space-5)", marginTop: "var(--yl-space-10)" }}>
          <ToolCard
            emoji="🎯"
            title="企业活动预算计算器"
            desc="不知道花多少钱？先算算"
            to="/tools/budget-calculator"
          />
          <ToolCard
            emoji="🏦"
            title="保险行业活动方案"
            desc="保险客户活动怎么做更有效"
            to="/tools/insurance-plan"
          />
          <ToolCard
            emoji="🎉"
            title="年会/团建方案"
            desc="年会不再尴尬，一键出方案"
            to="/tools/annual-plan"
          />
        </div>

        {/* 4端入口 — 简化按钮 */}
        <div style={{ marginTop: "var(--yl-space-10)" }}>
          <Typography.Text style={{ color: "var(--yl-text-tertiary)", font: "var(--yl-text-caption)", display: "block", marginBottom: "var(--yl-space-4)", textAlign: "center", opacity: 0.8 }}>
            选择您的角色入口
          </Typography.Text>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--yl-space-3)" }}>
            <Link to="/agent">
              <Button block size="large" icon={<RobotFilled />}
                style={{ height: 44, borderRadius: "var(--yl-radius-md)", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "var(--yl-text-tertiary)", font: "var(--yl-text-body-sm)", fontWeight: 500 }}>
                客户端 · AI 顾问
              </Button>
            </Link>
            <Link to="/supplier">
              <Button block size="large" icon={<ThunderboltFilled />}
                style={{ height: 44, borderRadius: "var(--yl-radius-md)", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "var(--yl-text-tertiary)", font: "var(--yl-text-body-sm)", fontWeight: 500 }}>
                运营端 · 作战台
              </Button>
            </Link>
            <Link to="/m">
              <Button block size="large" icon={<RobotFilled />}
                style={{ height: 44, borderRadius: "var(--yl-radius-md)", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "var(--yl-text-tertiary)", font: "var(--yl-text-body-sm)", fontWeight: 500 }}>
                移动端 · 小程序
              </Button>
            </Link>
            <Link to="/admin">
              <Button block size="large" icon={<ThunderboltFilled />}
                style={{ height: 44, borderRadius: "var(--yl-radius-md)", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "var(--yl-text-tertiary)", font: "var(--yl-text-body-sm)", fontWeight: 500 }}>
                平台端 · Admin
              </Button>
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "var(--yl-space-10)", color: "var(--yl-text-tertiary)", font: "var(--yl-text-caption)", textAlign: "center", opacity: 0.6 }}>
          © 演立方 · 本项目为按前端原型交付，Mock 数据 + 模拟 AI，暂未接入后端。
        </div>
      </div>
    </div>
  );
}

function ToolCard({ emoji, title, desc, to }: { emoji: string; title: string; desc: string; to: string }) {
  return (
    <Link to={to as never} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--yl-radius-xl)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        styles={{ body: { padding: "var(--yl-space-6)" } }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(91,79,214,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ fontSize: "var(--yl-font-display-sm)", marginBottom: "var(--yl-space-4)" }}>{emoji}</div>
        <div style={{ font: "var(--yl-text-heading-3)", fontWeight: 700, color: "var(--yl-text-on-primary)", marginBottom: "var(--yl-space-2)" }}>{title}</div>
        <div style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-tertiary)", lineHeight: 1.5, opacity: 0.7 }}>{desc}</div>
        <div style={{ marginTop: "var(--yl-space-4)", color: "var(--yl-primary)", font: "var(--yl-text-body-sm)", fontWeight: 600, display: "flex", alignItems: "center", gap: "var(--yl-space-1)" }}>
          立即测算 <ArrowRightOutlined />
        </div>
      </Card>
    </Link>
  );
}
