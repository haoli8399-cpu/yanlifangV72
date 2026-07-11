# 演立方 V4.7 — 路由地图

> Agent 新建路由前必读。知道往哪加、不碰哪。

---

## 路由一览

### 首页

| 路由 | 文件 | 说明 |
|:---|:---|:---|
| `/` | `index.tsx` | 首页入口 |

### Supplier 端（销售工作台）⚠️ 重点开发区域

| 路由 | 文件 | 状态 | 可改？ |
|:---|:---|:---:|:---:|
| `/supplier` | `supplier.tsx` | ✅ | ⚠️ 仅加导航项 |
| `/supplier/login` | `supplier.login.tsx` | ✅ | ❌ |
| `/supplier/workspace` | `supplier.workspace.tsx` | ✅ | ❌ |
| `/supplier/opportunities` | `supplier.opportunities.tsx` | ✅ | ❌ |
| `/supplier/opportunities/$id` | `supplier.opportunities.$id.tsx` | ✅ | ❌ |
| `/supplier/leads` | `supplier.leads.tsx` | ✅ | ❌ |
| `/supplier/leads/$id` | `supplier.leads.$id.tsx` | ✅ | ❌ |
| `/supplier/proposals` | `supplier.proposals.tsx` | 🆕 | ✅ |
| `/supplier/proposals/$id` | `supplier.proposals.$id.tsx` | 🆕 | ✅ |
| `/supplier/quotations` | `supplier.quotations.index.tsx` | ✅ | ❌ |
| `/supplier/quotations/$id` | `supplier.quotations.$id.tsx` | ✅ | ❌ |
| `/supplier/followups` | `supplier.followups.tsx` | ✅ | ❌ |
| `/supplier/feedback` | `supplier.feedback.tsx` | ✅ | ❌ |
| `/supplier/artists` | `supplier.artists.tsx` | ✅ | ❌ |

### 增长工具 H5（V4.7 新增）⚠️ 重点开发区域

| 路由 | 文件 | 状态 | 可改？ |
|:---|:---|:---:|:---:|
| `/tools/budget-calculator` | `tools.budget-calculator.tsx` | ✅ | ❌ |
| `/tools/insurance-plan` | `tools.insurance-plan.tsx` | ✅ | ❌ |

### 客户方案 H5（V4.7 新增）

| 路由 | 文件 | 状态 | 可改？ |
|:---|:---|:---:|:---:|
| `/p/$proposalId` | `p/$proposalId.tsx` | ✅ | ❌ |

### Agent 端（企业客户 PC）

| 路由 | 文件 | 状态 | 可改？ |
|:---|:---|:---:|:---:|
| `/agent` | `agent.tsx` | ✅ | ❌ |
| `/agent/index` | `agent.index.tsx` | ✅ | ❌ |
| `/agent/login` | `agent.login.tsx` | ✅ | ❌ |
| `/agent/assistant` | `agent.assistant.tsx` | ✅ | ❌ |
| `/agent/solutions` | `agent.solutions.tsx` | ✅ | ❌ |
| `/agent/requests` | `agent.requests.tsx` | ✅ | ❌ |
| `/agent/messages` | `agent.messages.tsx` | ✅ | ❌ |
| `/agent/quotations/$id` | `agent.quotations.$id.tsx` | ✅ | ❌ |

### M 端（C端移动Web）

| 路由 | 文件 | 状态 | 可改？ |
|:---|:---|:---:|:---:|
| `/m` | `m.tsx` | ✅ | ❌ |
| `/m/index` | `m.index.tsx` | ✅ | ❌ |
| `/m/discover` | `m.discover.tsx` | ✅ | ❌ |
| `/m/submit` | `m.submit.tsx` | ✅ | ❌ |
| `/m/messages` | `m.messages.tsx` | ✅ | ❌ |
| `/m/me` | `m.me.tsx` | ✅ | ❌ |

### Admin 端（运营后台）

| 路由 | 文件 | 状态 | 可改？ |
|:---|:---|:---:|:---:|
| `/admin` | `admin.tsx` | ✅ | ❌ |
| `/admin/index` | `admin.index.tsx` | ✅ | ❌ |
| `/admin/login` | `admin.login.tsx` | ✅ | ❌ |
| `/admin/dashboard` | `admin.dashboard.tsx` | ✅ | ❌ |
| `/admin/sku` | `admin.sku.tsx` | ✅ | ❌ |
| `/admin/artists` | `admin.artists.tsx` | ✅ | ❌ |
| `/admin/customers` | `admin.customers.tsx` | ✅ | ❌ |
| `/admin/orders` | `admin.orders.tsx` | ✅ | ❌ |
| `/admin/agencies` | `admin.agencies.tsx` | ✅ | ❌ |
| `/admin/ai-feedback` | `admin.ai-feedback.tsx` | ✅ | ❌ |
| `/admin/labeling` | `admin.labeling.tsx` | ✅ | ❌ |
| `/admin/prompts` | `admin.prompts.tsx` | ✅ | ❌ |
| `/admin/rbac` | `admin.rbac.tsx` | ✅ | ❌ |
| `/admin/audit` | `admin.audit.tsx` | ✅ | ❌ |
| `/admin/dict` | `admin.dict.tsx` | ✅ | ❌ |

---

## 路由命名规则

| 规则 | 示例 |
|:---|:---|
| 扁平路由 | `supplier.leads.tsx` → `/supplier/leads` |
| 动态路由 | `supplier.leads.$id.tsx` → `/supplier/leads/:id` |
| 子目录路由 | `p/$proposalId.tsx` → `/p/:proposalId` |
| 带 index | `supplier.index.tsx` → `/supplier`（layout 子页） |

---

## 已知路由Bug 🔴

`/supplier/proposals/$id` 路由不生效。访问 `/supplier/proposals/prop-001` 时停留在列表页。可能原因：扁平文件 `supplier.proposals.tsx` 与动态文件 `supplier.proposals.$id.tsx` 的路由注册顺序冲突。待修复。
