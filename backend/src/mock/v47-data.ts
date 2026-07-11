// ============================================================
// V4.7 Mock 数据 — 种子数据
// 用于 P0 阶段 API Mock 模式，不连接真实数据库
// ============================================================

export interface ToolResult {
  result_json: Record<string, unknown>;
  ai_output: string;
}

export interface MockToolResult extends ToolResult {
  id: string;
  lead_id: string | null;
  tool_type: string;
  source: 'ai' | 'fallback';
  share_count: number;
  download_count: number;
  created_at: string;
}

// ---- Tool Results Mock ----
export const mockToolResults: MockToolResult[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    lead_id: null,
    tool_type: 'budget_calculator',
    source: 'ai',
    result_json: {
      total_estimate: '8-12万',
      performer_fee: '3-5万',
      venue_fee: '2-3万',
      equipment_fee: '1-2万',
      other_fee: '2万',
      recommendation: '建议选择 T3-T4 级别脱口秀演员，搭配即兴团队互动环节',
    },
    ai_output: '根据您提供的200人企业年会需求，我们推荐以下方案：1-2位专业脱口秀演员（20分钟表演）+ 即兴喜剧互动环节（30分钟），预计总预算8-12万。该配置兼顾专业性与互动性，适合互联网行业氛围。',
    share_count: 12,
    download_count: 5,
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    lead_id: null,
    tool_type: 'insurance_plan',
    source: 'ai',
    result_json: {
      plan_type: '保险行业客户答谢会',
      recommended_combo: '脱口秀+魔术+主持',
      estimated_budget: '15-20万',
      duration: '90分钟',
      key_points: ['品牌定制段子', '互动抽奖环节', '高管致辞串场'],
    },
    ai_output: '针对保险行业客户答谢会（500人规模），推荐脱口秀+近景魔术+专业主持组合。建议加入品牌定制段子，将保险理念融入幽默表达，增强客户记忆点和品牌好感度。',
    share_count: 8,
    download_count: 3,
    created_at: '2026-07-02T14:30:00Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    lead_id: null,
    tool_type: 'annual_plan',
    source: 'ai',
    result_json: {
      theme: '科技公司年会',
      recommended_combo: '脱口秀+即兴+乐队+主持',
      estimated_budget: '20-30万',
      duration: '120分钟',
      schedule: [
        { segment: '暖场音乐', duration: '15分钟' },
        { segment: '脱口秀表演', duration: '25分钟' },
        { segment: '即兴互动', duration: '30分钟' },
        { segment: '乐队演奏', duration: '20分钟' },
        { segment: '颁奖/抽奖', duration: '30分钟' },
      ],
    },
    ai_output: '科技公司300人年会方案：脱口秀开场引爆气氛 → 即兴喜剧团队互动破冰 → 乐队演奏营造氛围 → 穿插颁奖环节。整体节奏紧凑，2小时完美呈现。',
    share_count: 15,
    download_count: 7,
    created_at: '2026-07-03T09:00:00Z',
  },
];

// ---- Leads Mock ----
export const mockLeads = [
  {
    id: 'b1c2d3e4-0001-4000-8000-000000000011',
    tool_type: 'budget_calculator',
    source_channel: 'wechat_h5',
    source_user: 'user_wechat_001',
    answers: { headcount: 200, industry: '互联网', event_type: '企业年会', city: '北京' },
    ai_result_summary: '推荐脱口秀+即兴组合，预算8-12万',
    ai_result_json: { combo: '脱口秀+即兴', budget: '8-12万' },
    score: 85,
    priority: 'high',
    status: 'new',
    assigned_to: 'e1f2a3b4-0001-4000-8000-0000000000a1',
    customer_name: '张总',
    company: '字节跳动',
    phone: '13800138001',
    wechat: 'zhangzong_wx',
    created_at: '2026-07-01T10:05:00Z',
    updated_at: '2026-07-01T10:05:00Z',
  },
  {
    id: 'b1c2d3e4-0002-4000-8000-000000000012',
    tool_type: 'insurance_plan',
    source_channel: 'website',
    source_user: null,
    answers: { headcount: 500, industry: '金融', event_type: '客户答谢', city: '上海' },
    ai_result_summary: '推荐脱口秀+魔术+主持，预算15-20万',
    ai_result_json: { combo: '脱口秀+魔术+主持', budget: '15-20万' },
    score: 72,
    priority: 'medium',
    status: 'contacted',
    assigned_to: null,
    customer_name: '李经理',
    company: '中国平安',
    phone: '13800138002',
    wechat: null,
    created_at: '2026-07-02T14:35:00Z',
    updated_at: '2026-07-03T09:00:00Z',
  },
  {
    id: 'b1c2d3e4-0003-4000-8000-000000000013',
    tool_type: 'annual_plan',
    source_channel: 'scan_qr',
    source_user: 'user_qr_003',
    answers: { headcount: 300, industry: '科技', event_type: '年会', city: '深圳' },
    ai_result_summary: '推荐脱口秀+即兴+乐队+主持，预算20-30万',
    ai_result_json: { combo: '脱口秀+即兴+乐队+主持', budget: '20-30万' },
    score: 90,
    priority: 'high',
    status: 'proposal_sent',
    assigned_to: 'e1f2a3b4-0001-4000-8000-0000000000a1',
    customer_name: '王总监',
    company: '腾讯科技',
    phone: '13800138003',
    wechat: 'wang_tx',
    created_at: '2026-07-03T09:05:00Z',
    updated_at: '2026-07-05T16:00:00Z',
  },
  {
    id: 'b1c2d3e4-0004-4000-8000-000000000014',
    tool_type: 'budget_calculator',
    source_channel: 'wechat_h5',
    source_user: 'user_wechat_004',
    answers: { headcount: 100, industry: '教育', event_type: '开业庆典', city: '杭州' },
    ai_result_summary: '推荐单人脱口秀+主持，预算5-8万',
    ai_result_json: { combo: '脱口秀+主持', budget: '5-8万' },
    score: 60,
    priority: 'low',
    status: 'new',
    assigned_to: null,
    customer_name: '赵校长',
    company: '学而思',
    phone: '13800138004',
    wechat: null,
    created_at: '2026-07-04T11:00:00Z',
    updated_at: '2026-07-04T11:00:00Z',
  },
];

// ---- Proposals Mock ----
export const mockProposals = [
  {
    id: 'c1d2e3f4-0001-4000-8000-000000000021',
    code: 'YLF-2026-0042',
    customer_name: '字节跳动',
    event_theme: '2026年度员工大会暨年会盛典',
    event_date: '2026-12-28',
    headcount: 200,
    budget: '8-12万',
    understanding: '字节跳动作为互联网头部企业，员工以90后/00后为主，追求新颖、互动性强的娱乐形式。本次年会需要在正式颁奖环节外，安排轻松幽默的表演内容，让员工在欢笑中感受公司文化。',
    status: 'shared',
    valid_until: '2026-08-01T00:00:00Z',
    created_by: 'e1f2a3b4-0001-4000-8000-0000000000a1',
    consultant_name: '陈顾问',
    consultant_phone: '13900139001',
    created_at: '2026-07-05T15:00:00Z',
    updated_at: '2026-07-06T10:00:00Z',
  },
  {
    id: 'c1d2e3f4-0002-4000-8000-000000000022',
    code: 'YLF-2026-0043',
    customer_name: '中国平安',
    event_theme: '2026 VIP客户答谢晚会',
    event_date: '2026-11-15',
    headcount: 500,
    budget: '15-20万',
    understanding: '保险行业客户答谢会需要兼顾品牌调性和娱乐性，既要展现专业形象，又要让客户感到被重视和愉悦。推荐脱口秀+魔术组合，定制品牌相关内容。',
    status: 'draft',
    valid_until: '2026-09-01T00:00:00Z',
    created_by: 'e1f2a3b4-0001-4000-8000-0000000000a1',
    consultant_name: '陈顾问',
    consultant_phone: '13900139001',
    created_at: '2026-07-06T09:00:00Z',
    updated_at: '2026-07-06T09:00:00Z',
  },
  {
    id: 'c1d2e3f4-0003-4000-8000-000000000023',
    code: 'YLF-2026-0044',
    customer_name: '腾讯科技',
    event_theme: '2026腾讯云合作伙伴大会晚宴',
    event_date: '2026-10-20',
    headcount: 300,
    budget: '20-30万',
    understanding: '合作伙伴大会需要展现腾讯的技术实力和生态开放性。晚宴环节安排脱口秀+即兴+乐队组合，营造轻松交流氛围，促进合作伙伴关系。',
    status: 'viewed',
    valid_until: '2026-08-15T00:00:00Z',
    created_by: 'e1f2a3b4-0001-4000-8000-0000000000a1',
    consultant_name: '陈顾问',
    consultant_phone: '13900139001',
    created_at: '2026-07-04T14:00:00Z',
    updated_at: '2026-07-07T08:00:00Z',
  },
];

// ---- Proposal Modules Mock ----
export const mockProposalModules = [
  {
    id: 'd1e2f3a4-0001-4000-8000-000000000031',
    proposal_id: 'c1d2e3f4-0001-4000-8000-000000000021',
    module_type: 'understanding',
    sort_order: 1,
    content: { text: '字节跳动2026年会需求分析：以"年轻、活力、创新"为主基调...' },
  },
  {
    id: 'd1e2f3a4-0002-4000-8000-000000000032',
    proposal_id: 'c1d2e3f4-0001-4000-8000-000000000021',
    module_type: 'plan_structure',
    sort_order: 2,
    content: {
      segments: [
        { name: '暖场+开场', duration: '15分钟', description: '主持人暖场，CEO致辞' },
        { name: '脱口秀表演', duration: '25分钟', description: '专业脱口秀演员表演，含企业定制段子' },
        { name: '即兴互动', duration: '30分钟', description: '即兴喜剧团队与员工互动游戏' },
        { name: '颁奖环节', duration: '40分钟', description: '穿插颁奖，营造轻松氛围' },
      ],
    },
  },
  {
    id: 'd1e2f3a4-0003-4000-8000-000000000033',
    proposal_id: 'c1d2e3f4-0001-4000-8000-000000000021',
    module_type: 'performers',
    sort_order: 3,
    content: {
      performers: [
        { talent_id: 'f1a2b3c4-0001-4000-8000-000000000041', role: '脱口秀主咖', name: '李诞风格演员A' },
        { talent_id: 'f1a2b3c4-0002-4000-8000-000000000042', role: '即兴团队', name: '开心麻花即兴团队' },
      ],
    },
  },
  {
    id: 'd1e2f3a4-0004-4000-8000-000000000034',
    proposal_id: 'c1d2e3f4-0001-4000-8000-000000000021',
    module_type: 'budget',
    sort_order: 4,
    content: {
      total_estimate: '8-12万',
      items: [
        { name: '脱口秀演员费用', amount: '3-5万' },
        { name: '即兴团队费用', amount: '2-3万' },
        { name: '主持人费用', amount: '0.5-1万' },
        { name: '定制段子创作', amount: '1万' },
        { name: '差旅/其他', amount: '1.5-2万' },
      ],
    },
  },
];

// ---- Talents Mock ----
export const mockTalents = [
  {
    id: 'f1a2b3c4-0001-4000-8000-000000000041',
    name: '周奇墨（风格相似演员）',
    role_type: '脱口秀',
    tags: ['观察式喜剧', '企业定制', '互动性强', '全场掌控'],
    style: '以细腻的生活观察和犀利的吐槽闻名，擅长将企业文化和职场趣事融入段子',
    bio: '从业8年，累计演出超过1000场。曾为阿里、腾讯、字节、华为等头部企业提供年会表演。段子风格幽默不失深度，能让不同年龄段观众都找到共鸣。',
    photos: ['https://picsum.photos/seed/talent1/400/300', 'https://picsum.photos/seed/talent1b/400/300'],
    videos: ['https://example.com/videos/talent1_showreel.mp4'],
    business_experience: '服务过50+企业客户，包括阿里、腾讯、字节、平安、招商银行等。擅长根据企业文化和活动主题定制专属段子。',
    representative_cases: ['字节跳动2025年会', '腾讯云合作伙伴大会', '招商银行客户答谢会'],
    base_price: 30000,
    display_price: 50000,
    rating: 4.8,
    status: 'active',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0002-4000-8000-000000000042',
    name: '开心麻花即兴团队',
    role_type: '即兴',
    tags: ['即兴喜剧', '团队互动', '破冰游戏', '企业团建'],
    style: '开心麻花旗下专业即兴团队，擅长将观众提供的关键词即兴创作喜剧场景',
    bio: '开心麻花即兴团队由6-8位专业即兴演员组成，拥有丰富的企业活动经验。即兴表演形式灵活，可根据企业文化、产品特点定制互动环节。',
    photos: ['https://picsum.photos/seed/talent2/400/300', 'https://picsum.photos/seed/talent2b/400/300'],
    videos: ['https://example.com/videos/talent2_showreel.mp4'],
    business_experience: '服务过100+企业活动，即兴互动环节好评率98%。曾获"最佳企业活动互动团队"称号。',
    representative_cases: ['华为开发者大会', '阿里云峰会晚宴', '美团年度盛典'],
    base_price: 50000,
    display_price: 80000,
    rating: 4.9,
    status: 'active',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0003-4000-8000-000000000043',
    name: '刘旸教主（风格相似演员）',
    role_type: '脱口秀',
    tags: ['观点犀利', '知识型脱口秀', '互联网行业', '中英双语'],
    style: '知识型脱口秀演员，以犀利观点和逻辑笑话著称，适合互联网/科技行业活动',
    bio: '前互联网大厂产品经理转型脱口秀演员，对科技行业有深刻理解。擅长将产品思维、互联网黑话融入表演，让科技从业者会心一笑。中英双语能力，适合国际性企业活动。',
    photos: ['https://picsum.photos/seed/talent3/400/300'],
    videos: [],
    business_experience: '服务过Google、微软、字节跳动、快手等科技企业活动，深受程序员和产品经理群体喜爱。',
    representative_cases: ['Google DevFest', '微软Ignite中国', '字节跳动产品经理大会'],
    base_price: 25000,
    display_price: 40000,
    rating: 4.7,
    status: 'active',
    created_at: '2026-06-15T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0004-4000-8000-000000000044',
    name: '近景魔术师Mark',
    role_type: '魔术',
    tags: ['近景魔术', '互动魔术', '品牌植入', '高端晚宴'],
    style: '国际获奖近景魔术师，擅长将品牌元素融入魔术表演，创造独特记忆点',
    bio: 'IMS国际魔术师协会会员，曾获亚洲近景魔术大赛金奖。独创"品牌魔术"概念，可将企业产品、logo、slogan融入魔术表演，让品牌信息在惊叹中自然传递。',
    photos: ['https://picsum.photos/seed/talent4/400/300'],
    videos: ['https://example.com/videos/talent4_showreel.mp4'],
    business_experience: '服务过LV、奔驰、保时捷、招商银行等高端品牌活动。近景魔术适合圆桌晚宴、VIP答谢会等场景。',
    representative_cases: ['LV新品发布会', '保时捷车主答谢晚宴', '招商银行私人银行活动'],
    base_price: 20000,
    display_price: 35000,
    rating: 4.9,
    status: 'active',
    created_at: '2026-06-20T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0005-4000-8000-000000000045',
    name: '专业主持人小林',
    role_type: '主持',
    tags: ['双语主持', '大型活动', '灵活控场', '幽默互动'],
    style: '拥有10年大型活动主持经验，双语主持能力，擅长即兴互动和现场氛围调动',
    bio: '前央视主持人，主持过500+场大型企业活动。控场能力极强，能够灵活应对各种突发情况，将尴尬转化为笑点。',
    photos: ['https://picsum.photos/seed/talent5/400/300'],
    videos: [],
    business_experience: '服务过阿里巴巴、腾讯、百度、京东等互联网企业年会，以及众多500强企业的品牌活动。',
    representative_cases: ['阿里双十一晚会', '腾讯年会', '百度AI开发者大会'],
    base_price: 8000,
    display_price: 15000,
    rating: 4.6,
    status: 'active',
    created_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0006-4000-8000-000000000046',
    name: '双拍漫才组合',
    role_type: '漫才',
    tags: ['双人漫才', '节奏密集', '职场吐槽', '年轻团队'],
    style: '一逗一捧的快节奏双人喜剧，适合把企业内部黑话和项目故事改编成轻松段子',
    bio: '由两位线下剧场常驻演员组成，长期服务互联网、快消和金融客户。可在30分钟内完成高密度笑点输出，也能配合主持完成串场互动。',
    photos: ['https://picsum.photos/seed/talent6/400/300', 'https://picsum.photos/seed/talent6b/400/300'],
    videos: ['https://example.com/videos/talent6_showreel.mp4'],
    business_experience: '服务过30+企业年会和团队日活动，擅长会前访谈后进行定制化包袱改写。',
    representative_cases: ['美团产品团队年会', '小红书品牌中心团建', '浦发银行青年员工日'],
    base_price: 18000,
    display_price: 30000,
    rating: 4.7,
    status: 'active',
    created_at: '2026-07-08T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0007-4000-8000-000000000047',
    name: '亲子喜剧演员安安',
    role_type: '亲子喜剧',
    tags: ['亲子互动', '家庭日', '轻松温暖', '儿童友好'],
    style: '用家庭生活观察和即兴问答带动家长与孩子同场参与，笑点温和且安全',
    bio: '专注亲子场景表演6年，熟悉企业家庭日、亲子嘉年华和教育品牌活动。能够根据儿童年龄段调整互动难度，兼顾家长参与感和现场秩序。',
    photos: ['https://picsum.photos/seed/talent7/400/300'],
    videos: [],
    business_experience: '服务过多场企业家庭日和教育品牌开放日，擅长与儿童观众保持自然互动。',
    representative_cases: ['万科业主家庭日', '好未来亲子开放日', '招商银行家庭客户活动'],
    base_price: 12000,
    display_price: 22000,
    rating: 4.8,
    status: 'active',
    created_at: '2026-07-08T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0008-4000-8000-000000000048',
    name: '企业培训师陈越',
    role_type: '培训师',
    tags: ['表达力培训', '管理沟通', '销售赋能', '喜剧工作坊'],
    style: '把脱口秀创作方法拆解为表达训练，适合管理层沟通、销售破冰和团队共创',
    bio: '前咨询顾问，后转型企业表达力培训师。课程以案例拆解、现场演练和即兴反馈为主，能将娱乐环节转化为可沉淀的团队学习内容。',
    photos: ['https://picsum.photos/seed/talent8/400/300'],
    videos: ['https://example.com/videos/talent8_workshop.mp4'],
    business_experience: '为金融、医疗、制造行业提供过沟通表达与客户经营培训，累计交付200+场工作坊。',
    representative_cases: ['太平洋保险销售训练营', '迈瑞医疗管理者沟通课', '三一重工区域经理训练营'],
    base_price: 22000,
    display_price: 38000,
    rating: 4.8,
    status: 'active',
    created_at: '2026-07-08T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0009-4000-8000-000000000049',
    name: '舞台魔术师Leo',
    role_type: '魔术',
    tags: ['舞台魔术', '大型幻术', '新品发布', '视觉记忆点'],
    style: '偏舞台视觉冲击的大型魔术，可结合产品揭幕、领导登场和抽奖环节设计效果',
    bio: '拥有大型舞台魔术和商业发布会经验，团队自带核心道具，可根据场地尺寸调整表演方案。适合品牌盛典、汽车发布和大型年会。',
    photos: ['https://picsum.photos/seed/talent9/400/300', 'https://picsum.photos/seed/talent9b/400/300'],
    videos: ['https://example.com/videos/talent9_showreel.mp4'],
    business_experience: '服务过汽车、地产、快消品牌活动，擅长用魔术完成产品亮相和品牌信息记忆点设计。',
    representative_cases: ['比亚迪区域发布会', '华润置地业主答谢', '元气森林新品路演'],
    base_price: 35000,
    display_price: 60000,
    rating: 4.9,
    status: 'active',
    created_at: '2026-07-08T00:00:00Z',
  },
  {
    id: 'f1a2b3c4-0010-4000-8000-000000000050',
    name: '霓虹节拍乐队',
    role_type: '乐队',
    tags: ['现场乐队', '暖场音乐', '颁奖串场', '可定制歌单'],
    style: '四人流行爵士编制，可做暖场、颁奖串场和晚宴驻场，氛围轻松不喧宾夺主',
    bio: '由主唱、键盘、吉他和鼓手组成，常年服务企业晚宴和品牌活动。支持中英文歌单、企业主题曲改编和领导登场音乐设计。',
    photos: ['https://picsum.photos/seed/talent10/400/300'],
    videos: ['https://example.com/videos/talent10_live.mp4'],
    business_experience: '累计服务80+企业晚宴、客户答谢和颁奖典礼，能与主持和喜剧节目顺畅衔接。',
    representative_cases: ['腾讯云合作伙伴晚宴', '绿地集团客户酒会', '联合利华经销商大会'],
    base_price: 28000,
    display_price: 45000,
    rating: 4.7,
    status: 'active',
    created_at: '2026-07-08T00:00:00Z',
  },
];

// ---- Venues Mock ----
export const mockVenues = [
  {
    id: 'e1f2a3b4-0001-4000-8000-000000000051',
    name: '北京国家会议中心 · 多功能厅',
    city: '北京',
    address: '北京市朝阳区天辰东路7号',
    capacity_min: 200,
    capacity_max: 800,
    images: ['https://picsum.photos/seed/venue1/600/400', 'https://picsum.photos/seed/venue1b/600/400'],
    stage_equipment: '专业灯光音响系统、LED大屏（16:9）、升降舞台、线阵音响、双无线手持、耳返、导播台',
    suitable_scenes: ['企业年会', '产品发布', '行业峰会', '客户答谢', '大型脱口秀专场'],
    stage_specs: { stage_width: '18m', stage_depth: '8m', led_screen: 'P2.5主屏+返看屏', backstage_rooms: 6 },
    equipment_list: ['线阵音响', '电脑灯', '追光灯', '升降舞台', '无线麦克风', '导播切换台'],
    scene_fit_notes: '适合300人以上正式会议和年会，可承接复杂灯光、LED和多节目串联。',
    price_range: '5-8万',
    cooperation_status: 'cooperating',
    status: 'active',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'e1f2a3b4-0002-4000-8000-000000000052',
    name: '上海世博中心 · 银厅',
    city: '上海',
    address: '上海市浦东新区世博大道1500号',
    capacity_min: 300,
    capacity_max: 1200,
    images: ['https://picsum.photos/seed/venue2/600/400'],
    stage_equipment: '顶级灯光音响、超大LED屏、旋转舞台、同声传译系统、主备控台、直播推流接口',
    suitable_scenes: ['大型年会', '品牌盛典', '国际会议', '颁奖典礼', '高端客户晚宴'],
    stage_specs: { stage_width: '24m', stage_depth: '10m', led_screen: 'P2主屏+两侧副屏', backstage_rooms: 8 },
    equipment_list: ['旋转舞台', '同传系统', '直播推流', '线阵音响', '矩阵切换', '舞美吊点'],
    scene_fit_notes: '适合品牌发布、国际会议和千人级晚宴，对直播、同传和舞美需求支持完整。',
    price_range: '8-15万',
    cooperation_status: 'cooperating',
    status: 'active',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'e1f2a3b4-0003-4000-8000-000000000053',
    name: '深圳湾体育中心 · 春茧多功能厅',
    city: '深圳',
    address: '深圳市南山区滨海大道3001号',
    capacity_min: 150,
    capacity_max: 600,
    images: ['https://picsum.photos/seed/venue3/600/400'],
    stage_equipment: '标准舞台灯光音响、投影系统、基础舞台搭建、移动LED屏、4路无线麦',
    suitable_scenes: ['企业年会', '团建活动', '开业庆典', '中小型发布会', '员工家庭日'],
    stage_specs: { stage_width: '12m', stage_depth: '6m', led_screen: '移动LED或高清投影', backstage_rooms: 3 },
    equipment_list: ['基础灯架', '全频音箱', '移动LED屏', '投影系统', '无线麦克风', '签到区电源'],
    scene_fit_notes: '适合150-600人轻量活动，搭建成本可控，便于喜剧、乐队和团建互动快速落地。',
    price_range: '3-6万',
    cooperation_status: 'available',
    status: 'active',
    created_at: '2026-06-15T00:00:00Z',
  },
];

// ---- Case Studies Mock ----
export const mockCaseStudies = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000061',
    title: '字节跳动2025年会 · 脱口秀+即兴喜剧',
    client_type: '互联网',
    event_scene: '企业年会',
    headcount: 300,
    budget_range: '10-15万',
    content_combo: '脱口秀主咖（25分钟）+ 即兴喜剧团队互动（30分钟）+ 专业主持',
    effect_description: '年会气氛达到历年最佳，员工满意度调查显示娱乐环节评分9.2/10。脱口秀演员将字节文化（Always Day 1、字节范儿等）巧妙融入段子，引发全场共鸣和笑声。即兴互动环节参与度极高，CEO亲自上台配合表演。',
    customer_feedback: '非常满意！年会效果超出预期，员工的反馈非常好。尤其是将公司文化融入表演这一点，让娱乐有了更深层的意义。明年年会还会继续合作。',
    satisfaction: '非常满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case1/800/400',
    status: 'published',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000062',
    title: '平安保险VIP客户答谢会 · 魔术+脱口秀',
    client_type: '保险',
    event_scene: '客户答谢',
    headcount: 200,
    budget_range: '15-20万',
    content_combo: '近景魔术师巡回表演（桌边魔术）+ 脱口秀表演（20分钟）+ 主持串场',
    effect_description: 'VIP客户对近景魔术环节赞不绝口，魔术师将"平安"品牌元素融入表演，让客户在惊叹中加深品牌印象。会后调研显示客户满意度96%，NPS净推荐值提升15个百分点。',
    customer_feedback: '非常满意！魔术环节是本次答谢会的最大亮点，很多客户事后还在讨论。品牌植入自然不生硬，这个创意非常好。',
    satisfaction: '非常满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case2/800/400',
    status: 'published',
    created_at: '2026-06-10T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000063',
    title: '招商银行财富论坛晚宴 · 脱口秀+乐队',
    client_type: '金融',
    event_scene: '客户答谢',
    headcount: 500,
    budget_range: '20-25万',
    content_combo: '知识型脱口秀（20分钟）+ 乐队演奏（30分钟）+ 即兴互动（20分钟）+ 双语主持',
    effect_description: '脱口秀演员围绕财富管理、长期主义和客户服务创作定制内容，让严肃金融主题变得轻松易懂。乐队演奏为晚宴营造了高雅的社交氛围，即兴互动环节帮助客户经理与高净值客户自然破冰。',
    customer_feedback: '满意。脱口秀的内容创意很好，但时间有点短，明年可以增加到30分钟。整体效果达到了预期。',
    satisfaction: '满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case3/800/400',
    status: 'published',
    created_at: '2026-06-20T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000064',
    title: '学而思全国校长大会 · 脱口秀+培训互动',
    client_type: '教育',
    event_scene: '开业庆典',
    headcount: 150,
    budget_range: '5-8万',
    content_combo: '脱口秀演员（20分钟）+ 即兴培训互动（40分钟）+ 主持',
    effect_description: '将"创新教育"理念融入脱口秀内容，引发校长们的强烈共鸣。即兴培训互动环节巧妙地展示了"互动式教学"的魅力，与学而思的教育理念高度契合。',
    customer_feedback: '非常满意！没想到脱口秀还能和教育培训结合得这么好。校长们反馈说这是最有收获的一次大会，既有娱乐性又有启发性。',
    satisfaction: '非常满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case4/800/400',
    status: 'published',
    created_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000065',
    title: '某车企经销商大会 · 魔术+脱口秀+乐队',
    client_type: '汽车',
    event_scene: '企业年会',
    headcount: 400,
    budget_range: '15-18万',
    content_combo: '近景魔术（桌边互动）+ 脱口秀（20分钟）+ 爵士乐队（30分钟）+ 主持',
    effect_description: '魔术师将新车元素融入魔术表演，制造了多个"Wow Moment"。脱口秀内容围绕"销售那些事"展开，经销商们笑声不断。爵士乐队为晚宴增添了高级感。',
    customer_feedback: '满意。整体氛围很好，但魔术环节的桌边表演覆盖不够全面，建议明年增加魔术师数量。',
    satisfaction: '满意',
    is_public: false,
    cover_image: 'https://picsum.photos/seed/case5/800/400',
    status: 'published',
    created_at: '2026-07-05T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0006-4000-8000-000000000066',
    title: '绿地集团业主答谢夜 · 漫才+魔术',
    client_type: '地产',
    event_scene: '客户答谢',
    headcount: 260,
    budget_range: '12-16万',
    content_combo: '双人漫才（25分钟）+ 舞台魔术产品揭幕（15分钟）+ 乐队暖场',
    effect_description: '漫才组合围绕购房、物业和社区生活进行轻松改编，拉近业主与品牌距离。魔术环节用于新项目视觉揭幕，现场传播素材完整。',
    customer_feedback: '非常满意。整体比传统答谢宴更有记忆点，业主参与度明显提升。',
    satisfaction: '非常满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case6/800/400',
    status: 'published',
    created_at: '2026-07-06T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0007-4000-8000-000000000067',
    title: '联合利华经销商大会 · 乐队+脱口秀',
    client_type: '快消',
    event_scene: '经销商大会',
    headcount: 350,
    budget_range: '10-14万',
    content_combo: '定制脱口秀（20分钟）+ 现场乐队（35分钟）+ 主持串场',
    effect_description: '脱口秀内容结合渠道销售、门店陈列和新品推广痛点，让经销商在轻松氛围中理解年度策略。乐队承担晚宴暖场和颁奖串场，节奏稳定。',
    customer_feedback: '满意。节目和业务主题结合得比较自然，现场没有冷场。',
    satisfaction: '满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case7/800/400',
    status: 'published',
    created_at: '2026-07-06T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0008-4000-8000-000000000068',
    title: '瑞金医院青年医师减压专场 · 脱口秀+工作坊',
    client_type: '医疗',
    event_scene: '员工关怀',
    headcount: 120,
    budget_range: '6-9万',
    content_combo: '医疗行业定制脱口秀（25分钟）+ 喜剧表达工作坊（45分钟）+ 主持',
    effect_description: '内容围绕夜班、医患沟通和青年医师成长压力展开，边界安全且共鸣强。工作坊帮助团队用幽默方式表达压力，现场反馈积极。',
    customer_feedback: '非常满意。既减压又有团队沟通价值，内容尺度把握得很好。',
    satisfaction: '非常满意',
    is_public: false,
    cover_image: 'https://picsum.photos/seed/case8/800/400',
    status: 'published',
    created_at: '2026-07-07T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0009-4000-8000-000000000069',
    title: '某区文旅推介会 · 主持+亲子喜剧',
    client_type: '政府',
    event_scene: '城市推介',
    headcount: 180,
    budget_range: '8-12万',
    content_combo: '专业主持（全程）+ 亲子喜剧互动（30分钟）+ 城市故事脱口秀（15分钟）',
    effect_description: '亲子喜剧将城市文化、亲子路线和周末消费场景自然串联，适合政企嘉宾和家庭观众共同参与。主持串联保证流程正式感。',
    customer_feedback: '满意。活动既有传播点也保持了政府活动的稳重调性。',
    satisfaction: '满意',
    is_public: true,
    cover_image: 'https://picsum.photos/seed/case9/800/400',
    status: 'published',
    created_at: '2026-07-07T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-0010-4000-8000-000000000070',
    title: '三一重工销售训练营 · 企业培训+即兴互动',
    client_type: '制造',
    event_scene: '销售培训',
    headcount: 90,
    budget_range: '7-10万',
    content_combo: '企业表达力培训（60分钟）+ 即兴销售场景演练（40分钟）+ 脱口秀收尾',
    effect_description: '培训师将销售拜访、客户异议和跨部门协同拆成可演练场景，即兴互动提升参与度。脱口秀收尾帮助学员释放培训疲劳。',
    customer_feedback: '非常满意。比传统培训更容易让一线销售投入，课后复盘材料也能继续使用。',
    satisfaction: '非常满意',
    is_public: false,
    cover_image: 'https://picsum.photos/seed/case10/800/400',
    status: 'published',
    created_at: '2026-07-08T00:00:00Z',
  },
];

// ============================================================
// 生成方案编号工具函数
// ============================================================
export function generateProposalCode(sequence: number, year: number = new Date().getFullYear()): string {
  return `YLF-${year}-${String(sequence).padStart(4, '0')}`;
}

// ============================================================
// AI 工具结果生成（Mock 模板）
// ============================================================
function answerText(answers: Record<string, string>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = answers[key];
    if (value && value.trim()) return value.trim();
  }
  return fallback;
}

function answerNumber(answers: Record<string, string>, keys: string[], fallback = 0): number {
  const raw = answerText(answers, keys);
  const matched = raw.match(/\d+/);
  return matched ? Number(matched[0]) : fallback;
}

// 根据 tool_type + 关键答案字段返回预置兜底结果
export function getFallbackResult(toolType: string, answers: Record<string, string>): ToolResult {
  const headcount = answerNumber(answers, ['headcount', '人数', 'attendee_count', 'people_count'], 100);
  const industry = answerText(answers, ['industry', '行业'], '通用行业');
  const eventType = answerText(answers, ['event_type', '场景', 'activity_type', 'eventScene'], '企业活动');
  const audience = answerText(answers, ['audience', '人群', 'target_audience'], '');

  const templates: Record<string, ToolResult[]> = {
    budget_calculator: [
      {
        result_json: {
          template_key: 'budget_low_50',
          headcount_range: '50人以内',
          total_estimate: '3-5万',
          recommended_combo: ['单人脱口秀', '轻量主持'],
          breakdown: [
            { item: '演员费用', range: '1.5-2.5万', note: 'T3-T4脱口秀演员，20分钟表演' },
            { item: '设备费用', range: '0.5-1万', note: '基础音响和无线麦' },
            { item: '内容定制', range: '0.5-1万', note: '企业关键词和行业段子轻定制' },
            { item: '执行杂费', range: '0.5万', note: '差旅、联排和主持串场' },
          ],
          recommendation: '适合小型客户沙龙、团队日或部门团建，优先保证内容定制和现场互动。',
        },
        ai_output: `兜底预算建议：${industry}${eventType}按50人以内配置，推荐单人脱口秀+轻量主持，预算约3-5万。`,
      },
      {
        result_json: {
          template_key: 'budget_mid_150',
          headcount_range: '80-150人',
          total_estimate: '8-12万',
          recommended_combo: ['脱口秀主咖', '即兴互动团队', '专业主持'],
          breakdown: [
            { item: '演员费用', range: '3-5万', note: '脱口秀主咖或成熟商演演员' },
            { item: '互动团队', range: '2-3万', note: '即兴互动或漫才组合' },
            { item: '设备费用', range: '1-2万', note: '灯光音响和基础LED' },
            { item: '内容定制/执行', range: '2万', note: '访谈、脚本、联排和差旅' },
          ],
          recommendation: '适合中型年会、客户答谢和渠道活动，建议用互动节目提高留存和分享。',
        },
        ai_output: `兜底预算建议：${industry}${eventType}按150人左右配置，推荐脱口秀+即兴互动+主持，预算约8-12万。`,
      },
      {
        result_json: {
          template_key: 'budget_high_300',
          headcount_range: '300人左右',
          total_estimate: '18-28万',
          recommended_combo: ['脱口秀主咖', '即兴喜剧团队', '乐队', '双语主持'],
          breakdown: [
            { item: '核心演员费用', range: '6-10万', note: '主咖演员或高成熟度团队' },
            { item: '乐队/互动节目', range: '5-8万', note: '乐队、魔术或即兴组合二选一到二选二' },
            { item: '舞美设备', range: '4-6万', note: 'LED、灯光、音响、导播和技术执行' },
            { item: '内容制作/执行', range: '3-4万', note: '深度访谈、脚本、彩排和统筹' },
          ],
          recommendation: '适合大型年会、品牌盛典和发布晚宴，建议做完整节目编排和舞美节奏设计。',
        },
        ai_output: `兜底预算建议：${industry}${eventType}按300人左右配置，推荐脱口秀+互动团队+乐队+主持，预算约18-28万。`,
      },
    ],
    insurance_plan: [
      {
        result_json: {
          template_key: 'insurance_customer_30_80',
          plan_type: '保险客户经营小场',
          headcount_range: '30-80人',
          recommended_combo: ['近景魔术', '保险主题脱口秀', '轻主持'],
          estimated_budget: '5-8万',
          duration: '60-75分钟',
          key_features: ['桌边互动增强客户关系', '保障理念轻量植入', '抽奖和顾问介绍自然串联'],
        },
        ai_output: `兜底方案：${headcount || 60}人保险客户经营活动，建议近景魔术+保险主题脱口秀，预算约5-8万。`,
      },
      {
        result_json: {
          template_key: 'insurance_product_80_150',
          plan_type: '保险产说会转化场',
          headcount_range: '80-150人',
          recommended_combo: ['定制脱口秀', '舞台魔术', '专业主持'],
          estimated_budget: '10-15万',
          duration: '90分钟',
          key_features: ['产品价值幽默化表达', '魔术完成产品记忆点', '主持承接讲师和转化环节'],
        },
        ai_output: '兜底方案：保险产说会建议定制脱口秀+舞台魔术+主持，把产品讲解和娱乐记忆点结合，预算约10-15万。',
      },
      {
        result_json: {
          template_key: 'insurance_recruit_under_30',
          plan_type: '保险增员小型场',
          headcount_range: '30人以内',
          recommended_combo: ['表达力培训师', '轻脱口秀开场', '互动问答'],
          estimated_budget: '3-6万',
          duration: '60分钟',
          key_features: ['降低新人陌生感', '用真实销售场景互动', '便于后续顾问跟进'],
        },
        ai_output: '兜底方案：保险增员30人以内建议表达力培训+轻脱口秀开场，预算约3-6万，重点提升信任和互动。',
      },
    ],
    annual_plan: [
      {
        result_json: {
          template_key: 'annual_150_300',
          plan_type: '企业年会标准场',
          headcount_range: '150-300人',
          recommended_combo: ['脱口秀', '即兴互动', '乐队', '主持'],
          estimated_budget: '15-25万',
          duration: '120分钟',
          schedule: [
            { time: '0-15min', segment: '乐队暖场+主持开场' },
            { time: '15-40min', segment: '企业定制脱口秀' },
            { time: '40-70min', segment: '即兴互动和颁奖串场' },
            { time: '70-110min', segment: '乐队演出+抽奖' },
            { time: '110-120min', segment: '合影和收尾' },
          ],
        },
        ai_output: '兜底年会方案：150-300人建议脱口秀+即兴互动+乐队+主持，控制在2小时内完成完整节奏。',
      },
      {
        result_json: {
          template_key: 'annual_team_building_30_80',
          plan_type: '团建轻量互动场',
          headcount_range: '30-80人',
          recommended_combo: ['漫才组合', '即兴游戏', '主持'],
          estimated_budget: '4-8万',
          duration: '75分钟',
          schedule: [
            { time: '0-10min', segment: '主持破冰' },
            { time: '10-35min', segment: '漫才组合表演' },
            { time: '35-65min', segment: '即兴游戏和团队共创' },
            { time: '65-75min', segment: '颁奖/合影' },
          ],
        },
        ai_output: '兜底团建方案：30-80人建议漫才+即兴游戏，预算约4-8万，适合低门槛参与和快速破冰。',
      },
      {
        result_json: {
          template_key: 'annual_genz_stress_relief',
          plan_type: '95后减压专场',
          headcount_range: '80-200人',
          recommended_combo: ['年轻脱口秀演员', '乐队', '匿名吐槽互动'],
          estimated_budget: '8-15万',
          duration: '90分钟',
          schedule: [
            { time: '0-15min', segment: '乐队轻暖场' },
            { time: '15-45min', segment: '职场减压脱口秀' },
            { time: '45-70min', segment: '匿名吐槽即兴互动' },
            { time: '70-90min', segment: '合唱/抽奖/收尾' },
          ],
          audience_hint: audience || '95后/00后员工',
        },
        ai_output: '兜底减压方案：面向95后员工建议年轻脱口秀+匿名吐槽互动+乐队，重点释放压力并保留团队温度。',
      },
    ],
  };

  const candidates = templates[toolType];
  if (!candidates) {
    return {
      result_json: { message: '未知工具类型', source: 'fallback' },
      ai_output: 'AI服务暂不可用，且工具类型无法匹配兜底模板，请重新选择工具。',
    };
  }

  if (toolType === 'budget_calculator') {
    if (headcount <= 80) return candidates[0];
    if (headcount <= 200) return candidates[1];
    return candidates[2];
  }

  if (toolType === 'insurance_plan') {
    if (eventType.includes('增员') || headcount <= 30) return candidates[2];
    if (eventType.includes('产说') || headcount >= 80) return candidates[1];
    return candidates[0];
  }

  if (eventType.includes('团建') || headcount <= 80) return candidates[1];
  if (audience.includes('95') || audience.includes('00') || eventType.includes('减压')) return candidates[2];
  return candidates[0];
}

export function generateToolResult(toolType: string, answers: Record<string, unknown>): ToolResult {
  const templates: Record<string, () => ToolResult> = {
    budget_calculator: () => ({
      result_json: {
        headcount: answers.headcount || '未知',
        industry: answers.industry || '通用',
        total_estimate: '8-12万',
        breakdown: [
          { item: '演员费用', range: '3-5万', note: '根据人数和咖位浮动' },
          { item: '场地费用', range: '2-3万', note: '参考市场均价' },
          { item: '设备费用', range: '1-2万', note: '灯光音响LED屏' },
          { item: '其他费用', range: '2万', note: '差旅/主持/定制' },
        ],
        recommendation: '脱口秀+即兴喜剧组合',
      },
      ai_output: `根据您提供的${answers.headcount || '未知'}人${answers.industry || ''}行业活动需求，我们推荐脱口秀+即兴喜剧组合方案。预估总预算8-12万，具体费用将根据实际需求调整。`,
    }),
    insurance_plan: () => ({
      result_json: {
        plan_type: '保险行业客户答谢方案',
        recommended_combo: ['脱口秀表演', '近景魔术', '专业主持'],
        estimated_budget: '15-20万',
        duration: '90分钟',
        key_features: ['品牌定制段子', '互动抽奖串场', '桌边魔术体验'],
      },
      ai_output: '针对保险行业客户答谢会场景，推荐脱口秀+近景魔术+主持组合。品牌定制段子可将保险理念自然融入，桌边魔术为VIP客户创造独特体验。',
    }),
    annual_plan: () => ({
      result_json: {
        plan_type: '企业年会全案',
        recommended_combo: ['脱口秀', '即兴喜剧', '乐队演奏', '主持'],
        estimated_budget: '20-30万',
        duration: '120分钟',
        schedule: [
          { time: '0-15min', segment: '暖场音乐+主持人开场' },
          { time: '15-40min', segment: '脱口秀表演' },
          { time: '40-70min', segment: '即兴喜剧互动' },
          { time: '70-100min', segment: '乐队演奏+自由交流' },
          { time: '100-120min', segment: '颁奖/抽奖/合影' },
        ],
      },
      ai_output: '企业年会全案推荐脱口秀开场→即兴互动→乐队演奏→颁奖收尾的四段式流程，时长120分钟，节奏紧凑流畅。',
    }),
  };

  const generator = templates[toolType];
  if (generator) {
    return generator();
  }

  return {
    result_json: { message: '未知工具类型' },
    ai_output: '无法生成AI建议，请选择正确的工具类型。',
  };
}
