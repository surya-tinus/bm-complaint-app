import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPendingRequests, approveUnassignRequest, rejectUnassignRequest } from '@/services/ticket.service'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'

// ─── Types ────────────────────────────────────────────────

interface UnassignRequest {
  id: number
  request_type: string
  description: string
  status: string
  created_at: string
  requested_by_name: string
  requested_by_id: string
  ticket_id: number
  short_description: string
  ticket_status: string
}

// ─── Screen ───────────────────────────────────────────────

export default function RequestsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [selectedRequest, setSelectedRequest] = useState<UnassignRequest | null>(null)
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = useState('')

  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: getPendingRequests,
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      approveUnassignRequest(id, comment),
    onSuccess: () => {
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (err: any) => {
      console.log('APPROVE ERROR:', err?.response?.status, err?.response?.data)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      rejectUnassignRequest(id, comment),
    onSuccess: () => {
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    },
    onError: (err: any) => {
      console.log('REJECT ERROR:', err?.response?.status, err?.response?.data)
    },
  })

  const isPending = approveMutation.isPending || rejectMutation.isPending

  const openModal = (request: UnassignRequest, mode: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setModalMode(mode)
    setComment('')
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setModalMode(null)
    setComment('')
  }

  const handleConfirm = () => {
    if (!selectedRequest || !modalMode) return
    if (modalMode === 'approve') {
      approveMutation.mutate({ id: selectedRequest.id, comment })
    } else {
      rejectMutation.mutate({ id: selectedRequest.id, comment })
    }
  }

  const formatDate = (raw: string) => {
    return new Date(raw).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand} />

      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.appBarTitle}>Unassignment Requests</Text>
          <Text style={styles.appBarSubtitle}>Review staff requests to return tickets</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 40 },
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <RequestCard
                request={item}
                formatDate={formatDate}
                onApprove={() => openModal(item, 'approve')}
                onReject={() => openModal(item, 'reject')}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No pending requests</Text>
                <Text style={styles.emptySubtitle}>All unassignment requests have been reviewed.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Confirm Modal */}
      <Modal visible={!!modalMode} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modalMode === 'approve' ? 'Approve request?' : 'Reject request?'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Ticket #{selectedRequest?.ticket_id} · {selectedRequest?.short_description}
            </Text>
            <Text style={styles.modalMeta}>
              Requested by {selectedRequest?.requested_by_name}
            </Text>
            {selectedRequest?.description ? (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Staff reason</Text>
                <Text style={styles.reasonText}>{selectedRequest.description}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.commentInput}
              placeholder="Add a note (optional)..."
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={closeModal}
                disabled={isPending}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  { backgroundColor: modalMode === 'approve' ? colors.brand : '#DC2626' },
                ]}
                onPress={handleConfirm}
                disabled={isPending}
              >
                {isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalPrimaryText}>
                      {modalMode === 'approve' ? 'Approve' : 'Reject'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// ─── Request Card ─────────────────────────────────────────

function RequestCard({
  request,
  formatDate,
  onApprove,
  onReject,
}: {
  request: UnassignRequest
  formatDate: (raw: string) => string
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTicketId}>Ticket #{request.ticket_id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{request.ticket_status}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {request.short_description}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.metaLabel}>Requested by</Text>
      <Text style={styles.metaValue}>{request.requested_by_name}</Text>

      <Text style={[styles.metaLabel, { marginTop: spacing.sm }]}>Reason</Text>
      <Text style={styles.metaValue}>{request.description || '—'}</Text>

      <Text style={[styles.metaLabel, { marginTop: spacing.sm }]}>Submitted</Text>
      <Text style={styles.metaValue}>{formatDate(request.created_at)}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnReject} onPress={onReject} activeOpacity={0.8}>
          <Text style={styles.btnRejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnApprove} onPress={onApprove} activeOpacity={0.8}>
          <Text style={styles.btnApproveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Error State ──────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.emptyTitle}>Failed to load requests</Text>
      <Text style={styles.emptySubtitle}>Check your connection and try again</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  appBar: {
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: colors.textOnBrand,
    fontSize: 18,
    lineHeight: 22,
  },
  appBarTitle: {
    color: colors.textOnBrand,
    fontSize: typography.sizes.appBarTitle,
    fontFamily: typography.fonts.bold,
  },
  appBarSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: typography.sizes.appBarSubtitle,
    fontFamily: typography.fonts.regular,
    marginTop: 2,
  },
  body: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.cardTitle,
    fontFamily: typography.fonts.bold,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.brand,
    borderRadius: radius.button,
  },
  retryText: {
    color: colors.textOnBrand,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.button,
  },

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTicketId: {
    fontSize: typography.sizes.cardId,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
  },
  statusBadge: {
    backgroundColor: colors.brandDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.badge,
  },
  statusBadgeText: {
    fontSize: typography.sizes.badge,
    fontFamily: typography.fonts.medium,
    color: colors.brandText,
  },
  cardTitle: {
    fontSize: typography.sizes.cardTitle,
    fontFamily: typography.fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },
  metaLabel: {
    fontSize: typography.sizes.microcopy,
    fontFamily: typography.fonts.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btnReject: {
    flex: 1,
    height: 36,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRejectText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: '#DC2626',
  },
  btnApprove: {
    flex: 1.5,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnApproveText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.textOnBrand,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.bgOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.modal,
    padding: spacing.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: typography.sizes.cardTitle,
    fontFamily: typography.fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  modalMeta: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  reasonBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.input,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reasonLabel: {
    fontSize: typography.sizes.microcopy,
    fontFamily: typography.fonts.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
  },
  commentInput: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
    minHeight: 80,
    marginBottom: spacing.md,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalSecondaryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.button,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSecondaryText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.textPrimary,
  },
  modalPrimaryBtn: {
    flex: 1,
    borderRadius: radius.button,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalPrimaryText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.textOnBrand,
  },
})