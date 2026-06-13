import {
  // Status
  CircleIcon,
  ClockIcon,
  ArrowsClockwiseIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ProhibitInsetIcon,
  SealCheckIcon,
  LockSimpleIcon,
  // Ticket type
  WarningIcon,
  ClipboardTextIcon,
  InfoIcon,
  // Category
  PlugIcon,
  DropIcon,
  DoorIcon,
  BroomIcon,
  UsersIcon,
  LeafIcon,
  WrenchIcon,
  // Field info
  MapPinIcon,
  StairsIcon,
  SquaresFourIcon,
  CalendarBlankIcon,
  ChatCircleIcon,
  PaperclipIcon,
  FileTextIcon,
  UserCircleIcon,
  // Actions
  CheckFatIcon,
  XIcon,
  PauseIcon,
  PlayIcon,
  WarningCircleIcon,
  PencilSimpleIcon,
  CameraIcon,
  PaperPlaneTiltIcon,
  // Staff home summary
  TrayIcon,
  HourglassMediumIcon,
  // UI
  MagnifyingGlassIcon,
  FadersIcon,
  PlusIcon,
} from 'phosphor-react-native'

import type { Icon as PhosphorIcon } from 'phosphor-react-native'

// ---------------------------------------------------------------------------
// STATUS ICONS
// ---------------------------------------------------------------------------
export const STATUS_ICONS: Record<string, PhosphorIcon> = {
  open:        CircleIcon,
  pending:     ClockIcon,
  in_progress: ArrowsClockwiseIcon,
  on_hold:     PauseCircleIcon,
  resolved:    CheckCircleIcon,
  unresolved:  XCircleIcon,
  cancelled:   ProhibitInsetIcon,
  rejected:    XCircleIcon,
  approved:    SealCheckIcon,
  auto_closed: LockSimpleIcon,
}

// ---------------------------------------------------------------------------
// TICKET TYPE ICONS
// ---------------------------------------------------------------------------
export const TICKET_TYPE_ICONS: Record<string, PhosphorIcon> = {
  issue:   WarningIcon,
  request: ClipboardTextIcon,
  report:  InfoIcon,
}

// ---------------------------------------------------------------------------
// CATEGORY ICONS
// ---------------------------------------------------------------------------
export const CATEGORY_ICONS: Record<string, PhosphorIcon> = {
  electrical:         PlugIcon,
  plumbing:           DropIcon,
  room_condition:     DoorIcon,
  cleaning:           BroomIcon,
  staff_help:         UsersIcon,
  cleanliness:        LeafIcon,
  facility_condition: WrenchIcon,
}

// ---------------------------------------------------------------------------
// TICKET DETAIL FIELD ICONS
// ---------------------------------------------------------------------------
export const FIELD_ICONS = {
  building:         MapPinIcon,
  floor:            StairsIcon,
  room:             SquaresFourIcon,
  date:             CalendarBlankIcon,
  notes:            ChatCircleIcon,
  attachment:       PaperclipIcon,
  additionalDetail: FileTextIcon,
  staffAvatar:      UserCircleIcon,
} as const

// ---------------------------------------------------------------------------
// ACTION ICONS
// ---------------------------------------------------------------------------
export const ACTION_ICONS = {
  accept:      CheckFatIcon,
  reject:      XIcon,
  hold:        PauseIcon,
  resume:      PlayIcon,
  resolve:     CheckCircleIcon,
  unresolved:  WarningCircleIcon,
  cancel:      XCircleIcon,
  addNote:     PencilSimpleIcon,
  uploadPhoto: CameraIcon,
  submit:      PaperPlaneTiltIcon,
} as const

// ---------------------------------------------------------------------------
// STAFF HOME SUMMARY ICONS
// ---------------------------------------------------------------------------
export const SUMMARY_ICONS = {
  assigned:  TrayIcon,
  active:    HourglassMediumIcon,
  completed: CheckCircleIcon,
} as const

// ---------------------------------------------------------------------------
// UI ICONS
// ---------------------------------------------------------------------------
export const UI_ICONS = {
  search: MagnifyingGlassIcon,
  filter: FadersIcon,
  fab:    PlusIcon,
} as const