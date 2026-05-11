// src/features/dashboard/components/TicketCard.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StatusBadge } from '@/components/ui/StatusBadge'

const getIssueTypeIcon = (issueTypeName: string): keyof typeof Ionicons.glyphMap => {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Electrical Problem':   'flash-outline',
    'Plumbing':             'water-outline',
    'HVAC':                 'thermometer-outline',
    'Cleanliness':          'sparkles-outline',
    'Security':             'shield-checkmark-outline',
    'Equipment':            'construct-outline',
    'Building & Facility':  'business-outline',
    'Staff Assistance':     'people-outline',
    'Peralatan':            'construct-outline',
    'Fasilitas':            'business-outline',
    'Kebersihan':           'sparkles-outline',
    'Keamanan':             'shield-checkmark-outline',
    'Maintenance':          'build-outline',
  }
  return map[issueTypeName] ?? 'ticket-outline'
}

const getIssueTypeColor = (issueTypeName: string): string => {
  const map: Record<string, string> = {
    'Electrical Problem':   '#F59E0B',
    'Plumbing':             '#0EA5E9',
    'HVAC':                 '#06B6D4',
    'Cleanliness':          '#3B82F6',
    'Security':             '#F59E0B',
    'Equipment':            '#8B5CF6',
    'Building & Facility':  '#EF4444',
    'Staff Assistance':     '#10B981',
    'Peralatan':            '#8B5CF6',
    'Fasilitas':            '#EF4444',
    'Kebersihan':           '#3B82F6',
    'Keamanan':             '#F59E0B',
    'Maintenance':          '#10B981',
  }
  return map[issueTypeName] ?? '#6B7280'
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high:   { label: 'High',   color: '#EF4444' },
}

interface Props {
  ticket: any
  onPress: (ticket: any) => void
}

export function TicketCard({ ticket, onPress }: Props) {
  // Support both backend snake_case and frontend camelCase
  const issueTypeName = ticket.issue_type_name ?? ticket.issueType?.name ?? ''
  const shortDesc = ticket.short_description ?? ticket.shortDescription ?? ''
  const statusName = ticket.status_name ?? ticket.status ?? ''
  const building = ticket.building ?? ticket.place?.building ?? ''
  const placeName = ticket.place_name ?? ticket.place?.name ?? ''
  const reportedAt = ticket.created_at
    ? new Date(ticket.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : ticket.reportedAt ?? ''
  const priority = ticket.priority ?? 'medium'

  const iconName = getIssueTypeIcon(issueTypeName)
  const color = getIssueTypeColor(issueTypeName)
  const priorityConfig = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(ticket)} activeOpacity={0.85}>

      {/* Type + Priority row */}
      <View style={styles.typeRow}>
        <View style={styles.typeLeft}>
          <View style={[styles.typeDot, { backgroundColor: color }]} />
          <Text style={[styles.typeLabel, { color }]}>{issueTypeName}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '18' }]}>
          <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
            {priorityConfig.label}
          </Text>
        </View>
      </View>

      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
          <Ionicons name={iconName} size={20} color={color} />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.ticketId}>#{ticket.id}</Text>
          <Text style={styles.title} numberOfLines={1}>{shortDesc}</Text>
        </View>
        <StatusBadge status={statusName} />
      </View>

      <View style={styles.divider} />

      {/* Meta */}
      <View style={styles.metaItem}>
        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
        <Text style={styles.metaText} numberOfLines={1}>{building}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="enter-outline" size={13} color="#9CA3AF" />
        <Text style={styles.metaText}>{placeName}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="time-outline" size={13} color="#9CA3AF" />
        <Text style={styles.metaText}>Reported on : {reportedAt}</Text>
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
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  titleInfo: { flex: 1, marginLeft: 10 },
  ticketId: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
  metaText: { fontSize: 12, color: '#6B7280' },
})
