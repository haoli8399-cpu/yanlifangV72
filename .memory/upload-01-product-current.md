---
memory_id: YLF-PRODUCT-001
title: 演立方当前产品基线摘要
knowledge_type: product_memory
status: Approved
scope: product
source_type: approved_prd
source_paths: docs/PRD.md,docs/PRD_V6.6.md,versions.json
source_version: V6.6
effective_from: 2026-07-15
approved_by: project_owner
tags: project=yanlifang,status=approved,type=product,prd=V6.6
---

# 演立方当前产品基线摘要

当前正式生效 PRD 是 V6.6，入口为 `docs/PRD.md`，完整文件为 `docs/PRD_V6.6.md`。历史 PRD 只用于追溯。

平台主体与 Tenant 必须分离：Hao Works / 演立方团队是平台运营方；后仰喜剧和未来演出公司是普通 Tenant。平台管理入驻和平台级配置，Tenant 管理自己的机会、演员合作、内容、规则和经营数据。

演员底层统一为平台演员身份。演员可以与一个或多个 Tenant 建立有生效期的合作关系；独立演员同时使用裁剪版独立演员 Tenant。不得继续把演员永久绑定到单一供应商。

评价与信誉需要支持项目、Tenant、演员等主体的分层归因、证据、复核/申诉、置信度和可解释的推荐记录。高级算法推荐属于后续平台能力，MVP 只建设可用的数据地基，不得把 Mock 排序冒充正式推荐。

产品业务 Agent 的 MVP 形态仍是一个主 Agent + 确定性工具；报价必须由确定性规则计算。

任何新 PRD 只能先生成版本升级影响报告，经项目负责人确认正式切换后，才能替代本基线或触发大规模代码修改。

<!-- SOURCE_VALIDATION
{
  "synced_at": "2026-07-15T14:43:34.503Z",
  "git_head": "78a659e762a8c144a56f07a497dff8d235b7bf1f",
  "git_branch": "feat/workspace-version-governance",
  "source_hashes": {
    "docs/PRD.md": "78e352e363a551ff73001f41f4e935d58b4ffdb1aa6cdf9334e5fda5a809426e",
    "docs/PRD_V6.6.md": "d998713242b1a85aa60183be9db6ba924562b219f16388add422f94fb14d7e06",
    "versions.json": "7c50bc2b3f54f54a34a8820126c548630ae1731f748991ecf4a96479f36707ef"
  }
}
-->
