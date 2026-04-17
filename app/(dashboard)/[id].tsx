import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTicketDetail } from '@/features/dashboard/hooks/useTicketDetail'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TicketDetail, TimelineStep } from '@/features/dashboard/types'

export default function TicketDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    ticket,
    isLoading,
    isError,
    cancelModalVisible,
    setCancelModalVisible,
    additionalDetailExpanded,
    setAdditionalDetailExpanded,
    attachmentsExpanded,
    setAttachmentsExpanded,
    handleCancel,
    isCancelling,
    canCancel,
  } = useTicketDetail(id)

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A56C4" />
        </View>
      </SafeAreaView>
    )
  }

  if (isError || !ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} />
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Tiket tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56C4" />
      <Header id={ticket.id} onBack={() => router.back()} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticket Info Card */}
        <TicketInfoCard
          ticket={ticket}
          additionalDetailExpanded={additionalDetailExpanded}
          onToggleAdditionalDetail={() => setAdditionalDetailExpanded(!additionalDetailExpanded)}
          attachmentsExpanded={attachmentsExpanded}
          onToggleAttachments={() => setAttachmentsExpanded(!attachmentsExpanded)}
        />

        {/* Status Timeline Card */}
        <StatusTimelineCard ticket={ticket} />

        {/* Assigned Staff Card */}
        <AssignedStaffCard ticket={ticket} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cancel Button */}
      {canCancel && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setCancelModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Cancel Ticket  ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel Confirmation Modal */}
      <CancelModal
        visible={cancelModalVisible}
        onKeep={() => setCancelModalVisible(false)}
        onCancel={handleCancel}
        isLoading={isCancelling}
      />
    </SafeAreaView>
  )
}

// ─── Header ───────────────────────────────────────────────

function Header({ id, onBack }: { id: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Ticket Detail</Text>
        <Text style={styles.headerSubtitle}>No:  {id}</Text>
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
  const categoryIcon = getCategoryIcon(ticket.type)

  return (
    <View style={styles.card}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{categoryIcon}</Text>
        </View>
        <View style={styles.titleMeta}>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <Text style={styles.reportedAt}>Reported on : {ticket.reportedAt}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>

      {/* Location row */}
      <View style={styles.locationRow}>
        <View style={styles.locationItem}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{ticket.building}</Text>
        </View>
        <View style={styles.locationItem}>
          <Text style={styles.locationIcon}>🚪</Text>
          <Text style={styles.locationText}>{ticket.room}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Additional Detail accordion */}
      <TouchableOpacity style={styles.accordionRow} onPress={onToggleAdditionalDetail}>
        <Text style={styles.accordionLabel}>Additional Detail</Text>
        <Text style={styles.accordionChevron}>{additionalDetailExpanded ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      {additionalDetailExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>
            {ticket.description ?? 'Tidak ada deskripsi tambahan.'}
          </Text>
          {ticket.category && (
            <Text style={styles.accordionMeta}>Kategori: {ticket.category}</Text>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {/* Attachments accordion */}
      <TouchableOpacity style={styles.accordionRow} onPress={onToggleAttachments}>
        <Text style={styles.accordionLabel}>Attachments</Text>
        <Text style={styles.accordionChevron}>{attachmentsExpanded ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      {attachmentsExpanded && (
        <View style={styles.accordionContent}>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            ticket.attachments.map((att, i) => (
              <Text key={i} style={styles.accordionText}>• {att}</Text>
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
          <Text style={styles.sectionIconText}>ⓘ</Text>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Status Information</Text>
          <Text style={styles.sectionSubtitle}>
            Status Last Updated on : {ticket.statusLastUpdated}
          </Text>
        </View>
      </View>

      <View style={styles.timelineContainer}>
        {ticket.timeline.map((step, index) => (
          <TimelineItem
            key={step.id}
            step={step}
            isLast={index === ticket.timeline.length - 1}
          />
        ))}
      </View>

      {/* Additional Notes */}
      <View style={styles.notesRow}>
        <Text style={styles.notesIcon}>📋</Text>
        <View>
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
      {/* Dot + line column */}
      <View style={styles.timelineDotCol}>
        <View
          style={[
            styles.timelineDot,
            isCompleted && styles.timelineDotCompleted,
            isActive && styles.timelineDotActive,
            isInactive && styles.timelineDotInactive,
          ]}
        >
          {isCompleted && <Text style={styles.timelineCheckmark}>✓</Text>}
          {isActive && <View style={styles.timelineDotInner} />}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              (isCompleted || isActive) && styles.timelineLineActive,
            ]}
          />
        )}
      </View>

      {/* Content column */}
      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineLabel,
            isInactive && styles.timelineLabelInactive,
          ]}
        >
          {step.label}
        </Text>
        {step.description && (
          <Text style={styles.timelineDescription}>{step.description}</Text>
        )}
        {step.timestamp && (
          <Text style={styles.timelineTimestamp}>{step.timestamp}</Text>
        )}
      </View>
    </View>
  )
}

// ─── Assigned Staff Card ───────────────────────────────────

function AssignedStaffCard({ ticket }: { ticket: TicketDetail }) {
  const hasStaff = !!ticket.assignedStaff

  return (
    <View style={styles.card}>
      {/* Staff info row */}
      <View style={styles.staffRow}>
        <View style={styles.staffAvatar}>
          {hasStaff ? (
            <Text style={styles.staffAvatarText}>
              {ticket.assignedStaff!.name.charAt(0)}
            </Text>
          ) : (
            <Text style={styles.staffAvatarIcon}>👤</Text>
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

      {/* Staff Notes */}
      <View style={styles.staffNotesHeader}>
        <View style={styles.staffNotesLabelRow}>
          <Text style={styles.staffNotesIcon}>💬</Text>
          <Text style={styles.staffNotesLabel}>Notes From Staff</Text>
        </View>
        <Text style={styles.staffNotesTime}>
          {ticket.staffNotesTime ?? 'No Time Information'}
        </Text>
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
  visible,
  onKeep,
  onCancel,
  isLoading,
}: {
  visible: boolean
  onKeep: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalIconCircle}>
            <Text style={styles.modalIconText}>!</Text>
          </View>
          <Text style={styles.modalTitle}>Cancel Ticket?</Text>
          <Text style={styles.modalSubtitle}>
            Are you sure you want to cancel this ticket?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalKeepBtn}
              onPress={onKeep}
              disabled={isLoading}
            >
              <Text style={styles.modalKeepText}>Keep Ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalCancelText}>Cancel Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Helpers ───────────────────────────────────────────────

function getCategoryIcon(type: string): string {
  switch (type) {
    case 'issue': return '⚠️'
    case 'request': return '🔧'
    case 'report': return '📋'
    default: return '🎫'
  }
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A56C4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },

  // Header
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
  backIcon: { color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '300', marginTop: -2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.2 },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 1 },

  // Body
  body: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Ticket Info
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
  titleMeta: { flex: 1 },
  ticketTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  reportedAt: { fontSize: 12, color: '#6B7280' },
  locationRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  locationItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationIcon: { fontSize: 12 },
  locationText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  accordionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  accordionLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  accordionChevron: { fontSize: 14, color: '#6B7280' },
  accordionContent: { paddingBottom: 8 },
  accordionText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  accordionMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  // Section header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionIconText: { fontSize: 18, color: '#1A56C4' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  // Timeline
  timelineContainer: { paddingLeft: 4, marginBottom: 16 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDotCol: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  timelineDotCompleted: { backgroundColor: '#1A56C4', borderColor: '#1A56C4' },
  timelineDotActive: { backgroundColor: '#1A56C4', borderColor: '#1A56C4' },
  timelineDotInactive: { backgroundColor: '#fff', borderColor: '#D1D5DB' },
  timelineCheckmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: '#E5E7EB', marginVertical: 2 },
  timelineLineActive: { backgroundColor: '#1A56C4' },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  timelineLabelInactive: { color: '#9CA3AF', fontWeight: '500' },
  timelineDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  timelineTimestamp: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },

  // Notes
  notesRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  notesIcon: { fontSize: 16, marginTop: 1 },
  notesLabel: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
  notesText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  // Staff
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  staffAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  staffAvatarText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  staffAvatarIcon: { fontSize: 22 },
  staffName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  staffRole: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  staffNotesHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  staffNotesLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  staffNotesIcon: { fontSize: 14 },
  staffNotesLabel: { fontSize: 13, fontWeight: '600', color: '#111827' },
  staffNotesTime: { fontSize: 11, color: '#9CA3AF' },
  staffNotesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  staffNotesText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, alignItems: 'center', width: '100%',
  },
  modalIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconText: { fontSize: 26, fontWeight: '700', color: '#EF4444' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalKeepBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalKeepText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  modalCancelBtn: {
    flex: 1, backgroundColor: '#1A56C4',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})
