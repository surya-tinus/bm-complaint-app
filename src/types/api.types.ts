// ============================================================
// SHARED API TYPES
// Sesuaikan dengan response struktur dari backend teman kamu
// ============================================================

// Wrapper umum untuk semua response API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Auth
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
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
