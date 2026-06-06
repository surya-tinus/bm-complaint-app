import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchBar } from '@/components/ui/SearchBar'
import { TicketCard } from '@/features/dashboard/components/TicketCard'
import { FilterChips } from '@/features/dashboard/components/FilterChips'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useAuthStore } from '@/store/auth.store'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'

export default function DashboardScreen() {
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

  const handleAccept = (ticket: any) => {
    // TODO: call accept mutation
  }

  const handleReject = (ticket: any) => {
    // TODO: call reject mutation — show reason sheet
  }

  const handleUpdateStatus = (ticket: any) => {
    router.push(`/(dashboard)/${ticket.id}?openSheet=true`)
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
            data={isStaff ? activeTickets : filteredTickets}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TicketCard
                ticket={item}
                onPress={handleTicketPress}
                role={isStaff ? 'staff' : 'user'}
                section={isStaff ? 'active' : 'user'}
                onUpdateStatus={handleUpdateStatus}
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

                {isStaff && assignedTickets.length > 0 && (
                  <AssignedSection
                    tickets={assignedTickets}
                    onPress={handleTicketPress}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                )}

                {isStaff && (
                  <SectionLabel label="Active Tickets" />
                )}
              </>
            }
            ListEmptyComponent={
              <EmptyState
                hasQuery={!!searchQuery}
                isStaff={isStaff}
              />
            }
            ListFooterComponent={
  filteredTickets.length > 0 ? (
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
      <View style={[styles.overviewTile, { backgroundColor: colors.brand }]}>
        <Text style={styles.overviewNum}>{stats.assigned}</Text>
        <Text style={styles.overviewLabel}>New Tickets</Text>
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
})