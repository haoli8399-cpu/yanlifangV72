# 演立方 V4.7 — Agent 统一入口

> **任何 Agent 打开本项目时，本文件自动加载。**
>
> Hermes 是项目总负责人。其他 Agent 按任务类型选择性读取事实源。

---

## 🚨 第一条：读本文件后再行动

**所有 Agent 收到任务后，第一件事：**
1. 读本文件，了解项目规矩
2. 读对应事实源（见下方表格）
3. 读任务单（`~/Desktop/agent-tasks/` 下对应文件）
4. 确认范围后开始执行

---

## 📋 快速导航

| 文件 | 说明 | 谁必须读 |
|:---|:---|:---|
| `docs/PROJECT.md` | 项目总控：角色、规则、文件地图 | **所有 Agent** |
| `docs/PRD.md` | 产品事实源：功能、流程、验收标准 | Hermes + 功能开发 Agent |
| `docs/DESIGN.md` | UI 治理：设计护栏、Token、防漂移 | 前端/设计 Agent |
| `docs/ARCHITECTURE.md` | 技术事实源：API、数据库、权限 | 后端/全栈 Agent |
| `docs/STATUS.md` | 当前状态：任务、阻塞、风险 | **所有 Agent**（快速了解全貌） |
| `codebase/.hermes.md` | 前端编码规范：Token 合规 | 前端 Agent（**必须读**） |
| `V4.7_Design_System_Final.md` | 完整 Design System 详细版 | 设计/前端 Agent |
| `project-center/` | AI EM 管理中心（已有） | Hermes |
| `~/Desktop/agent-tasks/TASK_BOARD.md` | 全局任务看板 | Hermes |
| `~/Desktop/agent-tasks/TASK_TEMPLATE.md` | 任务单标准格式 | Hermes（写任务用） |

---

## 🧠 OpenViking 共享记忆（所有 Agent 必须使用）

> **OpenViking 是团队共享记忆层。** Hermes 将品牌规范、协作铁律、项目决策放入共享区，Codex/Trae/Qoder 通过 curl 读取。Hermes 的私有记忆对其他 Agent 不可见。
>
> 端点：`http://localhost:1933` | 认证：dev 模式无需 API Key

### ⚠️ 搜索范围限制

**其他 Agent 搜索时必须限定 `target_uri`，禁止全局搜索：**

```bash
# ✅ 正确：限定在共享区搜索
curl -s -X POST http://localhost:1933/api/v1/search/search \
  -H "Content-Type: application/json" \
  -d '{"query":"<关键词>","limit":5,"target_uri":"viking://resources/shared"}'

# ❌ 错误：全局搜索会看到 Hermes 私有记忆，绝对禁止
```

### 共享文件（可直接读）

```bash
# 品牌规范（品牌色、Token、字体、圆角）
curl -s "http://localhost:1933/api/v1/content/read?uri=viking://resources/shared/brand.md/brand.md&raw=true"

# Agent 协作铁律（行为红线、职责边界、流程）
curl -s "http://localhost:1933/api/v1/content/read?uri=viking://resources/shared/rules.md/rules.md&raw=true"

# 项目总览（技术栈、端口、事实源文件位置）
curl -s "http://localhost:1933/api/v1/content/read?uri=viking://resources/shared/project.md/project.md&raw=true"
```

### 完整查询流程

```bash
# 1. 检查服务在线
curl -s http://localhost:1933/api/v1/system/status

# 2. 在共享区内搜索
curl -s -X POST http://localhost:1933/api/v1/search/search \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"<你的任务关键词>\",\"limit\":5,\"target_uri\":\"viking://resources/shared\"}"

# 3. 从搜索结果中取 uri，直接读
curl -s "http://localhost:1933/api/v1/content/read?uri=<uri>&raw=true"

# 4. 浏览共享区全部内容
curl -s "http://localhost:1933/api/v1/fs/tree?uri=viking://resources/shared"
```

---

## 🔴 Agent 行为红线

### 所有 Agent 禁止：

- ❌ 修改 main 分支（当前无 Git，等同直接修改源码）
- ❌ 擅自大规模重构
- ❌ 擅自升级核心依赖
- ❌ 擅自更换 UI 组件库
- ❌ 擅自删除业务功能
- ❌ 擅自修改数据库结构
- ❌ 擅自修改权限系统
- ❌ 擅自改变路由结构
- ❌ 擅自重写设计（L3 级变更）
- ❌ 擅自删除测试
- ❌ 使用假数据伪装功能完成
- ❌ 隐瞒测试失败
- ❌ 隐瞒未完成功能
- ❌ 修改任务单范围外的文件
- ❌ 提交密钥/Token/密码
- ❌ 修改生产环境（只允许改本地）

### 修改范围规则

任务单中必须写明：
- ✅ 允许修改文件
- ❌ 禁止修改文件
- ➕ 允许新增文件
- 📦 是否允许新增依赖
- 🗄️ 是否允许改数据库
- 🔌 是否允许改接口
- 🎨 是否允许改设计
- ♻️ 是否允许重构
- 📏 最大预计修改文件数

**超出范围必须停止并报告 Hermes。**

---

## 👥 Agent 职责边界

| Agent | 能做 | 绝不能做 |
|:---|:---|:---|
| **Hermes** | 分析→规划→分配→审查→文档 | 不默认承担编码（特殊情况记录决策） |
| **Codex** | 架构/后端/数据库/API/复杂逻辑/多文件重构 | 不碰 UI/UX/视觉 |
| **Qoder** | 功能开发/页面实现/CRUD/Bug修复/前后端联调 | 不碰视觉设计/动效/全局主题 |
| **Trae IDE** | 页面实现/组件开发/样式落地/Design Token 化 | 不碰功能逻辑/API/数据库 |
| **Trae Work** | 设计/交互/Design System/视觉方案 | 不写代码 |
| **Lovable / v0** | UI/UX/页面设计/Design System 产出 | 不写业务逻辑/不改数据库 |

---

## 📖 按任务类型读取事实源

### UI/UX 任务

```
必读：PROJECT.md + PRD.md 对应章节 + DESIGN.md + ARCHITECTURE.md 对应接口 + STATUS.md
参考：V4.7_Design_System_Final.md + codebase/.hermes.md
```

### 前端任务

```
必读：PROJECT.md + PRD.md 对应功能 + DESIGN.md 对应规范 + ARCHITECTURE.md 对应 API + STATUS.md
必须：codebase/.hermes.md（Token 合规）
```

### 后端任务

```
必读：PROJECT.md + PRD.md 对应业务规则 + ARCHITECTURE.md + STATUS.md
```

### Bug 修复

```
必读：PROJECT.md + Bug描述 + 涉及代码 + 对应事实源章节 + STATUS.md
```

---

## 🎨 品牌速查

| 项目 | 值 |
|:---|:---|
| 品牌主色 | `#5B4FD6`（沉稳紫） |
| **禁止使用** | `#6E59F5`、`#7c3aed` |
| 字体 | PingFang SC |
| Token 前缀 | `--yl-*`（演立方） |
| 圆角 | 4px/8px/12px/24px |

---

## ✅ 提交前自检（所有 Agent 必须）

- [ ] `npx tsc --noEmit` 零错误
- [ ] 验收标准逐条对照通过
- [ ] 浏览器验证关键页面可正常加载
- [ ] 全局搜索无残留问题关键词（旧品牌色/旧术语/旧文案）
- [ ] 未修改任务范围外的内容
- [ ] 不硬编码颜色、字号、间距（必须用 Token）

---

> **本文件是根目录 AGENTS.md，优先级高于 codebase/AGENTS.md（后者仅含 Lovable 警告）。**
>
> 迁移来源：整合自 `project-center/AGENTS.md`（原文件保留）
