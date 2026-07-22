-- ============================================================================
-- 迁移 011：ProgramModule / ProgramModuleVersion — 可复用节目单元
-- PRD V7.2 §6.4: 稳定根身份 + 不可变业务编号，版本不可原地改写
-- ============================================================================

-- ProgramModule 稳定根
CREATE TABLE IF NOT EXISTS program_modules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_tenant_id UUID NOT NULL,
    immutable_code  VARCHAR(50) NOT NULL,
    category        VARCHAR(100),
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pm_owner ON program_modules(owner_tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pm_code ON program_modules(immutable_code);

-- ProgramModuleVersion 不可原地改写
CREATE TABLE IF NOT EXISTS program_module_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_module_id UUID NOT NULL REFERENCES program_modules(id),
    version_number  INT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    delivery_definition JSONB DEFAULT '{}'::JSONB,
    standard_duration_minutes INT,
    tech_requirements JSONB DEFAULT '{}'::JSONB,
    rights_summary  TEXT,
    readiness_level VARCHAR(30) NOT NULL DEFAULT 'draft',
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    publication_status VARCHAR(30) NOT NULL DEFAULT 'private',
    evidence_status VARCHAR(30) NOT NULL DEFAULT 'declared',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pmv_module ON program_module_versions(program_module_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pmv_version ON program_module_versions(program_module_id, version_number);

COMMENT ON TABLE program_modules IS 'V7.2 ProgramModule — 节目稳定根身份';
COMMENT ON TABLE program_module_versions IS 'V7.2 ProgramModuleVersion — 不可原地改写，新交付创建新版本';
COMMENT ON COLUMN program_modules.immutable_code IS '不可变业务编号，如 PROG-COMEDY-001';
COMMENT ON COLUMN program_module_versions.readiness_level IS '四轴之一: draft/matchable/quotable/publishable';
COMMENT ON COLUMN program_module_versions.lifecycle_status IS '四轴之一: draft/pending_confirmation/active/suspended/expired/superseded/retired';
COMMENT ON COLUMN program_module_versions.publication_status IS '四轴之一: private/pending_publish/published/withdrawn';
COMMENT ON COLUMN program_module_versions.evidence_status IS '四轴之一: declared/supported/verified/conflict/expired';

-- 种子数据
INSERT INTO program_modules (id, owner_tenant_id, immutable_code, category, lifecycle_status)
VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'PROG-COMEDY-001', 'comedy', 'active')
ON CONFLICT (immutable_code) DO NOTHING;

INSERT INTO program_module_versions (program_module_id, version_number, name, standard_duration_minutes, readiness_level, lifecycle_status)
VALUES ('00000000-0000-0000-0000-000000000101', 1, '企业喜剧专场 60分钟', 60, 'matchable', 'active')
ON CONFLICT DO NOTHING;
