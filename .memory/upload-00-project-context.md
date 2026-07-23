---
memory_id: YLF-CONTEXT-001
title: 演立方项目核心上下文
knowledge_type: project_context
status: Approved
scope: project
source_type: repository_authority
source_paths: README.md,PROJECT_STATUS.md,DECISIONS.md
source_version: V7.2
effective_from: 2026-07-15
approved_by: project_owner
tags: project=yanlifang,status=approved,type=context
---

# 演立方项目核心上下文

演立方是由 Hao Works / 演立方团队运营的独立多租户 AI 商演经营协作平台。后仰喜剧只是第一家普通 Tenant，不运营平台，也只能访问本 Tenant 数据。

当前阶段是 MVP 开发准备。产品规格基线为 V7.2，当前代码实现主要仍是 V4.7，不能把 PRD 完成度当作代码完成度。

项目负责人只描述业务需求并处理老板级决策。研发采用“总调度 → 开发执行 → 独立审查”的轻量三 Agent 体系，默认串行。

项目级底线：Tenant 隔离、客户内部数据隔离、演员跨 Tenant 私有数据隔离、AI 推断可识别、报价确定性、关键状态可审计、数据库可恢复、金额类工作独立审查。

原始事实源：`README.md`、`PROJECT_STATUS.md`、`DECISIONS.md`。本摘要仅用于发现和上下文恢复，不能覆盖原文件。

<!-- SOURCE_VALIDATION
{
  "synced_at": "2026-07-23T03:05:15.534Z",
  "git_head": "65e4feb70fb7e4e18260bf90e5620d0ac5df594e",
  "git_branch": "feat/workspace-version-governance",
  "source_hashes": {
    "README.md": "7a217a039f805a6082d71f55812467dec926391ec1dcc72ac8fc4ad1978587f2",
    "PROJECT_STATUS.md": "4e3cbdcedfd6f57c249e7c4376eb1284e14c021ba37d2f280cf0c61db06ad4b1",
    "DECISIONS.md": "25deb4df33c2d23a48378c2a06a9acdcc3994163ae7b790a8ec60d798526af5f"
  }
}
-->
