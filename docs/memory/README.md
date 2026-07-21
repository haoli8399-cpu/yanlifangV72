# 演立方 Memory First Architecture

> 状态：MVP 当前有效。OpenViking 用于发现正确事实；原始文件、代码、Schema、测试和 Git 才负责产生事实。

## 1. 最小架构

```text
老板提出业务需求
  ↓
Codex 读取 AGENTS.md
  ↓
project-memory preflight ──→ OpenViking /mcp 或 CLI
  │                          └─ 演立方专属 URI + 语义检索
  ├─ 校验 PRD / 决策 / 状态的原始文件与 SHA-256
  ├─ 检查 Git 分支、HEAD、未提交修改和风险级别
  └─ 覆盖生成 .memory/receipt.json + context.md
  ↓
Memory Gate 允许或拒绝修改
  ↓
开发 → 测试 → 独立审查
  ↓
Knowledge Impact Analysis
  ├─ 无长期价值：不写记忆
  └─ 有长期价值：更新权威文件 → 审核 → sync 覆盖/废弃旧记忆
```

项目 URI：`viking://user/default/resources/yanlifang-project-memory`。选择 `default` 是因为当前 OpenViking 0.4.6 的 localhost dev 模式下，未携带自定义身份 Header 的 Codex HTTP MCP 会解析为 `default/default`。项目隔离由固定 URI 和 `project=yanlifang` Tag 双重实现。

仓库内只有一个执行入口：

```bash
node scripts/project-memory.mjs <health|sync|preflight|gate|impact|verify>
```

## 2. 事实源权威矩阵

| 问题类型 | 权威来源 | OpenViking 的作用 |
|:---|:---|:---|
| 产品定义与范围 | 当前生效 PRD + 明确修正 PRD 的 Approved 产品决策 | 找到相关章节、规则和决策 |
| 技术架构 | Approved 技术决策 + 当前架构文档 | 定位模块、限制和历史原因 |
| 系统真实行为 | 代码 + Schema + Migration + 测试/运行结果 | 快速定位入口，不代替现场验证 |
| 当前进度 | `PROJECT_STATUS.md` + 任务记录 + Git | 提供带时间和来源的状态索引 |
| 历史原因与踩坑 | 有效长期记忆 + 原任务/决策记录 | 跨窗口发现可复用经验 |
| 当前用户指令 | 本次用户明确输入 | 作为新输入；冲突时触发影响分析 |

任何冲突都不能用简单线性优先级掩盖。代码与架构文档不一致时报告差异；当前指令与已批准基线冲突时先生成变更影响分析。

## 3. OpenViking Knowledge Model

MVP 只初始化六类核心知识，不复制完整仓库：

| URI 目录 | 内容 | 当前文件 |
|:---|:---|:---|
| `00_PROJECT_CONTEXT` | 稳定定位、阶段、底线 | [`knowledge/00-project-context.md`](knowledge/00-project-context.md) |
| `01_PRODUCT_MEMORY` | 当前 PRD 摘要和核心边界 | [`knowledge/01-product-current.md`](knowledge/01-product-current.md) |
| `02_TECH_MEMORY` | 技术栈、模块入口、验证限制 | [`knowledge/02-technical-current.md`](knowledge/02-technical-current.md) |
| `03_DECISIONS` | Approved 决策索引 | [`knowledge/03-decisions-current.md`](knowledge/03-decisions-current.md) |
| `04_DEVELOPMENT_STATUS` | 当前状态与优先级索引 | [`knowledge/04-development-status.md`](knowledge/04-development-status.md) |
| `07_AGENT_RULES` | 所有研发 Agent 的强制规则 | [`knowledge/07-agent-rules.md`](knowledge/07-agent-rules.md) |
| `09_REFERENCE` | 机器可读 manifest、来源哈希、同步版本 | 由脚本生成 |

`05_TASK_MEMORY`、`06_BUG_AND_LESSONS`、`08_CHANGE_HISTORY` 只在出现有长期价值的事实时创建，不预先堆空目录。

每条知识至少包含：`memory_id`、标题、类型、状态、范围、来源路径、来源版本、生效时间、批准人、Tags、摘要。同步时追加每个来源的 SHA-256、当前 Git HEAD 和同步时间。正式状态为 `Approved`、`Superseded` 或 `Deprecated`；候选只能是 `Proposed`。

OpenViking 0.4.6 已验证支持 URI 范围、context type、Tags、时间、层级和通用 metadata filter。当前版本的显式 Tag 不会稳定继承到自动生成的 `.abstract/.overview` 节点，因此硬隔离使用项目 URI，生效状态使用 manifest 校验，Tag 只作补充过滤，不作为安全门禁。返回数量默认每个问题 5 条，装配时按 URI 去重并优先直接文件结果。

## 4. Memory Preflight and Retrieval Protocol

启动命令示例：

```bash
node scripts/project-memory.mjs preflight \
  --task-id F13-quote-rules \
  --task "继续开发演立方报价模块" \
  --modules "报价,pricing,quotes" \
  --risk high
```

预检自动完成：

1. 确认当前目录属于演立方并读取 `versions.json`。
2. 访问 `/ready`，不以 `/health` 代替可用性门禁。
3. 精确读取 OpenViking manifest 和六份核心知识。
4. 将任务拆成“产品范围、业务规则、Approved 决策、当前状态、历史风险/测试”五类检索，禁止一个“大而全”问题。
5. 比较 manifest 中的来源哈希、PRD 版本和本地权威文件。
6. 检查当前分支、HEAD 和未提交修改。
7. 覆盖写入 `.memory/receipt.json` 与 `.memory/context.md`；不按任务长期累积垃圾。

若 Codex shell 因沙箱无法访问 localhost，但全局 `openviking-local` MCP 正常，则 Agent 必须直接用 MCP 完成 health、manifest、六份核心精确读取和五个聚焦查询，并生成 `.memory/mcp-evidence.json`。证据必须包含 `captured_at`、`project_uri`、`health_ok`、完整 `manifest`、全部 `retrieved_uris` 和至少五个 `retrieved_queries`；脚本只接受 10 分钟内且来源哈希全部匹配的证据。随后执行：

```bash
node scripts/project-memory.mjs preflight ... --mcp-evidence .memory/mcp-evidence.json
```

这仍是 OpenViking 实时预检，不是只读缓存降级。

回执包含任务 ID、摘要、时间、PRD、检索 URI、决策 ID、状态版本、关键来源、冲突、上下文完整性和是否允许开发。`gate` 要求回执小于 4 小时、HEAD/分支/来源哈希未变化且 `allow_development=true`。

### 故障规则

- 高风险任务：OpenViking 不可用、manifest 缺失/过期、PRD 冲突或来源无法验证时一律停止。
- 低风险任务：只有 `.memory/cache.json` 小于 24 小时且所有来源哈希仍匹配时，才可明确标注 `verified_cache` 继续；绝不使用聊天历史替代。
- OpenViking 摘要落后于 PRD：以原始 PRD 为准，预检拒绝进入开发并输出 `needs_sync`。PRD 版本变化还必须先生成升级影响报告并等待老板确认。

失败输出必须包含：失败步骤、原因、缺失内容、任务影响、自动修复结果、是否允许继续、老板是否需要处理。

## 5. Knowledge Impact and Writeback Protocol

任务结束时执行：

```bash
node scripts/project-memory.mjs impact --task-id F13-quote-rules
```

脚本按实际变更分类：PRD/范围、决策、架构、Schema/Migration、权限/Tenant、部署、重大 Bug/经验会生成 `Proposed` 候选；普通样式、按钮颜色、普通文案、一次性 Debug 和重命名不会生成长期记忆。

正式流程：

```text
任务完成
→ impact 生成候选
→ 验证来源、重复和冲突
→ 先更新 PRD / DECISIONS / PROJECT_STATUS / 架构等权威文件
→ 需要老板批准的先批准
→ 更新白名单知识摘要
→ sync 覆盖同一稳定 URI
→ 旧版本标记 Superseded/Deprecated 或删除重复有效副本
```

开发 Agent 没有把推测写成 Approved 记忆的权限。`sync` 只接受 `docs/memory/knowledge/` 白名单，不扫描业务源码，不导入聊天记录。

## 6. PRD 升级协议

发现新 PRD 时：识别当前基线 → 对比版本 → 按功能编号分类新增/删除/定位/范围/流程/规则/权限/数据/API/UI/文案/无代码影响 → 检查决策、代码和进行中任务 → 生成《PRD版本升级影响报告》 → 等待必要老板确认 → 更新 `versions.json` 和 PRD 入口 → 更新摘要并 `sync` → 将旧摘要标记为 Superseded。

检测到新文件不等于正式切换，也不自动修改业务代码。

## 7. 安全和隐私

- 导入采用固定六文件白名单；不支持“把仓库整个 add-resource”。
- 写入前扫描密钥、Token、密码、私钥、连接串和 `.env` 引用；命中即失败。
- `.memory/` 是本机覆盖式运行目录并被 Git 忽略；日志不得输出配置中的凭证。
- 当前 OpenViking 为 localhost dev 模式，只适合本机；不对局域网或公网开放。
- 需要远程多用户时另行设计 API Key、账户隔离、备份和权限，不在 MVP 预建。

## 8. 老板使用方式

老板以后只需说业务目标，例如“继续开发报价模块”。Codex 自动预检、定位 PRD、检查状态、拆任务、开发、测试、审查和判断知识影响。

只有产品范围/核心规则变化、明显成本差异、不可逆数据变更、正式 PRD 切换、承担重大上线风险、正式生产发布或废弃重大 Approved 决策时，才向老板发决策卡。

老板判断系统是否正常只看两点：任务开始时 Codex 明确报告 `Memory Preflight Passed`；任务结束时说明是否产生长期知识影响。若出现 `Memory Preflight Failed`，系统必须暂停并解释，不能假装查询成功。
