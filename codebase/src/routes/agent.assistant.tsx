import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Card, Col, Row, Space, Typography, Empty, Button, message as antdMessage, Divider } from "antd";
import { useEffect, useMemo, useState } from "react";
import { AIChatPanel } from "../shared/components/AIChatPanel";
import { SolutionCard } from "../shared/components/SolutionCard";
import { seedChatMessages, solutions } from "../shared/mock/data";
import { useAIChat } from "../shared/hooks/useAIChat";
import { RequirementExtractPanel } from "../shared/components/RequirementExtractPanel";
import { MinimalRequirementForm, type MinimalRequirementValue } from "../shared/components/MinimalRequirementForm";
import type { Opportunity } from "../shared/types";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/agent/assistant")({
  component: AssistantPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function AssistantPage() {
  const nav = useNavigate();
  const { q } = useSearch({ from: "/agent/assistant" });
  const { messages, loading, send, recommended } = useAIChat(seedChatMessages);
  const [autoSent, setAutoSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (q && !autoSent) {
      setAutoSent(true);
      send(q);
    }
  }, [q, autoSent, send]);

  const currentSuggestions = messages[messages.length - 1]?.suggestions;
  const userTurns = messages.filter((m) => m.role === "user").length;

  // Build a synthetic opportunity from conversation for the extraction panel
  const syntheticOpp = useMemo<Opportunity>(() => {
    const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join(" ");
    const extracted: string[] = [];
    const missing: string[] = [];
    let match = 40;
    if (/(年会|团建|发布会|商场|答谢)/.test(userText)) { extracted.push("活动类型 已识别"); match += 15; } else missing.push("活动类型");
    const headMatch = userText.match(/(\d{2,4})\s*(人|位)/);
    if (headMatch) { extracted.push(`人数：约${headMatch[1]}人`); match += 15; } else missing.push("人数规模");
    if (/(预算|万|w)/i.test(userText)) { extracted.push("预算范围 已识别"); match += 15; } else missing.push("预算范围");
    if (/(月|日|号|周)/.test(userText)) { extracted.push("时间 已识别"); match += 10; } else missing.push("活动时间");
    return {
      id: "syn",
      code: "OPP-DRAFT",
      customer: { id: "me", companyName: "字节跳动", contactName: "王雅琳", contactTitle: "行政总监", phone: "138****2091", industry: "互联网", avatarColor: "var(--yl-primary)" },
      event: { type: "—", scene: "—", date: "—", location: "—", headcount: 0, budget: 0, durationMinutes: 0 },
      status: "新需求",
      requestStatus: "新需求",
      priority: "中",
      createdAt: new Date().toISOString(),
      lastFollowUpAt: new Date().toISOString(),
      aiExtracted: extracted.length ? extracted : ["等待你的第一条需求描述"],
      aiMissing: missing,
      matchScore: Math.min(100, match),
      rawRequirement: userText,
      ownerName: "AI 活动顾问",
    };
  }, [messages]);

  // Fallback rule: after 3 user turns, if still missing critical fields, show minimal form
  const showFallbackForm = userTurns >= 3 && syntheticOpp.aiMissing.length > 0 && !formSubmitted;

  const handleFormSubmit = (v: MinimalRequirementValue) => {
    setFormSubmitted(true);
    const summary = `活动类型：${v.eventType}，人数：${v.headcount}人，预算：${v.budget}万，日期：${v.date.format("YYYY-MM-DD")}`;
    antdMessage.success("已按表单信息为你匹配方案");
    send(summary);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    antdMessage.success("已确认需求信息，AI 开始匹配方案");
  };

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "var(--yl-space-6) var(--yl-space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-3)", marginBottom: "var(--yl-space-3)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--yl-radius-lg)", backgroundColor: "var(--yl-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ font: "var(--yl-text-heading-2)", color: "var(--yl-text-on-primary)" }}>🤖</span>
        </div>
        <div>
          <Typography.Title level={3} style={{ margin: 0, font: "var(--yl-text-heading-1)", color: "var(--yl-text-primary)" }}>
            AI 活动顾问
          </Typography.Title>
          <Typography.Text style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
            企业级智能活动策划助手
          </Typography.Text>
        </div>
      </div>
      <Typography.Text style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-secondary)", lineHeight: 1.6 }}>
        用中文自然语言描述需求，AI 会智能追问关键信息、抽取需求字段并推荐最合适的活动方案。
        <br />
        <span style={{ color: "var(--yl-text-tertiary)" }}>追问最多 3 轮，之后会自动切换到最简表单模式。</span>
      </Typography.Text>

      <Row gutter={24} style={{ marginTop: "var(--yl-space-4)" }}>
        <Col xs={24} lg={13}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title={<Typography.Text strong style={{ fontSize: "var(--yl-text-heading-3)" }}>对话式需求梳理</Typography.Text>}
              extra={<Typography.Text style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>一句话开始，AI 最多追问 3 轮</Typography.Text>}
              styles={{ body: { padding: 0, height: showFallbackForm ? 420 : 560 } }}
              style={{ borderRadius: "var(--yl-radius-lg)", overflow: "hidden", boxShadow: "var(--yl-shadow-md)" }}
            >
              <AIChatPanel
                messages={messages}
                loading={loading}
                onSend={send}
                onPickSuggestion={send}
              />
            </Card>
            {showFallbackForm && <MinimalRequirementForm onSubmit={handleFormSubmit} />}
          </Space>
        </Col>

        <Col xs={24} lg={11}>
          <Space orientation="vertical" size={24} style={{ width: "100%" }}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-2)" }}>
                  <span style={{ width: 6, height: 16, borderRadius: "var(--yl-radius-sm)", backgroundColor: "var(--yl-primary)" }} />
                  <div>
                    <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-primary)", marginBottom: "var(--yl-space-1)" }}>识别结果</div>
                    <Typography.Text strong style={{ font: "var(--yl-text-heading-3)", color: "var(--yl-text-primary)" }}>当前需求进度</Typography.Text>
                  </div>
                </div>
              }
              extra={<div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-1)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "var(--yl-radius-full)", backgroundColor: confirmed ? "var(--yl-success)" : "var(--yl-warning)" }} />
                <Typography.Text style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{confirmed ? "已确认" : "待补充"}</Typography.Text>
              </div>}
              style={{ borderRadius: "var(--yl-radius-lg)", boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-subtle)" }}
              styles={{ body: { padding: "var(--yl-space-4)" } }}
            >
              <div style={{ marginBottom: "var(--yl-space-3)" }}>
                <Typography.Text style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
                  AI 已从对话中识别以下关键信息，确认无误后即可查看推荐方案。
                </Typography.Text>
              </div>
              <RequirementExtractPanel
                opportunity={syntheticOpp}
                editable={userTurns > 0}
                confirmed={confirmed}
                onConfirm={handleConfirm}
              />
            </Card>

            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-2)" }}>
                  <span style={{ width: 6, height: 16, borderRadius: "var(--yl-radius-sm)", backgroundColor: "var(--yl-gold)" }} />
                  <div>
                    <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-gold)", marginBottom: "var(--yl-space-1)" }}>推荐结果</div>
                    <Typography.Text strong style={{ font: "var(--yl-text-heading-3)", color: "var(--yl-text-primary)" }}>AI 推荐方案</Typography.Text>
                  </div>
                </div>
              }
              extra={<Typography.Text style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{recommended?.length || 0} 套方案</Typography.Text>}
              styles={{ body: { padding: "var(--yl-space-4)", maxHeight: 400, overflowY: "auto" } }}
              style={{ borderRadius: "var(--yl-radius-lg)", boxShadow: "var(--yl-shadow-sm)", border: "1px solid var(--yl-border-subtle)" }}
            >
              {recommended && recommended.length > 0 ? (
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  {recommended.map((s, i) => (
                    <SolutionCard
                      key={s.id}
                      solution={s}
                      highlight={i === 1}
                      compact
                      onGetQuote={() => nav({ to: "/agent/quotations/$id", params: { id: "q1" } })}
                    />
                  ))}
                </Space>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--yl-space-6)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "var(--yl-radius-full)", backgroundColor: "var(--yl-bg-sunken)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--yl-space-3)" }}>
                    <span style={{ font: "var(--yl-text-heading-2)", color: "var(--yl-text-tertiary)" }}>📋</span>
                  </div>
                  <div style={{ font: "var(--yl-text-heading-3)", color: "var(--yl-text-primary)", marginBottom: "var(--yl-space-2)" }}>
                    暂无推荐方案
                  </div>
                  <div style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-tertiary)", textAlign: "center", marginBottom: "var(--yl-space-4)" }}>
                    补充活动时间与预算，AI 会为你生成 3 套推荐方案
                  </div>
                  <Button type="primary" onClick={() => send("公司300人年会，预算25万，1月中旬")} style={{ borderRadius: "var(--yl-radius-md)" }}>
                    用示例需求试一次
                  </Button>
                </div>
              )}
            </Card>
          </Space>
        </Col>
      </Row>

      {(!recommended || recommended.length === 0) && (
        <div style={{ marginTop: "var(--yl-space-8)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-3)", marginBottom: "var(--yl-space-4)" }}>
            <span style={{ width: 4, height: 20, borderRadius: "var(--yl-radius-sm)", backgroundColor: "var(--yl-text-tertiary)" }} />
            <div>
              <Typography.Title level={5} style={{ margin: 0, font: "var(--yl-text-heading-2)", color: "var(--yl-text-primary)" }}>
                或直接浏览热门方案
              </Typography.Title>
              <Typography.Text style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
                不想从头描述，也可以先从 3 套标准方案开始。
              </Typography.Text>
            </div>
          </div>
          <Row gutter="var(--yl-space-4)">
            {solutions.slice(0, 3).map((s, i) => (
              <Col key={s.id} xs={24} md={8}>
                <SolutionCard compact solution={s} highlight={i === 1} onGetQuote={() => nav({ to: "/agent/quotations/$id", params: { id: "q1" } })} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}