---
memory_id: YLF-AGENT-RULES-001
title: 演立方研发 Agent Memory First 规则摘要
knowledge_type: agent_rules
status: Approved
scope: all_coding_agents
source_type: project_agent_rules
source_paths: AGENTS.md,MVP_DEV_PLAYBOOK.md
source_version: 2026-07-15
effective_from: 2026-07-15
approved_by: project_owner
tags: project=yanlifang,status=approved,type=agent_rules
---

# 演立方研发 Agent Memory First 规则摘要

任何研发任务在读取或修改业务代码前必须执行 `node scripts/project-memory.mjs preflight`，生成覆盖式 `.memory/receipt.json` 和最小上下文包。聊天只提供本次输入，不是项目历史事实源。

预检必须查询 OpenViking，并验证 PRD、状态、决策、Git 和来源哈希。高风险任务在 OpenViking 不可用、知识过期、来源冲突或上下文不完整时必须停止；不得静默依赖聊天历史。

任务结束前必须运行真实测试、自检、Knowledge Impact Analysis，并按影响更新权威文件。正式记忆只能来自可验证来源；Agent 推测和未批准建议不得写为 `Approved`。

禁止将 `.env`、密钥、Token、密码、凭证、私钥、未脱敏客户数据和完整聊天记录写入 OpenViking。同步只允许读取 `docs/memory/knowledge/` 白名单文件及其声明的权威来源。

完整规则与故障输出格式以根目录 `AGENTS.md` 和 `docs/memory/README.md` 为准。
