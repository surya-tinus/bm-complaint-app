// src/features/dashboard/hooks/useTicketDetail.ts
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTicketById,
  cancelTicket,
  claimTicket,
  resolveTicket,
  approveTicket,
  holdTicket
} from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'
import { Alert } from 'react-native'

export const useTicketDetail = (id: string) => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const dept = user?.dept

  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [pendingAction, setPendingAction] = useState<'claim' | 'resolve' | 'approve' | 'hold' | null>(null)
  const [actionComment, setActionComment] = useState('')
  const [additionalDetailExpanded, setAdditionalDetailExpanded] = useState(false)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false)

  const query = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicketById(id),
    enabled: !!id,
  })
  console.log('raw ticket data:', JSON.stringify(query.data))

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['ticket', id] })
  }

  // ─── Cancel (User/Admin) ───────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(id),
    onSuccess: () => {
      setCancelModalVisible(false)
      invalidate()
    },
  })

  // ─── Claim (Staff) ─────────────────────────────────────
  const claimMutation = useMutation({
    mutationFn: (comment?: string) => claimTicket(id, comment),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
  })

  // ─── Resolve (Staff) ───────────────────────────────────
  const resolveMutation = useMutation({
    mutationFn: (comment?: string) => resolveTicket(id, comment),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
  })

  // ─── Approve (Admin) ───────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: (comment?: string) => approveTicket(id, comment),
    onSuccess: () => {
      setActionModalVisible(false)
      setActionComment('')
      invalidate()
    },
  })

  // ─── Hold (Staff) ───────────────────────────────────
  const holdMutation = useMutation({
  mutationFn: (comment?: string) => holdTicket(id, comment),
  onSuccess: () => {
    setActionModalVisible(false)
    setActionComment('')
    invalidate()
  },
})

 // ─── Trigger dengan dept guard ─────────────────────────
  const triggerAction = (action: 'claim' | 'resolve' | 'approve' | 'hold') => {
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

  const confirmAction = () => {
  if (pendingAction === 'claim') claimMutation.mutate(actionComment || undefined)
  else if (pendingAction === 'resolve') resolveMutation.mutate(actionComment || undefined)
  else if (pendingAction === 'approve') approveMutation.mutate(actionComment || undefined)
  else if (pendingAction === 'hold') holdMutation.mutate(actionComment || undefined)
}

  // ─── Visibility logic ──────────────────────────────────
const status = query.data?.status_name ?? query.data?.status
console.log('DEBUG status:', status, '| role:', role)
const assignedStaffEmplid =
  query.data?.assignedStaff?.emplid ??  // dari getTicketById mapping
  query.data?.assigned_staff_id ??       // ✅ fallback langsung ke raw field backend
  null

const ticketDept = query.data?.scope_department ?? null  // ✅ pakai field yang ada di response

const canClaim =
  role === 'Staff' &&
  !!dept &&           // ← tambah ini
  !assignedStaffEmplid &&
  dept === ticketDept

const canResolve =
  role === 'Staff' &&
  assignedStaffEmplid === user?.emplid &&
  ['In Progress', 'On Hold'].includes(status ?? '')

const canApprove =
  role === 'Admin' &&
  status === 'Pending'

   const canCancel =
  role === 'User' &&
  !['Resolved', 'Cancelled', 'Rejected'].includes(status ?? '')
  
  const canHold =
  role === 'Staff' &&
  assignedStaffEmplid === user?.emplid &&
  status === 'In Progress'


  const isActioning =
  claimMutation.isPending || resolveMutation.isPending || approveMutation.isPending || holdMutation.isPending
  
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
    actionModalVisible,
    setActionModalVisible,
    pendingAction,
    actionComment,
    setActionComment,
    triggerAction,
    confirmAction,
    isActioning,
    canHold,

    // UI state
    additionalDetailExpanded,
    setAdditionalDetailExpanded,
    attachmentsExpanded,
    setAttachmentsExpanded,
  }
}