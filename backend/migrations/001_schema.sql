-- ============================================================================
-- 演出撮合平台 · 数据库 Schema 迁移
-- 版本：v1.0
-- 创建时间：2026-07-01
-- 说明：13张核心表 + 索引 + RLS策略 + 触发器
-- 技术栈：PostgreSQL（Supabase 自托管）
-- ============================================================================

-- ============================================================================
-- 第零部分：ENUM 类型定义
-- ============================================================================

-- 用户角色
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'agent', 'performer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 运营子角色（RBAC）
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'operator', 'finance', 'content_editor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 业务线
DO $$ BEGIN
    CREATE TYPE business_line AS ENUM (
        'venue_booking',     -- 商演包场
        'outdoor_show',      -- 外出演出
        'show_sponsor',      -- 演出赞助
        'custom_content',    -- 定制内容
        'custom_showcase'    -- 定制拼盘
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 演员咖位（7级）
DO $$ BEGIN
    CREATE TYPE performer_tier AS ENUM ('T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 信誉等级
DO $$ BEGIN
    CREATE TYPE credit_level AS ENUM ('S', 'A', 'B', 'C', 'D');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 需求状态（17个状态）
DO $$ BEGIN
    CREATE TYPE demand_status AS ENUM (
        'pending_ai',               -- 等待AI生成
        'ai_generated',            -- AI已生成
        'pending_operator',        -- 等待运营处理
        'operator_adjusted',       -- 运营已调整
        'pending_client_confirm',  -- 等待活动公司确认
        'confirmed',               -- 已确认
        'pending_deposit',         -- 等待定金
        'deposit_received',        -- 定金已收
        'pending_performer',       -- 等待演员确认
        'performer_confirmed',     -- 演员已确认
        'performing',              -- 演出中
        'finished',                -- 已完成
        'pending_final_payment',   -- 等待尾款
        'final_payment_received',  -- 尾款已收
        'settled',                 -- 已结算
        'cancelled',               -- 已取消
        'refunding'                -- 退款中
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 价格配置类型
DO $$ BEGIN
    CREATE TYPE price_config_type AS ENUM (
        'performer_settlement',  -- 内部结算价（演员拿的）
        'agent_quote',           -- 活动公司报价（甲方价×0.7）
        'client_quote'           -- 甲方/普通用户标准价
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 需求来源
DO $$ BEGIN
    CREATE TYPE demand_source AS ENUM ('sku', 'requirement', 'phone');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 紧急程度
DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('normal', 'urgent', 'emergency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 签约模式
DO $$ BEGIN
    CREATE TYPE contract_mode AS ENUM ('skip', 'upload', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 排期状态
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 阵容状态
DO $$ BEGIN
    CREATE TYPE lineup_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 付款类型
DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('deposit', 'final');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 结算状态
DO $$ BEGIN
    CREATE TYPE settlement_status AS ENUM ('pending', 'settled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 认证状态（活动公司）
DO $$ BEGIN
    CREATE TYPE cert_status AS ENUM ('registered', 'pending_cert', 'certified');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 评价方类型
DO $$ BEGIN
    CREATE TYPE review_from_type AS ENUM ('company', 'performer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 评价状态
DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'published', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 演员状态
DO $$ BEGIN
    CREATE TYPE performer_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- SKU状态
DO $$ BEGIN
    CREATE TYPE sku_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- 第一部分：13 张核心表定义
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. users — 用户表（统一认证）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(11),
    wechat_openid   VARCHAR(128),              -- 微信openid（用于扫码登录+推送）
    name            VARCHAR(100),
    avatar_url      TEXT,
    role            user_role NOT NULL DEFAULT 'client',
    admin_role      admin_role,                 -- 运营子角色（仅 role=admin 时使用）
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS '用户表（统一认证，支持微信/手机登录）';
COMMENT ON COLUMN users.role IS '用户角色：client=甲方, agent=活动公司, performer=演员, admin=运营';
COMMENT ON COLUMN users.admin_role IS '运营子角色：super_admin/operator/finance/content_editor';
COMMENT ON COLUMN users.wechat_openid IS '微信 openid，用于 Web 扫码登录和小程序授权登录';


-- --------------------------------------------------------------------------
-- 2. company_profiles — 活动公司资料表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status                  cert_status NOT NULL DEFAULT 'registered',
    short_name              VARCHAR(100),          -- 公司简称（注册时填写）
    full_name               VARCHAR(200),          -- 公司全称（认证时填写）
    credit_code             VARCHAR(18),           -- 统一社会信用代码
    business_license_url    TEXT,                  -- 营业执照扫描件 URL
    legal_person_name       VARCHAR(100),          -- 法人姓名
    legal_person_id_url     TEXT,                  -- 法人身份证照片 URL
    bank_name               VARCHAR(100),          -- 开户银行
    bank_account            VARCHAR(50),           -- 对公账号
    contact_person          VARCHAR(50),           -- 联系人
    city                    VARCHAR(50),
    service_categories      JSONB DEFAULT '[]'::JSONB,  -- 服务类目
    total_orders            INT NOT NULL DEFAULT 0,       -- 累计订单数（冗余）
    total_spent             DECIMAL(14,2) NOT NULL DEFAULT 0,  -- 累计消费（冗余）
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE company_profiles IS '活动公司资料表（两步入驻：注册即用 → 交易前认证）';
COMMENT ON COLUMN company_profiles.status IS '认证状态：registered=已注册, pending_cert=待认证, certified=已认证';


-- --------------------------------------------------------------------------
-- 3. performers — 演员资料表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS performers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    name                VARCHAR(100) NOT NULL,
    phone               VARCHAR(11),
    avatar_url          TEXT,
    cover_url           TEXT,                      -- 封面大图（杂志风）
    style_tags          JSONB DEFAULT '[]'::JSONB, -- 风格标签
    introduction        TEXT,                      -- 个人简介
    highlights          TEXT,                      -- 个人亮点
    media_urls          JSONB DEFAULT '[]'::JSONB, -- 作品视频/照片
    social_links        JSONB DEFAULT '{}'::JSONB, -- 社交媒体链接
    experience_years    INT DEFAULT 0,             -- 从业年限
    rating              DECIMAL(2,1) DEFAULT 0,    -- 综合评分（1.0-5.0）
    credit_score        DECIMAL(4,2) DEFAULT 3.50, -- 信誉分（新演员默认3.5）
    credit_level        credit_level DEFAULT 'C',  -- 信誉等级 S/A/B/C/D
    tier                performer_tier DEFAULT 'T6', -- 咖位等级
    tier_updated_at     TIMESTAMPTZ,               -- 咖位最后更新时间
    tier_updated_by     UUID REFERENCES users(id), -- 咖位操作人
    contract_type       VARCHAR(50),               -- 签约类型
    exclusivity         BOOLEAN DEFAULT FALSE,     -- 是否独家
    settlement_rate     DECIMAL(3,2),              -- 结算比例
    status              performer_status NOT NULL DEFAULT 'active',
    protection_remaining INT DEFAULT 3,            -- 新演员保护期剩余场次
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE performers IS '演员资料表（含展示信息、咖位、信誉分）';
COMMENT ON COLUMN performers.tier IS '咖位等级：T0顶流→T1综艺级→T2头部→T3主力→T4成熟→T5成长→T6新人';
COMMENT ON COLUMN performers.credit_level IS '信誉等级：S/A/B/C/D，由系统根据信誉分自动计算';
COMMENT ON COLUMN performers.credit_score IS '信誉分（0-5），四维度加权：履约40%+质量35%+活跃15%+基础10%';
COMMENT ON COLUMN performers.protection_remaining IS '新演员保护期剩余场次，前3场不扣分';


-- --------------------------------------------------------------------------
-- 4. skus — SKU方案表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skus (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    business_line       business_line NOT NULL,
    description         TEXT,
    performer_profile   TEXT,                     -- 演员画像（非锁定阵容）
    style_tags          JSONB DEFAULT '[]'::JSONB, -- 适用风格
    applicable_scenes   JSONB DEFAULT '[]'::JSONB, -- 适用场景（年会/开业/派对等）
    base_price          DECIMAL(12,2) NOT NULL,    -- 甲方标准价
    agent_price         DECIMAL(12,2),             -- 活动公司7折价（= base_price × 0.7）
    duration_minutes    INT NOT NULL DEFAULT 20,   -- 标准时长
    performers_count    INT NOT NULL DEFAULT 1,    -- 演员数量
    cover_url           TEXT,                      -- 封面图
    media_urls          JSONB DEFAULT '[]'::JSONB, -- 样片/案例
    status              sku_status NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE skus IS 'SKU方案表（标准化演出产品，演员画像非锁定阵容）';
COMMENT ON COLUMN skus.base_price IS '甲方标准价（对外展示）';
COMMENT ON COLUMN skus.agent_price IS '活动公司7折渠道价';


-- --------------------------------------------------------------------------
-- 5. price_configs — 三种价格配置表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_configs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_type             price_config_type NOT NULL,
    business_line           business_line NOT NULL,
    tier                    performer_tier,        -- 仅 performer_settlement 类型使用
    package_name            VARCHAR(100) NOT NULL, -- 套餐名（基础版/标准版/加长版/豪华版）
    duration_minutes        INT NOT NULL DEFAULT 20,
    performer_count         INT NOT NULL DEFAULT 1,
    base_price              DECIMAL(12,2) NOT NULL,
    agent_discount          DECIMAL(3,2) DEFAULT 0.70,  -- 活动公司折扣比例
    extra_fee_per_5min      DECIMAL(12,2),        -- 每+5min加价
    script_creation_fee     DECIMAL(12,2),        -- 定制段子创作费/分钟
    script_performance_fee  DECIMAL(12,2),        -- 定制段子表演费/分钟
    remote_fee_in_city      DECIMAL(12,2) DEFAULT 500.00,   -- 绕城外附加费/人
    remote_fee_out_city     DECIMAL(12,2) DEFAULT 1000.00,  -- 市外附加费/人/天
    updated_by              UUID REFERENCES users(id),       -- 最后修改人
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE price_configs IS '三种价格配置表（运营后台维护，修改记录操作日志）';
COMMENT ON COLUMN price_configs.config_type IS '配置类型：performer_settlement=内部结算价, agent_quote=活动公司报价, client_quote=甲方标准价';
COMMENT ON COLUMN price_configs.agent_discount IS '活动公司折扣，默认0.70（7折）';


-- --------------------------------------------------------------------------
-- 6. demands — 需求/订单表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demands (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id               UUID NOT NULL REFERENCES users(id),
    business_line           business_line,
    source                  demand_source NOT NULL DEFAULT 'requirement',
    sku_id                  UUID REFERENCES skus(id),
    title                   VARCHAR(200),
    event_type              VARCHAR(100),           -- 企业年会/客户答谢/开业/婚礼
    event_date              DATE,
    event_time              TIME,
    city                    VARCHAR(50),
    address                 TEXT,
    audience_count          INT,
    budget                  DECIMAL(12,2),
    duration_minutes        INT,
    comedy_style            VARCHAR(100),           -- 喜剧风格偏好
    special_requirements    TEXT,                   -- 特殊要求
    venue_name              VARCHAR(200),           -- 商演包场场地
    venue_type              VARCHAR(100),           -- 场地类型
    ai_plan_content         TEXT,                   -- AI 原始方案 JSON
    adjusted_plan_content   TEXT,                   -- 运营调整后方案 JSON
    final_plan_content      TEXT,                   -- 最终确认方案 JSON
    final_price             DECIMAL(12,2),          -- 最终确认价格
    urgency                 urgency_level NOT NULL DEFAULT 'normal',
    contract_mode           contract_mode,          -- 签约模式
    operator_id             UUID REFERENCES users(id),  -- 负责运营
    status                  demand_status NOT NULL DEFAULT 'pending_ai',
    status_history          JSONB DEFAULT '[]'::JSONB,   -- 状态时间线
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE demands IS '需求/订单核心表（17个状态，运营驱动流转）';
COMMENT ON COLUMN demands.source IS '需求来源：sku=SKU选购, requirement=需求提报, phone=电话代客';
COMMENT ON COLUMN demands.status_history IS '状态流转时间线：[{status, at, operator_id}]';


-- --------------------------------------------------------------------------
-- 7. assignments — 排期分配表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id           UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    performer_id        UUID NOT NULL REFERENCES performers(id),
    performance_role    VARCHAR(100),               -- 脱口秀/即兴/主持等
    arrival_time        TIMESTAMPTZ,                -- 到场时间（早于开演30-60min）
    checkin_time        TIMESTAMPTZ,                -- 签到打卡时间
    checkin_location    JSONB,                      -- 签到位置 {lat, lng}
    negotiated_price    DECIMAL(12,2),              -- 协商价（默认按咖位计算）
    status              assignment_status NOT NULL DEFAULT 'pending',
    reject_reason       VARCHAR(500),               -- 拒绝原因
    confirmed_at        TIMESTAMPTZ,                -- 确认时间
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assignments IS '排期分配表（运营分配演员→演员确认/拒绝→签到→完成）';
COMMENT ON COLUMN assignments.arrival_time IS '演员到场时间，通常早于演出开始时间30-60分钟';


-- --------------------------------------------------------------------------
-- 8. lineup — 阵容表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lineup (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    performer_id    UUID NOT NULL REFERENCES performers(id),
    role            VARCHAR(100),               -- 角色描述（领衔/助演/主持等）
    status          lineup_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE lineup IS '阵容表（多演员同场演出的锁定阵容）';


-- --------------------------------------------------------------------------
-- 9. payment_records — 支付登记表（线下操作）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id       UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    type            payment_type NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    method          VARCHAR(50) NOT NULL,          -- 银行转账/微信转账/支付宝
    operator_id     UUID NOT NULL REFERENCES users(id),
    received_at     TIMESTAMPTZ NOT NULL,           -- 实际收款时间
    note            TEXT,                           -- 备注
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE payment_records IS '支付登记表（不做在线支付，全部线下登记）';
COMMENT ON COLUMN payment_records.type IS '付款类型：deposit=定金, final=尾款';


-- --------------------------------------------------------------------------
-- 10. settlements — 结算表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performer_id    UUID NOT NULL REFERENCES performers(id),
    demand_id       UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    amount          DECIMAL(12,2) NOT NULL,
    period          VARCHAR(7),                    -- 结算周期 YYYY-MM
    status          settlement_status NOT NULL DEFAULT 'pending',
    settled_at      TIMESTAMPTZ,                   -- 系统标记已结算时间
    paid_at         TIMESTAMPTZ,                   -- 实际打款时间
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE settlements IS '结算表（线下打款 + 系统标记已结算）';


-- --------------------------------------------------------------------------
-- 11. reviews — 评价表（双向）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id               UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    from_type               review_from_type NOT NULL,
    from_user_id            UUID NOT NULL REFERENCES users(id),
    to_performer_id         UUID REFERENCES performers(id),  -- 对公司评价则为 NULL
    overall_rating          DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
    performance_rating      DECIMAL(2,1) CHECK (performance_rating >= 1.0 AND performance_rating <= 5.0),
    punctuality_rating      DECIMAL(2,1) CHECK (punctuality_rating >= 1.0 AND punctuality_rating <= 5.0),
    content_rating          DECIMAL(2,1) CHECK (content_rating >= 1.0 AND content_rating <= 5.0),
    interaction_rating      DECIMAL(2,1) CHECK (interaction_rating >= 1.0 AND interaction_rating <= 5.0),
    satisfaction_rating     DECIMAL(2,1) CHECK (satisfaction_rating >= 1.0 AND satisfaction_rating <= 5.0),
    text_content            TEXT,
    status                  review_status NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reviews IS '评价表（双向评价：活动公司↔演员）';
COMMENT ON COLUMN reviews.from_type IS '评价方：company=活动公司评演员, performer=演员评活动公司';


-- --------------------------------------------------------------------------
-- 12. credit_score_logs — 信誉分变动记录
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_score_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performer_id        UUID NOT NULL REFERENCES performers(id),
    change_amount       DECIMAL(4,2) NOT NULL,         -- 变动值（正+负-）
    reason              VARCHAR(500) NOT NULL,          -- 变动原因
    related_demand_id   UUID REFERENCES demands(id),   -- 关联订单
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE credit_score_logs IS '信誉分变动记录（不可修改，追加写入）';
COMMENT ON COLUMN credit_score_logs.reason IS '变动原因：完成演出/准时签到/拒绝排期/差评/演出当天取消等';


-- --------------------------------------------------------------------------
-- 13. operation_logs — 操作日志表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id     UUID NOT NULL REFERENCES users(id),
    module          VARCHAR(50) NOT NULL,              -- 操作模块
    action          VARCHAR(50) NOT NULL,              -- 操作类型（create/update/delete）
    target_type     VARCHAR(50),                       -- 操作对象类型
    target_id       UUID,                              -- 操作对象ID
    before_data     JSONB,                             -- 修改前数据
    after_data      JSONB,                             -- 修改后数据
    detail          TEXT,                              -- 操作详情描述
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE operation_logs IS '操作日志表（所有 CUD 操作记录，不可删除）';
COMMENT ON COLUMN operation_logs.module IS '操作模块：sku/price/performer/demand/assignment 等';
COMMENT ON COLUMN operation_logs.action IS '操作类型：create/update/delete/mark_settled/lock_tier 等';


-- ============================================================================
-- 第二部分：索引
-- ============================================================================

-- users 表索引
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL AND phone != '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wechat_openid_unique ON users(wechat_openid) WHERE wechat_openid IS NOT NULL AND wechat_openid != '';

-- company_profiles 表索引
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_status ON company_profiles(status);
CREATE INDEX IF NOT EXISTS idx_company_profiles_city ON company_profiles(city);

-- performers 表索引
CREATE INDEX IF NOT EXISTS idx_performers_user_id ON performers(user_id);
CREATE INDEX IF NOT EXISTS idx_performers_tier ON performers(tier);
CREATE INDEX IF NOT EXISTS idx_performers_credit_level ON performers(credit_level);
CREATE INDEX IF NOT EXISTS idx_performers_status ON performers(status);
CREATE INDEX IF NOT EXISTS idx_performers_rating ON performers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_performers_style_tags ON performers USING GIN (style_tags);

-- skus 表索引
CREATE INDEX IF NOT EXISTS idx_skus_business_line ON skus(business_line);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_skus_base_price ON skus(base_price);
CREATE INDEX IF NOT EXISTS idx_skus_style_tags ON skus USING GIN (style_tags);
CREATE INDEX IF NOT EXISTS idx_skus_applicable_scenes ON skus USING GIN (applicable_scenes);

-- price_configs 表索引
CREATE INDEX IF NOT EXISTS idx_price_configs_config_type ON price_configs(config_type);
CREATE INDEX IF NOT EXISTS idx_price_configs_business_line ON price_configs(business_line);
CREATE INDEX IF NOT EXISTS idx_price_configs_tier ON price_configs(tier);
CREATE INDEX IF NOT EXISTS idx_price_configs_type_line_tier ON price_configs(config_type, business_line, tier);

-- demands 表索引
CREATE INDEX IF NOT EXISTS idx_demands_client_id ON demands(client_id);
CREATE INDEX IF NOT EXISTS idx_demands_operator_id ON demands(operator_id);
CREATE INDEX IF NOT EXISTS idx_demands_sku_id ON demands(sku_id);
CREATE INDEX IF NOT EXISTS idx_demands_status ON demands(status);
CREATE INDEX IF NOT EXISTS idx_demands_event_date ON demands(event_date);
CREATE INDEX IF NOT EXISTS idx_demands_created_at ON demands(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demands_urgency ON demands(urgency);

-- assignments 表索引
CREATE INDEX IF NOT EXISTS idx_assignments_demand_id ON assignments(demand_id);
CREATE INDEX IF NOT EXISTS idx_assignments_performer_id ON assignments(performer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_arrival_time ON assignments(arrival_time);
CREATE INDEX IF NOT EXISTS idx_assignments_performer_status ON assignments(performer_id, status);

-- lineup 表索引
CREATE INDEX IF NOT EXISTS idx_lineup_demand_id ON lineup(demand_id);
CREATE INDEX IF NOT EXISTS idx_lineup_performer_id ON lineup(performer_id);
CREATE INDEX IF NOT EXISTS idx_lineup_status ON lineup(status);

-- payment_records 表索引
CREATE INDEX IF NOT EXISTS idx_payment_records_demand_id ON payment_records(demand_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_type ON payment_records(type);
CREATE INDEX IF NOT EXISTS idx_payment_records_received_at ON payment_records(received_at);

-- settlements 表索引
CREATE INDEX IF NOT EXISTS idx_settlements_performer_id ON settlements(performer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_demand_id ON settlements(demand_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON settlements(period);
CREATE INDEX IF NOT EXISTS idx_settlements_performer_status ON settlements(performer_id, status);

-- reviews 表索引
CREATE INDEX IF NOT EXISTS idx_reviews_demand_id ON reviews(demand_id);
CREATE INDEX IF NOT EXISTS idx_reviews_from_user_id ON reviews(from_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_to_performer_id ON reviews(to_performer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_from_type ON reviews(from_type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- credit_score_logs 表索引
CREATE INDEX IF NOT EXISTS idx_credit_score_logs_performer_id ON credit_score_logs(performer_id);
CREATE INDEX IF NOT EXISTS idx_credit_score_logs_created_at ON credit_score_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_score_logs_related_demand ON credit_score_logs(related_demand_id);

-- operation_logs 表索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_operator_id ON operation_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operation_logs_target ON operation_logs(target_type, target_id);


-- ============================================================================
-- 第三部分：全文搜索索引（PostgreSQL tsvector）
-- ============================================================================

-- 演员全文搜索（名称 + 简介 + 亮点）
ALTER TABLE performers ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_performers_search ON performers USING GIN (search_vector);

-- SKU 全文搜索（名称 + 描述 + 演员画像）
ALTER TABLE skus ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_skus_search ON skus USING GIN (search_vector);


-- ============================================================================
-- 第四部分：RLS（Row Level Security）策略
-- ============================================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_score_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- users: 用户可读自己的，运营可读全部
-- =============================================
DROP POLICY IF EXISTS users_read_own ON users;
CREATE POLICY users_read_own ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_read_admin ON users;
CREATE POLICY users_read_admin ON users
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- company_profiles: 公司读自己的，运营读全部
-- =============================================
DROP POLICY IF EXISTS company_read_own ON company_profiles;
CREATE POLICY company_read_own ON company_profiles
    FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS company_insert_own ON company_profiles;
CREATE POLICY company_insert_own ON company_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS company_update_own ON company_profiles;
CREATE POLICY company_update_own ON company_profiles
    FOR UPDATE USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

-- =============================================
-- performers: 公开可读，运营读写，演员只读自己的
-- =============================================
DROP POLICY IF EXISTS performers_read_public ON performers;
CREATE POLICY performers_read_public ON performers
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS performers_insert_admin ON performers;
CREATE POLICY performers_insert_admin ON performers
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS performers_update_admin ON performers;
CREATE POLICY performers_update_admin ON performers
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
        OR (auth.uid() = user_id)
    );

-- =============================================
-- skus: 公开可读，运营可写
-- =============================================
DROP POLICY IF EXISTS skus_read_public ON skus;
CREATE POLICY skus_read_public ON skus
    FOR SELECT USING (status = 'active' OR EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

DROP POLICY IF EXISTS skus_write_admin ON skus;
CREATE POLICY skus_write_admin ON skus
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- price_configs: 仅运营可读写
-- =============================================
DROP POLICY IF EXISTS price_configs_admin ON price_configs;
CREATE POLICY price_configs_admin ON price_configs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- demands: 活动公司看自己的，运营看全部
-- =============================================
DROP POLICY IF EXISTS demands_read_own ON demands;
CREATE POLICY demands_read_own ON demands
    FOR SELECT USING (
        auth.uid() = client_id
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS demands_insert_agent ON demands;
CREATE POLICY demands_insert_agent ON demands
    FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS demands_update_admin ON demands;
CREATE POLICY demands_update_admin ON demands
    FOR UPDATE USING (
        auth.uid() = client_id
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

-- =============================================
-- assignments: 演员看自己的，运营看全部
-- =============================================
DROP POLICY IF EXISTS assignments_read ON assignments;
CREATE POLICY assignments_read ON assignments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM performers p WHERE p.id = assignments.performer_id AND p.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS assignments_admin ON assignments;
CREATE POLICY assignments_admin ON assignments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- lineup: 同 assignments
-- =============================================
DROP POLICY IF EXISTS lineup_read ON lineup;
CREATE POLICY lineup_read ON lineup
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM performers p WHERE p.id = lineup.performer_id AND p.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS lineup_admin ON lineup;
CREATE POLICY lineup_admin ON lineup
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- payment_records: 仅运营可读写
-- =============================================
DROP POLICY IF EXISTS payment_records_admin ON payment_records;
CREATE POLICY payment_records_admin ON payment_records
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- settlements: 演员看自己的，运营看全部
-- =============================================
DROP POLICY IF EXISTS settlements_read ON settlements;
CREATE POLICY settlements_read ON settlements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM performers p WHERE p.id = settlements.performer_id AND p.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS settlements_admin ON settlements;
CREATE POLICY settlements_admin ON settlements
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- reviews: 评价方可写自己的，公开可读已发布的
-- =============================================
DROP POLICY IF EXISTS reviews_read_public ON reviews;
CREATE POLICY reviews_read_public ON reviews
    FOR SELECT USING (
        status = 'published'
        OR auth.uid() = from_user_id
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS reviews_insert_own ON reviews;
CREATE POLICY reviews_insert_own ON reviews
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS reviews_update_admin ON reviews;
CREATE POLICY reviews_update_admin ON reviews
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- credit_score_logs: 演员看自己的，运营看全部
-- =============================================
DROP POLICY IF EXISTS credit_logs_read ON credit_score_logs;
CREATE POLICY credit_logs_read ON credit_score_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM performers p WHERE p.id = credit_score_logs.performer_id AND p.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

DROP POLICY IF EXISTS credit_logs_insert_admin ON credit_score_logs;
CREATE POLICY credit_logs_insert_admin ON credit_score_logs
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- =============================================
-- operation_logs: 仅运营可读（不可修改、不可删除）
-- =============================================
DROP POLICY IF EXISTS operation_logs_read_admin ON operation_logs;
CREATE POLICY operation_logs_read_admin ON operation_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

DROP POLICY IF EXISTS operation_logs_insert_any ON operation_logs;
CREATE POLICY operation_logs_insert_any ON operation_logs
    FOR INSERT WITH CHECK (TRUE);


-- ============================================================================
-- 第五部分：触发器
-- ============================================================================

-- --------------------------------------------------
-- 通用：updated_at 自动更新触发器
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有包含 updated_at 的表创建触发器
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
          AND table_name != 'operation_logs'  -- operation_logs 无 updated_at
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
            CREATE TRIGGER trg_%s_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;


-- --------------------------------------------------
-- 搜索向量自动更新触发器
-- --------------------------------------------------

-- 演员搜索向量更新
CREATE OR REPLACE FUNCTION update_performer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.introduction, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.highlights, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_performers_search_vector ON performers;
CREATE TRIGGER trg_performers_search_vector
    BEFORE INSERT OR UPDATE OF name, introduction, highlights ON performers
    FOR EACH ROW EXECUTE FUNCTION update_performer_search_vector();

-- SKU 搜索向量更新
CREATE OR REPLACE FUNCTION update_sku_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.performer_profile, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_skus_search_vector ON skus;
CREATE TRIGGER trg_skus_search_vector
    BEFORE INSERT OR UPDATE OF name, description, performer_profile ON skus
    FOR EACH ROW EXECUTE FUNCTION update_sku_search_vector();


-- --------------------------------------------------
-- 信誉分变更时自动更新 performers 表触发器
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION update_performer_credit_on_log()
RETURNS TRIGGER AS $$
DECLARE
    new_score DECIMAL(4,2);
    new_level credit_level;
BEGIN
    -- 计算新信誉分（确保范围 0-5）
    SELECT GREATEST(0, LEAST(5, COALESCE(p.credit_score, 3.50) + NEW.change_amount))
    INTO new_score
    FROM performers p WHERE p.id = NEW.performer_id;

    -- 根据信誉分计算等级
    new_level := CASE
        WHEN new_score >= 4.8 THEN 'S'::credit_level
        WHEN new_score >= 4.0 THEN 'A'::credit_level
        WHEN new_score >= 3.5 THEN 'B'::credit_level
        WHEN new_score >= 3.0 THEN 'C'::credit_level
        ELSE 'D'::credit_level
    END;

    -- 更新 performers 表
    UPDATE performers
    SET credit_score = new_score,
        credit_level = new_level,
        updated_at = now()
    WHERE id = NEW.performer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_credit_score_logs_update_performer ON credit_score_logs;
CREATE TRIGGER trg_credit_score_logs_update_performer
    AFTER INSERT ON credit_score_logs
    FOR EACH ROW EXECUTE FUNCTION update_performer_credit_on_log();


-- --------------------------------------------------
-- 付款登记后自动推进需求状态触发器
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION advance_demand_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    current_status demand_status;
    new_status demand_status;
BEGIN
    SELECT status INTO current_status FROM demands WHERE id = NEW.demand_id;

    IF NEW.type = 'deposit' AND current_status = 'pending_deposit' THEN
        new_status := 'deposit_received';
    ELSIF NEW.type = 'final' AND current_status = 'pending_final_payment' THEN
        new_status := 'final_payment_received';
    ELSE
        -- 不在预期状态，不自动推进
        RETURN NEW;
    END IF;

    -- 更新需求状态
    UPDATE demands
    SET status = new_status,
        status_history = status_history || jsonb_build_array(
            jsonb_build_object(
                'status', new_status,
                'at', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                'operator_id', NEW.operator_id
            )
        ),
        updated_at = now()
    WHERE id = NEW.demand_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_records_advance_demand ON payment_records;
CREATE TRIGGER trg_payment_records_advance_demand
    AFTER INSERT ON payment_records
    FOR EACH ROW EXECUTE FUNCTION advance_demand_on_payment();


-- --------------------------------------------------
-- 操作日志自动记录函数（供应用层调用）
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION record_operation_log(
    p_operator_id UUID,
    p_module VARCHAR,
    p_action VARCHAR,
    p_target_type VARCHAR,
    p_target_id UUID,
    p_before JSONB,
    p_after JSONB,
    p_detail TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO operation_logs (
        operator_id, module, action, target_type, target_id,
        before_data, after_data, detail
    ) VALUES (
        p_operator_id, p_module, p_action, p_target_type, p_target_id,
        p_before, p_after, p_detail
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_operation_log IS '通用操作日志记录函数，供应用层（Node.js Fastify）通过参数化查询调用';


-- ============================================================================
-- 第六部分：约束补充
-- ============================================================================

-- 确保同一 demand 下同一 performer 在 lineup 中唯一
ALTER TABLE lineup DROP CONSTRAINT IF EXISTS unique_lineup_performer_per_demand;
ALTER TABLE lineup ADD CONSTRAINT unique_lineup_performer_per_demand
    UNIQUE (demand_id, performer_id);

-- 确保同一 demand 下同一 performer 在 assignments 中唯一
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS unique_assignment_performer_per_demand;
ALTER TABLE assignments ADD CONSTRAINT unique_assignment_performer_per_demand
    UNIQUE (demand_id, performer_id);

-- 同一需求下同一用户只能评价一次
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_review_per_user_per_demand;
ALTER TABLE reviews ADD CONSTRAINT unique_review_per_user_per_demand
    UNIQUE (demand_id, from_user_id);

-- SKU agent_price 默认计算（由应用层控制，此处仅注释说明）
-- agent_price = base_price × 0.7（活动公司7折价）
