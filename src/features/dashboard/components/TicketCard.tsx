import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Ticket, PriorityLevel } from '@/features/dashboard/types'
import { StatusBadge } from '@/components/ui/StatusBadge'

// 1. Definisikan tipe untuk kombinasi library icon
export type IconConfig =
  | { family: 'Ionicons'; name: keyof typeof Ionicons.glyphMap }
  | { family: 'MaterialCommunityIcons'; name: keyof typeof MaterialCommunityIcons.glyphMap }

// 2. Update fungsi mapping untuk mengembalikan IconConfig
const getIssueTypeIcon = (issueTypeName: string): IconConfig => {
  const map: Record<string, IconConfig> = {
    'Peralatan':               { family: 'Ionicons', name: 'construct-outline' },
    'Fasilitas':               { family: 'MaterialCommunityIcons', name: 'office-building-outline' },
    'Kebersihan':              { family: 'MaterialCommunityIcons', name: 'broom' },
    'Keamanan':                { family: 'Ionicons', name: 'shield-checkmark-outline' },
    'Maintenance':             { family: 'Ionicons', name: 'build-outline' },
    'Cleanliness':             { family: 'MaterialCommunityIcons', name: 'broom' },
    'Building & Facility':     { family: 'MaterialCommunityIcons', name: 'office-building-outline' },
    'Electrical & Lighting':   { family: 'MaterialCommunityIcons', name: 'lightning-bolt-outline' },
    'HVAC & Air Conditioning': { family: 'MaterialCommunityIcons', name: 'air-conditioner' },
    'Security':                { family: 'Ionicons', name: 'shield-checkmark-outline' },
    'Equipment & Tools':       { family: 'Ionicons', name: 'construct-outline' },
    'Staff Assistance':        { family: 'Ionicons', name: 'people-outline' },
    'Plumbing & Water':        { family: 'MaterialCommunityIcons', name: 'pipe-leak' },
  }
  return map[issueTypeName] ?? { family: 'Ionicons', name: 'ticket-outline' }
}

const getIssueTypeColor = (issueTypeName: string): string => {
  const map: Record<string, string> = {
    'Peralatan':               '#8B5CF6',
    'Fasilitas':               '#EF4444',
    'Kebersihan':              '#3B82F6',
    'Keamanan':                '#F59E0B',
    'Maintenance':             '#10B981',
    'Cleanliness':             '#3B82F6',
    'Building & Facility':     '#EF4444',
    'Electrical & Lighting':   '#F59E0B',
    'HVAC & Air Conditioning': '#06B6D4',
    'Security':                '#F59E0B',
    'Equipment & Tools':       '#8B5CF6',
    'Staff Assistance':        '#10B981',
    'Plumbing & Water':        '#0EA5E9',
  }
  return map[issueTypeName] ?? '#6B7280'
}

const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high:   { label: 'High',   color: '#EF4444' },
}

interface Props {
  ticket: Ticket
  onPress: (ticket: Ticket) => void
}

// 3. Buat komponen pembantu untuk merender icon sesuai library-nya
const DynamicIcon = ({ config, size, color }: { config: IconConfig, size: number, color: string }) => {
  if (config.family === 'Ionicons') {
    return <Ionicons name={config.name} size={size} color={color} />
  }
  if (config.family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={config.name} size={size} color={color} />
  }
  return null
}

export function TicketCard({ ticket, onPress }: Props) {
  // 4. Panggil config icon-nya
   console.log('ticket.priority:', ticket.priority)
  const iconConfig = getIssueTypeIcon(ticket.issueType.name)
  const color = getIssueTypeColor(ticket.issueType.name)
  const priority = PRIORITY_CONFIG[ticket.priority]

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(ticket)} activeOpacity={0.85}>

      {/* Type + Priority row */}
      <View style={styles.typeRow}>
        <View style={styles.typeLeft}>
          <View style={[styles.typeDot, { backgroundColor: color }]} />
          <Text style={[styles.typeLabel, { color }]}>{ticket.issueType.name}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priority.color + '18' }]}>
          <Text style={[styles.priorityText, { color: priority.color }]}>
            {priority.label}
          </Text>
        </View>
      </View>

      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
          {/* 5. Render menggunakan DynamicIcon */}
          <DynamicIcon config={iconConfig} size={20} color={color} />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
          <Text style={styles.title} numberOfLines={1}>{ticket.shortDescription}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>

      <View style={styles.divider} />

      {/* Meta */}
      <View style={styles.metaItem}>
        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
        <Text style={styles.metaText} numberOfLines={1}>{ticket.place.building}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="document-outline" size={13} color="#9CA3AF" />
        <Text style={styles.metaText}>{ticket.place.name}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="time-outline" size={13} color="#9CA3AF" />
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
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
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
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
})