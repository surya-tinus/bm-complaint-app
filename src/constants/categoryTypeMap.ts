import type { CategoryKey } from './colors'
 
export type TicketType = 'issue' | 'request' | 'report'
 
/**
 * Static mapping derived from frontend_developer_guide.md section 4.
 * Backend (issueTypeService.js) does not return a `type` field —
 * this is the single source of truth for category -> type.
 */
export const CATEGORY_TO_TYPE: Record<CategoryKey, TicketType> = {
  electrical:         'issue',
  plumbing:           'issue',
  room_condition:     'issue',
  cleaning:           'request',
  staff_help:         'request',
  cleanliness:        'report',
  facility_condition: 'report',
  general_information: 'report',
  security_issue: 'issue',
}
 