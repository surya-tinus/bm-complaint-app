// src/services/lookup.service.ts
import { api } from './api'
import { Place, IssueTypeWithScope } from '@/features/dashboard/types'

const ISSUE_TYPE_META: Record<string, { icon: string; description: string }> = {
  'General Information': {
    icon: 'information-circle-outline',
    description: 'General inquiries or information requests about the building.',
  },
  'Electrical Problem': {
    icon: 'flash-outline',
    description: 'Issues with lights, power outlets, or electrical equipment.',
  },
  'Facility Issue': {
    icon: 'business-outline',
    description: 'General facility condition that needs attention or repair.',
  },
  'Cleaning Issue': {
    icon: 'sparkles-outline',
    description: 'Trash, dirty areas, spills, or hygiene-related issues.',
  },
  'Security Issue': {
    icon: 'shield-checkmark-outline',
    description: 'Security concerns, suspicious activity, or access issues.',
  },
  'Facility Request': {
    icon: 'construct-outline',
    description: 'Request for facility setup, arrangement, or maintenance.',
  },
  'Moving Service': {
    icon: 'move-outline',
    description: 'Request assistance to move furniture or equipment.',
  },
  'Cleaning': {
    icon: 'brush-outline',
    description: 'Request for cleaning service in a specific area.',
  },
}

export const getPlaces = async (): Promise<Place[]> => {
  try {
    console.log('calling:', api.defaults.baseURL + '/lookup/places')
    const { data } = await api.get('/lookup/places')
    console.log('places response:', JSON.stringify(data, null, 2))
    return data.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      building: p.building,
    }))
  } catch (error: any) {
    console.log('places ERROR:', error.response?.status, error.response?.data)
    console.log('full URL attempted:', error.config?.url)
    return []
  }
}

export const getIssueTypes = async (): Promise<IssueTypeWithScope[]> => {
  try {
    console.log('calling:', api.defaults.baseURL + '/lookup/issue-types')
    const { data } = await api.get('/lookup/issue-types')
    console.log('issue-types response:', JSON.stringify(data, null, 2))
    return data.data.map((t: any) => {
      const meta = ISSUE_TYPE_META[t.name] ?? { icon: 'help-circle-outline', description: '' }
      return {
        id: t.id,
        name: t.name,
        defaultPriority: t.default_priority,
        scope: t.scope_department ?? 'staff_assistance',
        categoryName: t.category_name,
        icon: meta.icon,
        description: meta.description,
      }
    })
  } catch (error: any) {
    console.log('issue-types ERROR:', error.response?.status, error.response?.data)
    console.log('full URL attempted:', error.config?.url)
    console.log('baseURL:', error.config?.baseURL)
    return []
  }
}