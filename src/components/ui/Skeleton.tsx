// src/components/ui/Skeleton.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'
import { colors, spacing, radius } from '@/constants'

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

  return <Animated.View style={[styles.base, style, { opacity }]} />
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.borderDefault, borderRadius: 6 },
})

// ─── Dashboard Skeletons ───────────────────────────────────

export function TicketCardSkeleton() {
  return (
    <View style={dashStyles.card}>
      <View style={dashStyles.cardTop}>
        <SkeletonBox style={{ width: 40, height: 40, borderRadius: 10 }} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox style={{ width: '70%', height: 14 }} />
          <SkeletonBox style={{ width: '45%', height: 11 }} />
        </View>
        <SkeletonBox style={{ width: 64, height: 22, borderRadius: radius.badge }} />
      </View>
      <View style={{ gap: 6, marginTop: spacing.sm }}>
        <SkeletonBox style={{ width: '90%', height: 12 }} />
        <SkeletonBox style={{ width: '65%', height: 12 }} />
        <SkeletonBox style={{ width: '50%', height: 12 }} />
      </View>
    </View>
  )
}

export function StaffOverviewSkeleton() {
  return (
    <View style={dashStyles.overviewGrid}>
      <SkeletonBox style={{ flex: 1, height: 72, borderRadius: radius.card }} />
      <SkeletonBox style={{ flex: 1, height: 72, borderRadius: radius.card }} />
      <SkeletonBox style={{ width: '100%', height: 56, borderRadius: radius.card }} />
    </View>
  )
}

export function DashboardSkeleton({ isStaff }: { isStaff: boolean }) {
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
      {isStaff && <StaffOverviewSkeleton />}
      {[0, 1, 2, 3].map((i) => <TicketCardSkeleton key={i} />)}
    </View>
  )
}

const dashStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
})

// ─── Ticket Detail Skeletons ───────────────────────────────

export function TicketInfoCardSkeleton() {
  return (
    <View style={detailStyles.card}>
      <View style={detailStyles.titleRow}>
        <SkeletonBox style={{ width: 38, height: 38, borderRadius: 10 }} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox style={{ width: '75%', height: 15 }} />
          <SkeletonBox style={{ width: '50%', height: 11 }} />
        </View>
        <SkeletonBox style={{ width: 64, height: 22, borderRadius: radius.badge }} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <SkeletonBox style={{ width: 90, height: 22, borderRadius: radius.badge }} />
        <SkeletonBox style={{ width: 70, height: 22, borderRadius: radius.badge }} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <SkeletonBox style={{ width: 100, height: 12 }} />
        <SkeletonBox style={{ width: 80, height: 12 }} />
      </View>
      <SkeletonBox style={{ height: 1, marginVertical: spacing.xs }} />
      <View style={detailStyles.accordionRow}>
        <SkeletonBox style={{ width: 120, height: 14 }} />
        <SkeletonBox style={{ width: 14, height: 14, borderRadius: 3 }} />
      </View>
      <SkeletonBox style={{ height: 1, marginVertical: spacing.xs }} />
      <View style={detailStyles.accordionRow}>
        <SkeletonBox style={{ width: 90, height: 14 }} />
        <SkeletonBox style={{ width: 14, height: 14, borderRadius: 3 }} />
      </View>
    </View>
  )
}

export function StatusTimelineCardSkeleton() {
  return (
    <View style={detailStyles.card}>
      <View style={{ gap: 5, marginBottom: spacing.lg }}>
        <SkeletonBox style={{ width: 130, height: 14 }} />
        <SkeletonBox style={{ width: 180, height: 11 }} />
      </View>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ alignItems: 'center', width: 24 }}>
            <SkeletonBox style={{ width: 24, height: 24, borderRadius: 12 }} />
            {i < 3 && <SkeletonBox style={{ width: 2, height: 28, borderRadius: 1, marginTop: 2 }} />}
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <SkeletonBox style={{ width: '55%', height: 13 }} />
            <SkeletonBox style={{ width: '80%', height: 11 }} />
            <SkeletonBox style={{ width: '40%', height: 10 }} />
          </View>
        </View>
      ))}
    </View>
  )
}

export function AssignedStaffCardSkeleton() {
  return (
    <View style={detailStyles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
        <SkeletonBox style={{ width: 44, height: 44, borderRadius: 22 }} />
        <View style={{ gap: 6 }}>
          <SkeletonBox style={{ width: 120, height: 14 }} />
          <SkeletonBox style={{ width: 80, height: 11 }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <SkeletonBox style={{ width: 100, height: 13 }} />
        <SkeletonBox style={{ width: 70, height: 11 }} />
      </View>
      <View style={detailStyles.notesBox}>
        <SkeletonBox style={{ width: '100%', height: 12, marginBottom: 6 }} />
        <SkeletonBox style={{ width: '85%', height: 12, marginBottom: 6 }} />
        <SkeletonBox style={{ width: '60%', height: 12 }} />
      </View>
    </View>
  )
}

export function AttachmentThumbnailSkeleton() {
  return <SkeletonBox style={{ width: 100, height: 100, borderRadius: radius.card, marginRight: spacing.sm }} />
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
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  accordionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  notesBox:     { backgroundColor: colors.bgElevated, borderRadius: radius.input, padding: spacing.md },
})