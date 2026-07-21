# 演立方项目状态

> 最后更新：2026-07-15。只记录当前事实，不记录普通开发过程。

## 当前基线

| 项目 | 当前事实 |
|:---|:---|
| 唯一工作空间 | `/Users/wudixingyunxingleo/projects/演立方` |
| 当前产品规格 | V6.6，入口为 [`docs/PRD.md`](docs/PRD.md) |
| 代码实现基线 | 主要为 V4.7；不能按 V6.6 完成度理解 |
| 稳定代码 | Tag `v0.1.0-alpha`，Commit `4dcc02d` |
| 默认分支 | `main` |
| 当前工作分支 | `feat/workspace-version-governance` |
| 当前阶段 | MVP 开发启动：事实源、轻量三 Agent 协作和 Memory First 已建立；首个报价权限安全增量已完成并通过独立审查 |

## 当前已经具备

- PC/H5 前端原型、共享组件和需求/机会/方案/报价/后台等页面骨架；多数业务页仍使用 Mock。
- Fastify API、PostgreSQL Schema/Migration、JWT/RBAC 和需求、报价、合同、支付、履约、评价等旧版接口基础。
- 演员评价、演员信誉分与信誉变动日志的旧模型；尚不满足 V6.6 Tenant 和演员关系要求。
- uni-app 微信小程序页面骨架；部分页面仍为 Mock/TODO。
- Git、版本清单、文档治理和最小 CI。
- OpenViking 0.4.6 本机服务、Codex MCP 接入、六份白名单核心知识、Memory Preflight/Gate/Receipt、来源哈希和 Knowledge Impact Analysis。
- QUOTE-001 报价读取权限与内部价格脱敏：旧模型下限制客户/销售读取本人需求报价，演员禁止读取，内部价格按角色脱敏；尚不等于 V6.6 Tenant 隔离。

## 当前验证状态

| 检查 | 结果 | 说明 |
|:---|:---:|:---|
| 文档/版本治理 | ✅ | `node scripts/check-governance.mjs` 通过 |
| 后端类型与构建 | ✅ | `npm run typecheck`、`npm run build` 通过 |
| 后端启动 | ✅ | 本地 `/v1/health` 返回 200；Redis 未启动时降级运行 |
| PC/H5 构建 | ✅ | Client、SSR、Nitro 构建通过 |
| PC/H5 类型 | ❌ | `codebase/src/routes/m.index.tsx:171` 有 2 个 TS2367 |
| PC/H5 Lint | ❌ | 既存基线 1864 个问题（1858 errors / 6 warnings） |
| 小程序构建 | ✅ | 构建通过；有 Sass 弃用警告 |
| 自动化业务测试 | 🟡 | 报价访问规则与三个 GET 路由测试 10/10 通过；其他高风险模块仍无自动化测试 |
| Docker 本地栈 | ⛔ | Docker 当前未运行；现有部署配置本身也有路径/端口/健康检查不一致 |

## 正在进行

- 工作空间治理与本研发协作体系位于同一未提交任务分支，尚未提交、推送或合并。
- Project Memory 系统正在同一分支完成初始化与验收，不修改业务功能代码。
- 六份核心知识、全局只读 MCP、真实 Preflight/Gate、MCP evidence 和七类策略测试已完成；嵌套新窗口受远端 Codex 请求中断，完整最终回复待服务稳定时复测。
- QUOTE-001 已实现、自测并通过独立复审；项目负责人已选择方案 A，独立分支 `feat/quote-001-read-security` 已创建提交 `5d44462`。尚未合并、推送或发布。

## 下一步三个任务

1. **F43 Tenant 身份与成员权限基础**。报价规则、正式报价和内部价格权限必须先获得真实 Tenant 上下文。
2. **QUOTE-002：F13/F14 报价规则与版本模型**。在 Tenant 基础上实现隔离、维护角色、版本和更新日志，不沿用旧三层价硬编码。
3. **QUOTE-003：F15 确定性预算引擎**。项目负责人确认底价、分成、折扣和毛利口径后，实现计算、异常门禁和规则版本追溯。

## 当前阻塞与风险

- V6.6 的 `tenants`、`tenant_members`、演员平台身份和多 Tenant 合作关系尚未进入当前 Migration/API。
- PC/H5 页面完成度显著高于真实 API/数据库闭环，存在伪完成风险。
- 旧评价/信誉只覆盖演员和单公司模型；缺 Tenant 信誉、分层归因、申诉、置信度和推荐记录。
- 没有自动化保护 Tenant 隔离、报价、金额、状态机等高风险规则。
- 发布脚本的构建目录、API 端口和健康路径不一致，且只显式执行第一份 Migration，不能作为可靠生产发布路径。
- 小程序存在活动 `src/` 与历史重复目录；`project-center/` 是只读兼容区。
- OpenViking 完整状态仍保留历史队列错误和较高零结果率；`/ready` 当前通过，语义检索仍需以精确来源校验兜底。

## 并行判断

当前核心开发不适合并行。Tenant、认证、Schema、共享类型和首个纵向闭环必须串行。仅当任务文件边界完全独立且研发总调度确认后，才允许第二个开发 Agent 介入。
