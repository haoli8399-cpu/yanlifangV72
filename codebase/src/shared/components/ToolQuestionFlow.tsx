import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";

// ============================================================
// ToolQuestionFlow — 通用增长工具问题流组件
// 封装：封面 → 问题流(带进度条) → 生成中 → 结果
// ============================================================

export interface FlowStep {
  id: string;
  title: string;
  options: { label: string; value: string }[];
}

export type FlowPhase = "cover" | "questions" | "loading" | "result";

interface ToolQuestionFlowProps {
  toolType: string;
  title: string;
  subtitle: string;
  statLabel?: string;
  steps: FlowStep[];
  coverEmoji?: string;
  coverGradient?: string;
  advisorTip?: string;
  onComplete: (answers: Record<string, string>) => void;
  children: (phase: FlowPhase, answers: Record<string, string>, onBack: () => void) => ReactNode;
}

// 问题卡片过渡动画样式
const questionCardStyle = (entering: boolean): React.CSSProperties => ({
  animation: entering
    ? "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    : "slideOutLeft 0.25s cubic-bezier(0.4, 0, 1, 1)",
});

export function ToolQuestionFlow({
  title,
  subtitle,
  statLabel,
  steps,
  coverEmoji = "🎯",
  coverGradient = "linear-gradient(160deg, var(--yl-primary) 0%, var(--yl-primary-active) 100%)",
  advisorTip = "",
  onComplete,
  children,
}: ToolQuestionFlowProps) {
  const [phase, setPhase] = useState<FlowPhase>("cover");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 开始答题
  const handleStart = () => {
    setPhase("questions");
    setCurrentStep(0);
    setAnswers({});
  };

  // 选择答案 → 自动下一步
  const handleSelect = useCallback(
    (stepId: string, value: string) => {
      if (animating) return;

      const newAnswers = { ...answers, [stepId]: value };
      setAnswers(newAnswers);
      setDirection("forward");
      setAnimating(true);

      setTimeout(() => {
        setAnimating(false);
        if (currentStep < steps.length - 1) {
          setCurrentStep((s) => s + 1);
        } else {
          // 所有问题答完 → 进入加载态
          setPhase("loading");
          loadingTimerRef.current = setTimeout(() => {
            onComplete(newAnswers);
            setPhase("result");
          }, 2500);
        }
      }, 280);
    },
    [animating, answers, currentStep, steps.length, onComplete]
  );

  // 返回上一题
  const handleBack = () => {
    if (currentStep === 0) {
      setPhase("cover");
      return;
    }
    if (animating) return;
    setDirection("backward");
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setCurrentStep((s) => s - 1);
    }, 250);
  };

  // 从结果页返回问题流
  const returnToQuestions = (stepIndex?: number) => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setPhase("questions");
    setCurrentStep(stepIndex ?? steps.length - 1);
  };

  // 清理
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--yl-bg-page)",
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
  };

  // ====== 封面 ======
  if (phase === "cover") {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 var(--yl-space-5)",
            textAlign: "center",
            paddingTop: "var(--yl-space-10)",
            paddingBottom: "var(--yl-space-6)",
          }}
        >
          {/* 顶部品牌标识条 */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--yl-space-2)",
              marginBottom: "var(--yl-space-6)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--yl-radius-md)",
                background: coverGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--yl-font-heading-4)",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              演
            </div>
            <span style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)", fontWeight: 500 }}>
              演立方 · AI 工具
            </span>
          </div>

          {/* 工具图标 */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "var(--yl-radius-xl)",
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: "var(--yl-space-4)",
              boxShadow: "0 8px 32px rgba(91,79,214,0.12)",
            }}
          >
            {coverEmoji}
          </div>

          {/* 标题 */}
          <h1
            style={{
              font: "var(--yl-text-display-sm)",
              fontWeight: 700,
              color: "var(--yl-text-primary)",
              margin: "0 0 var(--yl-space-3)",
              lineHeight: 1.3,
            }}
          >
            {title}
          </h1>

          {/* 顾问式引导文案 */}
          <p
            style={{
              font: "var(--yl-text-body-md)",
              color: "var(--yl-text-secondary)",
              margin: "0 0 var(--yl-space-3)",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>

          {/* 额外提示 */}
          {advisorTip && (
            <p
              style={{
                font: "var(--yl-text-body-sm)",
                color: "var(--yl-text-tertiary)",
                margin: "0 0 var(--yl-space-6)",
                lineHeight: 1.5,
                padding: "var(--yl-space-3)",
                background: "var(--yl-bg-surface)",
                borderRadius: "var(--yl-radius-md)",
                border: "1px solid var(--yl-border-subtle)",
              }}
            >
              💡 {advisorTip}
            </p>
          )}

          {/* 开始按钮 */}
          <button
            onClick={handleStart}
            style={{
              width: "100%",
              maxWidth: 320,
              height: 48,
              borderRadius: "var(--yl-radius-lg)",
              border: "none",
              background: coverGradient,
              color: "#FFFFFF",
              font: "var(--yl-text-heading-3)",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "var(--yl-space-4)",
              transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(91,79,214,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--yl-primary-active)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(91,79,214,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = coverGradient;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,79,214,0.25)";
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            开始测算
          </button>

          {/* 数据钩子 */}
          {statLabel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--yl-space-2)",
                padding: "var(--yl-space-2) var(--yl-space-4)",
                background: "var(--yl-bg-surface)",
                borderRadius: "var(--yl-radius-xl)",
                border: "1px solid var(--yl-border-subtle)",
              }}
            >
              <span style={{ fontSize: 14 }}>✅</span>
              <span style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
                {statLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ====== 问题流 ======
  if (phase === "questions") {
    const step = steps[currentStep];
    const progress = ((currentStep + (answers[step.id] ? 1 : 0)) / steps.length) * 100;

    return (
      <div style={containerStyle}>
        {/* 顶部进度条 + 返回按钮 */}
        <div
          style={{
            padding: "var(--yl-space-4) var(--yl-space-5) var(--yl-space-3)",
            background: "var(--yl-bg-surface)",
            borderBottom: "1px solid var(--yl-border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--yl-space-3)",
            }}
          >
            <button
              onClick={handleBack}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--yl-text-secondary)",
                font: "var(--yl-text-body-md)",
                cursor: "pointer",
                padding: "var(--yl-space-1) 0",
                display: "flex",
                alignItems: "center",
                gap: "var(--yl-space-1)",
              }}
            >
              ← 返回
            </button>
            <span
              style={{
                font: "var(--yl-text-body-sm)",
                fontWeight: 500,
                color: "var(--yl-text-tertiary)",
              }}
            >
              {currentStep + 1}/{steps.length}
            </span>
          </div>

          {/* 进度条 */}
          <div
            style={{
              height: 4,
              borderRadius: "var(--yl-radius-sm)",
              background: "var(--yl-bg-page)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "var(--yl-radius-sm)",
                background: "var(--yl-primary)",
                width: `${progress}%`,
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>

        {/* 问题区域 */}
        <div
          style={{
            flex: 1,
            padding: "var(--yl-space-6) var(--yl-space-5)",
            overflow: "auto",
          }}
        >
          {/* 问题标题 */}
          <h2
            style={{
              font: "var(--yl-text-heading-3)",
              color: "var(--yl-text-primary)",
              margin: "0 0 var(--yl-space-5)",
              lineHeight: 1.4,
            }}
          >
            {step.title}
          </h2>

          {/* 选项网格 */}
          <div
            key={currentStep}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--yl-space-3)",
              ...questionCardStyle(direction === "forward"),
            }}
          >
            {step.options.map((opt) => {
              const selected = answers[step.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(step.id, opt.value)}
                  style={{
                    minHeight: 72,
                    borderRadius: "var(--yl-radius-lg)",
                    border: selected ? "2px solid var(--yl-primary)" : "1px solid var(--yl-border-subtle)",
                    background: selected ? "var(--yl-primary-subtle)" : "var(--yl-bg-surface)",
                    padding: "var(--yl-space-4) var(--yl-space-3)",
                    cursor: "pointer",
                    font: "var(--yl-text-body-md)",
                    fontWeight: selected ? 600 : 400,
                    color: selected ? "var(--yl-primary)" : "var(--yl-text-primary)",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    boxShadow: selected
                      ? "0 0 0 1px rgba(91,79,214,0.15), 0 2px 8px rgba(91,79,214,0.08)"
                      : "0 1px 2px rgba(26,29,46,0.04)",
                    lineHeight: 1.4,
                    wordBreak: "break-all",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ====== 生成中 ======
  if (phase === "loading") {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 var(--yl-space-5)",
          }}
        >
          {/* AI 三点脉冲动画 */}
          <div style={{ display: "flex", gap: "var(--yl-space-2)", marginBottom: "var(--yl-space-6)" }}>
            <span className="ai-thinking-dot" style={{ background: "var(--yl-primary)" }} />
            <span className="ai-thinking-dot" style={{ background: "var(--yl-primary)" }} />
            <span className="ai-thinking-dot" style={{ background: "var(--yl-primary)" }} />
          </div>

          <p
            style={{
              font: "var(--yl-text-heading-3)",
              fontWeight: 500,
              color: "var(--yl-text-secondary)",
              margin: 0,
              textAlign: "center",
            }}
          >
            🤖 正在分析你的活动需求...
          </p>

          <p
            style={{
              font: "var(--yl-text-body-sm)",
              color: "var(--yl-text-tertiary)",
              margin: "var(--yl-space-2) 0 0",
              textAlign: "center",
            }}
          >
            基于你的需求匹配最优方案
          </p>
        </div>
      </div>
    );
  }

  // ====== 结果页 ======
  return <>{children("result", answers, returnToQuestions)}</>;
}

// ====== 动画样式 ======
const animationStyles = `
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slideOutLeft {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}
`;

// 将样式注入到组件
export function ToolFlowStyles() {
  return <style>{animationStyles}</style>;
}
