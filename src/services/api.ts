//src/services/api.ts
import axios from 'axios'
import { config } from '@/constants/config'
import { useAuthStore } from '@/store/auth.store'

export const api = axios.create({
  baseURL: config.API_BASE_URL  + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor — untuk attach auth token nanti
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Kalau request pakai internal token — jangan redirect, token expired/invalid
      const isInternalToken = !!error.config?.headers?.['x-internal-token']
      if (isInternalToken) {
        return Promise.reject({
          ...error,
          isTokenExpired: true,
          message: 'This link is no longer valid.',
        })
      }

      // SSO token expired — redirect ke login
      useAuthStore.getState().clearAuth()
      // router tidak tersedia di sini, jadi set flag di store
      useAuthStore.getState().setSessionExpired(true)
    }
    return Promise.reject(error)
  }
)

// Response interceptor — untuk handle error global
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: handle token expired / redirect ke login
    }
    return Promise.reject(error)
  }
)
