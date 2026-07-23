-- ============================================================================
-- 迁移 018：TenantEngagement + RoutingDecision
-- PRD V7.2 §20.2, §13.4-13.5: 需求路由与 Tenant 承接
-- ============================================================================

-- TenantEngagement: Tenant 对 Demand 的服务承接关系
-- PRD §20.2: candidate → awaiting_response → accepted → clarifying → planning → quoting → selected/not_selected/declined/expired
-- PRD §13.5: accepted != 接受主服务整体责任
CREATE TABLE IF NOT EXISTS tenant_engagements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id           UUID NOT NULL REFERENCES v72_demands(id) ON DELETE CASCADE,
    tenant_id           UUID NOT NULL,
    engagement_type     VARCHAR(30) NOT NULL DEFAULT 'main_service'
                        CHECK (engagement_type IN ('main_service', 'module_collaboration')),
    lifecycle_status    VARCHAR(30) NOT NULL DEFAULT 'candidate'
                        CHECK (lifecycle_status IN ('candidate','awaiting_response','accepted','clarifying','planning','quoting','selected','not_selected','declined','expired')),
    response_deadline   TIMESTAMPTZ,
    responded_at        TIMESTAMPTZ,
    response_notes      TEXT,
    row_version         INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eng_demand ON tenant_engagements(demand_id);
CREATE INDEX IF NOT EXISTS idx_eng_tenant ON tenant_engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_eng_status ON tenant_engagements(lifecycle_status);

-- RoutingDecision: 一次路由决定的完整记录
-- PRD §13.8: 每次路由保存客户授权、来源、候选、硬条件、排除原因、推荐因素、规则版本、客户选择、最终归属和改派记录
CREATE TABLE IF NOT EXISTS routing_decisions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id           UUID NOT NULL REFERENCES v72_demands(id) ON DELETE CASCADE,
    rule_version        VARCHAR(50) NOT NULL DEFAULT 'v1',
    customer_authorized BOOLEAN NOT NULL DEFAULT FALSE,
    source_description  VARCHAR(500),
    candidates          JSONB DEFAULT '[]'::JSONB,
    excluded_reasons    JSONB DEFAULT '{}'::JSONB,
    customer_selection  JSONB DEFAULT '{}'::JSONB,
    final_tenant_id     UUID,
    reassignment_log    JSONB DEFAULT '[]'::JSONB,
    manual_intervention JSONB DEFAULT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_routing_demand ON routing_decisions(demand_id);
CREATE INDEX IF NOT EXISTS idx_routing_final ON routing_decisions(final_tenant_id);

-- clarification_requests: Tenant 对 Demand Brief 的澄清请求
CREATE TABLE IF NOT EXISTS clarification_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id           UUID NOT NULL REFERENCES v72_demands(id) ON DELETE CASCADE,
    tenant_id           UUID NOT NULL,
    brief_item_key      VARCHAR(100) NOT NULL,
    reason              TEXT NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'requested'
                        CHECK (status IN ('requested','answered','closed')),
    response            TEXT,
    responded_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clar_demand ON clarification_requests(demand_id);
CREATE INDEX IF NOT EXISTS idx_clar_tenant ON clarification_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clar_status ON clarification_requests(status);

-- tenant_brief_access_grants: Tenant 查看 Brief 的授权记录
-- PRD §13.5: 默认只向一家候选共享完整 Brief
CREATE TABLE IF NOT EXISTS tenant_brief_access_grants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id           UUID NOT NULL REFERENCES v72_demands(id) ON DELETE CASCADE,
    tenant_id           UUID NOT NULL,
    engagement_id       UUID REFERENCES tenant_engagements(id) ON DELETE CASCADE,
    brief_access_scope  VARCHAR(30) NOT NULL DEFAULT 'full'
                        CHECK (brief_access_scope IN ('full','minimal')),
    status              VARCHAR(30) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','revoked','expired')),
    granted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_brief_grant_demand ON tenant_brief_access_grants(demand_id);
CREATE INDEX IF NOT EXISTS idx_brief_grant_tenant ON tenant_brief_access_grants(tenant_id);
