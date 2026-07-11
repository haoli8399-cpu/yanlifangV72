-- ============================================================================
-- 迁移 005：Phase 1 核心表 — 商机管理 + 报价管理 + 跟进记录 + AI反馈
-- PRD V3.3.2 第 5.3 节 / 第 6.4 节 / 第 6.5 节
-- 对齐 UI 设计稿：销售作战台商机三栏 + AI成交日报
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. opportunities — 商机表（PRD 5.3 / 6.4）
--    每个需求对应一条商机，从 new→...→won/lost 状态流转
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'new',
    priority        VARCHAR(10) NOT NULL DEFAULT 'medium',
    lost_reason     VARCHAR(50),
    lost_reason_note TEXT,
    assigned_to     UUID REFERENCES users(id),
    ai_score        DECIMAL(5,2),
    next_action     TEXT,
    next_action_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_demand_id ON opportunities(demand_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority);

COMMENT ON TABLE opportunities IS '商机表 — 每个需求是一条商机，包含状态机流转+优先级+丢单原因';
COMMENT ON COLUMN opportunities.status IS 'new→qualified→quoted→negotiating→pending_client→won/lost; 或 invalid(无效需求)';
COMMENT ON COLUMN opportunities.priority IS 'high/medium/low';
COMMENT ON COLUMN opportunities.lost_reason IS '丢单原因: budget_too_low/date_unavailable/no_response/lost_to_competitor/plan_mismatch/event_cancelled/price_too_high/not_real_demand';
COMMENT ON COLUMN opportunities.ai_score IS 'AI 成交概率评分 0-100';

-- --------------------------------------------------------------------------
-- 2. quotes — 报价单表（PRD 5.3 / 6.5 报价版本管理）
--    每次报价为一个版本，支持多版本对比
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    version         INT NOT NULL DEFAULT 1,
    total_price     DECIMAL(12,2) NOT NULL,
    channel_price   DECIMAL(12,2),
    cost_price      DECIMAL(12,2),
    margin          DECIMAL(5,2),
    valid_until     TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    rejection_reason TEXT,
    ai_generated    BOOLEAN DEFAULT false,
    operator_modified BOOLEAN DEFAULT false,
    items_snapshot  JSONB DEFAULT '[]'::JSONB,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_demand_id ON quotes(demand_id);
CREATE INDEX IF NOT EXISTS idx_quotes_opportunity_id ON quotes(opportunity_id);

COMMENT ON TABLE quotes IS '报价单表 — 支持多版本管理，记录三层价格和毛利';
COMMENT ON COLUMN quotes.total_price IS '甲方标准价（客户看到的最终价）';
COMMENT ON COLUMN quotes.channel_price IS '渠道价 = 标准价 ×0.7（活动公司价）';
COMMENT ON COLUMN quotes.cost_price IS '成本价（内部结算价）';
COMMENT ON COLUMN quotes.margin IS '毛利率 (total_price - cost_price)/total_price';
COMMENT ON COLUMN quotes.status IS 'active/draft/rejected/superseded';
COMMENT ON COLUMN quotes.items_snapshot IS '报价包含的 SKU 明细快照';

-- --------------------------------------------------------------------------
-- 3. follow_up_logs — 跟进记录表（PRD 5.3）
--    每次跟进（电话/微信/邮件/面谈）记录
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follow_up_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    action_type     VARCHAR(20) NOT NULL,
    content         TEXT,
    ai_suggested_script TEXT,
    outcome         TEXT,
    next_follow_up_at TIMESTAMPTZ,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_logs_opportunity_id ON follow_up_logs(opportunity_id);

COMMENT ON TABLE follow_up_logs IS '跟进记录表 — 每次与客户的沟通记录，含AI建议话术';
COMMENT ON COLUMN follow_up_logs.action_type IS 'call/wechat/email/meeting';

-- --------------------------------------------------------------------------
-- 4. ai_feedback_logs — AI 推荐反馈记录（PRD 5.3）
--    记录 AI 推荐的方案被采纳/拒绝的情况
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_feedback_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID REFERENCES demands(id) ON DELETE SET NULL,
    quote_id        UUID REFERENCES quotes(id) ON DELETE SET NULL,
    feedback_type   VARCHAR(20) NOT NULL,
    feedback        TEXT,
    was_accepted    BOOLEAN,
    ai_model        VARCHAR(50),
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_feedback_logs IS 'AI推荐反馈 — 追踪AI方案的采纳率和质量';
COMMENT ON COLUMN ai_feedback_logs.feedback_type IS 'accept/reject/adjust';
