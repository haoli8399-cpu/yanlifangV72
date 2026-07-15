# 演立方 V5.0 P0 架构设计

> 基于 V5.0 PRD + 全开源技术栈（MIT/Apache 2.0）
> 版本：P0-ARCH-V1 | 日期：2026-07-14

---

## 1. 系统全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                         接入层 (Edge)                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ 微信小程序 │  │ 企业微信  │  │ H5 页面  │  │ 销售工作台 (React)   │ │
│  │ (uni-app) │  │ (消息推送)│  │ (客户查看)│  │ (shadcn/ui)         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │
└───────┼─────────────┼─────────────┼───────────────────┼─────────────┘
        │             │             │                   │
┌───────┴─────────────┴─────────────┴───────────────────┴─────────────┐
│                       API 网关 (Fastify 5.3)                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  /v1/opportunities  /v1/briefs  /v1/plans  /v1/approvals    │   │
│  │  /v1/resources      /v1/cases   /v1/tools  /v1/outcomes     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                         核心服务层                                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ 多源输入管道  │  │ Agent 编排层  │  │ 确定性工作流 + 审批      │   │
│  │              │  │              │  │                          │   │
│  │ Unstructured │  │ LangGraph    │  │ Temporal                 │   │
│  │ (文档解析)   │  │ (状态机Agent) │  │ (人工审批挂起/幂等)     │   │
│  │              │  │              │  │                          │   │
│  │ FunASR       │  │ Instructor   │  │                          │   │
│  │ (语音转写)   │  │ (结构化提取) │  │                          │   │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘   │
│         │                 │                        │                │
│  ┌──────┴─────────────────┴────────────────────────┴──────────┐    │
│  │                      共享服务层                              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │    │
│  │  │ 预算引擎  │ │ 风险检查器 │ │提案发布器 │ │ CRM 同步器   │  │    │
│  │  │ (规则计算)│ │ (规则+LLM)│ │ (H5/快照) │ │ (Composio)   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │    │
│  │  │ 案例检索器│ │ 资源检索器│ │ 评估引擎  │ │ 观测服务      │  │    │
│  │  │ (Milvus) │ │ (Milvus) │ │(DeepEval) │ │ (LangFuse)   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                         数据存储层                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ PostgreSQL │  │   Milvus   │  │   Redis    │  │  MinIO (S3)  │  │
│  │ (业务数据) │  │ (向量检索) │  │ (缓存/队列)│  │ (文件/快照)  │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 核心组件职责

### 2.1 多源输入管道

| 输入类型 | 处理组件 | 输出 | Pipeline |
|:---|:---|:---|:---|
| 微信聊天文本 | 直接解析 | 结构化消息序列 | 粘贴→分段→去重→标注来源 |
| 语音消息 | **FunASR** | 转写文本 + 说话人标注 | 上传→FunASR 转写→文本标注 |
| Word/PDF 文档 | **Unstructured** | 提取文本 + 表格 + 图片描述 | 上传→Unstructured→结构化 |
| 图片(截图/方案) | Unstructured + OCR | 文字提取 | 上传→OCR→结构化 |
| 客户表单 | API 直接入库 | 结构化字段 | 无需管道 |

**关键设计**：
- 所有输入保留原始副本（`Evidence.raw_content`），模型输出不覆盖原始证据
- 每条 Evidence 标注来源（微信/文件/表单）、时间、提供者
- Pipeline 独立于 Agent，可以并行处理多份输入

### 2.2 Agent 编排层（LangGraph）

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
│  每个节点支持：checkpoint(断点恢复) + interrupt(人工审批挂起) │
└─────────────────────────────────────────────────────────────┘
```

**LangGraph 承担的职责**：

| 职责 | 实现方式 | 
|:---|:---|
| 状态管理 | `StateGraph` 定义机会状态（Brief 完整度、方案版本、审批状态） |
| 动态路由 | 根据信息缺口动态决定下一步（追问 vs 方案生成 vs 人工接管） |
| 断点恢复 | `checkpointer` 持久化到 PostgreSQL，工具失败/服务重启后从断点继续 |
| 人工审批挂起 | `interrupt()` 挂起节点，等待 Temporal 回调审批结果 |
| 工具调用 | `ToolNode` 封装 11 个 P0 工具，Agent 动态选择调用顺序 |
| 版本管理 | 每次 Brief 更新/方案生成自动生成快照 |

### 2.3 确定性工作流 + 审批（Temporal）

**为什么要 Temporal 而不是单靠 LangGraph？**

LangGraph 的 `interrupt()` 可以做人工审批挂起，但它不擅长：
- 审批超时自动升权（"24 小时未审批自动转给上一级"）
- 复杂的多角色审批链（商务→资源→财务）
- 审批动作的审计日志和不可撤销性
- 工作流与 Agent 调用的解耦（Agent 不可用时工作流仍然可以运行）

**Temporal 负责的场景**：

| 场景 | LangGraph | Temporal | 
|:---|:---:|:---:|
| Agent 内部状态流转 | ✅ 负责 | — |
| 单次人工审批（"确认 Brief"） | ✅ 可用 | ✅ 更好 |
| 多角色审批链 | ❌ 不擅长 | ✅ 负责 |
| 审批超时/升级 | ❌ 不擅长 | ✅ 负责 |
| H5 发布（快照+Token生成） | — | ✅ 负责 |
| CRM 同步（幂等写入） | — | ✅ 负责 |
| 任务创建/提醒 | — | ✅ 负责 |

**P0 简化方案**：P0 阶段审批简单（单人确认），可以先用 LangGraph `interrupt()` 替代 Temporal。P1 上多角色审批后再引入 Temporal。**但接口层先抽象好——Agent 不直接依赖 Temporal 或 LangGraph 的审批实现。**

### 2.4 共享服务层（11 个 P0 工具）

| # | 工具 | 类型 | 职责 | 技术实现 |
|:---:|:---|:---|:---|:---|
| 1 | 需求解析 (InputParser) | Agent调用 | 接收原始输入→输出 facts/inferences/gaps/evidence | LangGraph + Instructor 结构化提取 |
| 2 | Brief 工具 (BriefTool) | 工作流 | 版本化 Brief 保存、完整度计算、差异对比 | PostgreSQL + Temporal |
| 3 | 案例检索 (CaseSearch) | 工具 | 根据场景/目标/人群/预算检索相似案例 | Milvus 向量检索 + RAG |
| 4 | 资源检索 (ResourceSearch) | 工具 | 检索演员/节目/场馆，标注可用状态 | Milvus + PostgreSQL |
| 5 | 预算模拟 (BudgetEngine) | 工具 | 确定性规则计算成本/价格/毛利 | **自建规则引擎**，不允许 LLM 参与计算 |
| 6 | 方案生成 (PlanGenerator) | Agent调用 | 基于 Brief+案例+资源生成 2-3 套方案 | LangGraph + Instructor 结构化输出 |
| 7 | 风险检查 (RiskChecker) | Agent调用+规则 | 识别档期/场地/内容合规/预算/承诺风险 | 规则引擎(硬规则) + LLM(判断型风险) |
| 8 | 提案发布 (ProposalPublisher) | 工作流 | 审批通过→生成 H5 快照+访问 Token | Temporal + MinIO 存储快照 |
| 9 | CRM 工具 (CRMTool) | 工作流 | 创建/更新机会、生成任务、记录状态 | Composio + Temporal |
| 10 | 行动建议 (ActionAdvisor) | Agent调用 | 基于机会状态建议下一最佳行动 | LangGraph Agent 分支 |
| 11 | 反馈复盘 (OutcomeRecorder) | 工作流 | 记录成交/丢单/履约结果→回流知识库 | Temporal + 人工录入 |

**工具调用原则（Agent 不可绕过）**：
- 预算计算：必须走 `BudgetEngine`，Agent 只引用结果
- 资源可用性：标注来源 + "已确认/待确认/不可用"，Agent 不能把"待确认"说成"已确认"
- 写操作：所有外部写操作必须经过 Temporal 幂等执行
- 失败恢复：工具失败时保留上下文，不静默编造结果，Agent 标记状态为"需人工介入"

### 2.5 观测与评估

```
┌─────────────────────────────────────────┐
│              LangFuse (MIT)              │
│  ┌─────────────────────────────────┐     │
│  │ 全链路追踪                      │     │
│  │ • 模型版本 → 提示词版本         │     │
│  │ • 工具调用链 → 知识库版本       │     │
│  │ • Token 消耗 → 成本按机会核算   │     │
│  │ • 失败样本自动入库              │     │
│  └─────────────────────────────────┘     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            DeepEval (Apache 2.0)         │
│  ┌─────────────────────────────────┐     │
│  │ 离线评估 (每次模型/提示词更新后) │     │
│  │ • 事实准确率 ≥ 95%              │     │
│  │ • 关键事实可追溯率 = 100%        │     │
│  │ • 高风险漏检 = 0                │     │
│  │ • 关键输出 Schema 合规 ≥ 99%    │     │
│  │ • 禁止承诺检测 = 0 次           │     │
│  └─────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

---

## 3. 核心数据模型（P0 最小集）

### 3.1 业务数据库 (PostgreSQL)

```sql
-- 客户
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,           -- 企业名称
    industry TEXT,                -- 行业
    contacts JSONB,               -- [{name, phone, wechat, role}]
    source TEXT,                  -- 来源渠道
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 机会 (V5.0 核心实体)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    scene TEXT,                   -- 活动场景
    stage TEXT NOT NULL,          -- 状态: 新需求/澄清中/Brief就绪/方案生成中/内部审核/已发方案/商务推进/已成交/履约中/已复盘/已丢单
    estimated_value NUMERIC,      -- 预估价值
    actual_value NUMERIC,         -- 实际成交额
    actual_cost NUMERIC,          -- 实际成本
    actual_margin NUMERIC,        -- 实际毛利
    outcome TEXT,                 -- 结果: won/lost/ongoing
    lost_reason TEXT,             -- 丢单原因
    assigned_to TEXT,             -- 负责人
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 原始证据 (不可变)
CREATE TABLE evidences (
    id UUID PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id),
    raw_content TEXT NOT NULL,     -- 原始内容 (不可变)
    content_type TEXT,             -- 聊天/语音/文件/表单
    source TEXT,                   -- 来源 (微信/文件路径/表单ID)
    provider TEXT,                 -- 提供者
    recorded_at TIMESTAMPTZ,       -- 原始时间
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brief 版本 (可追溯)
CREATE TABLE brief_versions (
    id UUID PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id),
    version INTEGER NOT NULL,     -- 版本号 (递增)
    facts JSONB,                  -- {activity_type, participants, date_range, budget_range, ...}
    inferences JSONB,             -- [{field, value, confidence, basis}]
    open_questions JSONB,         -- [{question, impact, status}]
    constraints JSONB,            -- {hard_constraints, soft_preferences}
    completeness_score INTEGER,   -- 0-100 完整度
    status TEXT,                   -- draft/confirmed/deprecated
    created_by TEXT,               -- 'agent' | 'human'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 方案版本 (可追溯)
CREATE TABLE plan_versions (
    id UUID PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id),
    version INTEGER NOT NULL,
    strategy TEXT,                -- conservative/balanced/breakthrough
    structure JSONB,              -- 活动结构: [{phase, duration, description}]
    resources JSONB,              -- 资源配置: [{resource_id, type, quantity, price}]
    budget JSONB,                 -- 预算: {total_cost, total_price, margin, breakdown}
    risks JSONB,                  -- 风险: [{type, level, description, mitigation}]
    comparative_notes TEXT,       -- 方案差异说明
    status TEXT,                   -- draft/internal_review/approved/published/deprecated
    snapshot_url TEXT,             -- MinIO 快照地址
    approval_log JSONB,           -- [{approver, decision, time, reason}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 审批记录
CREATE TABLE approvals (
    id UUID PRIMARY KEY,
    target_type TEXT NOT NULL,     -- brief/plan/proposal
    target_id UUID NOT NULL,
    risk_level TEXT NOT NULL,      -- R0/R1/R2/R3
    approver TEXT NOT NULL,
    decision TEXT,                 -- approved/rejected/requested_changes
    reason TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 行动/任务
CREATE TABLE actions (
    id UUID PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id),
    action_type TEXT,              -- follow_up/send_proposal/confirm_resource/approve
    suggested_by TEXT,             -- 'agent' | 'human'
    description TEXT,
    assigned_to TEXT,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- pending/in_progress/completed/cancelled
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 复盘结果
CREATE TABLE outcomes (
    id UUID PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id),
    final_revenue NUMERIC,         -- 最终收入
    final_cost NUMERIC,            -- 最终成本
    final_margin NUMERIC,          -- 最终毛利
    plan_changes JSONB,            -- 方案变更记录
    delivery_issues JSONB,         -- 履约异常
    client_satisfaction INTEGER,   -- 1-5
    will_renew BOOLEAN,            -- 是否复购
    public_case_candidate BOOLEAN, -- 是否可入库为公开案例
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 知识库 (Milvus)

| Collection | 内容 | 向量化方式 | 更新频率 |
|:---|:---|:---|:---|
| `cases` | 历史案例：背景+方案+预算+结果+标签 | 案例文本 → embedding → Milvus | 每次复盘后 |
| `resources` | 演员/节目/场馆：能力标签+城市+价格+状态 | 资源描述 → embedding → Milvus | 资源状态变更时 |
| `rules` | 商务规则：报价公式/折扣条件/禁限清单 | 结构化存储为主（PG），向量化为辅 | 规则更新时 |
| `objections` | 客户异议：异议类型+场景+处理方式+结果 | 异议描述 → embedding → Milvus | 每次丢单复盘后 |

---

## 4. Agent 结构化输出契约

所有 Agent 输出必须遵循这个 schema，通过 **Instructor** 强约束：

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID

class Fact(BaseModel):
    """已确认事实"""
    field: str                          # 字段名
    value: str                          # 值
    confidence: Literal["confirmed", "inferred"]
    evidence_ids: List[UUID]            # 引用 Evidence 的 ID
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

class BriefOutput(BaseModel):
    """结构化需求输出"""
    opportunity_id: UUID
    version: int
    facts: List[Fact]
    inferences: List[Inference]
    open_questions: List[OpenQuestion]
    constraints: dict                   # {hard_constraints, soft_preferences}
    completeness_score: int             # 0-100
    summary: str                        # 人类可读的总结

class ResourceRecommendation(BaseModel):
    """资源推荐"""
    resource_id: UUID
    resource_type: str                  # talent/venue/program
    name: str
    match_reason: str
    availability: Literal["confirmed", "historically_available", "pending", "unavailable"]
    source: str                         # 来源: Milvus 检索结果 | 人工录入
    last_updated: datetime

class PlanOutput(BaseModel):
    """方案输出"""
    opportunity_id: UUID
    version: int
    strategy: Literal["conservative", "balanced", "breakthrough"]
    structure: List[dict]               # [{phase, duration, description}]
    resources: List[ResourceRecommendation]
    budget: dict                        # {total_cost, total_price, margin, breakdown}
    risks: List[dict]                   # [{type, level, description, mitigation, trigger, handler}]
    advantages: List[str]
    tradeoffs: List[str]
    not_recommended_for: List[str]
    pending_confirmations: List[str]

class RiskCheckOutput(BaseModel):
    """风险审查输出"""
    plan_id: UUID
    passed: bool
    risks: List[dict]                   # [{type, level: R0-R3, description, trigger, handler}]
    violations: List[str]               # 违反的禁止事项
    price_issues: List[dict]            # [{item, expected, actual, severity}]
    recommendation: Literal["approve", "modify", "reject"]

class NextAction(BaseModel):
    """下一最佳行动"""
    action: str
    suggested_time: datetime
    rationale: str
    needs_human_confirmation: List[str]
    risk_if_delayed: Optional[str]
```

---

## 5. P0 阶段实施路线

### G0：数据与基础（第 1-2 周）

| 任务 | 产出 | 负责人 |
|:---|:---|:---|
| 搭建开发环境 | 全部组件 Docker 部署完成 | 技术 |
| 导入历史样本 | 20+ 个真实活动需求入库 | 业务 |
| 建立最小案例库 | 10 个案例 → Milvus | 业务+技术 |
| 建立资源库 | 演员/节目/场馆最小数据集 | 业务 |
| 提取价格规则 | 报价公式 → 规则引擎配置 | 商务 |
| 建立评估集 | 20 个测试样本 + 标准答案 | 产品 |
| 搭建观测体系 | LangFuse 部署 + 指标定义 | 技术 |

**关卡条件**：10 个样本跑通端到端测试，关键报价规则可被验证

### G1：需求理解 Agent（第 3-5 周）

| 任务 | 产出 |
|:---|:---|
| 多源输入管道 | Unstructured + FunASR 集成 |
| 事实提取 | LangGraph 节点：输入→facts/inferences/gaps |
| 缺口识别 + 动态追问 | 根据完整度动态选择下一个问题 |
| Brief 版本化 | PostgreSQL brief_versions 表 + 版本对比 |
| 人工确认 Brief | LangGraph interrupt 挂起等待确认 |
| 评估集运行 | 事实准确率 ≥ 95%，高风险识别 0 漏检 |

**关卡条件**：销售愿意在真实机会中试用，核心事实准确率达到门槛

### G2：方案与资源决策（第 6-9 周）

| 任务 | 产出 |
|:---|:---|
| 案例检索 (RAG) | LlamaIndex + Milvus：场景→相似案例 |
| 资源候选 | 基于城市/时间/预算/内容需求检索 |
| 多方案推演 | LangGraph 生成 conservative/balanced/breakthrough 三套 |
| 预算模拟 | 确定性规则引擎：成本→价格→毛利 |
| 风险检查 | 规则引擎(硬风险) + LLM(判断型风险) |
| 审批工作流 | 方案审核（方案负责人→商务负责人→资源负责人） |
| 评估集运行 | 80% 方案经有限修改可达客户沟通标准 |

**关卡条件**：无资源和预算严重错误，方案比人工方法更快

### G3：提案与销售推进（第 10-12 周）

| 任务 | 产出 |
|:---|:---|
| H5 方案生成 | 审批通过→MinIO 快照→生成访问 Token |
| CRM 同步 | 创建机会→方案版本→跟进任务 |
| 下一行动建议 | 基于机会状态+客户反馈动态建议 |
| 客户反馈处理 | 反馈→映射到 Brief/方案/资源→差异对比 |
| 成交/丢单记录 | 状态流转 + 结果记录 |

**关卡条件**：至少 5 个方案发送给真实客户，至少 2 个进入报价

### G4：履约回流与复盘（第 13 周起）

| 任务 | 产出 |
|:---|:---|
| 交接包生成 | 成交→自动汇总 Brief+方案+价格+承诺+风险 |
| 履约结果录入 | 实际收入/成本/毛利/异常/满意度 |
| 案例入库 | 经审核的案例→Milvus + 规则更新 |
| 评估样本更新 | 失败样本→评估集→改进迭代 |

**关卡条件**：至少 1 个项目完成从成交到复盘的数据闭环

---

## 6. 部署架构（P0 最小集）

```
┌──────────────────────────────────────────────┐
│              腾讯云轻量服务器                   │
│              (4C8G, 或两台中低配)              │
│                                               │
│  ┌────────────────┐  ┌──────────────────┐     │
│  │ Docker Compose │  │ Docker Compose   │     │
│  │                │  │                  │     │
│  │ • Fastify API  │  │ • FunASR Worker  │     │
│  │ • LangGraph    │  │   (可选，按需)   │     │
│  │ • PostgreSQL   │  │                  │     │
│  │ • Redis        │  │ • CosyVoice      │     │
│  │ • Temporal     │  │   (可选，按需)   │     │
│  │ • MinIO        │  │                  │     │
│  │ • LangFuse     │  │                  │     │
│  │ • DeepEval     │  │                  │     │
│  └────────────────┘  └──────────────────┘     │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ Milvus (Docker standalone)             │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ React 工作台 (Vite build → Nginx)       │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘

外部依赖：
  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │DeepSeek  │  │ 微信 API  │  │ 企业微信 API  │
  │  v4-pro  │  │(消息推送) │  │ (消息推送)   │
  └──────────┘  └──────────┘  └──────────────┘
```

**P0 月成本**：
- 服务器：¥300-500（腾讯云轻量 4C8G）
- DeepSeek API：¥500-2,000（取决于调用量）
- FunASR GPU（按需）：¥500-1,000（或直接用阿里云 ASR API）
- 微信/企业微信：¥0（基础接口免费）
- **合计**：¥1,300-3,500/月

---

## 7. 安全与权限

### 数据隔离

| 数据层 | 隔离方式 | 访问控制 |
|:---|:---|:---|
| 客户数据 | PostgreSQL 行级隔离 | 按机会负责人授权 |
| 内部成本/毛利 | PostgreSQL 列级加密 | 仅商务+财务可见，Agent 不可直接暴露 |
| 原始证据 | 只读归档 | 不可修改，不可被 Agent 输出覆盖 |
| 方案快照 | MinIO 私有 Bucket | 客户通过临时 Token 访问 |

### Agent 权限矩阵

| 操作 | Agent 权限 | 确认方式 |
|:---|:---|:---|
| 读取客户信息 | ✅ 自动 | — |
| 提取事实、识别缺口 | ✅ 自动 | 标注 confidence + evidence |
| 检索案例、资源 | ✅ 自动 | 标注来源和可用状态 |
| 生成方案草稿 | ✅ 自动 | 标注 pending_confirmations |
| 建议预算区间 | ✅ 自动 | 引用规则引擎结果 |
| 发布方案给客户 | ❌ | 需要人工审批 |
| 写入 CRM | ❌ | 审批后 Temporal 幂等执行 |
| 发送外部消息 | ❌ | 需人工手动发送 |
| 确认档期/价格 | ❌ | 永远不能 |

---

## 8. 与 V4.7 资产的衔接

| V4.7 资产 | V5.0 处理 |
|:---|:---|
| `src/shared/types.ts` | 更新为 V5.0 核心实体 |
| `src/shared/mock/` | 替换为真实数据源 |
| 52 条路由 | 归档，仅保留客户方案 H5 + 销售工作台前端 |
| v0/Trae Design 8 个预览页面 | 归档，作为 UI 参考 |
| `backend/` Fastify API | 扩展 V5.0 新端点 |
| PostgreSQL 25 张表 | 新增 opportunities/brief_versions/plan_versions/evidences 等 V5.0 核心表 |
| Trae Design Handoff | 保留 Design Token，不保留 IA 架构（V4.7 的 52 页结构不再适用） |
| `project-center/` | 更新为 V5.0 事实源 |
