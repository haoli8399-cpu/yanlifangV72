-- ============================================================================
-- 迁移 006：SKU 自定义字段
-- 支持运营配置 SKU 扩展字段，并为每个 SKU 保存对应字段值
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sku_custom_field_type') THEN
        CREATE TYPE sku_custom_field_type AS ENUM ('text', 'number', 'switch', 'select');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS sku_custom_fields (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    field_type  sku_custom_field_type NOT NULL,
    options     JSONB NOT NULL DEFAULT '[]'::JSONB,
    required    BOOLEAN NOT NULL DEFAULT false,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sku_custom_fields_name_unique
    ON sku_custom_fields (lower(name));
CREATE INDEX IF NOT EXISTS idx_sku_custom_fields_sort_order
    ON sku_custom_fields(sort_order, created_at);

CREATE TABLE IF NOT EXISTS sku_custom_values (
    sku_id      UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    field_id    UUID NOT NULL REFERENCES sku_custom_fields(id) ON DELETE CASCADE,
    value       JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (sku_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_sku_custom_values_field_id
    ON sku_custom_values(field_id);

COMMENT ON TABLE sku_custom_fields IS 'SKU自定义字段定义';
COMMENT ON COLUMN sku_custom_fields.field_type IS '字段类型：text/number/switch/select';
COMMENT ON COLUMN sku_custom_fields.options IS 'select 字段选项，其他类型保持空数组';
COMMENT ON TABLE sku_custom_values IS 'SKU自定义字段值';
COMMENT ON COLUMN sku_custom_values.value IS '字段值，按 field_type 保存为 JSONB 标量';

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_sku_custom_fields_updated_at ON sku_custom_fields;
    CREATE TRIGGER trg_sku_custom_fields_updated_at
        BEFORE UPDATE ON sku_custom_fields
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS trg_sku_custom_values_updated_at ON sku_custom_values;
    CREATE TRIGGER trg_sku_custom_values_updated_at
        BEFORE UPDATE ON sku_custom_values
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;
