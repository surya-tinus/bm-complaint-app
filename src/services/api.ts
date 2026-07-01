// src/services/api.ts
import axios from 'axios'
import { config } from '@/constants/config'
import { useAuthStore } from '@/store/auth.store'

export const api = axios.create({
  baseURL: config.API_BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor — attach auth token
api.interceptors.request.use(
  (reqConfig) => {
    const token = useAuthStore.getState().token
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`
    }
    return reqConfig
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle error global (SATU saja)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Network error / timeout — tidak ada response sama sekali
    if (!error.response) {
      console.error('[API] Network error or timeout:', error.message ?? error.code)
      console.log('Error config URL:', error.config?.url);
console.log('Error response:', error.response);
console.log('Error code:', error.code);
      return Promise.reject(error)
    }

    if (error.response.status === 401) {
      const isInternalToken = !!error.config?.headers?.['x-internal-token']
      if (isInternalToken) {
        return Promise.reject({
          ...error,
          isTokenExpired: true,
          message: 'This link is no longer valid.',
        })
      }

      useAuthStore.getState().clearAuth()
      useAuthStore.getState().setSessionExpired(true)
    }

    return Promise.reject(error)
  }
)