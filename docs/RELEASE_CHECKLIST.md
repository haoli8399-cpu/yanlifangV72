# 版本发布清单

> **每个重要版本发布前，Hermes 必须逐项检查。全部打勾才能发布。**

---

## 版本号规则

```
v{major}.{minor}.{patch}

major: 重大架构变更、不兼容的 API 变更
minor: 新功能、新模块
patch: Bug 修复、文案修正
```

**当前阶段（开发期）：** 使用 `v0.x.x`  
**首次部署上线：** `v1.0.0`

---

## 发布前检查

### 代码质量

- [ ] `npx tsc --noEmit` 零错误（前端）
- [ ] `npm run typecheck` 零错误（后端）
- [ ] `npm run lint` 通过
- [ ] `npm run build` 成功
- [ ] 无 `@ts-nocheck` / `@ts-ignore`（除非有充分理由并记录）

### 功能完整性

- [ ] 所有 P0 功能通过手动测试
- [ ] 核心用户流程可完整走通
- [ ] 空状态/错误状态均有处理
- [ ] 无遗留的 Mock 假数据伪装功能完成
- [ ] 无调试代码（console.log / debugger / 临时注释）

### UI/UX 检查

- [ ] 所有关键页面视觉验收通过
- [ ] 品牌色无残留（`#5B4FD6`，无 `#6E59F5`/`#7c3aed`）
- [ ] StatusTag 组件无残留 `<Tag color="xxx">`
- [ ] 硬编码字号/间距已 Token 化
- [ ] 响应式检查（桌面端 + 移动端 768px）通过
- [ ] 关键页面截图已保存

### 数据库

- [ ] 数据库备份已完成（如有变更）
- [ ] 迁移脚本可正向执行
- [ ] 回滚脚本已验证可逆向执行
- [ ] 测试数据已清理（无敏感真实数据）

### 安全

- [ ] 环境变量检查：无密钥/Token 出现在代码中
- [ ] `.gitignore` 包含 `.env`、`.local`、`.dev.vars`
- [ ] `JWT_SECRET` 不是默认值 `'dev-secret-change-me'`（生产环境）
- [ ] API 权限校验到位

### 文档

- [ ] `docs/STATUS.md` 已更新
- [ ] `project-state.json` 已同步更新
- [ ] `docs/PRD.md` 功能状态已同步
- [ ] `docs/DECISION_LOG.md` 本次发布决策已记录
- [ ] 版本号已更新（package.json / project-state.json）

### Git（有 Git 时）

- [ ] 所有代码已 Commit
- [ ] 无未跟踪的文件（`git status` clean）
- [ ] Git Tag 已创建（`vX.Y.Z`）
- [ ] Tag Push 到远程

---

## 发布流程

```
1. 冻结代码 → 执行本清单全部检查
2. 部署 Preview 环境
3. 冒烟测试（核心流程走一遍）
4. 人工确认（豪哥验收）
5. 部署 Production
6. 发布后冒烟测试
7. 记录稳定 Commit → 更新 STATUS.md → 更新 project-state.json
```

---

## 回滚方案

发生严重问题时：

1. **前端回滚：** 部署上一个稳定 Tag 的构建产物
2. **后端回滚：** 切换到上一个稳定 Commit，重启服务
3. **数据库回滚：** 执行对应迁移的回滚脚本
4. **配置回滚：** 恢复环境变量到上一个稳定版本

回滚后：
- [ ] 验证核心功能恢复
- [ ] 记录回滚原因到 DECISION_LOG.md
- [ ] 创建 Bug 修复任务

---

## 版本历史

| 版本 | 日期 | 内容 | 稳定 Commit |
|:---|:---|:---|:---|
| v0.0.0 | 待定 | 首个版本基线 | ⚠️ 无 |

---

> **注意：** 当前 Git 未初始化，本清单中 Git 相关项暂时无法执行。
> 优先任务：初始化 Git → 建立 v0.0.0 基线。
