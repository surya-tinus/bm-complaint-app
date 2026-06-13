import type { CategoryKey } from '@/constants'
 
/**
 * Maps various raw category strings (snake_case keys, human-readable labels
 * from backend `category_name`, legacy aliases) to a canonical CategoryKey.
 * Used wherever category-derived colors/icons/types are needed.
 */
export function resolveCategoryKey(raw: string): CategoryKey {
  const map: Record<string, CategoryKey> = {
  electrical:             'electrical',
  plumbing:               'plumbing',
  room_condition:         'room_condition',
  cleaning:               'cleaning',
  staff_help:             'staff_help',
  cleanliness:            'cleanliness',
  facility_condition:     'facility_condition',
  'Electrical Problem':   'electrical',      
  'Plumbing':             'plumbing',
  'Room Condition':       'room_condition',
  'Cleaning':             'cleaning',         
  'Staff Assistance':     'staff_help',
  'Cleanliness':          'cleanliness',
  'Facility Condition':   'facility_condition',
  'HVAC':                 'facility_condition',
  'Equipment':            'room_condition',
  'Maintenance':          'facility_condition',
  'Building & Facility':  'facility_condition',
  'Cleaning Issue':       'cleaning',         
  'Facility Issue':       'facility_condition', 
  // Issue type names dari backend

'Security Issue': 'security_issue',

'Facility Request':     'facility_condition',
'Moving Service':       'staff_help',

// Step1 category names
'Issue':       'facility_condition',
'Request':     'staff_help',
'Information':        'general_information',
'General Information':'general_information',

}
  return map[raw] ?? 'facility_condition'
}