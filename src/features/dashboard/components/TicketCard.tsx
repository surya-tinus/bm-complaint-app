import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { colors, spacing, typography, radius } from '@/constants'
import type { CategoryKey, PriorityKey } from '@/constants'
import { normalizeStatus } from '@/utils/normalizeStatus'

// ─── Category helpers (from v2) ──────────────────────────────────────────────

function resolveCategoryKey(raw: string): CategoryKey {
  const map: Record<string, CategoryKey> = {
    electrical:             'electrical',
    plumbing:               'plumbing',
    room_condition:         'room_condition',
    cleaning:               'cleaning',
    staff_help:             'staff_help',
    cleanliness:            'cleanliness',
    facility_condition:     'facility_condition',
    'Electrical Problem':   'electrical',
    'Plumbing':             'plumbing',
    'Room Condition':       'room_condition',
    'Cleaning':             'cleaning',
    'Staff Assistance':     'staff_help',
    'Cleanliness':          'cleanliness',
    'Facility Condition':   'facility_condition',
    'HVAC':                 'facility_condition',
    'Equipment':            'room_condition',
    'Maintenance':          'facility_condition',
    'Building & Facility':  'facility_condition',
    'Cleaning Issue':       'cleaning',
    'Facility Issue':       'facility_condition',
    'General Information':  'facility_condition',
  }
  return map[raw] ?? 'facility_condition'
}

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  electrical:         'Electrical',
  plumbing:           'Plumbing',
  room_condition:     'Room Condition',
  cleaning:           'Cleaning',
  staff_help:         'Staff Help',
  cleanliness:        'Cleanliness',
  facility_condition: 'Facility',
}

// Maps CategoryKey → Ionicons glyph (visual identity from v1)
const CATEGORY_ICON: Record<CategoryKey, keyof typeof Ionicons.glyphMap> = {
  electrical:         'flash-outline',
  plumbing:           'water-outline',
  room_condition:     'construct-outline',
  cleaning:           'sparkles-outline',
  staff_help:         'people-outline',
  cleanliness:        'sparkles-outline',
  facility_condition: 'business-outline',
}

// ─── Timestamp helper (from v2) ───────────────────────────────────────────────

function formatTimestamp(raw: string | undefined | null): string {
  if (!raw) return ''
  const date = new Date(raw)
  const diff = Date.now() - date.getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60))
    return `${mins} menit lalu`
  }
  if (hours < 24) return `${Math.floor(hours)} jam lalu`
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  ticket: any
  onPress: (ticket: any) => void
  role?: 'user' | 'staff'
  section?: 'active' | 'assigned' | 'history' | 'user'
  onAccept?: (ticket: any) => void
  onReject?: (ticket: any) => void
  onUpdateStatus?: (ticket: any) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TicketCard({
  ticket,
  onPress,
  role = 'user',
  section = 'user',
  onAccept,
  onReject,
  onUpdateStatus,
}: Props) {
  // Field resolution: support both snake_case (backend) and camelCase (frontend)
  const categoryRaw  = ticket.category ?? ticket.issue_type_name ?? ticket.issueType?.name ?? ''
  const shortDesc    = ticket.short_description ?? ticket.shortDescription ?? ''
  const statusRaw    = ticket.status_name ?? ticket.status ?? ''
  const building     = ticket.building ?? ticket.place?.building ?? ''
  const placeName    = ticket.place_name ?? ticket.place?.name ?? ''
  const timestamp    = formatTimestamp(ticket.created_at)
  const priorityRaw  = (ticket.priority ?? 'medium') as PriorityKey

  const categoryKey    = resolveCategoryKey(categoryRaw)
  const categoryColor  = colors.category[categoryKey].dot
  const categoryBg     = colors.category[categoryKey].bg
  const categoryLabel  = CATEGORY_LABEL[categoryKey]
  const iconName       = CATEGORY_ICON[categoryKey]
  const priorityConfig = colors.priority[priorityRaw] ?? colors.priority.medium

  {console.log('StatusBadge value:', ticket.status, ticket.status_name)}

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(ticket)}
      activeOpacity={0.85}
    >
      {/* ── Row 1: Category dot + label / Priority badge ── */}
      <View style={styles.typeRow}>
        <View style={styles.typeLeft}>
          <View style={[styles.typeDot, { backgroundColor: categoryColor }]} />
          <Text style={[styles.typeLabel, { color: categoryColor }]}>
            {categoryLabel}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
          <Text style={[styles.priorityText, { color: priorityConfig.text }]}>
            {priorityRaw.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── Row 2: Icon circle + ID/Title + StatusBadge ── */}
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: categoryBg }]}>
          <Ionicons name={iconName} size={20} color={categoryColor} />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.ticketId}>#{ticket.id}</Text>
          <Text style={styles.title} numberOfLines={1}>{shortDesc}</Text>
        </View>
        
        <StatusBadge status={statusRaw} role={role} />
      </View>

      <View style={styles.divider} />

      {/* ── Meta rows: icon + text inline (v1 style) ── */}
      {building ? (
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={13} color="#9CA3AF" />
          <Text style={styles.metaText} numberOfLines={1}>{building}</Text>
        </View>
      ) : null}
      {placeName ? (
        <View style={styles.metaItem}>
          <Ionicons name="enter-outline" size={13} color="#9CA3AF" />
          <Text style={styles.metaText}>{placeName}</Text>
        </View>
      ) : null}
      {timestamp ? (
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color="#9CA3AF" />
          <Text style={styles.metaText}>Reported on : {timestamp}</Text>
        </View>
      ) : null}

      {/* ── Action buttons (from v2) ── */}
      {section === 'assigned' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnReject}
            onPress={() => onReject?.(ticket)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnRejectText}>Tolak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnAccept}
            onPress={() => onAccept?.(ticket)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnAcceptText}>Terima</Text>
          </TouchableOpacity>
        </View>
      )}

      {section === 'active' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnUpdateStatus}
            onPress={() => onUpdateStatus?.(ticket)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnUpdateStatusText}>Perbarui Status</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Row 1
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  typeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    fontSize: typography.sizes.badge,
    fontFamily: typography.fonts.medium,
    letterSpacing: 0.3,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.badge,
  },
  priorityText: {
    fontSize: typography.sizes.badge,
    fontFamily: typography.fonts.medium,
  },

  // Row 2
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleInfo: {
    flex: 1,
  },
  ticketId: {
    fontSize: typography.sizes.cardId,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.sizes.cardTitle,
    fontFamily: typography.fonts.bold,
    color: colors.textPrimary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },

  // Meta
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btnReject: {
    flex: 1,
    height: 36,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRejectText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: '#DC2626',
  },
  btnAccept: {
    flex: 1.5,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAcceptText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.textOnBrand,
  },
  btnUpdateStatus: {
    flex: 1,
    height: 36,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnUpdateStatusText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.brand,
  },
})