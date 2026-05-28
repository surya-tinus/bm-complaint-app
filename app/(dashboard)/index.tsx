// app/(dashboard)/index.tsx
import React from 'react'
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { SearchBar } from '@/components/ui/SearchBar'
import { TicketCard } from '@/features/dashboard/components/TicketCard'
import { FilterChips } from '@/features/dashboard/components/FilterChips'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useAuthStore } from '@/store/auth.store'

export default function DashboardScreen() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const {
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    filteredTickets,
    assignedTickets,
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

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56C4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Manage Ticket</Text>
          <Text style={styles.headerSubtitle}>Check your ticket status here</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(dashboard)/notifications')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isError ? (
          <View style={styles.centered}>
            <Ionicons name="warning-outline" size={40} color="#9CA3AF" />
            <Text style={styles.errorText}>Gagal memuat tiket</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Coba lagi</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search ticket by ID or problem..."
            />
            <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <FlatList
              data={[]}
              renderItem={null}
              ListHeaderComponent={<DashboardSkeleton isStaff={isStaff} />}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search ticket by ID or problem..."
            />
            <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            <FlatList
              data={filteredTickets}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TicketCard ticket={item} onPress={handleTicketPress} />
              )}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom + 100 },
              ]}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                isStaff ? (
                  <StaffHeader
                    stats={stats}
                    assignedTickets={assignedTickets}
                    onTicketPress={handleTicketPress}
                  />
                ) : null
              }
              ListEmptyComponent={<EmptyState hasQuery={!!searchQuery} />}
              ListFooterComponent={filteredTickets.length > 0 ? <ListFooter /> : null}
            />
          </>
        )}
      </View>

      {/* FAB — hanya untuk User */}
      {role !== 'Staff' && role !== 'Admin' && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 20 }]}
          onPress={handleCreateTicket}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─── Staff Header ──────────────────────────────────────────

function StaffHeader({
  stats,
  assignedTickets,
  onTicketPress,
}: {
  stats: { assigned: number; active: number; completed: number } | null
  assignedTickets: any[]
  onTicketPress: (ticket: any) => void
}) {
  return (
    <>
      {stats && (
        <View style={styles.statsCard}>
          <StatItem icon="ticket-outline" value={stats.assigned} label="Assigned" color="#1A56C4" />
          <View style={styles.statsDivider} />
          <StatItem icon="construct-outline" value={stats.active} label="Active" color="#F59E0B" />
          <View style={styles.statsDivider} />
          <StatItem icon="checkmark-circle-outline" value={stats.completed} label="Completed" color="#10B981" />
        </View>
      )}
      {assignedTickets.length > 0 && (
        <AssignedTicketsRow tickets={assignedTickets} onPress={onTicketPress} />
      )}
    </>
  )
}

function StatItem({
  icon, value, label, color,
}: {
  icon: keyof typeof Ionicons.glyphMap
  value: number
  label: string
  color: string
}) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={22} color={color} style={{ marginBottom: 4 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── Assigned Tickets Horizontal Row ──────────────────────

function AssignedTicketsRow({
  tickets, onPress,
}: {
  tickets: any[]
  onPress: (ticket: any) => void
}) {
  return (
    <View style={styles.assignedSection}>
      <View style={styles.assignedHeader}>
        <View style={styles.assignedHeaderLeft}>
          <View style={styles.assignedDot} />
          <Text style={styles.assignedTitle}>My Active Tickets</Text>
        </View>
        <Text style={styles.assignedCount}>
          {tickets.length} ticket{tickets.length > 1 ? 's' : ''}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.assignedScroll}
      >
        {tickets.map((ticket) => (
          <AssignedTicketCard key={ticket.id} ticket={ticket} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  )
}

function AssignedTicketCard({
  ticket, onPress,
}: {
  ticket: any
  onPress: (ticket: any) => void
}) {
  const PRIORITY_COLORS: Record<string, string> = {
    low: '#10B981', medium: '#F59E0B', high: '#EF4444',
  }
  const priorityColor = PRIORITY_COLORS[ticket.priority] ?? '#6B7280'
  const shortDesc = ticket.short_description ?? ticket.shortDescription ?? ''
  const building = ticket.building ?? ticket.place?.building ?? ''
  const statusName = ticket.status_name ?? ticket.status ?? ''

  return (
    <TouchableOpacity
      style={styles.assignedCard}
      onPress={() => onPress(ticket)}
      activeOpacity={0.85}
    >
      <View style={[styles.assignedCardAccent, { backgroundColor: priorityColor }]} />
      <View style={styles.assignedCardBody}>
        <StatusBadge status={statusName} />
        <Text style={styles.assignedCardTitle} numberOfLines={2}>{shortDesc}</Text>
        <Text style={styles.assignedCardId}>#{ticket.id}</Text>
        <View style={styles.assignedCardMeta}>
          <Ionicons name="location-outline" size={11} color="#9CA3AF" />
          <Text style={styles.assignedCardMetaText} numberOfLines={1}>{building}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── Empty / Footer ────────────────────────────────────────

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="ticket-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Tidak ada tiket</Text>
      <Text style={styles.emptySubtitle}>
        {hasQuery
          ? 'Tiket tidak ditemukan. Coba kata kunci lain.'
          : 'Belum ada tiket aktif.'}
      </Text>
    </View>
  )
}

function ListFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerLine} />
      <Text style={styles.footerText}>No More Tickets Left to Show</Text>
      <View style={styles.footerLine} />
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A56C4' },
  header: {
    backgroundColor: '#1A56C4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#1A56C4', borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 8 },

  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statsDivider: { width: 1, height: 40, backgroundColor: '#F3F4F6' },
  statValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  assignedSection: { marginBottom: 20, marginHorizontal: -16 },
  assignedHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  assignedHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assignedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A56C4' },
  assignedTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  assignedCount: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  assignedScroll: { paddingHorizontal: 16, gap: 12 },
  assignedCard: {
    width: 180, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  assignedCardAccent: { height: 4, width: '100%' },
  assignedCardBody: { padding: 12, gap: 6 },
  assignedCardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', lineHeight: 18, marginTop: 4 },
  assignedCardId: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  assignedCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  assignedCardMetaText: { fontSize: 11, color: '#6B7280', flex: 1 },

  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingHorizontal: 32, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 4, marginBottom: 8, gap: 10,
  },
  footerLine: { flex: 1, height: 1, backgroundColor: '#D1D5DB' },
  footerText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  fab: {
    position: 'absolute', right: 20,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#1A56C4',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1A56C4', shadowOpacity: 0.45,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
})