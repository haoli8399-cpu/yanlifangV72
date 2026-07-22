-- ============================================================================
-- 迁移 012：ServiceOffering / ServiceOfferingVersion — 可售服务产品
-- PRD V7.2 §6.4: 商业产品身份 + 不可变业务编号，版本含覆盖范围/责任/依赖/价格方式
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_offerings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_tenant_id UUID NOT NULL,
    immutable_code  VARCHAR(50) NOT NULL,
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_so_owner ON service_offerings(owner_tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_so_code ON service_offerings(immutable_code);

CREATE TABLE IF NOT EXISTS service_offering_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id     UUID NOT NULL REFERENCES service_offerings(id),
    version_number  INT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    coverage_type   VARCHAR(30) NOT NULL DEFAULT 'partial',
    responsibility_scope TEXT,
    included_pmv_ids JSONB DEFAULT '[]'::JSONB,
    dependencies     JSONB DEFAULT '[]'::JSONB,
    price_band      VARCHAR(100),
    combination_willingness VARCHAR(30) NOT NULL DEFAULT 'solo',
    readiness_level VARCHAR(30) NOT NULL DEFAULT 'draft',
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    publication_status VARCHAR(30) NOT NULL DEFAULT 'private',
    evidence_status VARCHAR(30) NOT NULL DEFAULT 'declared',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sov_offering ON service_offering_versions(offering_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sov_version ON service_offering_versions(offering_id, version_number);

COMMENT ON TABLE service_offerings IS 'V7.2 ServiceOffering — 可售服务产品稳定根身份';
COMMENT ON TABLE service_offering_versions IS 'V7.2 ServiceOfferingVersion — 不可原地改写';
COMMENT ON COLUMN service_offering_versions.coverage_type IS 'complete=完整承接, partial=模块提供';
COMMENT ON COLUMN service_offering_versions.combination_willingness IS 'solo=独立承接, invite-only=定向组合, open=开放组合';

-- 种子数据
INSERT INTO service_offerings (id, owner_tenant_id, immutable_code, lifecycle_status)
VALUES ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'SO-ANNUAL-001', 'active')
ON CONFLICT (immutable_code) DO NOTHING;

INSERT INTO service_offering_versions (offering_id, version_number, name, coverage_type, responsibility_scope, price_band, combination_willingness, readiness_level, lifecycle_status)
VALUES ('00000000-0000-0000-0000-000000000201', 1, '年会主服务全案·内容驱动型', 'complete', '整体项目唯一责任方，含方案/报价/履约统筹', '85-120万', 'solo', 'matchable', 'active')
ON CONFLICT DO NOTHING;
