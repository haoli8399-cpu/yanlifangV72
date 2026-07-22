import { createFileRoute } from "@tanstack/react-router";
import { ToolQuestionFlow, ToolFlowStyles } from "../shared/components/ToolQuestionFlow";
import { ToolResultPage } from "../shared/components/ToolResultPage";
import type { ResultSection, CTAItem } from "../shared/components/ToolResultPage";
import {
  insuranceQuestions,
  getInsuranceResult,
} from "../shared/mock/growth-tools";

export const Route = createFileRoute("/tools/insurance-plan")({
  component: InsurancePlanPage,
});

function InsurancePlanPage() {
  return (
    <>
      <ToolFlowStyles />
      <ToolQuestionFlow
        toolType="insurance"
        title="保险行业活动方案生成器"
        subtitle="回答几个问题，AI帮你生成专属活动方案"
        statLabel="已有 980 位保险从业者使用"
        coverEmoji="🛡️"
        coverGradient="linear-gradient(160deg, var(--yl-success) 0%, var(--yl-success) 100%)"
        advisorTip="保险活动策划顾问：客户答谢会重在营造信任感和归属感"
        steps={insuranceQuestions}
        onComplete={() => {}}
      >
        {(phase, answers, onBack) => {
          if (phase === "result") {
            const result = getInsuranceResult(answers);
            return (
              <InsuranceResultPage
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

function InsuranceResultPage({
  answers,
  onBack,
  result,
}: {
  answers: Record<string, string>;
  onBack: (stepIndex?: number) => void;
  result: ReturnType<typeof getInsuranceResult>;
}) {
  const sections: ResultSection[] = [
    // 核心判断：活动类型
    {
      type: "verdict",
      title: "",
      content: (
        <div>
          <div
            style={{
              font: "var(--yl-text-heading-3)",
              fontWeight: 700,
              color: "var(--yl-text-primary)",
              marginBottom: 8,
            }}
          >
            {result.activityTypeLabel}
          </div>
          <p
            style={{
              font: "var(--yl-text-body-md)",
              color: "var(--yl-text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {result.activityTypeDesc}
          </p>
        </div>
      ),
    },

    // 推荐活动结构（时间线）
    {
      type: "card",
      title: "⏱️ 推荐活动结构",
      content: (
        <div style={{ position: "relative" }}>
          {/* 时间线 */}
          <div
            style={{
              position: "absolute",
              left: 11,
              top: 4,
              bottom: 4,
              width: 2,
              background: "var(--yl-border-ai)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-4)" }}>
            {result.timeline.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "var(--yl-space-3)" }}>
                {/* 圆点 */}
                <div
                  style={{
                    width: "var(--yl-space-6)",
                    height: "var(--yl-space-6)",
                    borderRadius: "var(--yl-radius-full)",
                    background: "var(--yl-primary)",
                    color: "var(--yl-text-on-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: "var(--yl-text-heading-4)",
                    fontWeight: 700,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div
                    style={{
                      font: "var(--yl-text-heading-4)",
                      fontWeight: 600,
                      color: "var(--yl-text-primary)",
                      marginBottom: "var(--yl-space-1)",
                    }}
                  >
                    {item.phase}
                    <span
                      style={{
                        font: "var(--yl-text-caption)",
                        fontWeight: 400,
                        color: "var(--yl-text-tertiary)",
                        marginLeft: "var(--yl-space-2)",
                      }}
                    >
                      {item.duration}
                    </span>
                  </div>
                  <p
                    style={{
                      font: "var(--yl-text-body-sm)",
                      color: "var(--yl-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 推荐内容组合
    {
      type: "card",
      title: "🎤 推荐内容组合",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
          {result.contentCombo.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "var(--yl-space-3) var(--yl-space-4)",
                borderRadius: "var(--yl-radius-md)",
                background: "var(--yl-bg-page)",
              }}
            >
              <div
                style={{
                  font: "var(--yl-text-heading-4)",
                  fontWeight: 600,
                  color: "var(--yl-text-primary)",
                  marginBottom: "var(--yl-space-1)",
                }}
              >
                {item.item}
              </div>
              <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", lineHeight: 1.5 }}>
                {item.reason}
              </div>
            </div>
          ))}
        </div>
      ),
    },

    // 上级汇报话术
    ...(result.bossReportScript
      ? [
          {
            type: "script" as const,
            title: "",
            content: (
              <div
                style={{
                  font: "var(--yl-text-body-sm)",
                  color: "var(--yl-text-primary)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap" as const,
                }}
              >
                {result.bossReportScript}
              </div>
            ),
          },
        ]
      : []),

    // 商务风险提醒
    ...(result.businessRisks.length > 0
      ? [
          {
            type: "risks" as const,
            title: "",
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.businessRisks.map((risk, i) => (
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

  // CTA 按钮（与预算计算器不同，突出"上级汇报版"）
  const ctas: CTAItem[] = [
    {
      key: "download",
      label: "📥 下载上级汇报版方案",
      icon: "📥",
      variant: "primary",
      trigger: "download",
    },
    {
      key: "formal",
      label: "📄 生成正式保险行业方案",
      icon: "📄",
      variant: "secondary",
      trigger: "formal",
    },
    {
      key: "advisor",
      label: "💬 联系顾问优化",
      icon: "💬",
      variant: "secondary",
      trigger: "advisor",
    },
    {
      key: "wechat-qr",
      label: "📱 添加保险活动顾问企业微信",
      icon: "📱",
      variant: "secondary",
    },
  ];

  return (
    <ToolResultPage
      toolType="insurance"
      title="📋 你的保险活动方案"
      sections={sections}
      ctas={ctas}
      answers={answers}
      onBack={onBack}
    />
  );
}
