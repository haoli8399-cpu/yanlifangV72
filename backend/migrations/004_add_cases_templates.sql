-- ============================================================================
-- 迁移 004：添加案例管理表 + AI模板表 + 备选方案支持
-- P-23 案例管理, P-24 AI模板管理, W-07 多方案对比
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. cases — 案例管理表（P-23）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    cover_url       TEXT,
    images          JSONB DEFAULT '[]'::JSONB,
    sku_id          UUID REFERENCES skus(id) ON DELETE SET NULL,
    performer_ids   JSONB DEFAULT '[]'::JSONB,
    tags            JSONB DEFAULT '[]'::JSONB,
    sort_order      INT DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'draft',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cases IS '案例管理表（运营后台增删改查，草稿→发布）';
COMMENT ON COLUMN cases.status IS 'draft=草稿, published=已发布, archived=已归档';
COMMENT ON COLUMN cases.sku_id IS '关联的 SKU 方案';
COMMENT ON COLUMN cases.performer_ids IS '关联的演员 ID 列表';

-- --------------------------------------------------------------------------
-- 2. ai_templates — AI 方案模板表（P-24）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    business_line   business_line,
    description     TEXT,
    template_content TEXT NOT NULL,
    variables       JSONB DEFAULT '[]'::JSONB,
    is_default      BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'active',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_templates IS 'AI 方案模板表（SKU未覆盖时使用通用模板）';
COMMENT ON COLUMN ai_templates.template_content IS '模板内容（支持变量占位符 {{variable}}）';
COMMENT ON COLUMN ai_templates.variables IS '模板变量定义 [{name, type, required, default}]';
COMMENT ON COLUMN ai_templates.status IS 'active=启用, inactive=停用';

-- --------------------------------------------------------------------------
-- 索引
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_sku_id ON cases(sku_id);
CREATE INDEX IF NOT EXISTS idx_cases_sort_order ON cases(sort_order);
CREATE INDEX IF NOT EXISTS idx_cases_performer_ids ON cases USING GIN (performer_ids);

CREATE INDEX IF NOT EXISTS idx_ai_templates_business_line ON ai_templates(business_line);
CREATE INDEX IF NOT EXISTS idx_ai_templates_status ON ai_templates(status);
CREATE INDEX IF NOT EXISTS idx_ai_templates_is_default ON ai_templates(is_default);

-- --------------------------------------------------------------------------
-- 3. demand_alternatives — 备选方案表（W-07 多方案对比）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demand_alternatives (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    plan_name       VARCHAR(200) NOT NULL,
    plan_content    TEXT NOT NULL,
    price           DECIMAL(12,2),
    performer_lineup JSONB DEFAULT '[]'::JSONB,
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'pending',
    operator_id     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE demand_alternatives IS '备选方案表（运营推送2-3个方案供客户对比选择）';
COMMENT ON COLUMN demand_alternatives.status IS 'pending=待选择, selected=已选择, rejected=已拒绝';
COMMENT ON COLUMN demand_alternatives.performer_lineup IS '备选阵容 [{performer_id, name, tier, role}]';

CREATE INDEX IF NOT EXISTS idx_demand_alternatives_demand_id ON demand_alternatives(demand_id);
CREATE INDEX IF NOT EXISTS idx_demand_alternatives_status ON demand_alternatives(status);

-- --------------------------------------------------------------------------
-- 触发器：updated_at 自动更新
-- --------------------------------------------------------------------------
DO $$
BEGIN
    -- cases
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cases_updated_at') THEN
        CREATE TRIGGER trg_cases_updated_at
            BEFORE UPDATE ON cases
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- ai_templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ai_templates_updated_at') THEN
        CREATE TRIGGER trg_ai_templates_updated_at
            BEFORE UPDATE ON ai_templates
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- demand_alternatives
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_demand_alternatives_updated_at') THEN
        CREATE TRIGGER trg_demand_alternatives_updated_at
            BEFORE UPDATE ON demand_alternatives
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
