// ============================================================
// 演出撮合平台 · 统一类型定义
// 严格对齐 docs/API_CONTRACT.md v1.0
// ============================================================

// ---- 通用基础类型 ----

/** 用户角色 */
export type UserRole = 'client' | 'agent' | 'performer' | 'admin';

/** 运营子角色（RBAC） */
export type AdminRole = 'super_admin' | 'operator' | 'finance' | 'content_editor';

/** 5 条业务线 */
export type BusinessLine =
  | 'venue_booking'
  | 'outdoor_show'
  | 'show_sponsor'
  | 'custom_content'
  | 'custom_showcase';

/** 演员咖位 T0-T6 */
export type PerformerTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

/** 信誉等级 S/A/B/C/D */
export type CreditLevel = 'S' | 'A' | 'B' | 'C' | 'D';

/** 需求状态（14 正常 + 2 异常） */
export type DemandStatus =
  | 'pending_ai'
  | 'ai_generated'
  | 'pending_operator'
  | 'operator_adjusted'
  | 'pending_client_confirm'
  | 'confirmed'
  | 'pending_deposit'
  | 'deposit_received'
  | 'pending_performer'
  | 'performer_confirmed'
  | 'performing'
  | 'finished'
  | 'pending_final_payment'
  | 'final_payment_received'
  | 'settled'
  | 'cancelled'
  | 'refunding';

/** 价格配置类型 */
export type PriceConfigType = 'performer_settlement' | 'agent_quote' | 'client_quote';

/** 签约模式 */
export type ContractMode = 'skip' | 'upload' | 'system';

/** 需求来源 */
export type DemandSource = 'sku' | 'requirement' | 'phone';

/** 紧急程度 */
export type Urgency = 'normal' | 'urgent' | 'emergency';

/** 排期状态 */
export type AssignmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

/** 活动公司认证状态 */
export type CompanyStatus = 'registered' | 'pending_cert' | 'certified';

/** 演员状态 */
export type PerformerStatus = 'active' | 'inactive';

/** SKU 状态 */
export type SkuStatus = 'active' | 'inactive';

/** SKU 自定义字段类型 */
export type SkuCustomFieldType = 'text' | 'number' | 'switch' | 'select';

/** 评价状态 */
export type ReviewStatus = 'pending' | 'published' | 'hidden';

/** 签约状态 */
export type ContractStatus = 'pending' | 'signed' | 'skipped';

/** 付款类型 */
export type PaymentType = 'deposit' | 'final';

/** 结算状态 */
export type SettlementStatus = 'pending' | 'settled';

/** 通知类型 */
export type NotificationType = 'sms' | 'wechat';

/** 通知发送状态 */
export type NotificationSendStatus = 'sent' | 'failed';

// ---- 通用分页 ----

/** 分页请求参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---- 统一响应 ----

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// ---- Auth 相关 ----

/** 登录响应用户信息 */
export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  avatar_url: string;
  company_profile?: CompanyProfileBrief;
  performer_profile?: PerformerProfileBrief;
}

/** 活动公司简要信息（登录时返回） */
export interface CompanyProfileBrief {
  id?: string;
  status: CompanyStatus;
  short_name: string;
}

/** 演员简要信息（登录时返回） */
export interface PerformerProfileBrief {
  tier: PerformerTier;
  credit_level: CreditLevel;
  status: PerformerStatus;
}

/** 登录响应 */
export interface AuthResponse {
  token: string;
  user: AuthUser;
  is_new?: boolean;
}

// ---- SKU 相关 ----

/** SKU 列表项 */
export interface SkuListItem {
  id: string;
  name: string;
  business_line: BusinessLine;
  description: string;
  performer_profile: string;
  style_tags: string[];
  applicable_scenes: string[];
  base_price: number;
  agent_price: number;
  duration_minutes: number;
  performers_count: number;
  cover_url: string;
  status: SkuStatus;
  created_at: string;
}

/** SKU 自定义字段定义 */
export interface SkuCustomField {
  id: string;
  name: string;
  field_type: SkuCustomFieldType;
  options: string[];
  required: boolean;
  sort_order: number;
}

/** SKU 详情中的自定义字段值 */
export interface SkuCustomFieldValue extends SkuCustomField {
  value: string | number | boolean | null;
}

/** SKU 详情 */
export interface SkuDetail extends SkuListItem {
  media_urls: string[];
  custom_fields: SkuCustomFieldValue[];
  updated_at: string;
}

/** 创建/更新 SKU 请求 */
export interface SkuUpsertRequest {
  name: string;
  business_line: BusinessLine;
  description: string;
  performer_profile: string;
  style_tags: string[];
  applicable_scenes: string[];
  base_price: number;
  duration_minutes: number;
  performers_count: number;
  media_urls?: string[];
}

// ---- 需求相关 ----

/** 需求提报请求 */
export interface DemandCreateRequest {
  source: DemandSource;
  sku_id?: string;
  title?: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  city: string;
  address: string;
  audience_count?: number;
  budget?: number;
  duration_minutes?: number;
  comedy_style?: string;
  special_requirements?: string;
  venue_name?: string;
  venue_type?: string;
}

/** 需求列表项 */
export interface DemandListItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  city: string;
  budget: number;
  status: DemandStatus;
  urgency: Urgency;
  created_at: string;
  client: { id: string; name: string };
}

/** 需求详情 */
export interface DemandDetail {
  id: string;
  client_id: string;
  source: DemandSource;
  sku_id?: string;
  title: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  city: string;
  address: string;
  audience_count?: number;
  budget?: number;
  duration_minutes?: number;
  comedy_style?: string;
  special_requirements?: string;
  ai_plan_content?: string;
  adjusted_plan_content?: string;
  final_plan_content?: string;
  final_price?: number;
  urgency: Urgency;
  contract_mode?: ContractMode;
  status: DemandStatus;
  status_history: StatusHistoryEntry[];
  lineups?: LineupEntry[];
  payments?: PaymentEntry[];
  created_at: string;
  updated_at: string;
}

/** 状态历史条目 */
export interface StatusHistoryEntry {
  status: DemandStatus;
  at: string;
  operator_id?: string;
}

/** 阵容条目 */
export interface LineupEntry {
  performer: { id: string; name: string; tier: PerformerTier };
  role: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

/** 付款记录条目 */
export interface PaymentEntry {
  type: PaymentType;
  amount: number;
  method: string;
  received_at: string;
}

// ---- 订单相关 ----

/** 订单状态推进请求 */
export interface OrderStatusRequest {
  to_status: DemandStatus;
  metadata?: {
    amount?: number;
    method?: string;
    note?: string;
  };
}

/** 订单时间线条目 */
export interface TimelineEntry {
  status: DemandStatus;
  label: string;
  at: string;
  operator?: { id: string; name: string };
  note?: string;
}

// ---- 签约相关 ----

/** 签约信息 */
export interface ContractInfo {
  mode: ContractMode;
  file_url?: string;
  signed_at?: string;
  status: ContractStatus;
}

/** 签约设置请求 */
export interface ContractSetRequest {
  mode: ContractMode;
  file_url?: string;
  signed_at?: string;
}

// ---- 演员相关 ----

/** 演员列表项 */
export interface PerformerListItem {
  id: string;
  name: string;
  avatar_url: string;
  style_tags: string[];
  tier: PerformerTier;
  credit_score: number;
  credit_level: CreditLevel;
  rating: number;
  experience_years: number;
  status: PerformerStatus;
}

/** 演员详情 */
export interface PerformerDetail {
  id: string;
  name: string;
  phone: string;
  avatar_url: string;
  cover_url: string;
  style_tags: string[];
  introduction: string;
  highlights: string;
  media_urls: string[];
  social_links: Record<string, string>;
  experience_years: number;
  tier: PerformerTier;
  tier_updated_at: string;
  credit_score: number;
  credit_level: CreditLevel;
  rating: number;
  status: PerformerStatus;
  contract?: {
    type: string;
    exclusivity: boolean;
    settlement_rate: number;
  };
  created_at: string;
}

/** 新增/编辑演员请求 */
export interface PerformerUpsertRequest {
  name: string;
  phone: string;
  style_tags?: string[];
  introduction?: string;
  highlights?: string;
  media_urls?: string[];
  social_links?: Record<string, string>;
  experience_years?: number;
  tier?: PerformerTier;
}

// ---- 咖位管理 ----

/** 咖位变动历史条目 */
export interface TierHistoryEntry {
  from_tier: PerformerTier;
  to_tier: PerformerTier;
  reason: string;
  operator: { id: string; name: string };
  created_at: string;
}

/** 咖位调整请求 */
export interface TierUpdateRequest {
  tier: PerformerTier;
  reason: string;
}

/** 系统升降级建议 */
export interface TierSuggestion {
  current_tier: PerformerTier;
  suggested_tier?: PerformerTier;
  direction: 'up' | 'down' | 'none';
  reasons: string[];
  metrics: {
    completed_shows: number;
    credit_score: number;
    recent_avg_rating: number;
    recent_reject_count: number;
  };
}

// ---- 信誉分 ----

/** 信誉分详情 */
export interface CreditDetail {
  total_score: number;
  level: CreditLevel;
  dimensions: {
    fulfillment: { score: number; weight: number };
    quality: { score: number; weight: number };
    activity: { score: number; weight: number };
    basics: { score: number; weight: number };
  };
}

/** 信誉分变动日志条目 */
export interface CreditLogEntry {
  id: string;
  change_amount: number;
  reason: string;
  related_demand_id?: string;
  created_at: string;
}

// ---- 排期分配 ----

/** 排期创建请求 */
export interface AssignmentCreateRequest {
  demand_id: string;
  performer_id: string;
  performance_role: string;
  arrival_time: string;
  negotiated_price?: number;
}

/** 演员响应排期请求 */
export interface AssignmentRespondRequest {
  action: 'confirm' | 'reject';
  reject_reason?: string;
}

/** 签到请求 */
export interface CheckinRequest {
  latitude: number;
  longitude: number;
}

/** 排期列表项 */
export interface AssignmentListItem {
  id: string;
  demand: { id: string; title: string; event_date: string };
  performer: { id: string; name: string; tier: PerformerTier };
  performance_role: string;
  arrival_time: string;
  checkin_time?: string;
  checkin_location?: Record<string, unknown>;
  negotiated_price?: number;
  status: AssignmentStatus;
  reject_reason?: string;
  confirmed_at?: string;
}

/** 档期日历条目 */
export interface CalendarEntry {
  date: string;
  assignments: {
    id: string;
    performer: { id: string; name: string };
    demand_title: string;
    time_slot: string;
  }[];
}

// ---- 付款 ----

/** 付款登记请求 */
export interface PaymentCreateRequest {
  demand_id: string;
  type: PaymentType;
  amount: number;
  method: string;
  received_at: string;
  note?: string;
}

/** 付款记录 */
export interface PaymentRecord {
  id: string;
  demand_id: string;
  type: PaymentType;
  amount: number;
  method: string;
  operator_id: string;
  received_at: string;
  created_at: string;
}

// ---- 结算 ----

/** 结算汇总 */
export interface SettlementSummary {
  items: SettlementPerformerItem[];
  summary: {
    total_pending: number;
    total_settled: number;
  };
}

/** 结算演员明细 */
export interface SettlementPerformerItem {
  performer: { id: string; name: string; tier: PerformerTier };
  pending_amount: number;
  settled_amount: number;
  total_amount: number;
  details: SettlementDetailEntry[];
}

/** 结算明细 */
export interface SettlementDetailEntry {
  demand_id: string;
  demand_title: string;
  amount: number;
  status: SettlementStatus;
  settled_at?: string;
}

/** 标记结算请求 */
export interface MarkSettledRequest {
  paid_at?: string;
}

// ---- 评价 ----

/** 评价请求 */
export interface ReviewCreateRequest {
  demand_id: string;
  overall_rating: number;
  performance_rating?: number;
  punctuality_rating?: number;
  content_rating?: number;
  interaction_rating?: number;
  satisfaction_rating?: number;
  text_content?: string;
}

/** 评价列表项 */
export interface ReviewListItem {
  id: string;
  from_type: 'company' | 'performer';
  from_user: { id: string; name: string };
  overall_rating: number;
  text_content: string;
  status: ReviewStatus;
  created_at: string;
}

// ---- 价格配置 ----

/** 价格配置项 */
export interface PriceConfigItem {
  id: string;
  config_type: PriceConfigType;
  business_line: BusinessLine;
  tier?: PerformerTier;
  package_name: string;
  duration_minutes: number;
  performer_count: number;
  base_price: number;
  agent_discount: number;
  extra_fee_per_5min?: number;
  script_creation_fee?: number;
  script_performance_fee?: number;
  remote_fee_in_city?: number;
  remote_fee_out_city?: number;
  updated_at: string;
}

// ---- 活动公司 ----

/** 活动公司列表项 */
export interface CompanyListItem {
  id: string;
  short_name: string;
  full_name?: string;
  contact_person: string;
  city: string;
  service_categories: string[];
  status: CompanyStatus;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

/** 活动公司认证请求 */
export interface CompanyCertifyRequest {
  full_name: string;
  credit_code: string;
  business_license_url: string;
  legal_person_name: string;
  legal_person_id_url: string;
  bank_name: string;
  bank_account: string;
}

/** 运营审核认证请求 */
export interface CompanyVerifyRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

// ---- 运营工具 ----

/** 运营总看板 */
export interface AdminDashboard {
  pending_demands: number;
  pending_assignments: number;
  pending_settlements: number;
  monthly_revenue: number;
  active_performers: number;
  active_companies: number;
  performer_monthly_rate: number;
  company_monthly_rate: number;
}

/** 操作日志条目 */
export interface OperationLogEntry {
  id: string;
  operator: { id: string; name: string };
  module: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  created_at: string;
}

/** 通用搜索结果 */
export interface SearchResult {
  performers: unknown[];
  skus: unknown[];
  demands: unknown[];
  companies: unknown[];
}

// ---- 通知 ----

/** 通知记录 */
export interface NotificationRecord {
  id: string;
  recipient: string;
  type: NotificationType;
  template: string;
  content: string;
  status: NotificationSendStatus;
  sent_at: string;
}

// ---- Fastify JWT 扩展类型 ----

/** JWT Payload（由 Supabase Auth 签发） */
export interface JwtPayload {
  sub: string;         // 用户 ID
  role: UserRole;
  company_id?: string; // supplier-console 数据隔离范围
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  phone?: string;
}

// ---- 状态机配置 ----

/** 状态迁移规则 */
export interface StatusTransition {
  from: DemandStatus;
  to: DemandStatus[];
}
