import { Avatar, Button, Empty, Input, Space, Typography } from "antd";
import { RobotFilled, SendOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../types";
import { ConfidenceTag } from "./StatusTag";

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
  suggestions?: string[];
  onPickSuggestion?: (s: string) => void;
  emptyHint?: string;
  compact?: boolean;
}

export function AIChatPanel({
  messages,
  onSend,
  loading,
  placeholder = "描述你的活动需求，AI 会为你匹配方案...",
  suggestions,
  onPickSuggestion,
  emptyHint,
  compact,
}: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const t = input.trim();
    if (!t || loading) return;
    onSend(t);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: compact ? "var(--yl-space-3)" : "var(--yl-space-6)", background: "var(--yl-bg-ai)" }}
      >
        {messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--yl-space-8)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "var(--yl-radius-xl)", backgroundColor: "var(--yl-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--yl-space-4)" }}>
              <span style={{ font: "var(--yl-text-display-md)", color: "var(--yl-text-on-primary)" }}>🤖</span>
            </div>
            <div style={{ font: "var(--yl-text-heading-2)", color: "var(--yl-text-primary)", marginBottom: "var(--yl-space-2)" }}>
              准备好开始了吗？
            </div>
            <div style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-secondary)", textAlign: "center", lineHeight: 1.6 }}>
              用中文描述你的活动需求，AI 会智能分析并推荐最合适的方案。
            </div>
            <div style={{ marginTop: "var(--yl-space-4)", display: "flex", gap: "var(--yl-space-2)" }}>
              <Button size="small" onClick={() => onPickSuggestion?.("公司年会，200人，预算15万")} style={{ borderRadius: "var(--yl-radius-full)", backgroundColor: "var(--yl-primary-subtle)", borderColor: "var(--yl-border-ai)", color: "var(--yl-primary)" }}>
                公司年会示例
              </Button>
              <Button size="small" onClick={() => onPickSuggestion?.("团建活动，50人，预算5万")} style={{ borderRadius: "var(--yl-radius-full)", backgroundColor: "var(--yl-bg-surface)", borderColor: "var(--yl-border-default)", color: "var(--yl-text-secondary)" }}>
                团建活动示例
              </Button>
            </div>
          </div>
        ) : (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} onPickSuggestion={onPickSuggestion} />
            ))}
            {loading && <ThinkingBubble />}
          </Space>
        )}
      </div>

      {suggestions && suggestions.length > 0 && !loading && (
        <div style={{ padding: "var(--yl-space-2) var(--yl-space-4)", borderTop: "1px solid var(--yl-border-subtle)", background: "var(--yl-bg-surface)" }}>
          <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", marginBottom: "var(--yl-space-2)" }}>
            试试这些建议
          </div>
          <Space wrap size={8}>
            {suggestions.map((s) => (
              <Button
                key={s}
                size="small"
                onClick={() => onPickSuggestion?.(s)}
                style={{ borderRadius: "var(--yl-radius-full)", background: "var(--yl-primary-subtle)", borderColor: "var(--yl-border-ai)", color: "var(--yl-primary)", font: "var(--yl-text-body-sm)" }}
              >
                {s}
              </Button>
            ))}
          </Space>
        </div>
      )}

      <div style={{ padding: "var(--yl-space-4)", borderTop: "1px solid var(--yl-border-subtle)", background: "var(--yl-bg-surface)", boxShadow: "var(--yl-shadow-sm)" }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          autoSize={{ minRows: 2, maxRows: 5 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          style={{ borderRadius: "var(--yl-radius-lg)", resize: "none", borderColor: "var(--yl-border-default)", backgroundColor: "var(--yl-bg-page)" }}
          disabled={loading}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--yl-space-2)" }}>
          <Typography.Text style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
            Enter 发送，Shift + Enter 换行 · AI 建议仅供参考
          </Typography.Text>
          <Button type="primary" icon={<SendOutlined />} onClick={send} loading={loading} style={{ borderRadius: "var(--yl-radius-md)", height: 36, padding: "0 var(--yl-space-4)" }}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onPickSuggestion }: { msg: ChatMessage; onPickSuggestion?: (s: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: "var(--yl-space-3)", flexDirection: isUser ? "row-reverse" : "row" }}>
      <Avatar
        icon={isUser ? <UserOutlined /> : <RobotFilled />}
        style={{ background: isUser ? "var(--yl-secondary)" : "var(--yl-primary)", flexShrink: 0, borderRadius: "var(--yl-radius-md)" }}
      />
      <div style={{ maxWidth: "78%" }}>
        <div
          style={{
            background: isUser ? "var(--yl-secondary)" : "var(--yl-bg-surface)",
            color: isUser ? "var(--yl-text-on-primary)" : "var(--yl-text-primary)",
            padding: "var(--yl-space-3) var(--yl-space-4)",
            borderRadius: isUser ? "var(--yl-radius-xl) var(--yl-radius-xl) var(--yl-radius-sm) var(--yl-radius-xl)" : "var(--yl-radius-xl) var(--yl-radius-xl) var(--yl-radius-xl) var(--yl-radius-sm)",
            border: isUser ? "none" : "1px solid var(--yl-border-subtle)",
            boxShadow: isUser ? "none" : "var(--yl-shadow-sm)",
            font: "var(--yl-text-body-md)",
            lineHeight: 1.7,
          }}
        >
          <div className="ai-markdown">
            <ReactMarkdown>{msg.content || (msg.streaming ? "…" : "")}</ReactMarkdown>
          </div>
          {msg.streaming && <span style={{ color: "var(--yl-text-tertiary)" }}>▍</span>}
        </div>
        {!isUser && msg.confidence && !msg.streaming && (
          <div style={{ marginTop: "var(--yl-space-1)" }}>
            <ConfidenceTag level={msg.confidence} />
          </div>
        )}
        {!isUser && msg.suggestions && msg.suggestions.length > 0 && !msg.streaming && (
          <Space wrap size={4} style={{ marginTop: "var(--yl-space-2)" }}>
            {msg.suggestions.map((s) => (
              <Button key={s} size="small" onClick={() => onPickSuggestion?.(s)} style={{ borderRadius: "var(--yl-radius-full)", background: "var(--yl-primary-subtle)", borderColor: "var(--yl-border-ai)", color: "var(--yl-primary)" }}>
                {s}
              </Button>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div style={{ display: "flex", gap: "var(--yl-space-3)" }}>
      <Avatar icon={<RobotFilled />} style={{ background: "var(--yl-primary)", borderRadius: "var(--yl-radius-md)" }} />
      <div
        style={{
          background: "var(--yl-bg-surface)",
          padding: "var(--yl-space-3) var(--yl-space-4)",
          borderRadius: "var(--yl-radius-xl) var(--yl-radius-xl) var(--yl-radius-xl) var(--yl-radius-sm)",
          border: "1px solid var(--yl-border-subtle)",
          font: "var(--yl-text-body-sm)",
          color: "var(--yl-text-secondary)",
        }}
      >
        <span className="ai-thinking-dot" />
        <span className="ai-thinking-dot" />
        <span className="ai-thinking-dot" />
        &nbsp; AI 正在思考...
      </div>
    </div>
  );
}