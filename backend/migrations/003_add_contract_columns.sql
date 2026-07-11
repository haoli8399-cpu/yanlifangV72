-- ============================================================================
-- 迁移 003：为 demands 表添加签约相关字段
-- 用途：支持 PUT /v1/contracts/:demand_id 存储合同文件 URL 和签署时间
-- 注意：contract_mode 列已存在于 001_schema.sql 中，此处仅补充缺失列
-- ============================================================================

-- 添加合同文件 URL 列（upload 模式时存储 PDF 文件地址）
ALTER TABLE demands
ADD COLUMN IF NOT EXISTS contract_file_url TEXT;

-- 添加合同签署时间列
ALTER TABLE demands
ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;

-- 列注释
COMMENT ON COLUMN demands.contract_file_url IS '上传的合同 PDF 文件 URL（签约模式为 upload 时使用）';
COMMENT ON COLUMN demands.contract_signed_at IS '合同签署时间（线上/线下签署均可记录）';
