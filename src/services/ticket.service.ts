// src/services/ticket.service.ts
import { api } from './api'
import { config } from '@/constants/config'
import { MOCK_TICKETS } from '@/mocks/dashboard.mock'
import { MOCK_TICKET_DETAILS } from '@/mocks/ticketDetail.mock'
import { PriorityLevel } from '@/features/dashboard/types'
import { useAuthStore } from '@/store/auth.store'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// ─── GET ALL TICKETS ───────────────────────────────────────

export const getAllTickets = async (params?: {
  page?: number
  limit?: number
  statusId?: number
  search?: string
}) => {
  console.log('USE_MOCK value:', config.USE_MOCK)
  console.log('type:', typeof config.USE_MOCK)
  if (config.USE_MOCK) {
    await delay(600)
    return MOCK_TICKETS
  }

  const { data } = await api.get('/tickets', { params })
  console.log('raw response:', JSON.stringify(data, null, 2))
  console.log('role dari store:', useAuthStore.getState().user?.role) // ✅ rolename → role
  console.log('jumlah ticket:', data.data.length)
  console.log('raw ticket[0]:', JSON.stringify(data.data[0]))

  return data.data.map((t: any) => ({
    ...t,
    id: String(t.id),
    shortDescription: t.short_description,
    reportedAt: new Date(t.created_at).toLocaleDateString('id-ID'),
    status: t.status_name,
    issueType: { name: t.issue_type_name },
    place: { building: t.building, name: t.place_name },
    priority: t.priority as PriorityLevel,
    staffEmplid: t.staff_emplid ?? null,
  }))
}

// ─── GET TICKET BY ID ──────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
  CREATE_TICKET:   'Tiket Dibuat',
  APPROVE_TICKET:  'Tiket Disetujui',
  ASSIGN_STAFF:    'Staff Ditugaskan',
  CLAIM_TICKET:    'Tiket Diklaim',
  HOLD_TICKET:     'Tiket Di-hold',
  ADD_INFORMATION: 'Informasi Ditambahkan',
  RESOLVE_TICKET:  'Tiket Diselesaikan',
  CANCEL_TICKET:   'Tiket Dibatalkan',
  REJECT_TICKET:   'Tiket Ditolak',
  UPDATE_TICKET:   'Tiket Diperbarui',
}

export const getTicketById = async (id: string) => {
  if (config.USE_MOCK) {
    await delay(500)
    const ticket = MOCK_TICKET_DETAILS[id]
    if (!ticket) throw new Error('Tiket tidak ditemukan')
    return ticket
  }

  const { data } = await api.get(`/tickets/${id}`)
  const t = data.data

  // Ambil semua attachments dari semua history entry, flatten jadi satu array
const attachments = (t.history ?? []).flatMap((h: any, histIndex: number) =>
  (h.attachments ?? []).map((att: any, attIndex: number) => ({
    id: histIndex * 100 + attIndex,
    historyId: h.id,
    fileName: att.file_name,
    filePath: att.file_path,
  }))
)

  // Timeline — balik dari DESC ke ASC, entry terbaru = active
  const chronological = [...(t.history ?? [])].reverse()
  const timeline = chronological.map((h: any, index: number) => ({
    id: String(h.id),
    label: ACTION_LABEL[h.action_name] ?? h.action_name,
    description: h.comment ?? undefined,
    timestamp: new Date(h.created_at).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    status: index === chronological.length - 1 ? 'active' : 'completed',
    changedBy: h.changed_by_name ?? undefined,
    attachments: h.attachments ?? [],
  }))

  // Staff notes — ambil dari history yang punya comment, terbaru
  const historyWithComment = t.history?.find((h: any) => h.comment !== null)

  return {
    ...t,
    id: String(t.id),
    shortDescription: t.short_description,
    reportedAt: new Date(t.created_at).toLocaleDateString('id-ID'),
    status: t.status_name,
    issueType: { name: t.issue_type_name },
    place: { building: t.building, name: t.place_name },
    priority: t.priority as PriorityLevel,
    assignedStaff: t.assigned_staff_id ? {
      name: t.assigned_staff_name ?? t.staff_email,
      emplid: t.assigned_staff_id,
      role: null,
    } : null,
    staffNotes: historyWithComment?.comment ?? null,
    staffNotesTime: historyWithComment?.created_at
      ? new Date(historyWithComment.created_at).toLocaleDateString('id-ID')
      : null,
    additionalNotes: null,
    statusLastUpdated: new Date(t.updated_at).toLocaleDateString('id-ID'),
    timeline,
    attachments,
  }
}

// ─── CREATE TICKET ─────────────────────────────────────────

export const createTicket = async (payload: {
  issue_type_id: number
  place_id: number
  short_description: string
  description: string
  priority: string
  attachmentUris?: string[]
}) => {
  console.log('createTicket called with:', JSON.stringify(payload))
  try {
    const form = new FormData()

  form.append('issue_type_id', String(payload.issue_type_id))
  form.append('place_id', String(payload.place_id))
  form.append('short_description', payload.short_description)
  form.append('description', payload.description)
  form.append('priority', payload.priority)

  payload.attachmentUris?.forEach((uri, index) => {
    const filename = uri.split('/').pop() ?? `photo_${index}.jpg`
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
    form.append('attachments', {
      uri,
      name: filename,
      type: mimeType,
    } as any)
  })
  console.log('sending to:', api.defaults.baseURL + '/tickets')
    const { data } = await api.post('/tickets', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    console.log('createTicket success:', data)
    return data
  } catch (error: any) {
    console.log('createTicket ERROR:', error.response?.status, error.response?.data)
    throw error
  }
}

// ─── CANCEL TICKET ─────────────────────────────────────────

export const cancelTicket = async (id: string) => {
  if (config.USE_MOCK) {
    await delay(800)
    return
  }

  const { data } = await api.post(`/tickets/${id}/cancel`)
  return data
}

// ─── CLAIM TICKET (Staff) ──────────────────────────────────

export const claimTicket = async (id: string, comment?: string) => {
  if (config.USE_MOCK) {
    await delay(800)
    return
  }

  const { data } = await api.post(`/tickets/${id}/claim`, { comment })
  return data
}

// ─── RESOLVE TICKET (Staff) ────────────────────────────────

export const resolveTicket = async (id: string, comment?: string) => {
  if (config.USE_MOCK) {
    await delay(800)
    return
  }

  const { data } = await api.post(`/tickets/${id}/resolve`, { comment })
  return data
}

// ─── APPROVE TICKET (Admin) ────────────────────────────────

export const approveTicket = async (id: string, comment?: string) => {
  if (config.USE_MOCK) {
    await delay(800)
    return
  }

  const { data } = await api.post(`/tickets/${id}/approve`, { comment })
  return data
}

// ─── REJECT TICKET (Admin) ────────────────────────────────

export const rejectTicket = async (id: string, reason: string) => {
  if (config.USE_MOCK) { await delay(800); return }
  const { data } = await api.post(`/tickets/${id}/reject`, { reason })
  return data
}

// ─── HOLD TICKET (Staff) ────────────────────────────────
export const holdTicket = async (id: string, comment?: string) => {
  if (config.USE_MOCK) { await delay(800); return }
  const { data } = await api.post(`/tickets/${id}/hold`, { comment })
  return data
}

// ─── ADDITIONAL NOTE (Staff) ────────────────────────────────
export const addInfo = async (id: string, comment: string) => {
  if (config.USE_MOCK) { await delay(800); return }
  const { data } = await api.post(`/tickets/${id}/addInfo`, { comment })
  return data
}