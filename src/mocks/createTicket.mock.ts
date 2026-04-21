import { IssueTypeWithScope } from '@/features/dashboard/types'
import { Place } from '@/features/dashboard/types'

// Mock Issue Types (dari Issue_Types table + join Role_Scopes)
export const MOCK_ISSUE_TYPES: IssueTypeWithScope[] = [
  {
    id: 1,
    name: 'Cleanliness',
    description: 'Trash, dirty areas, or hygiene issues',
    icon: '🧹',
    scope: 'cleanliness',
    defaultPriority: 'low',
  },
  {
    id: 2,
    name: 'Building & Facility',
    description: 'General condition that needs attention but not urgent repair',
    icon: '🏢',
    scope: 'building_facility',
    defaultPriority: 'medium',
  },
  {
    id: 3,
    name: 'Electrical & Lighting',
    description: 'Issues with lights, power outlets, or electrical equipment',
    icon: '⚡',
    scope: 'building_facility',
    defaultPriority: 'high',
  },
  {
    id: 4,
    name: 'HVAC & Air Conditioning',
    description: 'AC not working, bad air circulation, or temperature issues',
    icon: '❄️',
    scope: 'building_facility',
    defaultPriority: 'medium',
  },
  {
    id: 5,
    name: 'Security',
    description: 'Security concerns, suspicious activity, or access issues',
    icon: '🔒',
    scope: 'security',
    defaultPriority: 'high',
  },
  {
    id: 6,
    name: 'Equipment & Tools',
    description: 'Broken or malfunctioning equipment, projectors, or furniture',
    icon: '🔧',
    scope: 'maintenance',
    defaultPriority: 'medium',
  },
  {
    id: 7,
    name: 'Staff Assistance',
    description: 'Request help or assistance from staff members',
    icon: '👥',
    scope: 'staff_assistance',
    defaultPriority: 'low',
  },
  {
    id: 8,
    name: 'Plumbing & Water',
    description: 'Water leaks, clogged drains, or plumbing issues',
    icon: '🚿',
    scope: 'maintenance',
    defaultPriority: 'high',
  },
]

// Mock Places (dari Places table)
export const MOCK_PLACES: Place[] = [
  { id: 1, name: 'Ruangan C1012', building: 'Building C' },
  { id: 2, name: 'Ruangan C707', building: 'Building C' },
  { id: 3, name: 'Lorong D6', building: 'Building D' },
  { id: 4, name: 'Ruangan A301', building: 'Building A' },
  { id: 5, name: 'Lobby B', building: 'Building B' },
  { id: 6, name: 'Toilet Lantai 3', building: 'Building A' },
  { id: 7, name: 'Toilet Lantai 5', building: 'Building B' },
  { id: 8, name: 'Ruangan Meeting B201', building: 'Building B' },
  { id: 9, name: 'Parkiran Basement', building: 'Building A' },
  { id: 10, name: 'Kantin Lantai 1', building: 'Building D' },
]

// Group places by building untuk dropdown
export const MOCK_PLACES_BY_BUILDING = MOCK_PLACES.reduce<Record<string, Place[]>>(
  (acc, place) => {
    if (!acc[place.building]) acc[place.building] = []
    acc[place.building].push(place)
    return acc
  },
  {}
)
