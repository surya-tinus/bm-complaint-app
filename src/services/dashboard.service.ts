import { config } from '@/constants/config'
import { mockDashboardSummary } from '@/mocks/dashboard.mock'
import { DashboardSummary } from '@/types/api.types'
import { api } from './api'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (config.USE_MOCK) {
    await delay(600)
    return mockDashboardSummary
  }

  const { data } = await api.get('/dashboard/summary')
  return data.data
}
