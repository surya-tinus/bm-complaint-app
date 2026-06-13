// src/constants/colors.ts
export const colors = {
  // Background
  bgBase:     '#F3F4F6',
  bgCard:     '#FFFFFF',
  bgElevated: '#F9FAFB',
  bgOverlay:  'rgba(0,0,0,0.4)',

  // Brand
  brand:       '#1f52d0',
  brandDim:    '#EEF2FF',
  brandText:   '#1f52d0',
  brandSubtle: '#C7D7FA',

  // Border
  borderDefault: '#E5E7EB',
  borderSubtle:  '#F3F4F6',
  borderStrong:  '#D1D5DB',

  // Text
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
  textOnBrand:   '#ffffff',

  // Status — light pill style
  status: {
    open:        { bg: '#F3F4F6', text: '#6B7280',  accent: null       },
    pending:     { bg: '#F3F4F6', text: '#6B7280',  accent: null       },
     approved:    { bg: '#EEF2FF', text: '#4338CA',  accent: '#6366F1'  },
    in_progress: { bg: '#DBEAFE', text: '#1D4ED8',  accent: '#1f52d0'  },
    on_hold:     { bg: '#FEF3C7', text: '#B45309',  accent: '#F59E0B'  },
    resolved:    { bg: '#D1FAE5', text: '#065F46',  accent: '#10B981'  },
    unresolved:  { bg: '#FEE2E2', text: '#991B1B',  accent: '#EF4444'  },
    cancelled:   { bg: '#FEE2E2', text: '#991B1B',  accent: null       },
    rejected:    { bg: '#FEE2E2', text: '#991B1B',  accent: '#EF4444'  },
    auto_closed: { bg: '#F3F4F6', text: '#6B7280', accent: null },
  },

  // Priority
  priority: {
    high:   { bg: '#FEE2E2', text: '#DC2626' },
    medium: { bg: '#FEF3C7', text: '#D97706' },
    low:    { bg: '#D1FAE5', text: '#059669' },
  },

  // Category — dot color + icon circle bg
  category: {
    electrical:         { dot: '#F59E0B', bg: '#FEF3C7' },
    plumbing:           { dot: '#0EA5E9', bg: '#E0F2FE' },
    room_condition:     { dot: '#8B5CF6', bg: '#EDE9FE' },
    cleaning:           { dot: '#6B7280', bg: '#F3F4F6' },
    staff_help:         { dot: '#10B981', bg: '#D1FAE5' },
    cleanliness:        { dot: '#6B7280', bg: '#F3F4F6' },
    facility_condition: { dot: '#EF4444', bg: '#FEE2E2' },
    general_information: { dot: '#8B5CF6', bg: '#EDE9FE' },
security_issue:      { dot: '#EF4444', bg: '#FEE2E2' },
  },
} as const

export type StatusKey = keyof typeof colors.status
export type PriorityKey = keyof typeof colors.priority
export type CategoryKey = keyof typeof colors.category