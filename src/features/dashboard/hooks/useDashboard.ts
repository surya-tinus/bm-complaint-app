import { useState, useMemo } from 'react'
import { Ticket, TicketStatus } from '@/features/dashboard/types'
import { MOCK_TICKETS } from '@/mocks/dashboard.mock'

// Swap point: ganti MOCK_TICKETS dengan API call di sini nanti
// import { useDashboardService } from '@/services/dashboard.service'

export type FilterLabel = 'All' | 'Pending' | 'In Progress' | 'On Hold' | 'Resolved' | 'Open'

export const FILTER_OPTIONS: FilterLabel[] = [
  'All',
  'Pending',
  'In Progress',
  'On Hold',
  'Resolved',
  'Open',
]

const FILTER_STATUS_MAP: Record<FilterLabel, TicketStatus | null> = {
  All: null,
  Pending: 'pending',
  'In Progress': 'in_progress',
  'On Hold': 'on_hold',
  Resolved: 'resolved',
  Open: 'open',
}

export function useDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All')

  // Swap point: ganti dengan data dari API/service nanti
  const tickets: Ticket[] = MOCK_TICKETS

  const filteredTickets = useMemo(() => {
    const statusFilter = FILTER_STATUS_MAP[activeFilter]
    const q = searchQuery.toLowerCase().trim()

    return tickets.filter((t) => {
      const matchesFilter = !statusFilter || t.status === statusFilter
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.building.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [tickets, activeFilter, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredTickets,
  }
}