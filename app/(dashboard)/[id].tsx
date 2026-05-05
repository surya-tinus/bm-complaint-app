// app/(dashboard)/[id].tsx
import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTicketDetail } from '@/features/dashboard/hooks/useTicketDetail'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TicketDetail, TimelineStep, PriorityLevel } from '@/features/dashboard/types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: '#10B981', bg: '#D1FAE5' },
  medium: { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  high:   { label: 'High',   color: '#EF4444', bg: '#FEE2E2' },
}

const ACTION_CONFIG = {
  claim:   { label: 'Claim Ticket',   color: '#1A56C4', icon: 'hand-left-outline'     as const },
  resolve: { label: 'Resolve Ticket', color: '#10B981', icon: 'checkmark-circle-outline' as const },
  approve: { label: 'Approve Ticket', color: '#F59E0B', icon: 'shield-checkmark-outline' as const },
}

export default function TicketDetailScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    ticket,
    isLoading,
    isError,
    role,
    cancelModalVisible,
    setCancelModalVisible,
    additionalDetailExpanded,
    setAdditionalDetailExpanded,
    attachmentsExpanded,
    setAttachmentsExpanded,
    handleCancel,
    isCancelling,
    canCancel,
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
  } = useTicketDetail(id)

  // Tentukan apakah ada action bar yang perlu ditampilkan
  const hasActionBar = canCancel || canClaim || canResolve || canApprove

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} topInset={insets.top} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A56C4" />
        </View>
      </View>
    )
  }

  if (isError || !ticket) {
    return (
      <View style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} topInset={insets.top} />
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={40} color="#9CA3AF" />
          <Text style={styles.errorText}>Tiket tidak ditemukan</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56C4" />
      <Header id={id} onBack={() => router.back()} topInset={insets.top} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scrollContent,
          hasActionBar && { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TicketInfoCard
          ticket={ticket}
          additionalDetailExpanded={additionalDetailExpanded}
          onToggleAdditionalDetail={() => setAdditionalDetailExpanded(!additionalDetailExpanded)}
          attachmentsExpanded={attachmentsExpanded}
          onToggleAttachments={() => setAttachmentsExpanded(!attachmentsExpanded)}
        />
        <StatusTimelineCard ticket={ticket} />
        <AssignedStaffCard ticket={ticket} />
      </ScrollView>

      {/* Action Bar — User: cancel; Staff: claim/resolve; Admin: approve */}
      {hasActionBar && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => setCancelModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Cancel Ticket</Text>
            </TouchableOpacity>
          )}

          {canClaim && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#1A56C4' }]}
              onPress={() => triggerAction('claim')}
              activeOpacity={0.85}
            >
              <Ionicons name="hand-left-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Claim Ticket</Text>
            </TouchableOpacity>
          )}

          {canResolve && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
              onPress={() => triggerAction('resolve')}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Resolve Ticket</Text>
            </TouchableOpacity>
          )}

          {canApprove && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => triggerAction('approve')}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Approve Ticket</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Cancel Modal (User) */}
      <CancelModal
        visible={cancelModalVisible}
        onKeep={() => setCancelModalVisible(false)}
        onCancel={handleCancel}
        isLoading={isCancelling}
      />

      {/* Action Modal (Staff/Admin) */}
      {pendingAction && (
        <ActionModal
          visible={actionModalVisible}
          action={pendingAction}
          comment={actionComment}
          onChangeComment={setActionComment}
          onCancel={() => setActionModalVisible(false)}
          onConfirm={confirmAction}
          isLoading={isActioning}
        />
      )}
    </View>
  )
}

// ─── Header ───────────────────────────────────────────────

function Header({ id, onBack, topInset }: { id: string; onBack: () => void; topInset: number }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 8 }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={20} color="#fff" />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Ticket Detail</Text>
        <Text style={styles.headerSubtitle}>No: {id}</Text>
      </View>
    </View>
  )
}

// ─── Ticket Info Card ──────────────────────────────────────

function TicketInfoCard({
  ticket,
  additionalDetailExpanded,
  onToggleAdditionalDetail,
  attachmentsExpanded,
  onToggleAttachments,
}: {
  ticket: TicketDetail
  additionalDetailExpanded: boolean
  onToggleAdditionalDetail: () => void
  attachmentsExpanded: boolean
  onToggleAttachments: () => void
}) {
  const priority = PRIORITY_CONFIG[ticket.priority]

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="ticket-outline" size={20} color="#1A56C4" />
        </View>
        <View style={styles.titleMeta}>
          <Text style={styles.ticketTitle}>{ticket.shortDescription}</Text>
          <Text style={styles.reportedAt}>Reported on : {ticket.reportedAt}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
          <Text style={[styles.priorityText, { color: priority.color }]}>
            {priority.label} Priority
          </Text>
        </View>
        <View style={styles.issueTypeBadge}>
          <Text style={styles.issueTypeText}>{ticket.issueType.name}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={styles.locationItem}>
          <Ionicons name="location-outline" size={13} color="#6B7280" />
          <Text style={styles.locationText}>{ticket.place.building}</Text>
        </View>
        <View style={styles.locationItem}>
          <Ionicons name="enter-outline" size={13} color="#6B7280" />
          <Text style={styles.locationText}>{ticket.place.name}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.accordionRow} onPress={onToggleAdditionalDetail}>
        <Text style={styles.accordionLabel}>Additional Detail</Text>
        <Ionicons name={additionalDetailExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>
      {additionalDetailExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>{ticket.description || 'Tidak ada deskripsi tambahan.'}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <TouchableOpacity style={styles.accordionRow} onPress={onToggleAttachments}>
        <Text style={styles.accordionLabel}>
          Attachments{ticket.attachments.length > 0 ? ` (${ticket.attachments.length})` : ''}
        </Text>
        <Ionicons name={attachmentsExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>
      {attachmentsExpanded && (
        <View style={styles.accordionContent}>
          {ticket.attachments.length > 0 ? (
            ticket.attachments.map((att) => (
              <View key={att.id} style={styles.attachmentItem}>
                <Ionicons name="document-attach-outline" size={14} color="#6B7280" />
                <Text style={styles.accordionText}>{att.fileName}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.accordionText}>Tidak ada lampiran.</Text>
          )}
        </View>
      )}
    </View>
  )
}

// ─── Status Timeline Card ──────────────────────────────────

function StatusTimelineCard({ ticket }: { ticket: TicketDetail }) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconCircle}>
          <Ionicons name="information-circle-outline" size={20} color="#1A56C4" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Status Information</Text>
          <Text style={styles.sectionSubtitle}>Status Last Updated on : {ticket.statusLastUpdated}</Text>
        </View>
      </View>

      <View style={styles.timelineContainer}>
        {ticket.timeline.map((step, index) => (
          <TimelineItem key={step.id} step={step} isLast={index === ticket.timeline.length - 1} />
        ))}
      </View>

      <View style={styles.notesRow}>
        <Ionicons name="clipboard-outline" size={16} color="#6B7280" />
        <View style={{ flex: 1 }}>
          <Text style={styles.notesLabel}>Additional Notes :</Text>
          <Text style={styles.notesText}>
            {ticket.additionalNotes ?? 'No additional notes were provided by staff.'}
          </Text>
        </View>
      </View>
    </View>
  )
}

function TimelineItem({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const isCompleted = step.status === 'completed'
  const isActive = step.status === 'active'
  const isInactive = step.status === 'inactive'

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDotCol}>
        <View style={[
          styles.timelineDot,
          isCompleted && styles.timelineDotCompleted,
          isActive && styles.timelineDotActive,
          isInactive && styles.timelineDotInactive,
        ]}>
          {isCompleted && <Ionicons name="checkmark" size={13} color="#fff" />}
          {isActive && <View style={styles.timelineDotInner} />}
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, (isCompleted || isActive) && styles.timelineLineActive]} />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineLabel, isInactive && styles.timelineLabelInactive]}>
          {step.label}
        </Text>
        {step.description && <Text style={styles.timelineDescription}>{step.description}</Text>}
        {step.timestamp && <Text style={styles.timelineTimestamp}>{step.timestamp}</Text>}
      </View>
    </View>
  )
}

// ─── Assigned Staff Card ───────────────────────────────────

function AssignedStaffCard({ ticket }: { ticket: TicketDetail }) {
  const hasStaff = !!ticket.assignedStaff

  return (
    <View style={styles.card}>
      <View style={styles.staffRow}>
        <View style={styles.staffAvatar}>
          {hasStaff ? (
            <Text style={styles.staffAvatarText}>{ticket.assignedStaff!.name.charAt(0)}</Text>
          ) : (
            <Ionicons name="person-outline" size={22} color="#9CA3AF" />
          )}
        </View>
        <View>
          <Text style={styles.staffName}>
            {hasStaff ? ticket.assignedStaff!.name : 'No Assigned Staff Yet'}
          </Text>
          <Text style={styles.staffRole}>
            {hasStaff ? ticket.assignedStaff!.role ?? '' : 'No Information Yet'}
          </Text>
        </View>
      </View>

      <View style={styles.staffNotesHeader}>
        <View style={styles.staffNotesLabelRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color="#374151" />
          <Text style={styles.staffNotesLabel}>Notes From Staff</Text>
        </View>
        <Text style={styles.staffNotesTime}>{ticket.staffNotesTime ?? 'No Time Information'}</Text>
      </View>

      <View style={styles.staffNotesBox}>
        <Text style={styles.staffNotesText}>
          {ticket.staffNotes ?? 'No notes provided yet by staff.'}
        </Text>
      </View>
    </View>
  )
}

// ─── Cancel Modal ──────────────────────────────────────────

function CancelModal({
  visible, onKeep, onCancel, isLoading,
}: {
  visible: boolean; onKeep: () => void; onCancel: () => void; isLoading: boolean
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={[styles.modalIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert" size={28} color="#EF4444" />
          </View>
          <Text style={styles.modalTitle}>Cancel Ticket?</Text>
          <Text style={styles.modalSubtitle}>Are you sure you want to cancel this ticket?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={onKeep} disabled={isLoading}>
              <Text style={styles.modalSecondaryText}>Keep Ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: '#EF4444' }]}
              onPress={onCancel}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalPrimaryText}>Cancel Ticket</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Action Modal (Claim / Resolve / Approve) ─────────────

function ActionModal({
  visible, action, comment, onChangeComment, onCancel, onConfirm, isLoading,
}: {
  visible: boolean
  action: 'claim' | 'resolve' | 'approve'
  comment: string
  onChangeComment: (text: string) => void
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}) {
  const cfg = ACTION_CONFIG[action]

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={[styles.modalIconCircle, { backgroundColor: cfg.color + '20' }]}>
            <Ionicons name={cfg.icon} size={28} color={cfg.color} />
          </View>
          <Text style={styles.modalTitle}>{cfg.label}?</Text>
          <Text style={styles.modalSubtitle}>
            {action === 'claim' && 'Ticket ini akan di-assign ke kamu.'}
            {action === 'resolve' && 'Pastikan masalah sudah terselesaikan sebelum konfirmasi.'}
            {action === 'approve' && 'Ticket akan disetujui dan diteruskan ke staff.'}
          </Text>

          {/* Comment optional */}
          <TextInput
            style={styles.commentInput}
            placeholder="Tambah catatan (opsional)"
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={onChangeComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={300}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={onCancel} disabled={isLoading}>
              <Text style={styles.modalSecondaryText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: cfg.color }]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalPrimaryText}>Konfirmasi</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F3F4F6', gap: 8,
  },
  errorText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },

  header: {
    backgroundColor: '#1A56C4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 20,
    gap: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.2 },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 1 },

  body: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  titleMeta: { flex: 1 },
  ticketTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  reportedAt: { fontSize: 12, color: '#6B7280' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  issueTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#EFF6FF' },
  issueTypeText: { fontSize: 11, fontWeight: '600', color: '#005B9E' },
  locationRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  locationItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  accordionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  accordionLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  accordionContent: { paddingBottom: 8 },
  accordionText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  attachmentItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  timelineContainer: { paddingLeft: 4, marginBottom: 16 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDotCol: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  timelineDotCompleted: { backgroundColor: '#1A56C4', borderColor: '#1A56C4' },
  timelineDotActive: { backgroundColor: '#1A56C4', borderColor: '#1A56C4' },
  timelineDotInactive: { backgroundColor: '#fff', borderColor: '#D1D5DB' },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: '#E5E7EB', marginVertical: 2 },
  timelineLineActive: { backgroundColor: '#1A56C4' },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  timelineLabelInactive: { color: '#9CA3AF', fontWeight: '500' },
  timelineDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  timelineTimestamp: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },

  notesRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  notesLabel: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
  notesText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  staffAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  staffAvatarText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  staffName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  staffRole: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  staffNotesHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  staffNotesLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  staffNotesLabel: { fontSize: 13, fontWeight: '600', color: '#111827' },
  staffNotesTime: { fontSize: 11, color: '#9CA3AF' },
  staffNotesBox: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12 },
  staffNotesText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 28,
    paddingVertical: 14,
  },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, alignItems: 'center', width: '100%',
  },
  modalIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  modalSubtitle: {
    fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16, lineHeight: 20,
  },
  commentInput: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    minHeight: 80,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalSecondaryBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalSecondaryText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  modalPrimaryBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalPrimaryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})