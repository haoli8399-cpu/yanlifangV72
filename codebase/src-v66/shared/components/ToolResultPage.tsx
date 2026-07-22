import { useState } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";
import type { LeadData } from "../mock/growth-tools";
import { getMockAiReply } from "../mock/tool-ai-chat";

// ============================================================
// ToolResultPage — 通用增长工具结果页
// 渲染：结果卡片模块 + CTA + 留资弹窗
// ============================================================

export interface ResultSection {
  type: "verdict" | "card" | "progress-bars" | "tips" | "risks" | "script" | "plain";
  title: string;
  content: React.ReactNode;
}

export interface CTAItem {
  key: string;
  label: string;
  icon?: string;
  variant: "primary" | "secondary" | "wechat-qr";
  trigger?: "download" | "advisor" | "formal";
}

interface ToolResultPageProps {
  toolType: string;
  title: string;
  sections: ResultSection[];
  ctas: CTAItem[];
  answers: Record<string, string>;
  onBack: (stepIndex?: number) => void;
  showLeadForm?: boolean;
}

export function ToolResultPage({
  toolType,
  title,
  sections,
  ctas,
  answers,
  onBack,
}: ToolResultPageProps) {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadTrigger, setLeadTrigger] = useState<"download" | "advisor" | "formal">("download");
  const [showQr, setShowQr] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleCTA = (cta: CTAItem) => {
    // Mock 行为追踪
    const actionMap: Record<string, string> = {
      download: "download",
      advisor: "consult",
      formal: "lead_capture",
    };
    console.log('[Tracker]', {
      toolType,
      action: cta.trigger ? actionMap[cta.trigger] ?? cta.trigger : "wechat_qr",
      sourceChannel: "direct",
      timestamp: Date.now(),
    });

    if (cta.key === "wechat-qr") {
      setShowQr(true);
      return;
    }
    if (cta.trigger) {
      setLeadTrigger(cta.trigger);
      setLeadOpen(true);
    }
  };

  const handleLeadSubmit = (data: LeadData) => {
    console.log("[LeadCapture] Submitted:", data);
    // Mock: 提交后关闭弹窗
    setTimeout(() => {
      setLeadOpen(false);
    }, 1500);
  };

  const handleAiSend = () => {
    const q = aiInput.trim();
    if (!q || aiLoading) return;

    setAiMessages((prev) => [...prev, { role: "user", content: q }]);
    setAiInput("");
    setAiLoading(true);

    // Mock AI 回复 — 基于上下文
    setTimeout(() => {
      const reply = getMockAiReply(q, { toolType, answers });
      setAiMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setAiLoading(false);
    }, 1200);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#F7F8FA",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 120,
  };

  return (
    <>
      <div style={containerStyle}>
        {/* 顶部导航 */}
        <div
          style={{
            padding: "16px 20px",
            background: "#FFFFFF",
            borderBottom: "1px solid #F0F1F4",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => onBack()}
            style={{
              border: "none",
              background: "transparent",
              color: "#5B4FD6",
              font: "var(--yl-text-body-md)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← 返回修改答案
          </button>
          <h2
            style={{
              font: "var(--yl-text-heading-3)",
              fontWeight: 700,
              color: "#1A1D2E",
              margin: "12px 0 0",
              lineHeight: 1.3,
            }}
          >
            {title}
          </h2>
        </div>

        {/* 结果模块 */}
        <div style={{ padding: "16px 16px 0" }}>
          {sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 14 }}>
              {renderSection(section)}
            </div>
          ))}
        </div>

        {/* 继续问 AI */}
        <div style={{ padding: "0 16px" }}>
          <div
            style={{
              background: "#FAFAFF",
              border: "1px solid #E0DDFF",
              borderRadius: 12,
              padding: "16px 16px 12px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <span style={{ font: "var(--yl-text-heading-4)" }}>💬</span>
              <span
                style={{
                  font: "var(--yl-text-heading-4)",
                  color: "#1A1D2E",
                }}
              >
                还想调整？继续问AI
              </span>
            </div>

            {/* AI 对话记录 */}
            {aiMessages.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                      padding: "8px 12px",
                      borderRadius: 12,
                      background: msg.role === "user" ? "#F0EEFF" : "#FFFFFF",
                      border:
                        msg.role === "user" ? "1px solid #E0DDFF" : "1px solid #E5E7EF",
                      font: "var(--yl-text-body-sm)",
                      color: "#1A1D2E",
                      lineHeight: 1.5,
                      maxWidth: "90%",
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      marginLeft: msg.role === "user" ? "auto" : 0,
                    }}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}

            {/* 输入框 */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="输入你的问题..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSend()}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 20,
                  border: "1px solid #E5E7EF",
                  background: "#FFFFFF",
                  padding: "0 16px",
                  font: "var(--yl-text-body-md)",
                  color: "#1A1D2E",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleAiSend}
                disabled={aiLoading || !aiInput.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  border: "none",
                  background:
                    aiLoading || !aiInput.trim() ? "#E5E7EF" : "#5B4FD6",
                  color: "#FFFFFF",
                  fontSize: 16,
                  cursor:
                    aiLoading || !aiInput.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {aiLoading ? "..." : "→"}
              </button>
            </div>
          </div>
        </div>

        {/* CTA 按钮组 */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            background: "#FFFFFF",
            borderTop: "1px solid #F0F1F4",
            padding: "16px 16px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0))",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {ctas.map((cta) => (
            <button
              key={cta.key}
              onClick={() => handleCTA(cta)}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 8,
                border:
                  cta.variant === "primary"
                    ? "none"
                    : "1px solid #E5E7EF",
                background: cta.variant === "primary" ? "#5B4FD6" : "#FFFFFF",
                color: cta.variant === "primary" ? "#FFFFFF" : "#1A1D2E",
                font: "var(--yl-text-heading-4)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (cta.variant === "primary") {
                  e.currentTarget.style.background = "#4A3FC5";
                } else {
                  e.currentTarget.style.background = "#F7F8FA";
                }
              }}
              onMouseLeave={(e) => {
                if (cta.variant === "primary") {
                  e.currentTarget.style.background = "#5B4FD6";
                } else {
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
            >
              {cta.icon && <span>{cta.icon}</span>}
              {cta.label}
            </button>
          ))}
        </div>

        {/* 二维码弹窗 */}
        {showQr && (
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(26, 29, 46, 0.4)",
                zIndex: 100,
              }}
              onClick={() => setShowQr(false)}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 101,
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 32,
                textAlign: "center",
                width: "calc(100% - 64px)",
                maxWidth: 320,
                boxShadow: "0 20px 40px rgba(26, 29, 46, 0.15)",
              }}
            >
              <p
              style={{
                font: "var(--yl-text-heading-3)",
                color: "#1A1D2E",
                margin: "0 0 8px",
              }}
            >
              添加活动顾问企业微信
            </p>
            <p
              style={{
                font: "var(--yl-text-body-sm)",
                color: "#5B6178",
                margin: "0 0 20px",
              }}
            >
              扫码添加，获取专属活动方案
            </p>
              {/* Mock 二维码 */}
              <div
                style={{
                  width: 180,
                  height: 180,
                  margin: "0 auto 16px",
                  background: "#F0F1F4",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #C8CAD4",
                }}
              >
                <div style={{ textAlign: "center", color: "#8B92A8", font: "var(--yl-text-body-sm)" }}>
                  <div style={{ fontSize: 36, marginBottom: 4 }}>📱</div>
                  <div>企业微信二维码</div>
                  <div style={{ font: "var(--yl-text-caption-xs)", marginTop: 2 }}>(Mock)</div>
                </div>
              </div>
              <button
                onClick={() => setShowQr(false)}
                style={{
                  border: "none",
                  background: "#F0F1F4",
                  color: "#5B6178",
                  font: "var(--yl-text-body-md)",
                  padding: "8px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                关闭
              </button>
            </div>
          </>
        )}
      </div>

      {/* 留资弹窗 */}
      <LeadCaptureModal
        trigger={leadTrigger}
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        onSubmit={handleLeadSubmit}
      />
    </>
  );
}

// ====== Section 渲染辅助 ======

function renderSection(section: ResultSection) {
  const cardBase: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E5E7EF",
    borderRadius: 12,
    padding: "20px",
    boxShadow: "0 1px 3px rgba(26,29,46,0.06)",
  };

  switch (section.type) {
    // 核心判断区（AI风格）
    case "verdict":
      return (
        <div
          style={{
            ...cardBase,
            background: "#FAFAFF",
            border: "1px solid #E0DDFF",
            boxShadow: "0 0 0 1px rgba(91,79,214,0.08), 0 4px 12px rgba(91,79,214,0.06)",
          }}
        >
          {section.title && (
            <div
              style={{
                font: "var(--yl-text-heading-4)",
                color: "#5B4FD6",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ font: "var(--yl-text-caption)" }}>🤖</span>
              AI 诊断
            </div>
          )}
          {section.content}
        </div>
      );

    // 普通卡片
    case "card":
      return (
        <div style={cardBase}>
          {section.title && (
            <h4
              style={{
                font: "var(--yl-text-heading-4)",
                color: "#1A1D2E",
                margin: "0 0 12px",
              }}
            >
              {section.title}
            </h4>
          )}
          {section.content}
        </div>
      );

    // 风险提醒（橙色边框）
    case "risks":
      return (
        <div
          style={{
            ...cardBase,
            border: "1px solid #FDE4B9",
            background: "#FEF7EC",
          }}
        >
          <div
            style={{
              font: "var(--yl-text-heading-4)",
              color: "#B45309",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ⚠️ 风险提醒
          </div>
          {section.content}
        </div>
      );

    // 省钱建议（绿色提示框）
    case "tips":
      return (
        <div
          style={{
            ...cardBase,
            border: "1px solid #B5E8D5",
            background: "#E6F7F0",
          }}
        >
          <div
            style={{
              font: "var(--yl-text-heading-4)",
              color: "#00875A",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            💡 省钱建议
          </div>
          {section.content}
        </div>
      );

    // 上级汇报话术
    case "script":
      return (
        <div style={cardBase}>
          <div
            style={{
              font: "var(--yl-text-heading-4)",
              color: "#2563EB",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            📋 上级汇报话术
          </div>
          <div
            style={{
              font: "var(--yl-text-body-sm)",
              color: "#1A1D2E",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {section.content}
          </div>
        </div>
      );

    // 进度条展示
    case "progress-bars":
    case "plain":
    default:
      return (
        <div style={cardBase}>
          {section.title && (
            <h4
              style={{
                font: "var(--yl-text-heading-4)",
                color: "#1A1D2E",
                margin: "0 0 12px",
              }}
            >
              {section.title}
            </h4>
          )}
          {section.content}
        </div>
      );
  }
}
