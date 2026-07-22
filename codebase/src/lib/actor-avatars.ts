// AI 生成的插画头像(临时占位,标注为 AI 头像 · 待替换真实照片)。
// key 与 fixtures.ts / real-actors.ts 中的 avatarSeed 对齐。
import fengzihao from "@/assets/actors/fengzihao.jpg";
import tuaner from "@/assets/actors/tuaner.jpg";
import aike from "@/assets/actors/aike.jpg";
import yangxin from "@/assets/actors/yangxin.jpg";
import qiqibaba from "@/assets/actors/7788.jpg";

export const actorAvatars: Record<string, string> = {
  fengzihao,
  tuaner,
  aike,
  yangxin,
  "7788": qiqibaba,
};

export function getActorAvatar(seed?: string): string | undefined {
  if (!seed) return undefined;
  return actorAvatars[seed];
}

/** 按演员姓名反查 AI 头像(用于 Party / 团队展示,数据源没有 avatarSeed 时用)。 */
const nameToSeed: Record<string, string> = {
  "冯子豪": "fengzihao",
  "团儿": "tuaner",
  "艾克": "aike",
  "杨鑫": "yangxin",
  "77·88": "7788",
  "77·88(七七八八)": "7788",
};
export function getActorAvatarByName(name?: string): string | undefined {
  if (!name) return undefined;
  const seed = nameToSeed[name.trim()];
  return seed ? actorAvatars[seed] : undefined;
}

/** 用户可读说明:所有头像目前为 AI 生成插画,待真实照片替换。 */
export const AI_AVATAR_NOTE = "AI 生成插画 · 待真实照片替换";
