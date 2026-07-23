---
memory_id: YLF-TECH-001
title: 演立方当前技术与代码定位
knowledge_type: technical_memory
status: Approved
scope: engineering
source_type: as_built_repository
source_paths: docs/ARCHITECTURE.md,docs/MVP_CURRENT_AUDIT.md,codebase/package.json,backend/package.json,miniprogram/package.json
source_version: V4.7-as-built
effective_from: 2026-07-15
approved_by: project_owner
tags: project=yanlifang,status=approved,type=technical
---

# 演立方当前技术与代码定位

代码是模块化单仓：`codebase/` 为 React 19 + TanStack Start/Router PC/H5；`backend/` 为 Fastify 5 + TypeScript + PostgreSQL；`miniprogram/` 为 uni-app + Vue 3。

当前代码实现主要是 V4.7。PC/H5 有大量页面原型但多数业务页使用 Mock；后端真实数据库 API 与进程内 Mock 并存；小程序仍有 Mock/TODO。V7.2 的统一 Tenant 上下文、平台演员身份和多 Tenant 合作关系尚未进入核心 Schema/API。

当前已建立一组报价访问纯规则与 Fastify 路由级测试，覆盖三个报价 GET 接口，共 10 项；其他模块仍没有系统化单元、API 集成或 E2E 测试。后端类型与构建、前端构建、小程序构建可运行；前端仍有 2 个既存类型错误和较大的 Lint 基线。

架构判断必须同时检查已批准技术决策、`docs/ARCHITECTURE.md` 与当前代码。若文档和代码不一致，应报告差异，不得自动假设一方正确。

不得把完整源码复制进 OpenViking；本记忆只保存模块入口、验证方式和长期限制。

<!-- SOURCE_VALIDATION
{
  "synced_at": "2026-07-23T03:05:15.534Z",
  "git_head": "65e4feb70fb7e4e18260bf90e5620d0ac5df594e",
  "git_branch": "feat/workspace-version-governance",
  "source_hashes": {
    "docs/ARCHITECTURE.md": "d3d7074a0be5fe131766d662b2656677909d76c053e6ca34049f2c6506ceb396",
    "docs/MVP_CURRENT_AUDIT.md": "947bb03caf7aba3e30491871d518caca6549db49725e7c365e0a8f9c757ec174",
    "codebase/package.json": "3f6dba18e0db3bb64c681c6a082b01e46a4c584652de2ac728052fa358e4eb44",
    "backend/package.json": "a3c473e9634c3aa186606531e09d3cb7b42b67023157d79e2a78ea0173443ec0",
    "miniprogram/package.json": "a609c31aa8df364ef79bebe7ef3e4df4f1bfa784e7f5b6cc808aa412ba347b12"
  }
}
-->
