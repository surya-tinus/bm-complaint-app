// src/services/auth.service.ts
import { config } from '@/constants/config'
import { mockTokens, mockUsers } from '@/mocks/auth.mock'
import { User } from '@/types/api.types'
import { api } from './api'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// ─── Dev tokens dari test file backend ────────────────────
export const DEV_TOKENS = {
  USER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU1RELTAwMSIsImVtYWlsIjoibWhzLnNhdHVAc3R1ZGVudC51bW4uYWMuaWQiLCJpYXQiOjE3NzE5ODUwODh9.Ps1OKF2n5NUE3h1xSGJHsVcgK3wBItMAMfjtAq25lTE',
  STAFF_ME: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU01FLTAwMSIsImVtYWlsIjoic3RhZmYxQG1lLnVtbi5hYy5pZCIsImlhdCI6MTc3MTk4NTA4OH0.S92Y9Cy-Y8CoOjW8rtpjCSlasZlkvrrSxWgF8Ctrcl8',
  STAFF_BM: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU0JNLTAwMSIsImVtYWlsIjoic3RhZmYxQGJtLnVtbi5hYy5pZCIsImlhdCI6MTc3MTk4NTA4OH0.yIHtzFNogXAkUADt4epL1bpXVELEupNK8C1wNZrnHi0',
  ADMIN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItQURNLTAwMSIsImVtYWlsIjoiYWRtaW4udXRhbWFAYWRtaW4udW1uLmFjLmlkIiwiaWF0IjoxNzcxOTg1MDg4fQ._9EHETL-1cVfo9S0W5nHBv8AHxsYs7ATTnZYYds5a5Y',
}

// ─── Dev user profiles (sementara sampai SSO ready) ───────
const DEV_USERS: Record<string, { token: string; user: User }> = {
  'mhs.satu@student.umn.ac.id': {
    token: DEV_TOKENS.USER,
    user: {
      id: 'USR-STD-001',
      name: 'Mahasiswa Satu',
      email: 'mhs.satu@student.umn.ac.id',
      rolename: 'User',
    },
  },
  'staff1@me.umn.ac.id': {
    token: DEV_TOKENS.STAFF_ME,
    user: {
      id: 'USR-SME-001',
      name: 'Staff ME',
      email: 'staff1@me.umn.ac.id',
      rolename: 'Staff',
    },
  },
  'staff1@bm.umn.ac.id': {
    token: DEV_TOKENS.STAFF_BM,
    user: {
      id: 'USR-SBM-001',
      name: 'Staff BM',
      email: 'staff1@bm.umn.ac.id',
      rolename: 'Staff',
    },
  },
  'admin.utama@admin.umn.ac.id': {
    token: DEV_TOKENS.ADMIN,
    user: {
      id: 'USR-ADM-001',
      name: 'Admin Utama',
      email: 'admin.utama@admin.umn.ac.id',
      rolename: 'Admin',
    },
  },
}

// ─── Login ─────────────────────────────────────────────────

export const login = async (payload: { email: string; password: string }) => {
  console.log('USE_MOCK:', config.USE_MOCK)
  if (config.USE_MOCK) {
    await delay(800)
    if (payload.password !== 'password123') {
      throw new Error('Email atau password salah')
    }
    return { user: mockUsers, tokens: mockTokens }
  }

  // TODO: ganti dengan SSO login saat siap
  const entry = DEV_USERS[payload.email]
  if (!entry) throw new Error('Email tidak dikenali untuk development')

  return {
    user: entry.user,
    tokens: { accessToken: entry.token, refreshToken: entry.token },
  }
}

export const logout = async (): Promise<void> => {
  if (config.USE_MOCK) {
    await delay(300)
    return
  }
  // TODO: SSO logout
}