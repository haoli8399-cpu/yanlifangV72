-- ============================================================================
-- 迁移 010：Capability 受治理能力词条
-- PRD V7.2 §6.2 §21: Capability 只用于发现/检索/AI辅助，不进入报价/主服务资格
-- ============================================================================

CREATE TABLE IF NOT EXISTS capabilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governed_name   VARCHAR(200) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    scope           TEXT,
    evidence_ref    JSONB DEFAULT '{}'::JSONB,
    lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capabilities_category ON capabilities(category);
CREATE INDEX IF NOT EXISTS idx_capabilities_lifecycle ON capabilities(lifecycle_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_capabilities_name ON capabilities(governed_name) WHERE lifecycle_status != 'retired';

COMMENT ON TABLE capabilities IS 'V7.2 Capability — 受治理能力词条。仅用于发现/检索/AI辅助，不进入报价、主服务资格判断或正式项目承接。';

-- 种子数据：基础能力词条
INSERT INTO capabilities (governed_name, category, scope, lifecycle_status) VALUES
    ('单口喜剧表演', 'performance', '独立完成单口喜剧节目表演，含段子创作与舞台呈现', 'active'),
    ('即兴互动主持', 'hosting', '现场即兴互动主持，含观众参与环节调度', 'active'),
    ('定制开场内容创作', 'content', '基于客户关键词定制开场脱口秀内容，含2-3轮评审', 'active'),
    ('双语活动主持', 'hosting', '中英双语活动全程主持，含串场与高潮环节调度', 'active'),
    ('近景魔术表演', 'performance', '近景魔术VIP巡桌与舞台表演，含定制品牌效果', 'active'),
    ('全案活动统筹', 'production', '多供应商协调、时间轴管理、现场导演与客户沟通', 'active'),
    ('企业年会策划', 'planning', '企业年会内容策划、节目编排与执行方案设计', 'active'),
    ('品牌活动内容设计', 'planning', '品牌活动内容策略、故事线与体验设计', 'active'),
    ('工作坊设计与执行', 'facilitation', '团队工作坊内容设计、分组引导与结营演出导演', 'active')
ON CONFLICT (governed_name) WHERE lifecycle_status != 'retired' DO NOTHING;
