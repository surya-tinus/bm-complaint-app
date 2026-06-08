// src/components/ui/StatusBadge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
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
  auto_closed: { user: 'Closed', staff: 'Auto Closed' },
}

interface Props {
  status: string
  role?: 'user' | 'staff'
}

export function StatusBadge({ status, role = 'user' }: Props) {
  const key = normalizeStatus(status)
  const { bg, text } = colors.status[key]
  const label = STATUS_LABEL[key][role]

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: text }]} />
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: typography.sizes.badge,
    fontFamily: typography.fonts.medium,
  },
})