-- ============================================================================
-- 迁移 017：FulfillmentCollaboration + Internal/CollabQuote/Payable
-- PRD V7.2 §13.13 §14.14-16
-- ============================================================================

CREATE TABLE IF NOT EXISTS fulfillment_collaborations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    inviting_tenant_id UUID NOT NULL,
    invited_party_type VARCHAR(30) NOT NULL,
    invited_party_id VARCHAR(100) NOT NULL,
    purpose         VARCHAR(30) NOT NULL DEFAULT 'feasibility_check',
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    shared_brief_scope JSONB DEFAULT '{}'::JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fc_project ON fulfillment_collaborations(project_id);

CREATE TABLE IF NOT EXISTS collaboration_quote_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES fulfillment_collaborations(id),
    version_number  INT NOT NULL,
    scope           TEXT,
    amount          VARCHAR(50),
    conditions      JSONB DEFAULT '{}'::JSONB,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cqv_collab ON collaboration_quote_versions(collaboration_id);

CREATE TABLE IF NOT EXISTS internal_fulfillment_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES fulfillment_collaborations(id),
    plan_item_ids   JSONB DEFAULT '[]'::JSONB,
    terms           JSONB DEFAULT '{}'::JSONB,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ifc_collab ON internal_fulfillment_credentials(collaboration_id);

CREATE TABLE IF NOT EXISTS collaboration_payables (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES fulfillment_collaborations(id),
    amount          VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'planned',
    payer_declaration JSONB DEFAULT '{}'::JSONB,
    payee_declaration JSONB DEFAULT '{}'::JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cp_collab ON collaboration_payables(collaboration_id);

COMMENT ON TABLE fulfillment_collaborations IS 'V7.2 FulfillmentCollaboration — feasibility_check/confirmed_fulfillment';
COMMENT ON TABLE collaboration_quote_versions IS 'V7.2 CollaborationQuoteVersion — 协作方内部报价，对客户隔离';
COMMENT ON TABLE internal_fulfillment_credentials IS 'V7.2 InternalFulfillmentCredential — scope=internal_fulfillment强制';
COMMENT ON TABLE collaboration_payables IS 'V7.2 CollaborationPayable — satisfied由PaymentReconciliation派生';
