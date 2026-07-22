import { useState } from "react";
import type { LeadData } from "../mock/growth-tools";
import {
  CloseOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";

interface LeadCaptureModalProps {
  trigger: "download" | "advisor" | "formal";
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LeadData) => void;
}

// 微信授权 mock 状态
function useMockWechatAuth() {
  const [authed, setAuthed] = useState(false);
  const simulateAuth = () => {
    // Mock 微信授权成功
    setTimeout(() => setAuthed(true), 800);
  };
  return { authed, simulateAuth };
}

export function LeadCaptureModal({
  trigger,
  open,
  onClose,
  onSubmit,
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [wechat, setWechat] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authed, simulateAuth } = useMockWechatAuth();

  if (!open) return null;

  const config = {
    download: {
      title: "下载完整预算表",
      subtitle: "请填写以下信息，我们将发送到你的手机",
      button: "获取预算表",
    },
    advisor: {
      title: "联系活动顾问",
      subtitle: "留下联系方式，专业顾问将为你优化方案",
      button: "提交并联系顾问",
    },
    formal: {
      title: "生成正式活动方案",
      subtitle: "我们将根据你的需求生成正式方案并发送",
      button: "生成正式方案",
    },
  }[trigger];

  const handleSubmit = () => {
    if (!phone.trim()) return;
    setLoading(true);
    // Mock 提交延迟
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      onSubmit({ name, company, phone, wechat, trigger });
    }, 1000);
  };

  const isValid = phone.trim().length >= 11;

  return (
    <>
      {/* 遮罩层 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(26, 29, 46, 0.4)",
          zIndex: 100,
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* 底部 Sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          maxWidth: 480,
          margin: "0 auto",
          background: "#FFFFFF",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0))",
          boxShadow: "0 -8px 32px rgba(26, 29, 46, 0.12)",
          animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* 关闭按钮 + 标题 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              font: "var(--yl-text-heading-3)",
              color: "#1A1D2E",
              margin: 0,
            }}
          >
            {submitted ? "提交成功" : config.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: "#F0F1F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#8B92A8",
            }}
          >
            <CloseOutlined />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <CheckCircleFilled
              style={{ fontSize: 48, color: "#00875A", marginBottom: 16 }}
            />
            <p
              style={{ font: "var(--yl-text-heading-3)", fontWeight: 600, color: "#1A1D2E", margin: "0 0 8px" }}
            >
              已收到你的信息
            </p>
            <p style={{ font: "var(--yl-text-body-md)", color: "#5B6178", margin: 0 }}>
              活动顾问将在24小时内与你联系
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                font: "var(--yl-text-body-md)",
                color: "#5B6178",
                margin: "0 0 20px",
              }}
            >
              {config.subtitle}
            </p>

            {/* 手机号 - 微信授权优先 */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  font: "var(--yl-text-body-sm)",
                  fontWeight: 600,
                  color: "#1A1D2E",
                  marginBottom: 6,
                }}
              >
                手机号 <span style={{ color: "#C53030" }}>*</span>
              </label>
              {!authed ? (
                <button
                  onClick={simulateAuth}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 8,
                    border: "1px solid #E5E7EF",
                    background: "#F7F8FA",
                    color: "#5B6178",
                    font: "var(--yl-text-body-md)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>💬</span>
                  微信授权一键获取
                </button>
              ) : (
                <input
                  type="tel"
                  placeholder="微信授权成功，手机号已自动填充"
                  value="138****2091"
                  onChange={() => {}}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 8,
                    border: "1px solid #E0DDFF",
                    background: "#FAFAFF",
                    padding: "0 12px",
                    font: "var(--yl-text-body-md)",
                    color: "#1A1D2E",
                    boxSizing: "border-box",
                  }}
                  disabled
                />
              )}
              {!authed && (
                <input
                  type="tel"
                  placeholder="或手动输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 8,
                    border: "1px solid #E5E7EF",
                    background: "#FFFFFF",
                    padding: "0 12px",
                    font: "var(--yl-text-body-md)",
                    color: "#1A1D2E",
                    boxSizing: "border-box",
                    marginTop: 8,
                  }}
                />
              )}
            </div>

            {/* 姓名 + 公司（顾问优化模式才显示） */}
            {trigger === "advisor" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      font: "var(--yl-text-body-sm)",
                      fontWeight: 600,
                      color: "#1A1D2E",
                      marginBottom: 6,
                    }}
                  >
                    姓名
                  </label>
                  <input
                    type="text"
                    placeholder="请输入你的姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 8,
                      border: "1px solid #E5E7EF",
                      background: "#FFFFFF",
                      padding: "0 12px",
                      font: "var(--yl-text-body-md)",
                      color: "#1A1D2E",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      font: "var(--yl-text-body-sm)",
                      fontWeight: 600,
                      color: "#1A1D2E",
                      marginBottom: 6,
                    }}
                  >
                    公司名称
                  </label>
                  <input
                    type="text"
                    placeholder="请输入公司名称"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 8,
                      border: "1px solid #E5E7EF",
                      background: "#FFFFFF",
                      padding: "0 12px",
                      font: "var(--yl-text-body-md)",
                      color: "#1A1D2E",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </>
            )}

            {/* 微信号 (选填) */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  font: "var(--yl-text-body-sm)",
                  fontWeight: 600,
                  color: "#1A1D2E",
                  marginBottom: 6,
                }}
              >
                微信号 <span style={{ color: "#8B92A8", fontWeight: 400 }}>(选填)</span>
              </label>
              <input
                type="text"
                placeholder="方便顾问与你联系"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 8,
                  border: "1px solid #E5E7EF",
                  background: "#FFFFFF",
                  padding: "0 12px",
                  font: "var(--yl-text-body-md)",
                  color: "#1A1D2E",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* 用途说明 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#F7F8FA",
                marginBottom: 20,
              }}
            >
              <SafetyCertificateFilled style={{ color: "#5B6178", font: "var(--yl-text-body-md)" }} />
              <span style={{ font: "var(--yl-text-caption)", color: "#8B92A8" }}>
                用于发送方案和活动顾问联系，不会用于其他用途
              </span>
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 8,
                border: "none",
                background: isValid && !loading ? "#5B4FD6" : "#C8CAD4",
                color: "#FFFFFF",
                font: "var(--yl-text-heading-3)",
                cursor: isValid && !loading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              {loading ? "提交中..." : config.button}
            </button>
          </>
        )}
      </div>

      {/* Sheet 动画 */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
