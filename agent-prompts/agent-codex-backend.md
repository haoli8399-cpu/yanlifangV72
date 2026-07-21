# Agent Codex: 演立方 V4.7 后端扩展

## 任务目标

在现有 Fastify 5 后端（17张表 + 21组API）基础上，新增 V4.7 所需的数据库表和 API 端点。**不推倒重来，增量扩展。**

## 工作空间

```
/Users/wudixingyunxingleo/projects/演立方/
```

## 前置参考

- 项目架构：`project-center/ARCHITECTURE.md`
- 项目控制：`project-center/PROJECT_CONTROL.md`
- 现有 Schema：`backend/migrations/001_schema.sql`（1025行，13张核心表）
- 现有迁移005：`backend/migrations/005_add_opportunities_quotes_followups.sql`（商机/报价/跟进表，参考格式）
- V4.7 PRD：`docs/archives/product/演立方_V4.7_PRD_MVP落地与增长工具技术附件增强版.docx`
- 现有 API 结构：`backend/src/api/`（21个路由文件，参考 `opportunities.ts` 或 `quotes.ts` 的写法）

## 执行步骤

### Step 1：审计现有代码

先读取并理解：
1. `backend/migrations/001_schema.sql` — 理解 ENUM 类型、表结构、索引、RLS 模式
2. `backend/migrations/005_add_opportunities_quotes_followups.sql` — 理解新增表的格式规范
3. `backend/src/api/` 下任意一个路由文件 — 理解 API 编写模式（Fastify + Zod + 中间件）
4. `backend/src/types/` — 理解类型定义方式
5. `backend/package.json` — 确认依赖

### Step 2：新增数据库迁移文件

创建 `backend/migrations/008_add_v47_tables.sql`，包含以下8张新表：

```sql
-- 1. talents — 演员/内容团队资料库（从 performers 概念升级）
--    id, name, role_type(脱口秀/即兴/主持/培训/魔术/乐队),
--    tags[], style, bio, photos[], videos[], 
--    business_experience(text), representative_cases[],
--    base_price(decimal, 内部成本，对外不展示), 
--    display_price(decimal, 对外参考价), rating, status

-- 2. venues — 场馆资源库
--    id, name, city, address, capacity_range(int4range),
--    images[], stage_equipment(text), suitable_scenes[],
--    price_range(varchar), cooperation_status, status

-- 3. case_studies — 案例库（从 cases 表升级，补充行业/场景标签）
--    id, title, client_type, event_scene, headcount, budget_range,
--    content_combo(text), effect_description, customer_feedback,
--    satisfaction(varchar), is_public(boolean), cover_image

-- 4. proposals — 方案主表
--    id, code(varchar 方案编号如 YLF-2026-0042),
--    customer_name, event_theme, event_date, headcount, budget(varchar),
--    understanding(text 需求理解), status(draft/internal_review/shared/viewed/
--      downloaded/modified_by_client/revised/approved/converted_to_order/lost),
--    valid_until(timestamp), created_by, consultant_name, consultant_phone,
--    created_at, updated_at

-- 5. proposal_versions — 方案版本
--    id, proposal_id(uuid FK), version(int), snapshot(jsonb 当时方案的完整快照),
--    change_note(text), created_by, created_at

-- 6. proposal_modules — 方案模块
--    id, proposal_id, module_type(understanding/plan_structure/budget/
--      performers/cases/service_notes), sort_order, content(jsonb), created_at

-- 7. leads — 工具线索
--    id, tool_type(budget_calculator/insurance_plan/annual_plan),
--    source_channel, source_user, answers(jsonb 结构化答案),
--    ai_result_summary(text), ai_result_json(jsonb),
--    score(int 线索评分), priority(high/medium/low),
--    status(new/contacted/proposal_sent/viewed/won/lost),
--    assigned_to, customer_name, company, phone, wechat(选填),
--    created_at, updated_at

-- 8. tool_results — 工具结果（与 leads 关联）
--    id, lead_id, tool_type, result_json(jsonb), ai_output(text),
--    share_count(int), download_count(int), created_at
```

**规范要求：**
- 参考 `005_add_opportunities_quotes_followups.sql` 的格式（COMMENT ON TABLE/COLUMN、索引、外键）
- 所有 ID 使用 UUID PRIMARY KEY DEFAULT gen_random_uuid()
- 时间字段使用 TIMESTAMPTZ
- 每个表至少添加 2 个索引
- 使用 IF NOT EXISTS 避免重复创建
- JSONB 字段用于灵活数据（answers、result_json、snapshot、content）

### Step 3：新增 API 端点

在 `backend/src/api/` 下新建/扩展以下路由文件：

**3.1 `tools.ts` — 工具API（P0）**
```
POST   /v1/tools/submit          — 提交工具答案，生成AI结果
  Body: { tool_type, answers: {...}, source_channel?, source_user? }
  Response: { result_id, result: {...}, lead_id }
  
GET    /v1/tools/:id/result      — 获取工具结果
  Response: { result_json, ai_output, share_url }

POST   /v1/tools/:id/share       — 记录分享行为
  Body: { source_channel }
```

**3.2 `leads.ts` — 线索API（P0）**
```
POST   /v1/leads                 — 创建线索（留资后）
  Body: { tool_type, tool_result_id, name?, company?, phone?, wechat? }
  Response: { lead_id, score, priority }

GET    /v1/leads                 — 线索列表（CRM）
  Query: ?status=&priority=&assigned_to=&page=&pageSize=
  Response: { data: [...], total, page, pageSize }

GET    /v1/leads/:id             — 线索详情
  Response: { lead, tool_result, proposal? }

PATCH  /v1/leads/:id             — 更新线索状态/分配
  Body: { status?, assigned_to?, notes? }

POST   /v1/leads/:id/convert     — 线索转正式方案
  Response: { proposal_id }
```

**3.3 `proposals.ts` — 方案API（P0）**
```
POST   /v1/proposals             — 创建方案
  Body: { lead_id?, customer_name, event_theme, understanding, 
          plan_structure, budget, performers[], cases[], consultant }
  Response: { proposal_id, code, share_url }

GET    /v1/proposals/:id         — 获取方案（客户H5用，公开，token验证）
  Query: ?token=
  Response: { proposal, valid_until, is_expired }

PATCH  /v1/proposals/:id         — 编辑方案（销售端）
  Body: { understanding?, plan_structure?, budget?, performers?, cases? }

POST   /v1/proposals/:id/view    — 记录方案打开（埋点）
  Body: { device_info? }

GET    /v1/proposals             — 方案列表（销售端）
  Query: ?status=&page=&pageSize=
```

**3.4 `talents.ts` — 演员/内容团队API（P0）**
```
GET    /v1/talents               — 列表
  Query: ?role_type=&tags=&status=active

GET    /v1/talents/:id           — 详情
  Response: { talent } （对外不返回 base_price，仅返回 display_price）
```

**3.5 `cases.ts` — 案例API（P0，扩展已有）**
```
GET    /v1/cases                 — 列表
  Query: ?client_type=&event_scene=&is_public=true

GET    /v1/cases/:id             — 详情
```

**3.6 `venues.ts` — 场馆API（P1）**
```
GET    /v1/venues                — 列表
  Query: ?city=&capacity=

GET    /v1/venues/:id            — 详情
```

### Step 4：API 编写规范

每个端点必须遵循现有后端规范（参考 `backend/src/api/opportunities.ts` 等）：

```typescript
// 1. Zod Schema 校验所有请求参数
const createProposalSchema = z.object({
  lead_id: z.string().uuid().optional(),
  customer_name: z.string().min(1),
  event_theme: z.string().min(1),
  // ...
});

// 2. 统一响应包裹
// 成功：reply.send({ code: 0, data: {...} })
// 错误：reply.code(400).send({ code: 9003, message: "..." })

// 3. 分页标准
// Query: page (1-based), pageSize (default 20, max 100)
// Response: { data, total, page, pageSize }

// 4. 认证中间件
// 公开端点（客户H5查看方案）：不需要 auth
// 销售/管理端点：使用 fastify.authMiddleware
```

### Step 5：Mock 模式

P0 阶段所有端点使用 **Mock 数据返回**，不需要真实连接 PostgreSQL：
- 创建 `backend/src/mock/v47-data.ts` 存放 Mock 数据
- 每个端点返回合理的 Mock 数据
- 接口签名和响应格式必须与真实实现一致（方便后续替换）
- AI 生成逻辑用静态模板（不同条件返回不同模板）

## 验收标准

1. ✅ `backend/migrations/008_add_v47_tables.sql` 创建完成，包含8张新表
2. ✅ `backend/src/api/tools.ts` 创建完成（3个端点）
3. ✅ `backend/src/api/leads.ts` 创建完成（5个端点）
4. ✅ `backend/src/api/proposals.ts` 创建完成（4个端点）
5. ✅ `backend/src/api/talents.ts` 创建完成（2个端点）
6. ✅ `backend/src/api/venues.ts` 创建完成（2个端点，可为P1简化）
7. ✅ 扩展 `backend/src/api/cases.ts`（如已存在则扩展，否则新建）
8. ✅ 所有端点使用 Zod Schema 校验
9. ✅ `backend/src/mock/v47-data.ts` 包含种子 Mock 数据
10. ✅ TypeScript 编译无错误（`npx tsc --noEmit`）

## 禁止

- ❌ 不要删除或修改已有的17张表结构（只新增不修改）
- ❌ 不要修改已有 API 端点（只新增路由文件）
- ❌ 不要在对外API中返回 `base_price`（成本价仅内部可见）
- ❌ 不要使用 `@ts-nocheck`
- ❌ 不要连接真实数据库（全部Mock数据）
- ❌ 不要修改 PRD 定义的业务逻辑

## 响应语言

中文。
