-- ============================================================================
-- 迁移 007：经纪公司增强 — 艺人与公司归属关系
-- PRD V3.3.3 第 11.4 节
-- ============================================================================

ALTER TABLE performers
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN performers.company_id IS '经纪公司/供应商公司ID，用于 supplier-console 限定旗下艺人数据范围';

CREATE INDEX IF NOT EXISTS idx_performers_company_id ON performers(company_id);
CREATE INDEX IF NOT EXISTS idx_performers_company_status ON performers(company_id, status);
