-- ============================================================================
-- 迁移 015：Quote / Credential / Payment — 客户商务闭环
-- PRD V7.2 §14: Quote ≠ Credential, payer_claim ≠ payee_receipt
-- ============================================================================

-- QuoteVersion
CREATE TABLE IF NOT EXISTS quote_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    tenant_id       UUID NOT NULL,
    version_number  INT NOT NULL,
    total_amount    VARCHAR(50) NOT NULL,
    valid_until     DATE,
    items           JSONB DEFAULT '[]'::JSONB,
    includes        JSONB DEFAULT '[]'::JSONB,
    excludes        JSONB DEFAULT '[]'::JSONB,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    row_version     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quote_project ON quote_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_quote_status ON quote_versions(status);

-- CollaborationCredential
CREATE TABLE IF NOT EXISTS collaboration_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    credential_type VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    evidence        JSONB DEFAULT '{}'::JSONB,
    row_version     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cred_project ON collaboration_credentials(project_id);

-- PaymentSchedule
CREATE TABLE IF NOT EXISTS payment_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    label           VARCHAR(100) NOT NULL,
    amount          VARCHAR(50) NOT NULL,
    due_date        DATE,
    status          VARCHAR(30) NOT NULL DEFAULT 'planned',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ps_project ON payment_schedules(project_id);

-- PaymentRecord (多来源声明)
CREATE TABLE IF NOT EXISTS payment_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id     UUID REFERENCES payment_schedules(id),
    statement_type  VARCHAR(30) NOT NULL,
    declared_by     VARCHAR(100) NOT NULL,
    amount          VARCHAR(50) NOT NULL,
    declared_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    evidence        JSONB DEFAULT '{}'::JSONB,
    status          VARCHAR(30) NOT NULL DEFAULT 'reported'
);
CREATE INDEX IF NOT EXISTS idx_pr_schedule ON payment_records(schedule_id);

-- PaymentReconciliation
CREATE TABLE IF NOT EXISTS payment_reconciliations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'unreconciled',
    matched_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rec_project ON payment_reconciliations(project_id);

COMMENT ON TABLE quote_versions IS 'V7.2 QuoteVersion — 报价接受仅表示商业意向，不等于合同成立';
COMMENT ON TABLE collaboration_credentials IS 'V7.2 CollaborationCredential — platform_e_contract/external_contract/framework_order/simplified_confirmation';
COMMENT ON TABLE payment_schedules IS 'V7.2 PaymentSchedule — planned/due/partially_satisfied/satisfied/overdue/disputed/refunded/written_off';
COMMENT ON TABLE payment_records IS 'V7.2 PaymentRecord — statement_type: payer_claim/payee_receipt/processor_callback/platform_verification';
COMMENT ON TABLE payment_reconciliations IS 'V7.2 PaymentReconciliation — 多来源独立声明对账';
