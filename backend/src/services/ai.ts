// ============================================================
// AI 方案生成服务
// DeepSeek API 主调用 + 通义千问备选自动切换
// 对齐 docs/prompts/ai-solution-templates.md v1.1
// ============================================================

// ---- AI 方案输出类型 ----

/** AI 生成的费用明细 */
export interface AiPlanPriceDetail {
  base_price: number;
  extra_fees: Array<{ item: string; amount: number }>;
  total_price: number;
  price_note: string;
}

/** AI 生成的演员配置 */
export interface AiPlanActorConfig {
  min_count: number;
  max_count: number;
  style_requirements: string[];
  tier_recommendation: string;
  specific_roles: {
    lead?: { tier: string; count: number; duration_min: number };
    support?: { tier: string; count: number; duration_min: number };
    mc?: { tier: string; count: number; duration_min: number };
  };
}

/** AI 生成的定制内容 */
export interface AiPlanCustomContent {
  script_minutes: number;
  includes_performance: boolean;
  revision_limit: number;
}

/** AI 方案完整输出结构（对齐 ai-solution-templates.md 第三节） */
export interface AiPlanOutput {
  business_line: string;
  solution_name: string;
  scene_category: string;
  scene_subcategory?: string;
  price_detail: AiPlanPriceDetail;
  actor_config: AiPlanActorConfig;
  duration_minutes: number;
  venue_requirement?: string;
  equity_list?: string[];
  custom_content?: AiPlanCustomContent;
  special_notes: string[];
  uncertain_items: string[];
}

// ---- API 配置 ----

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const QWEN_MODEL = 'qwen-plus';

const AI_TEMPERATURE = 0.7;
const AI_MAX_TOKENS = 4096;
const AI_TIMEOUT_MS = 60_000; // 60 秒超时

// ============================================================
// System Prompt（从 ai-solution-templates.md 第三节提取）
// ============================================================

const SYSTEM_PROMPT = `你是后仰喜剧的AI方案顾问，负责为活动公司/甲方生成专业的演出方案。

## 你的职责
1. 理解用户需求，识别所属业务线
2. 基于价格体系计算出准确报价
3. 推荐合适的演员配置
4. 输出结构化方案供运营审核

## 四条业务线

### 线A：商演包场
- 适用场景：企业年会、客户答谢、团建包场等
- 场地信息：
  - 王府井剧场1号馆（310座）
  - 王府井剧场2号馆（160座）
  - 招商大魔方剧场（140座）
- 档期定义：
  - 周一到周四：每天1场（19:30～21:00）
  - 周五、周六、周日：每天2场（16:30～18:00，19:30～21:00）
- 价格（甲方标准价 / 活动公司7折渠道价）：
  | 场地 | 占用档期·周中 | 占用档期·周末 | 非占用档期 |
  |------|:------------:|:------------:|:---------:|
  | 王府井1号馆 | 20,000 / 14,000 | 26,000 / 18,200 | 18,000 / 12,600 |
  | 王府井2号馆 | 16,000 / 11,200 | 20,000 / 14,000 | 15,000 / 10,500 |
  | 大魔方剧场 | 15,000 / 10,500 | 15,000 / 10,500 | 15,000 / 10,500 |
- 关键判断逻辑：
  - "占用档期" = 用户选择的日期时间正好是常规演出时段
  - "非占用档期" = 用户选择的日期时间不在常规演出时段内
  - 如果用户没指定具体时间段，默认视为"占用档期"计算

### 线B：外出演出
- 适用场景：企业活动、商场开业、婚礼、私人派对等
- 价格（甲方标准价 / 活动公司7折渠道价）：
  | 时长 | 甲方价 | 活动公司价 | 标配演员数 |
  |------|:------:|:--------:|:--------:|
  | 20分钟 | 6,000 | 4,200 | 1人 |
  | 40分钟 | 10,000 | 7,000 | 2人 |
  | 60分钟 | 12,000 | 8,400 | 3人 |
  | 90分钟 | 16,000 | 11,200 | 5人 |
- 远程附加费：
  - 成都市绕城范围内：无附加费
  - 绕城外、大成都范围内：+500元/人（含差旅）
  - 成都市范围外：+1,000元/人/天（含差旅）
- 关键判断逻辑：
  - 先确定时长档位和对应标配人数
  - 再根据地点判断远程费
  - 如果用户要求的演员数超过标配，需在备注中标注"超出标配，需运营人工评估"

### 线C：演出场次赞助
- 适用场景：品牌想在已有演出中植入广告
- 价格（甲方标准价 / 活动公司7折渠道价）：
  - 周中场（周一至周五）：2,000/场 / 1,400/场
  - 周末场（周六、周日）：4,000/场 / 2,800/场
- 8项合作权益（品牌方可选配）：
  1. 定制麦克风话筒贴（品牌方自行设计制作）
  2. 舞台背景屏幕广告（品牌方提供设计稿）
  3. 剧场门口液晶屏广告（品牌方提供设计稿）
  4. 线下展架展示（品牌方自行设计制作）
  5. 品牌推广推文（公众号10万+粉丝 + 社群2000+）
  6. 舞台互动植入（主持人提及品牌/Slogan）
  7. 品牌伴手礼发放（品牌方提供产品）
  8. 品牌专属票根活动（品牌方设计制作）
- 关键判断逻辑：
  - 用户可能只选部分权益，需列出用户已选的权益清单
  - 权益1/4/7/8需品牌方自行制作，方案中需标注

### 线D：定制段子及短视频内容
- 适用场景：品牌定制脱口秀内容 + 视频素材授权
- 价格：3,000元/分钟
- 合作内容：
  1. 品牌专属脱口秀内容创作（后仰编剧团队原创）
  2. 视频素材制作与授权（品牌方可用于抖音/小红书/公众号）
- 关键判断逻辑：
  - 按分钟计费，用户指定时长
  - 视频素材授权是附带权益，不单独收费

### 线E：定制拼盘演出
- 适用场景：异地/大型商业演出，需多演员拼盘+内容定制
- 演出形式：脱口秀拼盘，单场90min
- 标准阵容：1名主持人 + 3-5名脱口秀演员（含领衔+常规）
- 演员咖位参考：
  - 领衔演员：T1（综艺级）或 T2（头部）
  - 常规演员：T3（主力）或 T4（成熟）
  - 主持人：T2-T3
- 费用构成（三项叠加）：
  | 费用类型 | 说明 | 谁定价 |
  |---------|------|:------:|
  | 出演费 | 演员自带内容上台表演 | 按咖位×时长（查表） |
  | 定制段子创作费 | 编剧为甲方定制原创段子，默认修改≤3次 | 按咖位×分钟 |
  | 定制段子表演费 | 表演新段子的额外费用（背稿+练习） | 按咖位×分钟 |
- 关键判断逻辑：
  - 先确定阵容结构（几人、什么咖位）
  - 再分别计算出演费+创作费+表演费
  - 如有属地定制需求，额外计创作费+表演费
  - 差旅/场地/设备由甲方另行承担，不在演艺服务费中
  - 付款节奏：预付款60%+尾款40%

## 通用规则
- 以上报价均不支持指定演员
- 演员最终阵容由运营根据档期匹配
- 如用户需求超出标准定价模型，标注"需人工报价"

## 输出格式要求
必须输出严格的 JSON 格式，结构如下：
{
  "business_line": "venue_booking|outdoor_show|show_sponsor|custom_content|custom_showcase",
  "solution_name": "方案名称（简短描述）",
  "scene_category": "一级场景分类",
  "scene_subcategory": "二级子场景（可选）",
  "price_detail": {
    "base_price": 数字,
    "extra_fees": [{"item": "费用项", "amount": 数字}],
    "total_price": 数字,
    "price_note": "报价说明"
  },
  "actor_config": {
    "min_count": 数字,
    "max_count": 数字,
    "style_requirements": ["风格要求"],
    "tier_recommendation": "推荐咖位（T1-T6）",
    "specific_roles": {
      "lead": {"tier": "T2", "count": 1, "duration_min": 25},
      "support": {"tier": "T3", "count": 2, "duration_min": 20},
      "mc": {"tier": "T3", "count": 1, "duration_min": 25}
    }
  },
  "duration_minutes": 数字,
  "venue_requirement": "场地要求（如有）",
  "equity_list": ["权益项列表（线C专用）"],
  "custom_content": {
    "script_minutes": 数字,
    "includes_performance": true,
    "revision_limit": 3
  },
  "special_notes": ["注意事项"],
  "uncertain_items": ["需人工确认的项"]
}`;

// ============================================================
// 需求数据输入（传递给 AI 的字段）
// ============================================================

/** 构建 user prompt 所需的需求字段 */
export interface DemandPromptInput {
  event_type: string;
  event_date: string;
  event_time?: string | null;
  city: string;
  address: string;
  audience_count?: number | null;
  duration_minutes?: number | null;
  comedy_style?: string | null;
  special_requirements?: string | null;
  budget?: number | null;
  venue_name?: string | null;
  venue_type?: string | null;
}

// ============================================================
// Prompt 构建
// ============================================================

/**
 * 根据需求数据构建 user prompt
 * 对齐 ai-solution-templates.md 第四节 User Prompt 模板
 */
function buildUserPrompt(input: DemandPromptInput): string {
  const location = [input.city, input.address].filter(Boolean).join(' ');
  const durationText = input.duration_minutes ? `${input.duration_minutes}分钟` : '待定';
  const budgetText = input.budget ? `${input.budget}元` : '未指定';
  const comedyText = input.comedy_style || '不限';
  const specialText = input.special_requirements || '无';

  const lines: string[] = [
    '请根据以下需求生成演出方案：',
    '',
    '【活动信息】',
    `- 活动类型：${input.event_type}`,
    `- 活动日期：${input.event_date}`,
    `- 活动时间：${input.event_time || '未指定'}`,
    `- 活动地点：${location || '未指定'}`,
    `- 预计人数：${input.audience_count ?? '未知'}`,
    '',
    '【演出需求】',
    `- 演出时长：${durationText}`,
    `- 喜剧类型偏好：${comedyText}`,
    `- 特殊要求：${specialText}`,
    `- 预算范围：${budgetText}`,
  ];

  // 场地信息（如有）
  if (input.venue_name || input.venue_type) {
    lines.push(
      '',
      '【场地信息】',
      `- 场地名称：${input.venue_name || '未指定'}`,
      `- 场地类型：${input.venue_type || '未指定'}`
    );
  }

  lines.push('', '请分析以上需求，判断所属业务线，生成方案。');

  return lines.join('\n');
}

// ============================================================
// LLM API 调用
// ============================================================

/** 从 AI 响应文本中提取 JSON */
function extractJson(text: string): string {
  // 尝试直接解析
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  // 尝试从 markdown 代码块中提取
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 尝试找到第一个 { 到最后一个 }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }

  throw new Error('无法从AI响应中提取JSON');
}

/** 调用 DeepSeek API */
async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: AI_TEMPERATURE,
        max_tokens: AI_MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `DeepSeek API 返回错误 ${response.status}: ${errorBody.substring(0, 200)}`
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    if (!data.choices?.length || !data.choices[0]?.message?.content) {
      throw new Error('DeepSeek API 返回空响应');
    }

    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** 调用通义千问 API（备选） */
async function callQwen(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_BACKUP_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_BACKUP_API_KEY 环境变量未设置');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: AI_TEMPERATURE,
        max_tokens: AI_MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `通义千问 API 返回错误 ${response.status}: ${errorBody.substring(0, 200)}`
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    if (!data.choices?.length || !data.choices[0]?.message?.content) {
      throw new Error('通义千问 API 返回空响应');
    }

    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================
// 方案生成入口
// ============================================================

/**
 * 生成 AI 演出方案
 * 优先调用 DeepSeek，失败时自动切换通义千问
 *
 * @param input - 需求数据
 * @returns AiPlanOutput 结构化方案
 */
export async function generateAiPlan(input: DemandPromptInput): Promise<AiPlanOutput> {
  const userPrompt = buildUserPrompt(input);

  console.log('[AI] 开始生成方案，业务类型:', input.event_type);
  console.log('[AI] User Prompt 长度:', userPrompt.length);

  let content: string;
  let usedProvider = 'deepseek';

  // 尝试 DeepSeek
  try {
    console.log('[AI] 调用 DeepSeek API...');
    content = await callDeepSeek(SYSTEM_PROMPT, userPrompt);
    console.log('[AI] DeepSeek 响应长度:', content.length);
  } catch (deepseekError: unknown) {
    const errMsg = deepseekError instanceof Error ? deepseekError.message : String(deepseekError);
    console.warn('[AI] DeepSeek 调用失败:', errMsg, '— 切换通义千问备选');

    // 自动切换备选
    try {
      content = await callQwen(SYSTEM_PROMPT, userPrompt);
      usedProvider = 'qwen';
      console.log('[AI] 通义千问 响应长度:', content.length);
    } catch (qwenError: unknown) {
      const qwenMsg = qwenError instanceof Error ? qwenError.message : String(qwenError);
      throw new Error(
        `AI方案生成失败: DeepSeek(${errMsg}) → 通义千问(${qwenMsg})`
      );
    }
  }

  // 解析 JSON 响应
  let aiPlan: AiPlanOutput;
  try {
    const jsonStr = extractJson(content);
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    // 校验必填字段
    if (!parsed.business_line || !parsed.solution_name || !parsed.price_detail) {
      throw new Error('AI响应缺少必填字段(business_line/solution_name/price_detail)');
    }

    aiPlan = parsed as unknown as AiPlanOutput;
  } catch (parseError: unknown) {
    const parseMsg = parseError instanceof Error ? parseError.message : String(parseError);
    console.error('[AI] JSON 解析失败，原始响应:', content.substring(0, 500));
    throw new Error(`AI方案解析失败: ${parseMsg}`);
  }

  console.log('[AI] 方案生成成功 — 业务线:', aiPlan.business_line, '— 提供商:', usedProvider);

  return aiPlan;
}
