# 演立方 V4.7 Design System 完整规范

> **版本**: V4.7  
> **最后更新**: 2025-07-12  
> **适用技术栈**: React 19.2 + Ant Design 6.5 + Tailwind CSS 4.2 + TanStack Router  
> **品牌色**: `#5B4FD6` (严禁使用旧色 `#6E59F5` / `#7c3aed`)

---

## 目录

1. [概述](#1-概述)
2. [Color Token 完整规范](#2-color-token-完整规范)
3. [Typography Token 完整规范](#3-typography-token-完整规范)
4. [Spacing Token](#4-spacing-token)
5. [Radius Token](#5-radius-token)
6. [Shadow Token](#6-shadow-token)
7. [Icon 规范](#7-icon-规范)
8. [Animation Token](#8-animation-token)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Ant Design 6 主题映射](#10-ant-design-6-主题映射)
11. [Token 使用规则](#11-token-使用规则)
12. [Token 速查表](#12-token-速查表)

---

## 1. 概述

### 1.1 设计系统原则

演立方 Design System 是一套面向 AI 提案商机线索生成平台的设计语言系统，承载以下五大核心原则：

| 原则 | 说明 | 设计体现 |
|------|------|----------|
| **专业** | 面向 B2B 企业级客户，传达可信赖感 | 克制的配色、清晰的层级、规范的间距 |
| **可信** | 信息准确、状态清晰、操作可预期 | 语义化状态色、一致的操作反馈 |
| **智能** | AI 能力可见可感知，但不喧宾夺主 | 专属 AI 色系、克制的动画与微交互 |
| **精准** | 信息密度适中，关键数据一目了然 | Numeric 字体层级、管道状态色映射 |
| **克制** | 不使用过多装饰，让内容本身发声 | 低饱和中性色、统一圆角与阴影体系 |

### 1.2 品牌 DNA

- **主色**: `#5B4FD6` — 一种深邃的蓝紫色，兼具科技感与稳重感，传达「智能」与「专业」的双重特质
- **辅色**: `#1A1D2E` — 近黑色调，作为文字主色和次要品牌色，提供高对比度阅读体验
- **品牌色演进**: V4.7 之前的旧色 `#6E59F5` / `#7c3aed` 色相偏紫红、饱和度过高，不符合「克制」原则，已全面弃用

### 1.3 本文档覆盖范围

本文档是演立方 V4.7 Design System 的**唯一权威规范**，覆盖以下内容：

- **Color Token** — 9 大色系，共 50+ 颜色变量
- **Typography Token** — 5 大层级，16 种字号规格
- **Spacing Token** — 4px 基准，10 级间距
- **Radius Token** — 6 级圆角
- **Shadow Token** — 6 级阴影（含 AI 专用）
- **Icon 规范** — 图标库选择、尺寸、颜色、禁用规则
- **Animation Token** — 5 级时长、4 种缓动曲线、4 个命名动画
- **Responsive Breakpoints** — 7 端口响应式策略
- **Ant Design 6 主题映射** — Token 到 AntD ThemeConfig 的完整映射
- **Token 使用规则** — 强制规范与迁移指南
- **Token 速查表** — 一页式完整参考

### 1.4 文档约定

- 所有 HEX 值均来自实际代码库（`design-tokens.css` + `styles.css` + `theme.ts`）
- OKLCH 值为 HEX 的精确转换，用于未来 P3 广色域适配
- 标注 `[已知问题]` 的项目为当前代码库中存在的违规用法，需在迁移中修复

---

## 2. Color Token 完整规范

### 2.1 品牌色系 (Primary)

品牌主色 `#5B4FD6` 是演立方视觉识别的核心。所有主操作按钮、选中态、品牌强调元素均使用此色系。

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-primary` | `#5B4FD6` | `oklch(0.52 0.199 280.9)` | 品牌主色 | 主按钮、选中态、链接强调、Logo |
| `--yl-primary-hover` | `#4A3FC5` | `oklch(0.467 0.2 279)` | 主色悬停 | 主按钮 hover 态、可点击元素 hover |
| `--yl-primary-active` | `#3D33B3` | `oklch(0.423 0.193 277.7)` | 主色激活 | 主按钮 active/pressed 态 |
| `--yl-primary-subtle` | `#F0EEFF` | `oklch(0.956 0.023 291.4)` | 主色浅底 | 选中行背景、标签浅底、信息高亮区 |
| `--yl-primary-foreground` | `#FFFFFF` | `oklch(1 0 0)` | 主色前景 | 主按钮文字、主色背景上的文字 |

**使用规则**:
- 主色 `#5B4FD6` 仅用于**品牌级强调**，不应大面积铺底
- `--yl-primary-subtle` `#F0EEFF` 用于浅色背景时，必须搭配 `--yl-text-primary` 文字以保证对比度
- hover/active 态必须严格按上述层级递进，不可跳级使用
- **严禁使用旧色** `#6E59F5`、`#7c3aed` — 见 [2.9 颜色使用禁忌](#29-颜色使用禁忌)

### 2.2 背景层级 (Background)

背景色定义了页面的视觉纵深，从最底层到最顶层共 5 个层级。

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-bg-page` | `#F7F8FA` | `oklch(0.979 0.003 264.5)` | 页面底色 | 最底层背景，body / layout 容器 |
| `--yl-bg-surface` | `#FFFFFF` | `oklch(1 0 0)` | 表面色 | 卡片、面板、表格的默认背景 |
| `--yl-bg-elevated` | `#FFFFFF` | `oklch(1 0 0)` | 悬浮表面 | 弹出层、Dropdown、Popover 的背景 |
| `--yl-bg-sunken` | `#F0F1F4` | `oklch(0.958 0.004 271.4)` | 凹陷区域 | 输入框内底、禁用态背景、嵌套区域 |
| `--yl-bg-ai` | `#FAFAFF` | `oklch(0.987 0.007 286.3)` | AI 专属底 | AI 对话气泡背景、AI 面板底色 |

**层级关系**:
```
page (#F7F8FA)        ← 最底层，全局页面背景
  └─ surface (#FFFFFF)   ← 卡片/面板，比 page 亮一层
       └─ elevated (#FFFFFF)  ← 弹出层，浮于 surface 之上（靠阴影区分）
  └─ sunken (#F0F1F4)   ← 凹陷区域，比 page 暗一层
  └─ ai (#FAFAFF)       ← AI 专属，带极淡紫色温
```

**使用规则**:
- `--yl-bg-elevated` 与 `--yl-bg-surface` HEX 相同，但语义不同 — elevated **必须搭配阴影**使用（至少 `--yl-shadow-md`）
- `--yl-bg-ai` 仅用于 AI 相关界面元素，不可用于普通业务卡片
- **[已知问题]** 部分页面使用硬编码 `#FFF5F5`（错误背景）、`#FFF9F0`（警告背景）、`#F5F8FF`（信息背景）代替语义 Token — 应替换为 `--yl-error-bg`、`--yl-warning-bg`、`--yl-info-bg`

### 2.3 文字层级 (Text)

文字色系定义了信息的优先级，从最重要到最次要共 5 个层级。

| Token名 | HEX值 | oklch值 | 用途 | 对比度 (vs 白底) | 使用场景 |
|---------|-------|---------|------|------------------|----------|
| `--yl-text-primary` | `#1A1D2E` | `oklch(0.236 0.033 275.9)` | 主要文字 | 15.3:1 (AAA) | 标题、正文主体、表格主数据 |
| `--yl-text-secondary` | `#5B6178` | `oklch(0.496 0.038 273.5)` | 次要文字 | 6.2:1 (AA+) | 辅助说明、表格次要数据、标签文字 |
| `--yl-text-tertiary` | `#8B92A8` | `oklch(0.662 0.034 271.5)` | 提示文字 | 3.5:1 (AA Large) | 占位提示的补充说明、时间戳 |
| `--yl-text-placeholder` | `#B0B7C8` | `oklch(0.779 0.025 267.9)` | 占位符 | 2.3:1 (非文本) | Input placeholder、禁用态文字 |
| `--yl-text-on-primary` | `#FFFFFF` | `oklch(1 0 0)` | 主色上文字 | 4.6:1 (AA) | 主按钮文字、品牌色背景上的文字 |

**对比度说明**:
- 对比度依据 WCAG 2.1 标准计算（vs `#FFFFFF` 白底）
- `--yl-text-primary` 和 `--yl-text-secondary` 满足 AAA 标准，可用于正文
- `--yl-text-tertiary` 满足 AA Large 标准（18px+ 或 14px Bold），仅用于辅助文字
- `--yl-text-placeholder` 对比度较低，**仅用于非功能性占位文字**，不可用于需要阅读的内容

**使用规则**:
- 同一视图内，文字层级**最多使用 3 级**（通常为 primary + secondary + tertiary）
- `--yl-text-on-primary` 仅在背景为 `--yl-primary` 时使用，不可用于其他深色背景
- 禁止用 `opacity` 降级文字颜色 — 必须使用对应的 Token

### 2.4 边框层级 (Border)

边框色系定义了元素间的分隔方式，从最柔和到最强烈共 4 个层级。

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-border-subtle` | `#F0F1F4` | `oklch(0.958 0.004 271.4)` | 极弱分隔 | 卡片内部分区、表格行分隔线 |
| `--yl-border-default` | `#E5E7EF` | `oklch(0.929 0.011 274.9)` | 默认边框 | 卡片外边框、Input/Select 边框、分割线 |
| `--yl-border-strong` | `#C8CAD4` | `oklch(0.84 0.014 277)` | 强调边框 | hover 态边框、表单聚焦边框前态 |
| `--yl-border-ai` | `#E0DDFF` | `oklch(0.91 0.046 289.5)` | AI 专属边框 | AI 面板边框、AI 对话区域分隔 |

**使用规则**:
- 表格行分隔优先使用 `--yl-border-subtle`，卡片外边框使用 `--yl-border-default`
- `--yl-border-strong` 用于需要强调的边界，不可滥用
- `--yl-border-ai` 仅用于 AI 相关组件，与 `--yl-bg-ai` 搭配使用

### 2.5 语义状态色 (Semantic Status)

每种语义状态色包含三件套：主色 + 背景色 + 边框色，确保视觉一致性。

#### 2.5.1 Success (成功)

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-success` | `#00875A` | `oklch(0.551 0.122 161.2)` | 成功主色 | 成功图标、成功文字、已成交状态 |
| `--yl-success-bg` | `#E6F7F0` | `oklch(0.962 0.02 169.3)` | 成功背景 | 成功提示横幅、成功标签底色 |
| `--yl-success-border` | `#B5E8D5` | `oklch(0.89 0.059 170.2)` | 成功边框 | 成功提示横幅边框 |

#### 2.5.2 Warning (警告)

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-warning` | `#B45309` | `oklch(0.555 0.146 49)` | 警告主色 | 警告图标、警告文字、沟通中状态 |
| `--yl-warning-bg` | `#FEF7EC` | `oklch(0.979 0.016 79.4)` | 警告背景 | 警告提示横幅、警告标签底色 |
| `--yl-warning-border` | `#FDE4B9` | `oklch(0.929 0.062 81.2)` | 警告边框 | 警告提示横幅边框 |

#### 2.5.3 Error (错误)

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-error` | `#C53030` | `oklch(0.544 0.186 26)` | 错误主色 | 错误图标、错误文字、已丢单状态 |
| `--yl-error-bg` | `#FEF0F0` | `oklch(0.966 0.015 17.4)` | 错误背景 | 错误提示横幅、错误标签底色 |
| `--yl-error-border` | `#FDBDBD` | `oklch(0.857 0.074 18.7)` | 错误边框 | 错误提示横幅边框 |

#### 2.5.4 Info (信息)

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-info` | `#2563EB` | `oklch(0.546 0.215 262.9)` | 信息主色 | 信息图标、信息文字、新需求状态 |
| `--yl-info-bg` | `#EFF4FF` | `oklch(0.967 0.016 266.3)` | 信息背景 | 信息提示横幅、信息标签底色 |
| `--yl-info-border` | `#BFD5FF` | `oklch(0.871 0.063 263.3)` | 信息边框 | 信息提示横幅边框 |

**三件套使用规则**:
- 状态横幅 (Alert/Banner) **必须三件套同时使用**：`bg` 做底 + `border` 做边框 + 主色做图标/文字
- 状态标签 (Tag) 使用主色 + `--yl-primary-foreground` 或主色 + 对应 `bg`
- **[已知问题]** `PriorityTag` / `ConfidenceTag` 组件使用 AntD 命名色 (`"red"`, `"orange"`, `"default"`) — 必须替换为 V4.7 HEX Token

### 2.6 管道状态色 (Pipeline Status)

管道状态色映射商机从新建到结束的完整生命周期，共 7 个状态。

| 状态 | Token名 | HEX值 | oklch值 | 使用场景 |
|------|---------|-------|---------|----------|
| 新需求 | `pipeline-new` | `#2563EB` | `oklch(0.546 0.215 262.9)` | 商机刚创建，待确认 |
| 进行中 | `pipeline-progress` | `#7C6FF7` | `oklch(0.623 0.196 283.4)` | 需求确认，商机推进中 |
| 方案中 | `pipeline-proposal` | `#0891B2` | `oklch(0.609 0.111 221.7)` | 正在制作/已发送方案 |
| 谈判中 | `pipeline-negotiate` | `#B45309` | `oklch(0.555 0.146 49)` | 方案已发送，客户沟通中 |
| 已成交 | `pipeline-won` | `#00875A` | `oklch(0.551 0.122 161.2)` | 商机成功转化 |
| 已丢单 | `pipeline-lost` | `#C53030` | `oklch(0.544 0.186 26)` | 商机失败 |
| 已结束 | `pipeline-done` | `#64748B` | `oklch(0.554 0.041 257.4)` | 商机流程结束（非成交/丢单） |

**状态色映射表 (theme.ts `statusColorMap`)**:

| 中文状态 | HEX值 | 对应管道状态 |
|----------|-------|-------------|
| 新需求 | `#2563EB` | new |
| 需求确认 | `#0891B2` | proposal |
| 有效商机 | `#7C6FF7` | progress |
| 已报价 | `#0891B2` | proposal |
| 沟通中 | `#B45309` | negotiate |
| 谈判中 | `#B45309` | negotiate |
| 等待客户确认 | `#D4A017` | (gold) |
| 已成交 | `#00875A` | won |
| 已结束 | `#64748B` | done |
| 已丢单 | `#C53030` | lost |

**提案状态色 (Proposal Status)**:

| 状态 | HEX值 | 使用场景 |
|------|-------|----------|
| draft (草稿) | `#64748B` | 提案未提交 |
| internal_review (内部审核) | `#2563EB` | 提案审核中 |
| shared (已发送) | `#7C6FF7` | 提案已发给客户 |
| viewed (已查看) | `#0891B2` | 客户已打开提案 |
| downloaded (已下载) | `#0EA5E9` | 客户已下载提案 |
| modified_by_client (客户修改) | `#B45309` | 客户修改了提案 |
| revised (已修订) | `#D4A017` | 提案已修订 |
| approved (已批准) | `#00875A` | 提案已通过 |
| converted_to_order (转订单) | `#00875A` | 提案转为订单 |
| lost (已丢失) | `#C53030` | 提案失败 |

**方案层级色 (Tier)**:

| 层级 | HEX值 | 使用场景 |
|------|-------|----------|
| 经济方案 | `#7C6FF7` | 基础方案 |
| 推荐方案 | `#0EA5E9` | 推荐方案 |
| 升级方案 | `#D4A017` | 高级方案 |

**角色色 (Role)**:

| 角色 | HEX值 | 使用场景 |
|------|-------|----------|
| 超级管理员 | `#7C6FF7` | 管理员标签 |
| 运营主管 | `#0EA5E9` | 主管标签 |
| 销售运营 | `#2563EB` | 运营标签 |
| 财务 | `#D4A017` | 财务标签 |
| 只读 | `#64748B` | 只读角色标签 |

**使用规则**:
- 管道状态色通过 `theme.ts` 中的 `statusColorMap` 统一映射，**禁止在组件中硬编码状态色**
- Tag 组件的 `color` 属性应直接传入 HEX 值，不使用 AntD 预设色名
- 提案状态色与管道状态色可能重复（如 `#00875A` 同时用于已成交和已批准），这是设计意图 — 相同语义使用相同颜色

### 2.7 AI 专属色系 (AI Exclusive)

AI 专属色系用于区分 AI 生成内容与人工操作内容，传达「智能」品牌特质。

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-ai-accent` | `#7C6FF7` | `oklch(0.623 0.196 283.4)` | AI 强调色 | AI 标签、AI 按钮、AI 生成内容标识 |
| `--yl-ai-glow` | `#A78BFA` | `oklch(0.709 0.159 293.5)` | AI 光晕色 | AI 思考动画光晕、AI 入口装饰光效 |
| `--yl-ai-thinking` | `#C4B5FD` | `oklch(0.811 0.101 293.6)` | AI 思考色 | AI 正在思考时的脉冲动画、加载指示器 |

**配套 Token**:
- `--yl-bg-ai` `#FAFAFF` — AI 区域背景
- `--yl-border-ai` `#E0DDFF` — AI 区域边框
- `--yl-shadow-ai` — AI 专属阴影（见 [Section 6](#6-shadow-token)）

**使用规则**:
- AI 专属色**仅用于 AI 相关功能区域**，不可用于普通业务操作
- `--yl-ai-accent` `#7C6FF7` 与管道状态 `pipeline-progress` `#7C6FF7` HEX 相同 — 这是设计意图，表示「AI 推进中」的语义延续
- `--yl-ai-glow` 和 `--yl-ai-thinking` 主要用于动画效果，不用于静态文字或背景
- AI 色系搭配 `--yl-shadow-ai` 阴影使用，形成「AI 光晕」效果

### 2.8 辅助色 (Gold & Chart)

#### 2.8.1 Gold (金色)

| Token名 | HEX值 | oklch值 | 用途 | 使用场景 |
|---------|-------|---------|------|----------|
| `--yl-gold` | `#D4A017` | `oklch(0.735 0.146 84.3)` | 金色强调 | 等待客户确认状态、升级方案标识、高级标签 |

#### 2.8.2 Chart (图表色)

图表色为数据可视化专用色板，共 5 色，按顺序使用。

| Token名 | HEX值 | oklch值 | 对应语义 | 使用场景 |
|---------|-------|---------|----------|----------|
| `chart-1` | `#5B4FD6` | `oklch(0.52 0.199 280.9)` | 品牌主色 | 第一数据系列、主指标 |
| `chart-2` | `#0891B2` | `oklch(0.609 0.111 221.7)` | 方案色 | 第二数据系列 |
| `chart-3` | `#2563EB` | `oklch(0.546 0.215 262.9)` | 信息色 | 第三数据系列 |
| `chart-4` | `#D4A017` | `oklch(0.735 0.146 84.3)` | 金色 | 第四数据系列 |
| `chart-5` | `#B45309` | `oklch(0.555 0.146 49)` | 警告色 | 第五数据系列 |

**使用规则**:
- 图表色按 `chart-1` → `chart-5` 顺序使用，不可跳色
- 图表色与语义色共用同一色板，确保全平台视觉一致
- 超过 5 个数据系列时，使用同色系不同明度的衍生色

### 2.9 颜色使用禁忌

#### 2.9.1 严禁使用的颜色

| 禁用颜色 | 原因 | 正确替代 |
|----------|------|----------|
| `#6E59F5` | V4.7 之前旧品牌色，色相偏紫红 | `--yl-primary` `#5B4FD6` |
| `#7c3aed` | Tailwind violet-600，饱和度过高 | `--yl-primary` `#5B4FD6` |
| AntD `"red"` | 命名色无法保证跨版本一致性 | `--yl-error` `#C53030` |
| AntD `"orange"` | 命名色无法保证跨版本一致性 | `--yl-warning` `#B45309` |
| AntD `"default"` | 命名色语义模糊 | `--yl-text-tertiary` `#8B92A8` |
| AntD `"blue"` | 命名色与品牌色冲突 | `--yl-info` `#2563EB` |
| AntD `"green"` | 命名色与 V4.7 语义色不一致 | `--yl-success` `#00875A` |

#### 2.9.2 严禁的硬编码值

| 硬编码值 | 出现位置 | 正确替代 |
|----------|----------|----------|
| `#FFF5F5` | 错误背景 | `--yl-error-bg` `#FEF0F0` |
| `#FFF9F0` | 警告背景 | `--yl-warning-bg` `#FEF7EC` |
| `#F5F8FF` | 信息背景 | `--yl-info-bg` `#EFF4FF` |
| `#6E59F5` | RequirementExtractPanel 进度条 | `--yl-primary` `#5B4FD6` |
| 任意 HEX 字面量 | 组件代码内 | 对应的 `--yl-*` Token |

#### 2.9.3 颜色使用红线

1. **组件代码中严禁出现 HEX 字面量** — 所有颜色必须通过 `var(--yl-*)` 或 Tailwind class 引用
2. **AntD 组件的 `color` 属性严禁使用预设色名** — 必须传入 V4.7 HEX Token
3. **禁止使用 `opacity` 调整颜色** — 必须使用对应的语义 Token（如用 `--yl-text-tertiary` 而非 `--yl-text-primary` + `opacity: 0.5`）
4. **禁止混用新旧品牌色** — 全平台统一使用 `#5B4FD6`

---

## 3. Typography Token 完整规范

### 3.1 字体族 (Font Family)

| Token名 | 值 | 用途 |
|---------|----|------|
| `--yl-font-sans` | `"PingFang SC", "Noto Sans SC", "Microsoft YaHei", -apple-system, "Segoe UI", Roboto, sans-serif` | 全局默认字体，覆盖中文 + 英文 + 系统回退 |
| `--yl-font-mono` | `"SF Mono", "JetBrains Mono", Consolas, monospace` | 代码、数字数据、等宽场景 |

**字体族设计说明**:
- **PingFang SC** (苹方) — macOS / iOS 首选中文字体，笔画清晰、现代感强
- **Noto Sans SC** (思源黑体) — 跨平台中文字体回退，Google 开源
- **Microsoft YaHei** (微软雅黑) — Windows 中文字体回退
- **-apple-system / Segoe UI / Roboto** — 各平台系统 UI 字体回退
- 优先级从左到右，确保在所有平台上都有最佳可用字体

**使用规则**:
- `--yl-font-sans` 为全局默认，通过 `body` 或 AntD `fontFamily` 全局设置
- `--yl-font-mono` 用于数字数据展示（金额、百分比）、代码块、等宽对齐场景
- 数字数据建议使用 `--yl-font-mono` + Numeric 字号层级（见 [3.2](#32-字号层级)）

### 3.2 字号层级 (Type Scale)

演立方字号体系分为 5 大层级：Display、Heading、Body、Caption、Numeric。

| 层级 | Token | 字号 | 字重 | 行高 | 使用场景 |
|------|-------|------|------|------|----------|
| Display | `display-lg` | 36px | 700 | 44px | 着陆页主标题、大型营销页 Hero 标题 |
| Display | `display-md` | 30px | 700 | 38px | 着陆页副标题、大型空状态标题 |
| Display | `display-sm` | 24px | 600 | 32px | 页面主标题（非 Dashboard）、对话框大标题 |
| Heading | `heading-1` | 22px | 600 | 30px | Dashboard 页面标题、模块大标题 |
| Heading | `heading-2` | 18px | 600 | 26px | 卡片标题、区域标题、抽屉标题 |
| Heading | `heading-3` | 16px | 600 | 24px | 小节标题、列表组标题、表单分组标题 |
| Heading | `heading-4` | 14px | 600 | 20px | 表单标签、表格列标题、卡片内小标题 |
| Body | `body-lg` | 16px | 400 | 26px | 大段正文、描述文字（仅内容密集页） |
| Body | `body-md` | 14px | 400 | 22px | 默认正文、表格内容、列表项、表单值 |
| Body | `body-sm` | 13px | 400 | 20px | 辅助文字、表格次要列、卡片描述 |
| Caption | `caption` | 12px | 400 | 18px | 标签文字、时间戳、脚注、帮助文本 |
| Caption | `caption-xs` | 11px | 400 | 16px | 角标、微小提示、Badge 文字 |
| Numeric | `numeric-lg` | 32px | 700 | 40px | 核心数据看板大数字、KPI 主指标 |
| Numeric | `numeric-md` | 24px | 600 | 32px | 次要数据看板数字、KPI 副指标 |
| Numeric | `numeric-sm` | 14px | 500 | 20px | 表格内数字、列表内数字、统计数字 |

### 3.3 行高与字重

#### 行高规则

| 文字类型 | 行高计算 | 说明 |
|----------|----------|------|
| 标题类 (Display/Heading) | 字号 + 8px | 紧凑行高，突出标题感 |
| 正文类 (Body) | 字号 + 8~12px | 舒适阅读行高 |
| 标注类 (Caption) | 字号 + 6px | 紧凑行高，节省空间 |
| 数字类 (Numeric) | 字号 + 8px | 与标题一致，突出数据感 |

#### 字重规则

| 字重值 | 语义 | 使用层级 |
|--------|------|----------|
| 700 (Bold) | 极强调 | Display-lg、Display-md、Numeric-lg |
| 600 (Semibold) | 强调 | Display-sm、Heading-1~4、Numeric-md |
| 500 (Medium) | 中等强调 | Numeric-sm |
| 400 (Regular) | 常规 | Body 全系列、Caption 全系列 |

**使用规则**:
- 字重仅使用 400 / 500 / 600 / 700 四档，**禁止使用 300 (Light) 和 900 (Black)**
- 同一视图内，字重对比不超过 3 档（通常为 400 + 600 + 700）
- 中文字体不使用 Italic（斜体），仅英文/数字可使用

### 3.4 使用场景对应表

| UI 元素 | 推荐字号层级 | 说明 |
|---------|-------------|------|
| Dashboard 页面标题 | `heading-1` 22px/600 | 每页顶部主标题 |
| 卡片标题 | `heading-2` 18px/600 | 卡片容器标题 |
| 表单分组标题 | `heading-3` 16px/600 | 表单内分组标题 |
| 表单标签 | `heading-4` 14px/600 | Input/Select 上方标签 |
| 表格列标题 | `heading-4` 14px/600 | 表头单元格 |
| 表格主数据 | `body-md` 14px/400 | 表格主体内容 |
| 表格次要数据 | `body-sm` 13px/400 | 辅助列、时间列 |
| 默认正文 | `body-md` 14px/400 | 页面默认文字大小 |
| 描述/辅助文字 | `body-sm` 13px/400 | 卡片描述、辅助说明 |
| 标签/Tag 文字 | `caption` 12px/400 | Tag、Badge 内文字 |
| 时间戳 | `caption` 12px/400 | 创建时间、更新时间 |
| 帮助文本 | `caption` 12px/400 | 表单下方提示 |
| KPI 主指标 | `numeric-lg` 32px/700 | 核心数据看板 |
| KPI 副指标 | `numeric-md` 24px/600 | 次要数据看板 |
| 表格内数字 | `numeric-sm` 14px/500 | 金额、百分比等 |
| 按钮文字 | `body-md` 14px/400 | 按钮默认文字 |
| 输入框文字 | `body-md` 14px/400 | Input/Select 内文字 |
| 占位符 | `body-md` 14px/400 | Input placeholder |

---

## 4. Spacing Token

### 4.1 间距体系

演立方采用 **4px 基准** 的间距系统，共 10 级。

| Token | 值 | 用途 |
|-------|----|------|
| `--yl-space-1` | 4px | 最小间距 — 图标与文字间距、Tag 内边距微调 |
| `--yl-space-2` | 8px | 紧凑间距 — 组件内元素间距、Badge 内边距 |
| `--yl-space-3` | 12px | 组件间距 — 表单项间距、列表项间距 |
| `--yl-space-4` | 16px | 标准间距 — 卡片内边距、按钮组间距 |
| `--yl-space-5` | 20px | 宽松间距 — 卡片间距、表单分组间距 |
| `--yl-space-6` | 24px | 区块间距 — 模块间距、侧边栏内边距 |
| `--yl-space-8` | 32px | 大间距 — 页面区域间距、Drawer 内边距 |
| `--yl-space-10` | 40px | 超大间距 — 页面顶部/底部留白 |
| `--yl-space-12` | 48px | 区域间距 — 大型区块间距 |
| `--yl-space-16` | 64px | 最大间距 — 页面级垂直留白、Hero 区域间距 |

### 4.2 使用规则

#### 页面级间距

| 场景 | Token | 值 |
|------|-------|----|
| 页面内边距（左右） | `--yl-space-6` | 24px |
| 页面内边距（上下） | `--yl-space-6` | 24px |
| 页面顶部到标题 | `--yl-space-6` | 24px |
| 标题到内容区 | `--yl-space-5` | 20px |
| 区域间距（垂直） | `--yl-space-8` | 32px |

#### 卡片级间距

| 场景 | Token | 值 |
|------|-------|----|
| 卡片内边距 | `--yl-space-4` | 16px |
| 卡片标题到内容 | `--yl-space-4` | 16px |
| 卡片间距 | `--yl-space-5` | 20px |

#### 组件级间距

| 场景 | Token | 值 |
|------|-------|----|
| 表单项间距 | `--yl-space-3` | 12px |
| 按钮组间距 | `--yl-space-4` | 16px |
| 图标与文字间距 | `--yl-space-2` | 8px |
| Tag 内边距（水平） | `--yl-space-2` | 8px |
| Tag 内边距（垂直） | `--yl-space-1` | 4px |

#### 间距使用红线

1. **间距值必须是 4 的倍数** — 禁止使用 5px、7px、10px 等非基准值
2. **优先使用 Token** — 禁止在 CSS 中硬编码间距值（如 `padding: 16px` 应写为 `padding: var(--yl-space-4)`）
3. **AntD Space 组件的 `size` 属性** — 使用数字 `size={12}` 对应 `--yl-space-3`，**不要使用字符串** `size="var(--yl-space-3)"`（AntD 类型不支持）— 见 [10.3 已知问题](#103-已知问题与解决方案)

---

## 5. Radius Token

### 5.1 圆角体系

演立方圆角体系共 6 级，从直角到全圆。

| Token | 值 | 组件映射 |
|-------|----|----------|
| `--yl-radius-none` | 0px | 表格行、分割线容器（无圆角） |
| `--yl-radius-sm` | 4px | Tag、Badge、小标签 |
| `--yl-radius-md` | 8px | Input、Button、Select、Menu Item |
| `--yl-radius-lg` | 12px | Card、Dialog、Popover |
| `--yl-radius-xl` | 16px | Drawer、Modal、大型容器 |
| `--yl-radius-2xl` | 24px | AI 对话气泡、AI 消息卡片 |
| `--yl-radius-full` | 9999px | Avatar、Status Dot、Icon Button、圆形标签 |

### 5.2 组件圆角映射

| 组件 | Token | 值 | 说明 |
|------|-------|----|------|
| Tag / Badge | `--yl-radius-sm` | 4px | 小尺寸标签微圆角 |
| Button | `--yl-radius-md` | 8px | 按钮标准圆角 |
| Input | `--yl-radius-md` | 8px | 输入框标准圆角 |
| Select | `--yl-radius-md` | 8px | 选择器标准圆角 |
| Menu Item | `--yl-radius-md` | 8px | 菜单项圆角 |
| Card | `--yl-radius-lg` | 12px | 卡片大圆角 |
| Dialog / Popover | `--yl-radius-lg` | 12px | 弹出层圆角 |
| Drawer | `--yl-radius-xl` | 16px | 抽屉圆角 |
| Modal | `--yl-radius-xl` | 16px | 模态框圆角 |
| AI 对话气泡 | `--yl-radius-2xl` | 24px | AI 气泡超大圆角，区分 AI 元素 |
| Avatar | `--yl-radius-full` | 9999px | 头像全圆 |
| Status Dot | `--yl-radius-full` | 9999px | 状态点全圆 |
| Icon Button | `--yl-radius-full` | 9999px | 图标按钮全圆 |

### 5.3 使用规则

1. **圆角层级与视觉层级一致** — 越大的容器使用越大的圆角
2. **AI 元素使用最大圆角** `24px` — 这是 AI 专属视觉特征，与普通组件区分
3. **嵌套圆角递减** — 外层圆角 > 内层圆角（如 Card 12px 内部 Input 8px）
4. **禁止使用非标准圆角值** — 仅允许上述 7 个值（含 none）

---

## 6. Shadow Token

### 6.1 阴影体系

演立方阴影体系共 6 级，定义了元素的视觉纵深。

| Token | 值 | 层级 | 使用场景 |
|-------|----|------|----------|
| `--yl-shadow-xs` | `0 1px 2px rgba(26,29,46,0.04)` | z=1 | 极弱阴影 — 卡片默认态的微妙提升 |
| `--yl-shadow-sm` | `0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04)` | z=2 | 小阴影 — 卡片默认态、表格行悬浮 |
| `--yl-shadow-md` | `0 4px 6px rgba(26,29,46,0.05), 0 2px 4px rgba(26,29,46,0.04)` | z=3 | 中阴影 — 卡片 hover 态、Dropdown |
| `--yl-shadow-lg` | `0 10px 15px rgba(26,29,46,0.06), 0 4px 6px rgba(26,29,46,0.04)` | z=4 | 大阴影 — 高亮卡片、悬浮面板 |
| `--yl-shadow-xl` | `0 20px 25px rgba(26,29,46,0.08), 0 8px 10px rgba(26,29,46,0.04)` | z=5 | 超大阴影 — Modal、Drawer |
| `--yl-shadow-ai` | `0 0 0 1px rgba(91,79,214,0.15), 0 4px 12px rgba(91,79,214,0.10)` | AI 专属 | AI 阴影 — AI 面板、AI 对话区域 |

### 6.2 使用规则

| 场景 | Token | 说明 |
|------|-------|------|
| 卡片默认态 | `--yl-shadow-xs` 或 `--yl-shadow-sm` | 微妙提升，不抢视觉 |
| 卡片 hover 态 | `--yl-shadow-md` | 悬浮时加深，反馈可交互 |
| 高亮卡片（如推荐内容） | `--yl-shadow-lg` | 突出显示 |
| Dropdown / Popover | `--yl-shadow-md` | 弹出层默认 |
| Modal / Drawer | `--yl-shadow-xl` | 最高层级，全屏遮罩上方 |
| AI 面板 / AI 对话 | `--yl-shadow-ai` | AI 专属光晕阴影 |

**阴影设计说明**:
- 所有阴影的 RGBA 基色为 `rgba(26,29,46,...)` — 即 `--yl-secondary` `#1A1D2E`，确保阴影色温统一
- AI 阴影的 RGBA 基色为 `rgba(91,79,214,...)` — 即 `--yl-primary` `#5B4FD6`，形成紫色光晕
- 阴影均为双层叠加（主投影 + 接触面投影），模拟真实物理光照

**使用红线**:
1. **禁止使用单层阴影** — 所有阴影必须使用 Token 中定义的双层叠加值
2. **AI 阴影仅用于 AI 组件** — 普通组件使用 `xs` ~ `xl`
3. **阴影层级与圆角层级一致** — 大圆角配大阴影，小圆角配小阴影

---

## 7. Icon 规范

### 7.1 图标库选择

| 图标库 | 角色 | 说明 |
|--------|------|------|
| `@ant-design/icons` | 主图标库 | 覆盖 90%+ 场景，与 AntD 组件风格一致 |
| 自定义 SVG | 补充图标库 | 用于 AntD 未覆盖的演立方专属图标 |

### 7.2 图标尺寸

图标尺寸与文字层级对应，确保视觉对齐。

| 尺寸 | 对应文字层级 | 使用场景 |
|------|-------------|----------|
| 12px | `caption-xs` 11px | Badge 内图标、超小按钮图标 |
| 14px | `body-md` 14px | 按钮内图标、表格内图标、表单图标 |
| 16px | `heading-3` 16px | 导航图标、菜单图标、卡片标题图标 |
| 20px | `heading-1` 22px | 侧边栏导航图标、空状态图标 |
| 24px | `display-sm` 24px | 大型操作图标、页面级图标 |
| 32px | `numeric-lg` 32px | 空状态大图标、引导页图标 |

### 7.3 图标颜色规则

| 场景 | 颜色规则 | 说明 |
|------|----------|------|
| 默认 | 继承文字颜色 | `color: inherit` 或 `currentColor` |
| 强调 | 品牌色 `--yl-primary` | 主操作图标、选中态图标 |
| 语义 | 对应语义色 | 成功/警告/错误/信息图标 |
| AI 专属 | `--yl-ai-accent` | AI 功能入口图标 |
| 禁用 | `--yl-text-placeholder` | 禁用态图标 |

### 7.4 图标禁用规则

**严禁使用 Emoji 作为功能图标**。

当前代码库中存在以下违规用法，必须替换：

| 违规 Emoji | 使用位置 | 正确替代 |
|------------|----------|----------|
| 👥 | 客户/联系人相关 | `<TeamOutlined />` 或 `<UserOutlined />` |
| ⏱ | 时间/计时相关 | `<ClockCircleOutlined />` 或 `<FieldTimeOutlined />` |
| 📋 | 列表/复制相关 | `<UnorderedListOutlined />` 或 `<CopyOutlined />` |
| 🤖 | AI 相关 | `<RobotOutlined />` 或自定义 AI 图标 |

**禁用原因**:
1. Emoji 在不同操作系统上渲染样式不一致（Apple / Google / Microsoft 各有风格）
2. Emoji 无法继承文字颜色，无法适配主题
3. Emoji 无法精确控制尺寸，与文字基线对齐困难
4. 不符合专业 B2B 产品的视觉标准

### 7.5 必备图标集

#### 导航类图标

| 功能 | 推荐 AntD 图标 | 说明 |
|------|---------------|------|
| Dashboard 首页 | `DashboardOutlined` | 仪表盘 |
| 商机列表 | `FundOutlined` 或 `ProfileOutlined` | 商机管理 |
| 提案管理 | `FileTextOutlined` | 提案文档 |
| 客户管理 | `TeamOutlined` | 客户列表 |
| 数据分析 | `BarChartOutlined` 或 `LineChartOutlined` | 数据报表 |
| 系统设置 | `SettingOutlined` | 配置 |
| 用户中心 | `UserOutlined` | 个人信息 |

#### 操作类图标

| 功能 | 推荐 AntD 图标 | 说明 |
|------|---------------|------|
| 新增 | `PlusOutlined` | 创建操作 |
| 编辑 | `EditOutlined` | 修改操作 |
| 删除 | `DeleteOutlined` | 删除操作 |
| 搜索 | `SearchOutlined` | 搜索/查询 |
| 筛选 | `FilterOutlined` | 过滤 |
| 导出 | `DownloadOutlined` | 下载/导出 |
| 导入 | `UploadOutlined` | 上传/导入 |
| 刷新 | `ReloadOutlined` | 刷新数据 |
| 复制 | `CopyOutlined` | 复制内容 |
| 分享 | `ShareAltOutlined` | 分享提案 |

#### 状态类图标

| 功能 | 推荐 AntD 图标 | 颜色 |
|------|---------------|------|
| 成功 | `CheckCircleOutlined` | `--yl-success` |
| 警告 | `ExclamationCircleOutlined` | `--yl-warning` |
| 错误 | `CloseCircleOutlined` | `--yl-error` |
| 信息 | `InfoCircleOutlined` | `--yl-info` |
| 加载中 | `LoadingOutlined` | `--yl-primary` |
| 进行中 | `SyncOutlined` | `--yl-primary` |

#### 反馈类图标

| 功能 | 推荐 AntD 图标 | 说明 |
|------|---------------|------|
| 空状态 | `InboxOutlined` 或 `FolderOpenOutlined` | 无数据提示 |
| 网络错误 | `DisconnectOutlined` 或 `ApiOutlined` | 连接失败 |
| 权限不足 | `LockOutlined` 或 `StopOutlined` | 无权限 |
| 搜索无结果 | `SearchOutlined` (大尺寸) | 搜索为空 |

#### AI 类图标

| 功能 | 推荐 AntD 图标 / 自定义 | 说明 |
|------|------------------------|------|
| AI 助手入口 | `RobotOutlined` 或自定义 SVG | AI 功能入口 |
| AI 生成 | `ThunderboltOutlined` 或 `BulbOutlined` | AI 智能生成 |
| AI 分析 | `FundProjectionScreenOutlined` | AI 数据分析 |
| AI 对话 | `MessageOutlined` 或 `CommentOutlined` | AI 聊天 |
| AI 思考 | 自定义三点动画 (CSS) | AI 正在处理 |

---

## 8. Animation Token

### 8.1 时长体系 (Duration)

| Token | 值 | 用途 |
|-------|----|------|
| `--yl-duration-instant` | 0ms | 即时响应 — 无动画的状态切换 |
| `--yl-duration-fast` | 150ms | 快速反馈 — 按钮 hover/active、Toggle 切换 |
| `--yl-duration-normal` | 250ms | 标准动画 — Dropdown 展开、Tag 出现/消失 |
| `--yl-duration-slow` | 350ms | 慢速动画 — Drawer 滑入、Modal 淡入 |
| `--yl-duration-slower` | 500ms | 超慢动画 — 页面过渡、大型内容展开 |

### 8.2 缓动曲线 (Easing)

| Token | 值 | 用途 |
|-------|----|------|
| `--yl-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认缓动 — 大部分动画的标准曲线 |
| `--yl-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 加速曲线 — 元素退出/消失 |
| `--yl-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 减速曲线 — 元素进入/出现 |
| `--yl-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性曲线 — 微交互强调（如点赞、选中） |

### 8.3 命名动画 (Keyframes)

| 动画名 | Keyframes | duration | easing | 使用场景 |
|--------|-----------|----------|--------|----------|
| `yl-thinking-pulse` | AI 思考脉冲点动画 | 1500ms (infinite) | `ease-in-out` | AI 正在思考时的三点脉冲指示器 |
| `yl-fade-in` | AI 流式输出淡入 | 250ms | `--yl-ease-out` | AI 流式文本输出时的逐段淡入 |
| `yl-skeleton-pulse` | 骨架屏脉冲 | 2000ms (infinite) | `ease-in-out` | 数据加载中的骨架屏闪烁 |
| `yl-card-enter` | 卡片入场动画 | 350ms | `--yl-ease-out` | 列表/卡片渲染时的交错入场（staggered） |

### 8.4 使用规则

#### 交互反馈动画

| 交互类型 | duration | easing | 说明 |
|----------|----------|--------|------|
| 按钮 hover/active | 150ms | `--yl-ease-default` | 颜色/背景变化 |
| Toggle 切换 | 150ms | `--yl-ease-default` | 开关动画 |
| Dropdown 展开 | 250ms | `--yl-ease-out` | 弹出层展开 |
| Tag 出现/消失 | 250ms | `--yl-ease-out` / `--yl-ease-in` | 标签增删 |
| Drawer 滑入/滑出 | 350ms | `--yl-ease-out` / `--yl-ease-in` | 抽屉动画 |
| Modal 淡入/淡出 | 350ms | `--yl-ease-out` / `--yl-ease-in` | 模态框动画 |
| 页面过渡 | 500ms | `--yl-ease-out` | 路由切换 |
| 选中态弹性 | 250ms | `--yl-ease-spring` | 选中/收藏等微交互 |

#### AI 专属动画

| 动画 | 使用场景 | 说明 |
|------|----------|------|
| `yl-thinking-pulse` | AI 正在生成内容时 | 三点脉冲，1500ms 循环 |
| `yl-fade-in` | AI 流式输出文本时 | 每段文字 250ms 淡入 |
| `yl-skeleton-pulse` | AI 面板加载中 | 骨架屏 2000ms 循环 |
| `yl-card-enter` | AI 生成结果列表渲染 | 交错入场，stagger delay 50ms |

#### 动画使用红线

1. **动画时长不超过 500ms** — 超过 500ms 的动画会让用户感到迟钝
2. **循环动画仅用于加载态** — `yl-thinking-pulse` 和 `yl-skeleton-pulse` 仅在 AI 处理/数据加载时使用
3. **入场动画使用交错延迟** — `yl-card-enter` 配合 `animation-delay` 实现交错效果，建议 delay 50ms 递增
4. **尊重 `prefers-reduced-motion`** — 用户开启「减少动态效果」时，应禁用所有非必要动画

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Responsive Breakpoints

### 9.1 响应式端口定义

演立方 V4.7 定义 7 个响应式端口，覆盖从移动端到超宽屏的全场景。

| 端口 | 策略 | 断点 | 布局变化 |
|------|------|------|----------|
| Mobile S | 移动端竖屏（小） | `< 375px` | 单列布局，隐藏次要信息，底部 Tab 导航 |
| Mobile M | 移动端竖屏（标准） | `375px - 767px` | 单列布局，折叠面板，底部 Tab 导航 |
| Tablet | 平板端 | `768px - 1023px` | 双列布局，侧边栏可折叠，顶部导航 |
| Desktop S | 桌面端（小屏） | `1024px - 1279px` | 三列布局，固定侧边栏，内容区自适应 |
| Desktop M | 桌面端（标准） | `1280px - 1535px` | 三列布局，固定侧边栏，内容区最大宽度约束 |
| Desktop L | 桌面端（大屏） | `1536px - 1919px` | 多列布局，侧边栏展开，内容区最大宽度约束 |
| Desktop XL | 桌面端（超宽屏） | `>= 1920px` | 多列布局，侧边栏展开，内容区居中最大宽度约束 |

### 9.2 Tailwind 断点映射

演立方使用 Tailwind CSS 4.2，断点配置与上述端口对应：

| Tailwind 前缀 | 断点 | 对应端口 |
|---------------|------|----------|
| (默认) | `< 768px` | Mobile S / Mobile M |
| `sm:` | `>= 768px` | Tablet |
| `md:` | `>= 1024px` | Desktop S |
| `lg:` | `>= 1280px` | Desktop M |
| `xl:` | `>= 1536px` | Desktop L |
| `2xl:` | `>= 1920px` | Desktop XL |

### 9.3 布局变化规则

#### 侧边栏导航

| 端口 | 侧边栏行为 |
|------|-----------|
| Mobile S / Mobile M | 隐藏，使用底部 Tab + 抽屉式侧边栏 |
| Tablet | 可折叠（icon-only），点击展开为浮层 |
| Desktop S+ | 固定展示，可手动折叠为 icon-only 模式 |

#### 内容区栅格

| 端口 | 栅格列数 | 典型布局 |
|------|----------|----------|
| Mobile | 1 列 | 全宽卡片堆叠 |
| Tablet | 2 列 | 双列卡片网格 |
| Desktop S | 3 列 | 三列卡片网格 |
| Desktop M+ | 4 列 | 四列卡片网格（或 3 列 + 侧边信息面板） |

#### 表格

| 端口 | 表格行为 |
|------|----------|
| Mobile | 横向滚动，隐藏次要列，展开行查看详情 |
| Tablet | 横向滚动，保留主要列 |
| Desktop | 完整展示，无横向滚动（列数少时） |

---

## 10. Ant Design 6 主题映射

### 10.1 ThemeConfig 全局映射

演立方使用 Ant Design 6.5，通过 `theme.ts` 中的 `agentTheme` 配置全局主题。以下为 V4.7 Token 到 AntD ThemeConfig 的完整映射。

#### 基础色映射

| AntD Config 属性 | V4.7 Token | HEX值 | 说明 |
|------------------|-----------|-------|------|
| `colorPrimary` | `--yl-primary` | `#5B4FD6` | 品牌主色 |
| `colorInfo` | `--yl-info` | `#2563EB` | 信息色 |
| `colorSuccess` | `--yl-success` | `#00875A` | 成功色 |
| `colorWarning` | `--yl-warning` | `#B45309` | 警告色 |
| `colorError` | `--yl-error` | `#C53030` | 错误色 |
| `colorTextBase` | `--yl-text-primary` | `#1A1D2E` | 文字基色 |
| `colorBgLayout` | `--yl-bg-page` | `#F7F8FA` | 布局背景色 |

#### 基础配置

| AntD Config 属性 | 值 | 说明 |
|------------------|----|------|
| `borderRadius` | `8` | 全局圆角（对应 `--yl-radius-md`） |
| `fontFamily` | `"PingFang SC", "Noto Sans SC", "Microsoft YaHei", -apple-system, "Segoe UI", Roboto, sans-serif` | 全局字体族 |
| `fontSize` | `14` | 全局基础字号（对应 `body-md`） |

### 10.2 组件级覆盖 (Component Token Override)

| 组件 | 属性 | 值 | 对应 Token | 说明 |
|------|------|----|-----------|------|
| Button | `borderRadius` | 8 | `--yl-radius-md` | 按钮圆角 |
| Button | `controlHeight` | 40 | — | 按钮高度 40px |
| Card | `borderRadiusLG` | 12 | `--yl-radius-lg` | 卡片大圆角 |
| Input | `borderRadius` | 8 | `--yl-radius-md` | 输入框圆角 |
| Input | `controlHeight` | 40 | — | 输入框高度 40px |
| Select | `borderRadius` | 8 | `--yl-radius-md` | 选择器圆角 |
| Select | `controlHeight` | 40 | — | 选择器高度 40px |
| Tag | `borderRadiusSM` | 4 | `--yl-radius-sm` | 标签小圆角 |
| Menu | `itemBorderRadius` | 8 | `--yl-radius-md` | 菜单项圆角 |

#### 主题配置示例

```typescript
// theme.ts
import type { ThemeConfig } from 'antd';

export const agentTheme: ThemeConfig = {
  token: {
    colorPrimary: '#5B4FD6',
    colorInfo: '#2563EB',
    colorSuccess: '#00875A',
    colorWarning: '#B45309',
    colorError: '#C53030',
    colorTextBase: '#1A1D2E',
    colorBgLayout: '#F7F8FA',
    borderRadius: 8,
    fontFamily: '"PingFang SC","Noto Sans SC","Microsoft YaHei",-apple-system,"Segoe UI",Roboto,sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Menu: {
      itemBorderRadius: 8,
    },
  },
};

// 供应商端主题继承 agentTheme，使用相同 Token
export const supplierTheme: ThemeConfig = {
  ...agentTheme,
};
```

### 10.3 已知问题与解决方案

#### 问题 1: AntD Space `size` 属性类型

**问题描述**: AntD `Space` 组件的 `size` 属性类型为 `number | SizeType ('small' | 'middle' | 'large')`，不支持 CSS 变量字符串。部分代码使用 `size="var(--yl-space-3)"` 会导致 TypeScript 类型错误且运行时不生效。

**解决方案**: 使用数字映射到 Spacing Token。

| Token | 数值 | Space size 用法 |
|-------|------|-----------------|
| `--yl-space-1` | 4px | `size={4}` |
| `--yl-space-2` | 8px | `size={8}` |
| `--yl-space-3` | 12px | `size={12}` |
| `--yl-space-4` | 16px | `size={16}` |
| `--yl-space-5` | 20px | `size={20}` |
| `--yl-space-6` | 24px | `size={24}` |
| `--yl-space-8` | 32px | `size={32}` |

```tsx
// 正确
<Space size={12}>...</Space>  // 对应 --yl-space-3

// 错误 — 类型不匹配，运行时不生效
<Space size="var(--yl-space-3)">...</Space>
```

#### 问题 2: AntD Tag `color` 属性

**问题描述**: `PriorityTag` / `ConfidenceTag` 组件使用 AntD 预设色名（`"red"`, `"orange"`, `"default"`），这些色值不受 ThemeConfig 控制，与 V4.7 Token 体系不一致。

**解决方案**: 直接传入 V4.7 HEX Token 值。

```tsx
// 正确 — 使用 V4.7 HEX Token
<Tag color="#C53030">高优先级</Tag>     // --yl-error
<Tag color="#B45309">中优先级</Tag>     // --yl-warning
<Tag color="#8B92A8">低优先级</Tag>     // --yl-text-tertiary

// 错误 — 使用 AntD 预设色名
<Tag color="red">高优先级</Tag>
<Tag color="orange">中优先级</Tag>
<Tag color="default">低优先级</Tag>
```

#### 问题 3: RequirementExtractPanel 进度条颜色

**问题描述**: `RequirementExtractPanel` 组件的进度条使用硬编码 `#6E59F5`（旧品牌色），与 V4.7 品牌色 `#5B4FD6` 不一致。

**解决方案**: 替换为 `--yl-primary`。

```tsx
// 正确
<div style={{ backgroundColor: 'var(--yl-primary)' }} />

// 错误 — 使用旧品牌色
<div style={{ backgroundColor: '#6E59F5' }} />
```

#### 问题 4: 状态色映射

**问题描述**: 商机状态、提案状态、角色等需要动态着色的场景，颜色值分散在各组件中硬编码。

**解决方案**: 统一使用 `theme.ts` 中的 `statusColorMap`。

```typescript
// theme.ts 中已定义的映射
export const statusColorMap: Record<string, string> = {
  // 商机状态
  '新需求': '#2563EB',
  '需求确认': '#0891B2',
  '有效商机': '#7C6FF7',
  '已报价': '#0891B2',
  '沟通中': '#B45309',
  '谈判中': '#B45309',
  '等待客户确认': '#D4A017',
  '已成交': '#00875A',
  '已结束': '#64748B',
  '已丢单': '#C53030',
  // 提案状态
  'draft': '#64748B',
  'internal_review': '#2563EB',
  'shared': '#7C6FF7',
  'viewed': '#0891B2',
  'downloaded': '#0EA5E9',
  'modified_by_client': '#B45309',
  'revised': '#D4A017',
  'approved': '#00875A',
  'converted_to_order': '#00875A',
  'lost': '#C53030',
  // 方案层级
  '经济方案': '#7C6FF7',
  '推荐方案': '#0EA5E9',
  '升级方案': '#D4A017',
  // 角色
  '超级管理员': '#7C6FF7',
  '运营主管': '#0EA5E9',
  '销售运营': '#2563EB',
  '财务': '#D4A017',
  '只读': '#64748B',
};

// 组件中使用
import { statusColorMap } from '@/theme';
<Tag color={statusColorMap[status]}>{status}</Tag>
```

---

## 11. Token 使用规则

### 11.1 强制规范 (MUST)

#### CSS / 自定义样式

**必须使用 `var(--yl-*)` 引用 Token**:

```css
/* 正确 */
.card {
  background: var(--yl-bg-surface);
  border: 1px solid var(--yl-border-default);
  border-radius: var(--yl-radius-lg);
  padding: var(--yl-space-4);
  box-shadow: var(--yl-shadow-sm);
  color: var(--yl-text-primary);
}

/* 错误 — 硬编码值 */
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EF;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04);
  color: #1A1D2E;
}
```

#### JSX / Tailwind CSS

**必须使用 Tailwind class 或内联 `var()` 引用 Token**:

```tsx
// 正确 — Tailwind class（配置 Tailwind theme 引用 Token）
<div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-900" />

// 正确 — 内联 var() 引用
<div style={{ background: 'var(--yl-bg-surface)' }} />

// 错误 — 硬编码 HEX
<div style={{ background: '#FFFFFF' }} />
```

#### Tailwind 配置

Tailwind CSS 4.2 应配置为引用 V4.7 Token：

```css
/* styles.css — Tailwind 4 @theme 配置 */
@theme {
  --color-primary: var(--yl-primary);
  --color-primary-hover: var(--yl-primary-hover);
  --color-primary-active: var(--yl-primary-active);
  --color-primary-subtle: var(--yl-primary-subtle);
  
  --color-bg-page: var(--yl-bg-page);
  --color-bg-surface: var(--yl-bg-surface);
  --color-bg-elevated: var(--yl-bg-elevated);
  --color-bg-sunken: var(--yl-bg-sunken);
  --color-bg-ai: var(--yl-bg-ai);
  
  --color-text-primary: var(--yl-text-primary);
  --color-text-secondary: var(--yl-text-secondary);
  --color-text-tertiary: var(--yl-text-tertiary);
  --color-text-placeholder: var(--yl-text-placeholder);
  
  --color-border-default: var(--yl-border-default);
  --color-border-subtle: var(--yl-border-subtle);
  --color-border-strong: var(--yl-border-strong);
  --color-border-ai: var(--yl-border-ai);
  
  --radius-sm: var(--yl-radius-sm);
  --radius-md: var(--yl-radius-md);
  --radius-lg: var(--yl-radius-lg);
  --radius-xl: var(--yl-radius-xl);
  --radius-2xl: var(--yl-radius-2xl);
  
  --shadow-xs: var(--yl-shadow-xs);
  --shadow-sm: var(--yl-shadow-sm);
  --shadow-md: var(--yl-shadow-md);
  --shadow-lg: var(--yl-shadow-lg);
  --shadow-xl: var(--yl-shadow-xl);
  --shadow-ai: var(--yl-shadow-ai);
  
  --spacing-1: var(--yl-space-1);
  --spacing-2: var(--yl-space-2);
  --spacing-3: var(--yl-space-3);
  --spacing-4: var(--yl-space-4);
  --spacing-5: var(--yl-space-5);
  --spacing-6: var(--yl-space-6);
  --spacing-8: var(--yl-space-8);
  --spacing-10: var(--yl-space-10);
  --spacing-12: var(--yl-space-12);
  --spacing-16: var(--yl-space-16);
}
```

### 11.2 禁止规范 (MUST NOT)

| 禁止行为 | 说明 | 正确做法 |
|----------|------|----------|
| 组件代码中硬编码 HEX | 如 `color="#5B4FD6"` | 使用 `color="var(--yl-primary)"` 或 Token 常量 |
| 使用 AntD 预设色名 | 如 `<Tag color="red">` | 使用 HEX Token `<Tag color="#C53030">` |
| 使用旧品牌色 | `#6E59F5`、`#7c3aed` | 使用 `#5B4FD6` |
| 使用 `opacity` 调整颜色 | 如 `color: #1A1D2E; opacity: 0.5` | 使用对应层级 Token `color: var(--yl-text-tertiary)` |
| 使用 Emoji 作为功能图标 | 如 `👥`、`⏱`、`📋`、`🤖` | 使用 AntD Icon 组件 |
| 使用非标准间距值 | 如 `padding: 7px` | 使用 Token `padding: var(--yl-space-2)` |
| 使用非标准圆角值 | 如 `border-radius: 10px` | 使用 Token `border-radius: var(--yl-radius-md)` |
| 使用非标准阴影值 | 如 `box-shadow: 0 2px 4px rgba(0,0,0,0.1)` | 使用 Token `box-shadow: var(--yl-shadow-sm)` |

### 11.3 迁移指南

#### 步骤 1: 替换旧品牌色

全局搜索以下旧色值，替换为 `#5B4FD6` 或 `var(--yl-primary)`：

```
搜索: #6E59F5    →  替换: var(--yl-primary)  或  #5B4FD6
搜索: #7c3aed    →  替换: var(--yl-primary)  或  #5B4FD6
搜索: #7C3AED    →  替换: var(--yl-primary)  或  #5B4FD6
```

#### 步骤 2: 替换硬编码背景色

```
搜索: #FFF5F5    →  替换: var(--yl-error-bg)
搜索: #FFF9F0    →  替换: var(--yl-warning-bg)
搜索: #F5F8FF    →  替换: var(--yl-info-bg)
```

#### 步骤 3: 替换 AntD 预设色名

| 搜索 | 替换 |
|------|------|
| `color="red"` | `color="#C53030"` |
| `color="orange"` | `color="#B45309"` |
| `color="green"` | `color="#00875A"` |
| `color="blue"` | `color="#2563EB"` |
| `color="default"` | `color="#8B92A8"` |
| `color="purple"` | `color="#7C6FF7"` |

#### 步骤 4: 替换 Emoji 图标

| 搜索 | 替换 |
|------|------|
| `👥` | `<TeamOutlined />` |
| `⏱` | `<ClockCircleOutlined />` |
| `📋` | `<UnorderedListOutlined />` |
| `🤖` | `<RobotOutlined />` |

#### 步骤 5: 替换 Space size 字符串

| 搜索 | 替换 |
|------|------|
| `size="var(--yl-space-1)"` | `size={4}` |
| `size="var(--yl-space-2)"` | `size={8}` |
| `size="var(--yl-space-3)"` | `size={12}` |
| `size="var(--yl-space-4)"` | `size={16}` |

---

## 12. Token 速查表

### 12.1 Color Token 速查

| Token | HEX | oklch | 分类 |
|-------|-----|-------|------|
| `--yl-primary` | `#5B4FD6` | `oklch(0.52 0.199 280.9)` | 品牌色 |
| `--yl-primary-hover` | `#4A3FC5` | `oklch(0.467 0.2 279)` | 品牌色 |
| `--yl-primary-active` | `#3D33B3` | `oklch(0.423 0.193 277.7)` | 品牌色 |
| `--yl-primary-subtle` | `#F0EEFF` | `oklch(0.956 0.023 291.4)` | 品牌色 |
| `--yl-primary-foreground` | `#FFFFFF` | `oklch(1 0 0)` | 品牌色 |
| `--yl-secondary` | `#1A1D2E` | `oklch(0.236 0.033 275.9)` | 辅色 |
| `--yl-secondary-light` | `#F5F6FA` | `oklch(0.974 0.005 275)` | 辅色 |
| `--yl-bg-page` | `#F7F8FA` | `oklch(0.979 0.003 264.5)` | 背景 |
| `--yl-bg-surface` | `#FFFFFF` | `oklch(1 0 0)` | 背景 |
| `--yl-bg-elevated` | `#FFFFFF` | `oklch(1 0 0)` | 背景 |
| `--yl-bg-sunken` | `#F0F1F4` | `oklch(0.958 0.004 271.4)` | 背景 |
| `--yl-bg-ai` | `#FAFAFF` | `oklch(0.987 0.007 286.3)` | 背景 |
| `--yl-border-default` | `#E5E7EF` | `oklch(0.929 0.011 274.9)` | 边框 |
| `--yl-border-subtle` | `#F0F1F4` | `oklch(0.958 0.004 271.4)` | 边框 |
| `--yl-border-strong` | `#C8CAD4` | `oklch(0.84 0.014 277)` | 边框 |
| `--yl-border-ai` | `#E0DDFF` | `oklch(0.91 0.046 289.5)` | 边框 |
| `--yl-text-primary` | `#1A1D2E` | `oklch(0.236 0.033 275.9)` | 文字 |
| `--yl-text-secondary` | `#5B6178` | `oklch(0.496 0.038 273.5)` | 文字 |
| `--yl-text-tertiary` | `#8B92A8` | `oklch(0.662 0.034 271.5)` | 文字 |
| `--yl-text-placeholder` | `#B0B7C8` | `oklch(0.779 0.025 267.9)` | 文字 |
| `--yl-text-on-primary` | `#FFFFFF` | `oklch(1 0 0)` | 文字 |
| `--yl-success` | `#00875A` | `oklch(0.551 0.122 161.2)` | 语义 |
| `--yl-success-bg` | `#E6F7F0` | `oklch(0.962 0.02 169.3)` | 语义 |
| `--yl-success-border` | `#B5E8D5` | `oklch(0.89 0.059 170.2)` | 语义 |
| `--yl-warning` | `#B45309` | `oklch(0.555 0.146 49)` | 语义 |
| `--yl-warning-bg` | `#FEF7EC` | `oklch(0.979 0.016 79.4)` | 语义 |
| `--yl-warning-border` | `#FDE4B9` | `oklch(0.929 0.062 81.2)` | 语义 |
| `--yl-error` | `#C53030` | `oklch(0.544 0.186 26)` | 语义 |
| `--yl-error-bg` | `#FEF0F0` | `oklch(0.966 0.015 17.4)` | 语义 |
| `--yl-error-border` | `#FDBDBD` | `oklch(0.857 0.074 18.7)` | 语义 |
| `--yl-info` | `#2563EB` | `oklch(0.546 0.215 262.9)` | 语义 |
| `--yl-info-bg` | `#EFF4FF` | `oklch(0.967 0.016 266.3)` | 语义 |
| `--yl-info-border` | `#BFD5FF` | `oklch(0.871 0.063 263.3)` | 语义 |
| `--yl-ai-accent` | `#7C6FF7` | `oklch(0.623 0.196 283.4)` | AI |
| `--yl-ai-glow` | `#A78BFA` | `oklch(0.709 0.159 293.5)` | AI |
| `--yl-ai-thinking` | `#C4B5FD` | `oklch(0.811 0.101 293.6)` | AI |
| `--yl-gold` | `#D4A017` | `oklch(0.735 0.146 84.3)` | 辅助 |
| chart-1 | `#5B4FD6` | `oklch(0.52 0.199 280.9)` | 图表 |
| chart-2 | `#0891B2` | `oklch(0.609 0.111 221.7)` | 图表 |
| chart-3 | `#2563EB` | `oklch(0.546 0.215 262.9)` | 图表 |
| chart-4 | `#D4A017` | `oklch(0.735 0.146 84.3)` | 图表 |
| chart-5 | `#B45309` | `oklch(0.555 0.146 49)` | 图表 |

### 12.2 Typography Token 速查

| 层级 | Token | 字号 | 字重 | 行高 |
|------|-------|------|------|------|
| Display | `display-lg` | 36px | 700 | 44px |
| Display | `display-md` | 30px | 700 | 38px |
| Display | `display-sm` | 24px | 600 | 32px |
| Heading | `heading-1` | 22px | 600 | 30px |
| Heading | `heading-2` | 18px | 600 | 26px |
| Heading | `heading-3` | 16px | 600 | 24px |
| Heading | `heading-4` | 14px | 600 | 20px |
| Body | `body-lg` | 16px | 400 | 26px |
| Body | `body-md` | 14px | 400 | 22px |
| Body | `body-sm` | 13px | 400 | 20px |
| Caption | `caption` | 12px | 400 | 18px |
| Caption | `caption-xs` | 11px | 400 | 16px |
| Numeric | `numeric-lg` | 32px | 700 | 40px |
| Numeric | `numeric-md` | 24px | 600 | 32px |
| Numeric | `numeric-sm` | 14px | 500 | 20px |

### 12.3 Spacing Token 速查

| Token | 值 | 用途 |
|-------|----|------|
| `--yl-space-1` | 4px | 最小间距 |
| `--yl-space-2` | 8px | 紧凑间距 |
| `--yl-space-3` | 12px | 组件间距 |
| `--yl-space-4` | 16px | 标准间距 |
| `--yl-space-5` | 20px | 宽松间距 |
| `--yl-space-6` | 24px | 区块间距 |
| `--yl-space-8` | 32px | 大间距 |
| `--yl-space-10` | 40px | 超大间距 |
| `--yl-space-12` | 48px | 区域间距 |
| `--yl-space-16` | 64px | 最大间距 |

### 12.4 Radius Token 速查

| Token | 值 | 组件映射 |
|-------|----|----------|
| `--yl-radius-sm` | 4px | Tag / Badge |
| `--yl-radius-md` | 8px | Button / Input / Select / Menu Item |
| `--yl-radius-lg` | 12px | Card / Dialog / Popover |
| `--yl-radius-xl` | 16px | Drawer / Modal |
| `--yl-radius-2xl` | 24px | AI 对话气泡 |
| `--yl-radius-full` | 9999px | Avatar / Status Dot / Icon Button |

### 12.5 Shadow Token 速查

| Token | 值 | 场景 |
|-------|----|------|
| `--yl-shadow-xs` | `0 1px 2px rgba(26,29,46,0.04)` | 卡片默认态 |
| `--yl-shadow-sm` | `0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04)` | 卡片默认/表格 hover |
| `--yl-shadow-md` | `0 4px 6px rgba(26,29,46,0.05), 0 2px 4px rgba(26,29,46,0.04)` | 卡片 hover / Dropdown |
| `--yl-shadow-lg` | `0 10px 15px rgba(26,29,46,0.06), 0 4px 6px rgba(26,29,46,0.04)` | 高亮卡片 |
| `--yl-shadow-xl` | `0 20px 25px rgba(26,29,46,0.08), 0 8px 10px rgba(26,29,46,0.04)` | Modal / Drawer |
| `--yl-shadow-ai` | `0 0 0 1px rgba(91,79,214,0.15), 0 4px 12px rgba(91,79,214,0.10)` | AI 元素 |

### 12.6 Animation Token 速查

| Token / 动画名 | 值 / duration | easing | 场景 |
|----------------|---------------|--------|------|
| `--yl-duration-instant` | 0ms | — | 即时响应 |
| `--yl-duration-fast` | 150ms | `--yl-ease-default` | 按钮 hover |
| `--yl-duration-normal` | 250ms | `--yl-ease-out` | Dropdown |
| `--yl-duration-slow` | 350ms | `--yl-ease-out` | Drawer |
| `--yl-duration-slower` | 500ms | `--yl-ease-out` | 页面过渡 |
| `--yl-ease-default` | `cubic-bezier(0.4,0,0.2,1)` | — | 默认缓动 |
| `--yl-ease-in` | `cubic-bezier(0.4,0,1,1)` | — | 元素退出 |
| `--yl-ease-out` | `cubic-bezier(0,0,0.2,1)` | — | 元素进入 |
| `--yl-ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | — | 弹性微交互 |
| `yl-thinking-pulse` | 1500ms | ease-in-out | AI 思考脉冲 |
| `yl-fade-in` | 250ms | `--yl-ease-out` | AI 流式淡入 |
| `yl-skeleton-pulse` | 2000ms | ease-in-out | 骨架屏 |
| `yl-card-enter` | 350ms | `--yl-ease-out` | 卡片交错入场 |

### 12.7 AntD 主题速查

| AntD 属性 | 值 | 对应 Token |
|-----------|----|-----------|
| `colorPrimary` | `#5B4FD6` | `--yl-primary` |
| `colorInfo` | `#2563EB` | `--yl-info` |
| `colorSuccess` | `#00875A` | `--yl-success` |
| `colorWarning` | `#B45309` | `--yl-warning` |
| `colorError` | `#C53030` | `--yl-error` |
| `colorTextBase` | `#1A1D2E` | `--yl-text-primary` |
| `colorBgLayout` | `#F7F8FA` | `--yl-bg-page` |
| `borderRadius` | 8 | `--yl-radius-md` |
| `fontSize` | 14 | `body-md` |
| Button.borderRadius | 8 | `--yl-radius-md` |
| Button.controlHeight | 40 | — |
| Card.borderRadiusLG | 12 | `--yl-radius-lg` |
| Input.borderRadius | 8 | `--yl-radius-md` |
| Input.controlHeight | 40 | — |
| Select.borderRadius | 8 | `--yl-radius-md` |
| Select.controlHeight | 40 | — |
| Tag.borderRadiusSM | 4 | `--yl-radius-sm` |
| Menu.itemBorderRadius | 8 | `--yl-radius-md` |

---

> **文档结束**  
> 本文档为演立方 V4.7 Design System 完整规范，所有 Token 值均来自实际代码库。  
> 如需修改 Token，请先更新 `design-tokens.css` / `styles.css` / `theme.ts`，再同步更新本文档。  
> 品牌色严禁使用旧色 `#6E59F5` / `#7c3aed`，全平台统一使用 `#5B4FD6`。
