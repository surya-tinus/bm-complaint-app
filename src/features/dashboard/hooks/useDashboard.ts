// src/features/dashboard/hooks/useDashboard.ts
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllTickets } from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'
import { getPlaces } from '@/services/lookup.service'

// FilterLabel type & options
export type FilterLabel =
  | 'All'
  | 'Open'
  | 'In Progress'
  | 'On Hold'
  | 'Resolved'
  | 'Cancelled'
  | 'Rejected'

export const FILTER_OPTIONS: FilterLabel[] = [
  'All', 'Open', 'In Progress', 'On Hold', 'Resolved', 'Cancelled', 'Rejected',
]


const FILTER_STATUS_MAP: Record<FilterLabel, string | null> = {
  All: null,
  Open: 'Open',
  'In Progress': 'In Progress',
  'On Hold': 'On Hold',
  Resolved: 'Resolved',
  Cancelled: 'Cancelled',
  Rejected: 'Rejected',
}

export function useDashboard() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role                    // ✅ 'rolename' → 'role'
  const dept = user?.dept
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')

const { data: tickets = [], isLoading, isError, error, refetch } = useQuery({
  queryKey: ['tickets', user?.emplid, user?.dept],
  queryFn: () => {
    console.log('fetching tickets...')
    return getAllTickets()
  },
  staleTime: 1000 * 60 * 2,
  enabled: !!user?.emplid,
})

//Building
const { data: places = [] } = useQuery({
  queryKey: ['places'],
  queryFn: getPlaces,
  staleTime: 1000 * 60 * 10, // 10 menit, gedung jarang berubah
  enabled: role === 'Staff',
})

const [activeBuildingFilter, setActiveBuildingFilter] = useState<string>('All')

const buildingOptions = useMemo(() => {
  if (role !== 'Staff') return [] as string[]
  const buildings = places
    .map((p) => p.building)
    .filter(Boolean)
  return ['All', ...Array.from(new Set(buildings))] as string[]
}, [places, role])


//Console log (debugging)
console.log('isError:', isError, 'error:', error)  // ← tambah ini

console.log('=== DASHBOARD DEBUG ===')
console.log('role:', role)
console.log('user emplid:', user?.emplid)
console.log('total tickets:', tickets.length)
console.log('ticket statuses:', tickets.map((t: any) => ({
  id: t.id,
  status: t.status_name,
  assigned_to: t.assigned_staff_emplid,
})))
console.log('raw ticket[0]:', JSON.stringify(tickets[0], null, 2))
console.log('all ticket status_names:', tickets.map((t: any) => t.status_name))

  // ⚠️ user.name tidak ada di auth store baru — hanya ada emplid & email
  // Matching sekarang pakai emplid, tapi perlu backend juga return assigned_staff_emplid
  // Sementara di-comment dulu bagian yang pakai user.name, ganti ke emplid

const assignedTickets = useMemo(() => {
  if (role !== 'Staff') return []
  return tickets.filter((t: any) =>
    (t.status_name === 'Open' || t.status_name === 'Scheduled') &&
    t.scope_department === dept &&
    (activeBuildingFilter === 'All' || t.building === activeBuildingFilter)
  )
}, [tickets, role, dept, activeBuildingFilter])

const activeTickets = useMemo(() => {
  if (role !== 'Staff') return []
  return tickets.filter((t: any) =>
    (t.status_name === 'In Progress' || t.status_name === 'On Hold') &&
    t.scope_department === dept &&
    (activeBuildingFilter === 'All' || t.building === activeBuildingFilter)
  )
}, [tickets, role, dept, activeBuildingFilter])

const stats = useMemo(() => {
  if (role !== 'Staff') return null
  return {
    assigned: tickets.filter((t: any) => 
  (t.status_name === 'Open' || t.status_name === 'Scheduled') && 
  t.scope_department === dept
).length,
    active: tickets.filter((t: any) => 
  (t.status_name === 'In Progress' || t.status_name === 'On Hold') && 
  t.scope_department === dept
).length,
    completed: tickets.filter((t: any) => t.status_name === 'Resolved' && t.scope_department === dept).length,
  }
}, [tickets, role, dept])

  const filteredTickets = useMemo(() => {
    const statusFilter = FILTER_STATUS_MAP[activeFilter]
    const q = searchQuery.toLowerCase().trim()

    return tickets.filter((t: any) => {
      const matchesFilter = !statusFilter || t.status_name === statusFilter
      const matchesSearch =
        !q ||
        String(t.id).toLowerCase().includes(q) ||
        t.short_description?.toLowerCase().includes(q) ||
        t.issue_type_name?.toLowerCase().includes(q) ||
        t.building?.toLowerCase().includes(q) ||
        t.place_name?.toLowerCase().includes(q)

      return matchesFilter && matchesSearch
    })
  }, [tickets, activeFilter, searchQuery])

  console.log('dept from store:', dept)
console.log('assignedTickets count:', assignedTickets.length)
console.log('activeTickets count:', activeTickets.length)
  return {
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    filteredTickets,
    assignedTickets,
    activeTickets,  
    stats,
    role,
    user,             // ✅ expose user langsung kalau komponen butuh emplid/email
    isLoading, isError, refetch,
    activeBuildingFilter, setActiveBuildingFilter,
  buildingOptions,
  }
}