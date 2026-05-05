// src/features/dashboard/hooks/useTicketDetail.ts
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTicketById,
  cancelTicket,
  claimTicket,
  resolveTicket,
  approveTicket,
} from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'

export const useTicketDetail = (id: string) => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const role = user?.rolename // 'Admin' | 'Staff' | 'User'

  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [pendingAction, setPendingAction] = useState<'claim' | 'resolve' | 'approve' | null>(null)
  const [actionComment, setActionComment] = useState('')
  const [additionalDetailExpanded, setAdditionalDetailExpanded] = useState(false)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false)

  const query = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicketById(id),
    enabled: !!id,
  })

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

  // ─── Action trigger ────────────────────────────────────
  const triggerAction = (action: 'claim' | 'resolve' | 'approve') => {
    setPendingAction(action)
    setActionComment('')
    setActionModalVisible(true)
  }

  const confirmAction = () => {
    if (pendingAction === 'claim') claimMutation.mutate(actionComment || undefined)
    else if (pendingAction === 'resolve') resolveMutation.mutate(actionComment || undefined)
    else if (pendingAction === 'approve') approveMutation.mutate(actionComment || undefined)
  }

  // ─── Visibility logic ──────────────────────────────────
  const status = query.data?.status_name ?? query.data?.status
  const assignedStaffId = query.data?.assigned_staff_id ?? query.data?.staff_emplid

  const canCancel =
    role === 'User' &&
    ['Open', 'Pending', 'On Hold', 'In Progress'].includes(status ?? '')

  // Staff bisa claim kalau belum ada yang di-assign
  const canClaim = role === 'Staff' && !assignedStaffId

  // Staff bisa resolve kalau dia yang di-assign
  const canResolve =
    role === 'Staff' &&
    assignedStaffId === user?.id &&
    ['In Progress', 'On Hold'].includes(status ?? '')

  // Admin bisa approve kalau status Pending
  const canApprove = role === 'Admin' && status === 'Pending'

  const isActioning =
    claimMutation.isPending || resolveMutation.isPending || approveMutation.isPending

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

    // UI state
    additionalDetailExpanded,
    setAdditionalDetailExpanded,
    attachmentsExpanded,
    setAttachmentsExpanded,
  }
}