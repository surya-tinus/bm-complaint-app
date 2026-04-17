export type TicketType = 'issue' | 'request' | 'report'
export type TicketStatus =
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'unresolved'
  | 'cancelled'
  | 'rejected'

export type TimelineStepStatus = 'completed' | 'active' | 'inactive'

export interface TimelineStep {
  id: string
  label: string
  description?: string
  timestamp?: string
  status: TimelineStepStatus
}

export interface AssignedStaff {
  id: string
  name: string
  avatarUrl?: string
  role?: string
}

export interface TicketDetail {
  id: string
  title: string
  type: TicketType
  status: TicketStatus
  building: string
  room: string
  reportedAt: string
  // Detail-only fields
  description?: string
  category?: string
  attachments?: string[]
  timeline: TimelineStep[]
  statusLastUpdated: string
  additionalNotes?: string
  assignedStaff?: AssignedStaff
  staffNotes?: string
  staffNotesTime?: string
}

export interface Ticket {
  id: string
  title: string
  type: TicketType
  status: TicketStatus
  building: string
  room: string
  reportedAt: string
}
