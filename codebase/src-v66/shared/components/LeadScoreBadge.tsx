import { Tag } from "antd";

interface LeadScoreBadgeProps {
  score: number;
}

const SCORE_STYLES = {
  high: {
    color: "#10B981",
    background: "#ECFDF5",
    borderColor: "#A7F3D0",
    prefix: "高优",
  },
  medium: {
    color: "#F59E0B",
    background: "#FFFBEB",
    borderColor: "#FDE68A",
    prefix: "中优",
  },
  low: {
    color: "#9CA3AF",
    background: "#F9FAFB",
    borderColor: "#E5E7EB",
    prefix: "低优",
  },
  none: {
    color: "#9CA3AF",
    background: "#F9FAFB",
    borderColor: "#E5E7EB",
    prefix: "",
  },
} as const;

export function LeadScoreBadge({ score }: LeadScoreBadgeProps) {
  if (score === undefined || score === null) {
    return (
      <Tag
        style={{
          margin: 0,
          color: SCORE_STYLES.none.color,
          background: SCORE_STYLES.none.background,
          border: `1px solid ${SCORE_STYLES.none.borderColor}`,
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        未评分
      </Tag>
    );
  }

  const styleKey = score >= 80 ? "high" : score >= 50 ? "medium" : "low";
  const s = SCORE_STYLES[styleKey];
  const display =
    s.prefix ? `${s.prefix} · ${score}分` : `${score}分`;

  return (
    <Tag
      style={{
        margin: 0,
        color: s.color,
        background: s.background,
        border: `1px solid ${s.borderColor}`,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {display}
    </Tag>
  );
}
