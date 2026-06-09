import React from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { getAllTickets } from '@/services/ticket.service'
import { useAuthStore } from '@/store/auth.store'
import { TicketCard } from '@/features/dashboard/components/TicketCard'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'

export default function HistoryScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const { data: tickets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets', user?.emplid, user?.dept],
    queryFn: () => getAllTickets(),
    staleTime: 1000 * 60 * 2,
    enabled: !!user?.emplid,
  })

  // Filter: hanya ticket yang assigned ke staff ini dan sudah Resolved
  const historyTickets = tickets.filter((t: any) =>
  t.status_name === 'Resolved'
)

  const handleTicketPress = (ticket: any) => {
    router.push(`/(dashboard)/${ticket.id}`)
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
          <Text style={styles.appBarTitle}>History</Text>
          <Text style={styles.appBarSubtitle}>Tickets you have resolved</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isError ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>Failed to load history</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <DashboardSkeleton isStaff />
        ) : (
          <FlatList
            data={historyTickets}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TicketCard
                ticket={item}
                onPress={handleTicketPress}
                role="staff"
                section="history"
              />
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No resolved tickets yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tickets you resolve will appear here.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

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
})