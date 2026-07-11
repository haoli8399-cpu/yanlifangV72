// User Role
export type UserRole = 'company' | 'performer' | 'client'

// 艺人身份细分：独立艺人 / 经纪公司
export type PerformerType = 'indie' | 'agency'

// Status Enums
export type RequestStatus = 'pending_quote' | 'quoted' | 'confirmed' | 'signed' | 'cancelled'
export type AssignmentStatus = 'pending_confirm' | 'confirmed' | 'completed' | 'rejected'
export type SettlementStatus = 'pending' | 'settled' | 'transferred'
export type BusinessType = 'commercial' | 'outshow' | 'sponsor' | 'custom_content' | 'custom_mix'
export type ShowType = 'talkshow' | 'improv' | 'manzai' | 'newcomedy' | 'magic' | 'family'

//咖位等级
export type TierLevel = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6'

// User
export interface User {
  id: string
  name: string
  avatar: string
  role: UserRole
  phone?: string
  verified?: boolean
  tierLevel?: TierLevel
  creditScore?: number
}

// Company User
export interface CompanyUser extends User {
  role: 'company'
  companyName: string
  memberType: 'basic' | 'verified'
  stats: {
    totalRequests: number
    ongoingRequests: number
    signedRequests: number
  }
}

// Performer User
export interface PerformerUser extends User {
  role: 'performer'
  actorType?: PerformerType
  stageName: string
  stats: {
    monthlySchedule: number
    monthlyIncome: number
    creditScore: number
  }
}

// SKU (演出方案)
export interface Sku {
  id: string
  title: string
  showType: ShowType
  coverImage: string
  description: string
  duration: number // minutes
  price: number
  priceUnit: string
  rating: number
  ratingCount: number
  salesCount: number
  suitableScene: string
  businessType: BusinessType
  performers: Performer[]
  tags: string[]
}

// Performer
export interface Performer {
  id: string
  name: string
  avatar: string
  tierLevel: TierLevel
  experience: string
  showCount: number
  yearsActive: number
}

// Request (需求)
export interface Request {
  id: string
  title: string
  status: RequestStatus
  showType: ShowType
  businessType: BusinessType
  expectedDate: string
  location: string
  duration: number
  budgetMin: number
  budgetMax: number
  audienceCount?: number
  specialRequirements?: string
  contactName: string
  contactPhone: string
  createdAt: string
  quotes: Quote[]
}

// Quote (报价)
export interface Quote {
  id: string
  performer: Performer
  price: number
  description: string
  respondedAt: string
}

// Assignment (排期)
export interface Assignment {
  id: string
  title: string
  status: AssignmentStatus
  showType: ShowType
  date: string
  startTime: string
  endTime: string
  location: string
  clientName: string
  clientPhone: string
  compensation: number
  settlementStatus: SettlementStatus
  checkedIn: boolean
  checkinTime?: string
}

// Settlement (结算记录)
export interface Settlement {
  id: string
  assignmentId: string
  title: string
  showDate: string
  amount: number
  status: SettlementStatus
  method: string
  transferDate?: string
}

// Credit Record
export interface CreditRecord {
  id: string
  change: number
  reason: string
  date: string
}

// Banner
export interface Banner {
  id: string
  image: string
  title: string
  link: string
}

// Status label mapping
export const StatusLabels: Record<RequestStatus, string> = {
  pending_quote: '待报价',
  quoted: '已报价',
  confirmed: '已确认',
  signed: '已签约',
  cancelled: '已取消',
}

export const ShowTypeLabels: Record<ShowType, string> = {
  talkshow: '脱口秀',
  improv: '即兴喜剧',
  manzai: '漫才',
  newcomedy: '新喜剧',
  magic: '魔术喜剧',
  family: '亲子喜剧',
}

export const BusinessTypeLabels: Record<BusinessType, string> = {
  commercial: '商演包场',
  outshow: '外出演出',
  sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_mix: '定制拼盘',
}
