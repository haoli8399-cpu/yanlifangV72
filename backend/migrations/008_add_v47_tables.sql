-- ============================================================================
-- 迁移 008：V4.7 增量表 — 方案管理 + 线索管理 + 素材资产库 + 增长工具
-- PRD V4.7 MVP 落地与增长工具技术附件增强版
-- 新增 8 张表：proposals / proposal_versions / proposal_modules /
--   leads / tool_results / talents / venues / case_studies
-- 不修改已有 17 张表结构（纯增量新增）
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. proposals — 方案主表
--    AI 生成的客户方案，从线索/工具结果转化而来
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL,               -- 方案编号 YLF-2026-0042
    customer_name   VARCHAR(200) NOT NULL,              -- 客户名称
    event_theme     VARCHAR(200),                       -- 活动主题
    event_date      DATE,                               -- 活动日期
    headcount       INT,                                -- 预计人数
    budget          VARCHAR(100),                       -- 预算（显示用，如 "5-10万"）
    understanding   TEXT,                               -- 需求理解（AI生成）
    status          VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft/internal_review/shared/viewed/downloaded/modified_by_client/revised/approved/converted_to_order/lost
    valid_until     TIMESTAMPTZ,                        -- 方案有效期
    created_by      UUID REFERENCES users(id),          -- 创建人（销售）
    consultant_name VARCHAR(100),                       -- 顾问姓名
    consultant_phone VARCHAR(20),                       -- 顾问电话
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_code ON proposals(code);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_name ON proposals(customer_name);
CREATE INDEX IF NOT EXISTS idx_proposals_valid_until ON proposals(valid_until);

COMMENT ON TABLE proposals IS '方案主表 — V4.7 AI提案中心核心表，从工具线索转化或直接创建';
COMMENT ON COLUMN proposals.code IS '方案编号，格式 YLF-YYYY-NNNN，如 YLF-2026-0042';
COMMENT ON COLUMN proposals.status IS 'draft→internal_review→shared→viewed→downloaded→modified_by_client→revised→approved→converted_to_order/lost';
COMMENT ON COLUMN proposals.understanding IS 'AI 生成的客户需求理解文本';
COMMENT ON COLUMN proposals.budget IS '预算范围字符串，如 "5-10万"、"10-30万"、"30万以上"，非精确数值';

-- --------------------------------------------------------------------------
-- 2. proposal_versions — 方案版本快照
--    每次编辑方案时创建版本快照，支持回溯
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    version         INT NOT NULL,                       -- 版本号（1-N 递增）
    snapshot        JSONB NOT NULL DEFAULT '{}'::JSONB, -- 当时方案的完整快照
    change_note     TEXT,                               -- 变更说明
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal_id ON proposal_versions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_version ON proposal_versions(proposal_id, version);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_created_at ON proposal_versions(created_at);

COMMENT ON TABLE proposal_versions IS '方案版本表 — 每次编辑方案时自动创建版本快照，可回溯历史';
COMMENT ON COLUMN proposal_versions.snapshot IS '方案完整 JSON 快照，包含当时所有模块内容、演员、案例等';
COMMENT ON COLUMN proposal_versions.change_note IS '变更说明，记录本次修改了什么';

-- --------------------------------------------------------------------------
-- 3. proposal_modules — 方案模块
--    方案按模块拆分存储，支持灵活编辑和 AI 局部重生成
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_modules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    module_type     VARCHAR(50) NOT NULL,               -- understanding/plan_structure/budget/performers/cases/service_notes
    sort_order      INT NOT NULL DEFAULT 0,             -- 排序
    content         JSONB NOT NULL DEFAULT '{}'::JSONB,  -- 模块内容（结构化JSON）
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_modules_proposal_id ON proposal_modules(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_modules_type ON proposal_modules(proposal_id, module_type);
CREATE INDEX IF NOT EXISTS idx_proposal_modules_sort ON proposal_modules(proposal_id, sort_order);

COMMENT ON TABLE proposal_modules IS '方案模块表 — 方案按模块拆分存储，支持独立编辑和AI局部重生成';
COMMENT ON COLUMN proposal_modules.module_type IS '模块类型：understanding=需求理解, plan_structure=方案结构, budget=预算, performers=推荐演员, cases=参考案例, service_notes=服务须知';
COMMENT ON COLUMN proposal_modules.content IS '模块内容 JSON，结构由 module_type 决定';

-- --------------------------------------------------------------------------
-- 4. leads — 工具线索
--    增长工具（预算计算器/保险方案/年会方案）提交后生成的线索
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_type           VARCHAR(30) NOT NULL,           -- budget_calculator/insurance_plan/annual_plan
    source_channel      VARCHAR(50),                    -- 来源渠道（wechat_h5/website/scan_qr等）
    source_user         VARCHAR(200),                   -- 来源用户标识
    answers             JSONB NOT NULL DEFAULT '{}'::JSONB, -- 结构化答案
    ai_result_summary   TEXT,                           -- AI 结果摘要
    ai_result_json      JSONB DEFAULT '{}'::JSONB,      -- AI 结果完整 JSON
    score               INT,                            -- 线索评分（1-100）
    priority            VARCHAR(10) NOT NULL DEFAULT 'medium', -- high/medium/low
    status              VARCHAR(20) NOT NULL DEFAULT 'new',     -- new/contacted/proposal_sent/viewed/won/lost
    assigned_to         UUID REFERENCES users(id),      -- 分配销售
    customer_name       VARCHAR(100),                   -- 客户姓名
    company             VARCHAR(200),                   -- 公司名称
    phone               VARCHAR(20),                    -- 手机号
    wechat              VARCHAR(50),                    -- 微信号（选填）
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_tool_type ON leads(tool_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

COMMENT ON TABLE leads IS '工具线索表 — V4.7 增长工具提交后生成的销售线索';
COMMENT ON COLUMN leads.tool_type IS '工具类型：budget_calculator=预算计算器, insurance_plan=保险行业方案, annual_plan=年会方案';
COMMENT ON COLUMN leads.answers IS '用户提交的结构化答案 JSON';
COMMENT ON COLUMN leads.score IS 'AI 线索评分 1-100，基于答案完整度、预算范围、紧急程度等';
COMMENT ON COLUMN leads.priority IS '线索优先级：high/medium/low';
COMMENT ON COLUMN leads.status IS 'new→contacted→proposal_sent→viewed→won/lost';

-- --------------------------------------------------------------------------
-- 5. tool_results — 工具结果
--    增长工具每次提交生成的结果，与线索关联
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    tool_type       VARCHAR(30) NOT NULL,               -- budget_calculator/insurance_plan/annual_plan
    result_json     JSONB NOT NULL DEFAULT '{}'::JSONB,  -- 工具计算结果
    ai_output       TEXT,                               -- AI 输出文本
    share_count     INT NOT NULL DEFAULT 0,             -- 分享次数
    download_count  INT NOT NULL DEFAULT 0,             -- 下载次数
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_results_lead_id ON tool_results(lead_id);
CREATE INDEX IF NOT EXISTS idx_tool_results_tool_type ON tool_results(tool_type);
CREATE INDEX IF NOT EXISTS idx_tool_results_created_at ON tool_results(created_at DESC);

COMMENT ON TABLE tool_results IS '工具结果表 — 增长工具每次提交的计算结果和AI输出';
COMMENT ON COLUMN tool_results.result_json IS '工具计算的结构化结果 JSON';
COMMENT ON COLUMN tool_results.ai_output IS 'AI 生成的建议/分析文本';

-- --------------------------------------------------------------------------
-- 6. talents — 演员/内容团队资料库
--    从 performers 概念升级，面向客户更友好的展示
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS talents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    role_type           VARCHAR(30) NOT NULL,               -- 脱口秀/即兴/主持/培训/魔术/乐队/其他
    tags                JSONB DEFAULT '[]'::JSONB,          -- 标签数组
    style               VARCHAR(200),                       -- 风格描述
    bio                 TEXT,                               -- 个人简介
    photos              JSONB DEFAULT '[]'::JSONB,          -- 照片URL数组
    videos              JSONB DEFAULT '[]'::JSONB,          -- 视频URL数组
    business_experience TEXT,                               -- 商演经验
    representative_cases JSONB DEFAULT '[]'::JSONB,         -- 代表案例ID数组
    base_price          DECIMAL(12,2),                      -- 内部成本价（对外不展示）
    display_price       DECIMAL(12,2),                      -- 对外参考价
    rating              DECIMAL(2,1) DEFAULT 0,             -- 综合评分（1.0-5.0）
    status              VARCHAR(20) NOT NULL DEFAULT 'active', -- active/inactive
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talents_role_type ON talents(role_type);
CREATE INDEX IF NOT EXISTS idx_talents_status ON talents(status);
CREATE INDEX IF NOT EXISTS idx_talents_rating ON talents(rating DESC);
CREATE INDEX IF NOT EXISTS idx_talents_tags ON talents USING GIN (tags);

COMMENT ON TABLE talents IS '演员/内容团队资料库 — V4.7 素材资产库核心表，面向客户展示';
COMMENT ON COLUMN talents.role_type IS '角色类型：脱口秀/即兴/主持/培训/魔术/乐队/其他';
COMMENT ON COLUMN talents.base_price IS '内部成本价，仅运营可见，对外API不返回此字段';
COMMENT ON COLUMN talents.display_price IS '对外参考价，面向客户展示用';

-- --------------------------------------------------------------------------
-- 7. venues — 场馆资源库
--    可推荐的场馆信息，用于方案中的场地建议
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    city                VARCHAR(50) NOT NULL,
    address             TEXT,
    capacity_min        INT,                               -- 最小容纳人数
    capacity_max        INT,                               -- 最大容纳人数
    images              JSONB DEFAULT '[]'::JSONB,          -- 场馆图片
    stage_equipment     TEXT,                               -- 舞台设备描述
    suitable_scenes     JSONB DEFAULT '[]'::JSONB,          -- 适用场景
    price_range         VARCHAR(50),                        -- 价格区间（如 "5-10万"）
    cooperation_status  VARCHAR(30) DEFAULT 'available',    -- available/cooperating/suspended
    status              VARCHAR(20) NOT NULL DEFAULT 'active', -- active/inactive
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(capacity_min, capacity_max);

COMMENT ON TABLE venues IS '场馆资源库 — V4.7 方案中可推荐的场馆信息';
COMMENT ON COLUMN venues.capacity_min IS '最小容纳人数';
COMMENT ON COLUMN venues.capacity_max IS '最大容纳人数';
COMMENT ON COLUMN venues.suitable_scenes IS '适用场景标签，如 ["企业年会", "产品发布", "客户答谢"]';

-- --------------------------------------------------------------------------
-- 8. case_studies — 案例库（V4.7升级版）
--    从 cases 表升级，补充行业/场景标签、效果描述、客户反馈
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_studies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200) NOT NULL,
    client_type         VARCHAR(50),                        -- 客户行业：互联网/金融/制造/零售/教育/医疗/政府
    event_scene         VARCHAR(50),                        -- 活动场景：企业年会/产品发布/客户答谢/开业庆典/团建
    headcount           INT,                                -- 参与人数
    budget_range        VARCHAR(50),                        -- 预算区间
    content_combo       TEXT,                               -- 内容组合（演员/节目搭配描述）
    effect_description  TEXT,                               -- 活动效果描述
    customer_feedback   TEXT,                               -- 客户反馈
    satisfaction        VARCHAR(20),                        -- 满意度：非常满意/满意/一般
    is_public           BOOLEAN NOT NULL DEFAULT TRUE,      -- 是否公开
    cover_image         TEXT,                               -- 封面图URL
    status              VARCHAR(20) NOT NULL DEFAULT 'published', -- draft/published/archived
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_studies_client_type ON case_studies(client_type);
CREATE INDEX IF NOT EXISTS idx_case_studies_event_scene ON case_studies(event_scene);
CREATE INDEX IF NOT EXISTS idx_case_studies_is_public ON case_studies(is_public);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies(status);

COMMENT ON TABLE case_studies IS '案例库 V4.7 升级版 — 补充行业/场景标签、效果描述、客户反馈';
COMMENT ON COLUMN case_studies.client_type IS '客户行业：互联网/金融/制造/零售/教育/医疗/政府';
COMMENT ON COLUMN case_studies.event_scene IS '活动场景：企业年会/产品发布/客户答谢/开业庆典/团建';
COMMENT ON COLUMN case_studies.satisfaction IS '客户满意度：非常满意/满意/一般';
