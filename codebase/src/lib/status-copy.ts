// 状态语言:统一把 EvidenceState / 阶段状态 翻译成「用户看得懂 · 任务导向」的文案。
// 每个状态回答两个问题:1) 现在发生了什么  2) 谁需要做什么

import type { EvidenceState, ProjectStage } from "@/lib/fixtures";
import type { UserRole } from "@/lib/glossary";

export type StatusCopy = {
  /** 简短标签(徽章上) */
  label: string;
  /** 一句话说明(hover / 二级) */
  hint: string;
  /** 建议 CTA(可选) */
  cta?: string;
};

/** EvidenceState → 用户可读 */
export function evidenceCopy(
  state: EvidenceState,
  role: UserRole = "client",
  who?: string,
  what?: string,
): StatusCopy {
  switch (state) {
    case "verified":
      return { label: "已确认", hint: what ? `${what} · 已确认` : "已核验、可以对外" };
    case "declared":
      return {
        label: "已声明",
        hint: who ? `${who} 已声明${what ?? "此项"},尚未核验` : "由相关方声明,尚未核验",
      };
    case "ai":
      return {
        label: role === "actor" ? "AI 建议" : "AI 推测 · 待你确认",
        hint: "由 AI 根据已有信息推测,你可以直接采纳或修改",
        cta: "确认或修改",
      };
    case "pending":
      return {
        label: "等待中",
        hint: who && what ? `正在等待 ${who} 确认 ${what}` : "正在等待相关方确认",
      };
    case "expired":
      return { label: "已过期", hint: "此项信息已过期,建议重新确认", cta: "重新确认" };
    default:
      return { label: state, hint: "" };
  }
}

/** ProjectStage → 用户可读:"这场活动现在到哪一步" */
export function stageCopy(stage: ProjectStage, role: UserRole = "client"): StatusCopy {
  const map: Record<ProjectStage, StatusCopy> = {
    exploring: {
      label: role === "tenant" ? "需求诊断中" : "AI 陪你想清楚",
      hint: "把模糊想法整理成清晰的活动画像",
    },
    planning: {
      label: "整理方案中",
      hint: role === "tenant" ? "正在为客户整理可选方案" : "正在为你整理几个方向不同的方案",
    },
    quoting: {
      label: "报价确认中",
      hint: role === "tenant" ? "报价已发出,等待客户确认" : "报价已到,等你确认是否接受",
      cta: role === "client" ? "查看正式报价" : undefined,
    },
    waiting: {
      label: "等待中",
      hint: "等对方回复中,AI 会自动提醒并跟进",
    },
    executing: {
      label: "执行中",
      hint: "已进入活动执行阶段",
    },
    completed: {
      label: "已完成",
      hint: "活动已结束,可以查看成果或复用",
      cta: "再办一次类似活动",
    },
  };
  return map[stage];
}

/** 常见「等待谁 / 等什么」组合句:等待中心用。 */
export function waitingSentence(who: string, what: string, since?: string) {
  const t = since ? ` · 已等 ${since}` : "";
  return `正在等待 ${who} 确认${what}${t}`;
}
