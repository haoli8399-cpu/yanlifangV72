import { createFileRoute } from "@tanstack/react-router";
import { ToolQuestionFlow, ToolFlowStyles } from "../shared/components/ToolQuestionFlow";
import { ToolResultPage } from "../shared/components/ToolResultPage";
import type { ResultSection, CTAItem } from "../shared/components/ToolResultPage";
import {
  annualPlanQuestions,
  getAnnualPlanResult,
} from "../shared/mock/growth-tools";

export const Route = createFileRoute("/tools/annual-plan")({
  component: AnnualPlanPage,
});

function AnnualPlanPage() {
  return (
    <>
      <ToolFlowStyles />
      <ToolQuestionFlow
        toolType="annual-plan"
        title="企业年会/团建方案生成器"
        subtitle="回答几个问题，AI帮你定制专属活动方案"
        statLabel="已有 960 人获得方案"
        coverEmoji="🎉"
        coverGradient="linear-gradient(160deg, var(--yl-warning) 0%, var(--yl-gold) 100%)"
        advisorTip="HR老司机经验：年会节目别安排太多，员工参与感最重要"
        steps={annualPlanQuestions}
        onComplete={() => {}}
      >
        {(phase, answers, onBack) => {
          if (phase === "result") {
            const result = getAnnualPlanResult(answers);
            return (
              <AnnualPlanResultPage
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

function AnnualPlanResultPage({
  answers,
  onBack,
  result,
}: {
  answers: Record<string, string>;
  onBack: (stepIndex?: number) => void;
  result: ReturnType<typeof getAnnualPlanResult>;
}) {
  const sections: ResultSection[] = [
    // 活动风格建议
    {
      type: "verdict",
      title: "",
      content: (
        <div>
          <div
            style={{
              font: "var(--yl-text-heading-2)",
              fontWeight: 700,
              color: "var(--yl-text-primary)",
              marginBottom: 8,
            }}
          >
            🎨 活动风格建议
          </div>
          <p
            style={{
              font: "var(--yl-text-body-md)",
              color: "var(--yl-text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {result.styleAdvice}
          </p>
        </div>
      ),
    },

    // 推荐方案结构
    {
      type: "card",
      title: "📋 推荐方案结构",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {result.planStructure.map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                paddingLeft: "var(--yl-space-6)",
                paddingBottom: idx < result.planStructure.length - 1 ? "var(--yl-space-4)" : 0,
              }}
            >
              {idx < result.planStructure.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 3,
                    top: 10,
                    bottom: 0,
                    width: 2,
                    background: "var(--yl-border-default)",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "var(--yl-space-1)",
                  width: "var(--yl-space-2)",
                  height: "var(--yl-space-2)",
                  borderRadius: "var(--yl-radius-full)",
                  background: "var(--yl-primary)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--yl-space-1)",
                }}
              >
                <span style={{ font: "var(--yl-text-heading-4)", fontWeight: 600, color: "var(--yl-text-primary)" }}>
                  {item.name}
                </span>
                <span
                  style={{
                    font: "var(--yl-text-body-sm)",
                    color: "var(--yl-primary)",
                    fontFamily: "var(--yl-font-mono)",
                  }}
                >
                  {item.duration}
                </span>
              </div>
              <p style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", margin: 0, lineHeight: 1.5 }}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      ),
    },

    // 推荐配置
    {
      type: "card",
      title: "⚙️ 推荐配置",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
          {result.config.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "var(--yl-space-3) var(--yl-space-4)",
                borderRadius: "var(--yl-radius-md)",
                background: "var(--yl-bg-page)",
              }}
            >
              <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 600, color: "var(--yl-text-primary)", marginBottom: 4 }}>
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

    // 避坑清单
    {
      type: "risks",
      title: "⚠️ 避坑清单",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
          <div>⚠️ 不要强制员工上台表演，尴尬指数爆表</div>
          <div>⚠️ 不要安排过长领导讲话，员工会走神玩手机</div>
          <div>⚠️ 互动环节要先找托带气氛，冷场就尴尬了</div>
          <div>⚠️ 时间控制在3小时内，超时员工会疲惫</div>
        </div>
      ),
    },

    // 预算建议
    {
      type: "tips",
      title: "💰 预算建议",
      content: (
        <p
          style={{
            font: "var(--yl-text-body-md)",
            color: "var(--yl-text-primary)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {result.budgetAdvice}
        </p>
      ),
    },

    // 给老板看的价值说明
    {
      type: "script",
      title: "📝 给老板看的价值说明",
      content: (
        <div
          style={{
            background: "var(--yl-bg-page)",
            borderRadius: "var(--yl-radius-md)",
            padding: "var(--yl-space-3)",
          }}
        >
          <pre
            style={{
              font: "var(--yl-text-body-sm)",
              color: "var(--yl-text-primary)",
              margin: 0,
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
            }}
          >
            {result.bossReport}
          </pre>
        </div>
      ),
    },
  ];

  const ctas: CTAItem[] = [
    {
      key: "download",
      label: "📥 下载完整方案",
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
      toolType="annual-plan"
      title="🎉 你的活动方案"
      sections={sections}
      ctas={ctas}
      answers={answers}
      onBack={onBack}
    />
  );
}
