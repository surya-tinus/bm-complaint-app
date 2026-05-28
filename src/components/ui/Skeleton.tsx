// src/components/ui/Skeleton.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'

// ─── Base Shimmer ──────────────────────────────────────────

export function SkeletonBox({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] })

  return (
    <Animated.View
      style={[skeletonStyles.base, style, { opacity }]}
    />
  )
}

const skeletonStyles = StyleSheet.create({
  base: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
})

// ─── Dashboard Skeletons ───────────────────────────────────

export function StatsCardSkeleton() {
  return (
    <View style={dashStyles.statsCard}>
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <View style={dashStyles.statItem}>
            <SkeletonBox style={{ width: 24, height: 24, borderRadius: 12, marginBottom: 6 }} />
            <SkeletonBox style={{ width: 36, height: 22, marginBottom: 4 }} />
            <SkeletonBox style={{ width: 52, height: 11 }} />
          </View>
          {i < 2 && <View style={dashStyles.statsDivider} />}
        </React.Fragment>
      ))}
    </View>
  )
}

export function AssignedTicketCardSkeleton() {
  return (
    <View style={dashStyles.assignedCard}>
      <SkeletonBox style={{ height: 4, borderRadius: 0 }} />
      <View style={dashStyles.assignedCardBody}>
        <SkeletonBox style={{ width: 72, height: 20, borderRadius: 10 }} />
        <SkeletonBox style={{ width: '90%', height: 13, marginTop: 6 }} />
        <SkeletonBox style={{ width: '60%', height: 13, marginTop: 3 }} />
        <SkeletonBox style={{ width: 48, height: 11, marginTop: 2 }} />
        <SkeletonBox style={{ width: '70%', height: 11, marginTop: 4 }} />
      </View>
    </View>
  )
}

export function TicketCardSkeleton() {
  return (
    <View style={dashStyles.ticketCard}>
      <View style={dashStyles.ticketCardTop}>
        <SkeletonBox style={{ width: 36, height: 36, borderRadius: 18 }} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox style={{ width: '70%', height: 14 }} />
          <SkeletonBox style={{ width: '45%', height: 11 }} />
        </View>
        <SkeletonBox style={{ width: 64, height: 22, borderRadius: 10 }} />
      </View>
      <View style={{ gap: 6, marginTop: 10 }}>
        <SkeletonBox style={{ width: '90%', height: 12 }} />
        <SkeletonBox style={{ width: '65%', height: 12 }} />
      </View>
      <View style={dashStyles.ticketCardBottom}>
        <SkeletonBox style={{ width: 80, height: 11 }} />
        <SkeletonBox style={{ width: 80, height: 11 }} />
      </View>
    </View>
  )
}

export function DashboardSkeleton({ isStaff }: { isStaff: boolean }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      {isStaff && (
        <>
          <StatsCardSkeleton />
          {/* Assigned tickets horizontal row skeleton */}
          <View style={{ marginBottom: 20, marginHorizontal: -16 }}>
            <View style={dashStyles.assignedHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <SkeletonBox style={{ width: 8, height: 8, borderRadius: 4 }} />
                <SkeletonBox style={{ width: 130, height: 15 }} />
              </View>
              <SkeletonBox style={{ width: 50, height: 12 }} />
            </View>
            <View style={dashStyles.assignedScroll}>
              {[0, 1, 2].map((i) => (
                <AssignedTicketCardSkeleton key={i} />
              ))}
            </View>
          </View>
        </>
      )}
      {/* Ticket list skeleton */}
      {[0, 1, 2, 3].map((i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </View>
  )
}

const dashStyles = StyleSheet.create({
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
  assignedHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  assignedScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  assignedCard: {
    width: 180, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  assignedCardBody: { padding: 12, gap: 4 },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ticketCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ticketCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12,
  },
})

// ─── Ticket Detail Skeletons ───────────────────────────────

export function TicketInfoCardSkeleton() {
  return (
    <View style={detailStyles.card}>
      {/* Title row */}
      <View style={detailStyles.titleRow}>
        <SkeletonBox style={{ width: 38, height: 38, borderRadius: 19 }} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox style={{ width: '75%', height: 15 }} />
          <SkeletonBox style={{ width: '50%', height: 12 }} />
        </View>
        <SkeletonBox style={{ width: 64, height: 22, borderRadius: 10 }} />
      </View>
      {/* Badges */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <SkeletonBox style={{ width: 90, height: 22, borderRadius: 6 }} />
        <SkeletonBox style={{ width: 70, height: 22, borderRadius: 6 }} />
      </View>
      {/* Location */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
        <SkeletonBox style={{ width: 100, height: 12 }} />
        <SkeletonBox style={{ width: 80, height: 12 }} />
      </View>
      <SkeletonBox style={{ height: 1, marginVertical: 4 }} />
      {/* Accordion rows */}
      <View style={detailStyles.accordionRow}>
        <SkeletonBox style={{ width: 120, height: 14 }} />
        <SkeletonBox style={{ width: 16, height: 16, borderRadius: 4 }} />
      </View>
      <SkeletonBox style={{ height: 1, marginVertical: 4 }} />
      <View style={detailStyles.accordionRow}>
        <SkeletonBox style={{ width: 90, height: 14 }} />
        <SkeletonBox style={{ width: 16, height: 16, borderRadius: 4 }} />
      </View>
    </View>
  )
}

export function StatusTimelineCardSkeleton() {
  return (
    <View style={detailStyles.card}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <SkeletonBox style={{ width: 36, height: 36, borderRadius: 18 }} />
        <View style={{ gap: 6 }}>
          <SkeletonBox style={{ width: 130, height: 15 }} />
          <SkeletonBox style={{ width: 180, height: 11 }} />
        </View>
      </View>
      {/* Timeline steps */}
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ alignItems: 'center', width: 24 }}>
            <SkeletonBox style={{ width: 24, height: 24, borderRadius: 12 }} />
            {i < 3 && <SkeletonBox style={{ width: 2, height: 32, borderRadius: 1, marginTop: 2 }} />}
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <SkeletonBox style={{ width: '55%', height: 14 }} />
            <SkeletonBox style={{ width: '80%', height: 12 }} />
            <SkeletonBox style={{ width: '40%', height: 11 }} />
          </View>
        </View>
      ))}
    </View>
  )
}

export function AssignedStaffCardSkeleton() {
  return (
    <View style={detailStyles.card}>
      {/* Staff row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <SkeletonBox style={{ width: 44, height: 44, borderRadius: 22 }} />
        <View style={{ gap: 6 }}>
          <SkeletonBox style={{ width: 120, height: 15 }} />
          <SkeletonBox style={{ width: 80, height: 12 }} />
        </View>
      </View>
      {/* Notes header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBox style={{ width: 110, height: 13 }} />
        <SkeletonBox style={{ width: 70, height: 11 }} />
      </View>
      {/* Notes box */}
      <View style={detailStyles.notesBox}>
        <SkeletonBox style={{ width: '100%', height: 12, marginBottom: 6 }} />
        <SkeletonBox style={{ width: '85%', height: 12, marginBottom: 6 }} />
        <SkeletonBox style={{ width: '60%', height: 12 }} />
      </View>
    </View>
  )
}

export function AttachmentThumbnailSkeleton() {
  return (
    <SkeletonBox style={{ width: 100, height: 100, borderRadius: 10, marginRight: 8 }} />
  )
}

export function TicketDetailSkeleton() {
  return (
    <>
      <TicketInfoCardSkeleton />
      <StatusTimelineCardSkeleton />
      <AssignedStaffCardSkeleton />
    </>
  )
}

const detailStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  accordionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  notesBox: {
    backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12,
  },
})