# 演立方文档中心

当前事实源保持精简；历史版本、设计交付和交接材料进入专门目录，不与当前状态混用。

## 当前事实源

| 领域 | 唯一入口 | 当前基线 |
|:---|:---|:---|
| 项目状态 | [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) | 当前阶段、阻塞与下一步 |
| Agent 规则 | [`AGENTS.md`](../AGENTS.md) | 三研发角色与完成底线 |
| 研发流程 | [`MVP_DEV_PLAYBOOK.md`](../MVP_DEV_PLAYBOOK.md) | MVP 轻量协作、测试、Git、发布和 PRD 升级 |
| 重大决策 | [`DECISIONS.md`](../DECISIONS.md) | 已确认长期决策 |
| 项目总控 | [`PROJECT.md`](PROJECT.md) | 主体、版本与文件地图 |
| 产品需求 | [`PRD.md`](PRD.md) | V6.6 |
| 技术架构 | [`ARCHITECTURE.md`](ARCHITECTURE.md) | V4.7 as-built |
| 设计治理 | [`DESIGN.md`](DESIGN.md) | V4.7 / V1.0 |
| 版本管理 | [`VERSIONING.md`](VERSIONING.md) | 版本、分支、Tag 和归档 |
| 长期项目记忆 | [`memory/README.md`](memory/README.md) | OpenViking、Memory Preflight、Gate、Receipt 和回写治理 |

## MVP 研发交付

- [当前开发状态审计](MVP_CURRENT_AUDIT.md)
- [任务卡模板](../templates/TASK.md)
- [独立审查模板](../templates/REVIEW.md)
- [手工发布检查清单](RELEASE_CHECKLIST.md)
- [三个研发 Agent 提示词](../agent-prompts/README.md)
- [Project Memory 现状审计](memory/reports/AUDIT_2026-07-15.md)
- [Project Memory 验收测试报告](memory/reports/TEST_REPORT_2026-07-15.md)

## 产品与架构版本

- [PRD V6.6](PRD_V6.6.md) — 当前产品规格。
- [PRD V6.5](PRD_V6.5.md) — 上一产品规格。
- [PRD V6.1](PRD_V6.1.md) — 验证草案。
- [V5 产品技术方案](SOLUTION_V5.md)。
- [V5 架构](ARCHITECTURE_V5.md)。
- [V6 架构方案](ARCHITECTURE_V6.md)。
- [V6.1 架构方案](ARCHITECTURE_V6.1.md)。

## 资产与历史

- [工作空间清单](WORKSPACE_INVENTORY.md)
- [设计资产索引](design/README.md)
- [交接记录索引](handoffs/README.md)
- [历史归档索引](archives/README.md)

`project-center/` 是旧项目中心，只读兼容。以下文件仅保留旧链接，不维护第二份事实：

- [旧状态入口](STATUS.md)
- [旧决策入口](DECISION_LOG.md)
- [旧任务模板入口](TASK_TEMPLATE.md)
- [旧审查模板入口](REVIEW_CHECKLIST.md)

## 维护规则

1. 新 PRD 先保存版本文件并生成升级影响报告，经项目负责人确认后再更新 `PRD.md` 和 `versions.json`。
2. 不覆盖历史 PRD、Migration、Tag 或已推送 Git 历史。
3. 新任务绑定 PRD 版本、F 编号、章节、目标和验收。
4. 构建产物、依赖、日志、密钥和本机缓存不进入 Git。
5. 新增 Markdown 必须从本页或子目录索引可达，并通过 `node scripts/check-governance.mjs`。
