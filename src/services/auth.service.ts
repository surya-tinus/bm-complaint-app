// src/services/auth.service.ts
import { config } from '@/constants/config'
import { useAuthStore } from '@/store/auth.store'

// ─── Dev tokens (hapus saat SSO sudah siap) ───────────────

export const DEV_TOKENS: Record<string, string> = {
  'mhs.satu@student.umn.ac.id':    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU1RELTAwMSIsImVtYWlsIjoibWhzLnNhdHVAc3R1ZGVudC51bW4uYWMuaWQiLCJpYXQiOjE3NzE5ODUwODh9.Ps1OKF2n5NUE3h1xSGJHsVcgK3wBItMAMfjtAq25lTE',
  'mhs.dua@student.umn.ac.id':     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU1RELTAwMiIsImVtYWlsIjoibWhzLmR1YUBzdHVkZW50LnVtbi5hYy5pZCIsImlhdCI6MTc3MTk4NTA4OH0.VIItiF9chu9buGAI2J8l8a6b63v5Q248Ttzfjocxho4',
  'staff1@bm.umn.ac.id':           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU0JNLTAwMSIsImVtYWlsIjoic3RhZmYxQGJtLnVtbi5hYy5pZCIsImlhdCI6MTc3MTk4NTA4OH0.yIHtzFNogXAkUADt4epL1bpXVELEupNK8C1wNZrnHi0',
  'staff1@me.umn.ac.id':           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU01FLTAwMSIsImVtYWlsIjoic3RhZmYxQG1lLnVtbi5hYy5pZCIsImlhdCI6MTc3MTk4NTA4OH0.S92Y9Cy-Y8CoOjW8rtpjCSlasZlkvrrSxWgF8Ctrcl8',
  'staff2@me.umn.ac.id':           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU01FLTAwMiIsImVtYWlsIjoic3RhZmYyQG1lLnVtbi5hYy5pZCIsImlhdCI6MTc3MTk4NTA4OH0.Ly7RGi7fTeSHkQtYd5F47J1NW6E9j6fUYFC_VqyhyxQ',
  'admin.utama@admin.umn.ac.id':   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItQURNLTAwMSIsImVtYWlsIjoiYWRtaW4udXRhbWFAYWRtaW4udW1uLmFjLmlkIiwiaWF0IjoxNzcxOTg1MDg4fQ._9EHETL-1cVfo9S0W5nHBv8AHxsYs7ATTnZYYds5a5Y',
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// ─── Login ─────────────────────────────────────────────────

export const login = async (payload: { email: string; password: string }): Promise<void> => {
  if (config.USE_MOCK) {
    await delay(800)
    if (payload.password !== 'password123') throw new Error('Email atau password salah')
    const token = DEV_TOKENS[payload.email]
    if (!token) throw new Error('Email tidak dikenali')
    useAuthStore.getState().setAuthFromToken(token)
    return
  }

  // Dev mode: pakai hardcoded token berdasarkan email
  // TODO: ganti dengan SSO flow saat siap
  const token = DEV_TOKENS[payload.email]
  if (!token) throw new Error('Email tidak dikenali untuk development')
  useAuthStore.getState().setAuthFromToken(token)
}

// ─── Logout ────────────────────────────────────────────────

export const logout = async (): Promise<void> => {
  if (config.USE_MOCK) {
    await delay(300)
  }
  // SSO logout nanti
  useAuthStore.getState().clearAuth()
}