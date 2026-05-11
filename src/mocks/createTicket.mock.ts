// src/mocks/createTicket.mock.ts
import { IssueTypeWithScope } from '@/features/dashboard/types'
import { Place } from '@/features/dashboard/types'

// ─── Issue Types (dari DB: SELECT id, name, default_priority FROM Issue_Types) ──

export const MOCK_ISSUE_TYPES: IssueTypeWithScope[] = [
  {
    id: 1,
    name: 'General Information',
    description: 'General inquiries or information requests about the building.',
    icon: 'information-circle-outline',
    scope: 'staff_assistance',
    defaultPriority: 'low',
  },
  {
    id: 2,
    name: 'Electrical Problem',
    description: 'Issues with lights, power outlets, or electrical equipment.',
    icon: 'flash-outline',
    scope: 'building_facility',
    defaultPriority: 'high',
  },
  {
    id: 3,
    name: 'Facility Issue',
    description: 'General facility condition that needs attention or repair.',
    icon: 'business-outline',
    scope: 'building_facility',
    defaultPriority: 'high',
  },
  {
    id: 4,
    name: 'Cleaning Issue',
    description: 'Trash, dirty areas, spills, or hygiene-related issues.',
    icon: 'sparkles-outline',
    scope: 'cleanliness',
    defaultPriority: 'low',
  },
  {
    id: 5,
    name: 'Security Issue',
    description: 'Security concerns, suspicious activity, or access issues.',
    icon: 'shield-checkmark-outline',
    scope: 'security',
    defaultPriority: 'high',
  },
  {
    id: 6,
    name: 'Facility Request',
    description: 'Request for facility setup, arrangement, or maintenance.',
    icon: 'construct-outline',
    scope: 'building_facility',
    defaultPriority: 'medium',
  },
  {
    id: 7,
    name: 'Moving Service',
    description: 'Request assistance to move furniture or equipment.',
    icon: 'move-outline',
    scope: 'maintenance',
    defaultPriority: 'low',
  },
  {
    id: 8,
    name: 'Cleaning',
    description: 'Request for cleaning service in a specific area.',
    icon: 'brush-outline',
    scope: 'cleanliness',
    defaultPriority: 'low',
  },
]

// ─── Places (dari DB: SELECT id, name, building FROM Places) ─────────────────
// Tambah lebih banyak sesuai hasil query lengkap

export const MOCK_PLACES: Place[] = [
  // Building B
  { id: 1,  name: 'B201', building: 'Building B' },
  { id: 2,  name: 'B202', building: 'Building B' },
  { id: 3,  name: 'B203', building: 'Building B' },
  { id: 4,  name: 'B204', building: 'Building B' },
  { id: 5,  name: 'B205', building: 'Building B' },
  { id: 6,  name: 'B206', building: 'Building B' },
  { id: 7,  name: 'B207', building: 'Building B' },
  { id: 8,  name: 'B208', building: 'Building B' },
  { id: 9,  name: 'B209', building: 'Building B' },
  { id: 10, name: 'B210', building: 'Building B' },
  // Building C
  { id: 11, name: 'C201', building: 'Building C' },
  { id: 12, name: 'C202', building: 'Building C' },
  { id: 13, name: 'C203', building: 'Building C' },
  { id: 14, name: 'C204', building: 'Building C' },
]

// Group by building untuk dropdown
export const MOCK_PLACES_BY_BUILDING = MOCK_PLACES.reduce<Record<string, Place[]>>(
  (acc, place) => {
    if (!acc[place.building]) acc[place.building] = []
    acc[place.building].push(place)
    return acc
  },
  {}
)
