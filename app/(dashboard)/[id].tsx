// app/[dashboard]/[id].tsx
import React, { useEffect, useRef, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
  Modal, ActivityIndicator, TextInput, Image, FlatList, Dimensions, Animated,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTicketDetail } from '@/features/dashboard/hooks/useTicketDetail'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TicketDetail, TimelineStep } from '@/features/dashboard/types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { config } from '@/constants/config'
import { useAuthStore } from '@/store/auth.store'
import { fetchAuthenticatedImage } from '@/utils/imageCache'
import { TicketDetailSkeleton, SkeletonBox } from '@/components/ui/Skeleton'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler'
import type { TicketAction } from '@/features/dashboard/hooks/useTicketDetail'
import { TicketTypeIcon } from '@/components/ui/TicketTypeIcon'
import { resolveCategoryKey } from '@/utils/resolveCategoryKey'
import { CATEGORY_TO_TYPE } from '@/constants'
import { ThumbsReview, ThumbsFloatingBanner} from '@/components/ui/ThumbsReview'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const ACTION_CONFIG: Record<TicketAction, { label: string; color: string }> = {
  claim:    { label: 'Claim Ticket',        color: colors.brand   },
  resolve:  { label: 'Resolve Ticket',      color: '#10B981'      },
  approve:  { label: 'Approve Ticket',      color: '#F59E0B'      },
  hold:     { label: 'Hold Ticket',         color: '#F59E0B'      },
  continue: { label: 'Continue Handling',   color: colors.brand   },
  comment:  { label: 'Add Comment',       color: colors.brand },
}

export default function TicketDetailScreen() {
  const { id, t: externalToken } = useLocalSearchParams<{ id: string; t?: string }>()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const {
    ticket, isLoading, isError, role,
    cancelModalVisible, setCancelModalVisible,
    additionalDetailExpanded, setAdditionalDetailExpanded,
    attachmentsExpanded, setAttachmentsExpanded,
    handleCancel, isCancelling, canCancel,
    canClaim, canResolve, canApprove, canHold, canContinue, canComment,
    actionModalVisible, setActionModalVisible,
    pendingAction, actionComment, setActionComment,
    triggerAction, confirmAction, isActioning,
    canReview,
  thumbsReview,
  submitThumbsReview,
  isSubmittingThumbsReview,
  } = useTicketDetail(id, externalToken ?? undefined)

  const hasActionBar = canCancel || canClaim || canResolve || canApprove || canHold || canContinue || canComment

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} topInset={insets.top} />
        <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TicketDetailSkeleton />
        </ScrollView>
      </View>
    )
  }

  if (isError && externalToken) {
    return (
      <View style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} topInset={insets.top} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Link no longer valid</Text>
          <Text style={styles.errorSubtitle}>
            This ticket has already been claimed or the link has expired.
          </Text>
        </View>
      </View>
    )
  }

  if (isError || !ticket) {
    return (
      <View style={styles.safeArea}>
        <Header id={id} onBack={() => router.back()} topInset={insets.top} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Ticket not found</Text>
          <Text style={styles.errorSubtitle}>Try going back to the previous page.</Text>
        </View>
      </View>
    )
  }

  console.log('rendering bottom bar, canApprove:', canApprove, 'canCancel:', canCancel)
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand} />
      <Header id={id} onBack={() => router.back()} topInset={insets.top} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
  styles.scrollContent,
  (hasActionBar || canReview || thumbsReview !== null) && {
    paddingBottom: insets.bottom + 160
  },
]}
        showsVerticalScrollIndicator={false}
      >
        <TicketInfoCard
          ticket={ticket}
          role={role?.toLowerCase() as 'user' | 'staff' ?? 'user'}
          additionalDetailExpanded={additionalDetailExpanded}
          onToggleAdditionalDetail={() => setAdditionalDetailExpanded(!additionalDetailExpanded)}
          attachmentsExpanded={attachmentsExpanded}
          onToggleAttachments={() => setAttachmentsExpanded(!attachmentsExpanded)}
        />
        <StatusTimelineCard
  ticket={ticket}
  canComment={canComment}
  onComment={() => triggerAction('comment')}
/>
        <AssignedStaffCard ticket={ticket} />

        
      </ScrollView>
      
      {/* Thumbs floating banner — hanya untuk User, status Resolved */}
{(canReview || thumbsReview !== null) && (
  <ThumbsFloatingBanner
    canReview={canReview}
    thumbsReview={thumbsReview}
    isSubmitting={isSubmittingThumbsReview}
    onSubmit={submitThumbsReview}
    bottomOffset={
      hasActionBar
        ? insets.bottom + 80   // ada bottom bar di bawahnya
        : insets.bottom + 16   // tidak ada bottom bar
    }
  />
)}

     {canCancel && (
        <View style={[styles.cancelBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={styles.cancelBarBtn}
            onPress={() => setCancelModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBarBtnText}>Cancel Ticket</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Staff action bar — terpisah dari cancel */}
      {(canHold || canContinue || canClaim || canResolve || canApprove) && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          {(canHold || canContinue || canClaim || canResolve) && (
            <View style={[styles.staffActionRow, { marginBottom: spacing.sm }]}>
              {canHold     && <TouchableOpacity style={styles.btnOutline}  onPress={() => triggerAction('hold')}     activeOpacity={0.85}><Text style={styles.btnOutlineText}>Hold</Text></TouchableOpacity>}
              {canContinue && <TouchableOpacity style={styles.btnPrimary}  onPress={() => triggerAction('continue')} activeOpacity={0.85}><Text style={styles.btnPrimaryText}>Continue</Text></TouchableOpacity>}
              {canClaim    && <TouchableOpacity style={styles.btnPrimary}  onPress={() => triggerAction('claim')}    activeOpacity={0.85}><Text style={styles.btnPrimaryText}>Accept</Text></TouchableOpacity>}
              {canResolve  && <TouchableOpacity style={styles.btnPrimary}  onPress={() => triggerAction('resolve')}  activeOpacity={0.85}><Text style={styles.btnPrimaryText}>Resolve</Text></TouchableOpacity>}
            </View>
          )}
          {canApprove && (
            <View style={styles.staffActionRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => triggerAction('approve')} activeOpacity={0.85}>
                <Text style={styles.btnPrimaryText}>Approve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <CancelModal visible={cancelModalVisible} onKeep={() => setCancelModalVisible(false)} onCancel={handleCancel} isLoading={isCancelling} />
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


// ─── Authenticated Image ───────────────────────────────────

function AuthenticatedImage({ filePath, style, resizeMode = 'cover' }: { filePath: string; style: any; resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' }) {
  const [uri, setUri] = useState<string | null>(null)
  const token = useAuthStore((s) => s.token)
  useEffect(() => {
    fetchAuthenticatedImage(filePath, token!, config.API_BASE_URL).then(setUri).catch(() => {})
  }, [filePath, token])
  if (!uri) return <SkeletonBox style={style} />
  return <Image source={{ uri }} style={style} resizeMode={resizeMode} />
}

// ─── Zoomable Slide ────────────────────────────────────────

function ZoomableSlide({ filePath, onDismiss, onZoomChange }: { filePath: string; onDismiss: () => void; onZoomChange: (z: boolean) => void }) {
  const scale = useRef(new Animated.Value(1)).current
  const savedScale = useRef(1)
  const translateY = useRef(new Animated.Value(0)).current
  const overlayOpacity = useRef(new Animated.Value(1)).current
  const pinchRef = useRef(null)
  const panRef = useRef(null)

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true })
  const onPinchStateChange = (e: any) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      const ns = savedScale.current * e.nativeEvent.scale
      if (ns < 1) { savedScale.current = 1; Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); onZoomChange(false) }
      else if (ns > 5) { savedScale.current = 5; scale.setValue(5); onZoomChange(true) }
      else { savedScale.current = ns; scale.setValue(ns); onZoomChange(ns > 1.05) }
    }
  }
  const onPanEvent = Animated.event([{ nativeEvent: { translationY: translateY } }], { useNativeDriver: true })
  const onPanStateChange = (e: any) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      if (e.nativeEvent.translationY > 120 && savedScale.current <= 1) {
        Animated.parallel([
          Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }),
          Animated.timing(overlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(onDismiss)
      } else {
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }),
        ]).start()
      }
    }
  }

  return (
    <PanGestureHandler ref={panRef} onGestureEvent={onPanEvent} onHandlerStateChange={onPanStateChange} simultaneousHandlers={pinchRef} activeOffsetY={[-10, 10]} failOffsetX={[-20, 20]}>
      <Animated.View style={[styles.imageViewerSlide, { opacity: overlayOpacity }]}>
        <PinchGestureHandler ref={pinchRef} onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange} simultaneousHandlers={panRef}>
          <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
            <AuthenticatedImage filePath={filePath} style={styles.imageViewerFull} resizeMode="contain" />
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  )
}

// ─── Header ───────────────────────────────────────────────

function Header({ id, onBack, topInset }: { id: string; onBack: () => void; topInset: number }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 8 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Report Detail</Text>
        <Text style={styles.headerSubtitle}>No. {id}</Text>
      </View>
    </View>
  )
}

// ─── Ticket Info Card ──────────────────────────────────────

function TicketInfoCard({ ticket, role, additionalDetailExpanded, onToggleAdditionalDetail, attachmentsExpanded, onToggleAttachments }: {
  ticket: TicketDetail
  role: 'user' | 'staff'
  additionalDetailExpanded: boolean; onToggleAdditionalDetail: () => void; attachmentsExpanded: boolean; onToggleAttachments: () => void
}) {
  const categoryKey = resolveCategoryKey(ticket.issueType.name)
const ticketType  = CATEGORY_TO_TYPE[categoryKey]
  const insets = useSafeAreaInsets()
  const priority = colors.priority[ticket.priority]
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const token = useAuthStore((s) => s.token)

  function formatReportedAt(raw: string | undefined | null): string {
  if (!raw) return ''
  const date = new Date(raw)
  if (isNaN(date.getTime())) return raw
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', '
    + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

  useEffect(() => {
    if (attachmentsExpanded && ticket.attachments.length > 0) {
      ticket.attachments.forEach((att) => { fetchAuthenticatedImage(att.filePath, token!, config.API_BASE_URL).catch(() => {}) })
    }
  }, [attachmentsExpanded])

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: colors.category[categoryKey]?.bg ?? colors.brandDim }]}>
  <TicketTypeIcon type={ticketType} category={categoryKey} variant="plain" size={20} />
</View>
        <View style={styles.titleMeta}>
          <Text style={styles.ticketTitle}>{ticket.shortDescription}</Text>
          <Text style={styles.reportedAt}>{formatReportedAt(ticket.reportedAt)}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>

      <View style={styles.badgeRow}>
        {role === 'staff' && (
          <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
            <Text style={[styles.priorityText, { color: priority.text }]}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
            </Text>
          </View>
        )}
        <View style={styles.issueTypeBadge}>
          <Text style={styles.issueTypeText}>{ticket.issueType.name}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locationText}>{ticket.place.building}</Text>
        <Text style={styles.locationSep}>·</Text>
        <Text style={styles.locationText}>{ticket.place.name}</Text>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.accordionRow} onPress={onToggleAdditionalDetail}>
        <Text style={styles.accordionLabel}>Additional Detail</Text>
        <Text style={styles.accordionChevron}>{additionalDetailExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {additionalDetailExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>{ticket.description || 'No additional description.'}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <TouchableOpacity style={styles.accordionRow} onPress={onToggleAttachments}>
        <Text style={styles.accordionLabel}>Attachments{ticket.attachments.length > 0 ? ` (${ticket.attachments.length})` : ''}</Text>
        <Text style={styles.accordionChevron}>{attachmentsExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {attachmentsExpanded && (
        <View style={styles.accordionContent}>
          {ticket.attachments.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ticket.attachments.map((att, index) => (
                <TouchableOpacity key={att.id} onPress={() => { setSelectedImageIndex(index); setIsZoomed(false) }} activeOpacity={0.85}>
                  <AuthenticatedImage filePath={att.filePath} style={styles.attachmentPreview} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.accordionText}>No attachments.</Text>
          )}
        </View>
      )}

      <Modal visible={selectedImageIndex !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={() => { setSelectedImageIndex(null); setIsZoomed(false) }}>
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={[styles.imageViewerClose, { top: insets.top + 16 }]} onPress={() => { setSelectedImageIndex(null); setIsZoomed(false) }} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.imageViewerCloseText}>✕</Text>
          </TouchableOpacity>
          {ticket.attachments.length > 1 && selectedImageIndex !== null && (
            <View style={[styles.imageViewerCounter, { top: insets.top + 20 }]}>
              <Text style={styles.imageViewerCounterText}>{selectedImageIndex + 1} / {ticket.attachments.length}</Text>
            </View>
          )}
          {selectedImageIndex !== null && (
            <FlatList
              data={ticket.attachments} horizontal pagingEnabled scrollEnabled={!isZoomed}
              showsHorizontalScrollIndicator={false} initialScrollIndex={selectedImageIndex}
              getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
              onMomentumScrollEnd={(e) => { const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH); setSelectedImageIndex(i); setIsZoomed(false) }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ZoomableSlide filePath={item.filePath} onDismiss={() => { setSelectedImageIndex(null); setIsZoomed(false) }} onZoomChange={setIsZoomed} />}
            />
          )}
          {ticket.attachments.length > 1 && selectedImageIndex !== null && (
            <View style={styles.imageViewerDots}>
              {ticket.attachments.map((_, i) => <View key={i} style={[styles.imageViewerDot, i === selectedImageIndex && styles.imageViewerDotActive]} />)}
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}

// ─── Status Timeline Card ──────────────────────────────────

function StatusTimelineCard({ ticket, canComment, onComment }: {
  ticket: TicketDetail
  canComment?: boolean
  onComment?: () => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Status Information</Text>
        <Text style={styles.sectionSubtitle}>Last updated : {ticket.statusLastUpdated}</Text>
      </View>
      <View style={styles.timelineContainer}>
        {ticket.timeline.map((step, index) => (
          <TimelineItem key={step.id} step={step} isLast={index === ticket.timeline.length - 1} />
        ))}
      </View>

      {/* ── Comment button di bawah timeline ── */}
      {canComment && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.addCommentBtn}
            onPress={onComment}
            activeOpacity={0.7}
          >
            <Text style={styles.addCommentText}>+ Add Note</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

function TimelineItem({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const isCompleted = step.status === 'completed'
  const isActive    = step.status === 'active'
  const isInactive  = step.status === 'inactive'
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDotCol}>
        <View style={[styles.timelineDot, isCompleted && styles.timelineDotCompleted, isActive && styles.timelineDotActive, isInactive && styles.timelineDotInactive]}>
          {isCompleted && <Text style={styles.timelineCheck}>✓</Text>}
          {isActive    && <View style={styles.timelineDotInner} />}
        </View>
        {!isLast && <View style={[styles.timelineLine, (isCompleted || isActive) && styles.timelineLineActive]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineLabel, isInactive && styles.timelineLabelInactive]}>{step.label}</Text>
        {step.description && <Text style={styles.timelineDescription}>{step.description}</Text>}
        {step.changedBy   && <Text style={styles.timelineChangedBy}>by {step.changedBy}</Text>}
        {step.timestamp   && <Text style={styles.timelineTimestamp}>{step.timestamp}</Text>}
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
          <Text style={styles.staffAvatarText}>{hasStaff ? ticket.assignedStaff!.name.charAt(0) : '?'}</Text>
        </View>
        <View>
          <Text style={styles.staffName}>{hasStaff ? ticket.assignedStaff!.name : 'No staff assigned'}</Text>
          <Text style={styles.staffRole}>{hasStaff ? (ticket.assignedStaff!.role ?? '') : 'No information available'}</Text>
        </View>
      </View>
      <View style={styles.staffNotesHeader}>
        <Text style={styles.staffNotesLabel}>Staff Notes</Text>
        <Text style={styles.staffNotesTime}>{ticket.staffNotesTime ?? ''}</Text>
      </View>
      <View style={styles.staffNotesBox}>
        <Text style={styles.staffNotesText}>{ticket.staffNotes ?? 'No notes from staff yet.'}</Text>
      </View>
    </View>
  )
}

// ─── Cancel Modal ──────────────────────────────────────────

function CancelModal({ visible, onKeep, onCancel, isLoading }: { visible: boolean; onKeep: () => void; onCancel: () => void; isLoading: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Cancel this report?</Text>
          <Text style={styles.modalSubtitle}>Cancelled reports cannot be reactivated.</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={onKeep} disabled={isLoading}>
              <Text style={styles.modalSecondaryText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalPrimaryBtn, { backgroundColor: '#DC2626' }]} onPress={onCancel} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalPrimaryText}>Yes, Cancel</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Action Modal ──────────────────────────────────────────

const REQUIRES_COMMENT: Record<TicketAction, boolean> = {
  claim:    false,
  resolve:  true,
  approve:  false,
  hold:     false,
  continue: true,
  comment: true,
}

const ACTION_SUBTITLE: Record<TicketAction, string> = {
  claim:    'This ticket will be assigned to you.',
  resolve:  'Make sure the issue is fully resolved before confirming.',
  approve:  'The ticket will be approved and forwarded to staff.',
  hold:     'Ticket handling will be paused temporarily.',
  continue: 'Ticket will be moved back to active status.',
  comment: 'Your comment will be added to the ticket timeline.',
}

const ACTION_PLACEHOLDER: Record<TicketAction, string> = {
  claim:    'Add a note (optional)',
  resolve:  'e.g. Light bulb replaced, working normally',
  approve:  'Add a note (optional)',
  hold:     'e.g. Waiting for spare parts from storage',
  continue: 'e.g. Parts arrived, ready to continue',
  comment: 'e.g. Additional info, question, or follow-up',
}

function ActionModal({ visible, action, comment, onChangeComment, onCancel, onConfirm, isLoading }: {
  visible: boolean
  action: TicketAction
  comment: string
  onChangeComment: (t: string) => void
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}) {
  const cfg = ACTION_CONFIG[action]
  const requiresComment = REQUIRES_COMMENT[action]
  const canSubmit = !requiresComment || comment.trim().length > 0

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{cfg.label}?</Text>
          <Text style={styles.modalSubtitle}>{ACTION_SUBTITLE[action]}</Text>
          <TextInput
            style={styles.commentInput}
            placeholder={ACTION_PLACEHOLDER[action]}
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={onChangeComment}
            multiline numberOfLines={3}
            textAlignVertical="top"
            maxLength={300}
          />
          {requiresComment && comment.trim().length === 0 && (
            <Text style={styles.commentRequired}>Comment is required for this action.</Text>
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={onCancel} disabled={isLoading}>
              <Text style={styles.modalSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: canSubmit ? cfg.color : colors.textMuted }]}
              onPress={onConfirm}
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalPrimaryText}>Confirm</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const bannerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: screenPadding,
    right: screenPadding,
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  question: {
    fontSize: typography.sizes.label,
    fontFamily: typography.fonts.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnYes: {
    backgroundColor: colors.status.resolved.bg,
    borderWidth: 1,
    borderColor: colors.status.resolved.accent ?? colors.borderDefault,
  },
  btnNo: {
    backgroundColor: colors.status.unresolved.bg,
    borderWidth: 1,
    borderColor: colors.status.unresolved.accent ?? colors.borderDefault,
  },
  btnYesText: {
    fontSize: typography.sizes.label,
    fontFamily: typography.fonts.medium,
    color: colors.status.resolved.text,
  },
  btnNoText: {
    fontSize: typography.sizes.label,
    fontFamily: typography.fonts.medium,
    color: colors.status.unresolved.text,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultIcon: {
    fontSize: 18,
  },
  resultText: {
    flex: 1,
    fontSize: typography.sizes.label,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
})

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: colors.bgBase },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingHorizontal: screenPadding },
  errorTitle:    { fontSize: typography.sizes.cardTitle, fontFamily: typography.fonts.bold, color: colors.textSecondary },
  errorSubtitle: { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textMuted },

  header:         { backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', paddingHorizontal: screenPadding, paddingBottom: spacing.lg, gap: 14 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backBtnText:    { color: colors.textOnBrand, fontSize: 18, lineHeight: 22 },
  headerTitle:    { color: colors.textOnBrand, fontSize: typography.sizes.appBarTitle, fontFamily: typography.fonts.bold },
  headerSubtitle: { color: 'rgba(255,255,255,0.55)', fontSize: typography.sizes.appBarSubtitle, fontFamily: typography.fonts.regular, marginTop: 2 },

  body:          { flex: 1, backgroundColor: colors.bgBase },
  scrollContent: { padding: screenPadding, gap: spacing.md },

  card: { backgroundColor: colors.bgCard, borderRadius: radius.card, padding: spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },

  titleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  iconCircle:    { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.brandDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  titleMeta:     { flex: 1 },
  ticketTitle:   { fontSize: typography.sizes.cardTitle, fontFamily: typography.fonts.bold, color: colors.textPrimary, marginBottom: 2 },
  reportedAt:    { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textSecondary },

  badgeRow:      { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  priorityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.badge },
  priorityText:  { fontSize: typography.sizes.badge, fontFamily: typography.fonts.medium },
  issueTypeBadge:{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.badge, backgroundColor: colors.brandDim },
  issueTypeText: { fontSize: typography.sizes.badge, fontFamily: typography.fonts.medium, color: colors.brandText },

  locationRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  locationSep:   { fontSize: typography.sizes.microcopy, color: colors.textMuted },
  locationText:  { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.textSecondary },

  divider:         { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs },
  accordionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  accordionLabel:  { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  accordionChevron:{ fontSize: 10, color: colors.textMuted },
  accordionContent:{ paddingBottom: spacing.sm },
  accordionText:   { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textSecondary, lineHeight: 20 },
  attachmentPreview: { width: 100, height: 100, borderRadius: radius.card, marginRight: spacing.sm },

  imageViewerOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  imageViewerClose:      { position: 'absolute', right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  imageViewerCloseText:  { color: '#fff', fontSize: 16 },
  imageViewerCounter:    { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  imageViewerCounterText:{ color: '#fff', fontSize: 13, fontFamily: typography.fonts.medium, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  imageViewerSlide:      { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  imageViewerFull:       { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  imageViewerDots:       { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  imageViewerDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  imageViewerDotActive:  { backgroundColor: '#fff', width: 18 },

  sectionHeaderRow: { marginBottom: spacing.lg },
  sectionTitle:     { fontSize: typography.sizes.label, fontFamily: typography.fonts.bold, color: colors.textPrimary },
  sectionSubtitle:  { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted, marginTop: 2 },

  timelineContainer:    { paddingLeft: spacing.xs },
  timelineItem:         { flexDirection: 'row', gap: spacing.md },
  timelineDotCol:       { alignItems: 'center', width: 24 },
  timelineDot:          { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.borderDefault, backgroundColor: colors.bgCard },
  timelineDotCompleted: { backgroundColor: colors.brand, borderColor: colors.brand },
  timelineDotActive:    { backgroundColor: colors.brand, borderColor: colors.brand },
  timelineDotInactive:  { backgroundColor: colors.bgCard, borderColor: colors.borderDefault },
  timelineDotInner:     { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bgCard },
  timelineCheck:        { color: '#fff', fontSize: 12, fontFamily: typography.fonts.bold },
  timelineLine:         { width: 2, flex: 1, minHeight: 20, backgroundColor: colors.borderDefault, marginVertical: 2 },
  timelineLineActive:   { backgroundColor: colors.brand },
  timelineContent:      { flex: 1, paddingBottom: spacing.lg },
  timelineLabel:        { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  timelineLabelInactive:{ color: colors.textMuted, fontFamily: typography.fonts.regular },
  timelineDescription:  { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textSecondary, marginTop: 2 },
  timelineChangedBy:    { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  timelineTimestamp:    { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.light, color: colors.textMuted, marginTop: 3 },

  staffRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  staffAvatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brandDim, alignItems: 'center', justifyContent: 'center' },
  staffAvatarText:  { fontSize: 18, fontFamily: typography.fonts.bold, color: colors.brand },
  staffName:        { fontSize: typography.sizes.label, fontFamily: typography.fonts.bold, color: colors.textPrimary },
  staffRole:        { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted, marginTop: 1 },
  staffNotesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  staffNotesLabel:  { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  staffNotesTime:   { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted },
  staffNotesBox:    { backgroundColor: colors.bgElevated, borderRadius: radius.input, padding: spacing.md },
  staffNotesText:   { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textSecondary, lineHeight: 20 },
  cancelInCard:     { marginTop: spacing.lg, alignSelf: 'flex-start' },
  cancelInCardText: { fontSize: typography.sizes.body, fontFamily: typography.fonts.medium, color: '#DC2626' },
  addCommentBtn:  { paddingVertical: spacing.sm, alignSelf: 'flex-start' },
  addCommentText: { fontSize: typography.sizes.body, fontFamily: typography.fonts.medium, color: colors.brand },
  cancelBar:       { backgroundColor: colors.bgBase, borderTopWidth: 0.5, borderTopColor: colors.borderDefault, paddingHorizontal: screenPadding, paddingTop: spacing.md, alignItems: 'center' },
  cancelBarBtn:    { borderWidth: 1.5, borderColor: '#DC2626', borderRadius: radius.button, paddingVertical: 12, paddingHorizontal: 40 },
  cancelBarBtnText:{ fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: '#DC2626' },  

  bottomBar:      { backgroundColor: colors.bgBase, borderTopWidth: 0.5, borderTopColor: colors.borderDefault, paddingHorizontal: screenPadding, paddingTop: spacing.md },
  cancelBarWrap:  { alignItems: 'center' },
  cancelBtn:      { borderWidth: 1.5, borderColor: '#DC2626', borderRadius: radius.button, paddingVertical: spacing.md, paddingHorizontal: 40 },
  cancelBtnText:  { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: '#DC2626' },
  staffActionRow: { flexDirection: 'row', gap: spacing.sm },
  btnPrimary:     { flex: 1, height: 48, backgroundColor: colors.brand, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textOnBrand },
  btnOutline:     { flex: 1, height: 48, borderWidth: 1.5, borderColor: colors.brand, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.brand },

  modalOverlay:       { flex: 1, backgroundColor: colors.bgOverlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalCard:          { backgroundColor: colors.bgCard, borderRadius: radius.modal, padding: spacing.xl, width: '100%' },
  modalTitle:         { fontSize: 18, fontFamily: typography.fonts.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  modalSubtitle:      { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  commentInput:       { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.input, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textPrimary, minHeight: 80, marginBottom: spacing.sm },
  commentRequired:    { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: '#DC2626', marginBottom: spacing.md },
  modalButtons:       { flexDirection: 'row', gap: spacing.md },
  modalSecondaryBtn:  { flex: 1, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.button, paddingVertical: 13, alignItems: 'center' },
  modalSecondaryText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  modalPrimaryBtn:    { flex: 1, borderRadius: radius.button, paddingVertical: 13, alignItems: 'center' },
  modalPrimaryText:   { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textOnBrand },
})