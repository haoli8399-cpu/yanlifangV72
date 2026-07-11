-- 商机表
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID REFERENCES demands(id),
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    priority VARCHAR(10) DEFAULT 'medium',
    lost_reason VARCHAR(50),
    assigned_to UUID REFERENCES users(id),
    ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
    next_action VARCHAR(200),
    next_action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 报价单表
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID REFERENCES demands(id),
    opportunity_id UUID REFERENCES opportunities(id),
    version INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(12,2),
    channel_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    margin DECIMAL(12,2) GENERATED ALWAYS AS (total_price - cost_price) STORED,
    valid_until TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft',
    rejection_reason TEXT,
    ai_generated BOOLEAN DEFAULT false,
    operator_modified BOOLEAN DEFAULT false,
    items_snapshot JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 跟进记录表
CREATE TABLE IF NOT EXISTS follow_up_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id),
    operator_id UUID REFERENCES users(id),
    action_type VARCHAR(20),
    content TEXT,
    ai_suggested_script TEXT,
    outcome VARCHAR(100),
    next_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI反馈日志表
CREATE TABLE IF NOT EXISTS ai_feedback_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id),
    quote_id UUID REFERENCES quotes(id),
    feedback_type VARCHAR(20) NOT NULL,
    feedback_action VARCHAR(10) NOT NULL,
    reject_reason VARCHAR(100),
    operator_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
