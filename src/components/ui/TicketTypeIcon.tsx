import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { Icon as PhosphorIcon } from 'phosphor-react-native'
import {
  WarningIcon,
  ClipboardTextIcon,
  InfoIcon,
  PlugIcon,
  DropIcon,
  DoorIcon,
  BroomIcon,
  UsersIcon,
  LeafIcon,
  WrenchIcon,
  ShieldWarningIcon,
} from 'phosphor-react-native'

import { colors, type CategoryKey } from '@/constants'

type TicketType = 'issue' | 'request' | 'report'
type TicketCategory =
  | 'electrical'
  | 'plumbing'
  | 'room_condition'
  | 'cleaning'
  | 'staff_help'
  | 'cleanliness'
  | 'facility_condition'
  | 'general_information'
  | 'security_issue'

interface TicketTypeIconProps {
  type: TicketType
  category?: TicketCategory | string
  variant?: 'dot' | 'badge' | 'plain'
  size?: number
  color?: string  // ← tambah ini
}

const TYPE_ICONS: Record<TicketType, PhosphorIcon> = {
  issue:   WarningIcon,
  request: ClipboardTextIcon,
  report:  InfoIcon,
}

const CATEGORY_ICONS: Partial<Record<TicketCategory, PhosphorIcon>> = {
  electrical:         PlugIcon,
  plumbing:           DropIcon,
  room_condition:     DoorIcon,
  cleaning:           BroomIcon,
  staff_help:         UsersIcon,
  cleanliness:        LeafIcon,
  facility_condition: WrenchIcon,
  general_information: InfoIcon,
  security_issue: ShieldWarningIcon,
}

export function TicketTypeIcon({
  type,
  category,
  variant = 'dot',
  size,
  color,
}: TicketTypeIconProps) {
  const IconComponent: PhosphorIcon =
  (category ? CATEGORY_ICONS[category as TicketCategory] : undefined) ?? TYPE_ICONS[type]

  const categoryColors = category
    ? colors.category[category as CategoryKey]
    : undefined

  const iconColor = color ?? (categoryColors?.dot ?? colors.textSecondary)
  const bgColor = categoryColors?.bg ?? colors.bgElevated

  if (variant === 'plain') {
    return <IconComponent size={size ?? 28} color={iconColor} weight="bold" />
  }

  if (variant === 'badge') {
    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <IconComponent size={size ?? 24} color={iconColor} weight="bold" />
      </View>
    )
  }

  return (
    <View style={[styles.dot, { backgroundColor: bgColor }]}>
      <IconComponent size={size ?? 14} color={iconColor} weight="bold" />
    </View>
  )
}

const styles = StyleSheet.create({
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})