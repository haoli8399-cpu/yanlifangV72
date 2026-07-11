import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, Input, Space, Tag, Typography } from "antd";
import { RobotFilled, ArrowRightOutlined, FireFilled } from "@ant-design/icons";
import { useState } from "react";
import { solutions } from "../shared/mock/data";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/m/")({
  component: MHome,
});

const SCENES = ["年会", "团建", "品牌活动", "保险活动", "商务沙龙", "客户答谢"];

function MHome() {
  const nav = useNavigate();
  const [text, setText] = useState("");

  const goSubmit = (q?: string) =>
    nav({ to: "/m/submit", search: q ? { q } : undefined } as never);

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          padding: "var(--yl-space-10) var(--yl-space-5) var(--yl-space-7)",
          background:
            "radial-gradient(600px 200px at 100% 0%, rgba(255,255,255,.25), transparent), linear-gradient(160deg,var(--yl-primary),var(--yl-primary-active))",
          color: "var(--yl-text-on-primary)",
          borderBottomLeftRadius: "var(--yl-radius-xl)",
          borderBottomRightRadius: "var(--yl-radius-xl)",
        }}
      >
        <Space size={8} align="center">
          <RobotFilled style={{ font: "var(--yl-text-heading-4)" }} />
          <div>
            <div style={{ font: "var(--yl-text-heading-3)", fontWeight: 700 }}>AI 活动方案助手</div>
            <div style={{ font: "var(--yl-text-caption)", opacity: 0.85 }}>快速匹配活动方案 · 15 分钟拿到方案</div>
          </div>
        </Space>

        {/* 欢迎引导区 */}
        <div style={{ marginTop: "var(--yl-space-4)", padding: "var(--yl-space-3)", background: "rgba(255,255,255,0.15)", borderRadius: "var(--yl-radius-md)", backdropFilter: "blur(4px)" }}>
          <div style={{ font: "var(--yl-text-body-sm)", opacity: 0.9 }}>
            👋 欢迎回来！今天想办什么活动？
          </div>
        </div>

        <div
          onClick={() => goSubmit()}
          style={{
            marginTop: "var(--yl-space-4)",
            background: "#fff",
            borderRadius: "var(--yl-radius-lg)",
            padding: "var(--yl-space-3) var(--yl-space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--yl-space-2)",
            color: "var(--yl-text-tertiary)",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(91,79,214,0.15)",
          }}
        >
          <Input
            variant="borderless"
            placeholder="描述你的活动需求... 可粘贴微信聊天"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={() => text && goSubmit(text)}
            style={{ flex: 1, padding: 0 }}
          />
          <div
            onClick={(e) => { e.stopPropagation(); goSubmit(text || undefined); }}
            style={{
              background: "var(--yl-primary)",
              color: "var(--yl-text-on-primary)",
              borderRadius: "var(--yl-radius-md)",
              padding: "var(--yl-space-1) var(--yl-space-3)",
              font: "var(--yl-text-heading-4)",
            }}
          >
            发送 <ArrowRightOutlined />
          </div>
        </div>
      </div>

      {/* Scene chips */}
      <div style={{ padding: "var(--yl-space-5) var(--yl-space-5) var(--yl-space-2)" }}>
        <Typography.Text strong style={{ font: "var(--yl-text-heading-4)", fontWeight: 600 }}>
          你想办什么活动？
        </Typography.Text>
        <div style={{ marginTop: "var(--yl-space-3)", display: "flex", flexWrap: "wrap", gap: "var(--yl-space-2)" }}>
          {SCENES.map((s, i) => {
            const emojis = ["🎄", "🏕️", "🎬", "🛡️", "💼", "🍾"];
            return (
              <button
                key={s}
                onClick={() => goSubmit(`我想办一场${s}`)}
                style={{
                  padding: "var(--yl-space-2) var(--yl-space-3)",
                  borderRadius: "var(--yl-radius-xl)",
                  margin: 0,
                  font: "var(--yl-text-body-sm)",
                  fontWeight: 500,
                  background: "var(--yl-bg-surface)",
                  border: "1px solid var(--yl-border-subtle)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--yl-space-1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--yl-primary-subtle)";
                  e.currentTarget.style.borderColor = "var(--yl-primary)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--yl-bg-surface)";
                  e.currentTarget.style.borderColor = "var(--yl-border-subtle)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>{emojis[i]}</span>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hot solutions */}
      <div style={{ padding: "var(--yl-space-5)" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Typography.Text strong style={{ font: "var(--yl-text-heading-4)" }}>
            <FireFilled style={{ color: "var(--yl-warning)", marginRight: 6 }} />
            热门方案
          </Typography.Text>
          <Typography.Link
            onClick={() => nav({ to: "/m/discover" })}
            style={{ font: "var(--yl-text-caption)", color: "var(--yl-primary)" }}
          >
            全部 <ArrowRightOutlined />
          </Typography.Link>
        </Space>

        <div style={{ marginTop: "var(--yl-space-3)", display: "flex", flexDirection: "column", gap: "var(--yl-space-3)" }}>
          {solutions.slice(0, 3).map((s) => (
            <Card
              key={s.id}
              hoverable
              styles={{ body: { padding: "var(--yl-space-3)" } }}
              style={{ borderRadius: "var(--yl-radius-lg)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              onClick={() => nav({ to: "/m/discover" })}
            >
              <Space align="center" style={{ width: "100%", gap: "var(--yl-space-3)" }}>
                <div 
                  style={{ 
                    width: 72, 
                    height: 72, 
                    borderRadius: "var(--yl-radius-md)",
                    background: "linear-gradient(135deg, var(--yl-bg-ai), var(--yl-border-ai))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: "var(--yl-text-heading-2)",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(91,79,214,0.1)",
                  }}
                >
                  {s.tier === "推荐方案" ? "🌟" : s.tier === "高性价比" ? "💰" : s.tier === "进阶方案" ? "🎯" : "✨"}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-1)", marginBottom: 4 }}>
                    <Tag color="purple" style={{ borderRadius: "var(--yl-radius-sm)", margin: 0 }}>{s.tier}</Tag>
                    <span style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)" }}>SKU {s.sku}</span>
                  </div>
                  <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 700 }}>{s.name}</div>
                  <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)", marginTop: 4 }}>
                    {s.durationMinutes} 分钟 · 适合 {s.headcountRange[0]}-{s.headcountRange[1]} 人
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ font: "var(--yl-text-numeric-sm)", fontWeight: 800, color: "var(--yl-primary)" }}>{yuan(s.price)}</div>
                  <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)" }}>推荐 {s.recommendScore}</div>
                </div>
              </Space>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent deals */}
      <div style={{ padding: "0 var(--yl-space-5) var(--yl-space-5)" }}>
        <Typography.Text strong style={{ font: "var(--yl-text-heading-4)", fontWeight: 600 }}>最近成交案例</Typography.Text>
        <div style={{ marginTop: "var(--yl-space-3)", display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
          {[
            { title: "字节跳动 · 300人年会", tag: "脱口秀", price: 180000 },
            { title: "小红书 · 200人团建", tag: "即兴喜剧", price: 88000 },
            { title: "SHEIN · 500人发布会", tag: "魔术+脱口秀", price: 260000 },
          ].map((d) => (
            <div
              key={d.title}
              style={{
                background: "var(--yl-bg-surface)",
                borderRadius: "var(--yl-radius-lg)",
                padding: "var(--yl-space-3) var(--yl-space-4)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--yl-border-subtle)",
              }}
            >
              <div>
                <div style={{ font: "var(--yl-text-body-sm)", fontWeight: 600 }}>{d.title}</div>
                <Tag color="green" style={{ marginTop: 4, borderRadius: "var(--yl-radius-sm)", margin: "4px 0 0" }}>{d.tag}</Tag>
              </div>
              <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 700, color: "var(--yl-success)" }}>{yuan(d.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}