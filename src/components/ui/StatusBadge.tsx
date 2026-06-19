// src/components/ui/StatusBadge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  CircleIcon,
  ClockIcon,
  ArrowsClockwiseIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ProhibitInsetIcon,
  SealCheckIcon,
  LockSimpleIcon,
  CalendarIcon
} from 'phosphor-react-native'
import { colors, typography, radius } from '@/constants'
import type { StatusKey } from '@/constants'
import { normalizeStatus } from '@/utils/normalizeStatus'

const STATUS_LABEL: Record<StatusKey, { user: string; staff: string }> = {
  open:        { user: 'Submitted',   staff: 'New Ticket'  },
  pending:     { user: 'Pending',     staff: 'Pending'     },
  in_progress: { user: 'In Progress', staff: 'In Progress' },
  on_hold:     { user: 'On Hold',     staff: 'On Hold'     },
  resolved:    { user: 'Resolved',    staff: 'Resolved'    },
  unresolved:  { user: 'Unresolved',  staff: 'Unresolved'  },
  cancelled:   { user: 'Cancelled',   staff: 'Cancelled'   },
  rejected:    { user: 'Revision',    staff: 'Rejected'    },
  approved:    { user: 'Approved',    staff: 'Approved'    },
  auto_closed: { user: 'Closed',      staff: 'Auto Closed' },
  scheduled: { user: 'Scheduled', staff: 'Scheduled' },
}

type PhosphorIcon = React.ComponentType<{ size: number; color: string; weight: 'bold' }>

const STATUS_ICONS: Record<StatusKey, PhosphorIcon> = {
  open:        CircleIcon,
  pending:     ClockIcon,
  in_progress: ArrowsClockwiseIcon,
  on_hold:     PauseCircleIcon,
  resolved:    CheckCircleIcon,
  unresolved:  XCircleIcon,
  cancelled:   ProhibitInsetIcon,
  rejected:    XCircleIcon,
  approved:    SealCheckIcon,
  auto_closed: LockSimpleIcon,
  scheduled: CalendarIcon,
}

interface Props {
  status: string
  role?: 'user' | 'staff'
}

export function StatusBadge({ status, role = 'user' }: Props) {
  const key = normalizeStatus(status)
  const { bg, text } = colors.status[key]
  const label = STATUS_LABEL[key][role]
  const IconComponent = STATUS_ICONS[key]

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <IconComponent size={11} color={text} weight="bold" />
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.badge,
    gap: 5,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  label: {
    fontSize: typography.sizes.badge,
    fontFamily: typography.fonts.medium,
  },
})