import { User, AuthTokens } from '@/types/api.types'

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Surya',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: 'user-002',
    name: 'Sur',
    email: 'user@example.com',
    role: 'user',
  },
]
  
export const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token-xyz',
  refreshToken: 'mock-refresh-token-xyz',
}
