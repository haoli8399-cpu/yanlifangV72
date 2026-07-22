-- ============================================================================
-- 迁移 014：MainServiceAssignment + Eligibility + Capacity
-- PRD V7.2 §13.7-13.11: 双决定, 适格, 容量
-- ============================================================================

-- MainServiceEligibility
CREATE TABLE IF NOT EXISTS main_service_eligibility (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    city            VARCHAR(50) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    scale_max       INT,
    status          VARCHAR(30) NOT NULL DEFAULT 'not_assessed',
    conditional_reqs JSONB DEFAULT '[]'::JSONB,
    evidence        JSONB DEFAULT '{}'::JSONB,
    assessed_by     UUID REFERENCES users(id),
    assessed_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_elig_tenant ON main_service_eligibility(tenant_id);
CREATE INDEX IF NOT EXISTS idx_elig_status ON main_service_eligibility(status);

-- CapacityDeclaration
CREATE TABLE IF NOT EXISTS capacity_declarations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'manual_review',
    scope_notes     TEXT,
    declared_by     UUID REFERENCES users(id),
    effective_until TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cap_tenant ON capacity_declarations(tenant_id);

-- MainServiceAssignment (双决定轴)
CREATE TABLE IF NOT EXISTS main_service_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL,
    tenant_id       UUID NOT NULL,
    customer_decision VARCHAR(30) NOT NULL DEFAULT 'pending',
    tenant_decision   VARCHAR(30) NOT NULL DEFAULT 'pending',
    lifecycle_status  VARCHAR(30) NOT NULL DEFAULT 'proposed',
    eligibility_id    UUID REFERENCES main_service_eligibility(id),
    capacity_id       UUID REFERENCES capacity_declarations(id),
    activated_at    TIMESTAMPTZ,
    row_version     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msa_demand ON main_service_assignments(demand_id);
CREATE INDEX IF NOT EXISTS idx_msa_tenant ON main_service_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_msa_lifecycle ON main_service_assignments(lifecycle_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_msa_active ON main_service_assignments(demand_id) WHERE lifecycle_status = 'active';

COMMENT ON TABLE main_service_assignments IS 'V7.2 MainServiceAssignment — customer_decision/tenant_decision 独立双轴';
COMMENT ON COLUMN main_service_assignments.customer_decision IS 'pending/selected/rejected/withdrawn';
COMMENT ON COLUMN main_service_assignments.tenant_decision IS 'pending/accepted/declined/expired';
COMMENT ON COLUMN main_service_assignments.lifecycle_status IS 'proposed/pending_dual_confirmation/active/completed/expired/reassigned/terminated/disputed/closed_external';
COMMENT ON COLUMN main_service_eligibility.status IS 'not_assessed/pending_review/conditional/eligible/ineligible/suspended/expired';
COMMENT ON COLUMN capacity_declarations.status IS 'available/limited/unavailable/manual_review';
