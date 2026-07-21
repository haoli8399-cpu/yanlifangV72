# 演立方

演立方是独立多租户 AI 商演经营协作平台。Hao Works / 演立方团队运营平台，后仰喜剧是第一家普通 Tenant。

> 唯一工作空间：`/Users/wudixingyunxingleo/projects/演立方`

## 当前版本

| 版本轴 | 当前版本 | 事实源 |
|:---|:---|:---|
| 产品规格 | V6.6 | [`docs/PRD.md`](docs/PRD.md) |
| 代码发布 | `v0.1.0-alpha` | [`versions.json`](versions.json) |
| 代码实现 | 主要为 V4.7 | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| 设计基线 | V4.7 / V1.0 | [`docs/DESIGN.md`](docs/DESIGN.md) |

产品规格、代码发布和设计基线相互独立。PRD 升级到 V6.6 不表示代码已经实现 V6.6。

## 开发入口

- [当前项目状态](PROJECT_STATUS.md)
- [研发 Agent 强制规则](AGENTS.md)
- [MVP 轻量多 Agent 协作方案](MVP_DEV_PLAYBOOK.md)
- [重大决策](DECISIONS.md)
- [Memory First 长期项目记忆](docs/memory/README.md)
- [当前开发审计](docs/MVP_CURRENT_AUDIT.md)
- [文档中心](docs/README.md)
- [任务卡模板](templates/TASK.md)
- [独立审查模板](templates/REVIEW.md)

项目负责人只需要向研发总调度 Agent 描述业务用户、场景、目标和验收结果；PRD 定位、技术拆解、开发、测试、审查、分支和回滚由研发 Agent 处理。

## 代码模块

| 模块 | 路径 | 本地启动 | 最低验证 |
|:---|:---|:---|:---|
| PC/H5 | [`codebase/`](codebase/README.md) | `cd codebase && npm run dev` | `npm run check:type && npm run check:build && npm run lint` |
| 后端 API | [`backend/`](backend/README.md) | `cd backend && npm run dev` | `npm run typecheck && npm run build` |
| 微信小程序 | [`miniprogram/`](miniprogram/README.md) | `cd miniprogram && npm run dev:mp-weixin` | `npm run build:mp-weixin` |

首次运行前在对应模块执行 `npm ci`。依赖、构建产物、日志、密钥和本机缓存不进入 Git。

## 目录

```text
演立方/
├── codebase/          # PC/H5 前端
├── backend/           # 后端 API、Schema 与 Migration
├── miniprogram/       # 微信小程序；src/ 为当前源码
├── docs/              # PRD、架构、设计、审计、发布和历史归档
├── templates/         # 最小任务卡与独立审查模板
├── agent-prompts/     # 三个研发 Agent 提示词和历史 Prompt
├── project-center/    # 旧项目中心，只读兼容
├── scripts/           # 本地与 CI 检查
├── PROJECT_STATUS.md  # 当前状态唯一事实源
├── DECISIONS.md       # 重大决策唯一事实源
└── MVP_DEV_PLAYBOOK.md
```

版本、分支、Tag 和归档规则见 [`docs/VERSIONING.md`](docs/VERSIONING.md)。
