# 演立方 V4.7 — 项目控制文件

> 版本：V4.7 | 更新：2026-07-10 | 产品负责人：豪哥 | AI EM：Hermes
>
> ⚠️ **2026-07-11 迁移通知：** 本文件的核心内容已升级迁移至 `docs/PROJECT.md`。  
> `docs/` 目录现在是工程管理体系的主目录。本文件继续保留作为快速参考/历史记录。  
> 新增工程管理体系详见：[docs/PROJECT.md](../docs/PROJECT.md)

---

## 一、项目范围

| 维度 | 定义 |
|:---|:---|
| 品牌名 | 演立方（英文 YANLI / 缩写 YLF） |
| 定位 | AI提案获客与内容供应链平台 |
| PRD | `演立方_V4.7_PRD_MVP落地与增长工具技术附件增强版.docx` |
| Design System | `V4.7_Design_System_Final.md` |
| 工作空间 | `/Users/wudixingyunxingleo/projects/演立方/` |

---

## 二、技术架构

```
演立方 V4.7
├── codebase/                  # Lovable 前端（主力）— TanStack Start + React 19 + AntD6 + Tailwind4
│   ├── src/routes/            # 48 条路由（agent/admin/supplier/m/tools/p）
│   ├── src/shared/             # 共用组件 + Mock数据 + Design Token
│   └── src/styles.css          # 全局样式（品牌色 #5B4FD6）
│
├── backend/                   # Fastify 5 + PostgreSQL 15 + Redis（从旧项目迁移）
│   ├── src/api/               # 21 组 API 路由
│   ├── migrations/            # 7 个 SQL 迁移文件（17 张表）
│   └── nginx/                 # Nginx 部署配置
│
├── miniprogram/               # uni-app + Vue 3（从旧项目迁移，保留维护）
│   └── src/pages/             # 28 个页面 + 3 角色切换
│
├── project-center/            # AI EM 工程管理中心
│   ├── PROJECT_CONTROL.md     # ← 本文件
│   ├── AGENTS.md              # Agent 行为规范
│   ├── PROJECT_STATUS.md      # 项目状态
│   ├── ARCHITECTURE.md        # 架构全景图
│   └── AGENT_TASKS.md         # Agent 任务分配表
│
├── agent-prompts/             # Agent 任务 Prompt 模板
├── docs/                      # 旧项目治理文档（参考）
└── V4.7_Design_System_Final.md # V4.7 设计系统最终版
```

---

## 三、子系统清单

| 子系统 | 技术栈 | 路径 | 状态 |
|:---|:---|:---|:---:|
| PC 前端 | TanStack Start + React 19 + AntD6 + Tailwind4 | `codebase/` | 🟢 开发中 |
| 增长工具 H5 | React（codebase 内） | `codebase/src/routes/tools/` | 🟢 刚交付 |
| 客户方案 H5 | React（codebase 内） | `codebase/src/routes/p/` | 🟢 刚交付 |
| 后端 API | Fastify 5 + Zod + PostgreSQL 15 + Redis | `backend/` | 🟡 待部署 |
| 小程序 | uni-app + Vue 3 + Vant Weapp | `miniprogram/` | 🟢 已完成 |
| Design System | CSS Variables + Tailwind + AntD Theme | `codebase/src/shared/` | 🟢 刚注入 |
| 部署 | 腾讯云香港 119.28.134.67 | Nginx + Docker | 🟡 待部署 |

---

## 四、品牌标识

| 项目 | 值 |
|:---|:---|
| 品牌主色 | `#5B4FD6`（沉稳紫） |
| 字体 | PingFang SC |
| 圆角 | 8px（交互）/ 12px（容器）/ 24px（AI气泡） |
| 设计原则 | 专业、可信、智能、精准、从容 |

---

## 五、Agent 团队

| Agent | 角色 | 职责 |
|:---|:---|:---|
| **Hermes** | AI EM / 产品总监 / 技术总监 | 分析→规划→分配→审查 |
| **Codex** | 架构师 | 后端/数据库/API设计/复杂逻辑 |
| **Qoder** | 功能开发 | 页面/功能/CRUD/Bug修复 |
| **Trae IDE** | 前端实现 | 页面/组件/样式 |
| **Trae Work** | 产品设计 | 设计/交互/Design System |

---

## 六、当前开发阶段

**Phase 0（设计基础）** ✅ 完成
- Design Token 注入 → Agent A 已交付
- 增长工具 H5 页面 → Agent B 已交付
- 客户方案 H5 页面 → Agent C 已交付

**Phase 1（后端整合）** 🔄 进行中
- 旧项目后端迁移入工作空间 ✅ 已完成
- 新增 V4.7 数据库表（proposals/leads/tool_results等）
- 新增 V4.7 API 端点
- 部署验证

**Phase 2（功能开发）** 📋 待分配
- CRM 线索中心
- 提案中心最小集
- 方案编辑器简版

**Phase 3（履约层）** 📋 P2
- 小程序品牌色更新
- 供应链履约
