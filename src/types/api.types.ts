//src/types/api.types.ts
// ============================================================
// SHARED API TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Auth
// rolename sesuai backend: 'Admin' | 'Staff' | 'User'
export interface User {
  id: string
  name: string
  email: string
  rolename: 'Admin' | 'Staff' | 'User'
  avatarUrl?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

// Dashboard
export interface ActivityItem {
  id: string
  user: string
  action: string
  time: string
}

export interface DashboardSummary {
  totalUsers: number
  activeToday: number
  revenue: number
  recentActivity: ActivityItem[]
}

export interface Ticket {
  id: number
  short_description: string
  description: string
  priority: string
  created_at: string
  updated_at: string
  owner_emplid: string
  owner_email: string
  staff_emplid: string | null
  staff_email: string | null
  status_name: string
  category_name: string
}

export interface TicketPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TicketListResponse {
  tickets: Ticket[]
  pagination: TicketPagination
}