# 演立方 V4.7 — Agent 快速上手指南

> Agent 进入项目后第一份必读文件。读完这份 + ROUTE_MAP + COMPONENT_MAP 再动手。

---

## 产品是什么

**演立方 V4.7** — AI提案获客与内容供应链平台。帮助企业客户（保险公司、HR、品牌市场部）通过AI增长工具自助诊断活动需求 → 留资 → 销售生成专属活动方案 → 客户在线查看/确认 → 成交履约。

**不是演出商城、不是演员招聘平台、不是泛营销工具。**

---

## 工作空间

```
/Users/wudixingyunxingleo/projects/演立方/codebase/
```

---

## 技术栈

| 层 | 技术 | 版本 |
|:---|:---|:---|
| 框架 | TanStack Start（SSR + File-based Router） | 1.x |
| UI库 | React | 19 |
| 组件库 | Ant Design | 6.x |
| CSS | Tailwind CSS | 4.x |
| 基础UI | Radix UI（shadcn风格） | — |
| 类型 | TypeScript | 5.x |
| 构建 | Vite | 8.x |
| 包管理 | npm | — |

**路由方式：** 基于文件系统。`src/routes/supplier.leads.tsx` → 自动映射为 `/supplier/leads`。

---

## 目录结构

```
codebase/src/
├── routes/                  ← 页面（文件即路由）
│   ├── __root.tsx           ← 根布局
│   ├── supplier.tsx         ← supplier 侧边栏布局
│   ├── supplier.workspace.tsx  ← 销售作战台
│   ├── supplier.opportunities.tsx  ← 商机列表
│   ├── supplier.leads.tsx      ← 线索列表
│   ├── supplier.proposals.tsx  ← 方案列表
│   ├── tools.*.tsx             ← 增长工具H5
│   ├── p/$proposalId.tsx       ← 客户方案H5
│   ├── admin.*.tsx             ← 运营后台
│   ├── agent.*.tsx             ← 企业客户PC端
│   └── m.*.tsx                 ← C端移动Web
├── shared/
│   ├── types.ts             ← TypeScript 类型定义
│   ├── theme.ts             ← Ant Design Theme 配置
│   ├── design-tokens.css    ← CSS 变量（--yl-* 前缀，248行）
│   ├── components/          ← 共享业务组件（见 COMPONENT_MAP）
│   └── mock/                ← Mock 数据
│       ├── data.ts          ← 客户/商机/报价/方案/线索（主文件）
│       ├── ai.ts            ← AI方案/推荐
│       ├── growth-tools.ts  ← 增长工具数据
│       ├── feedbackLog.ts   ← AI反馈
│       └── messages.ts      ← 消息
└── styles.css               ← Tailwind @theme + :root CSS 变量
```

---

## 设计 Token 速查

**所有颜色必须通过 Token 引用，严禁硬编码 hex 值。**

| Token | 值 | 用法 |
|:---|:---|:---|
| `--yl-primary` | `#5B4FD6` | 品牌主色 |
| `--yl-primary-hover` | `#4A3FC5` | 悬停态 |
| `--yl-primary-subtle` | `#F0EEFF` | 浅紫背景 |
| `--yl-bg-page` | `#F7F8FA` | 页面背景 |
| `--yl-bg-surface` | `#FFFFFF` | 卡片/面板 |
| `--yl-text-primary` | `#1A1D2E` | 正文 |
| `--yl-text-secondary` | `#5B6178` | 次要文字 |
| `--yl-text-tertiary` | `#8B92A8` | 辅助文字 |
| `--yl-border-default` | `#E5E7EF` | 边框 |
| `--yl-border-ai` | `#E0DDFF` | AI区域边框 |
| `--yl-bg-ai` | `#FAFAFF` | AI区域背景 |

**引用方式：**
```tsx
// CSS变量方式
style={{ background: 'var(--yl-primary)' }}

// Tailwind方式（如果token已映射到tailwind config）
className="bg-primary text-primary-foreground"

// Ant Design方式
import { theme } from 'antd';
const { token } = theme.useToken();
token.colorPrimary  // 自动 = #5B4FD6
```

---

## 编码规范

1. **TypeScript 严格模式** — 所有 props 必须有类型，禁止 `any`
2. **三态处理** — 每个数据展示组件必须处理 Loading / Empty / Error
3. **不硬编码颜色** — 用 `var(--yl-*)` 或 Tailwind token 或 Ant Design token
4. **不硬编码文案** — 状态标签用 `StatusTag` 组件，状态映射在 `theme.ts` 的 `statusColorMap` 中
5. **Mock 数据** — 全部从前端 Mock 文件导入，不调真实 API。API 调用用 `// TODO: 替换为真实API` 注释预留
6. **路由** — 用 TanStack Router 的 `createFileRoute` + `useNavigate` / `useParams`
7. **页面组件** — 参考同级目录下已有页面的代码风格，保持一致

---

## 已完成模块（不要重写）

| 模块 | 文件 | 创建者 |
|:---|:---|:---|
| Design Token 体系 | `styles.css` + `theme.ts` + `design-tokens.css` | Agent A |
| 增长工具 H5 | `tools.budget-calculator.tsx` + `tools.insurance-plan.tsx` | Agent B |
| 客户方案 H5 | `p/$proposalId.tsx`（852行） | Agent C |
| 工具共用组件 | `ToolQuestionFlow.tsx` + `ToolResultPage.tsx` + `LeadCaptureModal.tsx` | Agent B |
| CRM 线索中心 | `supplier.leads.tsx` + `supplier.leads.$id.tsx` | Qoder |
| 线索评分徽章 | `LeadScoreBadge.tsx` | Qoder |
| 方案预览组件 | `ProposalPreview.tsx`（796行） | Trae IDE |
| 方案编辑页 | `supplier.proposals.$id.tsx`（620行） | Trae IDE + Qoder |
| 方案列表页 | `supplier.proposals.tsx`（228行） | Qoder |

---

## 禁止事项

- ❌ 不调真实 API（全部 Mock）
- ❌ 不硬编码 hex 颜色
- ❌ 不安装新依赖（不改 package.json）
- ❌ 不修改 `styles.css`、`theme.ts`、`design-tokens.css`（Token 体系已定版）
- ❌ 不修改已有页面（除非任务明确要求）
- ❌ 不用旧品牌色 `#6E59F5` 或 `#7c3aed`
- ❌ 不在对外展示中暴露演员成本（`base_price`）
- ❌ 不在客户方案中出现「加入购物车」「立即购买」等电商语言
