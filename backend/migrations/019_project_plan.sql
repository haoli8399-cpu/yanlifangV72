-- ============================================================================
-- 迁移 019：ActivityProject + PlanVersion + ChangeRequest
-- PRD V7.2 §20.3, §20.4: ActivityProject 状态机, PlanVersion/PlanItem
-- PRD §14.12: ChangeRequest 变更流程
-- ============================================================================

-- ActivityProject: 正式活动协作空间
-- PRD §20.3: briefing → planning → decision_pending → quote_pending → commercial_confirmation → funding_and_preparation → confirmed → executing → completed/cancelled/disputed
CREATE TABLE IF NOT EXISTS activity_projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id           UUID NOT NULL REFERENCES v72_demands(id),
    msa_id              UUID NOT NULL REFERENCES main_service_assignments(id),
    main_tenant_id      UUID NOT NULL,
    display_code        VARCHAR(50) NOT NULL,
    title               VARCHAR(300),
    lifecycle_status    VARCHAR(30) NOT NULL DEFAULT 'briefing'
                        CHECK (lifecycle_status IN ('briefing','planning','decision_pending','quote_pending','commercial_confirmation','funding_and_preparation','confirmed','executing','completed','cancelled','disputed')),
    customer_notes      TEXT,
    tenant_notes        TEXT,
    row_version         INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ap_demand ON activity_projects(demand_id);
CREATE INDEX IF NOT EXISTS idx_ap_msa ON activity_projects(msa_id);
CREATE INDEX IF NOT EXISTS idx_ap_tenant ON activity_projects(main_tenant_id);
CREATE INDEX IF NOT EXISTS idx_ap_status ON activity_projects(lifecycle_status);

-- PlanVersion: 项目方案版本
-- PRD §6.4: 保存所选 ServiceOfferingVersion 快照，聚合 PlanItem
CREATE TABLE IF NOT EXISTS plan_versions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES activity_projects(id) ON DELETE CASCADE,
    version_number      INT NOT NULL,
    title               VARCHAR(300),
    overall_goal        TEXT,
    offering_snapshot   JSONB DEFAULT '{}'::JSONB,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','pending_review','approved','superseded','rejected')),
    plan_items          JSONB DEFAULT '[]'::JSONB,
    row_version         INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_pv_project ON plan_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_pv_status ON plan_versions(status);

-- ChangeRequest: 影响报价、凭证、承诺或履约的变化记录
-- PRD §14.12: 影响价格、合作凭证、付款、演员、权利或执行内容的变化必须创建 ChangeRequest
CREATE TABLE IF NOT EXISTS change_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES activity_projects(id) ON DELETE CASCADE,
    title               VARCHAR(300) NOT NULL,
    reason              TEXT NOT NULL,
    affected_objects    JSONB DEFAULT '[]'::JSONB,
    impact_summary      TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','pending_approval','approved','rejected','superseded','closed')),
    requested_by        UUID,
    approved_by         UUID,
    approved_at         TIMESTAMPTZ,
    row_version         INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cr_project ON change_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_cr_status ON change_requests(status);
