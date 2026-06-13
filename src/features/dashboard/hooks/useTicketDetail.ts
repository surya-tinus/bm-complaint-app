// src/features/dashboard/hooks/useTicketDetail.ts
// src/features/dashboard/hooks/useTicketDetail.ts
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTicketById,
  cancelTicket,
  claimTicket,
  resolveTicket,
  approveTicket,
  holdTicket,
  continueTicket,
  commentTicket, 
} from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'
import { Alert } from 'react-native'

export type TicketAction = 'claim' | 'resolve' | 'approve' | 'hold' | 'continue' | 'comment'

export const useTicketDetail = (id: string, externalToken?: string) => {

  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const dept = user?.dept

  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [pendingAction, setPendingAction] = useState<TicketAction | null>(null)
  const [actionComment, setActionComment] = useState('')
  const [additionalDetailExpanded, setAdditionalDetailExpanded] = useState(false)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false)

  const query = useQuery({
    queryKey: ['ticket', id, externalToken],
    queryFn: () => getTicketById(id, externalToken),
    enabled: !!id && String(id).trim() !== '',
  })
  console.log('raw ticket data:', JSON.stringify(query.data))
  

  const invalidate = () => {
    console.log('invalidating, id:', id, typeof id)
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['ticket', id] })
  }

  // ─── Cancel (User) ────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(id),
    onSuccess: () => {
      setCancelModalVisible(false)
      invalidate()
    },
  })

  // ─── Claim (Staff) ────────────────────────────────────
  const claimMutation = useMutation({
    mutationFn: (comment?: string) => claimTicket(id, comment, externalToken),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
    onError: (error: any) => {
      console.log('claim error:', error?.response?.data)
      Alert.alert('Gagal', error?.response?.data?.message ?? 'Terjadi kesalahan')
    },
  })

  // ─── Resolve (Staff) — comment wajib ──────────────────
  const resolveMutation = useMutation({
    mutationFn: (comment: string) => resolveTicket(id, comment),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
    onError: (error: any) => {
      console.log('resolve error:', error?.response?.data)
      Alert.alert('Gagal', error?.response?.data?.message ?? 'Terjadi kesalahan')
    },
  })

  // ─── Approve (Admin) ──────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: (comment?: string) => approveTicket(id, comment),
    onSuccess: (data) => {
      console.log('approve success:', data)
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
    onError: (error: any) => {
      console.log('approve error:', error?.response?.data)
      Alert.alert('Gagal', error?.response?.data?.message ?? 'Terjadi kesalahan')
    },
  })

  // ─── Hold (Staff — assigned only) ────────────────────
  const holdMutation = useMutation({
    mutationFn: (comment?: string) => holdTicket(id, comment),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
    onError: (error: any) => {
      console.log('hold error:', error?.response?.data)
      Alert.alert('Gagal', error?.response?.data?.message ?? 'Terjadi kesalahan')
    },
  })

  // ─── Continue (Staff — resume dari On Hold) ───────────
  const continueMutation = useMutation({
    mutationFn: (comment: string) => continueTicket(id, comment),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
    onError: (error: any) => {
      console.log('continue error:', error?.response?.data)
      Alert.alert('Gagal', error?.response?.data?.message ?? 'Terjadi kesalahan')
    },
  })

  const commentMutation = useMutation({
  mutationFn: (comment: string) => commentTicket(id, comment),
  onSuccess: () => {
    setActionModalVisible(false)
    setActionComment('')
    invalidate()
  },
  onError: (error: any) => {
  console.log('comment error:', error?.response?.status, error?.response?.data)
  Alert.alert('Gagal', error?.response?.data?.message ?? 'Terjadi kesalahan')
},
})

  // ─── Trigger dengan guard ─────────────────────────────
  const triggerAction = (action: TicketAction) => {
    if (action === 'claim' && role === 'Staff' && dept !== ticketDept) {
      Alert.alert(
        'Tidak dapat mengklaim tiket',
        `Tiket ini untuk departemen ${ticketDept}, bukan ${dept}.`
      )
      return
    }
    setPendingAction(action)
    setActionComment('')
    setActionModalVisible(true)
  }

  // ─── Confirm action ───────────────────────────────────
  const confirmAction = () => {
    console.log('confirmAction called, pendingAction:', pendingAction, 'comment:', actionComment)

    if (pendingAction === 'claim')         claimMutation.mutate(actionComment || undefined)
    else if (pendingAction === 'resolve')  resolveMutation.mutate(actionComment)
    else if (pendingAction === 'approve')  approveMutation.mutate(actionComment || undefined)
    else if (pendingAction === 'hold')     holdMutation.mutate(actionComment || undefined)
    else if (pendingAction === 'continue') continueMutation.mutate(actionComment)
    else if (pendingAction === 'comment') commentMutation.mutate(actionComment)
  }

  // ─── Derived state ────────────────────────────────────
  const status = query.data?.status_name ?? query.data?.status
  console.log('DEBUG status:', status, '| role:', role)

  const assignedStaffEmplid =
    query.data?.assignedStaff?.emplid ??
    query.data?.assigned_staff_id ??
    null

  const ticketDept = query.data?.scope_department ?? null
  const categoryName = query.data?.category_name ?? null
  const isInformationTicket = categoryName === 'Information'

  const TERMINAL_STATUSES = ['Resolved', 'Cancelled', 'Rejected']

  // ─── Visibility logic ─────────────────────────────────

  // Staff: claim tiket yang belum ada assigned staff
  const canClaim = externalToken
    ? status === 'Approved' && !assignedStaffEmplid
    : role === 'Staff' &&
      !!dept &&
      !assignedStaffEmplid &&
      dept === ticketDept &&
      status === 'Approved'

  // Staff: resolve — hanya assigned staff, status In Progress atau On Hold
  const canResolve =
    role === 'Staff' &&
    assignedStaffEmplid === user?.emplid &&
    ['In Progress', 'On Hold'].includes(status ?? '')

  // Admin: approve tiket Pending
  const canApprove =
    role === 'Admin' &&
    status === 'Pending' &&
    !isInformationTicket

  // User: cancel — semua status kecuali terminal
  const canCancel =
    role === 'User' &&
    !TERMINAL_STATUSES.includes(status ?? '')

  // Staff: hold — hanya assigned staff, status In Progress
  const canHold =
    role === 'Staff' &&
    assignedStaffEmplid === user?.emplid &&
    status === 'In Progress'

  // Staff: continue — hanya assigned staff, status On Hold
  const canContinue =
    role === 'Staff' &&
    assignedStaffEmplid === user?.emplid &&
    status === 'On Hold'

  // Admin/Staff: ask — selama tiket belum terminal
  // canComment — owner bisa ask, non-owner staff/admin bisa reply, semua via /comment
  const canComment =
  !!status &&
  !['Resolved', 'Cancelled', 'Rejected', 'AUTO CLOSED'].includes(status) &&
  (
    query.data?.ticket_owner_id === user?.emplid ||
    role === 'Admin' ||
    (role === 'Staff' && assignedStaffEmplid === user?.emplid)
  )

  console.log('ticket_owner_id:', query.data?.ticket_owner_id)
console.log('user emplid:', user?.emplid)

  const isActioning =
  claimMutation.isPending ||
  resolveMutation.isPending ||
  approveMutation.isPending ||
  holdMutation.isPending ||
  continueMutation.isPending ||
  commentMutation.isPending

  return {
    ticket: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    role,

    // Cancel
    cancelModalVisible,
    setCancelModalVisible,
    handleCancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    canCancel,

    // Staff/Admin actions
    canClaim,
    canResolve,
    canApprove,
    canHold,
    canContinue,
    canComment,
    actionModalVisible,
    setActionModalVisible,
    pendingAction,
    actionComment,
    setActionComment,
    triggerAction,
    confirmAction,
    isActioning,

    // UI state
    additionalDetailExpanded,
    setAdditionalDetailExpanded,
    attachmentsExpanded,
    setAttachmentsExpanded,
  }
}