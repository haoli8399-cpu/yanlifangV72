# 演立方 Project Memory 验收测试报告

> 测试日期：2026-07-15；未修改业务代码。运行时证据位于被 Git 忽略、覆盖写入的 `.memory/`。

## 总结

核心机制已达到可用：OpenViking 项目空间、Codex 全局 MCP、来源哈希、Memory Preflight、MCP evidence、Gate、Knowledge Impact、敏感扫描和高风险失败关闭均通过。新开 Codex 能在没有历史聊天提示的情况下自动读取项目规则并启动预检。

唯一未完全闭环的是“嵌套 `codex exec` 新窗口输出完整最终回复”：测试进程受远端模型/插件目录请求超时影响，两次在工具调用后中途退出。它已自动启动预检并正确失败关闭；随后同一个 stdio MCP 和 MCP evidence 链路已用标准 MCP 客户端独立完成端到端验证。该限制不涉及 OpenViking 服务或项目脚本，但仍按“部分通过”记录。

## 场景结果

| # | 场景 | 结果 | 真实证据 |
|:---:|:---|:---:|:---|
| 1 | 全新 Codex 窗口 | ⚠️ 部分通过 | 无历史 `codex exec --ephemeral` 自动读取规则、把报价识别为高风险并执行预检；第一次按规则失败关闭。改为只读 stdio MCP 后未再出现 MCP 初始化错误，但嵌套 Codex 受远端模型刷新/插件请求超时中断，未稳定产出最终回复。标准 MCP 客户端随后完成 health、6 次精确读取、5 个聚焦查询，MCP evidence 高风险预检和 Gate 通过。 |
| 2 | 聊天包含过期规则 | ✅ | 传入“后仰喜剧是平台运营方”，预检输出冲突并拒绝开发；没有采用旧规则。 |
| 3 | OpenViking 摘要过期 | ✅ | 将测试 manifest 的产品版本模拟为 V6.5，来源验证识别 `OpenViking=V6.5, repository=V6.6` 并触发 `needs_sync`。未修改正式 PRD 或远端有效摘要。 |
| 4 | 重大数据库/权限任务 | ✅ | `backend/migrations/999.sql` 测试样本生成 `data_model / Proposed / requires_source_validation` 候选；未自动批准或写入正式记忆。 |
| 5 | 普通样式修改 | ✅ | `codebase/src/button.css` 被判定为 transient，不生成长期任务记忆。 |
| 6 | 敏感文件/密钥 | ✅ | 合成 API Key 被同步前扫描拒绝；同步入口只读取六份固定白名单文件，并禁止 `.env`、私钥、凭证和连接串来源。 |
| 7 | OpenViking 异常 | ✅ | 将服务地址模拟为 `127.0.0.1:1`；高风险 Tenant/报价任务即使存在新鲜缓存仍明确失败关闭。另验证 shell localhost 失败时，实时 MCP evidence 可通过而非回退聊天。 |

## 额外验证

- OpenViking：`0.4.6`，`/health`、`/ready`、Embedding shim 均通过。
- Codex：`0.144.1`，全局 `openviking-local` 已启用。
- MCP：采用项目只读 stdio 适配器，工具为 `health/find/read/list/grep`；标准 MCP 握手、health 和报价检索通过。
- OpenViking 写读删探针：通过且已清理。
- 专属 URI：六份核心知识 + manifest 存在；覆盖同步无重复有效副本。
- 语义索引：对项目 URI 执行 `semantic_and_vectors` 重建，0 失败；检索可返回当前 V6.6、Tenant 和 Agent 规则。
- Tag：写入 API 返回成功；OpenViking 0.4.6 的自动 `.abstract/.overview` 节点不会稳定继承 Tag，因此门禁使用 URI + manifest 状态，Tag 只作补充。
- 本地脚本：语法、JSON、文档链接/孤立检查通过。

## 已知非阻断问题

1. `openviking status` 仍把其他历史长文档的 3 条 Embedding 错误计入全局队列健康；当前演立方重建为 0 失败，`/ready` 为 ready。
2. 全局检索历史零结果率较高；演立方预检通过精确读取核心文件、五类聚焦检索和来源哈希减少遗漏风险。
3. 嵌套 Codex 端到端验收受远端模型/插件请求不稳定影响。正式使用时系统会自动预检；若模型任务本身中断，应重试当前任务，不得把未完成预检当作通过。

## 当前结论

“老板无需提醒 Codex 查询 OpenViking”已由 `AGENTS.md + 全局 MCP + Preflight + Gate` 落地。正式开发准入可验证，OpenViking 异常不会静默依赖聊天。新窗口的完整自动最终回复仍建议在 Codex 远端服务稳定时复测一次；这不需要老板判断技术方案。
