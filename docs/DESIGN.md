# 演立方 V4.7 — UI/UX 设计治理事实源

> **这是设计系统的唯一事实源。所有前端 Agent 必须先读本文件。**
>
> 完整 Design System：`V4.7_Design_System_Final.md`（豪哥确认版）  
> 前端编码规范：`codebase/.hermes.md`（Token 合规要求）  
> 本文件聚焦：视觉定位 + 设计护栏 + 防漂移机制

---

## 1. 产品视觉定位

| 维度 | 描述 |
|:---|:---|
| 品牌气质 | 专业、可信、智能、精准、从容 |
| 用户感受 | 这是一个懂行业的 AI 工具，不是花哨的娱乐产品 |
| 视觉关键词 | 沉稳、克制、系统感、AI 智能 |
| **禁止视觉风格** | 电商风（大红大紫促销）、娱乐风（霓虹渐变动效）、玩具风（过于卡通圆润） |
| 桌面端策略 | 桌面优先，三栏/四栏布局，信息密度中高 |
| 移动端策略 | 移动优先，极简任务流，信息密度低 |

### 品牌色

**主色：`#5B4FD6`（沉稳紫）**

淘汰色（严禁使用）：
- `#6E59F5` — Lovable 初始色
- `#7c3aed` — 旧 V4.6 主色

---

## 2. Design System 速查

> 完整规范见 `V4.7_Design_System_Final.md`（471行）。以下为高频 Token。

### 2.1 Color Token（高频）

| Token | 值 | 场景 |
|:---|:---|:---|
| `--color-primary` | `#5B4FD6` | 品牌主色（按钮/链接/强调） |
| `--color-primary-hover` | `#4A3FC5` | 悬停态 |
| `--color-primary-subtle` | `#F0EEFF` | 选中态/AI区域背景 |
| `--color-bg-page` | `#F7F8FA` | 页面底层背景 |
| `--color-bg-surface` | `#FFFFFF` | 卡片/面板/弹窗 |
| `--color-bg-ai` | `#FAFAFF` | AI内容专属背景 |
| `--color-border-default` | `#E5E7EF` | 默认边框 |
| `--color-border-ai` | `#E0DDFF` | AI区域边框 |
| `--color-text-primary` | `#1A1D2E` | 正文 |
| `--color-text-secondary` | `#5B6178` | 次要说明 |
| `--color-text-tertiary` | `#8B92A8` | 辅助/占位 |

### 2.2 Status Color

| 状态 | Token | 色值 |
|:---|:---|:---|
| 新线索 | `--color-status-new` | `#2563EB` |
| 沟通中 | `--color-status-progress` | `#7C6FF7` |
| 已方案/报价 | `--color-status-proposal` | `#0891B2` |
| 谈判中 | `--color-status-negotiate` | `#B45309` |
| 已成交 | `--color-status-won` | `#00875A` |
| 已丢单 | `--color-status-lost` | `#C53030` |
| 已归档 | `--color-status-done` | `#64748B` |

### 2.3 Typography Token（唯一可用字号）

| Token | 值 | 场景 |
|:---|:---|:---|
| `--text-display-lg` | 36px/700 | 首页主标题 |
| `--text-display-sm` | 24px/600 | 页面大标题 |
| `--text-heading-2` | 18px/600 | 卡片标题 |
| `--text-body-lg` | 16px/400 | AI回复、方案描述 |
| `--text-body-md` | 14px/400 | 默认正文 |
| `--text-body-sm` | 13px/400 | 紧凑列表、工作台 |
| `--text-caption` | 12px/400 | 时间戳、标签 |
| `--text-caption-xs` | 11px/400 | 版本号 |

### 2.4 Spacing Token

| Token | 值 | 场景 |
|:---|:---|:---|
| `--space-2` | 8px | 紧凑间距 |
| `--space-3` | 12px | 元素内间距 |
| `--space-4` | 16px | 卡片内边距 |
| `--space-6` | 24px | 模块间距 |

### 2.5 Radius Token

| Token | 值 | 场景 |
|:---|:---|:---|
| `--radius-sm` | 4px | Tag/Badge |
| `--radius-md` | 8px | 按钮/Input |
| `--radius-lg` | 12px | Card/弹窗 |
| `--radius-2xl` | 24px | AI对话气泡 |

---

## 3. UI Baseline（设计基线）

| 维度 | 当前状态 |
|:---|:---|
| 正式 UI 版本 | V4.7 Design System Final（2026-07-10） |
| 对应 Commit | ⚠️ 无 Git，无法追溯 |
| 代码实现 | `codebase/src/shared/design-tokens.css` + `styles.css` + AntD `theme.ts` |
| 已确认页面 | 增长工具 H5（2个）、客户方案 H5、所有 PC 端页面 |
| 待确认页面 | 无 |
| 禁止覆盖页面 | 客户方案 H5 封面区（品牌紫渐变）、StatusTag 组件 |
| 可优化页面 | 所有页面可做 L1 级优化（文案/间距/Loading） |

---

## 4. Design Guardrails（设计护栏三级制）

### L1：开发 Agent 可直接修改

- 文案适配
- Loading 状态
- 空状态
- 错误提示
- 局部间距微调（使用 `--space-*` Token）
- 小范围响应式修复
- 无障碍改进
- 不影响布局的小图标调整

### L2：必须经 Hermes 批准

- 卡片结构调整
- 表单布局变化
- 页面模块顺序调整
- 新增页面模块
- 弹窗结构调整
- 导航入口增删
- 核心组件结构调整
- AntD 组件替换为非 AntD 组件

### L3：必须重新进入设计流程（Lovable / v0 / Trae Work）

- 首页整体重构
- 主导航重构
- 品牌视觉变化（主色/字体/圆角系统）
- 核心用户流程页面整体重做
- 核心页面（工作台、仪表盘）大范围调整
- Design System 大范围调整

---

## 5. UI 防漂移机制

### 5.1 每次前端改动后必须执行

1. **页面启动** — `npm run dev` 验证可访问
2. **关键页面截图** — 改动页面至少 3 张（正常/空状态/错误态）
3. **响应式检查** — 桌面端 + 移动端（768px 断点）
4. **与基线比较** — 检查是否违反设计护栏
5. **输出视觉差异** — Hermes 判断是否放行

### 5.2 推荐工具

- Playwright 截图自动对比
- `npm run visual` 视觉审计脚本
- 人工目视检查（关键页面）

### 5.3 Token 合规硬性检查

每次前端修改后必须执行（来自 `.hermes.md`）：

- [ ] 全局搜索 `fontSize:` — 全部为 `var(--yl-text-*)`
- [ ] 全局搜索 `color: "#` — 无硬编码色值
- [ ] 全局搜索 `<Tag color=` — 全部替换为 `<StatusTag`
- [ ] 全局搜索 `padding:` / `margin:` px值 — 用 `var(--yl-space-*)`
- [ ] `npx tsc --noEmit` 零错误

### 5.4 已知硬编码问题

全项目约 **368 处硬编码 fontSize**，已记录为已知问题。后续按以下映射表逐步替换：

| 硬编码 | 应替换为 |
|:---|:---|
| `fontSize: 36` / `700` | `var(--yl-text-display-lg)` |
| `fontSize: 24` / `600` | `var(--yl-text-display-sm)` |
| `fontSize: 18` / `600` | `var(--yl-text-heading-2)` |
| `fontSize: 16` | `var(--yl-text-body-lg)` |
| `fontSize: 14` | `var(--yl-text-body-md)` |
| `fontSize: 13` | `var(--yl-text-body-sm)` |
| `fontSize: 12` | `var(--yl-text-caption)` |
| `fontSize: 11` | `var(--yl-text-caption-xs)` |

### 5.5 Trae Design 审查发现的 P0/P1 问题（2026-07-12）

| 编号 | 级别 | 位置 | 问题 | 修复方案 |
|:---|:---:|:---|:---|:---|
| P0-1 | 🔴 | `RequirementExtractPanel` 进度条 | 使用禁用的旧品牌色 `#6E59F5` | `strokeColor` 替换为 `{ from: 'var(--yl-primary)', to: 'var(--yl-ai-accent)' }` |
| P0-2 | 🔴 | `AIChatPanel` 用户气泡 | 背景 `#F5F6FA` + 白字 = 对比度 1.2:1（WCAG FAIL） | 背景改为 `var(--yl-primary)` `#5B4FD6` |
| P0-3 | 🔴 | 首页角色入口按钮 | `rgba(255,255,255,.04)` 几乎不可见 | 改为 `rgba(255,255,255,.12)` + `border` + `backdropFilter: blur(8px)` |
| P1-1 | 🟠 | `/supplier/workspace` | 单页 4 区域堆叠，信息密度过高 | 底部 Segmented 移入 Drawer；中列用视觉分组 |
| P1-2 | 🟠 | `/supplier/followups` | 硬编码背景 `#FFF5F5`/`#FFF9F0`/`#F5F8FF` | 替换为 `--yl-error-bg`/`--yl-warning-bg`/`--yl-info-bg` |
| P1-3 | 🟠 | `PriorityTag`/`ConfidenceTag` | 使用 AntD 命名色（"red"/"orange"/"green"） | 替换为 V4.7 HEX Token |
| P1-4 | 🟠 | Agent 首页 CTA 按钮 | 使用绿色而非品牌色 | 改为 `type="primary"` |

### 5.6 禁止使用的颜色速查（Trae Design 审计）

| 禁止值 | 正确替代 | Token |
|:---|:---|:---|
| `#6E59F5` | `#5B4FD6` | `--yl-primary` |
| `#7c3aed` | `#5B4FD6` | `--yl-primary` |
| AntD `"red"` | `#C53030` | `--yl-error` |
| AntD `"orange"` | `#B45309` | `--yl-warning` |
| AntD `"green"` | `#00875A` | `--yl-success` |
| AntD `"blue"` | `#2563EB` | `--yl-info` |
| AntD `"gold"` | `#D4A017` | `--yl-gold` |
| `#FFF5F5` | `#FEF0F0` | `--yl-error-bg` |
| `#FFF9F0` | `#FEF7EC` | `--yl-warning-bg` |
| `#F5F8FF` | `#EFF4FF` | `--yl-info-bg` |
| Emoji 图标 (👥⏱) | `<TeamOutlined />` `<ClockCircleOutlined />` | @ant-design/icons |

---

## 6. 六端设计变量

| 变量 | 增长工具H5 | 客户方案H5 | 企业PC端 | 移动Web | 销售工作台 | 运营后台 |
|:---|:---|:---|:---|:---|:---|:---|
| 信息密度 | 极低 | 低 | 中低 | 低 | 高 | 中高 |
| 字号基准 | 15px | 15px | 14px | 15px | 14px | 14px |
| 导航模式 | 无导航 | 无导航 | 顶部栏+侧栏 | 底部Tab | 侧栏+顶部栏 | 侧栏 |
| 响应式 | 移动优先 | 移动优先 | 桌面优先 | 移动优先 | 桌面优先 | 桌面优先 |
| 视觉基调 | 轻量诊断 | 专业提案 | SaaS标准 | 移动商城 | 效率引擎 | 管控中枢 |

---

> **迁移来源：** `V4.7_Design_System_Final.md` + `codebase/.hermes.md`  
> **原文件保留：** 两份原文件继续作为开发 Agent 的详细参考  
> **本文件定位：** 设计治理中心 — 护栏、基线、防漂移机制
