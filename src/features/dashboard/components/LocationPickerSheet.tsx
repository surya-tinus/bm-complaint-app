import React, { useState, useMemo, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  StyleSheet, Modal, Platform, Animated, PanResponder,
  Dimensions, KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Place } from '@/features/dashboard/types'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55
const FULL_HEIGHT = SCREEN_HEIGHT * 0.92

// Offset translateY saat collapsed — sheet terlihat 55% dari bawah
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

export function LocationPickerSheet({
  places,
  placesByBuilding,
  selectedPlaceId,
  onSelectPlace,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')

  // Sheet selalu FULL_HEIGHT — hanya translateY yang berubah
  const translateY = useRef(new Animated.Value(FULL_HEIGHT)).current
  const sheetState = useRef<'collapsed' | 'expanded'>('collapsed')

  const selectedPlace = places.find((p) => p.id === selectedPlaceId)

  const animateTo = (toValue: number, onDone?: () => void) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start(onDone)
  }

  const openSheet = () => {
    setOpen(true)
    setIsExpanded(false)
    sheetState.current = 'collapsed'
    translateY.setValue(FULL_HEIGHT)
    animateTo(COLLAPSED_OFFSET)
  }

  const closeSheet = () => {
    animateTo(FULL_HEIGHT, () => {
      setOpen(false)
      setIsExpanded(false)
      setQuery('')
      sheetState.current = 'collapsed'
    })
  }

  const expandSheet = () => {
    sheetState.current = 'expanded'
    setIsExpanded(true)
    animateTo(0)
  }

  const collapseSheet = () => {
    sheetState.current = 'collapsed'
    setIsExpanded(false)
    animateTo(COLLAPSED_OFFSET)
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
      onPanResponderMove: (_, { dy }) => {
        // Base position bergantung state saat ini
        const base = sheetState.current === 'expanded' ? 0 : COLLAPSED_OFFSET
        const next = base + dy
        // Clamp — tidak bisa lebih atas dari 0 atau lebih bawah dari FULL_HEIGHT
        translateY.setValue(Math.min(Math.max(next, 0), FULL_HEIGHT))
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const expanded = sheetState.current === 'expanded'

        if (vy > 0.5) {
          // Swipe cepat ke bawah
          if (expanded) collapseSheet()
          else closeSheet()
        } else if (vy < -0.5) {
          // Swipe cepat ke atas
          expandSheet()
        } else if (dy > SWIPE_DOWN_THRESHOLD) {
          if (expanded) collapseSheet()
          else closeSheet()
        } else if (dy < SWIPE_UP_THRESHOLD) {
          expandSheet()
        } else {
          // Snap balik ke posisi semula
          animateTo(expanded ? 0 : COLLAPSED_OFFSET)
        }
      },
    })
  ).current

  const handleSelect = (id: number) => {
    onSelectPlace(id)
    closeSheet()
    setQuery('')
  }

  const listData = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result: ListRow[] = []

    for (const [building, buildingPlaces] of Object.entries(placesByBuilding)) {
      const filtered = q
        ? buildingPlaces.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.building.toLowerCase().includes(q)
          )
        : buildingPlaces

      if (filtered.length === 0) continue
      result.push({ type: 'header', building, key: `header-${building}` })
      filtered.forEach((p) =>
        result.push({ type: 'item', place: p, key: `item-${p.id}` })
      )
    }
    return result
  }, [placesByBuilding, query])

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        style={[styles.trigger, selectedPlace && styles.triggerFilled]}
        onPress={openSheet}
        activeOpacity={0.8}
      >
        <Ionicons
          name="location-outline"
          size={18}
          color={selectedPlace ? '#1A56C4' : '#9CA3AF'}
        />
        <Text
          style={[styles.triggerText, !selectedPlace && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {selectedPlace
            ? `${selectedPlace.building} — ${selectedPlace.name}`
            : 'Pilih lokasi'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrapper}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              { height: FULL_HEIGHT },
              { transform: [{ translateY }] },
            ]}
          >
            {/* Handle — drag area untuk gesture */}
            {/* Handle + Header dijadikan satu drag zone */}
<View {...panResponder.panHandlers}>
  {/* Handle */}
  <View style={styles.handleArea}>
    <View style={styles.handle} />
  </View>

  {/* Header */}
  <View style={styles.sheetHeader}>
    <Text style={styles.sheetTitle}>Pilih Lokasi</Text>
    <View style={styles.headerActions}>
      <TouchableOpacity
  onPress={isExpanded ? collapseSheet : expandSheet}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  style={styles.expandBtn}
>
  <Ionicons
    name={isExpanded ? 'chevron-down' : 'chevron-up'}
    size={18}
    color="#6B7280"
  />
</TouchableOpacity>
<TouchableOpacity
  onPress={closeSheet}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
>
  <Ionicons name="close" size={22} color="#6B7280" />
</TouchableOpacity>
    </View>
  </View>
</View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari ruangan atau gedung..."
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
                      <Ionicons name="business-outline" size={13} color="#9CA3AF" />
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
                    {isSelected && <Ionicons name="checkmark" size={18} color="#1A56C4" />}
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={32} color="#D1D5DB" />
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
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  triggerFilled: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  triggerText: { flex: 1, fontSize: 14, color: '#111827' },
  triggerPlaceholder: { color: '#9CA3AF' },

  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },

  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  expandBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },

  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  groupHeaderText: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  placeItemSelected: { backgroundColor: '#EFF6FF' },
  placeItemText: { fontSize: 14, color: '#374151' },
  placeItemTextSelected: { color: '#1A56C4', fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
})