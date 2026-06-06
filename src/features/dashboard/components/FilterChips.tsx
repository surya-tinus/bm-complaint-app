//src/features/dashboard/components/FilterChips.tsx
import React from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '@/constants'
import { FilterLabel, FILTER_OPTIONS } from '@/features/dashboard/hooks/useDashboard'

interface Props {
  activeFilter: FilterLabel
  onFilterChange: (filter: FilterLabel) => void
}

export function FilterChips({ activeFilter, onFilterChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {FILTER_OPTIONS.map((f) => {
        const isActive = activeFilter === f
        return (
          <TouchableOpacity
            key={f}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {f}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radius.chip,
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },
  chipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontSize: typography.sizes.label,
    fontFamily: typography.fonts.medium,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.textOnBrand,
    fontFamily: typography.fonts.medium,
  },
})