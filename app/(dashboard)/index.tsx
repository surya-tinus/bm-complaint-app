import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ScrollView,    
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { claimTicket, requestUnassign } from '@/services/ticket.service'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchBar } from '@/components/ui/SearchBar'
import { TicketCard } from '@/features/dashboard/components/TicketCard'
import { FilterChips } from '@/features/dashboard/components/FilterChips'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useAuthStore } from '@/store/auth.store'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'
import { ClockCounterClockwise, ClipboardText} from 'phosphor-react-native'

export default function DashboardScreen() {
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
const [rejectReason, setRejectReason] = useState('')
const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const {
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    filteredTickets,
    assignedTickets,
    activeTickets,
    stats,
    role,
    isLoading,
    isError,
    refetch,
  } = useDashboard()

  const isStaff = role === 'Staff'

  const handleTicketPress = (ticket: any) => {
    router.push(`/(dashboard)/${ticket.id}`)
  }

  const handleCreateTicket = () => {
    router.push('/(dashboard)/create')
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/(auth)/login')
  }

  const handleUpdateStatus = (ticket: any) => {
    router.push(`/(dashboard)/${ticket.id}?openSheet=true`)
  }

  const queryClient = useQueryClient()

const claimMutation = useMutation({
  mutationFn: (ticketId: string) => claimTicket(ticketId),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
})

const rejectMutation = useMutation({
  mutationFn: ({ id, reason }: { id: string; reason: string }) => requestUnassign(id, reason),
  onSuccess: () => {
    setRejectModalVisible(false)
    setRejectReason('')
    setSelectedTicket(null)
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
  },
  onError: (err: any) => {
    console.log('REQUEST UNASSIGN ERROR:', err?.response?.status, err?.response?.data, err?.message)
  },
})

const handleAccept = (ticket: any) => {
  claimMutation.mutate(ticket.id)
}

const handleReject = (ticket: any) => {
  setSelectedTicket(ticket)
  setRejectReason('')
  setRejectModalVisible(true)
}

const handleConfirmReject = () => {
  if (!rejectReason.trim() || !selectedTicket) return
  rejectMutation.mutate({ id: selectedTicket.id, reason: rejectReason })
}
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand} />

      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.appBarTitle}>
            {isStaff ? 'Home' : 'My Tickets'}
          </Text>
          <Text style={styles.appBarSubtitle}>
            {isStaff ? 'Summary of today\'s activity' : 'Track your ticket status here'}
          </Text>
        </View>
        {isStaff && (
  <TouchableOpacity
    style={styles.backBtn}
    onPress={() => router.push('/(dashboard)/history')}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <ClockCounterClockwise size={20} color={colors.textOnBrand} weight="regular" />
  </TouchableOpacity>
)}
{role === 'Admin' && (
  <TouchableOpacity
    style={styles.backBtn}
    onPress={() => router.push('/(dashboard)/requests')}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <ClipboardText size={20} color={colors.textOnBrand} weight="regular" />
  </TouchableOpacity>
)}
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <>
            <View style={styles.searchArea}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by ticket ID or issue..."
              />
              <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </View>
            <DashboardSkeleton isStaff={isStaff} />
          </>
        ) : (
          <FlatList
  data={isStaff ? assignedTickets : filteredTickets}  // ← was activeTickets
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => (
    <TicketCard
      ticket={item}
      onPress={handleTicketPress}
      role={isStaff ? 'staff' : 'user'}
      section={isStaff ? 'assigned' : 'user'}          // ← was 'active'
      onAccept={handleAccept}
      onReject={handleReject}
    />
  )}
  contentContainerStyle={[
    styles.listContent,
    { paddingBottom: insets.bottom + 100 },
  ]}
  showsVerticalScrollIndicator={false}
  ListHeaderComponent={
    <>
      <View style={styles.searchArea}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by ticket ID or issue..."
        />
        {!isStaff && (
          <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        )}
      </View>

      {isStaff && stats && (
        <StaffOverview stats={stats} />
      )}

      {/* Active Tickets — horizontal scroll, muncul dulu */}
      {isStaff && (
        <ActiveSection
          tickets={activeTickets}
          onPress={handleTicketPress}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* New Tickets — label sebelum FlatList body */}
      {isStaff && (
        <SectionLabel label="New Tickets" />
      )}
    </>
  }
  ListEmptyComponent={
    <EmptyState hasQuery={!!searchQuery} isStaff={isStaff} />
  }
  ListFooterComponent={
    assignedTickets.length > 0 ? (
      <View style={styles.listFooter}>
        <View style={styles.listFooterLine} />
        <Text style={styles.listFooterText}>All tickets have been loaded</Text>
        <View style={styles.listFooterLine} />
      </View>
    ) : null
  }
/>
      
        )}
      </View>
      

      {/* FAB — user only */}
      {!isStaff && role !== 'Admin' && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 20 }]}
          onPress={handleCreateTicket}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Reject Modal */}
<Modal visible={rejectModalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Reject this ticket?</Text>
      <Text style={styles.modalSubtitle}>
        Ticket #{selectedTicket?.id} · {selectedTicket?.shortDescription}
      </Text>

      <TextInput
        style={styles.commentInput}
        placeholder="Reason for rejection..."
        placeholderTextColor={colors.textMuted}
        value={rejectReason}
        onChangeText={setRejectReason}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      {!rejectReason.trim() && rejectReason.length > 0 && (
        <Text style={styles.commentRequired}>Reason is required</Text>
      )}

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.modalSecondaryBtn}
          onPress={() => setRejectModalVisible(false)}
          disabled={rejectMutation.isPending}
        >
          <Text style={styles.modalSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalPrimaryBtn, { backgroundColor: '#DC2626', opacity: !rejectReason.trim() ? 0.4 : 1 }]}
          onPress={handleConfirmReject}
          disabled={!rejectReason.trim() || rejectMutation.isPending}
        >
          {rejectMutation.isPending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.modalPrimaryText}>Reject</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  )
}

// ─── Staff Overview Tiles ──────────────────────────────────

function StaffOverview({
  stats,
}: {
  stats: { assigned: number; active: number; completed: number }
}) {
  return (
    <View style={styles.overviewGrid}>
      <View style={[styles.overviewTile, { backgroundColor: colors.brandDim, borderWidth: 0.5, borderColor: colors.borderStrong }]}>
  <Text style={[styles.overviewNum, { color: colors.brandText }]}>{stats.assigned}</Text>
  <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>New Tickets</Text>
</View>
      <View style={[styles.overviewTile, { backgroundColor: colors.brandDim }]}>
        <Text style={[styles.overviewNum, { color: colors.brandText }]}>{stats.active}</Text>
        <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Active</Text>
      </View>
      <View style={[styles.overviewTileWide, {
        backgroundColor: colors.bgCard,
        borderWidth: 0.5,
        borderColor: colors.borderDefault,
      }]}>
        <Text style={[styles.overviewNum, { color: colors.textPrimary, fontSize: 22 }]}>
          {stats.completed}
        </Text>
        <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
          Completed
        </Text>
      </View>
    </View>
  )
}
// ─── Active Section (horizontal scroll) ───────────────────

function ActiveSection({
  tickets,
  onPress,
  onUpdateStatus,
}: {
  tickets: any[]
  onPress: (ticket: any) => void
  onUpdateStatus: (ticket: any) => void
}) {
  return (
    <View style={styles.sectionWrap}>
      <SectionLabel label="Active Tickets" />
      {tickets.length === 0 ? (
        <View style={styles.activeEmpty}>
          <Text style={styles.emptySubtitle}>No tickets currently in progress.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeScrollContent}
        >
          {tickets.map((ticket) => (
            <View key={ticket.id} style={styles.activeCardWrap}>
              <TicketCard
                ticket={ticket}
                onPress={onPress}
                role="staff"
                section="active"
                onUpdateStatus={onUpdateStatus}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

// ─── Assigned Section ──────────────────────────────────────

function AssignedSection({
  tickets,
  onPress,
  onAccept,
  onReject,
}: {
  tickets: any[]
  onPress: (ticket: any) => void
  onAccept: (ticket: any) => void
  onReject: (ticket: any) => void
}) {
  return (
    <View style={styles.sectionWrap}>
      <SectionLabel label="New Tickets" />
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onPress={onPress}
          role="staff"
          section="assigned"
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </View>
  )
}

// ─── Section Label ─────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label}</Text>
  )
}

// ─── Error State ───────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.emptyTitle}>Failed to load tickets</Text>
      <Text style={styles.emptySubtitle}>Check your connection and try again</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Empty State ───────────────────────────────────────────

function EmptyState({ hasQuery, isStaff }: { hasQuery: boolean; isStaff: boolean }) {
  const title = hasQuery ? 'No results found' : 'No tickets yet'
  const subtitle = hasQuery
    ? 'Try a different keyword or check the ticket number.'
    : isStaff
      ? 'Spotted an issue nearby? Tap + to report it.'
      : 'No tickets are currently being handled.'

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────

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

  searchArea: {
    
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  listContent: {
    paddingHorizontal: screenPadding,
  },

  // Overview tiles
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  overviewTile: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing.md,
    minWidth: '45%',
  },
  overviewTileWide: {
    width: '100%',
    borderRadius: radius.card,
    padding: spacing.md,
  },
  overviewNum: {
    fontSize: 28,
    fontFamily: typography.fonts.black,
    color: colors.textOnBrand,
    lineHeight: 32,
  },
  overviewLabel: {
    fontSize: typography.sizes.microcopy,
    fontFamily: typography.fonts.regular,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },

  sectionWrap: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.sizes.sectionHeader,
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  // Error / empty
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: screenPadding,
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
    lineHeight: 20,
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

  // FAB
  fab: {
    position: 'absolute',
    right: screenPadding,
    width: 52,
    height: 52,
    borderRadius: radius.fab,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.brandSubtle,
  },
  fabIcon: {
    color: colors.textOnBrand,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: typography.fonts.light,
  },
  listFooter: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.md,
},
listFooterLine: {
  flex: 1,
  height: 0.5,
  backgroundColor: colors.borderDefault,
},
listFooterText: {
  fontSize: typography.sizes.microcopy,
  fontFamily: typography.fonts.regular,
  color: colors.textMuted,
},
activeScrollContent: {
  paddingRight: screenPadding,
  gap: spacing.sm,
},
activeCardWrap: {
  width: 280,
},
activeEmpty: {
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
},
modalOverlay: {
  flex: 1,
  backgroundColor: colors.bgOverlay,
  justifyContent: 'center',         // ← center seperti pattern yang ada
  alignItems: 'center',
  paddingHorizontal: 32,
},
modalTitle: {
  fontSize: typography.sizes.cardTitle,
  fontFamily: typography.fonts.bold,
  color: colors.textPrimary,
},
modalSubtitle: {
  fontSize: typography.sizes.body,
  fontFamily: typography.fonts.regular,
  color: colors.textSecondary,
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
},
commentRequired:    { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: '#DC2626', marginBottom: spacing.md },
  modalButtons:       { flexDirection: 'row', gap: spacing.md },
  modalSecondaryBtn:  { flex: 1, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.button, paddingVertical: 13, alignItems: 'center' },
  modalSecondaryText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  modalPrimaryBtn:    { flex: 1, borderRadius: radius.button, paddingVertical: 13, alignItems: 'center' },
  modalPrimaryText:   { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textOnBrand },
  modalCard:          { backgroundColor: colors.bgCard, borderRadius: radius.modal, padding: spacing.xl, width: '100%' },
  commentInput:       { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.input, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textPrimary, minHeight: 80, marginBottom: spacing.sm },

  historyBtn: {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: radius.button,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
},
historyBtnText: {
  color: colors.textOnBrand,
  fontSize: typography.sizes.body,
  fontFamily: typography.fonts.medium,
},
})