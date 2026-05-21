//src/features/dashboard/types.ts
// ─── Enums (aligned to ERD) ────────────────────────────────

export type PriorityLevel = 'low' | 'medium' | 'high'
export type TimelineStepStatus = 'completed' | 'active' | 'inactive'

export type TicketStatus =
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'unresolved'
  | 'cancelled'
  | 'rejected'

export type RequestStatus = 'pending' | 'accepted' | 'rejected'

export type RoleScope =
  | 'cleanliness'
  | 'building_facility'
  | 'security'
  | 'maintenance'
  | 'staff_assistance'

// ─── Lookup Types ──────────────────────────────────────────

export interface IssueType {
  id: number
  name: string
  defaultPriority: PriorityLevel
}

// IssueType dengan info tambahan untuk UI create ticket
export interface IssueTypeWithScope extends IssueType {
  scope: RoleScope
  description: string
  icon: string
}

export interface Place {
  id: number
  name: string
  building: string
}

// ─── User & Staff ──────────────────────────────────────────

export interface TicketOwner {
  id: string
  name: string
  email: string
}

export interface AssignedStaff {
  id: string
  name: string
  role?: string
  avatarUrl?: string
}

// ─── Attachment ────────────────────────────────────────────

export interface Attachment {
  id: number
  historyId: number
  fileName: string
  filePath: string
}

// ─── Timeline / History ────────────────────────────────────

export interface TimelineStep {
  id: string
  label: string
  description?: string
  timestamp?: string
  status: 'completed' | 'active' | 'inactive'
  changedBy?: string        // ← tambah
  attachments?: {           // ← tambah
    file_name: string
    file_path: string
  }[]
}

// ─── Ticket (list view) ────────────────────────────────────

export interface Ticket {
  id: string
  shortDescription: string
  issueType: IssueType
  status: TicketStatus
  place: Place
  priority: PriorityLevel
  reportedAt: string
}

// ─── Ticket Detail ─────────────────────────────────────────

export interface TicketDetail {
  id: string
  shortDescription: string
  description: string
  issueType: IssueType
  status: TicketStatus
  place: Place
  priority: PriorityLevel
  reportedAt: string
  updatedAt: string
  owner?: TicketOwner
  timeline: TimelineStep[]
  statusLastUpdated: string
  additionalNotes?: string
  assignedStaff?: AssignedStaff
  staffNotes?: string
  staffNotesTime?: string
  attachments: Attachment[]
}

// ─── Create Ticket ─────────────────────────────────────────

// Payload untuk POST /tickets
export interface CreateTicketPayload {
  issueTypeId: number
  placeId: number
  shortDescription: string
  description: string
  priority: PriorityLevel
}

// Form state untuk multi-step
export interface CreateTicketForm {
  selectedIssueType: IssueTypeWithScope | null
  placeId: number | null
  shortDescription: string
  description: string
  attachmentUris: string[]
}

// ─── Cancel Request ────────────────────────────────────────

// POST /requests (bukan PATCH /tickets/:id/cancel)
export interface CancelTicketPayload {
  ticketId: number
  requestedBy: string
  description: string
}
