# Agent Prompt 索引

Prompt 必须注明用途和产品基线。Prompt 不是产品事实源，PRD 变化后必须先做影响分析。

## 当前研发协作 Prompt

MVP 只启用三个研发角色：

- [研发总调度 Agent](rd-orchestrator.md) — 项目负责人的唯一主要研发入口。
- [开发执行 Agent](rd-developer.md) — 任务卡范围内实现和自测；默认一个实例，最多两个。
- [独立审查 Agent](rd-reviewer.md) — 未参与开发的独立复核者。

这三者是研发协作 Agent，不是演立方上线后的产品业务 Agent。产品 MVP 仍按 V6.6 使用一个主 Agent + 确定性工具。

## 历史开发 Prompt

- [Codex 后端扩展](agent-codex-backend.md) — V4.7 历史任务，不作为当前通用角色。
- [Qoder CRM 线索中心](agent-qoder-leads-crm.md) — V4.7 历史任务，不作为当前通用角色。

## 历史设计与生成 Prompt

- [Lovable V1](design/LOVABLE_PROMPT.md)
- [Lovable V2](design/LOVABLE_PROMPT_V2.md)
- [Lovable V3](design/LOVABLE_PROMPT_V3.md)
- [v0 Prompt](design/V0_PROMPT.md)
- [Trae Design Prompt](design/TRAE_DESIGN_PROMPT.md)
- [Trae Design Design Package](design/TDDP.md)

新增 Prompt 使用明确职责名称，不使用“最新版”“final-final”等不可追溯命名。
