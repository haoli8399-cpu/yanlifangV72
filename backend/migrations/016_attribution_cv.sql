-- ============================================================================
-- 迁移 016：Attribution + ChargeableValue MVP
-- PRD V7.2 §17.4 §17.7: 归因 + 原子覆盖台账
-- ============================================================================

-- AttributionRecord
CREATE TABLE IF NOT EXISTS attribution_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL,
    project_id      UUID,
    source_type     VARCHAR(30) NOT NULL DEFAULT 'unclassified',
    source_tenant_id UUID,
    evidence        JSONB DEFAULT '{}'::JSONB,
    status          VARCHAR(30) NOT NULL DEFAULT 'unclassified',
    first_contact_at TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    released_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attr_demand ON attribution_records(demand_id);
CREATE INDEX IF NOT EXISTS idx_attr_status ON attribution_records(status);

-- ChargeableValue
CREATE TABLE IF NOT EXISTS chargeable_values (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    attribution_id  UUID REFERENCES attribution_records(id),
    chargeable_tenant_id UUID NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'CNY',
    net_revenue_atom_id VARCHAR(100),
    allocated_amount VARCHAR(50) NOT NULL,
    exclusions      JSONB DEFAULT '[]'::JSONB,
    refund_adjustment VARCHAR(50) DEFAULT '0',
    current_billable_amount VARCHAR(50) NOT NULL,
    parent_id       UUID REFERENCES chargeable_values(id),
    lineage         JSONB DEFAULT '[]'::JSONB,
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cv_project ON chargeable_values(project_id);
CREATE INDEX IF NOT EXISTS idx_cv_parent ON chargeable_values(parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_atom_active ON chargeable_values(net_revenue_atom_id) WHERE lifecycle_status = 'active' AND net_revenue_atom_id IS NOT NULL;

COMMENT ON TABLE attribution_records IS 'V7.2 AttributionRecord — self_owned/platform_sourced/disputed';
COMMENT ON TABLE chargeable_values IS 'V7.2 ChargeableValue — 同一净回款原子不得被两个active leaf覆盖';
COMMENT ON COLUMN chargeable_values.net_revenue_atom_id IS 'PaymentReconciliation中已对账回款的最小可分配原子ID';
