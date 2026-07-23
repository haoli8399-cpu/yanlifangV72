# 历史归档索引

归档文件仅用于追溯，不是当前产品、设计或代码事实源。

## 目录

| 目录 | 内容 | 使用规则 |
|:---|:---|:---|
| `trae/` | Trae AI 评估报告：资产复用、当前状态、差距分析、产品对齐审计与计划、UI/UX 基准 | 仅供调研追溯 |
| `codex-prototype/` | Codex 原型路由与交互设计 | 仅供原型参考 |
| `product/` | 历史 PRD、修订建议和 V4.7 机器可读版本 | 产品演进追溯 |
| `product/legacy-prds/` | V1.0–V4.6 的早期文档 | 禁止直接作为开发输入 |
| `source-snapshots/` | 旧源码压缩包 | 仅用于来源核对，不能替代 Git |
| `backend-api-backups/` | 清理前的后端 API 备份 | 对应历史清理提交 |
| `backend-migration-backups/` | 清理前的迁移备份 | 不得重新作为活动迁移使用 |
| `miniprogram-backups/` | 清理前的小程序配置备份 | 不得覆盖当前配置 |

## 可读历史文档

- [V4.7 机器可读 PRD](product/PRD_V4.7_MACHINE_READABLE.md)
- [V4.6 PRD 修订建议](product/V4.6_PRD_修订建议.md)
- [V3.3.3 PRD](product/legacy-prds/演立方_PRD_V3.3.3.md)
- [V4.0 产品设计策略](product/legacy-prds/演立方_V4.0_产品设计策略.md)

### Trae 评估报告

- [资产复用计划](trae/ASSET_REUSE_PLAN.md)
- [当前状态评估](trae/CURRENT_STATE.md)
- [差距分析](trae/GAP_ANALYSIS.md)
- [产品对齐审计](trae/PRODUCT_REALIGNMENT_AUDIT.md)
- [产品对齐计划](trae/PRODUCT_REALIGNMENT_PLAN.md)
- [UI/UX 基准研究](trae/UI_UX_BENCHMARK_RESEARCH.md)

### Codex 原型

- [原型路由 README](codex-prototype/src/routes/README.md)

## 规则

- 不在归档文件上继续迭代；需要恢复时从历史版本创建新文件或新分支。
- 归档文件的旧命名保留，以便结合 Git 历史定位来源。
- 新归档必须在本页登记来源、日期和用途。
- 当前产品需求入口始终是 [`../PRD.md`](../PRD.md)。
