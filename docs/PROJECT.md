# 演立方项目总控

> 本文件定义项目主体、版本边界、唯一工作空间和事实源地图。当前状态以 [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) 为准。

## 1. 项目基本信息

| 维度 | 当前内容 |
|:---|:---|
| 项目名称 | 演立方（YANLI / YLF） |
| 产品定位 | 独立多租户 AI 商演经营协作平台 |
| 平台运营方 | Hao Works / 演立方团队 |
| 第一家 Tenant | 后仰喜剧；不具备平台级特殊权限 |
| 唯一工作空间 | `/Users/wudixingyunxingleo/projects/演立方` |
| Git 远端 | `https://github.com/haoli8399-cpu/yanli-v47.git` |
| 默认分支 | `main` |

## 2. 版本边界

| 版本轴 | 当前版本 | 事实源 |
|:---|:---|:---|
| 产品规格 | V6.6 | [`PRD.md`](PRD.md) |
| 代码发布 | `v0.1.0-alpha` | [`versions.json`](../versions.json) |
| 代码实现基线 | 主要为 V4.7 | Git、组件 README、[`ARCHITECTURE.md`](ARCHITECTURE.md) |
| 设计基线 | V4.7 / V1.0 | [`DESIGN.md`](DESIGN.md) |

产品规格升级不代表代码和设计已经同步升级。每个开发任务必须写明 PRD 版本、功能编号、对应章节、目标和验收标准。

## 3. 当前事实源

| 文件 | 只负责 |
|:---|:---|
| [`../AGENTS.md`](../AGENTS.md) | 所有研发 Agent 强制规则 |
| [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) | 当前阶段、完成、进行、下一步、阻塞与风险 |
| [`PRD.md`](PRD.md) | 当前产品规则入口 |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | 当前 as-built 技术事实 |
| [`DESIGN.md`](DESIGN.md) | 当前已落地设计规则 |
| [`../DECISIONS.md`](../DECISIONS.md) | 已确认重大决定 |
| [`../MVP_DEV_PLAYBOOK.md`](../MVP_DEV_PLAYBOOK.md) | 研发流程、测试、Git、发布和 PRD 升级 |
| [`../versions.json`](../versions.json) | 机器可读版本映射 |

`project-center/`、交接文件、历史 Prompt 和 `docs/archives/` 只作参考，冲突时不得覆盖上述事实源。

## 4. 工作空间结构

```text
/Users/wudixingyunxingleo/projects/演立方/
├── codebase/               # PC/H5 前端
├── backend/                # 后端 API、数据库 Schema 与 Migration
├── miniprogram/            # 微信小程序；src/ 是当前源码
├── docs/                   # 产品、架构、设计、审计、发布和归档
├── templates/              # 最小任务卡和独立审查模板
├── agent-prompts/          # 三个研发 Agent 提示词与历史 Prompt
├── project-center/         # V4.7 旧项目中心，只读兼容
├── scripts/                # 本地/CI 检查
├── PROJECT_STATUS.md       # 当前状态
├── DECISIONS.md            # 重大决策
├── MVP_DEV_PLAYBOOK.md     # MVP 研发协作流程
├── versions.json           # 统一版本清单
└── CHANGELOG.md            # 可追溯变化
```

## 5. 核心规则

1. 不直接修改 `main`；一项任务一个短生命周期分支。
2. 产品业务 Agent 与研发协作 Agent 分开；产品 MVP 仍为一个主 Agent + 确定性工具。
3. 不覆盖历史 PRD、Tag、Migration 或已推送 Git 历史。
4. 新 PRD 先做版本影响报告，经项目负责人确认后才切换基线。
5. 高风险变更必须有影响分析、测试、独立审查、回滚和老板决策卡。
6. Tenant、权限、金额、状态机和生产配置默认串行开发。
7. 密钥、`.env`、依赖、构建产物、日志和本机状态不进入 Git。
8. 合并前运行任务卡指定检查；发布前运行 `bash scripts/pre-commit-check.sh`。

## 6. 模块职责

| 模块 | 路径 | 当前角色 |
|:---|:---|:---|
| PC/H5 | [`../codebase/`](../codebase/README.md) | 多角色页面原型；多数业务页仍为 Mock |
| 后端 API | [`../backend/`](../backend/README.md) | API、旧版业务模型、Schema/Migration 和部署资产 |
| 微信小程序 | [`../miniprogram/`](../miniprogram/README.md) | uni-app 页面骨架；历史重复目录待专项收敛 |

版本细则见 [`VERSIONING.md`](VERSIONING.md)，研发协作细则见 [`../MVP_DEV_PLAYBOOK.md`](../MVP_DEV_PLAYBOOK.md)。
