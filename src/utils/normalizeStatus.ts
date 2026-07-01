// src/utils/normalizeStatus.ts
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
  // @deprecated — backend rename 'Approved' -> 'Open' (lihat seed.sql Ticket_Statuses).
  // Backend tidak lagi mengirim string ini untuk tiket baru. Dipertahankan sebagai
  // jaring pengaman untuk data lama/histori yang mungkin masih menyimpan nilai ini.
  // Aman dihapus setelah dipastikan tidak ada lagi data lama yang bergantung padanya.
  approved:    'approved', 
  auto_closed:   'auto_closed',
  // PascalCase / display string dari backend
  Open:        'open',
  Pending:     'pending',
  'In Progress': 'in_progress',
  'On Hold':   'on_hold',
  Resolved:    'resolved',
  Unresolved:  'unresolved',
  Cancelled:   'cancelled',
  Rejected:    'rejected',
  // @deprecated — lihat catatan di atas pada key 'approved'
  Approved:    'approved',
  'AUTO CLOSED': 'auto_closed',
  'Auto Closed': 'auto_closed', 
  scheduled:   'scheduled',
Scheduled:   'scheduled',
}

export function normalizeStatus(raw: string): StatusKey {
  return STATUS_MAP[raw] ?? 'pending'
}