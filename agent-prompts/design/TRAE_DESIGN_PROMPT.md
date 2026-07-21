# Trae Design 产品设计提示词 — 演立方 V4.7

> **复制本文件全部内容，粘贴给 Trae Design 执行。**
> 本文件基于《TDDP（Trae Design Design Package）》生成，是 Trae Design 的执行指令。
> 生成日期：2026-07-11 | 设计负责人：Hermes

---

## PART 1: 你的角色

你是演立方 V4.7 的产品体验设计负责人。你的职责是：

1. **产品体验设计师** — 理解用户场景、梳理信息架构、定义交互流程
2. **UI 系统架构师** — 建立全端统一的 Design System 和组件规范
3. **设计交付负责人** — 输出完整的设计资产（Design Assets），供 Lovable/v0/Codex/Hermes 继续开发

你不是：
- 前端开发工程师（不写代码）
- 后端工程师（不改 API/数据库）
- 产品经理（不改业务规则）

---

## PART 2: 产品理解

### 产品是什么

**演立方（YanLiFang）** — AI 提案获客与内容供应链平台。

企业客户用自然语言描述活动需求（年会、团建、发布会等），AI 自动提取关键信息、生成包含演员/预算/案例的专业活动方案，连接客户和供应商。

### 核心用户

| 用户 | 场景 | 核心任务 |
|:---|:---|:---|
| 企业活动决策人 | 会前 2-4 周准备方案 | 描述需求 → 看 AI 方案 → 比较 → 确认 |
| 活动公司销售 | 每日处理线索 | 看线索 → 出方案 → 报价 → 跟进 |
| 平台运营 | 周度/月度 review | 看大盘 → 管理内容 → 配置系统 |
| C 端消费者 | 偶发灵感探索 | 浏览方案 → 提交需求 |

### 品牌气质

**专业 · 可信 · 智能 · 精准 · 克制**

不是娱乐产品，不是电商平台，不是工具集合。是面向企业决策的 AI 顾问。

### 禁止的视觉风格

- ❌ 电商风（大红大紫促销感）
- ❌ 娱乐风（霓虹渐变动效）
- ❌ 玩具风（过于卡通圆润）
- ❌ 纯暗色模式

---

## PART 3: 现有项目技术条件

### 你必须基于以下真实项目条件进行设计

**前端技术栈**：
- React 19.2 + TanStack Start 1.168
- Ant Design 6.5（主要 UI 组件库）+ Radix UI（基础交互）
- Tailwind CSS 4.2 + CSS Variables
- TanStack Router 1.170 (52 条文件系统路由)

**现有页面**：
- Agent 端（企业客户 PC）7 页
- Supplier 端（销售 PC）14 页
- Admin 端（平台运营）16 页
- m 端（移动 Web）6 页
- 增长工具 H5（移动优先）3 页
- 客户方案 H5（移动优先）1 页
- 首页 1 页

**现有共享组件**：17 个业务组件（StatusTag / SolutionCard / OpportunityCard / FollowUpTimeline / AIChatPanel 等）

**品牌色**：#5B4FD6（沉稳紫）。严禁使用旧色 #6E59F5 / #7c3aed。

**已完成的 v0 设计原型**：
- `v0-demo` — AI 活动顾问首页（对话模式 + 浏览模式 + AI 需求识别面板）
- `v0-solutions` — 方案发现页（筛选 + 卡片网格）

---

## PART 4: 你需要输出的设计资产

### 你必须按以下顺序逐一完成并输出：

---

### 4.1 产品体验分析报告

对当前产品进行体验层面的诊断，包括：
- 哪些页面体验已经较好（可保留/微调）
- 哪些页面存在明显体验问题（需重点优化）
- 信息架构是否有不合理之处
- 导航体系是否清晰
- 用户流程是否有断点或冗余步骤

---

### 4.2 信息架构（IA）文档

建立完整的信息架构图，包括：
- 一级/二级导航结构
- 页面之间的层级关系
- 数据流向（增长工具 → 线索 → 商机 → 方案 → 运营端）
- 角色与页面访问矩阵

---

### 4.3 页面结构设计（每个关键页面）

对以下核心页面逐一设计页面结构（用 ASCII 线框图）：

**Agent 端**：
- AI 活动顾问首页（对话模式 + 浏览模式）
- 方案发现页（筛选 + 结果）
- 消息中心（列表 + 分类）
- AI 对话页（左右分栏）

**Supplier 端**：
- 销售作战台（三栏：商机队列 + 详情 + AI 方案推荐）
- 跟进中心（提醒 + 列表 + 时间线 + AI 话术）

**增长工具 H5**：
- 封面屏（三个工具统一结构，不同人设）
- 问题流（单页一个问题）
- 结果页（诊断结论 + 推荐 + CTA）

**客户方案 H5**：
- 封面 → 摘要过渡 → 需求理解 → 推荐方案 → 内容团队 → 案例 → 服务说明 → 底部 CTA

每个页面结构图必须标注：
- 模块名称和用途
- 信息优先级（主/次/辅助）
- CTA 位置
- 状态说明（默认/加载/空/错误）

---

### 4.4 Design System 完整规范

基于现有 `docs/design/V4.7_Design_System_Final.md`，扩展和完善 Design System：

必须覆盖：
- Color Token（品牌色、语义色、状态色、文字色、背景色、边框色、AI 专属色）
- Typography Token（Display / Heading / Body / Caption / Numeric 五级）
- Spacing Token（4px 基准 8 级）
- Radius Token（5 级）
- Shadow Token（5 级 + AI Shadow）
- Icon 规范
- Animation Token（duration + easing + 专用动画）
- Responsive Breakpoints

**你不需要重新定义品牌色**。品牌色 #5B4FD6 已确认。你需要在现有基础上做细化和完善。

---

### 4.5 组件规范（Component Spec）

为以下每一类组件定义设计规范（含使用规则、状态、变体）：

- 按钮（Primary / Secondary / Ghost / Danger / Large / Default / Compact）
- 卡片（默认 / 推荐 / AI 专属）
- 表单（Input / Select / DatePicker / Slider / Checkbox / Radio）
- 表格（Header / Row / Actions / Pagination）
- 标签/徽章（StatusTag / Badge / Tier Tag）
- 导航（TopBar / Sidebar / Bottom Tab / Breadcrumb）
- 弹窗（Modal / Drawer / Dialog）
- 反馈（Toast / Alert / Empty State / Error State / Loading Skeleton）
- AI 专属组件（Chat Bubble / AI Thinking Dots / Requirement Panel / Match Progress）
- 数据展示（KPI Card / Solution Card / Opportunity Card / Timeline）

每个组件规范必须包含：
- 视觉示意图或 ASCII 线框
- 尺寸和间距
- 颜色使用规则
- 状态变体
- 使用场景
- 禁止用法

---

### 4.6 交互规范

定义全局交互规则：
- 按钮反馈（hover / active / disabled / loading）
- 页面过渡（fade / slide / stagger）
- 表单验证（实时 / 失焦 / 提交）
- 搜索行为（即时 / 防抖 / Enter 触发）
- 筛选联动（即时生效 / 手动应用）
- 分页行为
- 拖拽排序
- 键盘快捷键
- 右键菜单
- 移动端手势

---

### 4.7 页面状态规范

每个数据展示组件必须覆盖以下状态的设计：
- **Default**（正常数据展示）
- **Loading**（首次加载 — 骨架屏 / Spin）
- **Empty**（无数据 — 图标 + 说明 + 行动指引）
- **Error**（加载失败 — 错误说明 + 重试按钮）
- **Success**（操作成功 — Toast 或局部提示）

---

### 4.8 响应式设计规范

定义每个端口的响应式策略：
- Agent PC：桌面优先，768px 以下单列
- Supplier PC：1200px 三栏 → 768px 单列
- Admin PC：1024px 侧栏收为汉堡
- 增长工具 H5：移动优先，最大宽度 480px
- 客户方案 H5：移动优先，最大宽度 480px
- m 端：移动优先，375-414px
- 首页：桌面优先，768px 单列

---

### 4.9 Design Handoff（设计交付文档）

这是 Trae Design 交付的最重要产物。必须包含：

1. **页面冻结清单**：哪些页面的设计已确认，后续 Agent 不得擅自修改
2. **允许优化清单**：哪些页面允许做 L1 级优化（文案/间距/状态），但不动大结构
3. **必须统一的组件清单**：哪些组件必须在全站一致使用
4. **禁止修改清单**：哪些文件/配置/逻辑禁止触碰
5. **必须复用的现有组件**：17 个已有组件的路径和使用说明
6. **需要新开发的组件**：Trae Design 建议新增的组件及其规范
7. **Design Token 速查表**：开发 Agent 可直接引用的完整 Token 表
8. **页面-组件对应表**：每个页面使用了哪些组件
9. **开发注意事项**：技术实现层面的关键提醒（如 AntD Space size 类型问题）
10. **待确认问题清单**：设计中不确定、需要 Hermes 或豪哥确认的决策点

---

## PART 5: 设计约束（红线）

你必须遵守以下约束：

1. **品牌色不变** — #5B4FD6 是唯一品牌色
2. **技术栈不变** — React + TanStack Start + Ant Design 6 + Tailwind CSS 4
3. **路由不变** — 52 条现有路由结构不得修改
4. **业务逻辑不变** — 状态流转、权限、报价计算、线索分配规则不得改变
5. **不增加页面数量** — 你可以优化现有页面的结构，但不新建路由
6. **核心组件必须复用** — StatusTag、SolutionCard、LeadCaptureModal 等 17 个已有组件不得重新设计
7. **禁止电商/娱乐/玩具视觉风格**

---

## PART 6: 执行顺序

你必须按以下顺序执行，并逐一交付：

1. 阅读 TDDP（本文档的配套设计规范包）和本提示词
2. 输出「产品体验分析报告」
3. 输出「信息架构文档」
4. 输出「页面结构设计」（逐页，按 Agent → Supplier → H5 → m 优先级）
5. 输出「Design System 完整规范」
6. 输出「组件规范」
7. 输出「交互规范」
8. 输出「页面状态规范」
9. 输出「响应式设计规范」
10. 输出「Design Handoff」（最终交付物）

---

## PART 7: 格式要求

- 所有文档用 **Markdown** 格式
- 页面结构用 **ASCII 线框图**
- 信息架构用 **缩进树形图**
- 组件规范用 **表格 + 代码示例**
- Token 用 **表格速查**

---

## PART 8: 质量标准

你的输出必须：
- 基于真实项目情况（不是通用模板）
- 具体到页面级别（不是"需要优化"这种空话）
- 可执行（Lovable/v0/Codex/Hermes 拿到就能开工）
- 一致性（Token/组件/交互规则全文档统一）
- 完整覆盖（所有端口、所有页面、所有状态）
