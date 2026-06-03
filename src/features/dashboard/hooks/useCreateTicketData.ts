import { useQuery } from '@tanstack/react-query'
import { getPlaces, getIssueTypes } from '@/services/lookup.service'
import { IssueTypeWithScope, TicketCategory } from '@/features/dashboard/types'
import { useMemo } from 'react'

// ─── CATEGORY META ─────────────────────────────────────────
// Kategori adalah pengelompokan frontend — tidak dari API
// Dipindah dari mock ke sini supaya tetap ada saat mock dimatikan

export const CATEGORIES: TicketCategory[] = [
  {
    id: 1,
    name: 'Information',
    description: 'General inquiries or information requests.',
    icon: 'information-circle-outline',
  },
  {
    id: 2,
    name: 'Issue',
    description: 'Report a problem or malfunction that needs fixing.',
    icon: 'warning-outline',
  },
  {
    id: 3,
    name: 'Request',
    description: 'Request a service or assistance from staff.',
    icon: 'hand-right-outline',
  },
]

// Mapping nama kategori → issue type (berdasarkan scope dari API)
const SCOPE_TO_CATEGORY: Record<string, string> = {
  staff_assistance: 'Information',
  building_facility: 'Issue',
  cleanliness: 'Issue',
  security: 'Issue',
  maintenance: 'Request',
}

// Override per-name kalau scope tidak cukup untuk bedakan
const NAME_TO_CATEGORY: Record<string, string> = {
  'Facility Request': 'Request',
  'Moving Service': 'Request',
  Cleaning: 'Request',
}

// ─── HOOKS ────────────────────────────────────────────────

export const usePlaces = () =>
  useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
    staleTime: 10 * 60 * 1000, // 10 menit — data ini jarang berubah
  })

export const useIssueTypes = () =>
  useQuery({
    queryKey: ['issue-types'],
    queryFn: getIssueTypes,
    staleTime: 10 * 60 * 1000,
  })

// Derived: issue types dikelompokkan per kategori
export const useIssueTypesByCategory = () => {
  const { data: issueTypes = [], ...rest } = useIssueTypes()

  const grouped = useMemo(() => {
    console.log('raw issueTypes:', issueTypes)   // ← cek apakah data masuk
    const result: Record<string, IssueTypeWithScope[]> = {}
    for (const it of issueTypes) {
      const category = it.categoryName ?? 'Issue'
      console.log('grouping:', it.name, '→', category)  // ← cek categoryName
      if (!result[category]) result[category] = []
      result[category].push(it)
    }
    console.log('grouped result:', result)   // ← cek hasil grouping
    return result
  }, [issueTypes])

  return { data: grouped, ...rest }
}