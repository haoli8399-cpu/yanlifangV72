# 演立方 V5.0 产品技术方案

> AI 商演/企业活动经营 Agent
> 版本：V5.0-P0-R2 | 日期：2026-07-14 | 负责人：Hermes
> **R2 更新**：经多角色审视优化——vector DB 从 Milvus 降为 pgvector、Temporal 推至 P1、研发预估提至 100 人天、增加冷启动引导/成本上限/审批责任标注/创始人看板/机会列表

---

## 目录

1. [产品定位](#1-产品定位)
2. [技术栈](#2-技术栈)
3. [系统架构](#3-系统架构)
4. [前端方案](#4-前端方案)
5. [后端方案](#5-后端方案)
6. [数据方案](#6-数据方案)
7. [AI/Agent 方案](#7-aiagent-方案)
8. [实施路线](#8-实施路线)
9. [成本估算](#9-成本估算)
10. [V4.7 资产复用](#10-v47-资产复用)
11. [风险与对策](#11-风险与对策)

---

## 1. 产品定位

### 一句话

演立方 V5.0 是面向商演和企业活动的 AI 经营 Agent：接收客户零散的非结构化需求，主动澄清目标与约束，调用真实案例、资源、价格和业务工具，生成可成交、可报价、可履约的活动方案，并推动业务从需求进入成交、交接和复盘。

### 核心 P0 闭环

```
客户微信/语音/文件 → Agent 提取需求 → 动态澄清 → Brief 确认
→ 案例检索 + 资源匹配 → 多方案推演 → 预算模拟 + 风险检查
→ 人工审批 → 方案 H5 发布 → CRM 同步 → 跟进推进
→ 成交/丢单 → 结果回流 → 知识库更新
```

### 与 V4.7 的区别

| 维度 | V4.7 | V5.0 |
|:---|:---|:---|
| 产品形态 | 52 页 SaaS 平台 | 1 个 Agent 工作台 + 客户方案 H5 |
| 核心交互 | 页面点击、表单填写 | Agent 对话 + 结构化面板协作 |
| 数据来源 | Mock 数据 | 真实案例库、资源库、价格规则 |
| AI 角色 | 辅助功能（对话、提取） | 核心引擎（编排、判断、工具调用） |
| 商业模式 | 软件订阅 | 验证真实订单和毛利 |
| 前端复杂度 | 高（多端口、多路由） | 低（2 个视图） |
| AI 复杂度 | 中（单次对话/提取） | 高（状态机、工具链、评估体系） |

---

## 2. 技术栈

### 前端

| 技术 | 版本 | License | 用途 |
|:---|:---|:---|:---|
| React | 19.2 | MIT | UI 框架 |
| TypeScript | 5.8 | — | 类型安全 |
| TanStack Start | 1.168 | MIT | 全栈框架 (SSR) |
| TanStack Router | 1.170 | MIT | 文件系统路由 |
| shadcn/ui | latest | MIT | UI 组件库 (Radix primitives) |
| Tailwind CSS | 4.2 | MIT | 样式 |
| Zustand | 5.x | MIT | 状态管理 |
| TanStack Query | 5.101 | MIT | 服务端状态 |
| lucide-react | 0.575 | ISC | 图标 |

### 后端

| 技术 | 版本 | License | 用途 |
|:---|:---|:---|:---|
| Fastify | 5.3 | MIT | API 服务器 |
| PostgreSQL | 15 | PostgreSQL | 业务数据库 |
| Redis | 7 | BSD-3 | 缓存/队列 |
| MinIO | latest | AGPLv3* | 对象存储 (文件/快照) |
| Zod | 3.24 | MIT | 数据校验 |

> \* MinIO 是 AGPLv3，但如果仅用作内部存储（不作为商业产品分发），不触发 copyleft。如需完全合规，可用 SeaweedFS (Apache 2.0) 替代。

### AI/Agent 引擎（全部 MIT/Apache 2.0）

| 技术 | License | ⭐ | 用途 |
|:---|:---|:---:|:---|
| **LangGraph** | MIT | 37k | Agent 状态机编排、checkpoint、human-in-the-loop |
| **LangChain** | MIT | 141k | Agent SDK 基础 |
| **Instructor** | MIT | 11k | LLM 结构化输出提取 |
| **LlamaIndex** | MIT | 39k | RAG 数据接入与检索编排 |
| **pgvector** | PostgreSQL | — | 向量检索 (P0)。嵌入 PostgreSQL，无需额外部署。P1 数据量超万级后评估切 Milvus |
| **FunASR** | MIT | 19k | 中文语音转写 (阿里达摩院) |
| **Unstructured** | Apache 2.0 | 11k | 文档解析 (PDF/Word/图片) |

### 工作流与观测

| 技术 | License | ⭐ | 用途 |
|:---|:---|:---:|:---|
| **LangGraph Checkpoint** | MIT | — | P0 审批挂起 + 断点恢复。单人审批场景足够，不额外部署服务 |
| **Temporal** | MIT | 21k | **P1 引入** — 多角色审批链、审批超时升级、复杂工作流 |
| **LangFuse** | MIT | 10k | LLM 追踪与成本监控 |
| **DeepEval** | Apache 2.0 | 5k | 离线评估框架 |

### 模型

| 模型 | 用途 | 月成本 |
|:---|:---|:---|
| DeepSeek v4-pro | Agent 推理、方案生成、风险判断 | ¥500-2,000 |
| DeepSeek v4-flash | 简单任务 (事实提取、分类) | ¥100-300 |
| BGE-large-zh (本地) | 中文嵌入向量化 | ¥0 |

### 部署

| 技术 | 用途 |
|:---|:---|
| Docker + Docker Compose | 容器化部署 |
| Nginx | 反向代理 + 静态资源 |
| 腾讯云轻量服务器 | 生产环境 |

---

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        接入层                                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐  │
│  │ 微信小程序 │  │ 企业微信  │  │ Agent 工作台 (React)      │  │
│  │ (已有)    │  │ (消息推送)│  │ • 对话 + 结构化面板       │  │
│  └────┬─────┘  └────┬─────┘  │ • 机会管理                 │  │
│       │             │        └──────────────┬────────────┘  │
│  ┌────┴─────────────┴───────────────────────┴────────────┐  │
│  │                Fastify API 网关 (已有)                 │  │
│  │  /v1/opportunities  /v1/briefs  /v1/plans             │  │
│  │  /v1/resources      /v1/cases   /v1/approvals         │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                       核心服务层                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 多源输入管道  │  │ Agent 编排层  │  │ 工作流 + 审批    │   │
│  │              │  │              │  │                  │   │
│  │ Unstructured │  │ LangGraph    │  │ Temporal (P1)    │   │
│  │ (文档解析)   │  │ (状态机Agent) │  │ (审批/幂等/重试) │   │
│  │              │  │              │  │                  │   │
│  │ FunASR       │  │ Instructor   │  │                  │   │
│  │ (语音转写)   │  │ (结构化提取) │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │              │
│  ┌──────┴─────────────────┴────────────────────┴─────────┐   │
│  │                    共享服务层 (11 个工具)               │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────────────┐  │   │
│  │  │预算引擎 │ │风险检查 │ │提案发布 │ │ CRM 同步器   │  │   │
│  │  │(自建)  │ │(规则+LLM)│ │(H5快照) │ │              │  │   │
│  │  └────────┘ └────────┘ └────────┘ └───────────────┘  │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────────────┐  │   │
│  │  │案例检索 │ │资源检索 │ │评估引擎 │ │观测服务       │  │   │
│  │  │(pgvector)│ │(pgvector)│ │(DeepEval)│ │(LangFuse)    │  │   │
│  │  └────────┘ └────────┘ └────────┘ └───────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                       数据存储层                              │
│  ┌──────────────────────────────────────┐  ┌──────────┐    │
│  │         PostgreSQL + pgvector        │  │  MinIO   │    │
│  │  • 业务数据 (25+6 张表)              │  │ (文件)   │    │
│  │  • 向量检索 (cases/resources/rules)  │  │          │    │
│  └──────────────────────────────────────┘  └──────────┘    │
│  ┌──────────┐                                                   │
│  │  Redis   │                                                   │
│  │ (缓存)   │                                                   │
│  └──────────┘                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 前端方案

### 4.1 页面结构（仅 3 个视图）

| 视图 | 路由 | 说明 |
|:---|:---|:---|
| **Agent 工作台** | `/workspace` | 销售/方案人员的主界面 |
| **机会总览** | `/workspace/opportunities` | 所有机会的简单列表视图 |
| **客户方案 H5** | `/p/:proposalId` | 客户查看方案的移动端页面 |

### 4.2 冷启动引导（首次使用）

新用户打开工作台时，不做空白面板，而是三步引导：

```
┌─────────────────────────────────────────┐
│                                         │
│         🎯  开始一个新的活动机会          │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ ① 粘贴客户需求                  │   │
│   │   把微信聊天、邮件或文档粘贴进来  │   │
│   │   [大文本输入框]                 │   │
│   │                          [下一步]│   │
│   └─────────────────────────────────┘   │
│                                         │
│   ② Agent 自动分析需求                  │
│   ③ 一起做方案                          │
│                                         │
└─────────────────────────────────────────┘
```

每一步只有一个主操作按钮，不给选择焦虑。用户完成后进入正常的工作台布局。

### 4.3 机会总览视图

当机会数量超过 5 个时，工作台左侧增加一个紧凑的机会列表：

| 列 | 内容 |
|:---|:---|
| 公司名 | 客户企业名称 |
| 活动类型 | 年会/团建/发布会 |
| 当前阶段 | 11 个状态之一（彩色标签） |
| 上次跟进 | 相对时间（3小时前/昨天） |
| 负责人 | 销售姓名 |

点击进入该机会的 Agent 工作台。不做完整 CRM——只给"我在哪、还有谁在等"。

### 4.2 Agent 工作台布局

```
┌─────────────────────────────────────────────────────────┐
│ 顶部栏：机会选择器 + 机会状态 + 负责人 + 通知           │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│   Agent 对话区 (60%)     │   结构化面板 (40%)           │
│                          │                              │
│   ┌──────────────────┐   │   ┌──────────────────────┐   │
│   │ AI 消息气泡      │   │   │ 📋 当前 Brief        │   │
│   │ 用户消息气泡     │   │   │ • 活动类型：团建    │   │
│   │ Thinking 动画    │   │   │ • 人数：80人        │   │
│   │ 工具调用可视化   │   │   │ • 已识别 / 缺失     │   │
│   └──────────────────┘   │   │ 完整度：65% ████░░  │   │
│                          │   └──────────────────────┘   │
│   ┌──────────────────┐   │                              │
│   │ 输入区           │   │   ┌──────────────────────┐   │
│   │ Textarea + 发送  │   │   │ 📊 方案版本          │   │
│   │ 建议 Chips       │   │   │ v3 - 平衡策略        │   │
│   └──────────────────┘   │   │ v2 - 保守策略        │   │
│                          │   │ v1 - 突破策略        │   │
│                          │   └──────────────────────┘   │
│                          │                              │
│                          │   ┌──────────────────────┐   │
│                          │   │ ⚠️ 风险审查          │   │
│                          │   │ ⏳ 待审批            │   │
│                          │   │ 🎯 下一步行动        │   │
│                          │   └──────────────────────┘   │
└──────────────────────────┴──────────────────────────────┘
```

### 4.3 前端组件复用策略

| 来源 | 组件 | 用途 |
|:---|:---|:---|
| **已有 (shadcn/ui)** | Button, Card, Badge, Dialog, Progress, Skeleton, Tabs, Input, Textarea, Select, Slider... | 基础 UI，直接 import |
| **已有 (V4.7)** | ProposalPreview (796行) | 客户方案 H5，保留改数据源 |
| **已有 (V4.7)** | StatusTag, FollowUpTimeline, LeadScoreBadge | 状态标签、时间线、评分，直接复用 |
| **开源引入** | [shadcn-admin](https://github.com/satnaing/shadcn-admin) (MIT) | 工作台 Layout 骨架 |
| **开源引入** | [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot) (MIT) | Chat 组件 + 工具调用可视化 |
| **自建** | AgentWorkbenchLayout | 左右分栏 + 面板切换 |
| **自建** | BriefPanel, PlanComparePanel, RiskReviewPanel, ApprovalPanel | 结构化面板组件 |
| **自建** | ToolCallTimeline | Agent 工具调用追踪视图 |

### 4.4 前端不做什么

- ❌ 不建 Admin 管理后台（P0 期间）
- ❌ 不建 m 端（P0 期间）
- ❌ 不建增长工具 H5 独立页面（转为 Agent 可调用工具）
- ❌ 不建 Landing Page
- ❌ 不建多端口路由体系

---

## 5. 后端方案

### 5.1 保留的 V4.7 API (25 个)

| API | 用途 | V5.0 变化 |
|:---|:---|:---|
| auth.ts | 认证 (JWT) | 不变 |
| opportunities.ts | 商机管理 | 状态机扩展为 11 个状态 |
| leads.ts | 线索管理 | 新增 Agent 创建线索 |
| proposals.ts | 方案管理 | 新增版本化 + 快照 |
| quotes.ts | 报价管理 | 不变 |
| follow-ups.ts | 跟进记录 | 不变 |
| demands.ts | 需求管理 | 整合进 Brief 体系 |
| talents.ts | 演员/内容团队 | 扩展为 Agent 可检索的资源 |
| venues.ts | 场馆 | 同上 |
| case-studies.ts | 案例库 | 扩展为知识检索数据源 |
| companies.ts | 企业管理 | 不变 |
| skus.ts | SKU 管理 | 不变 |
| tools.ts | 增长工具 | 转为 Agent 可调用工具 |
| downloads.ts | 下载服务 | 不变 |
| notifications.ts | 通知 | 不变 |
| ai.ts, ai-feedback.ts, ai-templates.ts | AI 相关 | 重写为 Agent 调用接口 |
| 其余 7 个 P2 API | 结算/合同/派单等 | P0 不动 |

### 5.2 新增 V5.0 端点

| 端点 | 方法 | 用途 |
|:---|:---|:---|
| `/v1/opportunities/:id/input` | POST | 多源输入提交 (文本/文件/语音) |
| `/v1/opportunities/:id/brief` | GET/POST | Brief 创建与查询 |
| `/v1/briefs/:id/versions` | GET | Brief 版本历史 |
| `/v1/briefs/:id/confirm` | POST | 人工确认 Brief |
| `/v1/opportunities/:id/plans` | POST | Agent 发起方案生成 |
| `/v1/plans/:id/versions` | GET | 方案版本列表 |
| `/v1/plans/:id/compare` | GET | 方案版本差异对比 |
| `/v1/plans/:id/approve` | POST | 人工审批方案 |
| `/v1/plans/:id/publish` | POST | 发布客户方案 H5 |
| `/v1/plans/:id/snapshot` | GET | 获取方案不可变快照 |
| `/v1/plans/:id/risks` | GET | 风险审查结果 |
| `/v1/cases/search` | GET | 案例检索 (RAG) |
| `/v1/resources/search` | GET | 资源检索 |
| `/v1/opportunities/:id/actions` | GET/POST | 行动建议与任务管理 |
| `/v1/opportunities/:id/outcome` | POST | 成交/丢单/复盘结果录入 |

### 5.3 后端不做

- ❌ P0 不建完整 Admin CRUD 后台（通过数据库直接操作）
- ❌ 不建多角色 RBAC 细粒度权限（P0 仅内部使用）
- ❌ 不建支付、合同、结算系统

---

## 6. 数据方案

### 6.1 业务数据库 (PostgreSQL + pgvector)

**保留的 V4.7 核心表 (18 张)**：
customers, opportunities, leads, proposals, quotes, follow_up_logs, demands, talents, venues, case_studies, companies, skus, performers, ai_feedback_logs, price_configs, notifications, users, migrations

**新增 V5.0 核心表 (6 张)**：

| 表 | 用途 | 关键字段 |
|:---|:---|:---|
| `evidences` | 原始证据存档 (不可变) | raw_content, content_type, source, provider, opportunity_id |
| `brief_versions` | Brief 版本历史 | schema_version, facts(JSONB), inferences(JSONB), open_questions(JSONB), completeness_score, status |
| `plan_versions` | 方案版本历史 | schema_version, strategy, structure(JSONB), resources(JSONB), budget(JSONB), risks(JSONB), snapshot_url |
| `approvals` | 审批记录 | target_type, target_id, risk_level, approver, decision, reason |
| `actions` | 行动/任务 | action_type, suggested_by, description, assigned_to, due_date, status |
| `outcomes` | 复盘结果 | final_revenue, final_cost, final_margin, plan_changes(JSONB), delivery_issues(JSONB) |

> **关键设计**：`brief_versions` 和 `plan_versions` 均包含 `schema_version` 字段。Agent 结构化输出在 P0 期间会频繁迭代（预计 3-5 次 Schema 变更），前端根据 `schema_version` 选择解析策略——旧版本数据可读、新版本向前兼容。

### 6.2 向量检索 (pgvector — P0 方案)

P0 阶段案例库几十条、资源库几十个演员和场馆。**pgvector**（PostgreSQL 扩展，Apache 2.0）完全足够，无需额外部署 Milvus。

```sql
CREATE EXTENSION vector;

-- 案例向量表
CREATE TABLE case_embeddings (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES case_studies(id),
    embedding vector(768),  -- BGE-large-zh 768 维
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 资源向量表
CREATE TABLE resource_embeddings (
    id UUID PRIMARY KEY,
    resource_type TEXT,  -- talent / venue / program
    resource_id UUID,
    embedding vector(768),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX ON case_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON resource_embeddings USING ivfflat (embedding vector_cosine_ops);
```

**迁移策略**：P1 阶段数据量超万级后，评估 pgvector 性能。若检索延迟 >500ms，将向量数据迁移至 Milvus (Apache 2.0)。迁移脚本仅影响向量引擎层，业务代码通过抽象接口调用，切换时不需要改 Agent 代码。

### 6.3 数据分层

```
第1层：原始证据层 (evidences 表 — 不可变)
  └─ 聊天记录、语音转写、上传文件、客户表单

第2层：业务事实层 (opportunities / brief_versions / plan_versions — 版本化)
  └─ 经 Agent 提取和人工确认的结构化信息

第3层：知识资产层 (Milvus — 可检索)
  └─ 案例、资源、规则、异议处理经验

第4层：评估与学习层 (DeepEval — 持续测试)
  └─ 测试集、人工评分、失败样本、模型版本记录
```

---

## 7. AI/Agent 方案

### 7.1 Agent 架构

```
P0：1 个主 Agent + 11 个工具
P1 起：可拆分方案 Agent / 风险 Agent / 策略 Agent (认知冲突隔离)

当前实现：
  LangGraph StateGraph
  ├─ 输入解析节点 → 调用 InputParser 工具
  ├─ 需求理解节点 → Agent 推理
  ├─ 缺口识别节点 → Agent 推理
  ├─ 动态澄清节点 → Agent 推理 + interrupt(人工确认)
  ├─ Brief 确认节点 → 调用 BriefTool
  ├─ 案例/资源检索节点 → 调用 CaseSearch / ResourceSearch
  ├─ 多方案推演节点 → Agent 推理 + 调用 BudgetEngine
  ├─ 风险检查节点 → 调用 RiskChecker
  ├─ 审批挂起节点 → interrupt(等待人工)
  └─ 输出发布节点 → 调用 ProposalPublisher / CRMTool
```

### 7.2 11 个 P0 工具

| # | 工具 | 类型 | 职责 |
|:---:|:---|:---|:---|
| 1 | InputParser | Agent调用 | 原始输入 → facts/inferences/gaps |
| 2 | BriefTool | 工作流 | Brief 版本化保存、完整度计算 |
| 3 | CaseSearch | 工具 | Milvus 案例检索 |
| 4 | ResourceSearch | 工具 | Milvus 资源检索 |
| 5 | BudgetEngine | 工具 | **确定性规则计算** (不用 LLM) |
| 6 | PlanGenerator | Agent调用 | 基于 Brief+案例+资源 生成方案 |
| 7 | RiskChecker | Agent+规则 | 硬规则 + LLM 判断型风险 |
| 8 | ProposalPublisher | 工作流 | 审批通过 → H5 快照 → Token |
| 9 | CRMTool | 工作流 | CRM 机会/任务 同步 |
| 10 | ActionAdvisor | Agent调用 | 下一最佳行动建议 |
| 11 | OutcomeRecorder | 工作流 | 成交/丢单/履约结果记录 |

### 7.3 Agent 行为约束 + 审批责任标注

| 操作 | Agent 权限 | 机制 |
|:---|:---|:---|
| 提取事实、识别缺口 | ✅ 自动 | 标注 confidence + evidence_ids |
| 检索案例、资源 | ✅ 自动 | 标注来源和可用状态 |
| 生成方案草稿 | ✅ 自动 | 标注 pending_confirmations |
| 建议预算区间 | ✅ 自动 | 引用 BudgetEngine 结果 |
| 发布方案给客户 | ❌ | 需人工审批 |
| 写入 CRM | ❌ | 审批后执行 |
| 发送外部消息 | ❌ | 永远不能 |
| 确认档期/价格/合同 | ❌ | 永远不能 |
| 编造不存在的资源 | ❌ | 永远不能 |

**审批责任显式标注**（每个审批节点在 UI 上展示）：

```
┌────────────────────────────────────────────┐
│  ⚠️ 以下内容需要你审核确认                   │
│                                            │
│  🤖 Agent 生成                             │
│  ├─ 方案内容（由 Agent 基于案例库生成）      │
│  ├─ 预算估算（由规则引擎计算）              │
│  └─ 风险提示（由风险检查器识别）            │
│                                            │
│  👤 需要你确认                              │
│  ├─ 方案是否符合客户需求                    │
│  ├─ 报价是否在授权范围内                    │
│  ├─ 承诺内容是否可兑现                      │
│  └─ 档期和资源是否真实可用                  │
│                                            │
│  确认后你对此方案内容负责                    │
│  [驳回修改]              [确认通过]          │
└────────────────────────────────────────────┘
```

让销售有"我在做决策"的体感，而不是"我在给 AI 盖章"。

### 7.4 成本控制

每个机会设置硬上限 **¥30/机会**。LangFuse 按机会追踪 LLM Token 消耗，超限后 Agent 停止当前机会并通知销售"此需求建议转人工处理"。

超限告警不阻断其他机会的正常使用。机会结束后（成交或丢单），该机会的 LLM 成本作为机会数据的一部分归档——用于分析"哪些机会最费 AI"。

### 7.4 评估体系

**离线评估 (DeepEval — 每次模型/提示词/知识库更新后运行)**：

| 指标 | P0 门槛 |
|:---|:---|
| 核心事实准确率 | ≥ 95% |
| 关键事实可追溯率 | 100% |
| 高风险事项漏检率 | 0 个已知高风险样本漏检 |
| 资源存在且状态正确 | 100% |
| 预算与规则引擎一致 | 100% |
| 越权承诺 | 0 次 |
| 方案人工可用评分 | ≥ 4/5 |
| 关键输出 Schema 合规 | ≥ 99% |

**线上业务指标 (LangFuse 监控)**：

| 指标 | 类型 |
|:---|:---|
| 每周进入 Agent 的真实机会数 | 领先指标 |
| Brief 达到可确认状态的比例 | 领先指标 |
| 从需求到首版方案的中位时间 | 结果指标 |
| 方案发送率、报价率、成交率 | 结果指标 |
| 预计毛利与实际毛利偏差 | 结果指标 |
| 人工修改字段与失败原因 | 改进指标 |

---

## 8. 实施路线

### 阶段概览

| 阶段 | 周次 | 核心交付 | 人天 |
|:---|:---|:---|:---:|
| G0 | 第 1-2 周 | 数据准备 + 环境搭建 | 12 天 |
| G1 | 第 3-5 周 | 需求理解 Agent | 22 天 |
| G2 | 第 6-9 周 | 方案与资源决策 + 创始人看板 | 28 天 |
| G3 | 第 10-12 周 | 提案与销售推进 | 22 天 |
| G4 | 第 13 周起 | 履约回流与复盘 | 16 天 |
| **合计** | | | **100 人天** |

### G0：数据与基础 (第 1-2 周)

**交付物**：

- 全部组件 Docker 部署就绪
- 20+ 个真实活动需求样本入库
- 10 个历史案例 → Milvus
- 演员/节目/场馆最小资源数据集
- 核心报价公式 → 规则引擎配置
- 20 个测试样本 + 标准答案 → DeepEval
- LangFuse 部署 + 指标定义

**关卡**：10 个样本端到端跑通，关键报价规则可被验证

### G1：需求理解 Agent (第 3-5 周)

**交付物**：

- 多源输入管道 (Unstructured + FunASR)
- 事实提取 → 缺口识别 → 动态澄清
- Brief 版本化管理 + 人工确认
- 评估集运行达标

**关卡**：核心事实准确率 ≥ 95%，销售愿意在真实机会中试用

### G2：方案与资源决策 (第 6-9 周)

**交付物**：

- 案例检索 + 资源匹配 (RAG)
- 多方案推演 (conservative/balanced/breakthrough)
- 预算模拟 + 风险检查
- 多角色审批工作流
- **创始人看板**（G2 后期）：简易指标页——本周机会数、各阶段分布、Agent 跳过率、方案生成耗时。用于判断"是否继续投入"
- **知识库维护嵌入工作流**：报价审批通过时弹窗"是否保存为案例模板？"；履约结束后弹窗"是否入库为公开案例？"——顺手完成，不打开管理后台

**关卡**：80% 方案经有限修改可达客户沟通标准，无资源和预算严重错误

### G3：提案与销售推进 (第 10-12 周)

**交付物**：

- 方案 H5 发布 + 快照
- CRM 同步 + 下一行动建议
- 客户反馈处理 + 方案修订
- 成交/丢单记录

**关卡**：至少 5 个方案发送给真实客户，至少 2 个进入报价或成交

### G4：履约回流与复盘 (第 13 周起)

**交付物**：

- 成交交接包自动生成
- 履约结果录入 + 差异分析
- 案例入库 + 规则更新 + 评估样本补充

**关卡**：至少 1 个项目完成从成交到复盘的数据闭环

---

## 9. 成本估算

### 9.1 研发成本

| 阶段 | 任务 | 估算人天 |
|:---|:---|:---:|
| G0 | 数据准备 + 环境搭建 + 样本整理 | 12 天 |
| G1 | 多源输入 + Agent 编排 + Brief 体系 + 冷启动引导 | 22 天 |
| G2 | RAG + 方案生成 + 预算引擎 + 风险检查 + 创始人看板 + 知识库嵌入 | 28 天 |
| G3 | H5 发布 + CRM 同步 + 前端工作台 + 审批责任标注 + 机会总览 | 22 天 |
| G4 | 结果回流 + 知识库更新 + 评估迭代 + 成本上限 | 16 天 |
| **合计** | | **100 人天 (约 5 人月)** |

> 预估包含 30% 缓冲：开发者学习曲线、环境调试、FunASR 中文调优、Unstructured 格式兼容、LangGraph checkpoint 调试。

### 9.2 基础设施月成本

| 项目 | 规格 | 月成本 |
|:---|:---|:---|
| 腾讯云轻量服务器 | 4C8G | ¥300-500 |
| DeepSeek v4-pro API | 按量 (预估 50 万 token/天) | ¥500-2,000 |
| DeepSeek v4-flash API | 按量 (简单任务) | ¥100-300 |
| FunASR GPU (可选) | 按需或阿里云 ASR API | ¥0-1,000 |
| 微信/企业微信 API | 基础接口 | ¥0 |
| 域名 + DNS | — | ¥20 |
| **合计** | | **¥920-3,820/月** |

### 9.3 软件许可成本

| 软件 | License | 费用 |
|:---|:---|:---|
| LangGraph, LangChain, Instructor, LlamaIndex | MIT | ¥0 |
| Milvus | Apache 2.0 | ¥0 |
| FunASR, Unstructured | MIT, Apache 2.0 | ¥0 |
| Temporal | MIT | ¥0 |
| LangFuse (自建) | MIT | ¥0 |
| DeepEval | Apache 2.0 | ¥0 |
| PostgreSQL, Redis | PostgreSQL, BSD-3 | ¥0 |
| **合计** | | **¥0 (全部开源)** |

---

## 10. V4.7 资产复用

### 直接保留

| 资产 | 用途 |
|:---|:---|
| TypeScript 严格模式配置 | 不动 |
| Tailwind CSS 4 + styles.css | 不动 |
| Design Token (--yl-*) | 品牌色 #5B4FD6 不变 |
| shadcn/ui 40+ 组件 | 直接 import |
| Zustand + TanStack Query | 状态管理不动 |
| Fastify 5.3 + JWT + RBAC | 后端框架不动 |
| PostgreSQL 25 张表 (部分) | 业务表保留 |
| Nginx + Docker 部署 | 基础设施不动 |

### 保留但改造

| 资产 | V5.0 变化 |
|:---|:---|
| ProposalPreview (796行) | 客户方案 H5，改数据源 |
| FollowUpTimeline, StatusTag, LeadScoreBadge | 直接复用 |
| 后端 25 个 API | 扩展 V5.0 新端点 |
| opportunities, leads, proposals 表 | 新增字段，不改结构 |

### 归档

| 资产 | 原因 |
|:---|:---|
| 52 个前端路由 (除 2 个) | V5.0 只需 2 个视图 |
| Admin 端全部 16 页 | P0 不做 Admin |
| Agent 端 7 页 | 整合为单一工作台 |
| m 端 6 页 | P0 不做 m 端 |
| 增长工具 3 页 | 转为 Agent 工具 |
| 8 个 v0/Trae Design 预览页 | 归档为 UI 参考 |
| Mock 数据 (全部) | 替换为真实数据 |
| ToolQuestionFlow, ToolResultPage, MinimalRequirementForm | 不再适用的组件 |

### 复用率

| 层 | 保留率 |
|:---|:---:|
| 前端页面 | 3% |
| 共享组件 | 53% |
| 后端 API | 78% |
| 数据库表 | 72% |
| UI 组件 (shadcn) | 100% |
| 基础设施 | 100% |

---

## 11. 风险与对策

| 风险 | 等级 | 对策 |
|:---|:---:|:---|
| 真实数据准备不足，G0 卡住 | 🔴 高 | 缩小 ICP 范围，先用 10 个样本启动，边做边补 |
| Agent 编造资源/越权报价 | 🔴 高 | Schema 强约束 + 评估体系从第1天上线 + 人工审批不可绕过（含显式责任标注） |
| 团队不愿在真实机会中使用 | 🟠 中 | 冷启动引导 + 不做全量管理后台 + 让 Agent 先帮销售省时间（粘贴聊天→自动提取→方案草稿） |
| 前端复杂度被低估 | 🟠 中 | "2 个视图" ≠ "简单"——Agent 工作台是实时状态机驱动的复杂 SPA。预留 G3 额外 8 天缓冲 |
| 方案质量不如资深方案人员 | 🟠 中 | P0 目标是"缩小差距+加速"，不是"替代人"；保留人工修改、审批、跳过 Agent 的后门 |
| LLM 成本失控 | 🟡 低 | LangFuse 按机会核算成本 + ¥30/机会硬上限 + v4-flash 处理简单任务 |
| AI 服务不可用导致业务中断 | 🟡 低 | 降级机制：每个关键节点有纯人工操作后门 + 失败不丢数据 |
| V4.7 的 Lovable/Git 耦合 | 🟡 低 | V5.0 新建 repo，不污染 V4.7 的 commit 历史 |
| Schema 频繁变更导致旧数据不可读 | 🟡 低 | `schema_version` 字段 + 前端版本适配 + 迁移脚本 |
| 知识库长期无人维护 | 🟡 低 | 嵌入工作流——审批/成交时弹窗顺手入库，不依赖"专门维护" |

---

> **附录**：
> - 详细架构设计：`docs/ARCHITECTURE_V5.md`
> - 产品需求文档：`演立方_V5.0_PRD_AI商演企业活动经营Agent版`
> - 开源工具调研报告：`~/ai_operations_agent_tools_research.md`
