# Lovable — 演立方 V4.7 全栈前端开发提示词

> **复制全文发给 Lovable。在你的项目内执行。**
> 生成日期：2026-07-12 | 负责人：Hermes
> 已有 8 个 v0/Trae Design 预览页面作为设计参考基准。

---

## PART 1: 你的角色

你是演立方 V4.7 的**唯一前端实现工程师**。你的工作是：

1. 基于现有的 TanStack Start + React 19 + shadcn/ui 代码库
2. 按照 PRD 产品需求文档的功能定义
3. 按照 Design System 的设计规范
4. 按照 ARCHITECTURE 的 API 接口和数据库结构
5. 将全部 52 个页面/路由重建为一套完整、统一、高质量的前端产品

**你的任务不是局部修补，而是从头构建一整套页面。** 已完成的 8 个预览页面是你的质量基准。

---

## PART 2: 项目基本信息

### 产品定位

**演立方** — AI 提案获客与内容供应链平台。用 AI 将客户用自然语言描述的活动需求转化为可视化活动方案，连接供需两端。

### 用户角色

| 角色 | 端口 | 核心任务 |
|:---|:---|:---|
| 企业客户 | Agent 端 (PC) | 描述需求 → AI 生成方案 → 查看消息 |
| 销售/供应商 | Supplier 端 (PC) | 管理线索/商机 → 出方案/报价 → 跟进客户 |
| 平台运营 | Admin 端 (PC) | 仪表盘/客户管理/SKU/艺人/RBAC/审计 |
| C 端用户 | m 端 (移动Web) | 浏览/发现/提交需求 |
| 公众 | 增长工具 H5 | 免费工具 → 留资 → 转化 |
| 客户 | 方案 H5 | 查看专属活动方案 |

### 核心用户流程

1. **增长工具留资**：H5 工具 → 问答 → AI 结果 → 留资弹窗 → CRM 线索
2. **企业客户 AI 需求**：登录 → AI 对话 → 需求提取 → 方案生成 → 方案 H5
3. **销售跟进管线**：工作台 → 线索中心 → 商机 → 方案 → 报价 → 跟进 → 成交

### MVP 范围

- **Agent 端 (PC)**：AI 顾问首页、方案发现、AI 对话、我的方案、消息中心、需求提交
- **Admin 端 (PC)**：仪表盘、客户管理、SKU 管理、艺人管理、标签系统、RBAC、审计日志、AI 反馈、Prompt 管理、订单管理、机构管理、字典管理
- **Supplier 端 (PC)**：工作台、线索中心(列表+详情)、商机管理(列表+详情)、方案管理(列表+详情)、报价管理(列表+详情)、跟进中心、艺人管理、AI 反馈
- **m 端 (移动Web)**：首页、发现、需求提交、消息、我的
- **增长工具 H5**：预算计算器、保险方案生成器、年会方案工具
- **客户方案 H5**：客户专属方案展示页
- **首页**：Landing Page + 角色入口

### 暂不开发 (P2)

供应链履约(排期/结算/评价)、合同管理、支付集成、汇报方案下载

---

## PART 3: 技术栈约束

```
语言：      TypeScript 5.8 (strict mode)
框架：      React 19.2 + TanStack Start 1.168
样式：      Tailwind CSS 4.2
UI 组件：   shadcn/ui (Radix primitives, 约 40+ 组件)
路由：      TanStack Router 1.170 (文件系统路由, src/routes/*.tsx)
状态：      Zustand 5.x + TanStack Query 5.101
表单：      React Hook Form 7.71 + Zod 3.24
图表：      Recharts 2.15
拖拽：      @dnd-kit 6.3
图标：      lucide-react 0.575
构建：      Vite 8.0
包管理：    npm
后端：      Fastify 5.3 (API 路径 /v1/*)
数据库：    PostgreSQL 15 (25 张表)
缓存：      Redis
认证：      JWT (HS256, 角色: agent/supplier/admin/public)
```

---

## PART 4: 工作目录与约束

### 工作目录

```
/Users/wudixingyunxingleo/projects/演立方/codebase/
```

### 绝对禁止修改的文件

```
src/router.tsx              — 路由实例
src/__root.tsx              — AntD ConfigProvider (保留，即使不直接用 AntD)
src/routeTree.gen.ts        — 自动生成，禁止手动编辑
src/styles.css              — 全局样式 + Tailwind @theme
src/shared/theme.ts         — AntD 主题配置
src/shared/design-tokens.css — CSS 变量
src/shared/types.ts         — 全局 TypeScript 类型
src/shared/utils/           — 业务逻辑 (opportunityPriority, followupRules)
src/shared/mock/            — Mock 数据 (数据结构不变，可新增字段)
package.json                — 依赖管理
tsconfig.json               — TS 配置
vite.config.ts              — 构建配置
```

### 你可以修改/新建的文件

- `src/routes/*.tsx` — 所有页面文件（覆盖 + 新建）
- `src/shared/components/*.tsx` — 共享组件（仅视觉优化，不动逻辑）
- `src/components/ui/` — shadcn/ui 组件（不动，直接 import 使用）

### 路由文件格式

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/your-path")({ component: YourComponent });
```

---

## PART 5: 设计参考（质量基准）

以下 8 个页面已经由 v0 by Vercel 和 Trae Design 生成，作为你的**设计质量基准**。

你必须在开始工作前阅读这些文件，理解其代码风格、数据组织方式、组件使用方式：

| 预览地址 | 文件 | 设计要点 |
|:---|:---|:---|
| `/v0-demo` | `src/routes/v0-demo.tsx` | AI 对话页：60/40 分栏、需求识别面板、匹配度进度、紧凑方案卡 |
| `/v0-solutions` | `src/routes/v0-solutions.tsx` | 方案发现：筛选栏+预算滑杆+3列卡片网格+骨架屏+空状态 |
| `/v0-messages` | `src/routes/v0-messages.tsx` | 消息中心：分类标签+消息列表+未读红点+四色类型标签 |
| `/v0-workspace` | `src/routes/v0-workspace.tsx` | 销售作战台：KPI+三栏工作区+商机队列+AI方案生成 |
| `/td-followups` | `src/routes/td-followups.tsx` | 跟进中心：双栏CRM+智能提醒+时间线三色标记+AI话术 |
| `/td-tools-budget` | `src/routes/td-tools-budget.tsx` | H5 预算计算器：封面渐变→问答→结果+留资弹窗 |
| `/td-proposal` | `src/routes/td-proposal.tsx` | 客户方案 H5：封面→方案详情+艺人+流程+费用 |
| `/td-m-index` | `src/routes/td-m-index.tsx` | m 端首页：Hero+场景宫格+AI能力+浮动CTA |

**关键代码模式**（从这些文件中学习）：

- Mock 数据作为模块级 typed const 数组，包含 6-8 条记录
- 使用 `cn()` 工具函数处理条件样式
- 颜色全部使用 Tailwind bracket 语法 `bg-[#5B4FD6]`
- 使用 `PageState` 模式（"default" | "loading" | "empty"）管理页面状态
- 骨架屏使用 `@/components/ui/skeleton`
- 空状态包含图标 + 文案 + 操作按钮

---

## PART 6: Design System 速查

### 品牌色系

| 用途 | HEX | 
|:---|:---|
| 品牌主色 | `#5B4FD6` |
| 品牌悬停 | `#4C41BF` |
| 品牌激活 | `#3D33B3` |
| 品牌浅底 | `#F0EEFF` |
| 品牌边框 | `#E0DDFF` |

### 背景色系

| 用途 | HEX |
|:---|:---|
| 页面背景 | `#F7F8FA` |
| 卡片/面板 | `#FFFFFF` |
| AI 专属区域 | `#FAFAFF` |

### 边框色系

| 用途 | HEX |
|:---|:---|
| 默认边框 | `#E5E7EF` |
| AI 区域边框 | `#E0DDFF` |

### 文字色系

| 用途 | HEX |
|:---|:---|
| 正文/标题 | `#1F2430` |
| 次要说明 | `#687083` |
| 辅助/占位 | `#9AA0AE` |

### 状态色系

| 状态 | 文字色 | 背景色 |
|:---|:---|:---|
| 成功/完成 | `#317848` | `#EEF8F1` |
| 警告/进行中 | `#A55D12` | `#FFF5E8` |
| 错误/紧急 | `#C2413B` | `#FEF0F0` |
| 信息/提示 | `#2563A9` | `#EEF6FF` |

### 圆角

| 元素 | 值 | Tailwind |
|:---|:---|:---|
| 卡片/弹窗 | 12px | `rounded-xl` |
| 按钮/输入框 | 8px | `rounded-lg` |
| 标签/Badge | 4px | `rounded` |

### 阴影

卡片默认使用 `shadow-sm`

### 渐变

封面/ Hero 区域使用 `#5B4FD6` → `#3D33B3` 渐变

### 绝对禁止

- ❌ 旧品牌色 `#6E59F5`、`#7c3aed`
- ❌ Ant Design 命名色（"red"/"green"/"blue"/"orange"/"gold"）
- ❌ Emoji 作为功能图标（必须用 lucide-react）
- ❌ 硬编码 `fontSize`、`fontWeight`（用 Tailwind class）
- ❌ 少于 6 条 Mock 数据

---

## PART 7: 完整页面清单（52 页）

### 7.1 Agent 端 — 企业客户 PC（7 页）

桌面端，信息密度中等。用户通过自然语言描述活动需求，AI 自动生成可视化方案。

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 1 | `/agent` | `agent.tsx` | Layout 布局（顶部导航 + Outlet），保持不变 |
| 2 | `/agent/login` | `agent.login.tsx` | 登录页，保持不变 |
| 3 | `/agent/index` | `agent.index.tsx` | **AI 活动顾问首页**。Hero 区 + AI 输入框 + 场景芯片 + 最近方案推荐 + 热门方案。参考 v0-demo.tsx 设计。 |
| 4 | `/agent/solutions` | `agent.solutions.tsx` | **方案发现**。搜索栏 + 活动类型/场景/人数/时长下拉筛选 + 预算滑杆 + 3列方案卡片网格 + 加载骨架屏 + 空状态。6+ 套方案数据。参考 v0-solutions.tsx 设计。 |
| 5 | `/agent/assistant` | `agent.assistant.tsx` | **AI 对话页**。左右分栏(60/40)：左侧聊天区(AI气泡+用户气泡+建议Chips+输入框) + 右侧需求识别(匹配度进度条+已识别绿色标签+缺失橙色标签)+推荐方案(紧凑卡片x3)。3轮模拟对话。参考 v0-demo.tsx 设计。 |
| 6 | `/agent/requests` | `agent.requests.tsx` | **我的方案**。搜索 + 状态筛选(全部/进行中/已完成) + 方案卡片列表。卡片内容：公司名+活动类型+日期+金额+状态标签+匹配度+查看详情。6+ 条数据。骨架屏+空状态。 |
| 7 | `/agent/messages` | `agent.messages.tsx` | **消息中心**。分类标签(全部/系统/方案/AI提醒/客服，带计数) + 消息列表 + 未读红点+浅色背景 + 全部标为已读。类型色：报价紫(#5B4FD6)+AI蓝(#2563A9)+系统灰(#687083)+客服橙(#A55D12)。8 条消息。骨架屏+空状态。参考 v0-messages.tsx 设计。 |
| 8 | `/agent/quotations/$id` | `agent.quotations.$id.tsx` | **报价详情**。动态路由，展示报价详情，保持不变。 |

### 7.2 Supplier 端 — 销售/供应商 PC（14 页）

桌面端，信息密度最高。CRM + 方案管理 + 报价 + 跟进工作台。

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 9 | `/supplier` | `supplier.tsx` | Layout 布局（顶部导航 + Outlet），保持不变 |
| 10 | `/supplier/login` | `supplier.login.tsx` | 登录页，保持不变 |
| 11 | `/supplier/workspace` | `supplier.workspace.tsx` | **销售作战台**。顶部KPI四卡(今日新增/待跟进/已报价/成交额) + 三栏工作区(左25%商机队列+中40%商机详情+右35%AI方案生成) + 底部Segmented(跟进时间线/AI推荐话术/行动)。参考 v0-workspace.tsx 设计。 |
| 12 | `/supplier/followups` | `supplier.followups.tsx` | **跟进中心**。智能提醒横幅(2张提醒卡) + 统计条 + 双栏(左40%跟进列表+右60%详情)。时间线三色标记(AI蓝/运营紫/客户绿) + AI话术模块。6 条商机。骨架屏+空状态。参考 td-followups.tsx 设计。 |
| 13 | `/supplier/opportunities` | `supplier.opportunities.tsx` | **商机中心**。顶部KPI三卡(总商机/待跟进/已成交) + 搜索筛选栏 + 商机卡片/表格视图切换。卡片：公司名+活动类型+金额+状态+优先级+负责人+跟进时间。8+ 条数据。骨架屏+空状态。 |
| 14 | `/supplier/opportunities/$id` | `supplier.opportunities.$id.tsx` | 商机详情。动态路由，保持不变。 |
| 15 | `/supplier/leads` | `supplier.leads.tsx` | **线索中心**。线索评分卡 + 来源渠道标签(AI顾问/增长工具/官网) + 状态流转(新线索→已分配→跟进中→已转化) + 线索列表。8+ 条数据。骨架屏+空状态。 |
| 16 | `/supplier/leads/$id` | `supplier.leads.$id.tsx` | 线索详情。动态路由，保持不变。 |
| 17 | `/supplier/proposals` | `supplier.proposals.tsx` | **方案管理**。搜索 + 分类筛选 + 方案卡片网格(3列桌面)。卡片：档位标签(经济/推荐/升级)+标题+人数/时长/价格+描述+编辑/预览按钮。8+ 套方案。骨架屏+空状态。 |
| 18 | `/supplier/proposals/$id` | `supplier.proposals.$id.tsx` | 方案详情/编辑。保持不变。 |
| 19 | `/supplier/quotations` | `supplier.quotations.index.tsx` | **报价管理**。表格视图：客户名+方案名+金额+报价日期+状态(待确认/已确认/已过期)+操作按钮。状态色：待确认#A55D12+已确认#317848+已过期#C2413B。6+ 条数据。搜索+排序+骨架屏+空状态。 |
| 20 | `/supplier/quotations/$id` | `supplier.quotations.$id.tsx` | 报价详情。保持不变。 |
| 21 | `/supplier/artists` | `supplier.artists.tsx` | **艺人管理**。艺人卡片网格(3列桌面)：头像+姓名+角色类型+标签+基础报价。搜索+分类筛选。8+ 名艺人。骨架屏+空状态。 |
| 22 | `/supplier/feedback` | `supplier.feedback.tsx` | AI 反馈提交。保持不变。 |

### 7.3 Admin 端 — 平台运营 PC（16 页）

管理后台，左侧垂直侧边栏 + 内容区。数据表格 + 表单操作。

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 23 | `/admin` | `admin.tsx` | Layout 布局（侧边导航 + Outlet），保持不变 |
| 24 | `/admin/login` | `admin.login.tsx` | 登录页，保持不变 |
| 25 | `/admin/index` | `admin.index.tsx` | **Admin 首页**。快捷入口宫格(KPI/客户/SKU/艺人/RBAC/审计) + 系统状态 + 最近操作。 |
| 26 | `/admin/dashboard` | `admin.dashboard.tsx` | **运营仪表盘**。顶部 KPI 四卡(总用户/本月新增/活跃方案/成交额) + 图表区(趋势图+分布图) + 最近活动。使用 Recharts。 |
| 27 | `/admin/dashboard/charts` | `admin.dashboard.charts.tsx` | 图表组件。保持不变。 |
| 28 | `/admin/sku` | `admin.sku.tsx` | **SKU 管理**。表格：SKU名称+类型+价格+状态+更新时间。搜索+筛选+新增/编辑操作。8+ 条数据。 |
| 29 | `/admin/artists` | `admin.artists.tsx` | **艺人管理**。卡片网格：头像+姓名+角色+标签+状态。搜索+分类。8+ 名艺人。 |
| 30 | `/admin/customers` | `admin.customers.tsx` | **客户管理**。表格：客户名+行业+联系人+注册时间+状态。搜索+筛选。8+ 条数据。 |
| 31 | `/admin/orders` | `admin.orders.tsx` | **订单管理**。表格：订单号+客户+方案+金额+状态(待付款/已付款/已完成/已取消)+时间。8+ 条数据。状态色映射。 |
| 32 | `/admin/ai-feedback` | `admin.ai-feedback.tsx` | **AI 反馈管理**。反馈列表：用户+内容+评分+时间。搜索+筛选。 |
| 33 | `/admin/labeling` | `admin.labeling.tsx` | **标签系统**。标签管理：标签名+分类+使用次数+状态。增删改查。 |
| 34 | `/admin/prompts` | `admin.prompts.tsx` | **Prompt 管理**。Prompt 卡片列表：名称+版本+用途+更新时间+状态。版本管理。 |
| 35 | `/admin/rbac` | `admin.rbac.tsx` | **RBAC 权限管理**。角色列表+权限矩阵。表格+开关控制。 |
| 36 | `/admin/audit` | `admin.audit.tsx` | **审计日志**。日志表格：操作人+操作类型+目标+时间+IP。搜索+筛选+日期范围。 |
| 37 | `/admin/agencies` | `admin.agencies.tsx` | **机构管理**。机构列表：机构名+联系人+状态+创建时间。增删改查。 |
| 38 | `/admin/dict` | `admin.dict.tsx` | **字典管理**。字典表格：键+值+分类+描述。增删改查。 |

### 7.4 m 端 — C 端移动 Web（6 页）

移动端优先，max-w-[425px] 居中。底部 Tab 导航。

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 39 | `/m` | `m.tsx` | Layout（底部 Tab 导航 + Outlet），保持不变 |
| 40 | `/m/index` | `m.index.tsx` | **m 端首页**。Hero 区(紫色渐变+标题+副标题+数据) + 场景卡片 2x2 宫格(企业团建/年会/发布会/客户答谢) + AI 能力展示(3条横向卡) + 浮动CTA。参考 td-m-index.tsx 设计。 |
| 41 | `/m/discover` | `m.discover.tsx` | **发现页**。搜索 + 活动列表(卡片：活动名称+类型+日期+地点+价格)。无限滚动。骨架屏+空状态。 |
| 42 | `/m/submit` | `m.submit.tsx` | **需求提交**。表单页：活动类型+人数+日期+预算+描述。提交按钮。验证+成功提示。 |
| 43 | `/m/messages` | `m.messages.tsx` | **消息**。消息列表：头像+标题+摘要+时间+未读红点。点击进入对话。 |
| 44 | `/m/me` | `m.me.tsx` | **个人中心**。头像+姓名+个人信息卡片 + 菜单项(我的方案/消息/设置)。 |

### 7.5 增长工具 H5（3 页）

移动端优先，纯单页漏斗流，无导航。每页独立路由。

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 45 | `/tools/budget-calculator` | `tools.budget-calculator.tsx` | **预算计算器**。封面(紫色渐变+信任标签)→4题问答(活动类型/人数/时长/预算)→结果(预估金额+档位+费用拆解四项+AI建议)+留资弹窗(姓名+手机+公司)。参考 td-tools-budget.tsx 设计。 |
| 46 | `/tools/insurance-plan` | `tools.insurance-plan.tsx` | **演出保险计算器**。封面→3题问答(活动类型/季节/取消意向)→结果(风险等级+保额+保费)。留资弹窗。 |
| 47 | `/tools/annual-plan` | `tools.annual-plan.tsx` | **年会方案工具**。封面→3题问答(规模/调性/预算)→结果(推荐方案x3+档位对比)。留资弹窗。 |

### 7.6 客户方案 H5（1 页）

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 48 | `/p/$proposalId` | `p/$proposalId.tsx` | **客户方案 H5**。动态路由，通过 proposalId 获取方案数据。封面(渐变+活动名+客户+档位)→过渡区→方案详情(五宫格信息)→艺人阵容(2x2卡片)→环节流程(时间线)→费用明细(总价+四项拆解)→服务保障(三卡)→底部CTA(接受方案+确认弹窗)。参考 td-proposal.tsx 设计。 |

### 7.7 首页（1 页）

| # | 路由 | 文件 | 页面功能 |
|:---:|:---|:---|:---|
| 49 | `/` | `index.tsx` | **Landing Page**。Hero区(产品名+一句话介绍+角色入口按钮) + 产品亮点(三卡) + 客户案例 + 底部CTA。保持简洁。 |

> **注**：以上 49 个页面编号包含 3 个 Layout 文件 (agent/supplier/admin/m 的布局路由)。实际业务页面 45 个。

---

## PART 8: API 集成说明

当前所有数据为 Mock。但页面结构应**为 API 集成预留接口**。

### 现有 API 端点 (V4.7 新增)

| API | 方法 | 路径 | 用途 |
|:---|:---|:---|:---|
| 工具提交 | POST | `/v1/tools/submit` | 增长工具问答提交 |
| 工具结果 | GET | `/v1/tools/:id/result` | 获取计算结果 |
| 线索创建 | POST | `/v1/leads` | 留资创建线索 |
| 线索列表 | GET | `/v1/leads` | CRM 线索列表 |
| 线索更新 | PATCH | `/v1/leads/:id` | 更新线索状态 |
| 方案创建 | POST | `/v1/proposals` | 新建方案 |
| 方案详情 | GET | `/v1/proposals/:id` | 客户 H5 用 |
| 方案编辑 | PATCH | `/v1/proposals/:id` | 编辑方案 |
| 方案查看 | POST | `/v1/proposals/:id/view` | 记录查看事件 |
| 资源列表 | GET | `/v1/talents` `/v1/venues` `/v1/case-studies` | 资源库 |

### 数据模型要点

| 核心实体 | 关键字段 |
|:---|:---|
| proposals | customer_name, event_theme, status (draft→shared→viewed→approved→converted) |
| leads | tool_type, answers (JSON), score, status, assigned_to |
| talents | name, role_type, tags, base_price |
| venues | name, city, capacity, price_range |

---

## PART 9: 每个页面的强制要求

1. **数据充足**：每页至少 6-8 条 Mock 数据，全部中文，演立方真实业务场景
2. **三态完整**：正常态(数据列表) + 加载态(骨架屏) + 空数据态(图标+文案+按钮)
3. **交互可用**：搜索、筛选、标签切换、排序、选中、弹窗等交互真实可操作
4. **颜色合规**：全部使用 Design System 规定的 HEX 值，禁止硬编码非标准色
5. **响应式**：PC 页面桌面优先(768px 以下单列)，H5/m端 移动端优先(max-w-[425px] 居中)
6. **构建通过**：所有页面写完 `npm run build` 零错误
7. **代码风格**：与参考页面(v0-demo/td-followups/v0-workspace)保持一致
8. **无遗漏**：52 条路由全部覆盖，不跳页

---

## PART 10: shadcn/ui 组件速查

项目已安装以下组件，直接 import 使用：

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
```

---

## PART 11: 验收标准

Lovable 完成后：

- [ ] `npm run build` 零 TypeScript 错误
- [ ] 每个页面至少 6 条 Mock 数据
- [ ] 每个页面具备骨架屏 + 空状态
- [ ] 无 `#6E59F5` `#7c3aed` 残留
- [ ] 无 Emoji 图标
- [ ] 无硬编码 AntD 命名色
- [ ] 52 条路由全部可访问
- [ ] 桌面端/移动端布局正确
