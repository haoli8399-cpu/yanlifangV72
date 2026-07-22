import type { ChatMessage, Solution } from "../types";
import { solutions } from "./data";
import { getFeedback } from "./feedbackLog";

// Simulated streaming AI: yields chunks over time
export async function* streamAIResponse(
  userText: string,
  history: ChatMessage[],
): AsyncGenerator<string, { finalConfidence: "高" | "中" | "低"; recommended?: Solution[]; suggestions?: string[] }> {
  const lower = userText.toLowerCase();
  const turnIndex = history.filter((m) => m.role === "user").length;

  let reply = "";
  let confidence: "高" | "中" | "低" = "中";
  let recommended: Solution[] | undefined;
  let suggestions: string[] | undefined;

  const hasHeadcount = /\d{2,4}\s*(人|位)/.test(userText);
  const hasBudget = /(预算|万|w)/i.test(userText);
  const hasDate = /(月|日|号|周|年会|春节|元旦)/.test(userText);

  if (turnIndex <= 1 && (!hasBudget || !hasDate)) {
    reply = `好的，我来帮你梳理这个${extractScene(userText)}需求。\n\n先确认几个关键信息：\n\n1. **活动时间**：大致的日期或月份是？\n2. **预算范围**：整体的演出预算大概在哪个区间？（例如 10-20 万 / 20-50 万 / 50 万以上）\n3. **调性偏好**：偏好松弛好笑、燃场热烈，还是高级克制？\n\n告诉我这些，我立刻给你 3 套方案。`;
    confidence = "中";
    suggestions = ["1月中旬，预算25万，希望松弛好笑", "3月新品发布，50万以内，需要科技感", "还没定，先看看有哪些方案"];
  } else {
    const scene = extractScene(userText);
    const matched = solutions.filter((s) => s.applicableScenes.includes(scene));
    recommended = matched.length >= 3 ? matched.slice(0, 3) : solutions.slice(0, 3);
    reply = `根据你的需求，我为你匹配了 **3 套方案**：\n\n- **经济方案**：预算友好，覆盖核心笑点\n- **推荐方案**：主流搭配，历史客户满意度 94%\n- **升级方案**：品牌传播效应最大化\n\n每套方案都包含演员配置、时长、报价明细，你可以在右侧查看并「获取方案」。如果需要调整（换人 / 加时 / 压价），随时告诉我。`;
    confidence = hasBudget && hasHeadcount ? "高" : "中";
    suggestions = ["查看推荐方案详情", "换成更松弛的组合", "有没有 20 万以内的方案"];
  }

  const tokens = tokenize(reply);
  for (const t of tokens) {
    await sleep(18 + Math.random() * 30);
    yield t;
  }
  return { finalConfidence: confidence, recommended, suggestions };
}

function extractScene(text: string): string {
  if (text.includes("年会")) return "年会";
  if (text.includes("团建")) return "团建";
  if (text.includes("发布")) return "发布会";
  if (text.includes("商场")) return "商场活动";
  if (text.includes("答谢") || text.includes("VIP")) return "客户答谢";
  return "年会";
}

function tokenize(text: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const size = Math.max(1, Math.min(text.length - i, Math.round(1 + Math.random() * 3)));
    out.push(text.slice(i, i + size));
    i += size;
  }
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Simulated operator-side AI: generates 3 solution tiers for a given opportunity requirement
export async function generateOperatorSolutions(sceneHint: string): Promise<Solution[]> {
  await new Promise((r) => setTimeout(r, 900));
  const scene = sceneHint || "年会";
  const matched = solutions.filter((s) => s.applicableScenes.includes(scene));
  const pool = matched.length >= 3 ? matched : solutions;
  // Return one of each tier if possible
  const tiers: ("经济方案" | "推荐方案" | "升级方案")[] = ["经济方案", "推荐方案", "升级方案"];
  return tiers.map((t) => pool.find((s) => s.tier === t) ?? pool[0]!);
}

/** Reorder solutions using team feedback: solutions matching negatively-reviewed dimensions drop, positively-reviewed rise. */
export function rankByFeedback(input: Solution[]): { list: Solution[]; signals: number } {
  const feedback = getFeedback();
  if (feedback.length === 0) return { list: input, signals: 0 };
  const scored = input.map((s) => {
    let score = s.recommendScore;
    for (const fb of feedback) {
      const delta = fb.positive ? 2 : -3;
      if (fb.kind === "方案推荐" && fb.dimension.includes("SKU") && s.tier === "推荐方案") score += delta;
      if (fb.kind === "报价" && fb.dimension.includes("毛利") && s.tier === "升级方案") score += delta;
      if (fb.kind === "艺人推荐" && fb.dimension.includes("档期")) score += delta * 0.5;
      if (fb.kind === "需求识别" && fb.dimension.includes("预算") && s.tier === "经济方案") score += delta * -1;
    }
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return { list: scored.map((x) => x.s), signals: feedback.length };
}