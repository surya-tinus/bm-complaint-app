// src/features/dashboard/hooks/useDashboard.ts
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllTickets } from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'

export type FilterLabel = 'All' | 'Pending Assignment' | 'In Progress' | 'On Hold' | 'Resolved' | 'Open'

export const FILTER_OPTIONS: FilterLabel[] = [
  'All', 'Pending Assignment', 'In Progress', 'On Hold', 'Resolved', 'Open',
]

const FILTER_STATUS_MAP: Record<FilterLabel, string | null> = {
  All: null,
  'Pending Assignment': 'Pending Assignment',
  'In Progress': 'In Progress',
  'On Hold': 'On Hold',
  Resolved: 'Resolved',
  Open: 'Open',
}

export function useDashboard() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role                    // ✅ 'rolename' → 'role'
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

  // ⚠️ user.name tidak ada di auth store baru — hanya ada emplid & email
  // Matching sekarang pakai emplid, tapi perlu backend juga return assigned_staff_emplid
  // Sementara di-comment dulu bagian yang pakai user.name, ganti ke emplid
  const assignedTickets = useMemo(() => {
  if (role !== 'Staff') return []
  return tickets.filter((t: any) =>
    t.assigned_staff_emplid === user?.emplid &&
    (t.status_name === 'Open' || t.status_name === 'Pending Assignment')
  )
}, [tickets, role, user?.emplid])

  const activeTickets = useMemo(() => {
  if (role !== 'Staff') return []
  return tickets.filter((t: any) =>
    t.assigned_staff_emplid === user?.emplid &&
    t.status_name === 'In Progress'
  )
}, [tickets, role, user?.emplid])

  const stats = useMemo(() => {
    if (role !== 'Staff') return null
    return {
      assigned: tickets.filter((t: any) =>
  t.assigned_staff_emplid === user?.emplid &&
  (t.status_name === 'Open' || t.status_name === 'Pending Assignment')
).length,
      active: tickets.filter((t: any) =>
        t.assigned_staff_emplid === user?.emplid &&
        t.status_name === 'In Progress'
      ).length,
      completed: tickets.filter((t: any) =>
        t.assigned_staff_emplid === user?.emplid &&
        t.status_name === 'Resolved'
      ).length,
    }
  }, [tickets, role, user?.emplid])

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