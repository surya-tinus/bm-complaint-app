// src/features/dashboard/hooks/useDashboard.ts
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllTickets } from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'

// FilterLabel type & options
export type FilterLabel = 'All' | 'Approved' | 'In Progress' | 'On Hold' | 'Resolved'

export const FILTER_OPTIONS: FilterLabel[] = [
  'All', 'Approved', 'In Progress', 'On Hold', 'Resolved',
]

const FILTER_STATUS_MAP: Record<FilterLabel, string | null> = {
  All: null,
  'Approved': 'Approved',
  'In Progress': 'In Progress',
  'On Hold': 'On Hold',
  Resolved: 'Resolved',
}

export function useDashboard() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role                    // ✅ 'rolename' → 'role'
  const dept = user?.dept
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')

const { data: tickets = [], isLoading, isError, refetch } = useQuery({
  
  queryKey: ['tickets', user?.emplid],
  queryFn: () => {
    console.log('fetching tickets...')  // ← cek apakah refetch terpanggil
    return getAllTickets()
  },
  staleTime: 1000 * 60 * 2,
  enabled: !!user?.emplid,

  
})

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

  // ⚠️ user.name tidak ada di auth store baru — hanya ada emplid & email
  // Matching sekarang pakai emplid, tapi perlu backend juga return assigned_staff_emplid
  // Sementara di-comment dulu bagian yang pakai user.name, ganti ke emplid
const ISSUE_TYPE_DEPT_MAP: Record<string, string> = {
  'Electrical Problem': 'ME',
  'Facility Issue': 'BM',
  'Facility Request': 'BM',
  'Moving Service': 'BM',
  'Cleaning Issue': 'CS',
  'Cleaning': 'CS',
  'Security Issue': 'SEC',
}

const assignedTickets = useMemo(() => {
  if (role !== 'Staff') return []
  return tickets.filter((t: any) =>
    t.status_name === 'Approved' &&
    ISSUE_TYPE_DEPT_MAP[t.issue_type_name] === dept
  )
}, [tickets, role, dept])

const activeTickets = useMemo(() => {
  if (role !== 'Staff') return []
  return tickets.filter((t: any) =>
    t.status_name === 'In Progress' &&
    ISSUE_TYPE_DEPT_MAP[t.issue_type_name] === dept
  )
}, [tickets, role, dept])

const stats = useMemo(() => {
  if (role !== 'Staff') return null
  return {
    assigned: tickets.filter((t: any) => t.status_name === 'Approved' && ISSUE_TYPE_DEPT_MAP[t.issue_type_name] === dept).length,
    active: tickets.filter((t: any) => t.status_name === 'In Progress' && ISSUE_TYPE_DEPT_MAP[t.issue_type_name] === dept).length,
    completed: tickets.filter((t: any) => t.status_name === 'Resolved' && ISSUE_TYPE_DEPT_MAP[t.issue_type_name] === dept).length,
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
  }
}