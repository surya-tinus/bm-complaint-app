//src/app/(dashboard)/index.tsx
import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context' 
import { SearchBar } from '@/components/ui/SearchBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TicketCard } from '@/features/dashboard/components/TicketCard'
import { FilterChips } from '@/features/dashboard/components/FilterChips'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { Ticket } from '@/features/dashboard/types'
import { notifyTicketUpdate } from '@/services/notification.service'

export default function DashboardScreen() {
  const insets = useSafeAreaInsets() 
  const router = useRouter()
  const { searchQuery, setSearchQuery, activeFilter, setActiveFilter, filteredTickets } =
    useDashboard()

  const handleTicketPress = (ticket: Ticket) => {
    router.push(`/(dashboard)/${ticket.id}`)
  }

  const handleCreateTicket = () => {
    router.push('/(dashboard)/create')
  }

  const handleTestNotif = async () => {
    await notifyTicketUpdate('TKT-0001-1113', 'ticket_in_progress')
  }

  return (
    <View style={styles.safeArea}>  {/* ← dari SafeAreaView */}
      <StatusBar barStyle="light-content" backgroundColor="#1A56C4" />

      {/* Header — paddingTop pakai insets */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Manage Ticket</Text>
          <Text style={styles.headerSubtitle}>Check your ticket status here</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search ticket by ID or problem..."
        />
        <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TicketCard ticket={item} onPress={handleTicketPress} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },  // ← dynamic, biar FAB ga nutup konten
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState hasQuery={!!searchQuery} />}
          ListFooterComponent={filteredTickets.length > 0 ? <ListFooter /> : null}
        />
      </View>

      <TouchableOpacity
  style={{ position: 'absolute', bottom: 100, right: 20, backgroundColor: '#1A56C4', padding: 12, borderRadius: 8 }}
  onPress={handleTestNotif}
>
  <Text style={{ color: '#fff', fontSize: 12 }}>Test Notif</Text>
</TouchableOpacity>

      {/* FAB — paddingBottom pakai insets */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}  // ← dynamic
        onPress={handleCreateTicket}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

    </View>
  )
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎫</Text>
      <Text style={styles.emptyTitle}>Tidak ada tiket</Text>
      <Text style={styles.emptySubtitle}>
        {hasQuery
          ? 'Tiket tidak ditemukan. Coba kata kunci lain.'
          : 'Belum ada tiket aktif. Buat tiket baru untuk melaporkan masalah.'}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1A56C4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  backIcon: {
    color: '#fff',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '300',
    marginTop: -2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 1,
  },
  body: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    gap: 10,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
   fab: {
    position: 'absolute',
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1A56C4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A56C4',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    marginTop: -2,
  },
})