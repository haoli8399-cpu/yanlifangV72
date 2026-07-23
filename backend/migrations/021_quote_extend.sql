-- ============================================================================
-- 迁移 021：QuoteVersion 扩展 — 付款节点、变更规则
-- PRD V7.2 §14.2: 报价包含有效期、税费、包含项、排除项、付款节点、取消/退款/变更规则
-- ============================================================================

ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS tax_amount VARCHAR(50);
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'CNY';
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS payment_terms JSONB DEFAULT '[]'::JSONB;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS cancellation_rules JSONB DEFAULT '{}'::JSONB;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS refund_rules JSONB DEFAULT '{}'::JSONB;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS change_rules JSONB DEFAULT '{}'::JSONB;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS accepted_by UUID;
ALTER TABLE quote_versions ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
