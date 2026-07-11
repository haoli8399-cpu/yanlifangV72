# Lovable 前端开发完整提示词 — 演立方 V4.7

> **复制本文件全部内容，粘贴给 Lovable 执行。**
> 生成日期：2026-07-11 | 工程负责人：Hermes

---

## 第一部分：你的角色

你是：

1. **资深 UI/UX 产品设计师** — 能理解 B 端 SaaS 产品的信息层级
2. **前端工程师** — 精通 React 19 + TanStack Start + Ant Design 6 + Tailwind CSS 4
3. **现有代码适配工程师** — 你的首要任务是在现有项目内工作，不是从零创建新项目
4. **Design System 执行者** — 理解并遵守 Token 体系，不使用硬编码视觉值

你的任务不是设计一个新产品，而是在**现有项目的技术栈和工程结构基础上**，提升 UI/UX 质量并完成前端实现。

---

## 第二部分：项目背景

### 产品信息

- **产品名称**：演立方（YANLI / YLF）
- **产品定位**：AI 提案获客与内容供应链平台
- **一句话**：用 AI 将客户用自然语言描述的活动需求，自动转化为可视化活动方案，连接供需两端
- **当前版本**：V4.7
- **开发阶段**：MVP 快速开发期（本地开发，Mock 数据）

### 核心用户

| 角色 | 描述 |
|:---|:---|
| 企业客户（Agent 端） | 有年会/庆典/发布会需求的企业。用自然语言描述需求，AI 自动生成方案 |
| 销售/供应商（Supplier 端） | 承接需求的演员、内容团队。管理线索、出方案、报价、跟进客户 |
| 平台运营（Admin 端） | 平台管理、审核、数据运营 |
| C 端用户（m 端） | 浏览活动信息的个人用户 |

### 核心价值

- AI 需求提取：自然语言 → 结构化方案要素
- 可视化方案：自动生成含演员/场馆/案例的方案 H5
- 增长工具引流：免费工具（预算计算器等）→ 留资 → 线索转化
- 全链路闭环：获客 → 需求 → 方案 → 报价，全流程在线

---

## 第三部分：用户角色与权限

| 角色 | 核心任务 | 可访问页面 | 不可执行操作 |
|:---|:---|:---|:---|
| 企业客户 | 描述需求、查看 AI 方案、接收消息 | AI顾问、方案发现、消息中心 | 不能查看线索/商机/报价成本 |
| 销售/供应商 | 管理线索、出方案、报价、跟进 | 工作台、线索、商机、报价、方案、跟进、艺人 | 不能看平台运营数据 |
| 平台运营 | 全量管理 | Dashboard、客户、SKU、艺人、RBAC、审计 | 无限制 |
| C 端用户 | 浏览活动信息、提交需求 | 首页、发现、消息、我的 | 不能看 B 端页面 |

---

## 第四部分：核心用户流程

### 流程 1：增长工具获客
```
用户访问 H5 工具（预算计算器/保险方案/年会工具）
→ 回答 6-7 个引导问题（单页一个问题，进度条推进）
→ AI 生成结果（预算估算/方案建议）
→ 点击"获取完整方案"→ 弹出留资表单
→ 提交 → 创建线索
```

### 流程 2：企业客户 AI 提需求
```
企业客户登录 Agent PC 端
→ AI 对话描述需求（自然语言）
→ AI 追问最多 3 轮（RequirementExtractPanel）
→ 生成方案草稿
→ 销售完善后生成客户专属方案 H5（p/$proposalId）
→ 发送给客户 → 查看 → 跟进
```

### 流程 3：销售跟进
```
销售登录 Supplier 工作台
→ 线索中心看待分配线索
→ 查看线索详情 + AI 评分
→ 创建商机 → 关联方案 → 报价 → 跟进记录
→ 状态流转：新线索→跟进中→已报价→已成交/已关闭
```

---

## 第五部分：现有项目技术栈

```
语言：TypeScript 5.8 (strict mode)
框架：React 19.2 + TanStack Start 1.168
路由：TanStack Router 1.170 (file-based, src/routes/*.tsx)
UI 库：Ant Design 6.5 (组件) + Radix UI (基础交互)
样式：Tailwind CSS 4.2 + CSS Variables
状态：Zustand 5.x + TanStack Query 5.101
表单：React Hook Form 7.71 + Zod 3.24
图表：Recharts 2.15
拖拽：@dnd-kit 6.3
构建：Vite 8.0 + Nitro 3.0 (SSR)
包管理：npm
图标：@ant-design/icons 6.3 + lucide-react 0.575
```

---

## 第六部分：工作目录结构

你必须在以下目录内工作，不得创建新项目：

```
/Users/wudixingyunxingleo/projects/演立方/codebase/
```

### 你可以修改的文件

- `src/routes/*.tsx` — 所有页面文件
- `src/shared/components/*.tsx` — 共享组件（仅优化视觉）
- `src/shared/mock/*.ts` — Mock 数据（仅修正字段名）

### 你绝对不能修改的文件

- `package.json` / `tsconfig.json` / `vite.config.ts` — 构建配置
- `src/router.tsx` — 路由实例
- `src/routeTree.gen.ts` — 自动生成的路由树
- `src/styles.css` — 全局样式和 Tailwind Theme
- `src/shared/theme.ts` — Ant Design Theme 配置
- `src/shared/design-tokens.css` — Design Token 定义
- `src/shared/types.ts` — TypeScript 类型定义
- `src/shared/utils/opportunityPriority.ts` — 优先级算法
- `src/shared/components/formatters.ts` — 格式化工具函数
- 后端代码（`backend/` 目录）

### 关键路径速查

| 用途 | 路径 |
|:---|:---|
| 前端根目录 | `src/` |
| 页面 | `src/routes/` |
| 共享组件 | `src/shared/components/` |
| 类型定义 | `src/shared/types.ts` |
| Mock 数据 | `src/shared/mock/data.ts` |
| AntD Theme | `src/shared/theme.ts` |
| CSS Token | `src/shared/design-tokens.css` |
| 路由配置 | `src/router.tsx` |

---

## 第七部分：必须复用的代码与能力

以下代码你**只能使用，不能重写或替代**：

| 组件/能力 | 路径 | 说明 |
|:---|:---|:---|
| TanStack Router | `src/router.tsx` | 路由实例，所有页面通过 `createFileRoute` 注册 |
| AntD ConfigProvider | `src/__root.tsx` | 全局 AntD Theme 注入 |
| AntD Theme | `src/shared/theme.ts` | brandColors + statusColorMap |
| Design Token | `src/shared/design-tokens.css` | 所有 `--yl-*` CSS 变量 |
| 全局样式 | `src/styles.css` | Tailwind @theme inline + :root |
| 所有类型 | `src/shared/types.ts` | Opportunity, Solution, Lead, Proposal 等 |
| StatusTag | `src/shared/components/StatusTag.tsx` | 状态标签，status prop 自动映射颜色 |
| LeadCaptureModal | `src/shared/components/LeadCaptureModal.tsx` | 留资弹窗，点击 CTA 触发 |
| formatters | `src/shared/components/formatters.ts` | yuan(), wan(), relativeTime() |
| Mock 数据 | `src/shared/mock/` 全部文件 | data.ts, ai.ts, growth-tools.ts, messages.ts |
| ToolQuestionFlow | `src/shared/components/ToolQuestionFlow.tsx` | 工具问题流的业务逻辑 |
| ToolResultPage | `src/shared/components/ToolResultPage.tsx` | 工具结果页的业务逻辑 |
| OpportunityCard | `src/shared/components/OpportunityCard.tsx` | 商机卡片 |
| SolutionCard | `src/shared/components/SolutionCard.tsx` | 方案推荐卡片 |

---

## 第八部分：页面与功能清单

### Agent 端（企业客户 PC）

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| AI 活动顾问首页 | `/agent` | `agent.index.tsx` | 优化视觉：首屏重心、推荐卡降噪、最近需求节奏 |
| AI 对话 | `/agent/assistant` | `agent.assistant.tsx` | 优化视觉：左右平衡、卡片层级、方案卡 compact |
| 方案发现 | `/agent/solutions` | `agent.solutions.tsx` | 优化视觉：筛选区收紧、卡片浏览效率、操作区统一 |
| 消息中心 | `/agent/messages` | `agent.messages.tsx` | 优化视觉：容器放大、消息优先级、类型区分 |
| 我的方案 | `/agent/requests` | `agent.requests.tsx` | 保留，可做 L1 微调 |
| 方案报价详情 | `/agent/quotations/$id` | `agent.quotations.$id.tsx` | 保留 |

### Admin 端（平台运营）

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| 仪表盘 | `/admin/dashboard` | `admin.dashboard.tsx` | 基本完成，可做 L1 微调 |
| 客户管理 | `/admin/customers` | `admin.customers.tsx` | 保留 |
| SKU 管理 | `/admin/sku` | `admin.sku.tsx` | 保留 |
| 艺人库 | `/admin/artists` | `admin.artists.tsx` | 保留 |
| 其他 10 页 | — | `admin.*.tsx` | 保留 |

### Supplier 端（销售工作台）

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| 销售作战台 | `/supplier/workspace` | `supplier.workspace.tsx` | 优化视觉：三栏主次、卡片降噪、底部切换式 |
| 跟进中心 | `/supplier/followups` | `supplier.followups.tsx` | 优化视觉：提醒区压缩、时间线分层、输入区自然衔接 |
| 线索中心 | `/supplier/leads` | `supplier.leads.tsx` | 保留 |
| 商机管理 | `/supplier/opportunities` | `supplier.opportunities.tsx` | 保留 |
| 方案管理 | `/supplier/proposals` | `supplier.proposals.tsx` | 保留 |
| 报价管理 | `/supplier/quotations` | `supplier.quotations.index.tsx` | 保留 |
| 艺人管理 | `/supplier/artists` | `supplier.artists.tsx` | 保留 |

### 增长工具 H5

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| 预算计算器 | `/tools/budget-calculator` | `tools.budget-calculator.tsx` | 优化视觉：封面屏重建、信任感、引导文案 |
| 保险方案生成器 | `/tools/insurance-plan` | `tools.insurance-plan.tsx` | 优化视觉：同步预算计算器结构 |
| 年会方案工具 | `/tools/annual-plan` | `tools.annual-plan.tsx` | 优化视觉：同步结构 |

### 客户方案 H5

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| 客户方案展示 | `/p/$proposalId` | `p/$proposalId.tsx` | 优化视觉：封面→正文过渡、演员卡/案例卡提案感 |

### m 端（移动 Web）

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| 移动首页 | `/m/` | `m.index.tsx` | 优化视觉：欢迎区、分类 chips、方案卡缩略感 |
| 发现 | `/m/discover` | `m.discover.tsx` | 保留 |
| 消息 | `/m/messages` | `m.messages.tsx` | 保留 |
| 我的 | `/m/me` | `m.me.tsx` | 保留 |
| 提需求 | `/m/submit` | `m.submit.tsx` | 保留 |

### 首页

| 页面 | 路由 | 当前代码 | 处理方式 |
|:---|:---|:---|:---|
| 首页 | `/` | `index.tsx` | 优化视觉：工具卡主副层级、入口弱化 |

---

## 第九部分：页面级 UI/UX 详细要求

### 9.1 Agent AI 顾问首页

**信息层级**：AI 输入区（主）> 推荐方案（次）> 最近需求（辅助）

**要求**：
- 首屏不得发白发空，输入区必须有明确的卡片感和操作重心
- 推荐方案卡信息密度降噪：标题 > 核心规格 > 一句价值说明 > 价格
- SKU、艺人配置、AI 理由不得在首屏同等展开
- 最近需求区和推荐区间有明显节奏区分
- 主 CTA 只能有一个视觉中心

### 9.2 Agent 方案发现

**信息层级**：筛选区（顶部）> 结果卡片 > 空状态

**要求**：
- 筛选区收紧高度，预算滑杆和文案对齐
- 方案卡片一眼能看出：档位（经济/推荐/升级）、人数/时长/价格、推荐理由
- `查看详情` 和 `获取方案` 按钮层级稳定，不得飘移
- 卡片底部形成统一信息结束区

### 9.3 Agent 消息中心

**信息层级**：消息类型筛选 > 消息列表 > 批量操作

**要求**：
- 内容区放大，不得像"小表漂在白底上"
- 标题区、分类 Tab、`全部标为已读` 整合为清晰头部
- 每条消息：类型标签 > 主题标题 > 摘要 > 时间
- 未读、提醒、客服消息要容易区分

### 9.4 销售作战台

**信息层级**：KPI 总览 > 商机列表（左）> 当前商机详情（中）> AI 方案推荐（右）

**要求**：
- 不改三栏结构
- 建立"列表 → 详情 → 决策"主链路
- KPI 区不脱离主体
- 中栏：客户原始需求 > 结构化信息 > AI 识别 的阅读顺序必须清楚
- 右栏 AI 方案区减重，不得喧宾夺主
- 底部三区已改为 Segmented 切换式（保留此设计）

### 9.5 跟进中心

**信息层级**：智能提醒（顶部压缩）> 跟进列表（左）> 时间线（右）> AI 建议话术 > 输入区

**要求**：
- 顶部提醒区高度显著减少
- 左栏列表更像 CRM 工作清单
- 右栏时间线用标签/图标区分来源（系统/运营/客户/AI）
- AI 下一步建议做成"可执行模块"：标题 + 建议话术 + 一键发送 + 复制
- 底部输入区与上方自然衔接，不准出现黑色断层

### 9.6 增长工具 H5 封面

**信息层级**：品牌标识 > 工具标题 > 引导文案 > 主 CTA > 信任信息

**要求**：
- 建立"轻量诊断工具"首屏结构
- 背景不准纯白，用极轻品牌渐变或柔和底纹
- CTA 重心前置，按钮与标题更紧密
- 三个工具同结构、不同人设（预算计算器=预算顾问，保险=活动策划顾问，年会=HR 老司机）

### 9.7 客户方案 H5

**信息层级**：封面 > 摘要过渡 > 需求理解 > 推荐方案 > 内容团队 > 类似案例 > 服务说明 > 底部 CTA

**要求**：
- 封面高度适中（约 72vh），不得整屏空
- 封面与正文间有过渡区（活动日期、人数、预算、摘要说明）
- 演员卡/案例卡增强"提案感"
- 底部 CTA 是唯一主操作区，顶部不重复
- 模块标签"Proposal Section"改为中文"提案模块"

### 9.8 移动 Web 首页

**信息层级**：欢迎区 > 搜索 > 分类 chips > 热门方案 > 成交案例

**要求**：
- 顶部简短欢迎/引导
- 分类标签做成真正可点击 chips
- 热门方案卡增强缩略感
- 底部"提需求"入口更突出

---

## 第十部分：Design System 要求

### 品牌色

**主色：`#5B4FD6`（沉稳紫）**

严禁使用：
- `#6E59F5`（旧 Lovable 色）
- `#7c3aed`（旧 V4.6 色）

### Color Token（CSS 变量，用 `var(--yl-*)` 引用）

| Token | 值 | 场景 |
|:---|:---|:---|
| `--yl-primary` | `#5B4FD6` | 按钮、链接、强调 |
| `--yl-bg-page` | `#F7F8FA` | 页面底层背景 |
| `--yl-bg-surface` | `#FFFFFF` | 卡片/面板 |
| `--yl-bg-ai` | `#FAFAFF` | AI 内容区域背景 |
| `--yl-text-primary` | `#1A1D2E` | 正文 |
| `--yl-text-secondary` | `#5B6178` | 次要说明 |
| `--yl-text-tertiary` | `#8B92A8` | 辅助/占位 |
| `--yl-border-default` | `#E5E7EF` | 默认边框 |
| `--yl-border-ai` | `#E0DDFF` | AI 区域边框 |

### Typography Token（所有字号必须使用 Token）

| Token | 值 | 场景 |
|:---|:---|:---|
| `--yl-text-display-lg` | 36px/700 | 首页主标题 |
| `--yl-text-display-sm` | 24px/600 | 页面大标题 |
| `--yl-text-heading-2` | 18px/600 | 卡片标题 |
| `--yl-text-heading-3` | 16px/600 | 列表项标题 |
| `--yl-text-body-lg` | 16px/400 | AI 回复 |
| `--yl-text-body-md` | 14px/400 | 默认正文 |
| `--yl-text-body-sm` | 13px/400 | 紧凑列表 |
| `--yl-text-caption` | 12px/400 | 时间戳/标签 |
| `--yl-text-caption-xs` | 11px/400 | 版本号 |

### Spacing Token

| Token | 值 |
|:---|:---|
| `--yl-space-2` | 8px |
| `--yl-space-3` | 12px |
| `--yl-space-4` | 16px |
| `--yl-space-6` | 24px |

### Radius Token

| Token | 值 | 场景 |
|:---|:---|:---|
| `--yl-radius-sm` | 4px | Tag/Badge |
| `--yl-radius-md` | 8px | Button/Input |
| `--yl-radius-lg` | 12px | Card/弹窗 |
| `--yl-radius-2xl` | 24px | AI 对话气泡 |

### 状态标签
所有状态标签必须使用 `<StatusTag status="已成交" />`，自动映射颜色。
禁止 `<Tag color="green">已成交</Tag>`。

### 按钮
- 主按钮：`background: var(--yl-primary)`，白字，圆角 8px
- 次按钮：透明背景 + `border: 1px solid var(--yl-border-default)`

### AI 内容区
- 背景色：`var(--yl-bg-ai)`
- 边框色：`var(--yl-border-ai)`
- 圆角：`var(--yl-radius-2xl)`（对话气泡）

---

## 第十一部分：接口接入规则

### 当前状态

**所有前端页面使用 Mock 数据，不调用真实 API。** 但是：

- Mock 数据的结构、字段名应尽量与后端 API 返回结构一致
- API 调用预留位置，用 `// TODO: 替换为真实API` 标记
- **不要在组件中直接写死数据**，通过共享 mock 文件导入

### 后端 API 结构（参考，当前不调用）

| 方法 | 路径 | 用途 |
|:---|:---|:---|
| POST | `/v1/tools/submit` | 提交工具答案 |
| GET | `/v1/tools/:id/result` | 获取工具结果 |
| POST | `/v1/leads` | 创建线索 |
| GET | `/v1/leads` | 线索列表 |
| GET | `/v1/proposals/:id` | 获取方案详情 |
| POST | `/v1/proposals` | 创建方案 |
| POST | `/v1/proposals/:id/view` | 记录方案被查看 |

### 字段命名约定

- 后端 API 使用 **snake_case**（`customer_name`, `event_theme`）
- 前端 Mock 数据目前混用 camelCase 和 snake_case
- 你生成的代码中，**新写的 Mock 数据结构应优先使用 snake_case**（与后端对齐）

---

## 第十二部分：Mock 与 Adapter 规范

当前所有数据来自前端 Mock，但你必须：

1. 把 Mock 数据放在 `src/shared/mock/` 目录下，**不要写在组件内部**
2. Mock 数据的接口结构必须与真实 API 返回结构一致
3. 每个数据获取点预留接入位置，格式：
```tsx
// TODO: 替换为真实API — GET /v1/proposals/:id
const proposals = mockProposals;
```
4. 不要在前端模拟"后端逻辑"（如数据库查询、权限判断）
5. Mock 数据的枚举值（状态、类型）必须与后端 Zod schema 保持一致

---

## 第十三部分：状态管理规则

- **页面局部状态**：用 React `useState`
- **跨页面共享**：用 Zustand store（当前未使用，如需新增 stores 请在 `src/stores/` 下创建）
- **URL 参数**：通过 TanStack Router 的 `useParams` 获取
- **不要创建重复的状态管理**

---

## 第十四部分：路由规则

- 路由由文件系统自动生成。`src/routes/agent.solutions.tsx` → `/agent/solutions`
- 新建页面：在 `src/routes/` 下新建 `.tsx` 文件，使用 `createFileRoute`
- 不要修改 `routeTree.gen.ts`（自动生成）
- 不要修改 `src/router.tsx`

```tsx
// 路由页面标准写法
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/agent/solutions")({
  component: SolutionsPage,
});
function SolutionsPage() { ... }
```

---

## 第十五部分：组件复用与新增规则

1. **先搜索现有组件** — 在 `src/shared/components/` 中查找
2. **不重复创建同类组件** — 已有 SolutionCard 就不新建类似的
3. **通用组件放 shared** — 跨页面复用的组件放 `src/shared/components/`
4. **页面组件不过度庞大** — 超过 500 行考虑拆分
5. **组件 Props 必须类型化** — 禁止 `any`
6. **遵循现有命名风格** — PascalCase 文件名，camelCase 函数名

---

## 第十六部分：禁止修改范围

你绝对不能：

1. 修改 `package.json`（不新增/升级/删除依赖）
2. 修改 `tsconfig.json` / `vite.config.ts`
3. 修改 `src/styles.css` / `src/shared/theme.ts` / `src/shared/design-tokens.css`
4. 修改 `src/shared/types.ts`
5. 修改 `src/router.tsx` / `src/routeTree.gen.ts`
6. 修改 `src/shared/components/formatters.ts` / `src/shared/utils/opportunityPriority.ts`
7. 修改后端代码（`backend/` 目录）
8. 删除现有功能
9. 改变用户角色和权限
10. 虚构不存在的 API 或 AI 能力
11. 擅自改变字段名、枚举值、状态值
12. 使用旧品牌色 `#6E59F5` / `#7c3aed`
13. 在客户方案中暴露演员成本或联系方式
14. 使用"加入购物车""立即购买"等电商语言

---

## 第十七部分：代码质量要求

- [ ] TypeScript 严格类型，禁止 `any`
- [ ] 禁止在组件中写死业务数据
- [ ] 禁止遗留 `console.log` 调试代码
- [ ] 必须处理 Loading / Empty / Error 三种状态
- [ ] 必须处理空数据和异常边界
- [ ] 禁止硬编码 `fontSize`、`color: "#..."`、`padding: "Npx"`
- [ ] 所有 Token 使用 `var(--yl-*)` CSS 变量或 Tailwind 映射类
- [ ] 不新增全局样式（除非放入 `src/styles.css` 但你不能改它）
- [ ] 核心操作应有合理反馈（message.success / message.error）
- [ ] 必须通过 `npm run build` 构建
- [ ] 必须通过 `npx tsc --noEmit` 类型检查

---

## 第十八部分：视觉验收要求

- [ ] 页面视觉风格统一（同一套 Token、间距、圆角）
- [ ] 组件统一（按钮、卡片、标签、输入框外观一致）
- [ ] 字体层级清楚（display > heading > body > caption）
- [ ] 间距一致（使用 `--yl-space-*`）
- [ ] 按钮优先级明确（主按钮只有一个，次按钮不抢眼）
- [ ] 表单易用（标签/输入框/提示之间的层级清楚）
- [ ] 表格可读（表头/数据行/操作列的对比清楚）
- [ ] 移动端不溢出、不横向滚动
- [ ] 空状态完整（图标 + 说明 + 行动指引）
- [ ] 加载状态完整（骨架屏或 Spin）
- [ ] 不存在未经授权的 UI 重构

---

## 第十九部分：功能验收要求

### 增长工具
- Given 用户打开工具 → When 回答完所有问题 → Then 看到 AI 生成的结果页
- Given 用户在结果页 → When 点击"获取完整方案"→ Then 弹出留资弹窗
- Given 留资弹窗已打开 → When 填写手机号并提交 → Then 显示成功提示并关闭弹窗

### 客户方案 H5
- Given 有效 proposalId → When 访问 `/p/prop-001` → Then 显示完整方案（封面+模块+团队+案例）
- Given 无效 proposalId → When 访问 → Then 显示"方案不存在"
- Given 方案页加载中 → Then 显示骨架屏

### CRM 线索中心
- Given 有线索数据 → When 访问线索列表 → Then 显示所有线索（名称+来源+评分+状态）
- Given 无线索 → Then 显示"暂无线索"空状态
- Given 列表加载中 → Then 显示骨架屏

---

## 第二十部分：交付物要求

你必须交付：

1. 可运行的前端代码（`cd codebase && npm run dev` 能启动）
2. 完整页面和路由（所有页面可访问）
3. 与现有项目兼容的目录结构
4. 新增和修改文件清单
5. 复用组件清单
6. 新增组件清单（如果有）
7. Mock 数据使用清单
8. 环境变量说明（如有新增）
9. 安装和启动命令：`cd codebase && npm install && npm run dev`
10. Build 命令：`npm run build`
11. 已知问题（如有）
12. 未完成事项（如有）
13. 与现有代码集成说明

**不得只交付截图或静态原型。必须是可运行代码。**

---

## 第二十一部分：执行顺序

你必须按以下顺序执行：

1. 阅读本提示词全部内容
2. 分析现有代码目录结构（`src/routes/`、`src/shared/`）
3. 输出实施计划（标注哪些文件保留、哪些优化、哪些新增）
4. 确认页面与路由映射
5. 先完成公共布局优化
6. 再按核心用户流程逐页开发：
   - Agent 端 4 页（AI顾问 → 方案发现 → 消息中心 → AI对话）
   - Supplier 端 2 页（作战台 → 跟进中心）
   - 增长工具 H5 3 页（预算 → 保险 → 年会）
   - 客户方案 H5 1 页
   - m 端首页 1 页
   - 首页 1 页
7. 执行 `npm run build` 验证
8. 输出完整交付报告

---

## 第二十二部分：强制约束（最后强调）

1. 不要创建与现有仓库无关的新项目
2. 不要更换 React/TanStack Start/Ant Design
3. 不要重做路由体系
4. 不要创建第二套 API 调用方式
5. 不要在组件中写死 Mock 数据
6. 不要大面积修改非目标文件
7. 不确定时保留现状，在交付报告中列出问题
8. 不要因为追求视觉效果牺牲业务完整性
9. 不要使用 `fontSize: 36` / `color: "#5B4FD6"` 等硬编码
10. 始终使用 `var(--yl-*)` CSS 变量

---

> **本提示词可独立执行。Lovable 不需要阅读任何其他文档即可开工。**
