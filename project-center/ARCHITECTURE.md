# 演立方 V4.7 — 架构全景图

> 更新：2026-07-10
>
> ⚠️ **2026-07-11 迁移通知：** 本文件的核心内容已升级迁移至 `docs/ARCHITECTURE.md`。  
> 新技术架构文件详见：[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

---

## 一、六端架构

```
                         ┌──────────────────┐
                         │   Nginx :80      │
                         │   119.28.134.67  │
                         └────────┬─────────┘
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
    │ /          │          │ /admin/   │          │ /supplier/│
    │ PC Web     │          │ 运营后台   │          │ 销售工作台 │
    │ React 19   │          │ Umi 4     │          │ React 19  │
    └─────┬─────┘          └─────┬─────┘          └─────┬─────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                         ┌────────▼────────┐
                         │  Fastify :3002  │
                         │  /v1/ API       │
                         └────────┬────────┘
              ┌───────────────────┼───────────────────┐
              │                   │                   │
        ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
        │ PostgreSQL │      │   Redis   │      │ DeepSeek  │
        │    :5433   │      │   :6379   │      │    API    │
        └───────────┘      └───────────┘      └───────────┘

独立 H5 页面（不经过 Nginx 路由，直接访问）：
  /tools/budget-calculator  →  增长工具：企业活动预算计算器
  /tools/insurance-plan     →  增长工具：保险行业活动方案生成器
  /p/:proposalId            →  客户专属方案H5

小程序（微信生态）：
  演立方小程序 → 微信云开发 / 独立后端API

PC 前端（Lovable 单应用内路由）：
  /agent/*     →  企业客户PC端
  /m/*         →  C端移动Web
  /supplier/*  →  销售工作台
  /admin/*     →  平台运营后台
```

---

## 二、数据层（17张已有 + 8张新增）

### 已有表（从旧项目迁移）

| 表 | 行数 | V4.7用途 |
|:---|:---:|:---|
| `skus` | ~20 | ✅ 方案模板 → 工具结果/方案编辑器引用 |
| `performers` | ~30 | ✅ 艺人 → 升级为 talents（演员/内容团队） |
| `demands` | — | ✅ 需求 → 工具线索关联 |
| `opportunities` | — | ✅ 商机 → CRM线索中心 |
| `quotes` | — | ✅ 报价 → 方案报价 |
| `follow_up_logs` | — | ✅ 跟进 → 销售跟进SOP |
| `cases` | — | ✅ 案例 → 素材资产库 |
| `companies` | — | ✅ 企业 → 客户档案 |
| `assignments` | — | ✅ 排期 → P2履约 |
| `settlements` | — | ✅ 结算 → P2履约 |
| `reviews` | — | ✅ 评价 → P2履约 |
| `credit_score_logs` | — | ✅ 信誉 → P2履约 |
| `ai_feedback_logs` | — | ✅ AI反馈 |
| `price_configs` | — | ✅ 价格配置 |

### 新增表（V4.7）

| 表 | 用途 | 关键字段 |
|:---|:---|:---|
| `proposals` | 方案主表 | customer_name, event_theme, status(draft→shared→viewed→approved→converted) |
| `proposal_versions` | 方案版本 | proposal_id, version, snapshot, change_note |
| `proposal_modules` | 方案模块 | proposal_id, module_type, content |
| `proposal_assets` | 方案引用素材 | proposal_id, asset_type(talent/venue/case), asset_id |
| `leads` | 工具线索 | tool_type, answers, score, status, assigned_to |
| `tool_results` | 工具结果 | lead_id, tool_type, result_json, ai_output |
| `talents` | 演员/内容团队 | name, role_type, tags, photos, base_price（对外不展示成本） |
| `venues` | 场馆 | name, city, capacity, images, price_range |

---

## 三、API 路由规划

### 已有（21组，从旧项目迁移）

`/v1/auth`, `/v1/skus`, `/v1/demands`, `/v1/opportunities`, `/v1/quotes`, `/v1/follow-ups`, `/v1/orders`, `/v1/performers`, `/v1/assignments`, `/v1/settlements`, `/v1/reviews`, `/v1/cases`, `/v1/companies`, `/v1/price-configs`, `/v1/ai`, `/v1/ai-templates`, `/v1/admin`, `/v1/notifications`, `/v1/contracts`, `/v1/payments`, `/v1/supplier`

### 新增（V4.7）

| 端点 | 用途 | 优先级 |
|:---|:---|:---:|
| `POST /v1/tools/submit` | 提交工具答案，生成结果 | P0 |
| `GET /v1/tools/:id/result` | 获取工具结果 | P0 |
| `POST /v1/leads` | 创建线索（留资后） | P0 |
| `GET /v1/leads` | 线索列表（CRM） | P0 |
| `PATCH /v1/leads/:id` | 更新线索状态 | P0 |
| `POST /v1/proposals` | 创建方案（从线索/工具结果） | P0 |
| `GET /v1/proposals/:id` | 获取方案详情（客户H5用） | P0 |
| `PATCH /v1/proposals/:id` | 编辑方案 | P0 |
| `POST /v1/proposals/:id/view` | 记录方案打开 | P0 |
| `GET /v1/talents` | 演员/内容团队列表 | P0 |
| `GET /v1/venues` | 场馆列表 | P1 |
| `GET /v1/cases` | 案例列表 | P0 |
