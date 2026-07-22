---
memory_id: YLF-PRODUCT-001
title: 演立方当前产品基线摘要
knowledge_type: product_memory
status: Approved
scope: product
source_type: approved_prd
source_paths: docs/PRD.md,docs/PRD_V7.2.md,versions.json
source_version: V7.2
effective_from: 2026-07-15
approved_by: project_owner
tags: project=yanlifang,status=approved,type=product,prd=V7.2
---

# 演立方当前产品基线摘要

当前正式生效 PRD 是 V7.2，入口为 `docs/PRD.md`，完整文件为 `docs/PRD_V7.2.md`。历史 PRD 只用于追溯。

平台主体与 Tenant 必须分离：Hao Works / 演立方团队是平台运营方；后仰喜剧和未来演出公司是普通 Tenant。平台管理入驻和平台级配置，Tenant 管理自己的机会、演员合作、内容、规则和经营数据。

演员底层统一为平台演员身份。演员可以与一个或多个 Tenant 建立有生效期的合作关系；独立演员同时使用裁剪版独立演员 Tenant。不得继续把演员永久绑定到单一供应商。

评价与信誉需要支持项目、Tenant、演员等主体的分层归因、证据、复核/申诉、置信度和可解释的推荐记录。高级算法推荐属于后续平台能力，MVP 只建设可用的数据地基，不得把 Mock 排序冒充正式推荐。

产品业务 Agent 的 MVP 形态仍是一个主 Agent + 确定性工具；报价必须由确定性规则计算。

任何新 PRD 只能先生成版本升级影响报告，经项目负责人确认正式切换后，才能替代本基线或触发大规模代码修改。

<!-- SOURCE_VALIDATION
{
  "synced_at": "2026-07-22T08:04:56.225Z",
  "git_head": "ce62cdd84165f81a8aa97205ae74e5f47c1f0b2d",
  "git_branch": "feat/workspace-version-governance",
  "source_hashes": {
    "docs/PRD.md": "497458e0312e04c17d21354f06f344a350fa42f687f99c0d6e0af04a9397bea3",
    "docs/PRD_V7.2.md": "32f851784e9ad688dfcfa39e1c51ab266da451ebe306fff61f315387a337645c",
    "versions.json": "53c0cbd5c2f593c06b90ea6ce48ef569402f600e7b7f049b8d0c969b592b3dbb"
  }
}
-->
