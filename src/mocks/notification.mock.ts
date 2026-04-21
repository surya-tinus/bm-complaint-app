// src/mocks/notification.mock.ts
import { AppNotification } from '@/types/notification.types'

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    ticketId: 'TKT-0001-1112',
    trigger: 'ticket_in_progress',
    title: 'Tiket Sedang Diproses',
    body: 'Tiket #TKT-0001-1112 (Lampu Mati) sedang ditangani oleh teknisi.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 menit lalu
  },
  {
    id: 'notif-002',
    ticketId: 'TKT-0001-1112',
    trigger: 'staff_notes_added',
    title: 'Catatan Staff Baru',
    body: 'Staff menambahkan catatan pada tiket #TKT-0001-1112: "Lampu akan diganti hari ini."',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 menit lalu
  },
  {
    id: 'notif-003',
    ticketId: 'TKT-0001-1111',
    trigger: 'ticket_resolved',
    title: 'Tiket Selesai Ditangani',
    body: 'Tiket #TKT-0001-1111 (Tempat Sampah Penuh) telah diselesaikan.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 jam lalu
  },
  {
    id: 'notif-004',
    ticketId: 'TKT-0001-1110',
    trigger: 'ticket_assigned',
    title: 'Staff Ditugaskan',
    body: 'Staff telah ditugaskan untuk menangani tiket #TKT-0001-1110 (AC Tidak Dingin).',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 jam lalu
  },
]
