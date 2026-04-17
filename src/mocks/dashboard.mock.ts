import { Ticket } from '@/features/dashboard/types'

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-0001-1113',
    title: 'Proyektor Bermasalah',
    type: 'request',
    status: 'on_hold',
    building: 'Building C 10th Floor',
    room: 'Ruangan C1012',
    reportedAt: '23 March 2026, 08:00',
  },
  {
    id: 'TKT-0001-1112',
    title: 'Lampu Mati',
    type: 'issue',
    status: 'in_progress',
    building: 'Building C 7th Floor',
    room: 'Ruangan C707',
    reportedAt: '22 March 2026, 11:00',
  },
  {
    id: 'TKT-0001-1111',
    title: 'Tempat Sampah Penuh',
    type: 'report',
    status: 'resolved',
    building: 'Building D 6th Floor',
    room: 'Lorong D6',
    reportedAt: '21 March 2026, 14:00',
  },
  {
    id: 'TKT-0001-1110',
    title: 'AC Tidak Dingin',
    type: 'issue',
    status: 'open',
    building: 'Building A 3rd Floor',
    room: 'Ruangan A301',
    reportedAt: '20 March 2026, 09:30',
  },
  {
    id: 'TKT-0001-1109',
    title: 'Permintaan Kebersihan',
    type: 'request',
    status: 'cancelled',
    building: 'Building B 2nd Floor',
    room: 'Lobby B',
    reportedAt: '19 March 2026, 13:00',
  },
]