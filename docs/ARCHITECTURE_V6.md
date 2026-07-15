# 演立方 V6.0 技术架构与实施方案

> 客户—销售双端 AI 商演经营协作平台
> 版本：V6.0-ARCH-V1 | 日期：2026-07-14 | 负责人：Hermes
> **继承**：V5.0 技术方案 (SOLUTION_V5.md) + V5.0 架构设计 (ARCHITECTURE_V5.md)
> **配套文档**：`docs/PRD_V6.md`（产品需求）、`docs/SOLUTION_V5.md`（V5.0 方案，历史参考）

---

## 目录

1. [系统架构全景](#1-系统架构全景)
2. [技术栈](#2-技术栈)
3. [核心组件职责](#3-核心组件职责)
4. [多 Agent 架构设计](#4-多-agent-架构设计)
5. [11 个 P0 工具完整规格](#5-11-个-p0-工具完整规格)
6. [Agent 结构化输出 Schema](#6-agent-结构化输出-schema)
7. [数据方案](#7-数据方案)
8. [前端方案](#8-前端方案)
9. [后端方案](#9-后端方案)
10. [安全与权限](#10-安全与权限)
11. [部署架构](#11-部署架构)
12. [成本估算](#12-成本估算)
13. [分阶段实施路线](#13-分阶段实施路线)
14. [V4.7 资产复用](#14-v47-资产复用)
15. [风险与对策](#15-风险与对策)

---

## 1. 系统架构全景

```
┌─────────────────────────────────────────────────────────────┐
│                        接入层 (Edge)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ 微信小程序 │  │ 企业微信  │  │ 客户 H5  │  │销售工作台   │  │
│  │ (已有)    │  │ (消息推送)│  │(移动端)  │  │(React)     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │             │             │               │          │
│  ┌────┴─────────────┴─────────────┴───────────────┴───────┐  │
│  │                  Fastify API 网关 (已有)                 │  │
│  │                                                        │  │
│  │  客户端 API (新增)：           销售端 API (保留+扩展)：   │  │
│  │  POST /c/chat                  /v1/opportunities        │  │
│  │  GET  /c/brief/:id             /v1/briefs               │  │
│  │  POST /c/brief/:id/confirm     /v1/plans                │  │
│  │  GET  /c/proposal/:id          /v1/approvals            │  │
│  │  POST /c/proposal/:id/feedback /v1/resources/search     │  │
│  │                                /v1/cases/search         │  │
│  │  权限中间件：按 role 过滤字段   /v1/outcomes             │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                       核心服务层                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                 多源输入管道                           │    │
│  │  ┌──────────────┐  ┌──────────────┐                   │    │
│  │  │ Unstructured │  │   FunASR     │                   │    │
│  │  │ (PDF/Word/图)│  │ (中文语音转写)│                   │    │
│  │  └──────────────┘  └──────────────┘                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                Agent 编排层 (LangGraph)                │    │
│  │                                                       │    │
│  │  P0: 主 Agent (StateGraph)                            │    │
│  │  P1: 主Agent + 方案Agent + 风险Agent                   │    │
│  │  P1晚期: + 策略Agent                                  │    │
│  │                                                       │    │
│  │  Checkpoint → PostgreSQL (断点恢复)                   │    │
│  │  Interrupt  → 人工审批挂起                             │    │
│  │  Instructor → 结构化输出 (Pydantic Schema)            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │               工作流 + 审批 (P0: LangGraph Checkpoint) │    │
│  │               工作流 + 审批 (P1: Temporal)             │    │
│  │  • 审批挂起/超时升级 • 幂等执行 • 审计日志             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                  共享服务层 (11 个工具)                │    │
│  │                                                       │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐  │    │
│  │  │预算引擎 │ │风险检查 │ │提案发布 │ │  CRM 同步   │  │    │
│  │  │(规则)  │ │(规则+LLM)│ │(H5快照) │ │              │  │    │
│  │  └────────┘ └────────┘ └────────┘ └──────────────┘  │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐  │    │
│  │  │案例检索 │ │资源检索 │ │评估引擎 │ │  观测服务    │  │    │
│  │  │(pgvector)│ │(pgvector)│ │(DeepEval)│ │(LangFuse)  │  │    │
│  │  └────────┘ └────────┘ └────────┘ └──────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                       数据存储层                              │
│  ┌──────────────────────────────────────┐  ┌──────────┐    │
│  │       PostgreSQL + pgvector          │  │  MinIO   │    │
│  │  • 业务数据 (25+8 张表)              │  │ (文件)   │    │
│  │  • 向量检索 (cases/resources/actors) │  │          │    │
│  └──────────────────────────────────────┘  └──────────┘    │
│  ┌──────────┐                                                   │
│  │  Redis   │                                                   │
│  │ (缓存)   │                                                   │
│  └──────────┘                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈

### 2.1 前端

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

### 2.2 后端

| 技术 | 版本 | License | 用途 |
|:---|:---|:---|:---|
| Fastify | 5.3 | MIT | API 服务器 |
| PostgreSQL | 15 + pgvector | PostgreSQL | 业务数据库 + 向量检索 |
| Redis | 7 | BSD-3 | 缓存/队列 |
| MinIO | latest | AGPLv3* | 对象存储 (文件/快照) |
| Zod | 3.24 | MIT | 数据校验 |

> \* MinIO AGPLv3：若仅用作内部存储（不作为商业产品分发），不触发 copyleft。如需完全合规，可用 SeaweedFS (Apache 2.0) 替代。

### 2.3 AI/Agent 引擎（全部 MIT/Apache 2.0）

| 技术 | License | ⭐ | 用途 |
|:---|:---|:---:|:---|
| **LangGraph** | MIT | 37k | Agent 状态机编排、checkpoint、human-in-the-loop |
| **LangChain** | MIT | 141k | Agent SDK 基础 |
| **Instructor** | MIT | 11k | LLM 结构化输出提取 (Pydantic) |
| **LlamaIndex** | MIT | 39k | RAG 数据接入与检索编排 |
| **pgvector** | PostgreSQL | — | 向量检索 (P0)。嵌入 PostgreSQL。P1 数据量超万级后评估切 Milvus |
| **FunASR** | MIT | 19k | 中文语音转写 (阿里达摩院) |
| **Unstructured** | Apache 2.0 | 11k | 文档解析 (PDF/Word/图片) |

### 2.4 工作流与观测

| 技术 | License | ⭐ | 用途 |
|:---|:---|:---:|:---|
| **LangGraph Checkpoint** | MIT | — | P0 审批挂起 + 断点恢复 |
| **Temporal** | MIT | 21k | **P1 引入** — 多角色审批链、审批超时升级 |
| **LangFuse** | MIT | 10k | LLM 追踪与成本监控 |
| **DeepEval** | Apache 2.0 | 5k | 离线评估框架 |

### 2.5 模型选型

| 模型 | 用途 | 预估月成本 |
|:---|:---|:---|
| DeepSeek v4-pro | Agent 推理、方案生成、风险判断、客户对话 | ¥500-2,000 |
| DeepSeek v4-flash | 简单任务 (事实提取、分类、反馈总结) | ¥100-300 |
| BGE-large-zh (本地) | 中文嵌入向量化 (案例/资源) | ¥0 |

### 2.6 部署

| 技术 | 用途 |
|:---|:---|
| Docker + Docker Compose | 容器化部署 |
| Nginx | 反向代理 + 静态资源 |
| 腾讯云轻量服务器 | 生产环境 (4C8G) |

---

## 3. 核心组件职责

### 3.1 多源输入管道

| 输入类型 | 处理组件 | 输出 | Pipeline |
|:---|:---|:---|:---|
| 客户 AI 对话文本 | 直接入 Agent | 结构化消息 | API → Agent |
| 微信聊天文本 | 直接解析 | 结构化消息序列 | 粘贴→分段→去重→标注来源 |
| 语音消息 | **FunASR** | 转写文本 + 说话人标注 | 上传→转写→标注 |
| Word/PDF 文档 | **Unstructured** | 提取文本 + 表格 + 图片描述 | 上传→解析→结构化 |
| 图片 (截图/方案) | Unstructured + OCR | 文字提取 | 上传→OCR→结构化 |

**关键设计**：
- 所有输入保留原始副本（`evidences.raw_content` 不可变）
- 每条 Evidence 标注来源、时间、提供者
- Pipeline 独立于 Agent，可并行处理

### 3.2 Agent 编排层 (LangGraph)

```
┌─────────────────────────────────────────────────────────────┐
│                   LangGraph Agent 状态机                      │
│                                                              │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐  │
│  │ 输入解析 │───→│ 需求理解  │───→│ 缺口识别  │───→│ 澄清   │  │
│  │ (工具)  │    │ (Agent)  │    │ (Agent)  │    │(Agent) │  │
│  └─────────┘    └──────────┘    └──────────┘    └───┬────┘  │
│                                                     │       │
│                                             完整度≥阈值│       │
│                                                     ↓       │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐  │
│  │ 输出发布 │←───│ 风险检查  │←───│ 方案推演  │←───│ Brief  │  │
│  │(工作流)  │    │(Agent+工具)│   │(Agent+工具)│   │ 确认   │  │
│  └─────────┘    └──────────┘    └──────────┘    └────────┘  │
│                                                              │
│  P1 起：方案推演 → 方案 Agent (子Agent调用)                  │
│  P1 起：风险检查 → 风险 Agent (子Agent调用)                  │
│                                                              │
│  Checkpoint：PostgreSQL 持久化，断点恢复                      │
│  Interrupt：人工审批挂起，等待回调                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 工作流 + 审批

**P0 (LangGraph Checkpoint)**：

| 能力 | 实现 |
|:---|:---|
| 审批挂起 | `interrupt()` 挂起节点，等待 API 回调 |
| 断点恢复 | `SqliteSaver` (P0) / `PostgresSaver` (生产) |
| 审批超时 | 应用层定时检查 + 通知 |
| 幂等写入 | 应用层去重键 |

**P1 (Temporal)**：

| 能力 | 实现 |
|:---|:---|
| 多角色审批链 | Temporal Workflow |
| 审批超时自动升级 | Timer + Signal |
| 重试与补偿 | Activity Retry Policy |
| 审计日志 | Temporal History |

---

## 4. 多 Agent 架构设计

### 4.1 分阶段 Agent 部署

```
P0 (第 3-12 周)          P1 (第 13-16 周)           P1 晚期 (第 17-20 周)
┌──────────┐      ┌──────────────────────┐    ┌──────────────────────────┐
│ 主 Agent │      │      主 Agent        │    │        主 Agent          │
│          │      │  ┌────────┐┌───────┐│    │  ┌────────┐┌──────┐┌───┐│
│ 11 工具  │      │  │方案Agent││风险    ││    │  │方案Agent││风险   ││策略││
│          │      │  │        ││Agent  ││    │  │        ││Agent ││Agent││
│          │      │  └────────┘└───────┘│    │  └────────┘└──────┘└───┘│
└──────────┘      └──────────────────────┘    └──────────────────────────┘

1 个 Agent         3 个 Agent                4 个 Agent (上限)
```

### 4.2 各 Agent 规格

#### 主 Agent (P0 起)

| 属性 | 值 |
|:---|:---|
| 职责 | 任务理解、工具路由、上下文管理、审批衔接 |
| 人格 | 理性、结构化、可靠的执行者 |
| 工具白名单 | 全部 11 个工具 |
| 子 Agent | P0 无，P1 起可调用方案 Agent、风险 Agent、策略 Agent |
| 服务对象 | 客户（AI 需求顾问模式）+ 销售（经营助手模式） |

#### 方案 Agent (P1 起)

| 属性 | 值 |
|:---|:---|
| 职责 | 生成 2-3 套差异化方案，解释取舍和预算差异 |
| 人格 | 创造性、乐观、敢推荐——"我推荐这套，因为..." |
| 工具白名单 | CaseSearch, ResourceSearch, PlanGenerator |
| 评估标准 | 方案人工可用评分 ≥ 4/5 |
| 禁止 | 修改价格规则、承诺档期、查看毛利 |

#### 风险 Agent (P1 起)

| 属性 | 值 |
|:---|:---|
| 职责 | 对方案草稿进行独立风险审查，输出风险等级和修改建议 |
| 人格 | 保守、怀疑、宁可多报——"这个方案有 3 个风险，其中 1 个可能影响报价" |
| 工具白名单 | BudgetEngine, RiskChecker |
| 评估标准 | 高风险事项漏检率 = 0，越权承诺 0 次 |
| 禁止 | 修改方案内容、生成新方案、与客户直接交互 |
| **与方案 Agent 的关系** | **独立运行，不共享上下文。方案 Agent 输出 → 风险 Agent 输入。** 认知冲突隔离 |

#### 策略 Agent (P1 晚期)

| 属性 | 值 |
|:---|:---|
| 职责 | 商务推进节奏判断：什么时候催、什么时候等、下一句话该说什么 |
| 人格 | 懂销售节奏、有分寸感、知道什么能承诺什么不能 |
| 工具白名单 | ActionAdvisor, CRMTool |
| 输入 | 当前机会状态 + 客户反馈 + 历史互动 + 行业数据 |
| 输出 | 下一最佳行动（含时机、话术建议、需要确认的事项） |

### 4.3 Agent 与工具的调用接口（统一抽象）

```python
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class ToolCallResult(BaseModel):
    """工具调用结果（所有工具和 Agent 使用相同的接口）"""
    caller_type: Literal["tool", "agent"]  # 'tool' 或 'agent'
    name: str                              # 工具名或 Agent 名
    output: dict                           # 结构化输出
    source: str                            # 数据来源（数据库/API/LLM推理）
    updated_at: datetime                   # 数据更新时间
    confidence: Literal["confirmed", "pending", "estimated"]

class AgentCallResult(ToolCallResult):
    """Agent 调用结果（继承工具接口）"""
    caller_type: Literal["agent"] = "agent"
    reasoning: str                         # Agent 推理过程
    tool_calls: list[dict]                 # Agent 调用了哪些工具
    evaluation_passed: bool                # 是否通过本 Agent 的评估标准

# 主 Agent 调用子 Agent 和工具的方式完全相同
# P0: call("risk_checker", plan=...)          → ToolCallResult
# P1: call("risk_agent", plan=...)            → AgentCallResult  (接口不变)
```

---

## 5. 11 个 P0 工具完整规格

### 工具 1：InputParser（多源输入解析）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent |
| 输入 | raw_text / file_url / audio_url + content_type + source + provider |
| 输出 | `{facts: Fact[], inferences: Inference[], gaps: OpenQuestion[], evidences: EvidenceRef[]}` |
| 执行方式 | Agent 调用 Instructor 结构化提取 |
| 权限 | 无限制（Agent 内部操作） |
| 失败处理 | 保留原始文本，标记 `status=failed`，通知人工接管 |

### 工具 2：BriefTool（Brief 版本管理）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent + 工作流 |
| 输入 | opportunity_id, facts, inferences, open_questions, constraints |
| 输出 | `{brief_id, version, completeness_score, status}` |
| 执行方式 | 写入 PostgreSQL brief_versions 表 |
| 权限 | 客户端：只读自己的 Brief；销售端：读写 |
| 失败处理 | 重试 3 次，失败后保存为草稿，标记 `status=error` |

### 工具 3：CaseSearch（案例检索）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent |
| 输入 | query_text, scene, budget_range, people_count, limit=5 |
| 输出 | `[{case_id, title, summary, match_score, match_reason, budget_range, is_public}]` |
| 执行方式 | pgvector 向量检索 (BGE-large-zh embedding) |
| 数据源 | case_embeddings 表 |
| 权限 | 客户端：仅返回 `is_public=true` 的案例；销售端：全部 |
| 失败处理 | 降级为关键词搜索（PostgreSQL ILIKE），标记 `fallback=true` |

### 工具 4：ResourceSearch（资源检索）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent |
| 输入 | resource_type(talent/venue/program), city, budget_range, style_tags, date, limit=10 |
| 输出 | `[{resource_id, name, type, public_profile, availability, match_reason}]` |
| 执行方式 | pgvector + PostgreSQL 结构化过滤 |
| 数据源 | resource_embeddings 表 + talents/venues 表 |
| 权限 | 客户端：仅返回 `public_profile` 字段；销售端：返回全部含 internal_data |
| 失败处理 | 降级为纯 SQL 查询（去掉语义相似度排序），标记 `fallback=true` |

### 工具 5：BudgetEngine（预算计算引擎）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent + 工作流 |
| 输入 | resources: [{resource_id, quantity, discount}], rules_version |
| 输出 | `{total_internal_cost, total_customer_price, margin, margin_rate, breakdown, warnings}` |
| 执行方式 | **确定性规则计算（Python 函数），不允许 LLM 参与** |
| 规则来源 | price_configs 表 |
| 权限 | 客户端不可调用；销售端可调用 |
| 失败处理 | 规则版本不存在时告警；计算结果异常（margin < 阈值）时触发人工审批 |
| **安全要求** | **每次计算记录输入参数和规则版本，可复现、可审计** |

### 工具 6：PlanGenerator（方案生成）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent（P0 主 Agent，P1 方案 Agent） |
| 输入 | brief, cases, resources, budget_estimate, strategy(conservative/balanced/breakthrough) |
| 输出 | `PlanOutput`（含 structure, resources, budget, risks, advantages, tradeoffs） |
| 执行方式 | Agent 推理 + Instructor 结构化输出 |
| 权限 | 内部使用，不直接暴露给客户端 |
| 失败处理 | 重试 2 次；所有重试失败后生成规则模板方案（仅含基础结构，不含资源推荐） |
| **禁止** | 编造不存在的资源、将待确认档期表达为已确认 |

### 工具 7：RiskChecker（风险检查）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent（P0 主 Agent，P1 风险 Agent） |
| 输入 | brief, plan, budget_result, resource_list |
| 输出 | `{risks: Risk[], violations: str[], price_issues: [], recommendation: approve/modify/reject}` |
| 执行方式 | **两阶段**：规则引擎（硬风险：档期冲突、预算超限、禁限内容）+ LLM（判断型风险：承诺合理性、方案完整性） |
| 权限 | 内部使用 |
| 失败处理 | 规则引擎先跑（不受 LLM 影响）；LLM 判断型风险失败时仅输出规则结果 + 标记 |
| **高风险漏检 = 0** | **每个已知高风险样本必须通过测试才可上线** |

### 工具 8：ProposalPublisher（方案发布）

| 属性 | 值 |
|:---|:---|
| 调用者 | 工作流（审批通过后触发） |
| 输入 | plan_version_id, approval_result |
| 输出 | `{customer_view_url, snapshot_id, access_token, expires_at}` |
| 执行方式 | 生成客户版 HTML → MinIO 快照 → 生成一次性访问 Token |
| 权限 | 仅审批通过后可执行 |
| 失败处理 | 重试 3 次；失败后通知人工手动发布 |
| **数据隔离** | 客户版不包含 internal_cost, margin, approval_log, sales_notes |

### 工具 9：CRMTool（CRM 同步）

| 属性 | 值 |
|:---|:---|
| 调用者 | 工作流（审批后执行） |
| 输入 | opportunity_id, action_type, payload |
| 输出 | `{crm_record_id, status}` |
| 执行方式 | Composio 连接器 → 外部 CRM API / 写入本地 opportunities 表 |
| 权限 | 审批后执行，不可手动绕过 |
| 失败处理 | 重试 5 次，指数退避；最终失败通知人工 |

### 工具 10：ActionAdvisor（行动建议）

| 属性 | 值 |
|:---|:---|
| 调用者 | Agent（P0 主 Agent，P1 策略 Agent） |
| 输入 | opportunity_id, current_stage, last_feedback, history_summary |
| 输出 | `{actions: NextAction[], priority_order, reasoning}` |
| 执行方式 | Agent 推理 |
| 权限 | 内部使用。客户端不直接访问（通过销售转达） |
| 失败处理 | 返回规则兜底建议（"联系客户确认方案"） |

### 工具 11：OutcomeRecorder（结果记录）

| 属性 | 值 |
|:---|:---|
| 调用者 | 工作流（项目结束触发） |
| 输入 | opportunity_id, final_revenue, final_cost, issues, satisfaction, will_renew |
| 输出 | `{outcome_id, case_candidate, rules_update_suggestions}` |
| 执行方式 | 写入 outcomes 表 + 弹窗引导人工补充 |
| 权限 | 内部使用（仅销售端可见） |
| 失败处理 | 保存草稿，通知人工补录 |

---

## 6. Agent 结构化输出 Schema

所有 Agent 输出通过 **Instructor + Pydantic** 强约束。关键 Schema：

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID

# ── 基础对象 ──

class Fact(BaseModel):
    """已确认事实"""
    field: str                          # 字段名
    value: str                          # 值
    confidence: Literal["confirmed", "inferred"]
    evidence_ids: List[UUID]            # 引用 Evidence ID
    source_quote: Optional[str]         # 原始引用

class Inference(BaseModel):
    """Agent 推断"""
    field: str
    value: str
    confidence: float                   # 0.0-1.0
    basis: str                          # 推断依据

class OpenQuestion(BaseModel):
    """待确认问题"""
    question: str
    field: str                          # 影响的 Brief 字段
    impact: Literal["blocks_decision", "affects_plan", "affects_price", "informational"]
    status: Literal["pending", "asked", "answered", "skipped"]

class Risk(BaseModel):
    """风险项"""
    type: str                           # 风险类型
    level: Literal["R0", "R1", "R2", "R3"]
    description: str
    trigger: str                        # 触发条件
    mitigation: str                     # 处理建议
    handler: Optional[str]              # 处理人

class NextAction(BaseModel):
    """下一最佳行动"""
    action: str
    suggested_time: datetime
    rationale: str
    needs_human_confirmation: List[str]
    risk_if_delayed: Optional[str]

# ── 核心输出 ──

class BriefOutput(BaseModel):
    """结构化需求输出"""
    opportunity_id: UUID
    version: int
    facts: List[Fact]
    inferences: List[Inference]
    open_questions: List[OpenQuestion]
    constraints: dict                   # {hard_constraints: [...], soft_preferences: [...]}
    completeness_score: int             # 0-100
    summary: str

class ResourceRecommendation(BaseModel):
    """资源推荐"""
    resource_id: UUID
    resource_type: str                  # talent/venue/program
    name: str
    public_tags: List[str]              # 客户端可见标签
    price_range_public: Optional[str]   # 客户端可见价格区间
    customer_price: Optional[float]     # 客户展示价格
    internal_cost: Optional[float]      # 内部成本（仅销售端）
    availability: Literal["confirmed", "historically_available", "pending", "unavailable"]
    availability_source: str            # 数据来源
    last_updated: datetime

class PlanOutput(BaseModel):
    """方案输出"""
    opportunity_id: UUID
    version: int
    strategy: Literal["conservative", "balanced", "breakthrough"]
    structure: List[dict]               # [{phase, duration, description}]
    resources: List[ResourceRecommendation]
    budget_customer: dict               # {total, breakdown} (客户版)
    budget_internal: dict               # {total_cost, margin, margin_rate} (内部版)
    risks: List[Risk]
    advantages: List[str]
    tradeoffs: List[str]
    not_recommended_for: List[str]
    pending_confirmations: List[str]

class RiskCheckOutput(BaseModel):
    """风险审查输出"""
    plan_id: UUID
    passed: bool
    risks: List[Risk]
    violations: List[str]               # 违反的禁止事项
    price_issues: List[dict]            # [{item, expected, actual, severity}]
    recommendation: Literal["approve", "modify", "reject"]
```

---

## 7. 数据方案

### 7.1 数据分层

```
第 1 层：原始证据层 (evidences 表 — 不可变)
  └─ 聊天记录、语音转写、上传文件、客户对话

第 2 层：业务事实层 (brief_versions / plan_versions — 版本化)
  └─ 经 Agent 提取和人工确认的结构化信息

第 3 层：知识资产层 (pgvector — 可检索)
  └─ 案例、资源、规则、异议处理经验

第 4 层：评估与学习层 (DeepEval — 持续测试)
  └─ 测试集、人工评分、失败样本、模型版本记录
```

### 7.2 数据库表（PostgreSQL + pgvector）

**继承 V4.7/V5.0 已有表 (18 张)**：
customers, opportunities, leads, proposals, quotes, follow_up_logs, demands, talents, venues, case_studies, companies, skus, performers, ai_feedback_logs, price_configs, notifications, users, migrations

**V6.0 新增/扩展表 (8 张)**：

| 表 | DDL 位置 | 用途 |
|:---|:---|:---|
| `organizations` | 新增 | 组织（客户企业 / 后仰喜剧内部） |
| `evidences` | 新增 | 原始证据存档 (不可变) |
| `brief_versions` | 新增 | Brief 版本历史 (含 schema_version) |
| `plan_versions` | 新增 | 方案版本历史 (含 schema_version, customer_price / internal_cost 双字段) |
| `customer_feedback` | 新增 | 客户对方案的反馈 |
| `approvals` | 新增 | 审批记录 |
| `actions` | 新增 | 行动/任务 |
| `outcomes` | 新增 | 复盘结果 |
| `case_embeddings` | 新增 (pgvector) | 案例向量表 |
| `resource_embeddings` | 新增 (pgvector) | 资源向量表 |

> 完整 DDL 见 `docs/PRD_V6.md` §12.2

### 7.3 向量检索 (pgvector)

```sql
CREATE EXTENSION vector;

CREATE TABLE case_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES case_studies(id),
    embedding vector(768),  -- BGE-large-zh 768 维
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resource_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT,
    resource_id UUID,
    embedding vector(768),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON case_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON resource_embeddings USING ivfflat (embedding vector_cosine_ops);
```

**迁移策略**：P1 数据量超万级后，若检索延迟 >500ms，将向量数据迁移至 Milvus (Apache 2.0)。业务代码通过统一抽象接口调用，切换时不需要改 Agent 代码。

---

## 8. 前端方案

### 8.1 页面清单

| # | 页面 | 路由 | 端口 | 优先级 |
|:---:|:---|:---|:---|:---:|
| C1 | AI 需求顾问 | `/c/chat` | 客户端 (移动端) | P0 |
| C2 | Brief 确认 | `/c/brief` | 客户端 (移动端) | P0 |
| C3 | 方案查看 | `/c/proposal` | 客户端 (移动端) | P0 |
| S1 | 工作台主页 | `/workspace` | 销售端 (桌面端) | P0 |
| S2 | 机会总览 | `/workspace/opportunities` | 销售端 (桌面端) | P0 |
| S3 | 方案编辑 | `/workspace/plan/:id` | 销售端 (桌面端) | P1 |
| S4 | 创始人看板 | `/workspace/insights` | 销售端 (桌面端) | P1 |

### 8.2 前端技术策略

| 来源 | 组件 | 用途 |
|:---|:---|:---|
| **已有 (shadcn/ui)** | 40+ 组件 | 基础 UI，直接 import |
| **已有 (V4.7)** | ProposalPreview (796行) | 客户方案 H5，保留改数据源 |
| **开源引入** | [shadcn-admin](https://github.com/satnaing/shadcn-admin) (MIT) | 工作台 Layout 骨架 |
| **开源引入** | [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot) (MIT) | Chat 组件 + 工具调用可视化 |
| **自建** | AgentWorkbenchLayout | 左右分栏 + 面板切换 |
| **自建** | BriefPanel, PlanComparePanel, RiskReviewPanel | 结构化面板组件 |
| **自建** | ClientChatView, ClientBriefView, ClientProposalView | 客户端移动端页面 |

---

## 9. 后端方案

### 9.1 保留的 V4.7/V5.0 API (25 个)

auth, opportunities, leads, proposals, quotes, follow-ups, demands, talents, venues, case-studies, companies, skus, tools, downloads, notifications, ai, ai-feedback, ai-templates + 7 个 P2 API

### 9.2 V6.0 新增端点

**客户端 API**：

| 端点 | 方法 | 用途 |
|:---|:---|:---|
| `/c/chat` | POST | 客户发送消息，Agent 回复 |
| `/c/chat/:id/history` | GET | 获取历史对话 |
| `/c/brief/:id` | GET | 获取客户版 Brief |
| `/c/brief/:id/confirm` | POST | 客户确认 Brief |
| `/c/proposal/:id` | GET | 获取客户版方案 |
| `/c/proposal/:id/feedback` | POST | 提交方案模块反馈 |
| `/c/proposal/:id/share` | POST | 生成分享链接 |

**销售端 API**：

| 端点 | 方法 | 用途 |
|:---|:---|:---|
| `/v1/opportunities/:id/brief` | GET/POST | Brief CRUD |
| `/v1/opportunities/:id/plans` | POST | 发起方案生成 |
| `/v1/plans/:id/approve` | POST | 审批方案 |
| `/v1/plans/:id/publish` | POST | 发布客户版方案 |
| `/v1/plans/:id/snapshot` | GET | 获取方案快照 |
| `/v1/cases/search` | GET | 案例检索 |
| `/v1/resources/search` | GET | 资源检索 |
| `/v1/opportunities/:id/actions` | GET/POST | 行动建议与任务 |
| `/v1/opportunities/:id/outcome` | POST | 结果录入 |

**权限中间件**：
所有 API 按 `user.role` 过滤返回字段。客户端永远不会收到 `internal_cost`, `margin`, `approval_log`, `internal_data` 字段。

---

## 10. 安全与权限

### 10.1 数据隔离

| 数据 | 客户可见 | 隔离方式 |
|:---|:---:|:---|
| facts, customer_price, public_profile | ✅ | 同一字段，无隔离 |
| inferences | ⚠️ 标注"系统推断" | 前端按 role 过滤 |
| internal_cost, margin, internal_data, approval_log | ❌ | **物理字段隔离 + API 层过滤** |

### 10.2 Agent 权限

| 操作 | 客户端 Agent | 销售端 Agent |
|:---|:---|:---|
| 展示演员资料 | ✅ public_profile | ✅ 全部 |
| 展示价格 | ✅ 区间 | ✅ 精确 + 成本 |
| 确认档期 | ❌ 标注"待确认" | ⚠️ 标注来源 |
| 生成正式报价 | ❌ | ⚠️ 需审批 |
| 发送外部消息 | ❌ | ❌ |
| 编造资源/承诺 | ❌ | ❌ |

### 10.3 成本控制

- 每个机会硬上限 **¥30/机会**
- LangFuse 按机会追踪 Token 消耗
- 超限后 Agent 停止该机会，通知销售转人工
- 不阻断其他机会

### 10.4 AI 降级机制

AI 不可用时：
1. 保存全部输入和当前状态
2. 标记失败原因，不编造假结果
3. 使用规则模板生成最低可用 Brief/方案骨架
4. 每个关键节点提供纯人工操作后门
5. 失败样本进入评估集
6. 恢复后从断点继续，不重复创建业务记录

---

## 11. 部署架构

```
┌──────────────────────────────────────────────┐
│              腾讯云轻量服务器                   │
│              (4C8G)                           │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ Docker Compose                          │   │
│  │                                         │   │
│  │  • Fastify API (3002)                   │   │
│  │  • LangGraph Agent Service              │   │
│  │  • PostgreSQL + pgvector (5432)         │   │
│  │  • Redis (6379)                         │   │
│  │  • MinIO (9000)                         │   │
│  │  • LangFuse (自建, 3000)                │   │
│  │  • DeepEval Worker                      │   │
│  │  • Nginx (80/443)                       │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ 可选（按需启动）：                       │   │
│  │  • FunASR Worker (GPU 或阿里云API)      │   │
│  │  • Unstructured Worker                 │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘

外部依赖：
  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │DeepSeek  │  │ 微信 API  │  │ 企业微信 API  │
  │  v4-pro  │  │(消息推送) │  │ (消息推送)   │
  └──────────┘  └──────────┘  └──────────────┘
```

---

## 12. 成本估算

### 12.1 研发成本

| 阶段 | 周次 | 人天 |
|:---|:---|:---:|
| G0: 数据与基础 | 第 1-2 周 | 12 |
| G1: 需求理解（双端） | 第 3-5 周 | 22 |
| G2: 方案决策 + 看板 | 第 6-9 周 | 28 |
| G3: 提案推进 + 客户端反馈 | 第 10-12 周 | 22 |
| G4: 履约回流 + Agent 拆分 | 第 13-16 周 | 20 |
| G5: 策略 Agent + 协作 | 第 17-20 周 | 16 |
| **合计** | | **120 人天 (约 6 人月)** |

> 含 30% 缓冲：开发者学习曲线、FunASR 调优、Unstructured 兼容、LangGraph checkpoint 调试

### 12.2 基础设施月成本

| 项目 | 规格 | 月成本 |
|:---|:---|:---|
| 腾讯云轻量服务器 | 4C8G | ¥300-500 |
| DeepSeek v4-pro API | 按量 (预估 50万 token/天) | ¥500-2,000 |
| DeepSeek v4-flash API | 按量 (简单任务) | ¥100-300 |
| FunASR (可选) | 按需或阿里云 ASR API | ¥0-1,000 |
| 微信/企业微信 API | 基础接口 | ¥0 |
| 域名 + DNS | — | ¥20 |
| **合计** | | **¥920-3,820/月** |

### 12.3 软件许可成本

**全部 ¥0。** 所有选型均为 MIT/Apache 2.0/BSD/PostgreSQL 许可，可闭源商用。

---

## 13. 分阶段实施路线

### 阶段概览

| 阶段 | 周次 | 核心交付 | Agent | 关卡条件 |
|:---|:---|:---|:---|:---|
| G0 | 1-2 | 数据准备 + 环境搭建 | — | 10 个样本可端到端测试 |
| G1 | 3-5 | 需求理解（双端） | 主Agent | 事实准确率 ≥95%，销售愿意试用 |
| G2 | 6-9 | 方案决策 + 看板 | 主Agent | 80%方案可达客户沟通标准 |
| G3 | 10-12 | 提案推进 + 客户反馈 | 主Agent | 5个方案真实发送，2个报价 |
| G4 | 13-16 | 履约回流 + Agent拆分 | +方案Agent+风险Agent | 1个项目成交到复盘闭环 |
| G5 | 17-20 | 策略Agent + 协作 | +策略Agent | 数据飞轮运转 |

### G0：数据与基础（第 1-2 周）

- Docker 环境全部就绪
- 20+ 个历史需求样本入库
- 10 个案例 + 演员/节目/场馆最小数据集 pgvector 入库
- 核心报价规则 → 预算引擎配置
- 20 个评估样本 → DeepEval
- LangFuse 部署 + 指标定义
- 微信链接接入方案

### G1：需求理解双端 Agent（第 3-5 周）

- 客户端 AI 需求对话（文字输入 + Brief 确认）
- 客户端冷启动引导
- 销售端多源输入 + 需求提取 + 缺口识别
- Brief 版本化管理 + 人工确认
- 双端权限框架
- 评估集运行（事实准确率 ≥95%）

### G2：方案决策（第 6-9 周）

- RAG 检索 (pgvector) — 案例 + 资源匹配
- 多方案推演（3 套策略）
- 预算模拟 + 风险检查
- 人工审批 + 审批责任显式标注 UI
- 客户版方案 H5 发布 + 快照
- 创始人看板（简易指标）
- 知识库维护嵌入工作流

### G3：提案推进 + 客户端反馈（第 10-12 周）

- 客户方案查看 + 模块反馈 UI
- 反馈摘要 + 方案修订
- 下一行动建议
- CRM 同步
- 成交/丢单记录 + 最小履约交接
- ¥30/机会成本上限 + AI 降级机制

### G4：履约回流 + Agent 拆分（第 13-16 周）

- 履约交接包自动生成
- 结果录入 + 案例入库 + 规则更新
- **方案 Agent + 风险 Agent 拆分**
- Agent 统一调用接口实现
- 评估集扩展至 50+ 样本

### G5：策略 Agent + 协作（第 17-20 周）

- 策略 Agent（商务节奏判断）
- 客户端多人协作（评论/投票）
- 完整评估体系
- 运营 dashboard

---

## 14. V4.7 资产复用

| 资产 | V6.0 处理 | 复用率 |
|:---|:---|:---|
| shadcn/ui 组件 (40+) | 直接 import | 100% |
| TypeScript + Tailwind + Zustand + TanStack Query | 不动 | 100% |
| Fastify + JWT + RBAC | 扩展新端点 | 100% |
| Nginx + Docker 部署 | 不动 | 100% |
| ProposalPreview (796行) | 保留改数据源 | 100% |
| FollowUpTimeline, StatusTag, LeadScoreBadge | 直接复用 | 100% |
| 后端 25 个 API | 扩展 V6.0 端点 | 78% |
| PostgreSQL 18 张表 | 新增 8 张 V6.0 表 | 72% |
| 前端 52 个路由 | 归档 (除 ProposalPreview) | 3% |
| 8 个 v0/Trae Design 预览页 | 归档为 UI 参考 | 0% |
| 全部 Mock 数据 | 替换为真实数据 | 0% |

---

## 15. 风险与对策

| 风险 | 等级 | 对策 |
|:---|:---:|:---|
| 客户端 Agent 回复质量影响品牌 | 🔴 | 客户版 Agent 评估门槛更高（99%准确率），上线前 50 样本 0 严重错误 |
| Agent 编造资源/越权报价 | 🔴 | Schema 约束 + 评估体系第1天上线 + 审批不可绕过 |
| 真实数据准备不足 (G0) | 🟠 | 缩小 ICP 范围，10 个样本即可启动 |
| 前端复杂度被低估 | 🟠 | 预留 G3 额外 8 天缓冲 |
| 双端权限隔离不够 | 🟠 | 物理字段隔离 + API role 过滤 + 安全测试 |
| 多人协作超 MVP | 🟠 | MVP 仅发起人+只读查看，投票/评论推 P1 |
| LLM 成本失控 | 🟡 | ¥30/机会硬上限 + LangFuse 追踪 |
| AI 不可用导致业务中断 | 🟡 | 每个关键节点有人工操作后门 + 降级规则模板 |
| Schema 频繁变更 | 🟡 | schema_version 字段 + 前端适配 |
| 知识库无人维护 | 🟡 | 嵌入工作流，审批/成交时弹窗顺手入库 |

---

> **配套文档**：
> - 产品需求文档：`docs/PRD_V6.md`
> - V5.0 技术方案（历史参考）：`docs/SOLUTION_V5.md`
> - V5.0 架构设计（历史参考）：`docs/ARCHITECTURE_V5.md`
> - 开源工具调研报告：`~/ai_operations_agent_tools_research.md`
