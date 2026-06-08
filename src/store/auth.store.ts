// src/store/auth.store.ts
import { create } from 'zustand'
import { queryClient } from 'app/_layout'

// ─── Types ─────────────────────────────────────────────────

export type UserRole = 'User' | 'Admin' | 'Staff'
export type UserDept = 'BM' | 'ME' | null

export interface AuthUser {
  emplid: string
  email: string
  role: UserRole
  dept: UserDept
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuthFromToken: (token: string) => void
  clearAuth: () => void
  sessionExpired: boolean
  setSessionExpired: (val: boolean) => void
}

// ─── JWT Decode (tanpa library) ────────────────────────────

const decodeJWT = (token: string): Record<string, any> | null => {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// ─── Role & Dept dari emplid ───────────────────────────────
// Format: USR-{CODE}-{NUMBER}
// STD = Student/User, ADM = Admin, SBM = Staff BM, SME = Staff ME

const getRoleFromEmplid = (emplid: string): UserRole => {
  const code = emplid.split('-')[1]?.toUpperCase()
  const map: Record<string, UserRole> = {
    STD: 'User',
    ADM: 'Admin',
    SBM: 'Staff',
    SME: 'Staff',
  }
  return map[code] ?? 'User'
}

const getDeptFromEmplid = (emplid: string): UserDept => {
  const code = emplid.split('-')[1]?.toUpperCase()
  const map: Record<string, UserDept> = {
    SBM: 'BM',
    SME: 'ME',
  }
  return map[code] ?? null
}

// ─── Store ─────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  sessionExpired: false,
  setSessionExpired: (val) => set({ sessionExpired: val }),

  setAuthFromToken: (token: string) => {
    const payload = decodeJWT(token)
    if (!payload?.emplid) return

    const user: AuthUser = {
      emplid: payload.emplid,
      email: payload.email ?? '',
      role: getRoleFromEmplid(payload.emplid),
      dept: getDeptFromEmplid(payload.emplid),
    }

    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    queryClient.clear()
    set({ user: null, token: null, isAuthenticated: false, sessionExpired: false })
  },
}))