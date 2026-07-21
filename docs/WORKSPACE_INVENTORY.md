# 演立方工作空间清单

> 盘点日期：2026-07-15。唯一工作空间：`/Users/wudixingyunxingleo/projects/演立方`。

## 1. 总览

当前治理范围共 430 个文件；未发现 `node_modules/`、`dist/` 或 `.output/` 被提交。三个依赖目录和本地构建产物约占工作空间绝大部分体积，但均由 `.gitignore` 排除。

| 区域 | 当前文件数 | 定位 |
|:---|---:|:---|
| `codebase/` | 160 | PC/H5 前端主代码 |
| `miniprogram/` | 123 | 微信小程序源码与兼容资产 |
| `backend/` | 58 | 后端 API、迁移和部署配置 |
| `docs/` | 58 | 产品、架构、审计、发布和历史文档 |
| `agent-prompts/` | 12 | 三个当前研发 Prompt 与历史 Prompt |
| `templates/` | 2 | 最小任务卡和独立审查模板 |
| `project-center/` | 7 | 旧项目中心，兼容保留 |
| 根目录及脚本 | 10 | 当前事实源、版本清单、状态和检查脚本 |

## 2. 模块判定

沿用四级资产判定：核心资产、提取合并、重建、弃用/排除。

| 模块 | 判定 | 处理 |
|:---|:---|:---|
| `codebase/` | 核心资产 | 保持源码路径，增加模块 README 和包版本 |
| `backend/` | 核心资产 | 保持源码路径，沿用独立包版本和数据库迁移历史 |
| `miniprogram/src/` | 核心资产 | 明确为 uni-app 当前源码入口 |
| `miniprogram/components|stores|styles` | 提取合并 | 与 `src/` 存在重复或分叉，暂不删除；后续专项确认差异后归档 |
| `miniprogram/miniprogram/` | 提取合并 | 原生微信示例/兼容目录，与 uni-app 构建链分开管理 |
| 根事实源与 `docs/` | 核心资产 | `AGENTS.md`、`PROJECT_STATUS.md`、`DECISIONS.md`、Playbook 与产品/架构文档 |
| `templates/` 与当前研发 Prompt | 核心资产 | 支撑三角色串行研发闭环 |
| `project-center/` | 提取合并 | 作为 V4.7 历史速查保留，不再新增当前事实 |
| 根目录 Prompt/设计/交接 | 提取合并 | 移入 `agent-prompts/`、`docs/design/`、`docs/handoffs/` |
| 历史 PRD 与源码压缩包 | 弃用为当前源 | 移入 `docs/archives/`，只用于追溯 |
| `node_modules/`、`dist/`、`.output/`、`.hermes/` | 排除 | 不进入 Git，可随时重建或属于本机状态 |

## 3. 代码版本现状

| 组件 | 包名 | 包版本 | 发布说明 |
|:---|:---|:---|:---|
| 前端 | `tanstack_start_ts` | `0.1.0-alpha` | 随仓库稳定 Tag 管理 |
| 后端 | `yanchu-platform-backend` | `0.1.0` | 独立组件版本 |
| 小程序 | `comedy-factory` | `1.0.0` | 独立组件版本 |

依赖锁文件均使用 `package-lock.json`，每个组件各保留一份。版本总表见 [`versions.json`](../versions.json)。

## 4. 文档版本现状

- 当前产品规格：V6.6。
- 当前代码实现基线：以 V4.7 为主，不能标记为“已实现 V6.6”。
- 当前设计基线：V4.7 / V1.0。
- 当前 as-built 架构：V4.7；V5、V6、V6.1 文档是演进方案。
- 原 `docs/PRD.md` 的 V4.7 内容已保存在 `docs/archives/product/PRD_V4.7_MACHINE_READABLE.md`。

## 5. 已识别风险

1. 小程序存在双份目录，部分文件完全相同，部分已分叉；在专项验证前不得直接删除。
2. `project-center/` 与旧 `docs/STATUS.md` 等文件保留兼容入口；当前状态和决策只更新根目录事实源。
3. 代码当前主要实现 V4.7，而产品规格已到 V6.6；开发任务必须标注实现所依据的 PRD 章节。
4. 旧源码压缩包不是可复现发布，只作为历史输入保存。
5. 前端生产构建通过，但严格类型检查有 2 个既存 TS2367，Lint 有 1864 个既存问题；CI 和提交前检查将如实失败，不再忽略。
6. 当前没有自动化业务测试；Tenant、报价、金额、状态机和关键 API 缺少回归保护。
7. 现有部署配置的构建目录、端口、健康检查和 Migration 执行不一致，尚不能作为可靠生产发布路径。

## 6. 后续专项

- 小程序双份源码收敛：比较运行入口、构建结果和微信开发者工具配置后，再决定归档根级旧目录。
- 建立 V6.6 F01-F43 产品到代码影响矩阵，并冻结首个纵向切片。
- 串行建设 Tenant 隔离和演员多 Tenant 合作关系，再改造真实业务闭环。
- 修复前端最低检查基线，并为高风险规则增加可复跑测试。
- 修复并验证一条手工 Preview/Production 发布路径。
- 每个代码发布补充 Tag、Commit、构建证据和数据库迁移清单。
