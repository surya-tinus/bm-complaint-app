//Src/components/ui/StatusBadge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TicketStatus } from '@/features/dashboard/types'

interface StatusConfig {
  label: string
  bg: string
  text: string
  dot: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // snake_case (mock)
  open:               { label: 'Open',               bg: '#E5E7EB', text: '#6B7280', dot: '#9CA3AF' },
  pending:            { label: 'Pending',             bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  in_progress:        { label: 'In Progress',         bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  on_hold:            { label: 'On Hold',             bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  resolved:           { label: 'Resolved',            bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  cancelled:          { label: 'Cancelled',           bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  rejected:           { label: 'Rejected',            bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  unresolved:         { label: 'Unresolved',          bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  // string dari backend
  'Open':             { label: 'Open',               bg: '#E5E7EB', text: '#6B7280', dot: '#9CA3AF' },
  'Pending':          { label: 'Pending',             bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  'In Progress':      { label: 'In Progress',         bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  'On Hold':          { label: 'On Hold',             bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  'Resolved':         { label: 'Resolved',            bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  'Cancelled':        { label: 'Cancelled',           bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  'Scheduled':        { label: 'Scheduled',           bg: '#EDE9FE', text: '#6D28D9', dot: '#8B5CF6' },
  'Pending Assignment': { label: 'Pending Assignment', bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  'Approved':         { label: 'Approved',            bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
}

interface Props {
  status: string  // ← dari TicketStatus jadi string
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    flexShrink: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
})