# 演立方 V4.7 — 技术架构事实源

> **这是技术实现的唯一事实源。所有开发和设计 Agent 必须参考本文件。**

---

## 1. 技术栈

| 层级 | 技术 | 版本 |
|:---|:---|:---|
| **PC 前端框架** | TanStack Start + React | 19.2 |
| **UI 组件库** | Ant Design + Radix UI (shadcn) | 6.5 / latest |
| **样式方案** | Tailwind CSS + CSS Variables | 4.2 |
| **路由** | TanStack Router (文件系统路由) | 1.170 |
| **状态管理** | Zustand + TanStack Query | 5.x |
| **表单** | React Hook Form + Zod | 7.71 / 3.24 |
| **图表** | Recharts | 2.15 |
| **拖拽** | @dnd-kit | 6.3 |
| **后端框架** | Fastify | 5.3 |
| **后端校验** | Zod | 3.24 |
| **数据库** | PostgreSQL | 15 |
| **缓存** | Redis (ioredis) | 5.11 |
| **认证** | JWT (@fastify/jwt) | HS256 |
| **构建工具** | Vite (Lovable config) | 8.0 |
| **SSR** | Nitro | 3.0 beta |
| **包管理** | npm (package-lock) + bun (bun.lock) | — |
| **TypeScript** | 5.8 | strict mode |
| **Lint** | ESLint 9 + Prettier 3 | — |
| **小程序** | uni-app + Vue 3 | — |
| **部署** | Nginx + Docker | 腾讯云香港 |

---

## 2. 系统结构

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
    │ React 19   │          │ React 19  │          │ React 19  │
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
```

### 前端模块关系

```
codebase/src/
├── routes/           # 52 条文件系统路由（6 个角色模块）
│   ├── admin.*.tsx   # 运营后台（16 页）
│   ├── agent.*.tsx   # 企业客户 PC（7 页）
│   ├── supplier.*.tsx # 销售工作台（14 页）
│   ├── m.*.tsx       # C 端移动 Web（6 页）
│   ├── tools.*.tsx   # 增长工具 H5（3 页）
│   ├── p/            # 客户方案 H5
│   ├── __root.tsx    # 根布局
│   └── index.tsx     # 首页
├── shared/           # 共用层
│   ├── components/   # 17 个共用组件
│   ├── mock/         # 6 组 Mock 数据
│   ├── types.ts      # 全局类型定义
│   ├── theme.ts      # Ant Design 主题配置
│   ├── design-tokens.css  # 独立 Design Token
│   └── utils/        # 工具函数
├── components/ui/    # shadcn/ui 基础组件（Radix）
├── hooks/            # 自定义 Hooks
├── styles.css        # 全局样式 + Tailwind Theme
└── router.tsx        # 路由配置
```

### 后端模块关系

```
backend/src/
├── index.ts          # 入口：Fastify 实例 + 路由注册 + 插件
├── api/              # 31 组 API 路由
│   ├── auth.ts             # 认证（登录/JWT）
│   ├── skus.ts             # SKU 管理
│   ├── demands.ts          # 需求管理
│   ├── opportunities.ts    # 商机管理
│   ├── quotes.ts           # 报价管理
│   ├── follow-ups.ts       # 跟进记录
│   ├── proposals.ts        # V4.7 新增：方案管理
│   ├── leads.ts            # V4.7 新增：线索管理
│   ├── tools.ts            # V4.7 新增：增长工具 API
│   ├── talents.ts          # V4.7 新增：演员/内容团队
│   ├── venues.ts           # V4.7 新增：场馆
│   ├── case-studies.ts     # V4.7 新增：案例库
│   ├── downloads.ts        # V4.7 新增：下载服务
│   └── ...（25 组旧 API）
├── types/index.ts    # TypeScript 类型（JwtPayload 等）
├── utils/redis.ts    # Redis 连接管理
├── middleware/        # 中间件
│   ├── rbac.ts       # 角色权限控制
│   └── error.ts      # 错误处理
└── migrations/       # 9 个 SQL 迁移文件
```

---

## 3. API 定义（V4.7 新增接口）

### 3.1 增长工具

| 方法 | 路径 | 用途 | 权限 | 状态 |
|:---|:---|:---|:---|:---:|
| POST | `/v1/tools/submit` | 提交工具答案，AI 生成结果 | 公开 | 🔄 |
| GET | `/v1/tools/:id/result` | 获取工具计算结果 | 公开 | 🔄 |

### 3.2 线索管理

| 方法 | 路径 | 用途 | 权限 | 状态 |
|:---|:---|:---|:---|:---:|
| POST | `/v1/leads` | 创建线索（留资后） | 公开 | 🔄 |
| GET | `/v1/leads` | 线索列表（CRM） | Supplier | 🔄 |
| PATCH | `/v1/leads/:id` | 更新线索状态 | Supplier | 🔄 |

### 3.3 方案管理

| 方法 | 路径 | 用途 | 权限 | 状态 |
|:---|:---|:---|:---|:---:|
| POST | `/v1/proposals` | 创建方案 | Supplier | 🔄 |
| GET | `/v1/proposals/:id` | 获取方案详情（客户H5用） | 公开 | 🔄 |
| PATCH | `/v1/proposals/:id` | 编辑方案 | Supplier | 🔄 |
| POST | `/v1/proposals/:id/view` | 记录方案被打开 | 公开 | 🔄 |

### 3.4 资源库

| 方法 | 路径 | 用途 | 权限 | 状态 |
|:---|:---|:---|:---|:---:|
| GET | `/v1/talents` | 演员/内容团队列表 | Supplier/Admin | 🔄 |
| GET | `/v1/venues` | 场馆列表 | Supplier/Admin | 🔄 |
| GET | `/v1/case-studies` | 案例列表 | 公开 | 🔄 |

> ⚠️ 以上 API 均为 Codex 已交付代码，**待部署验证**。  
> 完整已有 API（25组）见 `project-center/ARCHITECTURE.md`。

---

## 4. 数据库定义

### 4.1 已有表（17张，从旧项目迁移）

| 表 | 用途 | V4.7 状态 |
|:---|:---|:---|
| `skus` | 方案模板 | ✅ 复用 |
| `performers` | 艺人 | ✅ 升级为 talents |
| `demands` | 需求 | ✅ 复用 |
| `opportunities` | 商机 | ✅ 复用 |
| `quotes` | 报价 | ✅ 复用 |
| `follow_up_logs` | 跟进记录 | ✅ 复用 |
| `cases` | 案例 | ✅ 复用 |
| `companies` | 企业 | ✅ 复用 |
| `assignments` | 排期 | ⏳ P2 |
| `settlements` | 结算 | ⏳ P2 |
| `reviews` | 评价 | ⏳ P2 |
| `credit_score_logs` | 信誉 | ⏳ P2 |
| `ai_feedback_logs` | AI反馈 | ✅ 复用 |
| `price_configs` | 价格配置 | ✅ 复用 |

### 4.2 V4.7 新增表（8张）

| 表 | 用途 | 关键字段 |
|:---|:---|:---|
| `proposals` | 方案主表 | customer_name, event_theme, status(draft→shared→viewed→approved→converted) |
| `proposal_versions` | 方案版本 | proposal_id, version, snapshot |
| `proposal_modules` | 方案模块 | proposal_id, module_type, content |
| `proposal_assets` | 方案引用素材 | proposal_id, asset_type, asset_id |
| `leads` | 工具线索 | tool_type, answers, score, status, assigned_to |
| `tool_results` | 工具结果 | lead_id, tool_type, result_json, ai_output |
| `talents` | 演员/内容团队 | name, role_type, tags, base_price（对外不展示成本） |
| `venues` | 场馆 | name, city, capacity, images, price_range |

### 4.3 迁移文件

| 文件 | 内容 |
|:---|:---|
| `backend/migrations/001_schema.sql` | 初始表结构 |
| `backend/migrations/002_seed.sql` | 种子数据 |
| `backend/migrations/008_add_v47_tables.sql` | V4.7 新增 8 张表 |

---

## 5. 权限和认证

| 维度 | 实现 |
|:---|:---|
| 登录方式 | JWT（用户名+密码） |
| Token 存储 | 前端 localStorage / Cookie |
| 算法 | HS256 |
| 密钥 | 环境变量 `JWT_SECRET`（默认值仅用于开发） |
| 角色 | agent / supplier / admin / public |
| 接口鉴权 | Fastify JWT 中间件 |
| 页面鉴权 | 路由守卫 + RBAC 中间件 |

---

## 6. 环境管理

| 环境 | 用途 | Agent 权限 |
|:---|:---|:---|
| **Local** | 本地开发 | ✅ 可直接修改 |
| **Preview** | 验收环境 | ⚠️ 仅通过部署流程 |
| **Production** | 生产环境 | ❌ 禁止 Agent 直接操作 |

### 规则

1. Agent 只允许直接修改 Local 环境
2. Preview 用于验收，通过部署 Workflow 上线
3. Production 不允许任何 Agent 直接操作
4. 测试数据库和生产数据库必须隔离
5. **环境变量不得写入仓库**（.gitignore 必须包含 .env）
6. 敏感信息（密钥/Token/密码）不得出现在日志、代码注释、commit message 中

---

## 7. 数据库变更规范

任何数据库变更必须包含：

1. **变更前结构** — 当前 DDL
2. **变更后结构** — 目标 DDL
3. **迁移脚本** — `backend/migrations/NNN_description.sql`
4. **历史数据处理** — 已有数据的兼容方案
5. **兼容方案** — 新旧代码共存期的处理
6. **回滚脚本** — 如何撤销变更
7. **备份说明** — 是否需要备份
8. **风险等级** — Low / Medium / High / Critical

**原则：**
- 优先新增字段/表，不直接删除
- 先兼容 → 再迁移 → 再验证 → 最后清理旧字段

---

> **迁移来源：** 整合自 `project-center/ARCHITECTURE.md` + 代码实际扫描  
> **原文件保留：** `project-center/ARCHITECTURE.md` 继续作为详细参考
