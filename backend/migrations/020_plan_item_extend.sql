-- ============================================================================
-- 迁移 020：PlanItem 扩展列 + 约束完善
-- PRD V7.2 §6.4 §20.4: PlanItem 需关联 PlanVersion 和名称
-- ============================================================================

-- 扩展 plan_items 表
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS plan_version_id UUID REFERENCES plan_versions(id) ON DELETE CASCADE;
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS target_duration_minutes INT;
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS sequence_order INT NOT NULL DEFAULT 0;
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS row_version INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_pl_plan_version ON plan_items(plan_version_id);
