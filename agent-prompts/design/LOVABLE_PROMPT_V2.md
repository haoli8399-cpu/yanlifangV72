# Lovable 演立方 V4.7 — 前端开发提示词

> **复制全文发给 Lovable。** 生成日期：2026-07-12

---

## 你的角色

你是演立方的唯一前端实现工程师。你的任务是**在现有项目内部工作**，不是创建新项目。你输出的代码必须能直接在项目中运行。

---

## 项目信息

- **产品名**：演立方 — AI 提案获客与内容供应链平台
- **版本**：V4.7 MVP
- **技术栈**：React 19.2 + TanStack Start 1.168 + Ant Design 6.5 + Tailwind CSS 4.2
- **路由**：TanStack Router 1.170，文件系统路由（`src/routes/*.tsx`）
- **状态**：Zustand + TanStack Query + React Hook Form + Zod
- **图表**：Recharts
- **图标**：@ant-design/icons + lucide-react
- **数据**：全 Mock

---

## 工作目录

```
/Users/wudixingyunxingleo/projects/演立方/codebase/
```

---

## 禁止修改的文件

```
src/router.tsx           — 路由实例
src/__root.tsx           — AntD ConfigProvider
src/routeTree.gen.ts     — 自动生成，禁止手动编辑
src/styles.css           — Tailwind @theme + :root
src/shared/theme.ts      — AntD Theme 配置
src/shared/design-tokens.css — CSS 变量
src/shared/types.ts      — 全局类型定义
src/shared/utils/        — 业务逻辑（opportunityPriority / followupRules）
package.json             — 依赖
```

---

## 设计参考（必须匹配的风格）

以下 8 个预览页面是**已经定稿的设计参考**。你生成的任何页面必须在**视觉质量、信息密度、组件使用方式**上达到或超过这些页面的水平。

| 页面 | 预览地址 | 来源 |
|:---|:---|:---|
| AI 活动顾问首页 | `/v0-demo` | v0 by Vercel |
| 方案发现 | `/v0-solutions` | v0 by Vercel |
| 消息中心 | `/v0-messages` | v0 by Vercel |
| 销售作战台 | `/v0-workspace` | v0 by Vercel |
| 跟进中心 | `/td-followups` | Trae Design |
| 预算计算器 H5 | `/td-tools-budget` | Trae Design |
| 客户方案 H5 | `/td-proposal` | Trae Design |
| m 端首页 | `/td-m-index` | Trae Design |

**你怎么看这些页面**：在你开始工作前，阅读 `src/routes/v0-demo.tsx`、`src/routes/td-followups.tsx`、`src/routes/v0-workspace.tsx` 这三个文件。它们的代码风格、组件组织方式、数据 Mock 方式、颜色使用方式就是你要遵循的标准。

---

## 设计 Token 速查

```
品牌主色：  #5B4FD6    hover: #4C41BF    active: #3D33B3
品牌浅底：  #F0EEFF    品牌边框：#E0DDFF
页面背景：  #F7F8FA    卡片白底：#FFFFFF
卡片边框：  #E5E7EF    圆角：12px (rounded-xl)  阴影：shadow-sm
AI 区域背景：#FAFAFF   AI 边框：#E0DDFF
文字主色：  #1F2430    文字副色：#687083    文字辅助：#9AA0AE
成功色：    #317848    成功浅底：#EEF8F1
警告色：    #A55D12    警告浅底：#FFF5E8
错误色：    #C2413B    错误浅底：#FEF0F0
信息色：    #2563A9    信息浅底：#EEF6FF
```

**绝对禁止**：`#6E59F5`、`#7c3aed`、AntD 命名色如 `"red"` `"green"` `"blue"`、Emoji 图标、硬编码 fontSize

---

## 使用 shadcn/ui 组件

项目中已安装全部 shadcn/ui 组件（40+ 个），路径为 `@/components/ui/*`。请使用这些组件 + lucide-react 图标 + Tailwind CSS 构建页面，不使用 Ant Design 组件。

常用导入：
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
```

路由文件格式：
```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/your-route")({ component: YourPage });
```

---

## 你要做的页面

以下页面是当前项目中需要你实现的。每个页面都是完整独立的 `.tsx` 文件，包含 Mock 数据、所有交互状态。

### 1. Agent AI 对话页（替代当前的 /agent/assistant）

**文件**：`src/routes/agent.assistant.tsx`（覆盖现有文件）

左右分栏（60/40），左侧聊天区 + 右侧需求识别 + 推荐方案。

参考 `v0-demo.tsx` 的设计：对话气泡（AI 白底 #E0DDFF 边框 / 用户 #5B4FD6 底色白字）、建议 Chips、需求进度条、已识别/缺失标签、3 套紧凑方案卡片。支持 3 轮对话模拟，匹配度从 0% 到 92% 动态更新。

### 2. Agent 方案发现页（替代当前的 /agent/solutions）

**文件**：`src/routes/agent.solutions.tsx`

参考 `v0-solutions.tsx`：顶部筛选栏 + 预算滑杆 + 3 列方案卡片网格 + 加载骨架屏 + 空状态。6 套真实演立方方案数据。

### 3. Agent 消息中心（替代当前的 /agent/messages）

**文件**：`src/routes/agent.messages.tsx`

参考 `v0-messages.tsx`：分类标签 + 消息列表 + 未读红点 + 全部标为已读 + 骨架屏 + 空状态。8 条消息，四种类型（报价紫色/AI蓝色/系统灰色/客服橙色）。

### 4. Agent 我的方案（替代当前的 /agent/requests）

**文件**：`src/routes/agent.requests.tsx`

方案列表页。顶部标题 + 搜索 + 状态筛选（全部/进行中/已完成）。方案卡片：公司名 + 活动类型 + 日期 + 金额 + 状态标签 + 匹配度 + 查看详情按钮。至少 6 条数据。骨架屏 + 空状态。

### 5. Supplier 商机中心（替代当前的 /supplier/opportunities）

**文件**：`src/routes/supplier.opportunities.tsx`

商机管理列表。顶部 KPI 三卡（总商机/待跟进/已成交）。筛选栏 + 表格/卡片视图切换。商机卡片：公司名 + 活动类型 + 金额 + 状态 + 优先级 + 负责人 + 跟进时间。至少 8 条数据。骨架屏 + 空状态。

### 6. Supplier 方案管理（替代当前的 /supplier/proposals）

**文件**：`src/routes/supplier.proposals.tsx`

方案库管理。搜索 + 分类 + 方案卡片网格（3 列桌面）。每张卡片：档位标签 + 标题 + 人数/时长/价格 + 描述 + 编辑/预览按钮。至少 8 套方案。骨架屏 + 空状态。

### 7. Supplier 报价管理（替代当前的 /supplier/quotations）

**文件**：`src/routes/supplier.quotations.index.tsx`

报价列表。表格视图：客户名 + 方案名 + 金额 + 状态（待确认/已确认/已过期）+ 日期 + 操作。至少 6 条数据。排序 + 搜索 + 骨架屏 + 空状态。

---

## 每个页面的硬性要求

1. **数据充足**：至少 6 条 Mock 数据，全部中文，演立方真实业务场景
2. **三态完整**：正常态 + 加载骨架屏 + 空数据态
3. **交互可工作**：搜索、筛选、标签切换、选中等交互状态真实可用
4. **颜色规范**：全部使用上述 Design Token 值，不得出现任何硬编码非标准色
5. **响应式**：桌面优先，768px 以下单列
6. **构建通过**：页面写完后 `npm run build` 必须零错误
7. **代码风格**：与 `v0-demo.tsx` 和 `td-followups.tsx` 保持一致
