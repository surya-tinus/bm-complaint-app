// src/types/notification.types.ts

export type NotificationTrigger =
  | 'ticket_assigned'
  | 'ticket_in_progress'
  | 'ticket_resolved'
  | 'ticket_on_hold'
  | 'ticket_rejected'
  | 'ticket_cancelled'
  | 'staff_notes_added'

export interface AppNotification {
  id: string
  ticketId: string
  trigger: NotificationTrigger
  title: string
  body: string
  isRead: boolean
  createdAt: string // ISO string
}

// Payload yang dikirim backend via push (nanti)
export interface PushNotificationPayload {
  ticketId: string
  trigger: NotificationTrigger
  title: string
  body: string
}
