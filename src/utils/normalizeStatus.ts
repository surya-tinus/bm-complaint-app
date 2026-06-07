import type { StatusKey } from '@/constants'

const STATUS_MAP: Record<string, StatusKey> = {
  // snake_case
  open:        'open',
  pending:     'pending',
  in_progress: 'in_progress',
  on_hold:     'on_hold',
  resolved:    'resolved',
  unresolved:  'unresolved',
  cancelled:   'cancelled',
  rejected:    'rejected',
  approved:    'approved', 
  // PascalCase / display string dari backend
  Open:        'open',
  Pending:     'pending',
  'In Progress': 'in_progress',
  'On Hold':   'on_hold',
  Resolved:    'resolved',
  Unresolved:  'unresolved',
  Cancelled:   'cancelled',
  Rejected:    'rejected',
  Approved:    'approved',
}

export function normalizeStatus(raw: string): StatusKey {
  return STATUS_MAP[raw] ?? 'pending'
}