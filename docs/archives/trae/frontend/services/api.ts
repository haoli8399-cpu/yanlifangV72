import axios from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
  phone?: string
  role?: string
}

export const authApi = {
  login: (data: LoginData) => api.post<TokenResponse>('/auth/login', new URLSearchParams(data)),
  register: (data: RegisterData) => api.post<TokenResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
}

export interface Demand {
  id: string
  title: string
  description: string
  event_type: string
  event_date: string
  city: string
  budget_min: number
  budget_max: number
  maturity: string
  readiness: string
  lifecycle: string
  publication: string
  evidence: string
  customer_id: string
  tenant_id: string
  created_at: string
}

export interface DemandCreate {
  title: string
  description?: string
  event_type?: string
  event_date?: string
  city?: string
  budget_min?: number
  budget_max?: number
}

export const demandApi = {
  list: () => api.get<Demand[]>('/demands'),
  get: (id: string) => api.get<Demand>(`/demands/${id}`),
  create: (data: DemandCreate) => api.post<Demand>('/demands', data),
  update: (id: string, data: Partial<DemandCreate>) => api.put<Demand>(`/demands/${id}`, data),
  delete: (id: string) => api.delete(`/demands/${id}`),
}

export interface Tenant {
  id: string
  name: string
  legal_name: string
  description: string
  industry: string
  city: string
  status: string
  tier: string
  created_at: string
}

export interface TenantCreate {
  name: string
  legal_name?: string
  description?: string
  industry?: string
  city?: string
}

export const tenantApi = {
  list: () => api.get<Tenant[]>('/tenants'),
  get: (id: string) => api.get<Tenant>(`/tenants/${id}`),
  create: (data: TenantCreate) => api.post<Tenant>('/tenants', data),
  update: (id: string, data: Partial<TenantCreate>) => api.put<Tenant>(`/tenants/${id}`, data),
  delete: (id: string) => api.delete(`/tenants/${id}`),
}

export interface Actor {
  id: string
  stage_name: string
  real_name: string
  avatar_url: string
  bio: string
  expertise: object
  availability: object
  status: string
  created_at: string
}

export interface ActorCreate {
  stage_name: string
  real_name?: string
  avatar_url?: string
  bio?: string
  expertise?: object
  availability?: object
}

export const actorApi = {
  list: () => api.get<Actor[]>('/actors'),
  get: (id: string) => api.get<Actor>(`/actors/${id}`),
  create: (data: ActorCreate) => api.post<Actor>('/actors', data),
  update: (id: string, data: Partial<ActorCreate>) => api.put<Actor>(`/actors/${id}`, data),
  delete: (id: string) => api.delete(`/actors/${id}`),
}

export interface ActivityProject {
  id: string
  engagement_id: string
  title: string
  description: string
  status: string
  start_date: string
  end_date: string
  created_at: string
}

export interface ProjectCreate {
  engagement_id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
}

export const projectApi = {
  list: () => api.get<ActivityProject[]>('/projects'),
  get: (id: string) => api.get<ActivityProject>(`/projects/${id}`),
  create: (data: ProjectCreate) => api.post<ActivityProject>('/projects', data),
  update: (id: string, data: Partial<ProjectCreate>) => api.put<ActivityProject>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

export interface ProgramModule {
  id: string
  tenant_id: string
  name: string
  category: string
  description: string
  readiness: string
  lifecycle: string
  publication: string
  evidence: string
  created_at: string
}

export interface ProgramCreate {
  name: string
  category?: string
  description?: string
}

export const programApi = {
  list: () => api.get<ProgramModule[]>('/supply/programs'),
  get: (id: string) => api.get<ProgramModule>(`/supply/programs/${id}`),
  create: (data: ProgramCreate) => api.post<ProgramModule>('/supply/programs', data),
  update: (id: string, data: Partial<ProgramCreate>) => api.put<ProgramModule>(`/supply/programs/${id}`, data),
}

export interface ServiceOffering {
  id: string
  tenant_id: string
  name: string
  description: string
  readiness: string
  lifecycle: string
  publication: string
  evidence: string
  created_at: string
}

export interface OfferingCreate {
  name: string
  description?: string
}

export const offeringApi = {
  list: () => api.get<ServiceOffering[]>('/supply/offerings'),
  get: (id: string) => api.get<ServiceOffering>(`/supply/offerings/${id}`),
  create: (data: OfferingCreate) => api.post<ServiceOffering>('/supply/offerings', data),
  update: (id: string, data: Partial<OfferingCreate>) => api.put<ServiceOffering>(`/supply/offerings/${id}`, data),
}

export default api