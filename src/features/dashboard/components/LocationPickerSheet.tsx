//src/features/dashboard/components/LocationPickerSheet.tsx
import React, { useState, useMemo, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  StyleSheet, Modal, Platform, Animated, PanResponder,
  Dimensions, KeyboardAvoidingView,
} from 'react-native'
import { Place } from '@/features/dashboard/types'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55
const FULL_HEIGHT = SCREEN_HEIGHT * 0.92
const COLLAPSED_OFFSET = FULL_HEIGHT - SHEET_HEIGHT
const SWIPE_DOWN_THRESHOLD = 80
const SWIPE_UP_THRESHOLD = -50

type ListRow =
  | { type: 'header'; building: string; key: string }
  | { type: 'item'; place: Place; key: string }

interface Props {
  places: Place[]
  placesByBuilding: Record<string, Place[]>
  selectedPlaceId: number | null
  onSelectPlace: (id: number) => void
}

export function LocationPickerSheet({ places, placesByBuilding, selectedPlaceId, onSelectPlace }: Props) {
  const [open, setOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')

  const translateY = useRef(new Animated.Value(FULL_HEIGHT)).current
  const sheetState = useRef<'collapsed' | 'expanded'>('collapsed')
  const selectedPlace = places.find((p) => p.id === selectedPlaceId)

  const animateTo = (toValue: number, onDone?: () => void) => {
    Animated.spring(translateY, { toValue, useNativeDriver: true, bounciness: 4, speed: 14 }).start(onDone)
  }

  const openSheet = () => {
    setOpen(true); setIsExpanded(false)
    sheetState.current = 'collapsed'
    translateY.setValue(FULL_HEIGHT)
    animateTo(COLLAPSED_OFFSET)
  }

  const closeSheet = () => {
    animateTo(FULL_HEIGHT, () => { setOpen(false); setIsExpanded(false); setQuery(''); sheetState.current = 'collapsed' })
  }

  const expandSheet = () => { sheetState.current = 'expanded'; setIsExpanded(true); animateTo(0) }
  const collapseSheet = () => { sheetState.current = 'collapsed'; setIsExpanded(false); animateTo(COLLAPSED_OFFSET) }

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
    onPanResponderMove: (_, { dy }) => {
      const base = sheetState.current === 'expanded' ? 0 : COLLAPSED_OFFSET
      translateY.setValue(Math.min(Math.max(base + dy, 0), FULL_HEIGHT))
    },
    onPanResponderRelease: (_, { dy, vy }) => {
      const expanded = sheetState.current === 'expanded'
      if (vy > 0.5)                          { expanded ? collapseSheet() : closeSheet() }
      else if (vy < -0.5)                    { expandSheet() }
      else if (dy > SWIPE_DOWN_THRESHOLD)    { expanded ? collapseSheet() : closeSheet() }
      else if (dy < SWIPE_UP_THRESHOLD)      { expandSheet() }
      else                                   { animateTo(expanded ? 0 : COLLAPSED_OFFSET) }
    },
  })).current

  const handleSelect = (id: number) => { onSelectPlace(id); closeSheet(); setQuery('') }

  const listData = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result: ListRow[] = []
    for (const [building, buildingPlaces] of Object.entries(placesByBuilding)) {
      const filtered = q
        ? buildingPlaces.filter((p) => p.name.toLowerCase().includes(q) || p.building.toLowerCase().includes(q))
        : buildingPlaces
      if (filtered.length === 0) continue
      result.push({ type: 'header', building, key: `header-${building}` })
      filtered.forEach((p) => result.push({ type: 'item', place: p, key: `item-${p.id}` }))
    }
    return result
  }, [placesByBuilding, query])

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, selectedPlace && styles.triggerFilled]}
        onPress={openSheet}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !selectedPlace && styles.triggerPlaceholder]} numberOfLines={1}>
          {selectedPlace ? `${selectedPlace.building} — ${selectedPlace.name}` : 'Pilih lokasi'}
        </Text>
        <Text style={styles.triggerChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={closeSheet}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeSheet} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kavWrapper} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, { height: FULL_HEIGHT, transform: [{ translateY }] }]}>

            {/* Handle + Header — drag zone */}
            <View {...panResponder.panHandlers}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Pilih Lokasi</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity onPress={isExpanded ? collapseSheet : expandSheet} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.expandBtn}>
                    <Text style={styles.expandBtnText}>{isExpanded ? '▾' : '▴'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari ruangan atau gedung..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            <FlatList
              data={listData}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              style={{ flex: 1 }}
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return (
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupHeaderText}>{item.building}</Text>
                    </View>
                  )
                }
                const isSelected = selectedPlaceId === item.place.id
                return (
                  <TouchableOpacity
                    style={[styles.placeItem, isSelected && styles.placeItemSelected]}
                    onPress={() => handleSelect(item.place.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.placeItemText, isSelected && styles.placeItemTextSelected]}>
                      {item.place.name}
                    </Text>
                    {isSelected && <Text style={styles.placeItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Tidak ada hasil untuk "{query}"</Text>
                </View>
              }
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  triggerFilled:      { borderColor: colors.brandSubtle, backgroundColor: colors.brandDim },
  triggerText:        { flex: 1, fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textPrimary },
  triggerPlaceholder: { color: colors.textMuted },
  triggerChevron:     { fontSize: 14, color: colors.textMuted },

  kavWrapper: { flex: 1, justifyContent: 'flex-end', pointerEvents: 'box-none' },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },

  handleArea:  { alignItems: 'center', paddingVertical: spacing.md },
  handle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderDefault },

  sheetHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: screenPadding, paddingBottom: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.borderSubtle },
  sheetTitle:    { fontSize: typography.sizes.label, fontFamily: typography.fonts.bold, color: colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  expandBtn:     { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  expandBtnText: { fontSize: 12, color: colors.textSecondary },
  closeText:     { fontSize: 14, color: colors.textSecondary },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: screenPadding,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgBase,
    borderRadius: radius.input,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textPrimary, padding: 0 },
  searchClear: { fontSize: 12, color: colors.textMuted },

  listContent:      { paddingHorizontal: screenPadding, paddingBottom: 40 },
  groupHeader:      { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  groupHeaderText:  { fontSize: typography.sizes.stepLabel, fontFamily: typography.fonts.medium, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  placeItem:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.input, marginBottom: spacing.xs },
  placeItemSelected:     { backgroundColor: colors.brandDim },
  placeItemText:         { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textPrimary },
  placeItemTextSelected: { color: colors.brand, fontFamily: typography.fonts.medium },
  placeItemCheck:        { fontSize: 14, color: colors.brand, fontFamily: typography.fonts.bold },

  empty:     { alignItems: 'center', paddingTop: 40, gap: spacing.sm },
  emptyText: { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textMuted, textAlign: 'center' },
})