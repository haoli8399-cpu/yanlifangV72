import { createFileRoute } from "@tanstack/react-router";
import { ToolQuestionFlow, ToolFlowStyles } from "../shared/components/ToolQuestionFlow";
import { ToolResultPage } from "../shared/components/ToolResultPage";
import type { ResultSection, CTAItem } from "../shared/components/ToolResultPage";
import {
  budgetQuestions,
  getBudgetResult,
} from "../shared/mock/growth-tools";

export const Route = createFileRoute("/tools/budget-calculator")({
  component: BudgetCalculatorPage,
});

function BudgetCalculatorPage() {
  return (
    <>
      <ToolFlowStyles />
      <ToolQuestionFlow
        toolType="budget"
        title="企业活动预算计算器"
        subtitle="输入你的活动信息，AI帮你估算预算"
        statLabel="已有 1,280 人完成测算"
        coverEmoji="🎯"
        coverGradient="linear-gradient(160deg, var(--yl-primary) 0%, var(--yl-ai-accent) 100%)"
        advisorTip="预算顾问小提示：人数和时长是影响预算的两大关键因素"
        steps={budgetQuestions}
        onComplete={() => {}}
      >
        {(phase, answers, onBack) => {
          if (phase === "result") {
            const result = getBudgetResult(answers);
            return (
              <BudgetResultPage
                answers={answers}
                onBack={onBack}
                result={result}
              />
            );
          }
          return null;
        }}
      </ToolQuestionFlow>
    </>
  );
}

function BudgetResultPage({
  answers,
  onBack,
  result,
}: {
  answers: Record<string, string>;
  onBack: (stepIndex?: number) => void;
  result: ReturnType<typeof getBudgetResult>;
}) {
  const sections: ResultSection[] = [
    // 核心判断区
    {
      type: "verdict",
      title: "",
      content: (
        <div>
          <div
            style={{
              font: "var(--yl-text-heading-1)",
              fontWeight: 700,
              color: "var(--yl-text-primary)",
              fontFamily: "'SF Mono', 'JetBrains Mono', Consolas, monospace",
              fontVariantNumeric: "tabular-nums",
              marginBottom: "var(--yl-space-2)",
            }}
          >
            {result.rangeLabel}
          </div>
          <p
            style={{
              font: "var(--yl-text-body-md)",
              color: "var(--yl-text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {result.verdict}
          </p>
        </div>
      ),
    },

    // 推荐配置
    {
      type: "card",
      title: "📋 推荐配置",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
          {result.recommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--yl-space-2) var(--yl-space-3)",
                borderRadius: "var(--yl-radius-md)",
                background: "var(--yl-bg-page)",
              }}
            >
              <div>
                <div
                  style={{ font: "var(--yl-text-heading-4)", fontWeight: 600, color: "var(--yl-text-primary)" }}
                >
                  {rec.artist} × {rec.count}
                </div>
                <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", marginTop: 2 }}>
                  {rec.duration}
                </div>
              </div>
              {rec.note && (
                <span
                  style={{
                    font: "var(--yl-text-caption-xs)",
                    color: "var(--yl-primary)",
                    background: "var(--yl-primary-subtle)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontWeight: 500,
                  }}
                >
                  {rec.note}
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },

    // 成本构成
    {
      type: "progress-bars",
      title: "💰 钱主要花在哪",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-3)" }}>
          {result.costBreakdown.map((item, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "var(--yl-space-1)",
                }}
              >
                <span style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-primary)", fontWeight: 500 }}>
                  {item.label}
                </span>
                <span style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}>
                  {item.percentage}%
                </span>
              </div>
              <div
                style={{
                  height: "var(--yl-space-1)",
                  borderRadius: "var(--yl-radius-sm)",
                  background: "var(--yl-bg-sunken)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "var(--yl-radius-sm)",
                    background:
                      i === 0
                        ? "var(--yl-primary)"
                        : i === 1
                          ? "var(--yl-ai-accent)"
                          : "var(--yl-ai-glow)",
                    width: `${item.percentage}%`,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)", marginTop: "var(--yl-space-1)" }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      ),
    },

    // 省钱建议
    ...(result.tips.length > 0
      ? [
          {
            type: "tips" as const,
            title: "",
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-1)" }}>
                {result.tips.map((tip, i) => (
                  <p
                    key={i}
                    style={{
                      font: "var(--yl-text-body-sm)",
                      color: "var(--yl-text-primary)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {tip}
                  </p>
                ))}
              </div>
            ),
          },
        ]
      : []),

    // 风险提醒
    ...(result.risks.length > 0
      ? [
          {
            type: "risks" as const,
            title: "",
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-1)" }}>
                {result.risks.map((risk, i) => (
                  <p
                    key={i}
                    style={{
                      font: "var(--yl-text-body-sm)",
                      color: "var(--yl-text-primary)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {risk}
                  </p>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  const ctas: CTAItem[] = [
    {
      key: "download",
      label: "📥 下载完整预算表",
      icon: "📥",
      variant: "primary",
      trigger: "download",
    },
    {
      key: "formal",
      label: "🎯 生成正式活动方案",
      icon: "🎯",
      variant: "secondary",
      trigger: "formal",
    },
    {
      key: "advisor",
      label: "💬 让顾问帮我优化",
      icon: "💬",
      variant: "secondary",
      trigger: "advisor",
    },
    {
      key: "wechat-qr",
      label: "📱 添加活动顾问企业微信",
      icon: "📱",
      variant: "secondary",
    },
  ];

  return (
    <ToolResultPage
      toolType="budget"
      title="📊 你的活动预算分析"
      sections={sections}
      ctas={ctas}
      answers={answers}
      onBack={onBack}
    />
  );
}
