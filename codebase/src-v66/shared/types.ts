export type OpportunityStatus =
  | "新需求"
  | "有效商机"
  | "已报价"
  | "谈判中"
  | "等待客户确认"
  | "已成交"
  | "已丢单";

export type RequestStatus =
  | "新需求"
  | "需求确认"
  | "已报价"
  | "沟通中"
  | "已成交"
  | "已结束";

export type Priority = "高" | "中" | "低";

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  phone: string;
  industry: string;
  avatarColor: string;
}

export interface EventInfo {
  type: string;
  scene: string;
  date: string;
  location: string;
  headcount: number;
  budget: number;
  durationMinutes: number;
}

export interface Artist {
  id: string;
  name: string;
  category: string;
  tags: string[];
  basePrice: number;
  rating: number;
  bio: string;
}

export interface SolutionItem {
  artistId: string;
  artistName: string;
  category: string;
  duration: number;
  price: number;
  cost: number;
}

export type SolutionTier = "经济方案" | "推荐方案" | "升级方案";

export interface Solution {
  id: string;
  tier: SolutionTier;
  name: string;
  sku: string;
  scene: string;
  applicableScenes: string[];
  headcountRange: [number, number];
  durationMinutes: number;
  items: SolutionItem[];
  price: number;
  cost: number;
  grossProfit: number;
  recommendScore: number;
  aiConfidence: "高" | "中" | "低";
  aiReason: string;
  description: string;
}

export interface Opportunity {
  id: string;
  code: string;
  customer: Customer;
  event: EventInfo;
  status: OpportunityStatus;
  requestStatus: RequestStatus;
  priority: Priority;
  createdAt: string;
  lastFollowUpAt: string;
  aiExtracted: string[];
  aiMissing: string[];
  matchScore: number;
  rawRequirement: string;
  ownerName: string;
}

export interface QuotationVersion {
  version: string;
  createdAt: string;
  editor: string;
  solutionId: string;
  solutionName: string;
  items: SolutionItem[];
  totalPrice: number;
  totalCost: number;
  discount: number;
  finalPrice: number;
  changeNote: string;
  changes: string[];
}

export interface Quotation {
  id: string;
  code: string;
  opportunityId: string;
  customerName: string;
  eventType: string;
  currentVersion: string;
  versions: QuotationVersion[];
  status: "草稿" | "已发送" | "客户确认中" | "已成交" | "已作废";
  validUntil?: string;
  sentAt?: string;
  readAt?: string;
  customerConfirmStatus?: "未回复" | "已阅" | "已确认" | "已拒绝";
  voidReason?: string;
}

export interface FollowUp {
  id: string;
  opportunityId: string;
  time: string;
  actor: "客户" | "运营" | "AI";
  channel: "电话" | "微信" | "邮件" | "系统";
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  streaming?: boolean;
  confidence?: "高" | "中" | "低";
  suggestions?: string[];
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  tone: "primary" | "success" | "warning" | "info";
}

// ============ 客户方案 H5 类型 ============

export interface PlanStructureItem {
  name: string;
  duration: string;
  detail?: string;
}

export interface ProposalPerformer {
  name: string;
  role: string;
  style: string;
  bio?: string;
  avatar?: string;
}

export interface ProposalCase {
  company: string;
  event: string;
  content?: string;
  feedback?: string;
  satisfaction?: string;
}

export interface ProposalConsultant {
  name: string;
  phone: string;
  wecomQr: string;
}

// ============ CRM 线索中心类型 ============

export type LeadToolType = 'budget_calculator' | 'insurance_plan' | 'annual_plan';

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'viewed' | 'won' | 'lost';

export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  tool_type: LeadToolType;
  source_channel?: string;
  source_user?: string;
  answers: Record<string, string>;
  ai_result_summary?: string;
  score: number;
  priority: LeadPriority;
  status: LeadStatus;
  assigned_to?: string;
  customer_name?: string;
  company?: string;
  phone?: string;
  wechat?: string;
  tool_result?: ToolResult;
  proposal?: { id: string; code: string };
  created_at: string;
  updated_at: string;
}

export interface ToolResult {
  id: string;
  lead_id: string;
  tool_type: string;
  result_json: Record<string, any>;
  ai_output?: string;
  share_count: number;
  download_count: number;
}

// ============ 方案管理类型（Supplier 端） ============

export interface ProposalPlanItem {
  name: string;
  duration: string;
}

export type ProposalStatus =
  | 'draft'
  | 'internal_review'
  | 'shared'
  | 'viewed'
  | 'downloaded'
  | 'modified_by_client'
  | 'revised'
  | 'approved'
  | 'converted_to_order'
  | 'lost';

export interface Proposal {
  id: string;
  code: string;
  customerName: string;
  eventTheme: string;
  eventDate?: string;
  headcount?: number;
  budget?: string;
  understanding?: string;
  planStructure?: PlanStructureItem[];
  price?: number;
  includes?: string[];
  excludes?: string[];
  performers?: ProposalPerformer[];
  cases?: ProposalCase[];
  consultant?: ProposalConsultant;
  consultantName?: string;
  consultantPhone?: string;
  serviceNotes?: string;
  validUntil?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}