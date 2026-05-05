// src/features/dashboard/hooks/useDashboard.ts
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllTickets } from '@/services/ticket.service'

export type FilterLabel = 'All' | 'Pending' | 'In Progress' | 'On Hold' | 'Resolved' | 'Open'

export const FILTER_OPTIONS: FilterLabel[] = [
  'All', 'Pending', 'In Progress', 'On Hold', 'Resolved', 'Open',
]

// Sesuaikan dengan status_name dari backend
const FILTER_STATUS_MAP: Record<FilterLabel, string | null> = {
  All: null,
  Pending: 'Pending',
  'In Progress': 'In Progress',
  'On Hold': 'On Hold',
  Resolved: 'Resolved',
  Open: 'Open',
}

export function useDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')

  const { data: tickets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getAllTickets(),
    staleTime: 1000 * 60 * 2, // 2 menit cache
  })

  const filteredTickets = useMemo(() => {
    const statusFilter = FILTER_STATUS_MAP[activeFilter]
    const q = searchQuery.toLowerCase().trim()

    return tickets.filter((t: any) => {
      const matchesFilter = !statusFilter || t.status_name === statusFilter
      const matchesSearch =
        !q ||
        String(t.id).toLowerCase().includes(q) ||
        (t.short_description?.toLowerCase().includes(q)) ||
        (t.category_name?.toLowerCase().includes(q))

      return matchesFilter && matchesSearch
    })
  }, [tickets, activeFilter, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredTickets,
    isLoading,
    isError,
    refetch,
  }
}
