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
api.interceptors.request.use(
  (req) => {
    // TODO: uncomment ini kalau auth sudah siap
    const token = useAuthStore.getState().token
    if (token) req.headers.Authorization = `Bearer ${token}`
    return req
  },
  (error) => Promise.reject(error)
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
