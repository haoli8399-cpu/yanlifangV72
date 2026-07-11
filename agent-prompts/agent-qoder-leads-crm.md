# Agent Qoder: CRM 线索中心前端

## 任务目标

新建 CRM 线索中心前端页面：让销售在 supplier 端看到增长工具来的线索，按评分排序，一键转正式方案。

## 工作空间

`/Users/wudixingyunxingleo/projects/演立方/codebase/`

## 后端 API（已就绪）

| 端点 | 用途 |
|:---|:---|
| `GET /v1/leads?status=&priority=&tool_type=&page=&pageSize=` | 线索列表 |
| `GET /v1/leads/:id` | 线索详情（含 tool_result + proposal） |
| `PATCH /v1/leads/:id` | 更新状态/分配/优先级 |
| `POST /v1/leads/:id/convert` | 一键转正式方案 |

参考：`backend/src/api/leads.ts` — 完整 Zod Schema 和返回格式

## 新建文件

### 1. `src/routes/supplier.leads.tsx` — 线索列表页

**参考实现：** `src/routes/supplier.opportunities.tsx`（相同的 Ant Design Table 模式）

**功能：**
- 顶部状态筛选 Tabs：全部 / 新线索 / 已联系 / 已发方案 / 已查看 / 成交 / 丢单
- 优先级筛选：高 / 中 / 低
- 工具类型筛选：预算计算器 / 保险方案生成器
- 搜索框（客户名/公司/手机号）
- 表格列：线索评分(徽章) | 客户 | 公司 | 工具类型 | 活动类型 | 预算 | 人数 | 状态 | 负责人 | 创建时间 | 操作
- 线索评分列使用彩色徽章：≥80绿色、50-79橙色、<50灰色
- 操作列：「查看详情」「生成方案」
- 行点击进入详情页
- 支持分页

### 2. `src/routes/supplier.leads.$id.tsx` — 线索详情页

**布局：** 两栏（左宽右窄）

**左栏（主内容）：**
- 客户信息卡片：姓名、公司、手机号、微信(如有)、来源渠道
- 结构化答案卡片（来自工具）：活动类型、人数、预算、城市、活动目标、参与对象、氛围偏好等
- AI 结果摘要卡片：推荐方案、预算区间、风险提醒、汇报说明
- 跟进记录区（预留，可先做静态展示）

**右栏（侧边栏）：**
- 线索评分大卡片（分数 + 等级 + 评分明细）
- 状态操作：下拉切换状态 + 「更新」
- 负责人：可修改
- **「一键生成正式方案」按钮**（品牌紫大按钮）→ 调用 POST /v1/leads/:id/convert → 成功后提示并跳转

### 3. `src/shared/components/LeadScoreBadge.tsx` — 线索评分徽章

- Props: `score: number`
- ≥80：绿色背景 + 绿色文字 + "高优"前缀
- 50-79：橙色背景 + 橙色文字 + "中优"前缀
- <50：灰色背景 + 灰色文字 + "低优"前缀
- 无评分：灰色 "未评分"

### 4. `src/shared/types.ts` — 新增 Lead 类型（追加）

```typescript
export interface Lead {
  id: string;
  tool_type: 'budget_calculator' | 'insurance_plan' | 'annual_plan';
  source_channel?: string;
  source_user?: string;
  answers: Record<string, string>;
  ai_result_summary?: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'contacted' | 'proposal_sent' | 'viewed' | 'won' | 'lost';
  assigned_to?: string;
  customer_name?: string;
  company?: string;
  phone?: string;
  wechat?: string;
  tool_result?: ToolResult;
  proposal?: { id: string; code: string };
  created_at: string;
  updated_at: string;
}

export interface ToolResult {
  id: string;
  lead_id: string;
  tool_type: string;
  result_json: Record<string, any>;
  ai_output?: string;
  share_count: number;
  download_count: number;
}
```

### 5. `src/shared/mock/data.ts` — 新增 leads Mock（追加）

至少 6 条线索，覆盖不同工具类型、评分、状态：
- 2条预算计算器（高优80分+、中优60分）
- 2条保险方案生成器（高优85分+、低优30分）
- 1条已转方案的（status=proposal_sent）
- 1条已成交的（status=won）

## 设计规范

| 元素 | 规范 |
|:---|:---|
| 品牌主色 | `#5B4FD6` |
| 表格行高 | 紧凑（参考 opportunities 页） |
| 评分徽章 | 三种颜色，圆角4px，字号12px |
| 详情页卡片 | 白底 + 12px圆角 + 轻微阴影 |
| 主按钮「生成方案」 | 品牌紫，高度40px |
| 状态筛选 Tabs | 使用 Ant Design Segmented |

## 验收标准

1. ✅ `/supplier/leads` 展示线索列表，可按状态/优先级/工具类型筛选
2. ✅ 线索评分徽章正确显示三种颜色
3. ✅ 点击行进入 `/supplier/leads/$id` 详情
4. ✅ 详情页展示结构化答案和 AI 结果摘要
5. ✅ 「一键生成正式方案」按钮可点击（Mock调用，提示成功）
6. ✅ 在 supplier 侧边栏增加「线索中心」导航入口

## 禁止

- ❌ 不要修改已有页面（opportunities/workspace 等）
- ❌ 不要调用真实 API（全部 Mock 数据，但 API 调用结构预留）
- ❌ 不要硬编码颜色（使用 CSS 变量或 theme.ts 的 Token）
- ❌ 不要做复杂动画

## 参考文件

- 列表页参考：`src/routes/supplier.opportunities.tsx`
- 详情页参考：`src/routes/supplier.opportunities.$id.tsx`
- 后端API格式：`backend/src/api/leads.ts`
- 类型定义：`src/shared/types.ts`
- Mock数据：`src/shared/mock/data.ts`

响应中文。
