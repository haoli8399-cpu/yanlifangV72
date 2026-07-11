# 演立方 V4.7 — 项目总控文件

> **这是项目的最高事实源。所有 Agent 和协作者必须先读本文件。**
>
> 版本：V4.7 | 初始化：2026-07-11 | 产品负责人：豪哥 | 工程负责人：Hermes

---

## 1. 项目基本信息

| 维度 | 内容 |
|:---|:---|
| 项目名称 | 演立方（YANLI / YLF） |
| 一句话定位 | AI提案获客与内容供应链平台 |
| 目标用户 | 活动公司/演出供应商/企业客户 |
| 核心价值 | 用AI将客户需求自动转化为可视化方案，连接供需两端 |
| 当前版本 | V4.7 |
| 当前开发阶段 | **Phase 1（后端整合）** — 本地快速开发期 |
| 当前稳定 Commit | ⚠️ 尚无（Git 待初始化） |
| 当前稳定分支 | ⚠️ 尚无 |
| 当前运行状态 | 🟡 代码已交付，待编译验证 |
| 当前部署状态 | 🟡 后端待部署，前端待部署 |
| 工作空间 | `/Users/wudixingyunxingleo/projects/演立方/` |

---

## 2. 项目角色分工

### 项目所有者（豪哥）

**负责：**
- 商业方向决策
- 产品优先级排序
- 最终方案确认
- 最终验收签字

**不负责：**
- 技术实现细节
- Agent 调度执行
- 代码复核

---

### Hermes（AI EM / 产品总监 / 技术总监）

**负责：**
- 项目总控与状态追踪
- 产品理解与 PRD 维护
- 任务拆解与分配
- Agent 选择与调度
- 风险评估与控制
- 五份核心事实源维护
- 代码复核（三层复核）
- 版本冻结与发布管理
- UI 设计治理
- 文档一致性检查

**不负责：**
- 直接编写业务代码（特殊情况下可执行，但需记录决策）

---

### Lovable / v0 / 设计型 Agent

**负责：**
- UI/UX 视觉设计
- 页面结构与布局
- 交互体验设计
- 前端表现层
- Design System 落地

**不得：**
- 修改核心业务规则
- 修改数据库结构
- 擅自改变 API 接口
- 删除业务功能
- 重新定义产品定位

---

### Codex / Qoder / Trae IDE / 开发型 Agent

**负责：**
- 按任务单编写代码
- 修复指定 Bug
- 接口联调
- 补充测试
- 执行明确指定的重构
- 完成标准任务单上列明的所有项

**不得：**
- 擅自改变产品逻辑
- 擅自重做 UI（L3 级变更）
- 擅自修改架构
- 扩大任务范围
- 未经允许更换技术栈
- 未经允许引入大型依赖
- 未经允许修改生产数据库
- 未经允许删除旧功能
- 修改任务单范围外的文件

---

## 3. 项目文件地图

```
/Users/wudixingyunxingleo/projects/演立方/
├── codebase/                     # 【PC前端主力】TanStack Start + React 19
│   ├── src/routes/               # 52 条路由
│   ├── src/shared/               # 共用组件 + Mock数据 + Design Token
│   ├── src/styles.css            # 全局样式 + Tailwind Theme
│   ├── .hermes.md                # 前端编码规范（Token合规）
│   └── package.json              # 依赖与脚本
│
├── backend/                      # 【后端API】Fastify 5 + PostgreSQL 15
│   ├── src/api/                  # 31 组 API 路由
│   ├── src/types/                # TypeScript 类型定义
│   ├── migrations/               # 9 个 SQL 迁移文件
│   └── package.json              # 依赖与脚本
│
├── miniprogram/                  # 【小程序】uni-app + Vue 3
│   └── dist/                     # 微信小程序构建产物
│
├── project-center/               # 【AI EM 工程管理中心】（已有）
│   ├── PROJECT_CONTROL.md        # 项目控制文件
│   ├── PROJECT_STATUS.md         # 项目状态（旧版）
│   ├── ARCHITECTURE.md           # 架构全景
│   ├── AGENTS.md                 # Agent 行为规范
│   ├── ROUTE_MAP.md              # 路由地图
│   ├── COMPONENT_MAP.md          # 组件地图
│   └── QUICK_START.md            # 快速入门
│
├── docs/                         # 【工程管理体系】（新建）
│   ├── PROJECT.md                # ← 本文件
│   ├── PRD.md                    # 产品事实源
│   ├── DESIGN.md                 # UI/UX 设计治理
│   ├── ARCHITECTURE.md           # 技术事实源
│   ├── STATUS.md                 # 项目状态
│   ├── TASK_TEMPLATE.md          # 标准任务模板
│   ├── REVIEW_CHECKLIST.md       # 代码复核清单
│   ├── RELEASE_CHECKLIST.md      # 版本发布清单
│   ├── DECISION_LOG.md           # 重大决策记录
│   └── archives/                 # 已废弃/迁移的旧文档
│
├── agent-prompts/                # Agent Prompt 模板库
├── AGENTS.md                     # 【根目录】所有 Agent 的统一入口
├── project-state.json            # 机器可读状态文件
├── V4.7_Design_System_Final.md   # 设计系统定版
├── 演立方_V4.7_PRD_*.docx        # 产品需求文档（二进制）
└── V4.6_PRD_修订建议.md          # PRD 修订记录
```

### 关键脚本路径

| 用途 | 路径 |
|:---|:---|
| 前端开发 | `cd codebase && npm run dev` |
| 前端构建 | `cd codebase && npm run build` |
| 前端 Lint | `cd codebase && npm run lint` |
| Type Check | `cd codebase && npx tsc --noEmit` |
| 后端开发 | `cd backend && npm run dev` |
| 后端类型检查 | `cd backend && npm run typecheck` |
| 视觉审计 | `cd codebase && npm run visual` |

---

## 4. 项目最高规则

### 4.1 事实源规则

1. **所有 Agent 开发前必须读取事实源** — PROJECT.md + 对应章节
2. **五份核心事实源是唯一权威** — 聊天记录不是事实源
3. **文档先于代码** — 核心业务规则变更必须先更新 PRD

### 4.2 开发规则

4. **所有任务必须有验收标准** — 不接受模糊描述
5. **所有高风险改动前必须建立恢复点** — Git commit 或分支
6. **UI 设计权和代码开发权分离** — 开发 Agent 不得自由设计 L3 级 UI
7. **数据库变更必须有迁移 + 回滚** — 不得直接 ALTER TABLE
8. **禁止直接修改生产环境** — 必须通过 Preview → 确认 → Production
9. **禁止 Agent 无边界重构** — 修改范围必须在任务单中明确
10. **禁止 Agent 隐瞒测试失败** — 诚实报告所有问题

### 4.3 安全规则

11. **禁止在代码/文档/日志中存储密钥** — Token、密码一律走环境变量
12. **禁止将 .env 文件提交到仓库** — .gitignore 必须包含
13. **敏感信息不得出现在 commit message 中**

---

## 5. 当前工程阶段

**🟢 阶段 A：本地快速开发**

理由：
- Git 尚未初始化（最优先事项）
- 零自动化测试
- 零 CI/CD
- 后端未部署
- 前端未编译验证
- 多 Agent 尚在串行交付

升级触发条件（阶段 A → B）：
- [ ] Git 已初始化并持续使用 ≥ 2 周
- [ ] 核心功能已可编译运行
- [ ] 至少有一组核心流程测试
- [ ] GitHub 远程仓库已建立
- [ ] 稳定版本号 ≥ v0.1.0

**不要急于进入阶段 B/C/D。当前阶段先做好版本控制和代码可运行性。**

---

## 6. Hermes 关键词命令体系

| 命令 | 功能 |
|:---|:---|
| `/项目总控` | 读取全部事实源，输出项目健康度报告 |
| `/创建任务` | 读取需求→评估影响→生成标准任务单→选择 Agent |
| `/执行任务` | 检查状态→创建分支→分配 Agent→监督执行 |
| `/开发复核` | 三层复核→输出 Pass/Fail→Fail 生成返工报告 |
| `/UI冻结` | 确认 UI 基线→保存截图→更新 DESIGN.md |
| `/版本冻结` | 完整测试→创建 Tag→保存稳定 Commit |
| `/版本发布` | Preview→冒烟→确认→Production |
| `/项目交接` | 汇总定位/版本/架构/问题→输出 Handoff |
| `/设计任务` | 判断 L1/L2/L3→分配对应 Agent |
| `/风险检查` | 检查未提交代码/敏感信息/数据库/依赖/UI漂移/文档过期 |

---

> **迁移来源：** 整合自 `project-center/PROJECT_CONTROL.md`（v2026-07-10）  
> **原文件保留：** `project-center/PROJECT_CONTROL.md` 继续作为 AI EM 快速参考  
> **本文件优先级：** 高于 project-center 中的同名信息
