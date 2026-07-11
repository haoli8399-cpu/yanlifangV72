# 演立方 V4.7 — 共享组件地图

> Agent 写页面之前必读。知道哪些组件已有，直接用，不用重造。

---

## 业务组件

### AI 相关

| 组件 | 路径 | Props | 用途 |
|:---|:---|:---|:---|
| `AIChatPanel` | `shared/components/AIChatPanel.tsx` | — | AI 对话面板（流式输出） |
| `AIFeedbackBar` | `shared/components/AIFeedbackBar.tsx` | — | AI 推荐反馈按钮（4类维度） |
| `RequirementExtractPanel` | `shared/components/RequirementExtractPanel.tsx` | — | AI 需求提取结果展示 |
| `MinimalRequirementForm` | `shared/components/MinimalRequirementForm.tsx` | — | 追问失败后的最小化表单 |

### 商机/线索/方案

| 组件 | 路径 | Props | 用途 |
|:---|:---|:---|:---|
| `OpportunityCard` | `shared/components/OpportunityCard.tsx` | `opportunity` | 商机卡片 |
| `OpportunityStatusFlow` | `shared/components/OpportunityStatusFlow.tsx` | — | 商机状态流转图 |
| `SolutionCard` | `shared/components/SolutionCard.tsx` | `solution` | AI 方案推荐卡片 |
| `FollowUpTimeline` | `shared/components/FollowUpTimeline.tsx` | `followUps` | 跟进记录时间线 |
| `LeadScoreBadge` | `shared/components/LeadScoreBadge.tsx` | `score: number` | 线索评分徽章（绿/橙/灰） |
| `ProposalPreview` | `shared/components/ProposalPreview.tsx` | `proposal` | 客户方案H5效果预览（796行） |
| `StatusTag` | `shared/components/StatusTag.tsx` | `status`, `label?` | 状态标签（自动映射颜色） |

### 增长工具

| 组件 | 路径 | Props | 用途 |
|:---|:---|:---|:---|
| `ToolQuestionFlow` | `shared/components/ToolQuestionFlow.tsx` | `toolType, title, subtitle, steps, onComplete, children` | 通用问题流（封面→答题→生成中→结果），432行 |
| `ToolResultPage` | `shared/components/ToolResultPage.tsx` | `answers, result, sections[], ctas[], toolType` | 通用工具结果页 |
| `LeadCaptureModal` | `shared/components/LeadCaptureModal.tsx` | `trigger, onSubmit` | 留资弹窗（手机号/微信） |

### 通用

| 组件 | 路径 | Props | 用途 |
|:---|:---|:---|:---|
| `DashboardCard` | `shared/components/DashboardCard.tsx` | `label, value, delta, trend, tone` | 仪表盘指标卡 |
| `AppTopBar` | `shared/components/AppTopBar.tsx` | — | 全局顶栏 |

### 工具函数

| 函数 | 路径 | 用途 |
|:---|:---|:---|
| `relativeTime` | `shared/components/formatters.ts` | 相对时间展示（"3天前"） |
| `wan` | `shared/components/formatters.ts` | 万为单位格式化 |
| `yuan` | `shared/components/formatters.ts` | 金额格式化 |
| `computePriority` | `shared/utils/opportunityPriority.ts` | 商机优先级计算 |
| `generateOperatorSolutions` | `shared/mock/ai.ts` | AI 方案生成（Mock） |
| `rankByFeedback` | `shared/mock/ai.ts` | 按反馈排序方案 |

---

## Ant Design 组件（全局可用，不需要自己封装）

以下 Ant Design 组件全局可用，直接用，不需要额外封装：

`Button` `Card` `Table` `Form` `Input` `Select` `DatePicker` `InputNumber` `Tag` `Badge` `Avatar` `Modal` `Drawer` `Tabs` `Segmented` `Space` `Divider` `Typography` `message` `Dropdown` `Menu` `Popover` `Tooltip` `Skeleton` `Empty` `Spin` `Progress` `Slider` `Switch` `Upload`

**Ant Design Theme 已全局配置（`theme.ts`）：**
- `colorPrimary: '#5B4FD6'`
- `borderRadius: 8`
- `controlHeight: 40`

所以 `<Button type="primary">` 自动是品牌紫，不需要手动设颜色。

---

## 设计Token 使用方式

用 `var(--yl-*)` CSS 变量，不用硬编码 hex：

```tsx
// ✅ 正确
<div style={{ background: 'var(--yl-bg-ai)', border: '1px solid var(--yl-border-ai)' }}>

// ❌ 禁止
<div style={{ background: '#FAFAFF', border: '1px solid #E0DDFF' }}>
```

完整 Token 列表见 `QUICK_START.md` 或 `src/shared/design-tokens.css`。
