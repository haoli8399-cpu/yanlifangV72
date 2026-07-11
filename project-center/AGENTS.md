# 演立方 V4.7 — Agent 行为规范

> 任何 Agent 打开此项目自动加载
>
> ⚠️ **2026-07-11 迁移通知：** Agent 统一入口已升级为根目录 `AGENTS.md`。  
> 本文件继续保留作为详细参考。新入口详见：[AGENTS.md](../AGENTS.md)

---

## 项目工作空间

```
/Users/wudixingyunxingleo/projects/演立方/
```

## Agent 团队

你加入的演立方 V4.7 工程团队：
- **Hermes**（AI EM / 产品总监 / 技术总监）— 分析→规划→分配→审查。**不写代码。**
- **Codex**（架构师）— 后端/数据库/API设计/复杂逻辑
- **Qoder**（功能开发）— 页面/功能/CRUD/Bug修复
- **Trae IDE**（前端实现）— 页面/组件/样式
- **Trae Work**（产品设计）— 设计/交互/Design System

## Agent 分配铁律

| Agent | 能做 | 绝不能做 |
|:---|:---|:---|
| **Codex** | 架构/后端/DB/复杂逻辑 | UIUX/视觉 |
| **Qoder** | 功能开发/页面/API/Bug修复 | UIUX/视觉/动效 |
| **Trae IDE** | 页面/组件/样式 | 功能逻辑/API |
| **Trae Work** | 设计/交互/Design System | 写代码 |
| **Hermes** | 分析→建议→审核→分配 | 写代码 |

## 关键红线

1. **用户没让动代码坚决不能动**
2. **必须先查 project-center/ 确认项目状态**
3. **方案必须经 Hermes/豪哥 确认才能执行**
4. **PRD V4.7 是唯一功能事实源**
5. **V4.7_Design_System_Final.md 是唯一视觉事实源**
6. **品牌主色 #5B4FD6，禁止使用旧品牌色 #7c3aed 或 #6E59F5**
7. **禁止硬编码颜色，必须使用 CSS 变量或 Design Token**

## 任务启动流程（每个 Agent 必须遵守）

### 第一步：读项目中心

```
读 project-center/QUICK_START.md    ← 产品/技术栈/Token/规范
读 project-center/ROUTE_MAP.md      ← 哪些路由能改、哪些不能碰
读 project-center/COMPONENT_MAP.md  ← 哪些组件已有，直接用
```

### 第二步：领任务

```
读 ~/Desktop/agent-tasks/TASK_BOARD.md     ← 看全局任务状态
读 ~/Desktop/agent-tasks/{Agent名}-TASK-*.md  ← 你自己的任务文件
```

### 第三步：执行 → 报告

执行任务，完成后向 Hermes 报告交付清单。

## 项目关键文件

| 文件 | 说明 |
|:---|:---|
| `project-center/PROJECT_CONTROL.md` | 项目控制文件（必读） |
| `project-center/PROJECT_STATUS.md` | 当前项目状态 |
| `project-center/ARCHITECTURE.md` | 架构全景图 |
| `演立方_V4.7_PRD_*.docx` | 产品需求文档 |
| `V4.7_Design_System_Final.md` | 设计系统 |
| `V4.6_PRD_修订建议.md` | PRD 修订记录 |

## 项目状态速查

- **PC 前端：** `codebase/` — TanStack Start + React 19，48条路由
- **后端：** `backend/` — Fastify 5 + PostgreSQL 15，21组API，17张表
- **小程序：** `miniprogram/` — uni-app + Vue 3，28页
- **品牌色：** `#5B4FD6`
- **部署：** 腾讯云香港 119.28.134.67

## 工作规范

- 一任务一 Branch
- 完成更新 project-center/PROJECT_STATUS.md
- 后端类型错误禁止加 @ts-nocheck
- 所有 API 端点必须有 Zod Schema 校验
