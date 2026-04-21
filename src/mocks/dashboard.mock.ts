//src/mocks/dashboard.mock.ts
import { Ticket } from '@/features/dashboard/types'

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-0001-1113',
    shortDescription: 'Proyektor Bermasalah',
    issueType: { id: 1, name: 'Peralatan', defaultPriority: 'medium' },
    status: 'on_hold',
    place: { id: 1, name: 'Ruangan C1012', building: 'Building C 10th Floor' },
    priority: 'medium',
    reportedAt: '23 March 2026, 08:00',
  },
  {
    id: 'TKT-0001-1112',
    shortDescription: 'Lampu Mati',
    issueType: { id: 2, name: 'Fasilitas', defaultPriority: 'high' },
    status: 'in_progress',
    place: { id: 2, name: 'Ruangan C707', building: 'Building C 7th Floor' },
    priority: 'high',
    reportedAt: '22 March 2026, 11:00',
  },
  {
    id: 'TKT-0001-1111',
    shortDescription: 'Tempat Sampah Penuh',
    issueType: { id: 3, name: 'Kebersihan', defaultPriority: 'low' },
    status: 'resolved',
    place: { id: 3, name: 'Lorong D6', building: 'Building D 6th Floor' },
    priority: 'low',
    reportedAt: '21 March 2026, 14:00',
  },
  {
    id: 'TKT-0001-1110',
    shortDescription: 'AC Tidak Dingin',
    issueType: { id: 2, name: 'Fasilitas', defaultPriority: 'high' },
    status: 'open',
    place: { id: 4, name: 'Ruangan A301', building: 'Building A 3rd Floor' },
    priority: 'high',
    reportedAt: '20 March 2026, 09:30',
  },
  {
    id: 'TKT-0001-1109',
    shortDescription: 'Permintaan Kebersihan',
    issueType: { id: 3, name: 'Kebersihan', defaultPriority: 'low' },
    status: 'cancelled',
    place: { id: 5, name: 'Lobby B', building: 'Building B 2nd Floor' },
    priority: 'low',
    reportedAt: '19 March 2026, 13:00',
  },
]
