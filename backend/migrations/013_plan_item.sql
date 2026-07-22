-- ============================================================================
-- 迁移 013：PlanItem — 项目最小独立责任颗粒（四维并行子状态）
-- PRD V7.2 §6.4 §20.4: 保存交付快照，不因模板修改回写历史项目
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    source_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
    responsible_party_id VARCHAR(100) NOT NULL,
    responsible_party_type VARCHAR(30) NOT NULL,
    resource_status VARCHAR(30) NOT NULL DEFAULT 'proposed',
    schedule_status VARCHAR(30) NOT NULL DEFAULT 'unknown',
    commercial_status VARCHAR(30) NOT NULL DEFAULT 'not_requested',
    fulfillment_status VARCHAR(30) NOT NULL DEFAULT 'planned',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pl_project ON plan_items(project_id);
CREATE INDEX IF NOT EXISTS idx_pl_responsible ON plan_items(responsible_party_id);
CREATE INDEX IF NOT EXISTS idx_pl_resource ON plan_items(resource_status);
CREATE INDEX IF NOT EXISTS idx_pl_schedule ON plan_items(schedule_status);

COMMENT ON TABLE plan_items IS 'V7.2 PlanItem — 项目交付快照，不可回写供给模板';
COMMENT ON COLUMN plan_items.source_snapshot IS '不可变引用: {root_type, root_id, version_id} 快照';
COMMENT ON COLUMN plan_items.resource_status IS '四维之一: proposed/checking/confirmed_available/held/locked/released/replaced/conflicted';
COMMENT ON COLUMN plan_items.schedule_status IS '四维之一: unknown/requested/available/conditional/unavailable/held/confirmed/expired';
COMMENT ON COLUMN plan_items.commercial_status IS '四维之一: not_requested/internal_quoting/cost_confirmed/included_in_customer_quote/changed/disputed';
COMMENT ON COLUMN plan_items.fulfillment_status IS '四维之一: planned/preparing/ready/performing/fulfilled/accepted/issue_open/remediating/cancelled/disputed';
