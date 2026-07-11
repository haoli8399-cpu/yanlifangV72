# 演立方 V4.7 — Design Handoff 设计交付文档

> **版本**: V4.7
> **最后更新**: 2025-07-12
> **文档性质**: 最终交付文档 — 开发实施的唯一权威参考
> **适用技术栈**: React 19.2 + TanStack Start 1.168 + Ant Design 6.5 + Radix UI + Tailwind CSS 4.2 + TanStack Router 1.170
> **品牌色**: `#5B4FD6` (严禁使用旧色 `#6E59F5` / `#7c3aed`)
> **品牌关键词**: 专业 · 可信 · 智能 · 精准 · 克制

---

## 文档导读

本文档是演立方 V4.7 设计交付的**最终权威文档**，面向 Lovable / v0 / Codex / Hermes 开发团队。开发者阅读本文档后应能**直接开始编码，无需额外提问**。

文档包含 10 个章节，按以下逻辑组织：

| 章节 | 内容 | 读者 |
|------|------|------|
| §1 页面冻结清单 | 不得修改的页面/组件/配置 | 全体开发 |
| §2 允许优化清单 | L1 级别允许的优化范围 | 前端开发 |
| §3 必须统一的组件清单 | 跨页面强制复用的组件 | 全体开发 |
| §4 禁止修改清单 | 严禁触碰的文件与配置 | 全体开发 |
| §5 必须复用的现有组件 | 17 个共享组件完整接口 | 前端开发 |
| §6 需要新开发的组件 | 6 个新组件规格 | 前端开发 |
| §7 Design Token 速查表 | 全量 Token 一页式参考 | 前端开发 |
| §8 页面-组件对应表 | 52 个页面的组件清单 | 前端开发 |
| §9 开发注意事项 | 技术栈陷阱与最佳实践 | 前端开发 |
| §10 待确认问题清单 | 需要产品/设计确认的开放问题 | 产品/设计/开发 |

**代码库结构总览**:

```
src/
├── routes/                    # 52 个文件系统路由 (TanStack Router)
├── shared/
│   ├── components/            # 17 个共享组件
│   ├── hooks/                 # useAIChat.ts
│   ├── mock/                  # admin.ts, ai.ts, data.ts, feedbackLog.ts,
│   │                          #   growth-tools.ts, messages.ts, tool-ai-chat.ts
│   ├── utils/                 # followupRules.ts, opportunityPriority.ts
│   ├── design-tokens.css      # --yl-* 前缀设计令牌
│   ├── theme.ts               # brandColors, statusColorMap, agentTheme, supplierTheme
│   └── types.ts               # 全局类型定义
├── components/ui/             # 40+ shadcn/ui 组件
└── styles.css                 # Tailwind @theme + :root + .dark
```

---

## 1. 页面冻结清单

以下页面、组件、配置、业务逻辑已标记为 **🔒 冻结 (FROZEN)**，在 V4.7 迭代中**不得修改**。任何对冻结项的变更都需要产品负责人与设计负责人联合签字确认。

### 1.1 冻结路由页面

| 页面 | 路由文件 | 冻结原因 | 备注 |
|------|----------|----------|------|
| Agent 登录页 | `routes/agent.login.tsx` | 登录流程已验收，第三方鉴权对接完成 | 禁止修改表单字段、验证逻辑、跳转目标 |
| Supplier 登录页 | `routes/supplier.login.tsx` | 登录流程已验收，与 Agent 登录共用鉴权 | 禁止修改表单字段、验证逻辑 |
| Admin 登录页 | `routes/admin.login.tsx` | 管理端独立鉴权已验收 | 禁止修改验证码逻辑与权限初始化 |
| 线索中心 | `routes/supplier.leads.tsx` | TDDP 标记冻结，线索评分算法已上线 | 禁止修改列表结构、评分展示、筛选逻辑 |
| 线索详情 | `routes/supplier.leads.$id.tsx` | 线索详情信息层级已确认 | 禁止修改字段排列、评分卡布局 |

### 1.2 冻结路由文件名与路径

> **所有 52 个路由的文件名和路径均冻结**，不得重命名、移动、删除。TanStack Router 基于文件系统路由，文件名即 URL。

| 端 | 路由数量 | 冻结状态 |
|----|----------|----------|
| Agent 端 | 7 | 全部冻结（文件名/路径） |
| Supplier 端 | 14 | 全部冻结（文件名/路径） |
| Admin 端 | 16 | 全部冻结（文件名/路径） |
| m 端 | 6 | 全部冻结（文件名/路径） |
| 增长工具 H5 | 3 | 全部冻结（文件名/路径） |
| 客户方案 H5 | 1 | 全部冻结（文件名/路径） |
| 首页 | 1 | 全部冻结（文件名/路径） |
| Layout 路由 | 4 | 全部冻结（文件名/路径） |

### 1.3 冻结共享组件

| 组件名 | 文件路径 | 冻结内容 | 备注 |
|--------|----------|----------|------|
| 全部 17 个组件 | `src/shared/components/*.tsx` | **导出签名（export 签名）冻结** | Props 接口可新增可选字段，但不得删除/重命名已有字段 |

> 组件**内部实现**可以优化（如修复 P0/P1 问题中的 Token 替换），但**对外导出的组件名、Props 字段名、Props 类型**不得变更。

### 1.4 冻结配置文件

| 文件 | 路径 | 冻结内容 | 备注 |
|------|------|----------|------|
| 全局类型定义 | `src/shared/types.ts` | 全部类型定义冻结 | 禁止修改 interface/type 名称与字段 |
| 主题配置 | `src/shared/theme.ts` | `statusColorMap` 的 **key 冻结** | color 值可更新（如替换为 V4.7 Token），但 key 不可变 |
| 商机优先级算法 | `src/shared/utils/opportunityPriority.ts` | 业务逻辑冻结 | 禁止修改优先级计算规则 |
| 跟进规则 | `src/shared/utils/followupRules.ts` | 业务逻辑冻结 | 禁止修改跟进时间规则与提醒逻辑 |
| 设计令牌 | `src/shared/design-tokens.css` | `--yl-*` 变量名冻结 | 值可微调，变量名不可变 |

### 1.5 冻结品牌规范

| 规范项 | 冻结值 | 禁止行为 |
|--------|--------|----------|
| 品牌主色 | `#5B4FD6` | 禁止使用 `#6E59F5`、`#7c3aed` |
| 品牌主色 Token | `--yl-primary` | 禁止重新定义此变量名 |
| 品牌关键词 | 专业·可信·智能·精准·克制 | 禁止偏离品牌调性的视觉风格 |

---

## 2. 允许优化清单

以下页面标记为 **⚡ 允许 L1 优化**。L1 优化级别允许的修改范围：**文案调整、间距微调、状态补全（空状态/错误状态/加载状态）、Token 替换（硬编码色值→语义 Token）**。禁止结构性重设计。

| 页面 | 路由 | 优化级别 | 允许的修改范围 | 禁止的修改 |
|------|------|----------|----------------|------------|
| 我的方案 | `agent.requests` | L1 | 卡片信息层级优化、文案精简、状态色 Token 替换 | 不得改变卡片数量布局、不得移除 AI 分析入口 |
| 报价详情 | `agent.quotations.$id` | L1 | 金额格式化统一为 `formatters.ts`、间距 Token 化 | 不得修改报价计算逻辑、不得增删字段 |
| 商机中心 | `supplier.opportunities` | L1 | 列表密度优化、筛选区 Token 化、空状态补全 | 不得改变列表列结构、不得修改商机状态流 |
| 方案管理 | `supplier.proposals` | L1 | 卡片间距统一、状态标签 Token 化 | 不得改变卡片排序逻辑 |
| 报价管理 | `supplier.quotations.index` | L1 | 表格密度优化、金额列右对齐、状态色 Token 化 | 不得修改表格列定义 |
| 方案详情 | `supplier.proposals.$id` | L1 | 方案层级展示优化、间距 Token 化 | 不得修改方案层级逻辑 |
| 报价详情 | `supplier.quotations.$id` | L1 | 报价项展示优化、金额格式化 | 不得修改报价项计算 |
| 商机详情 | `supplier.opportunities.$id` | L1 | 详情信息分组优化、跟进时间线 Token 化 | 不得修改商机状态流转逻辑 |
| Admin 仪表盘 | `admin.dashboard` | L1 | KPI 卡片间距、图表色 Token 化 | 不得修改图表数据源 |
| Admin 仪表盘图表 | `admin.dashboard.charts` | L1 | 图表配色统一为 chart Token | 不得修改图表类型 |
| Admin SKU 管理 | `admin.sku` | L1 | 表格密度、状态标签 Token 化 | 不得修改 SKU 字段 |
| Admin 艺人管理 | `admin.artists` | L1 | 卡片间距、头像尺寸统一 | 不得修改艺人字段 |
| Admin 客户管理 | `admin.customers` | L1 | 表格密度、客户状态 Token 化 | 不得修改客户字段 |
| Admin 订单管理 | `admin.orders` | L1 | 订单状态色 Token 化、金额格式化 | 不得修改订单字段与状态流 |
| Admin AI 反馈 | `admin.ai-feedback` | L1 | 反馈列表密度优化、评分展示 Token 化 | 不得修改反馈数据结构 |
| Admin 标注管理 | `admin.labeling` | L1 | 标注列表密度、状态色 Token 化 | 不得修改标注流程 |
| Admin 提示词管理 | `admin.prompts` | L1 | 提示词卡片间距、版本标签 Token 化 | 不得修改提示词版本逻辑 |
| Admin RBAC | `admin.rbac` | L1 | 权限矩阵展示优化、角色色 Token 化 | 不得修改权限模型 |
| Admin 审计日志 | `admin.audit` | L1 | 日志列表密度、操作类型色 Token 化 | 不得修改日志字段 |
| Admin 机构管理 | `admin.agencies` | L1 | 机构卡片间距、状态色 Token 化 | 不得修改机构字段 |
| Admin 字典管理 | `admin.dict` | L1 | 字典表格密度优化 | 不得修改字典结构 |
| Admin 首页 | `admin.index` | L1 | 卡片间距 Token 化、快捷入口图标统一 | 不得修改入口数量与跳转 |
| m 端首页 | `m.index` | L1 | 卡片间距、底部 Tab 图标统一 | 不得修改 Tab 数量 |
| m 端发现 | `m.discover` | L1 | 列表间距、搜索框样式统一 | 不得修改列表数据源 |
| m 端提交 | `m.submit` | L1 | 表单间距 Token 化、验证提示统一 | 不得修改表单字段 |
| m 端消息 | `m.messages` | L1 | 消息列表间距、未读标记 Token 化 | 不得修改消息结构 |
| m 端我的 | `m.me` | L1 | 个人信息卡片间距、菜单图标统一 | 不得修改菜单项 |

**L1 优化通用规则**:
1. 所有颜色必须替换为 `--yl-*` Token，禁止保留硬编码 HEX
2. 所有间距必须使用 `--yl-space-*` Token 或 AntD Space 数值
3. 空状态必须使用统一的 `EmptyState` 组件（见 §6）
4. 加载状态必须使用骨架屏或 `Spin`，禁止白屏
5. 错误状态必须包含错误说明 + 重试按钮
6. 不得改变页面的路由路径、不得增删页面级功能模块

---

## 3. 必须统一的组件清单

以下组件在所有页面中**必须一致使用**，禁止在各页面中自行实现替代版本。

| 组件名 | 文件路径 | 必须统一的内容 | 当前状态 |
|--------|----------|----------------|----------|
| StatusTag | `src/shared/components/StatusTag.tsx` | 状态标签的颜色映射、字号、圆角统一使用 `statusColorMap` | P1: PriorityTag/ConfidenceTag 使用 AntD 命名色，需替换为 HEX Token |
| SolutionCard | `src/shared/components/SolutionCard.tsx` | 方案卡片的结构、层级色、图标 | P1: 使用 emoji (👥⏱)，需替换为 @ant-design/icons |
| OpportunityCard | `src/shared/components/OpportunityCard.tsx` | 商机卡片的状态流、优先级标签 | 正常 |
| FollowUpTimeline | `src/shared/components/FollowUpTimeline.tsx` | 跟进时间线的节点样式、时间格式 | 正常 |
| AIChatPanel | `src/shared/components/AIChatPanel.tsx` | AI 对话面板的气泡样式、输入区 | P0: 用户气泡对比度不合格 (1.2:1)，需改为 `--yl-primary` 底白字 |
| AIFeedbackBar | `src/shared/components/AIFeedbackBar.tsx` | AI 反馈栏的评分按钮、提交逻辑 | 正常 |
| RequirementExtractPanel | `src/shared/components/RequirementExtractPanel.tsx` | 需求提取面板的进度条、Alert | P0: 进度条使用禁止色 #6E59F5；P1: Alert 硬编码色值 |
| LeadCaptureModal | `src/shared/components/LeadCaptureModal.tsx` | 线索收集弹窗的表单字段、提交逻辑 | 正常 |
| ToolQuestionFlow | `src/shared/components/ToolQuestionFlow.tsx` | H5 工具提问流程的步骤指示器、选项卡 | 正常 |
| ToolResultPage | `src/shared/components/ToolResultPage.tsx` | H5 工具结果页的数据卡、分享按钮 | 正常 |
| DashboardCard | `src/shared/components/DashboardCard.tsx` | KPI 卡片的数值字号、趋势标签 | 正常 |
| ProposalPreview | `src/shared/components/ProposalPreview.tsx` | 方案预览的层级展示、价格格式化 | 正常 |
| LeadScoreBadge | `src/shared/components/LeadScoreBadge.tsx` | 线索评分徽章的颜色梯度、分数展示 | 正常 |
| OpportunityStatusFlow | `src/shared/components/OpportunityStatusFlow.tsx` | 商机状态流的节点、连接线、当前态 | 正常 |
| AppTopBar | `src/shared/components/AppTopBar.tsx` | 顶部导航栏的品牌色、用户菜单、通知入口 | 正常 |
| MinimalRequirementForm | `src/shared/components/MinimalRequirementForm.tsx` | 兜底表单的字段、验证规则 | 正常 |
| formatters | `src/shared/components/formatters.ts` | 金额/数字/时间格式化函数 | 正常，全平台必须统一调用 |

**统一使用规则**:
1. **禁止重复造轮子** — 上述 17 个组件覆盖的功能，禁止在任何页面中重新实现
2. **金额展示必须调用 `formatters.yuan()` 或 `formatters.wan()`** — 禁止自行 `toFixed()` 或模板字符串拼接
3. **时间展示必须调用 `formatters.relativeTime()`** — 禁止自行 `new Date().toLocaleDateString()`
4. **状态标签必须使用 `StatusTag`** — 禁止直接使用 AntD `<Tag>` + 硬编码颜色
5. **AI 对话必须使用 `AIChatPanel` + `useAIChat`** — 禁止自行实现对话逻辑

---

## 4. 禁止修改清单

以下文件、配置、规范**严禁修改**。违反禁止清单将导致代码审查直接驳回。

| 文件/配置 | 路径 | 禁止原因 |
|-----------|------|----------|
| 全局类型定义 | `src/shared/types.ts` | 类型定义是全平台契约，修改将引发连锁类型错误 |
| 商机优先级算法 | `src/shared/utils/opportunityPriority.ts` | 业务规则已上线，修改影响商机排序与分配 |
| 跟进规则 | `src/shared/utils/followupRules.ts` | 跟进时间规则已上线，修改影响提醒触达 |
| 52 个路由文件名 | `src/routes/**` | TanStack Router 文件系统路由，文件名即 URL |
| 17 个组件导出签名 | `src/shared/components/*.tsx` | 导出签名变更将破坏所有调用方 |
| theme.ts statusColorMap keys | `src/shared/theme.ts` | key 是业务状态枚举，变更将导致状态标签渲染失败 |
| design-tokens.css 变量名 | `src/shared/design-tokens.css` | 变量名是全平台 CSS 契约 |
| 品牌主色 #5B4FD6 | 全局 | 品牌识别核心，禁止替换为任何其他色值 |
| Mock 数据文件 | `src/shared/mock/*.ts` | 禁止新建 mock 文件，禁止修改现有 mock 数据结构（数据值可更新） |
| AI 对话 Hook | `src/shared/hooks/useAIChat.ts` | 对话状态机已固化，禁止修改 hook 签名与状态流转 |

**禁止使用的颜色清单**:

| 禁止值 | 类型 | 出现位置 | 正确替代 |
|--------|------|----------|----------|
| `#6E59F5` | HEX 字面量 | RequirementExtractPanel 进度条 | `var(--yl-primary)` `#5B4FD6` |
| `#7c3aed` | HEX 字面量 | 任意位置 | `var(--yl-primary)` `#5B4FD6` |
| `"red"` | AntD 命名色 | PriorityTag | `"#C53030"` (`--yl-error`) |
| `"orange"` | AntD 命名色 | PriorityTag | `"#B45309"` (`--yl-warning`) |
| `"default"` | AntD 命名色 | PriorityTag / ConfidenceTag | `"#8B92A8"` (`--yl-text-tertiary`) |
| `"green"` | AntD 命名色 | ConfidenceTag | `"#00875A"` (`--yl-success`) |
| `"gold"` | AntD 命名色 | ConfidenceTag | `"#D4A017"` (`--yl-gold`) |
| `"blue"` | AntD 命名色 | 任意位置 | `"#2563EB"` (`--yl-info`) |
| `#FFF5F5` | 硬编码背景 | 跟进中心错误提醒卡 | `var(--yl-error-bg)` `#FEF0F0` |
| `#FFF9F0` | 硬编码背景 | 跟进中心警告提醒卡 | `var(--yl-warning-bg)` `#FEF7EC` |
| `#F5F8FF` | 硬编码背景 | 跟进中心信息提醒卡 | `var(--yl-info-bg)` `#EFF4FF` |
| `#FFF7E6` | 硬编码背景 | RequirementExtractPanel Alert | `var(--yl-warning-bg)` `#FEF7EC` |
| `#FFE1A8` | 硬编码边框 | RequirementExtractPanel Alert | `var(--yl-warning-border)` `#FDE4B9` |
| `--yl-success` 用于按钮 | 语义色误用 | Agent 首页 "让AI推荐" 按钮 | `var(--yl-primary)` `#5B4FD6` |

**禁止行为清单**:

1. 禁止在组件代码中使用 HEX 字面量 — 必须通过 `var(--yl-*)` 或 Tailwind class 引用
2. 禁止使用 `opacity` 调整文字颜色 — 必须使用对应的语义 Token
3. 禁止使用 Emoji 作为功能图标 — 必须使用 `@ant-design/icons`
4. 禁止使用外部图片资源 — 当前无图片资产，使用 AntD 图标或自定义 SVG
5. 禁止新建 mock 数据文件 — 所有 mock 数据在 `src/shared/mock/` 中
6. 禁止在 AntD `<Space>` 的 `size` 属性中使用 CSS 变量字符串 — 使用数字像素值或预设尺寸
7. 禁止混用新旧品牌色 — 全平台统一使用 `#5B4FD6`
8. 禁止使用 AntD `<Tag>` 的 `color` 属性传入预设色名 — 必须传入 V4.7 HEX Token

---

## 5. 必须复用的现有组件（17 个）

以下 17 个共享组件已存在于代码库中，开发时**必须直接 import 复用**，禁止重新实现。每个组件给出完整的 Props 接口、使用场景与注意事项。

### 5.1 StatusTag（含 PriorityTag、ConfidenceTag）

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/StatusTag.tsx` |
| **导出** | `StatusTag`（默认）、`PriorityTag`、`ConfidenceTag` |
| **使用场景** | 商机状态、方案状态、提案状态、优先级、置信度的标签展示 |
| **使用页面** | agent.requests, agent.quotations.$id, supplier.opportunities, supplier.opportunities.$id, supplier.proposals, supplier.proposals.$id, supplier.quotations, supplier.quotations.$id, supplier.leads, supplier.leads.$id, admin.orders, admin.customers, admin.sku |
| **注意事项** | P1 修复：PriorityTag 的 `"red"/"orange"/"default"` 和 ConfidenceTag 的 `"green"/"gold"/"default"` 必须替换为 V4.7 HEX Token。Tag 的 `color` 属性直接传入 HEX 字符串 |

**Props 接口**:

```typescript
// StatusTag — 通用状态标签
interface StatusTagProps {
  status: string;           // 状态文本，如 "新需求"、"已成交"
  color?: string;           // HEX 色值，从 statusColorMap 取；不传则按 status 自动匹配
  size?: 'small' | 'default'; // 尺寸，默认 'default'
  dot?: boolean;            // 是否显示状态圆点，默认 false
  bordered?: boolean;       // 是否带边框，默认 true
}

// PriorityTag — 优先级标签（高/中/低）
interface PriorityTagProps {
  priority: 'high' | 'medium' | 'low'; // 优先级
  showLabel?: boolean;     // 是否显示文字，默认 true
  size?: 'small' | 'default';
}

// ConfidenceTag — AI 置信度标签
interface ConfidenceTagProps {
  confidence: 'high' | 'medium' | 'low'; // 置信度
  score?: number;          // 0-100 分值，可选展示
  size?: 'small' | 'default';
}
```

**PriorityTag 颜色映射（修复后）**:

| priority | 修复前（禁止） | 修复后（正确） | HEX |
|----------|---------------|---------------|-----|
| high | AntD `"red"` | `--yl-error` | `#C53030` |
| medium | AntD `"orange"` | `--yl-warning` | `#B45309` |
| low | AntD `"default"` | `--yl-text-tertiary` | `#8B92A8` |

**ConfidenceTag 颜色映射（修复后）**:

| confidence | 修复前（禁止） | 修复后（正确） | HEX |
|------------|---------------|---------------|-----|
| high | AntD `"green"` | `--yl-success` | `#00875A` |
| medium | AntD `"gold"` | `--yl-gold` | `#D4A017` |
| low | AntD `"default"` | `--yl-text-tertiary` | `#8B92A8` |

---

### 5.2 SolutionCard

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/SolutionCard.tsx` |
| **使用场景** | 方案推荐卡片展示，含方案名称、层级标签、价格、艺人数量、时长 |
| **使用页面** | agent.index, agent.solutions, agent.requests, supplier.proposals, supplier.proposals.$id |
| **注意事项** | P1 修复：emoji `👥`→`<TeamOutlined />`，`⏱`→`<ClockCircleOutlined />`。方案层级色从 `theme.ts` 获取，禁止硬编码 |

**Props 接口**:

```typescript
interface SolutionCardProps {
  solutionId: string;              // 方案 ID
  title: string;                   // 方案名称
  tier: 'economy' | 'recommended' | 'premium'; // 方案层级
  price: number;                   // 价格（分），通过 formatters.yuan() 展示
  artistCount?: number;            // 艺人数量
  duration?: string;               // 活动时长，如 "4小时"
  tags?: string[];                 // 方案标签
  description?: string;            // 方案描述
  thumbnail?: string;              // 缩略图（当前无图片，留空）
  isSelected?: boolean;            // 是否选中态
  onSelect?: (id: string) => void; // 选中回调
  onDetail?: (id: string) => void; // 查看详情回调
  actions?: React.ReactNode;       // 自定义操作区
}
```

**方案层级色映射**:

| tier | HEX | Token | 标签文案 |
|------|-----|-------|----------|
| economy | `#7C6FF7` | `--yl-ai-accent` | 经济方案 |
| recommended | `#0EA5E9` | (chart 色) | 推荐方案 |
| premium | `#D4A017` | `--yl-gold` | 升级方案 |

---

### 5.3 OpportunityCard

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/OpportunityCard.tsx` |
| **使用场景** | 商机列表卡片，含商机名称、客户、状态、优先级、金额、跟进时间 |
| **使用页面** | supplier.opportunities, supplier.workspace, agent.requests |
| **注意事项** | 优先级使用 `PriorityTag`，状态使用 `StatusTag`，金额使用 `formatters.wan()` |

**Props 接口**:

```typescript
interface OpportunityCardProps {
  opportunityId: string;
  title: string;                   // 商机名称
  customerName: string;            // 客户名称
  status: string;                  // 商机状态（中文）
  priority: 'high' | 'medium' | 'low';
  estimatedValue: number;          // 预估金额（元）
  lastFollowUpTime?: string;       // 最后跟进时间（ISO）
  assignee?: string;               // 负责人
  tags?: string[];                 // 商机标签
  onClick?: (id: string) => void;  // 点击卡片回调
  onFollowUp?: (id: string) => void; // 跟进回调
  selected?: boolean;              // 选中态
}
```

---

### 5.4 FollowUpTimeline

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/FollowUpTimeline.tsx` |
| **使用场景** | 跟进记录时间线，展示沟通历史、提醒、状态变更 |
| **使用页面** | supplier.followups, supplier.opportunities.$id, supplier.leads.$id |
| **注意事项** | 时间格式化使用 `formatters.relativeTime()`，节点颜色按事件类型从 `statusColorMap` 取 |

**Props 接口**:

```typescript
interface FollowUpEvent {
  id: string;
  type: 'call' | 'message' | 'meeting' | 'email' | 'note' | 'status_change' | 'reminder';
  title: string;                   // 事件标题
  description?: string;            // 事件描述
  timestamp: string;               // ISO 时间
  operator: string;                // 操作人
  status?: string;                 // 关联状态（用于颜色映射）
}

interface FollowUpTimelineProps {
  events: FollowUpEvent[];         // 事件列表（按时间倒序）
  loading?: boolean;               // 加载态
  onAddFollowUp?: () => void;      // 新增跟进回调
  emptyText?: string;              // 空状态文案
}
```

---

### 5.5 AIChatPanel

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/AIChatPanel.tsx` |
| **使用场景** | AI 对话面板，含消息列表、输入框、思考动画、流式输出 |
| **使用页面** | agent.assistant, agent.index, tools.budget-calculator, tools.insurance-plan, tools.annual-plan |
| **注意事项** | **P0 修复**：用户消息气泡当前为白字 + `--yl-secondary`(#F5F6FA) 浅灰底 = 对比度 1.2:1（WCAG FAIL）。修复为 `--yl-primary`(#5B4FD6) 底 + 白字 = 7.1:1（AAA）。对话逻辑使用 `useAIChat` hook |

**Props 接口**:

```typescript
interface AIChatPanelProps {
  messages: ChatMessage[];          // 消息列表
  onSend: (content: string) => void; // 发送消息回调
  loading?: boolean;                // AI 思考中
  suggestions?: string[];           // 快捷建议词
  title?: string;                   // 面板标题，默认 "AI 助手"
  placeholder?: string;             // 输入框占位符
  maxHeight?: string;               // 最大高度，如 "calc(100vh - 200px)"
  showHeader?: boolean;             // 是否显示头部，默认 true
  onSuggestionClick?: (suggestion: string) => void;
  disabled?: boolean;               // 禁用输入
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';       // 消息角色
  content: string;                  // 消息内容（支持 Markdown）
  timestamp: string;                // ISO 时间
  status?: 'sending' | 'sent' | 'error'; // 发送状态
  thinking?: boolean;               // AI 思考中标记
}
```

**P0 修复代码示例**:

```tsx
// 修复前（禁止）
<div style={{ background: 'var(--yl-secondary)', color: 'var(--yl-text-on-primary)' }}>
  {message.content}
</div>
// 对比度: #FFFFFF on #F5F6FA = 1.2:1 (FAIL)

// 修复后（正确）
<div style={{ background: 'var(--yl-primary)', color: 'var(--yl-text-on-primary)' }}>
  {message.content}
</div>
// 对比度: #FFFFFF on #5B4FD6 = 7.1:1 (AAA)
```

---

### 5.6 AIFeedbackBar

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/AIFeedbackBar.tsx` |
| **使用场景** | AI 输出内容下方的反馈栏，含点赞/点踩/评分/文字反馈 |
| **使用页面** | agent.assistant, supplier.proposals.$id, admin.ai-feedback |
| **注意事项** | 反馈数据写入 `src/shared/mock/feedbackLog.ts`，评分色使用 `--yl-gold` |

**Props 接口**:

```typescript
interface AIFeedbackBarProps {
  targetId: string;                 // 反馈目标 ID（消息 ID / 方案 ID）
  targetType: 'message' | 'proposal' | 'extraction'; // 反馈目标类型
  onFeedback?: (rating: number, comment?: string) => void;
  defaultRating?: number;           // 默认评分
  compact?: boolean;                // 紧凑模式（仅评分，无文字框）
}
```

---

### 5.7 RequirementExtractPanel

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/RequirementExtractPanel.tsx` |
| **使用场景** | AI 需求提取面板，展示 AI 从自然语言中提取的结构化需求字段 |
| **使用页面** | agent.assistant, agent.requests |
| **注意事项** | **P0 修复**：进度条渐变使用 `#6E59F5`（禁止色），替换为 `linear-gradient(90deg, var(--yl-primary), var(--yl-ai-accent))`。**P1 修复**：Alert 硬编码 `#FFF7E6`/`#FFE1A8` 替换为 `--yl-warning-bg`/`--yl-warning-border` |

**Props 接口**:

```typescript
interface ExtractedField {
  key: string;                      // 字段名
  label: string;                    // 中文名
  value: string | number;           // 提取值
  confidence: 'high' | 'medium' | 'low'; // 置信度
  editable?: boolean;               // 是否可编辑
  source?: string;                  // 来源原文片段
}

interface RequirementExtractPanelProps {
  fields: ExtractedField[];         // 提取的字段列表
  rawText: string;                  // 原始输入文本
  progress?: number;                // 提取进度 0-100
  onFieldEdit?: (key: string, value: string | number) => void;
  onConfirm?: (fields: ExtractedField[]) => void;
  loading?: boolean;
}
```

**P0 修复代码示例**:

```tsx
// 修复前（禁止）
<div style={{ background: 'linear-gradient(90deg, #6E59F5, #7C6FF7)' }} />

// 修复后（正确）
<div style={{ background: 'linear-gradient(90deg, var(--yl-primary), var(--yl-ai-accent))' }} />
```

---

### 5.8 LeadCaptureModal

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/LeadCaptureModal.tsx` |
| **使用场景** | 线索收集弹窗，在用户未登录或需要补充信息时弹出 |
| **使用页面** | index（首页）, tools.budget-calculator, tools.insurance-plan, tools.annual-plan, p.$proposalId |
| **注意事项** | 表单字段最小化（姓名+手机号），提交后写入线索池。弹窗宽度 480px，圆角 `--yl-radius-xl` |

**Props 接口**:

```typescript
interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  source: string;                   // 线索来源（页面标识）
  title?: string;                   // 弹窗标题，默认 "留下您的联系方式"
  description?: string;             // 说明文案
  submitText?: string;              // 提交按钮文案，默认 "提交"
  onSuccess?: (leadId: string) => void; // 提交成功回调
  fields?: ('name' | 'phone' | 'company' | 'email')[]; // 显示字段，默认 ['name', 'phone']
}
```

---

### 5.9 ToolQuestionFlow

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/ToolQuestionFlow.tsx` |
| **使用场景** | H5 增长工具的提问流程组件，含步骤指示器、单选/多选/输入题 |
| **使用页面** | tools.budget-calculator, tools.insurance-plan, tools.annual-plan |
| **注意事项** | 步骤指示器使用 `--yl-primary` 填充已完成步骤，`--yl-border-default` 未完成步骤 |

**Props 接口**:

```typescript
interface ToolQuestion {
  id: string;
  type: 'single' | 'multiple' | 'input' | 'number'; // 题型
  question: string;                 // 问题文本
  description?: string;             // 问题描述
  options?: { label: string; value: string; icon?: React.ReactNode }[]; // 选项
  placeholder?: string;             // 输入框占位符
  required?: boolean;               // 是否必填
  defaultValue?: string | string[]; // 默认值
}

interface ToolQuestionFlowProps {
  questions: ToolQuestion[];        // 问题列表
  onComplete: (answers: Record<string, string | string[]>) => void;
  onBack?: () => void;              // 返回回调
  title?: string;                   // 流程标题
  showProgress?: boolean;           // 是否显示进度条，默认 true
}
```

---

### 5.10 ToolResultPage

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/ToolResultPage.tsx` |
| **使用场景** | H5 增长工具的结果展示页，含数据卡片、建议、分享、线索收集入口 |
| **使用页面** | tools.budget-calculator, tools.insurance-plan, tools.annual-plan |
| **注意事项** | 数据卡片使用 `DashboardCard`，金额使用 `formatters.yuan()`，分享按钮使用 `--yl-primary` |

**Props 接口**:

```typescript
interface ResultCard {
  label: string;                    // 指标名
  value: string | number;           // 指标值
  unit?: string;                    // 单位
  highlight?: boolean;              // 是否高亮
  trend?: 'up' | 'down' | 'flat';   // 趋势
  description?: string;             // 说明
}

interface ToolResultPageProps {
  title: string;                    // 结果页标题
  summary?: string;                 // 摘要文案
  cards: ResultCard[];              // 数据卡片
  suggestions?: string[];           // AI 建议
  onShare?: () => void;             // 分享回调
  onConsult?: () => void;           // 咨询回调（触发 LeadCaptureModal）
  onRestart?: () => void;           // 重新计算
  loading?: boolean;
}
```

---

### 5.11 DashboardCard

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/DashboardCard.tsx` |
| **使用场景** | KPI 数据卡片，含指标名、数值、趋势、对比 |
| **使用页面** | admin.dashboard, supplier.workspace, admin.dashboard.charts, m.index |
| **注意事项** | 数值使用 `--yl-font-mono` + `numeric-lg/md`，趋势色使用 `--yl-success`/`--yl-error` |

**Props 接口**:

```typescript
interface DashboardCardProps {
  title: string;                    // 指标名称
  value: string | number;           // 指标值
  unit?: string;                    // 单位
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;             // 变化百分比
    label?: string;                 // 对比说明，如 "较上月"
  };
  icon?: React.ReactNode;           // 指标图标
  size?: 'large' | 'default' | 'small'; // 卡片尺寸
  highlight?: boolean;              // 是否高亮（使用 --yl-primary-subtle 底）
  loading?: boolean;                // 骨架屏
  onClick?: () => void;             // 点击跳转
}
```

---

### 5.12 ProposalPreview

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/ProposalPreview.tsx` |
| **使用场景** | 方案预览组件，展示方案层级、报价明细、艺人列表 |
| **使用页面** | supplier.proposals.$id, p.$proposalId, agent.quotations.$id |
| **注意事项** | 价格使用 `formatters.yuan()`，方案层级使用 `SolutionCard` 的 tier 色映射 |

**Props 接口**:

```typescript
interface ProposalSection {
  title: string;                    // 分区标题
  items: {
    name: string;                   // 项目名
    description?: string;           // 描述
    quantity?: number;              // 数量
    unitPrice?: number;             // 单价（元）
    totalPrice?: number;            // 小计（元）
  }[];
}

interface ProposalPreviewProps {
  proposalId: string;
  title: string;                    // 方案标题
  tier: 'economy' | 'recommended' | 'premium';
  customerName?: string;            // 客户名称
  eventDate?: string;               // 活动日期
  eventLocation?: string;           // 活动地点
  sections: ProposalSection[];      // 方案分区
  totalPrice: number;               // 总价（元）
  status?: string;                  // 提案状态
  onApprove?: () => void;           // 批准回调
  onReject?: () => void;            // 驳回回调
  onShare?: () => void;             // 分享回调
  readonly?: boolean;               // 只读模式（客户端）
}
```

---

### 5.13 LeadScoreBadge

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/LeadScoreBadge.tsx` |
| **使用场景** | 线索评分徽章，展示 AI 评分与等级 |
| **使用页面** | supplier.leads, supplier.leads.$id, supplier.workspace |
| **注意事项** | 评分梯度色：≥80 `--yl-success`，60-79 `--yl-gold`，<60 `--yl-text-tertiary`。此页面已冻结，仅修复 Token |

**Props 接口**:

```typescript
interface LeadScoreBadgeProps {
  score: number;                    // 0-100
  level?: 'A' | 'B' | 'C' | 'D';   // 等级，不传则按 score 自动计算
  size?: 'large' | 'default' | 'small';
  showScore?: boolean;              // 是否显示分数，默认 true
  showLevel?: boolean;              // 是否显示等级，默认 true
}
```

---

### 5.14 OpportunityStatusFlow

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/OpportunityStatusFlow.tsx` |
| **使用场景** | 商机状态流转图，横向展示从新需求到已成交的完整流程 |
| **使用页面** | supplier.opportunities.$id, supplier.workspace |
| **注意事项** | 状态色从 `statusColorMap` 获取，当前节点放大并带光晕 |

**Props 接口**:

```typescript
interface OpportunityStatusFlowProps {
  currentStatus: string;            // 当前状态（中文）
  statusHistory?: { status: string; timestamp: string }[]; // 状态变更历史
  orientation?: 'horizontal' | 'vertical'; // 方向，默认 horizontal
  showTimestamp?: boolean;          // 是否显示时间戳
  size?: 'default' | 'small';
}
```

---

### 5.15 AppTopBar

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/AppTopBar.tsx` |
| **使用场景** | 顶部导航栏，含 Logo、端切换、用户菜单、通知入口 |
| **使用页面** | agent.tsx（layout）, supplier.tsx（layout）, admin.tsx（layout） |
| **注意事项** | Logo 使用品牌色 `--yl-primary`，用户菜单头像使用 `--yl-radius-full` |

**Props 接口**:

```typescript
interface AppTopBarProps {
  currentRole: 'agent' | 'supplier' | 'admin'; // 当前端
  userName: string;                 // 用户名
  userAvatar?: string;              // 头像 URL（当前无图片，使用首字母）
  notifications?: number;           // 未读通知数
  onRoleSwitch?: (role: 'agent' | 'supplier' | 'admin') => void; // 端切换
  onLogout?: () => void;            // 退出登录
  onNotificationClick?: () => void; // 通知点击
  rightExtra?: React.ReactNode;     // 右侧额外区域
}
```

---

### 5.16 MinimalRequirementForm

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/MinimalRequirementForm.tsx` |
| **使用场景** | 兜底需求表单，在 AI 提取失败或用户选择手动输入时展示 |
| **使用页面** | agent.index, m.submit, tools.budget-calculator |
| **注意事项** | 字段最小化（活动类型+预算+时间+人数），提交后触发方案推荐流程 |

**Props 接口**:

```typescript
interface MinimalRequirementFormProps {
  onSubmit: (data: RequirementFormData) => void;
  initialValues?: Partial<RequirementFormData>; // 初始值
  compact?: boolean;                // 紧凑模式（减少间距）
  showTitle?: boolean;              // 是否显示标题，默认 true
  submitText?: string;              // 提交按钮文案，默认 "获取方案"
  loading?: boolean;
}

interface RequirementFormData {
  eventType: string;                // 活动类型
  budget?: number;                  // 预算（元）
  eventDate?: string;               // 活动日期
  attendeeCount?: number;           // 参与人数
  location?: string;                // 活动地点
  description?: string;             // 补充描述
}
```

---

### 5.17 formatters

| 属性 | 内容 |
|------|------|
| **文件路径** | `src/shared/components/formatters.ts` |
| **导出** | `yuan`、`wan`、`relativeTime` |
| **使用场景** | 金额、数字、时间的统一格式化 |
| **使用页面** | 全平台所有涉及金额/数字/时间的页面 |
| **注意事项** | 禁止自行实现格式化逻辑，必须 import 此模块 |

**接口定义**:

```typescript
// 金额格式化 — 元
function yuan(cents: number, options?: { showSymbol?: boolean; decimals?: number }): string;
// 示例: yuan(100000) → "¥1,000.00"
// 示例: yuan(100000, { showSymbol: false }) → "1,000.00"

// 金额格式化 — 万元
function wan(cents: number, options?: { decimals?: number }): string;
// 示例: wan(10000000) → "100.00万"
// 示例: wan(10000000, { decimals: 1 }) → "100.0万"

// 相对时间格式化
function relativeTime(isoString: string): string;
// 示例: relativeTime("2025-07-12T10:00:00Z") → "刚刚" / "3分钟前" / "2小时前" / "3天前" / "2025-07-01"
```

**使用示例**:

```tsx
import { yuan, wan, relativeTime } from '@/shared/components/formatters';

// 金额展示
<span className="font-mono">{yuan(price)}</span>
<span>{wan(estimatedValue)}</span>

// 时间展示
<span className="text-yl-text-tertiary">{relativeTime(item.createdAt)}</span>
```

---

## 6. 需要新开发的组件

以下 6 个组件在当前代码库中不存在，需要在开发阶段新建。建议放置于 `src/shared/components/` 目录下。

### 6.1 MessageListItem — 统一消息列表项组件

| 属性 | 内容 |
|------|------|
| **组件名** | `MessageListItem` |
| **文件路径（建议）** | `src/shared/components/MessageListItem.tsx` |
| **用途** | 统一消息列表中的单条消息展示，含头像、标题、摘要、时间、未读标记、消息类型图标 |
| **使用场景** | agent.messages, supplier.followups（提醒列表）, m.messages, admin.ai-feedback |
| **优先级** | P1 — 多个页面重复实现消息列表项，急需统一 |

**建议 Props 接口**:

```typescript
interface MessageListItemProps {
  id: string;
  avatar?: string;                  // 头像 URL（无则用首字母）
  title: string;                    // 消息标题/发送人
  summary: string;                  // 消息摘要
  timestamp: string;                // ISO 时间，通过 relativeTime() 展示
  type?: 'system' | 'ai' | 'user' | 'opportunity' | 'followup'; // 消息类型
  unread?: boolean;                 // 未读标记
  priority?: 'high' | 'medium' | 'low'; // 优先级（使用 PriorityTag）
  onClick?: (id: string) => void;
  selected?: boolean;               // 选中态
  rightExtra?: React.ReactNode;     // 右侧附加内容
}
```

**设计规格**:
- 高度：72px（默认）/ 64px（紧凑 `compact` 模式）
- 内边距：`--yl-space-3` (12px) 上下，`--yl-space-4` (16px) 左右
- 头像尺寸：40px x 40px，`--yl-radius-full`
- 未读标记：8px 圆点，`--yl-primary` 色
- 消息类型图标：16px，左侧头像旁，`--yl-text-tertiary` 色
- hover 态：背景 `--yl-bg-sunken`，过渡 `--yl-duration-fast`

---

### 6.2 ChatBubble — AI 对话气泡组件

| 属性 | 内容 |
|------|------|
| **组件名** | `ChatBubble` |
| **文件路径（建议）** | `src/shared/components/ChatBubble.tsx` |
| **用途** | 从 `AIChatPanel` 中提取的独立对话气泡组件，支持用户/AI 双角色、Markdown 渲染、思考动画 |
| **使用场景** | agent.assistant, agent.index, tools.* (H5 工具对话), p.$proposalId |
| **优先级** | P0 — 直接关联 P0 对比度修复 |

**建议 Props 接口**:

```typescript
interface ChatBubbleProps {
  role: 'user' | 'assistant';       // 消息角色
  content: string;                  // 消息内容（AI 支持 Markdown）
  timestamp?: string;               // 时间戳
  status?: 'sending' | 'sent' | 'error'; // 发送状态
  thinking?: boolean;               // AI 思考中（显示三点脉冲动画）
  avatar?: string;                  // 头像
  onRetry?: () => void;             // 重试回调（error 态）
  feedback?: React.ReactNode;       // 反馈区（嵌入 AIFeedbackBar）
  maxWidth?: string;                // 最大宽度，默认 "70%"
}
```

**设计规格**:
- 用户气泡：背景 `--yl-primary` (#5B4FD6)，文字 `--yl-text-on-primary` (#FFFFFF)，**对比度 7.1:1 (AAA)**
- AI 气泡：背景 `--yl-bg-ai` (#FAFAFF)，文字 `--yl-text-primary` (#1A1D2E)，边框 `--yl-border-ai` (#E0DDFF)
- 圆角：`--yl-radius-2xl` (24px)，用户气泡右下角 8px，AI 气泡左下角 8px
- 最大宽度：70%（桌面端）/ 85%（移动端）
- Markdown 渲染：使用 `react-markdown`（已安装）
- 思考动画：`yl-thinking-pulse` 三点脉冲，1500ms 循环
- 阴影：AI 气泡使用 `--yl-shadow-ai`，用户气泡无阴影

---

### 6.3 FilterPanel — 筛选面板组件

| 属性 | 内容 |
|------|------|
| **组件名** | `FilterPanel` |
| **文件路径（建议）** | `src/shared/components/FilterPanel.tsx` |
| **用途** | 统一的列表筛选面板，支持搜索框、下拉筛选、日期范围、标签筛选、排序 |
| **使用场景** | agent.solutions, supplier.opportunities, supplier.proposals, supplier.quotations, admin.orders, admin.customers |
| **优先级** | P1 — 多个列表页各自实现筛选，急需统一 |

**建议 Props 接口**:

```typescript
interface FilterItem {
  key: string;                      // 筛选项 key
  label: string;                    // 标签
  type: 'search' | 'select' | 'dateRange' | 'tags' | 'sort';
  options?: { label: string; value: string }[]; // select/tags 选项
  defaultValue?: string | string[] | [string, string];
  placeholder?: string;
  width?: number;                   // 宽度（px）
}

interface FilterPanelProps {
  filters: FilterItem[];            // 筛选项配置
  values: Record<string, unknown>;  // 当前值
  onChange: (key: string, value: unknown) => void; // 值变更回调
  onReset?: () => void;             // 重置回调
  onSearch?: (values: Record<string, unknown>) => void; // 搜索回调
  searchDebounce?: number;          // 搜索防抖 ms，默认 300
  layout?: 'inline' | 'vertical';   // 布局方向，默认 inline
  collapsible?: boolean;            // 是否可折叠，默认 false
  defaultCollapsed?: boolean;       // 默认折叠态
}
```

**设计规格**:
- 搜索框：必须 300ms debounce（TDDP 要求）
- 布局：inline 模式下筛选项横向排列，自动换行；vertical 模式纵向堆叠
- 背景：`--yl-bg-surface`，边框 `--yl-border-default`，圆角 `--yl-radius-lg`
- 内边距：`--yl-space-4` (16px)
- 筛选项间距：`--yl-space-3` (12px)
- 折叠态：仅显示搜索框 + "展开筛选" 按钮

---

### 6.4 CardGrid — 卡片网格布局容器

| 属性 | 内容 |
|------|------|
| **组件名** | `CardGrid` |
| **文件路径（建议）** | `src/shared/components/CardGrid.tsx` |
| **用途** | 统一的卡片网格布局，自适应列数，支持骨架屏、空状态、交错入场动画 |
| **使用场景** | agent.index, agent.solutions, agent.requests, supplier.opportunities, supplier.proposals, index（首页工具卡片） |
| **优先级** | P1 — 解决首页响应式溢出问题 |

**建议 Props 接口**:

```typescript
interface CardGridProps {
  children: React.ReactNode[];      // 卡片列表
  minCardWidth?: number;            // 单卡最小宽度（px），默认 280
  maxColumns?: number;              // 最大列数，默认 4
  gap?: number;                     // 卡片间距（px），默认 20
  loading?: boolean;                // 骨架屏
  loadingCount?: number;            // 骨架屏数量，默认 6
  empty?: boolean;                  // 空状态
  emptyText?: string;               // 空状态文案
  emptyAction?: React.ReactNode;    // 空状态操作按钮
  staggerAnimation?: boolean;       // 交错入场动画，默认 true
  responsive?: {                    // 响应式列数覆盖
    [breakpoint: string]: number;   // 如 { sm: 2, md: 3, lg: 4 }
  };
}
```

**设计规格**:
- 使用 CSS Grid `repeat(auto-fill, minmax(minCardWidth, 1fr))`
- 间距使用 `gap` 属性
- 骨架屏：`yl-skeleton-pulse` 动画，卡片尺寸同实际卡片
- 空状态：嵌入 `EmptyState` 组件
- 入场动画：`yl-card-enter`，stagger delay 50ms 递增
- 响应式断点：`sm` (768px) / `md` (1024px) / `lg` (1280px) / `xl` (1536px)

---

### 6.5 EmptyState — 空状态插画组件

| 属性 | 内容 |
|------|------|
| **组件名** | `EmptyState` |
| **文件路径（建议）** | `src/shared/components/EmptyState.tsx` |
| **用途** | 统一的空状态展示，含图标、标题、描述、操作按钮 |
| **使用场景** | 所有列表页（商机/方案/报价/订单/消息/跟进），supplier.workspace（作战台无数据） |
| **优先级** | P1 — 补全所有列表页的空状态（TDDP 要求） |

**建议 Props 接口**:

```typescript
type EmptyStateType = 'no-data' | 'no-result' | 'no-message' | 'no-opportunity' | 'no-proposal' | 'error' | 'no-permission' | 'network-error';

interface EmptyStateProps {
  type?: EmptyStateType;            // 预设类型（决定图标与默认文案）
  icon?: React.ReactNode;           // 自定义图标（覆盖 type）
  title?: string;                   // 标题（覆盖 type 默认）
  description?: string;             // 描述（覆盖 type 默认）
  action?: React.ReactNode;         // 操作按钮
  size?: 'large' | 'default' | 'small'; // 尺寸
  className?: string;
}
```

**预设类型映射**:

| type | 图标 (AntD) | 默认标题 | 默认描述 | 建议操作 |
|------|------------|----------|----------|----------|
| no-data | `InboxOutlined` | 暂无数据 | 还没有任何数据 | 新建按钮 |
| no-result | `SearchOutlined` | 没有找到结果 | 试试调整筛选条件 | 重置筛选 |
| no-message | `MessageOutlined` | 暂无消息 | 没有新的消息通知 | — |
| no-opportunity | `FundOutlined` | 暂无商机 | 还没有商机，去创建吧 | 新建商机 |
| no-proposal | `FileTextOutlined` | 暂无方案 | 还没有方案，去创建吧 | 新建方案 |
| error | `CloseCircleOutlined` | 加载失败 | 数据加载失败，请重试 | 重试按钮 |
| no-permission | `LockOutlined` | 权限不足 | 您没有权限查看此内容 | 联系管理员 |
| network-error | `DisconnectOutlined` | 网络异常 | 网络连接失败，请检查 | 重试按钮 |

**设计规格**:
- 图标尺寸：large 64px / default 48px / small 32px
- 图标颜色：`--yl-text-placeholder` (#B0B7C8)
- 标题：`heading-3` (16px/600)，颜色 `--yl-text-primary`
- 描述：`body-sm` (13px/400)，颜色 `--yl-text-tertiary`
- 垂直间距：图标→标题 `--yl-space-4` (16px)，标题→描述 `--yl-space-2` (8px)，描述→操作 `--yl-space-6` (24px)
- 容器内边距：`--yl-space-12` (48px) 上下

---

### 6.6 PageHeader — 页面级 Header

| 属性 | 内容 |
|------|------|
| **组件名** | `PageHeader` |
| **文件路径（建议）** | `src/shared/components/PageHeader.tsx` |
| **用途** | 统一的页面级头部，含标题、说明文字、操作按钮区、面包屑 |
| **使用场景** | 所有 Dashboard / 列表 / 详情页（Agent/Supplier/Admin 端） |
| **优先级** | P1 — 统一页面头部层级与间距 |

**建议 Props 接口**:

```typescript
interface PageHeaderProps {
  title: string;                    // 页面标题
  subtitle?: string;                // 副标题/说明文字
  breadcrumb?: { label: string; path?: string }[]; // 面包屑
  actions?: React.ReactNode;        // 右侧操作区（按钮组）
  backButton?: boolean;             // 是否显示返回按钮，默认 false
  onBack?: () => void;              // 返回回调
  avatar?: React.ReactNode;         // 标题左侧头像/图标
  tags?: React.ReactNode;           // 标题旁的标签（StatusTag 等）
  extra?: React.ReactNode;          // 额外区域（标题下方）
  size?: 'large' | 'default';      // 尺寸
  sticky?: boolean;                 // 是否吸顶，默认 false
  bordered?: boolean;               // 是否带底边框，默认 true
}
```

**设计规格**:
- 标题：`heading-1` (22px/600)，颜色 `--yl-text-primary`
- 副标题：`body-sm` (13px/400)，颜色 `--yl-text-tertiary`，标题下方 `--yl-space-1` (4px)
- 面包屑：`caption` (12px/400)，颜色 `--yl-text-tertiary`，分隔符 `/`
- 操作区：右对齐，按钮组间距 `--yl-space-3` (12px)
- 容器内边距：`--yl-space-6` (24px) 左右，`--yl-space-5` (20px) 上下
- 底边框：`--yl-border-default` (1px solid #E5E7EF)
- 吸顶模式：`position: sticky; top: 0; z-index: 10;`，背景 `--yl-bg-surface`，阴影 `--yl-shadow-xs`
- large 尺寸：标题改为 `display-sm` (24px/600)，内边距增大到 `--yl-space-8` (32px)

**新组件优先级总览**:

| 组件 | 优先级 | 阻塞的 P0/P1 | 建议开发顺序 |
|------|--------|-------------|-------------|
| ChatBubble | P0 | P0-2（AIChatPanel 对比度） | 1 |
| EmptyState | P1 | P1-3（作战台空状态） | 2 |
| PageHeader | P1 | — | 3 |
| FilterPanel | P1 | P2-1（搜索防抖） | 4 |
| CardGrid | P1 | P2-3（首页响应式） | 5 |
| MessageListItem | P1 | — | 6 |

---

## 7. Design Token 速查表

本节是开发者的**一页式 Token 参考**，可直接复制粘贴。所有 Token 定义在 `src/shared/design-tokens.css`（`--yl-*` 前缀）和 `src/styles.css`（Tailwind `@theme`）中。

### 7.1 颜色 Token

#### 品牌色 (Primary)

| Token名 | CSS变量 | HEX值 | Tailwind类 | 用途 |
|---------|---------|-------|-----------|------|
| primary | `--yl-primary` | `#5B4FD6` | `bg-yl-primary` `text-yl-primary` | 主按钮、选中态、链接、Logo |
| primary-hover | `--yl-primary-hover` | `#4A3FC5` | `hover:bg-yl-primary-hover` | 主色悬停态 |
| primary-active | `--yl-primary-active` | `#3D33B3` | `active:bg-yl-primary-active` | 主色按下态 |
| primary-subtle | `--yl-primary-subtle` | `#F0EEFF` | `bg-yl-primary-subtle` | 选中行背景、浅色标签底 |
| primary-foreground | `--yl-primary-foreground` | `#FFFFFF` | `text-yl-primary-foreground` | 主色背景上的文字 |

#### 背景色 (Background)

| Token名 | CSS变量 | HEX值 | Tailwind类 | 用途 |
|---------|---------|-------|-----------|------|
| page | `--yl-bg-page` | `#F7F8FA` | `bg-yl-bg-page` | 页面底色 |
| surface | `--yl-bg-surface` | `#FFFFFF` | `bg-yl-bg-surface` | 卡片/面板表面 |
| elevated | `--yl-bg-elevated` | `#FFFFFF` | `bg-yl-bg-elevated` | 弹出层（须配阴影） |
| sunken | `--yl-bg-sunken` | `#F0F1F4` | `bg-yl-bg-sunken` | 凹陷区域、禁用态 |
| ai | `--yl-bg-ai` | `#FAFAFF` | `bg-yl-bg-ai` | AI 专属区域底色 |

#### 文字色 (Text)

| Token名 | CSS变量 | HEX值 | Tailwind类 | 对比度(vs白底) | 用途 |
|---------|---------|-------|-----------|---------------|------|
| primary | `--yl-text-primary` | `#1A1D2E` | `text-yl-text-primary` | 15.3:1 (AAA) | 标题、正文主体 |
| secondary | `--yl-text-secondary` | `#5B6178` | `text-yl-text-secondary` | 6.2:1 (AA+) | 辅助说明、次要数据 |
| tertiary | `--yl-text-tertiary` | `#8B92A8` | `text-yl-text-tertiary` | 3.5:1 (AA Large) | 提示、时间戳 |
| placeholder | `--yl-text-placeholder` | `#B0B7C8` | `text-yl-text-placeholder` | 2.3:1 (非文本) | Input placeholder |
| on-primary | `--yl-text-on-primary` | `#FFFFFF` | `text-yl-text-on-primary` | — | 主色背景上的文字 |

#### 边框色 (Border)

| Token名 | CSS变量 | HEX值 | Tailwind类 | 用途 |
|---------|---------|-------|-----------|------|
| subtle | `--yl-border-subtle` | `#F0F1F4` | `border-yl-border-subtle` | 卡片内部分区、表格行分隔 |
| default | `--yl-border-default` | `#E5E7EF` | `border-yl-border-default` | 卡片外边框、Input 边框 |
| strong | `--yl-border-strong` | `#C8CAD4` | `border-yl-border-strong` | hover 边框、聚焦前态 |
| ai | `--yl-border-ai` | `#E0DDFF` | `border-yl-border-ai` | AI 区域边框 |

#### 语义状态色 (Status) — 三件套

| 状态 | 主色 Token | 主色 HEX | 背景 Token | 背景 HEX | 边框 Token | 边框 HEX |
|------|-----------|---------|-----------|---------|-----------|---------|
| Success | `--yl-success` | `#00875A` | `--yl-success-bg` | `#E6F7F0` | `--yl-success-border` | `#B5E8D5` |
| Warning | `--yl-warning` | `#B45309` | `--yl-warning-bg` | `#FEF7EC` | `--yl-warning-border` | `#FDE4B9` |
| Error | `--yl-error` | `#C53030` | `--yl-error-bg` | `#FEF0F0` | `--yl-error-border` | `#FDBDBD` |
| Info | `--yl-info` | `#2563EB` | `--yl-info-bg` | `#EFF4FF` | `--yl-info-border` | `#BFD5FF` |

#### AI 专属色

| Token名 | CSS变量 | HEX值 | Tailwind类 | 用途 |
|---------|---------|-------|-----------|------|
| accent | `--yl-ai-accent` | `#7C6FF7` | `text-yl-ai-accent` | AI 强调色（标签/按钮） |
| glow | `--yl-ai-glow` | `#A78BFA` | — | AI 光晕（动画用） |
| thinking | `--yl-ai-thinking` | `#C4B5FD` | — | AI 思考脉冲色 |

#### 辅助色

| Token名 | CSS变量 | HEX值 | 用途 |
|---------|---------|-------|------|
| gold | `--yl-gold` | `#D4A017` | 金色（等待确认/升级方案/高级标签） |

#### 图表色

| 序号 | CSS变量 | HEX值 | 语义 |
|------|---------|-------|------|
| 1 | `--yl-chart-1` | `#5B4FD6` | 品牌主色（主指标） |
| 2 | `--yl-chart-2` | `#0891B2` | 方案色 |
| 3 | `--yl-chart-3` | `#2563EB` | 信息色 |
| 4 | `--yl-chart-4` | `#D4A017` | 金色 |
| 5 | `--yl-chart-5` | `#B45309` | 警告色 |

#### 管道状态色 (statusColorMap)

| 中文状态 | HEX值 | CSS语义 | 使用场景 |
|----------|-------|---------|----------|
| 新需求 | `#2563EB` | info | 商机刚创建 |
| 需求确认 | `#0891B2` | proposal | 需求已确认 |
| 有效商机 | `#7C6FF7` | progress | 商机推进中 |
| 已报价 | `#0891B2` | proposal | 已发送报价 |
| 沟通中 | `#B45309` | warning | 客户沟通中 |
| 谈判中 | `#B45309` | warning | 谈判阶段 |
| 等待客户确认 | `#D4A017` | gold | 等待客户 |
| 已成交 | `#00875A` | success | 成功转化 |
| 已结束 | `#64748B` | — | 流程结束 |
| 已丢单 | `#C53030` | error | 商机失败 |

### 7.2 字体 Token

| 层级 | Token | 字号 | 字重 | 行高 | Tailwind类 | 用途 |
|------|-------|------|------|------|-----------|------|
| Display | `display-lg` | 36px | 700 | 44px | `text-4xl font-bold` | 着陆页 Hero 标题 |
| Display | `display-md` | 30px | 700 | 38px | `text-3xl font-bold` | 大型空状态标题 |
| Display | `display-sm` | 24px | 600 | 32px | `text-2xl font-semibold` | 页面主标题 |
| Heading | `heading-1` | 22px | 600 | 30px | `text-xl font-semibold` | Dashboard 标题 |
| Heading | `heading-2` | 18px | 600 | 26px | `text-lg font-semibold` | 卡片标题 |
| Heading | `heading-3` | 16px | 600 | 24px | `text-base font-semibold` | 小节标题 |
| Heading | `heading-4` | 14px | 600 | 20px | `text-sm font-semibold` | 表单标签、表头 |
| Body | `body-lg` | 16px | 400 | 26px | `text-base` | 大段正文 |
| Body | `body-md` | 14px | 400 | 22px | `text-sm` | 默认正文 |
| Body | `body-sm` | 13px | 400 | 20px | `text-[13px]` | 辅助文字 |
| Caption | `caption` | 12px | 400 | 18px | `text-xs` | 标签、时间戳 |
| Caption | `caption-xs` | 11px | 400 | 16px | `text-[11px]` | 角标、微提示 |
| Numeric | `numeric-lg` | 32px | 700 | 40px | `text-3xl font-bold font-mono` | KPI 主指标 |
| Numeric | `numeric-md` | 24px | 600 | 32px | `text-2xl font-semibold font-mono` | KPI 副指标 |
| Numeric | `numeric-sm` | 14px | 500 | 20px | `text-sm font-medium font-mono` | 表格数字 |

**字体族**:
- Sans: `var(--yl-font-sans)` = `"PingFang SC", "Noto Sans SC", "Microsoft YaHei", -apple-system, "Segoe UI", Roboto, sans-serif`
- Mono: `var(--yl-font-mono)` = `"SF Mono", "JetBrains Mono", Consolas, monospace`

### 7.3 间距 Token

| Token | CSS变量 | 值 | Tailwind类 | 用途 |
|-------|---------|----|-----------|------|
| space-1 | `--yl-space-1` | 4px | `gap-1` `p-1` | 图标与文字间距 |
| space-2 | `--yl-space-2` | 8px | `gap-2` `p-2` | 组件内元素间距 |
| space-3 | `--yl-space-3` | 12px | `gap-3` `p-3` | 表单项间距 |
| space-4 | `--yl-space-4` | 16px | `gap-4` `p-4` | 卡片内边距 |
| space-5 | `--yl-space-5` | 20px | `gap-5` `p-5` | 卡片间距 |
| space-6 | `--yl-space-6` | 24px | `gap-6` `p-6` | 模块间距 |
| space-8 | `--yl-space-8` | 32px | `gap-8` `p-8` | 页面区域间距 |
| space-10 | `--yl-space-10` | 40px | `gap-10` `p-10` | 页面上下留白 |
| space-12 | `--yl-space-12` | 48px | `gap-12` `p-12` | 大型区块间距 |
| space-16 | `--yl-space-16` | 64px | `gap-16` `p-16` | Hero 区域间距 |

### 7.4 圆角 Token

| Token | CSS变量 | 值 | Tailwind类 | 组件映射 |
|-------|---------|----|-----------|----------|
| none | `--yl-radius-none` | 0px | `rounded-none` | 表格行 |
| sm | `--yl-radius-sm` | 4px | `rounded-sm` | Tag、Badge |
| md | `--yl-radius-md` | 8px | `rounded-md` | Button、Input、Select |
| lg | `--yl-radius-lg` | 12px | `rounded-lg` | Card、Dialog |
| xl | `--yl-radius-xl` | 16px | `rounded-xl` | Drawer、Modal |
| 2xl | `--yl-radius-2xl` | 24px | `rounded-2xl` | AI 对话气泡 |
| full | `--yl-radius-full` | 9999px | `rounded-full` | Avatar、Status Dot |

### 7.5 阴影 Token

| Token | CSS变量 | 值 | Tailwind类 | 用途 |
|-------|---------|----|-----------|------|
| xs | `--yl-shadow-xs` | `0 1px 2px rgba(26,29,46,0.04)` | `shadow-sm` | 卡片默认态 |
| sm | `--yl-shadow-sm` | `0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04)` | `shadow` | 卡片默认、表格行 hover |
| md | `--yl-shadow-md` | `0 4px 6px rgba(26,29,46,0.05), 0 2px 4px rgba(26,29,46,0.04)` | `shadow-md` | 卡片 hover、Dropdown |
| lg | `--yl-shadow-lg` | `0 10px 15px rgba(26,29,46,0.06), 0 4px 6px rgba(26,29,46,0.04)` | `shadow-lg` | 高亮卡片、悬浮面板 |
| xl | `--yl-shadow-xl` | `0 20px 25px rgba(26,29,46,0.08), 0 8px 10px rgba(26,29,46,0.04)` | `shadow-xl` | Modal、Drawer |
| ai | `--yl-shadow-ai` | `0 0 0 1px rgba(91,79,214,0.15), 0 4px 12px rgba(91,79,214,0.10)` | — | AI 面板、AI 对话区 |

### 7.6 动画 Token

#### 时长

| Token | CSS变量 | 值 | 用途 |
|-------|---------|----|------|
| instant | `--yl-duration-instant` | 0ms | 即时响应 |
| fast | `--yl-duration-fast` | 150ms | 按钮 hover/active |
| normal | `--yl-duration-normal` | 250ms | Dropdown、Tag |
| slow | `--yl-duration-slow` | 350ms | Drawer、Modal |
| slower | `--yl-duration-slower` | 500ms | 页面过渡 |

#### 缓动曲线

| Token | CSS变量 | 值 | 用途 |
|-------|---------|----|------|
| default | `--yl-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认 |
| in | `--yl-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 退出 |
| out | `--yl-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 进入 |
| spring | `--yl-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性微交互 |

#### 命名动画

| 动画名 | duration | 用途 |
|--------|----------|------|
| `yl-thinking-pulse` | 1500ms (infinite) | AI 思考三点脉冲 |
| `yl-fade-in` | 250ms | AI 流式输出淡入 |
| `yl-skeleton-pulse` | 2000ms (infinite) | 骨架屏脉冲 |
| `yl-card-enter` | 350ms | 卡片交错入场 |

### 7.7 响应式断点

| Tailwind 前缀 | 断点 | 端口 | 布局变化 |
|---------------|------|------|----------|
| (默认) | `< 768px` | Mobile S/M | 单列，底部 Tab |
| `sm:` | `>= 768px` | Tablet | 双列，可折叠侧边栏 |
| `md:` | `>= 1024px` | Desktop S | 三列，固定侧边栏 |
| `lg:` | `>= 1280px` | Desktop M | 三列，内容区约束 |
| `xl:` | `>= 1536px` | Desktop L | 多列，侧边栏展开 |
| `2xl:` | `>= 1920px` | Desktop XL | 多列，内容居中 |

### 7.8 按钮尺寸 Token

| 尺寸 | 高度 | 内边距(左右) | 字号 | 用途 |
|------|------|-------------|------|------|
| large | 48px | 24px | 16px | 页面主 CTA |
| default | 40px | 20px | 14px | 常规操作 |
| compact | 36px | 16px | 14px | 卡片内/空间紧凑 |

---

## 8. 页面-组件对应表

以下表格覆盖全部 52 个页面，按端分组。每个页面列出使用的共享组件、UI 组件、新增组件。

### 8.1 Agent 端（7 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| Agent 首页 | `agent.index` | AIChatPanel, SolutionCard, StatusTag, formatters | Card, Input, Button, Space, Tag, Typography, Row, Col | PageHeader, CardGrid | 🔄 REDESIGN |
| AI 对话 | `agent.assistant` | AIChatPanel, AIFeedbackBar, RequirementExtractPanel, formatters | Card, Input, Button, Space, Typography, Row, Col, Alert | ChatBubble | 🔄 REDESIGN |
| 方案发现 | `agent.solutions` | SolutionCard, StatusTag, formatters | Card, Input, Button, Space, Tag, Typography, Row, Col, Select, Segmented | FilterPanel, CardGrid, EmptyState, PageHeader | 🔄 REDESIGN |
| 消息中心 | `agent.messages` | formatters | Card, Space, Typography, Badge, Tabs | MessageListItem, EmptyState, PageHeader | 🔄 REDESIGN |
| 我的方案 | `agent.requests` | SolutionCard, StatusTag, OpportunityCard, formatters | Card, Space, Tag, Typography, Row, Col, Tabs | PageHeader, EmptyState | ⚡ OPTIMIZE |
| 报价详情 | `agent.quotations.$id` | ProposalPreview, StatusTag, formatters | Card, Button, Space, Typography, Descriptions, Row, Col | PageHeader | ⚡ OPTIMIZE |
| Agent 登录 | `agent.login` | — | Card, Input, Button, Form, Typography | — | 🔒 FROZEN |

### 8.2 Supplier 端（14 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| 销售作战台 | `supplier.workspace` | DashboardCard, OpportunityCard, StatusTag, OpportunityStatusFlow, LeadScoreBadge, formatters | Card, Space, Typography, Row, Col, Tabs, Statistic | PageHeader, EmptyState, FilterPanel | 🔄 REDESIGN |
| 跟进中心 | `supplier.followups` | FollowUpTimeline, StatusTag, PriorityTag, formatters | Card, Space, Typography, Row, Col, Tabs, Badge | MessageListItem, EmptyState, PageHeader | 🔄 REDESIGN |
| 商机中心 | `supplier.opportunities` | OpportunityCard, StatusTag, PriorityTag, formatters | Card, Input, Button, Space, Tag, Typography, Row, Col, Select | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| 商机详情 | `supplier.opportunities.$id` | OpportunityStatusFlow, FollowUpTimeline, StatusTag, PriorityTag, formatters | Card, Button, Space, Typography, Descriptions, Row, Col, Tabs | PageHeader | ⚡ OPTIMIZE |
| 线索中心 | `supplier.leads` | LeadScoreBadge, StatusTag, formatters | Card, Input, Button, Space, Table, Tag, Typography, Row, Col | — | 🔒 FROZEN |
| 线索详情 | `supplier.leads.$id` | LeadScoreBadge, StatusTag, FollowUpTimeline, formatters | Card, Button, Space, Typography, Descriptions, Row, Col, Tabs | — | 🔒 FROZEN |
| 方案管理 | `supplier.proposals` | SolutionCard, StatusTag, formatters | Card, Input, Button, Space, Tag, Typography, Row, Col, Select | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| 方案详情 | `supplier.proposals.$id` | ProposalPreview, SolutionCard, StatusTag, formatters | Card, Button, Space, Typography, Descriptions, Row, Col, Tabs | PageHeader | ⚡ OPTIMIZE |
| 报价管理 | `supplier.quotations.index` | StatusTag, formatters | Card, Input, Button, Space, Table, Tag, Typography, Row, Col | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| 报价详情 | `supplier.quotations.$id` | ProposalPreview, StatusTag, formatters | Card, Button, Space, Typography, Descriptions, Row, Col | PageHeader | ⚡ OPTIMIZE |
| 艺人管理 | `supplier.artists` | formatters | Card, Input, Button, Space, Avatar, Tag, Typography, Row, Col | PageHeader, EmptyState | ⚡ OPTIMIZE |
| 反馈中心 | `supplier.feedback` | AIFeedbackBar, formatters | Card, Space, Typography, Row, Col, Tabs | EmptyState, PageHeader | ⚡ OPTIMIZE |
| Supplier 首页 | `supplier.index` | DashboardCard, formatters | Card, Space, Typography, Row, Col | PageHeader | ⚡ OPTIMIZE |
| Supplier 登录 | `supplier.login` | — | Card, Input, Button, Form, Typography | — | 🔒 FROZEN |

### 8.3 Admin 端（16 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| Admin 仪表盘 | `admin.dashboard` | DashboardCard, formatters | Card, Space, Typography, Row, Col, Statistic | PageHeader | ⚡ OPTIMIZE |
| 仪表盘图表 | `admin.dashboard.charts` | formatters | Card, Space, Typography, Row, Col (Recharts) | PageHeader | ⚡ OPTIMIZE |
| SKU 管理 | `admin.sku` | StatusTag, formatters | Card, Input, Button, Space, Table, Tag, Typography, Row, Col | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| 艺人管理 | `admin.artists` | formatters | Card, Input, Button, Space, Table, Avatar, Tag, Typography, Row, Col | PageHeader, EmptyState | ⚡ OPTIMIZE |
| 客户管理 | `admin.customers` | StatusTag, formatters | Card, Input, Button, Space, Table, Tag, Typography, Row, Col | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| 订单管理 | `admin.orders` | StatusTag, formatters | Card, Input, Button, Space, Table, Tag, Typography, Row, Col | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| AI 反馈管理 | `admin.ai-feedback` | AIFeedbackBar, formatters | Card, Space, Table, Typography, Row, Col, Tabs | EmptyState, PageHeader | ⚡ OPTIMIZE |
| 标注管理 | `admin.labeling` | StatusTag, formatters | Card, Space, Table, Tag, Typography, Row, Col | EmptyState, PageHeader | ⚡ OPTIMIZE |
| 提示词管理 | `admin.prompts` | StatusTag, formatters | Card, Input, Button, Space, Tag, Typography, Row, Col, Tabs | PageHeader, EmptyState | ⚡ OPTIMIZE |
| RBAC 权限 | `admin.rbac` | StatusTag, formatters | Card, Space, Table, Tag, Typography, Row, Col, Tree | PageHeader | ⚡ OPTIMIZE |
| 审计日志 | `admin.audit` | StatusTag, formatters | Card, Input, Space, Table, Tag, Typography, Row, Col, DatePicker | FilterPanel, EmptyState, PageHeader | ⚡ OPTIMIZE |
| 机构管理 | `admin.agencies` | StatusTag, formatters | Card, Input, Button, Space, Table, Tag, Typography, Row, Col | PageHeader, EmptyState | ⚡ OPTIMIZE |
| 字典管理 | `admin.dict` | formatters | Card, Input, Button, Space, Table, Typography, Row, Col | PageHeader, EmptyState | ⚡ OPTIMIZE |
| Admin 首页 | `admin.index` | DashboardCard, formatters | Card, Space, Typography, Row, Col | PageHeader | ⚡ OPTIMIZE |
| Admin 登录 | `admin.login` | — | Card, Input, Button, Form, Typography | — | 🔒 FROZEN |
| Admin Layout | `admin.tsx` | AppTopBar | Layout, Menu, Avatar, Badge | — | 🔒 FROZEN |

### 8.4 m 端（6 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| m 端首页 | `m.index` | DashboardCard, formatters | Card, Space, Typography, Row, Col | — | ⚡ OPTIMIZE |
| m 端发现 | `m.discover` | SolutionCard, StatusTag, formatters | Card, Input, Space, Tag, Typography | FilterPanel, EmptyState | ⚡ OPTIMIZE |
| m 端提交 | `m.submit` | MinimalRequirementForm, formatters | Card, Form, Input, Button, Space, Select, DatePicker | — | ⚡ OPTIMIZE |
| m 端消息 | `m.messages` | formatters | Card, Space, Badge, Typography, Tabs | MessageListItem, EmptyState | ⚡ OPTIMIZE |
| m 端我的 | `m.me` | formatters | Card, Space, Avatar, Typography, List | — | ⚡ OPTIMIZE |
| m 端 Layout | `m.tsx` | — | Layout, TabBar | — | 🔒 FROZEN |

### 8.5 增长工具 H5（3 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| 预算计算器 | `tools.budget-calculator` | ToolQuestionFlow, ToolResultPage, AIChatPanel, LeadCaptureModal, DashboardCard, formatters | Card, Button, Space, Typography, Row, Col | PageHeader | 🔄 REDESIGN |
| 保险方案规划 | `tools.insurance-plan` | ToolQuestionFlow, ToolResultPage, AIChatPanel, LeadCaptureModal, DashboardCard, formatters | Card, Button, Space, Typography, Row, Col | PageHeader | 🔄 REDESIGN |
| 年度活动规划 | `tools.annual-plan` | ToolQuestionFlow, ToolResultPage, AIChatPanel, LeadCaptureModal, DashboardCard, formatters | Card, Button, Space, Typography, Row, Col | PageHeader | 🔄 REDESIGN |

### 8.6 客户方案 H5（1 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| 客户方案预览 | `p.$proposalId` | ProposalPreview, SolutionCard, StatusTag, LeadCaptureModal, formatters | Card, Button, Space, Typography, Row, Col | PageHeader | 🔄 REDESIGN |

### 8.7 首页（1 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| 平台首页 | `index` | LeadCaptureModal, MinimalRequirementForm, formatters | Card, Button, Space, Typography, Row, Col, Tag | CardGrid, PageHeader | 🔄 REDESIGN |

### 8.8 Layout 路由（4 页）

| 页面 | 路由 | 共享组件 | UI组件 (shadcn/ui + AntD) | 新增组件 | 分类 |
|------|------|----------|--------------------------|----------|------|
| 根 Layout | `__root.tsx` | — | Outlet, TanStack Router Devtools | — | 🔒 FROZEN |
| Agent Layout | `agent.tsx` | AppTopBar | Layout, Menu, Outlet | — | 🔒 FROZEN |
| Supplier Layout | `supplier.tsx` | AppTopBar | Layout, Menu, Outlet | — | 🔒 FROZEN |
| m 端 Layout | `m.tsx` | — | Layout, TabBar, Outlet | — | 🔒 FROZEN |

---

## 9. 开发注意事项

本节汇总技术栈相关的陷阱、最佳实践与已知问题，开发者**务必在编码前通读本节**。

### 9.1 Ant Design 6 注意事项

#### 9.1.1 Space 组件 size 属性

```
✅ 正确: <Space size={12}>     // 数字像素值，对应 --yl-space-3
✅ 正确: <Space size="small">  // AntD 预设尺寸 (8px)
✅ 正确: <Space size="middle"> // AntD 预设尺寸 (16px)
✅ 正确: <Space size="large">  // AntD 预设尺寸 (24px)
❌ 错误: <Space size="var(--yl-space-3)"> // CSS 变量字符串，AntD 类型不支持
```

**原因**: AntD Space 的 `size` 属性类型为 `number | 'small' | 'middle' | 'large'`，不接受 CSS 变量字符串。使用数字时直接传入像素值。

#### 9.1.2 Tag 组件 color 属性

```
✅ 正确: <Tag color="#C53030">高优先级</Tag>  // HEX 字符串
✅ 正确: <Tag color={statusColorMap[status]}>已成交</Tag> // 从映射表取 HEX
❌ 错误: <Tag color="red">高优先级</Tag>      // AntD 命名色，禁止
❌ 错误: <Tag color="success">已成交</Tag>    // AntD 语义色名，禁止
```

**原因**: AntD 命名色 (`"red"`, `"blue"`, `"green"`, `"gold"`, `"orange"`, `"default"`) 在不同 AntD 版本间色值可能变化，无法保证与 V4.7 Token 一致。必须直接传入 V4.7 HEX 值。

#### 9.1.3 AntD ThemeConfig 映射

在 `src/shared/theme.ts` 中已配置 AntD 全局主题。开发者不应在页面级覆盖 AntD token，应通过全局 ConfigProvider 统一管理。关键映射：

| AntD Token | V4.7 值 |
|------------|---------|
| `colorPrimary` | `#5B4FD6` |
| `colorSuccess` | `#00875A` |
| `colorWarning` | `#B45309` |
| `colorError` | `#C53030` |
| `colorInfo` | `#2563EB` |
| `borderRadius` | `8` |
| `fontFamily` | `var(--yl-font-sans)` |

### 9.2 Tailwind CSS 4.2 注意事项

#### 9.2.1 @theme inline 映射

`src/styles.css` 中使用 `@theme inline` 将 CSS 变量映射为 Tailwind 工具类：

```css
@theme inline {
  --color-yl-primary: var(--yl-primary);
  --color-yl-bg-page: var(--yl-bg-page);
  /* ... 其他映射 */
}
```

映射后即可使用 `bg-yl-primary`、`text-yl-text-primary`、`border-yl-border-default` 等类名。

**注意**: 新增 Token 时必须同时在 `design-tokens.css` 定义变量和在 `styles.css` 的 `@theme inline` 中添加映射，否则 Tailwind 类名不生效。

#### 9.2.2 oklch 与 hex 格式共存

- `src/styles.css` 使用 `oklch()` 格式定义颜色
- `src/shared/design-tokens.css` 使用 `hex` 格式定义颜色
- 两者都是合法的 CSS 颜色格式，**值已同步**
- 开发时引用 Token 即可（`var(--yl-primary)`），不需要关心底层格式
- 如果需要新增 Token，建议在两个文件中保持值同步

#### 9.2.3 响应式断点

Tailwind 4.2 断点已在 `styles.css` 中配置：

| 前缀 | 断点 | 说明 |
|------|------|------|
| (默认) | `< 768px` | 移动端 |
| `sm:` | `>= 768px` | 平板 |
| `md:` | `>= 1024px` | 小屏桌面 |
| `lg:` | `>= 1280px` | 标准桌面 |
| `xl:` | `>= 1536px` | 大屏桌面 |
| `2xl:` | `>= 1920px` | 超宽屏 |

**首页响应式修复要点**: 当前首页 CSS grid 无响应式断点，工具卡片和角色按钮在移动端溢出。修复方案：使用 `CardGrid` 组件或 Tailwind 响应式类 `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`。

### 9.3 TanStack Router 注意事项

- **文件系统路由**: 路由文件名即 URL 路径，禁止修改文件名
- **动态参数**: 使用 `$` 前缀，如 `supplier.opportunities.$id.tsx` → `/supplier/opportunities/:id`
- **Layout 路由**: `agent.tsx`、`supplier.tsx`、`admin.tsx`、`m.tsx` 是各端的 Layout 路由
- **根路由**: `__root.tsx` 是全局根 Layout
- 获取参数: `const { id } = Route.useParams()` 或 `useParams({ from: '...' })`

### 9.4 依赖库使用指南

| 库 | 用途 | 使用说明 |
|----|------|----------|
| `@dnd-kit/core` + `@dnd-kit/sortable` | 拖拽排序 | 已安装，使用 `PointerSensor`（不要用 MouseSensor，触屏不兼容） |
| `react-markdown` | Markdown 渲染 | 已安装，用于 AI 对话消息内容渲染 |
| `recharts` | 图表 | 通过 AntD Chart 组件间接使用，不要直接 import recharts |
| `@ant-design/icons` | 图标库 | 主图标库，覆盖 90%+ 场景 |
| `lucide-react` | 补充图标 | shadcn/ui 默认图标库，少量使用 |

### 9.5 Mock 数据使用规则

所有 mock 数据位于 `src/shared/mock/` 目录：

| 文件 | 内容 | 使用页面 |
|------|------|----------|
| `admin.ts` | Admin 端 mock 数据（用户/角色/SKU/订单等） | Admin 端全部页面 |
| `ai.ts` | AI 对话/提取/推荐 mock | agent.assistant, agent.index |
| `data.ts` | 通用业务数据（商机/方案/报价/线索） | Supplier/Agent 端 |
| `feedbackLog.ts` | AI 反馈日志 | admin.ai-feedback, supplier.feedback |
| `growth-tools.ts` | 增长工具数据（预算/保险/年度规划） | tools.* |
| `messages.ts` | 消息列表数据 | agent.messages, m.messages |
| `tool-ai-chat.ts` | H5 工具 AI 对话 mock | tools.* |

**规则**:
1. **禁止新建 mock 文件** — 所有 mock 数据必须在上述 7 个文件中
2. **禁止修改 mock 数据结构** — TypeScript 接口已定义，仅可更新数据值
3. **对接真实 API 时** — 替换 mock import 为 API 调用，保持返回数据结构一致

### 9.6 图片资产规则

- **当前无图片资产** — 项目中没有任何本地或远程图片
- **禁止引入外部图片** — 不使用 Unsplash、占位图等外部资源
- **头像**: 使用用户名首字母 + 品牌色背景（AntD `<Avatar>` 默认行为）
- **图标**: 使用 `@ant-design/icons`（主库）或 `lucide-react`（shadcn/ui 补充）
- **空状态**: 使用 `EmptyState` 组件 + AntD 图标，不使用插画图片
- **Logo**: 使用文字 Logo "演立方" + 品牌色，不使用图片 Logo

### 9.7 已知问题修复优先级

| 编号 | 问题 | 涉及文件 | 优先级 | 修复方案 |
|------|------|----------|--------|----------|
| P0-1 | RequirementExtractPanel 进度条使用禁止色 #6E59F5 | `RequirementExtractPanel.tsx` | P0 | 替换为 `linear-gradient(90deg, var(--yl-primary), var(--yl-ai-accent))` |
| P0-2 | AIChatPanel 用户气泡对比度 1.2:1 (FAIL) | `AIChatPanel.tsx` | P0 | 背景从 `--yl-secondary` 改为 `--yl-primary`，对比度 7.1:1 (AAA) |
| P0-3 | Agent 首页 "让AI推荐" 按钮使用绿色 | `routes/agent.index.tsx` | P0 | 替换为 `--yl-primary` 主色按钮 |
| P1-4 | PriorityTag 使用 AntD 命名色 | `StatusTag.tsx` | P1 | red→#C53030, orange→#B45309, default→#8B92A8 |
| P1-5 | ConfidenceTag 使用 AntD 命名色 | `StatusTag.tsx` | P1 | green→#00875A, gold→#D4A017, default→#8B92A8 |
| P1-6 | 跟进中心提醒卡硬编码背景色 | `routes/supplier.followups.tsx` | P1 | #FFF5F5→--yl-error-bg, #FFF9F0→--yl-warning-bg, #F5F8FF→--yl-info-bg |
| P1-7 | RequirementExtractPanel Alert 硬编码色 | `RequirementExtractPanel.tsx` | P1 | #FFF7E6→--yl-warning-bg, #FFE1A8→--yl-warning-border |
| P1-8 | SolutionCard 使用 emoji | `SolutionCard.tsx` | P1 | 👥→TeamOutlined, ⏱→ClockCircleOutlined |
| P1-9 | 首页 CSS grid 无响应式断点 | `routes/index.tsx` | P1 | 使用 CardGrid 或 Tailwind 响应式类 |
| P2-10 | 方案发现搜索无防抖 | `routes/agent.solutions.tsx` | P2 | 添加 300ms debounce |
| P2-11 | 销售作战台无空/错误状态 | `routes/supplier.workspace.tsx` | P2 | 添加 EmptyState 组件 |
| P2-12 | 销售作战台 height calc 在移动端失效 | `routes/supplier.workspace.tsx` | P2 | 使用 `min-height` + 响应式 |
| P2-13 | 首页角色按钮不可见 | `routes/index.tsx` | P2 | rgba(255,255,255,.04)→可识别背景色 |

### 9.8 代码风格约定

1. **import 路径**: 使用 `@/` 别名指向 `src/`
   ```typescript
   import { StatusTag } from '@/shared/components/StatusTag';
   import { yuan } from '@/shared/components/formatters';
   ```
2. **颜色**: 一律使用 `var(--yl-*)` 或 Tailwind class，禁止 HEX 字面量
3. **间距**: 使用 `var(--yl-space-*)` 或 Tailwind spacing class 或 AntD Space 数值
4. **金额**: 一律调用 `formatters.yuan()` 或 `formatters.wan()`
5. **时间**: 一律调用 `formatters.relativeTime()`
6. **图标**: 一律使用 `@ant-design/icons`，禁止 emoji
7. **状态标签**: 一律使用 `StatusTag` / `PriorityTag` / `ConfidenceTag`，禁止裸 `<Tag>`

---

## 10. 待确认问题清单

以下问题需要产品负责人、设计负责人或技术负责人确认后才能最终实施。开发者遇到这些问题时按"当前处理"列执行，待确认后调整。

| # | 问题 | 涉及页面 | 当前处理 | 需要确认人 | 优先级 |
|---|------|----------|----------|-----------|--------|
| 1 | 用户气泡颜色改为品牌紫 (#5B4FD6) 后，AI 气泡使用浅紫底 (#FAFAFF)，两者是否在视觉上足够区分？是否需要增加 AI 气泡的左侧色条或头像标识？ | agent.assistant, agent.index | 按 P0 修复方案执行：用户气泡 `--yl-primary` 底白字，AI 气泡 `--yl-bg-ai` 底 + `--yl-border-ai` 边框 + AI 头像 | 设计负责人 | P0 |
| 2 | 销售作战台三栏布局在 1024px (Desktop S) 时是否改为 Tab 切换？当前 `calc(100vh - 260px)` 在移动端会失效 | supplier.workspace | 桌面端保持三栏，平板端折叠左栏为抽屉，移动端改为 Tab 切换；高度改为 `min-height: 600px` | 设计负责人 + 产品负责人 | P1 |
| 3 | 跟进中心提醒卡片从硬编码色替换为语义 Token 后，视觉色温会变化（如 #FFF5F5→#FEF0F0），是否需要设计走查？ | supplier.followups | 按 P1 修复方案替换为语义 Token，替换后提请设计走查 | 设计负责人 | P1 |
| 4 | 方案发现搜索防抖 300ms 是否足够？考虑 AI 推荐场景下是否需要更长的防抖时间（如 500ms）以减少 API 调用？ | agent.solutions | 按 TDDP 要求实现 300ms 防抖 | 产品负责人 + 技术负责人 | P2 |
| 5 | 首页角色按钮当前背景 `rgba(255,255,255,.04)` 几乎不可见。修复方案：(A) 改为 `--yl-primary-subtle` (#F0EEFF) 底 + `--yl-primary` 文字；(B) 改为 `--yl-bg-surface` 底 + `--yl-border-default` 边框。哪种更符合品牌调性？ | index | 暂按方案 A 执行（`--yl-primary-subtle` 底 + `--yl-primary` 文字） | 设计负责人 | P1 |
| 6 | 新增的 `PageHeader` 组件是否需要在 m 端（移动端）使用？移动端是否用更简洁的标题栏替代？ | 全部 m 端页面 | m 端暂不使用 `PageHeader`，使用各页面内嵌的简化标题 | 设计负责人 | P2 |
| 7 | `EmptyState` 组件的预设类型是否覆盖全部业务场景？是否需要增加"无线索"、"无报价"等专属类型？ | 全部列表页 | 暂用通用 `no-data` 类型，后续按需扩展 | 产品负责人 | P2 |
| 8 | 客户方案 H5 页面 (`p.$proposalId`) 的 8 段式结构具体是哪 8 段？当前仅有 ProposalPreview 组件，是否需要拆分更多分区？ | p.$proposalId | 暂按 ProposalPreview 组件展示，8 段结构待设计确认后拆分 | 设计负责人 + 产品负责人 | P1 |
| 9 | Admin 端图表页 (`admin.dashboard.charts`) 使用 Recharts 还是 AntD Charts？两者配色如何统一为 V4.7 chart Token？ | admin.dashboard.charts | 暂用 AntD Chart 组件（内部封装 Recharts），配色通过 ThemeConfig 注入 chart Token | 技术负责人 | P2 |
| 10 | 增长工具 H5 三个工具页 (`tools.*`) 的视觉节奏优化具体指什么？是否需要统一三个工具的步骤数和流程长度？ | tools.budget-calculator, tools.insurance-plan, tools.annual-plan | 暂统一为 4-6 步流程，步骤指示器样式统一 | 设计负责人 | P1 |
| 11 | `ChatBubble` 组件从 `AIChatPanel` 提取后，`AIChatPanel` 是否重构为使用 `ChatBubble` 的组合？还是两者并存？ | agent.assistant, agent.index | `AIChatPanel` 重构为 `ChatBubble` 的容器组合，保持对外 Props 不变 | 技术负责人 | P1 |
| 12 | `MessageListItem` 是否需要支持滑动操作（移动端左滑删除/标记已读）？ | agent.messages, m.messages | 暂不支持滑动操作，使用点击进入详情 + 右键菜单 | 产品负责人 + 设计负责人 | P2 |
| 13 | 首页 (`index`) 是否需要增加底部 CTA 区域（如"立即开始"/"预约演示"）？当前首页仅有角色入口和工具卡片 | index | 暂保持当前结构，底部 CTA 待产品确认 | 产品负责人 | P2 |
| 14 | Admin 端 RBAC 权限矩阵是否使用 Tree 组件展示？角色色 (`agentTheme`/`supplierTheme`) 是否适用于 Admin 端角色标签？ | admin.rbac | 暂用 AntD Tree + Table 组合，角色色使用 `theme.ts` 中的角色色映射 | 技术负责人 + 设计负责人 | P2 |
| 15 | m 端底部 TabBar 的 5 个 Tab 分别对应哪些页面？当前 `m.tsx` Layout 中的 TabBar 配置是否冻结？ | m.tsx, m.index, m.discover, m.submit, m.messages, m.me | TabBar 配置冻结，5 个 Tab: 首页/发现/提交/消息/我的 | 产品负责人 | P1 |

---

## 附录 A: P0/P1 问题修复检查清单

开发者在提交代码前，必须逐项确认以下检查项：

### P0 检查项（必须 100% 通过）

- [ ] `RequirementExtractPanel.tsx` 中进度条渐变已从 `#6E59F5` 替换为 `var(--yl-primary)` → `var(--yl-ai-accent)`
- [ ] `AIChatPanel.tsx` 中用户消息气泡背景已从 `--yl-secondary` 替换为 `--yl-primary`，对比度 ≥ 7:1
- [ ] `routes/agent.index.tsx` 中"让AI推荐"按钮已从 `--yl-success` 替换为 `--yl-primary`
- [ ] 全局搜索确认 `#6E59F5` 和 `#7c3aed` 在代码库中零出现

### P1 检查项（必须 100% 通过）

- [ ] `StatusTag.tsx` 中 `PriorityTag` 的 `"red"/"orange"/"default"` 已替换为 `#C53030/#B45309/#8B92A8`
- [ ] `StatusTag.tsx` 中 `ConfidenceTag` 的 `"green"/"gold"/"default"` 已替换为 `#00875A/#D4A017/#8B92A8`
- [ ] `routes/supplier.followups.tsx` 中 `#FFF5F5/#FFF9F0/#F5F8FF` 已替换为语义 Token
- [ ] `RequirementExtractPanel.tsx` 中 Alert 的 `#FFF7E6/#FFE1A8` 已替换为 `--yl-warning-bg/--yl-warning-border`
- [ ] `SolutionCard.tsx` 中 emoji `👥/⏱` 已替换为 `TeamOutlined/ClockCircleOutlined`
- [ ] `routes/index.tsx` 中 CSS grid 已添加响应式断点，移动端不溢出
- [ ] `routes/index.tsx` 中角色按钮背景已从 `rgba(255,255,255,.04)` 替换为可见背景色

### P2 检查项（建议通过）

- [ ] `routes/agent.solutions.tsx` 搜索框已添加 300ms debounce
- [ ] `routes/supplier.workspace.tsx` 已添加空状态和错误状态
- [ ] `routes/supplier.workspace.tsx` 中 `calc(100vh-260px)` 已修复为移动端兼容方案

---

## 附录 B: 文件路径速查

### 共享组件路径

```
src/shared/components/
├── StatusTag.tsx              # StatusTag + PriorityTag + ConfidenceTag
├── SolutionCard.tsx
├── OpportunityCard.tsx
├── FollowUpTimeline.tsx
├── AIChatPanel.tsx
├── AIFeedbackBar.tsx
├── RequirementExtractPanel.tsx
├── LeadCaptureModal.tsx
├── ToolQuestionFlow.tsx
├── ToolResultPage.tsx
├── DashboardCard.tsx
├── ProposalPreview.tsx
├── LeadScoreBadge.tsx
├── OpportunityStatusFlow.tsx
├── AppTopBar.tsx
├── MinimalRequirementForm.tsx
└── formatters.ts              # yuan(), wan(), relativeTime()
```

### 配置文件路径

```
src/shared/
├── design-tokens.css          # --yl-* 设计令牌 (hex)
├── theme.ts                   # AntD ThemeConfig + statusColorMap + agentTheme + supplierTheme
├── types.ts                   # 全局类型定义
├── hooks/useAIChat.ts         # AI 对话状态管理 Hook
├── utils/
│   ├── opportunityPriority.ts # 商机优先级算法
│   └── followupRules.ts       # 跟进时间规则
└── mock/
    ├── admin.ts
    ├── ai.ts
    ├── data.ts
    ├── feedbackLog.ts
    ├── growth-tools.ts
    ├── messages.ts
    └── tool-ai-chat.ts
```

### 全局样式路径

```
src/styles.css                 # Tailwind @theme inline + :root + .dark
```

### 新增组件建议路径

```
src/shared/components/
├── ChatBubble.tsx             # [新] AI 对话气泡
├── EmptyState.tsx             # [新] 空状态
├── PageHeader.tsx             # [新] 页面级 Header
├── FilterPanel.tsx            # [新] 筛选面板
├── CardGrid.tsx               # [新] 卡片网格容器
└── MessageListItem.tsx        # [新] 消息列表项
```

---

> **文档结束**
>
> 本文档是演立方 V4.7 设计交付的最终权威文档。开发者应以此文档为唯一参考进行实施。如有任何与本文档冲突的指引，以本文档为准。开放问题见 §10，待产品/设计确认后更新本文档。
>
> **最后更新**: 2025-07-12 | **版本**: V4.7 | **品牌色**: `#5B4FD6`
