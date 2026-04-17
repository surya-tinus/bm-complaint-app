import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ticket, TicketType } from '@/features/dashboard/types'
import { StatusBadge } from '@/components/ui/StatusBadge'


interface TypeConfig {
  label: string
  color: string
  icon: string
}

const TYPE_CONFIG: Record<TicketType, TypeConfig> = {
  request: { label: 'Request', color: '#8B5CF6', icon: '◎' },
  issue:   { label: 'Issue',   color: '#EF4444', icon: '⚡' },
  report:  { label: 'Report',  color: '#3B82F6', icon: '◉' },
}

interface Props {
  ticket: Ticket
  onPress: (ticket: Ticket) => void
}

export function TicketCard({ ticket, onPress }: Props) {
  const typeConfig = TYPE_CONFIG[ticket.type]

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(ticket)} activeOpacity={0.85}>
      {/* Type label */}
      <View style={styles.typeRow}>
        <View style={[styles.typeDot, { backgroundColor: typeConfig.color }]} />
        <Text style={[styles.typeLabel, { color: typeConfig.color }]}>{typeConfig.label}</Text>
      </View>

      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: typeConfig.color + '18' }]}>
          <Text style={styles.typeIcon}>{typeConfig.icon}</Text>
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
          <Text style={styles.title} numberOfLines={1}>{ticket.title}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>

      <View style={styles.divider} />

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>{ticket.building}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🚪</Text>
          <Text style={styles.metaText}>{ticket.room}</Text>
        </View>
      </View>
      <View style={styles.metaItem}>
        <Text style={styles.metaIcon}>🕐</Text>
        <Text style={styles.metaText}>Reported on : {ticket.reportedAt}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: {
    fontSize: 18,
  },
  titleInfo: {
    flex: 1,
    marginLeft: 10,
  },
  ticketId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
})