import { config } from '@/constants/config'
import { mockTokens, mockUser } from '@/mocks/auth.mock'
import { LoginPayload, AuthTokens, User } from '@/types/api.types'
import { api } from './api'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const login = async (payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> => {
  if (config.USE_MOCK) {
    await delay(800)
    // Simulasi wrong password
    if (payload.password !== 'password123') {
      throw new Error('Email atau password salah')
    }
    return { user: mockUser, tokens: mockTokens }
  }

  const { data } = await api.post('/auth/login', payload)
  return data.data
}

export const logout = async (): Promise<void> => {
  if (config.USE_MOCK) {
    await delay(300)
    return
  }

  await api.post('/auth/logout')
}
