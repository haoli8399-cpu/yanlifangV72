# 演立方版本管理规范

## 1. 三条版本线

演立方同时维护三条独立版本线，禁止用一个版本号代替全部状态。

| 版本线 | 格式 | 当前值 | 说明 |
|:---|:---|:---|:---|
| 产品规格 | `V主版本.次版本` | V6.6 | 描述产品规则和目标体验 |
| 代码发布 | `vMAJOR.MINOR.PATCH[-prerelease]` | `v0.1.0-alpha` | Git Tag 对应可复现代码 |
| 设计基线 | `产品基线 / 设计系统版本` | V4.7 / V1.0 | 当前已落地视觉规则 |

所有当前值统一记录在根目录 [`versions.json`](../versions.json)。

## 2. 产品文档版本

- 文件名：`PRD_V6.6.md`、`ARCHITECTURE_V6.1.md`。
- `docs/PRD.md` 只作为当前入口，不承载独立历史版本。
- 新 PRD 经确认后：新增版本文件 → 更新 `PRD.md` → 更新 `versions.json` → 更新 `CHANGELOG.md`。
- 被替代版本保留，不覆盖、不删除；历史二进制材料进入 `docs/archives/product/`。
- “草案、已确认、已替代、已归档”必须在索引中明确。

## 3. 代码版本

- 代码发布遵循语义化版本：破坏兼容为 MAJOR，向后兼容功能为 MINOR，修复为 PATCH。
- 预发布使用 `-alpha.N`、`-beta.N` 或 `-rc.N`；已有 `v0.1.0-alpha` Tag 保持不改写。
- 三个应用的包版本允许独立演进，但每次发布都必须在 `versions.json` 登记。
- 数据库迁移一经进入共享分支不得修改原文件；修正必须新增迁移。
- 禁止重写已推送历史、强制推送或复用旧 Tag。

## 4. 分支和提交

| 类型 | 分支前缀 | 示例 |
|:---|:---|:---|
| 新功能 | `feat/` | `feat/tenant-reputation` |
| 修复 | `fix/` | `fix/payment-status` |
| 文档 | `docs/` | `docs/prd-v6-7` |
| 工程治理 | `chore/` 或 `feat/` | `feat/workspace-version-governance` |
| 发布准备 | `release/` | `release/v0.2.0-alpha.1` |

- 不直接修改 `main`。
- 提交信息使用 `feat:`、`fix:`、`docs:`、`chore:`、`refactor:`、`test:`、`ci:`。
- 一次提交只表达一个可回滚目的；文档版本和代码实现可以分开提交。
- 合并前运行 `bash scripts/pre-commit-check.sh`。

## 5. 发布和回滚

1. 更新组件包版本、`versions.json` 和 `CHANGELOG.md`。
2. 运行治理检查、类型检查、构建和适用测试。
3. 创建 Pull Request，说明产品版本与代码版本的对应关系。
4. 合并后从 `main` 创建唯一 Tag。
5. 发布记录写明 Tag、Commit、数据库迁移、部署环境和回滚点。
6. 回滚使用新提交或部署旧 Tag，不删除历史。

## 6. 文件归档与生成物

- 当前代码只放在 `codebase/`、`backend/`、`miniprogram/src/` 等明确源码目录。
- `node_modules/`、`dist/`、`.output/`、日志、覆盖率、本机配置和密钥不纳入版本管理。
- 历史 PRD、旧源码快照和旧交接分别进入 `docs/archives/`、`docs/handoffs/`。
- Prompt 放入 `agent-prompts/`，文件内保留适用产品版本和生成日期。
- 二进制快照必须写明来源和用途，不可替代 Git 历史。

## 7. 自动校验

执行：

```bash
node scripts/check-governance.mjs
```

检查包括：版本清单引用、组件包版本、当前 PRD、Markdown 内部链接以及禁止跟踪的生成物。
