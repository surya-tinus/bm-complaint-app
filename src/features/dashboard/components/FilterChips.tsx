import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { FilterLabel, FILTER_OPTIONS } from '@/features/dashboard/hooks/useDashboard'

interface Props {
  activeFilter: FilterLabel
  onFilterChange: (filter: FilterLabel) => void
}

export function FilterChips({ activeFilter, onFilterChange }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.iconBtn}>
        <Text style={styles.filterIcon}>⚙</Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => onFilterChange(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  filterIcon: {
    fontSize: 16,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#1A56C4',
    borderColor: '#1A56C4',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
})