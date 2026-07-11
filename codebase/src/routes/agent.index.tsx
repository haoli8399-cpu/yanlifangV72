import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Col, Input, Row, Space, Tag, Typography } from "antd";
import { ArrowRightOutlined, RobotFilled, SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import { opportunities, scenarioQuickPicks, solutions } from "../shared/mock/data";
import { SolutionCard } from "../shared/components/SolutionCard";
import { StatusTag } from "../shared/components/StatusTag";
import { relativeTime, wan } from "../shared/components/formatters";

export const Route = createFileRoute("/agent/")({
  component: AgentHome,
});

function AgentHome() {
  const nav = useNavigate();
  const [input, setInput] = useState("");

  const go = (text: string) => {
    nav({ to: "/agent/assistant", search: { q: text } as never });
  };

  const recentRequests = opportunities.slice(0, 4);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* AI 活动方案顾问 · Hero */}
      <Card
        style={{
          borderRadius: "var(--yl-radius-xl)",
          background: "linear-gradient(135deg, #1B1550 0%, var(--yl-primary-active) 45%, var(--yl-primary) 100%)",
          border: "none",
          color: "#fff",
          overflow: "hidden",
        }}
        styles={{ body: { padding: "var(--yl-space-10)" } }}
      >
        <Space size="var(--yl-space-3)">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--yl-radius-lg)",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            <RobotFilled />
          </div>
          <div>
            <div style={{ font: "var(--yl-text-caption)", letterSpacing: 1, color: "rgba(255,255,255,.7)" }}>AI 活动方案顾问</div>
            <div style={{ font: "var(--yl-text-heading-3)", fontWeight: 700 }}>描述您的企业活动需求，AI为您生成活动方案</div>
          </div>
        </Space>

        <div style={{ marginTop: "var(--yl-space-6)", display: "flex", gap: "var(--yl-space-3)" }}>
          <Input
            size="large"
            placeholder="例如：公司300人年会，需要一场脱口秀"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={() => input.trim() && go(input.trim())}
            style={{
            flex: 1,
            height: 56,
            borderRadius: "var(--yl-radius-lg)",
            font: "var(--yl-text-body-md)",
            fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
            styles={{
              input: { background: "transparent", color: "#fff" },
            }}
          />
          <Button
            size="large"
            type="primary"
            icon={<SendOutlined />}
            style={{ height: 56, minWidth: 130, background: "var(--yl-success)", borderColor: "var(--yl-success)", font: "var(--yl-text-heading-4)" }}
            onClick={() => input.trim() && go(input.trim())}
          >
            让 AI 推荐
          </Button>
        </div>

        <div style={{ marginTop: "var(--yl-space-6)" }}>
          <div style={{ font: "var(--yl-text-caption)", color: "rgba(255,255,255,.7)", marginBottom: 10 }}>热门场景 · 一键开始</div>
          <Space wrap size="var(--yl-space-2)">
            {scenarioQuickPicks.map((s) => (
              <Button
                key={s.key}
                size="large"
                onClick={() => go(`我们计划办一场${s.label}，${s.desc}`)}
                style={{
                  height: 44,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#fff",
                  borderRadius: "var(--yl-radius-md)",
                  font: "var(--yl-text-body-md)",
                }}
              >
                {s.label} · <span style={{ color: "rgba(255,255,255,.65)", font: "var(--yl-text-caption)" }}>{s.desc}</span>
              </Button>
            ))}
          </Space>
        </div>
      </Card>

      {/* 推荐方案 */}
      <div style={{ marginTop: "var(--yl-space-8)", marginBottom: "var(--yl-space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          为你推荐的方案
        </Typography.Title>
        <Button type="link" onClick={() => nav({ to: "/agent/solutions" })}>
          浏览全部方案 <ArrowRightOutlined />
        </Button>
      </div>
      <Row gutter="var(--yl-space-4)">
        {solutions.slice(0, 3).map((s, i) => (
          <Col key={s.id} xs={24} md={8}>
            <SolutionCard
              solution={s}
              highlight={i === 1}
              onGetQuote={() => nav({ to: "/agent/quotations/$id", params: { id: "q1" } })}
              onView={() => nav({ to: "/agent/solutions" })}
            />
          </Col>
        ))}
      </Row>

      {/* 最近需求 */}
      <div style={{ marginTop: "var(--yl-space-8)", marginBottom: "var(--yl-space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          最近需求
        </Typography.Title>
        <Button type="link" onClick={() => nav({ to: "/agent/requests" })}>
          查看全部 <ArrowRightOutlined />
        </Button>
      </div>
      <Row gutter="var(--yl-space-4)">
        {recentRequests.map((o) => (
          <Col key={o.id} xs={24} md={12} lg={6}>
            <Card
              hoverable
              onClick={() => nav({ to: "/agent/requests" })}
              styles={{ body: { padding: "var(--yl-space-4)" } }}
              style={{ borderRadius: "var(--yl-radius-lg)" }}
            >
              <Space orientation="vertical" size="var(--yl-space-2)" style={{ width: "100%" }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Tag color="purple" style={{ borderRadius: "var(--yl-radius-sm)", margin: 0 }}>
                    {o.code}
                  </Tag>
                  <StatusTag status={o.requestStatus} />
                </Space>
                <Typography.Text strong>{o.event.type} · {o.event.scene}</Typography.Text>
                <Typography.Text type="secondary" style={{ font: "var(--yl-text-caption)" }}>
                  {o.event.date} · {o.event.headcount}人 · 预算 {wan(o.event.budget)}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ font: "var(--yl-text-caption)" }}>
                  最近更新 · {relativeTime(o.lastFollowUpAt)}
                </Typography.Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}