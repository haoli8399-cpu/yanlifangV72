import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Card, Empty, Segmented, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AIChatPanel } from "../shared/components/AIChatPanel";
import { MinimalRequirementForm, type MinimalRequirementValue } from "../shared/components/MinimalRequirementForm";
import { SolutionCard } from "../shared/components/SolutionCard";
import { useAIChat } from "../shared/hooks/useAIChat";
import { seedChatMessages, solutions } from "../shared/mock/data";
import { yuan } from "../shared/components/formatters";
import { StatusTag } from "../shared/components/StatusTag";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/m/submit")({
  component: MSubmit,
  validateSearch: (s) => searchSchema.parse(s),
});

function MSubmit() {
  const { q } = useSearch({ from: "/m/submit" });
  const [tab, setTab] = useState<"AI 对话" | "选方案">("AI 对话");
  const { messages, loading, send, recommended } = useAIChat(seedChatMessages);
  const [autoSent, setAutoSent] = useState(false);
  const [formDone, setFormDone] = useState(false);

  useEffect(() => {
    if (q && !autoSent) {
      setAutoSent(true);
      send(q);
    }
  }, [q, autoSent, send]);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const showFallback = userTurns >= 3 && !recommended && !formDone;

  const handleForm = (v: MinimalRequirementValue) => {
    setFormDone(true);
    send(`活动类型：${v.eventType}，人数：${v.headcount}人，预算：${v.budget}万，日期：${v.date.format("YYYY-MM-DD")}`);
  };

  return (
    <div>
      <div style={{ padding: "var(--yl-space-5) var(--yl-space-5) var(--yl-space-3)", background: "#fff", borderBottom: "1px solid var(--yl-border-subtle)" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>提需求</Typography.Title>
        <div style={{ marginTop: "var(--yl-space-3)" }}>
          <Segmented
            block
            value={tab}
            onChange={(v) => setTab(v as typeof tab)}
            options={[
              { value: "AI 对话", label: "💬 描述需求" },
              { value: "选方案", label: "📋 选方案" },
            ]}
          />
        </div>
      </div>

      {tab === "AI 对话" ? (
        <div style={{ padding: "var(--yl-space-3)", display: "flex", flexDirection: "column", gap: "var(--yl-space-3)" }}>
          <Card styles={{ body: { padding: 0, height: 460 } }} style={{ borderRadius: "var(--yl-radius-lg)", overflow: "hidden" }}>
            <AIChatPanel
              messages={messages}
              loading={loading}
              onSend={send}
              suggestions={messages[messages.length - 1]?.suggestions}
              onPickSuggestion={send}
            />
          </Card>

          {showFallback && <MinimalRequirementForm onSubmit={handleForm} />}

          {recommended && recommended.length > 0 && (
            <div>
              <Typography.Text strong style={{ font: "var(--yl-text-heading-4)" }}>AI 推荐方案</Typography.Text>
              <div style={{ marginTop: "var(--yl-space-2)", display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
                {recommended.map((s, i) => (
                  <SolutionCard key={s.id} solution={s} highlight={i === 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "var(--yl-space-4)", display: "flex", flexDirection: "column", gap: "var(--yl-space-3)" }}>
          {solutions.slice(0, 6).map((s) => (
            <Card key={s.id} styles={{ body: { padding: "var(--yl-space-3)" } }} style={{ borderRadius: "var(--yl-radius-lg)" }}>
              <Space wrap size={6}>
                <StatusTag status={s.tier} />
                <Tag style={{ borderRadius: "var(--yl-radius-sm)" }}>{s.durationMinutes} 分钟</Tag>
              </Space>
              <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 700, marginTop: "var(--yl-space-2)" }}>{s.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--yl-space-2)" }}>
                <span style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                  {s.headcountRange[0]}-{s.headcountRange[1]} 人
                </span>
                <span style={{ font: "var(--yl-text-numeric-sm)", fontWeight: 800, color: "var(--yl-primary)" }}>{yuan(s.price)}</span>
              </div>
            </Card>
          ))}
          {solutions.length === 0 && <Empty />}
        </div>
      )}
    </div>
  );
}