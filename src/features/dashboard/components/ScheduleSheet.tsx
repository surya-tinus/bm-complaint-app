// src/features/dashboard/components/ScheduleSheet.tsx
import React, { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Modal, Platform, Animated, PanResponder, Dimensions,
  ActivityIndicator, ScrollView,
} from 'react-native'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SCREEN_HEIGHT = Dimensions.get('window').height
const FULL_HEIGHT   = SCREEN_HEIGHT * 0.92   // expanded
const SHEET_HEIGHT  = SCREEN_HEIGHT * 0.72   // collapsed
const COLLAPSED_OFFSET = FULL_HEIGHT - SHEET_HEIGHT  // translateY when collapsed
const DRAG_THRESHOLD   = 80
const SWIPE_UP_THRESHOLD = -50

interface SchedulePayload {
  scheduled_date: string
  scheduled_start?: string
  scheduled_end?: string
  notes?: string
}

interface Props {
  visible: boolean
  onClose: () => void
  onConfirm: (payload: SchedulePayload) => void
  isLoading?: boolean
}

// ─── Validation helpers ───────────────────────────────────

function isValidDate(val: string): boolean {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(val)) return false
  const [dd, mm, yyyy] = val.split('-').map(Number)
  if (mm < 1 || mm > 12) return false
  const d = new Date(yyyy, mm - 1, dd)
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
}

function isValidTime(val: string): boolean {
  if (val === '') return true
  if (!/^\d{2}:\d{2}$/.test(val)) return false
  const [h, m] = val.split(':').map(Number)
  return h >= 0 && h <= 23 && m >= 0 && m <= 59
}

function formatDateInput(raw: string): string {
  // Auto-insert dashes: 19062026 → 19-06-2026
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

// ─── Component ────────────────────────────────────────────

export function ScheduleSheet({ visible, onClose, onConfirm, isLoading = false }: Props) {
  const insets = useSafeAreaInsets()

  const [date, setDate]           = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')
  const [notes, setNotes]         = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const translateY  = useRef(new Animated.Value(FULL_HEIGHT)).current
  const sheetState  = useRef<'collapsed' | 'expanded'>('collapsed')

  const animateTo = (toValue: number, onDone?: () => void) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      bounciness: 3,
      speed: 14,
    }).start(onDone)
  }

  // Animate in on open
  React.useEffect(() => {
    if (visible) {
      setIsExpanded(false)
      sheetState.current = 'collapsed'
      translateY.setValue(FULL_HEIGHT)
      animateTo(COLLAPSED_OFFSET)
    }
  }, [visible])

  const closeSheet = () => {
    animateTo(FULL_HEIGHT, () => {
      onClose()
      setDate('')
      setStartTime('')
      setEndTime('')
      setNotes('')
      setIsExpanded(false)
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

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
    onPanResponderMove: (_, { dy }) => {
      const base = sheetState.current === 'expanded' ? 0 : COLLAPSED_OFFSET
      translateY.setValue(Math.min(Math.max(base + dy, 0), FULL_HEIGHT))
    },
    onPanResponderRelease: (_, { dy, vy }) => {
      const expanded = sheetState.current === 'expanded'
      if (vy > 0.5)                       { expanded ? collapseSheet() : closeSheet() }
      else if (vy < -0.5)                 { expandSheet() }
      else if (dy > DRAG_THRESHOLD)       { expanded ? collapseSheet() : closeSheet() }
      else if (dy < SWIPE_UP_THRESHOLD)   { expandSheet() }
      else                                { animateTo(expanded ? 0 : COLLAPSED_OFFSET) }
    },
  })).current

  // ─── Validation ──────────────────────────────────────
  const dateValid  = isValidDate(date)
  const startValid = isValidTime(startTime)
  const endValid   = isValidTime(endTime)
  const canSubmit  = dateValid && startValid && endValid && !isLoading

  const dateError  = date.length > 0 && !dateValid
    ? 'Format: DD-MM-YYYY (e.g. 20-06-2026)' : null
  const startError = startTime.length > 0 && !startValid
    ? 'Format: HH:MM (e.g. 09:00)' : null
  const endError   = endTime.length > 0 && !endValid
    ? 'Format: HH:MM (e.g. 17:00)' : null

  const handleConfirm = () => {
    if (!canSubmit) return
    const [dd, mm, yyyy] = date.split('-')
    const payload: SchedulePayload = { scheduled_date: `${yyyy}-${mm}-${dd}` }
    if (startTime) payload.scheduled_start = startTime
    if (endTime)   payload.scheduled_end   = endTime
    if (notes.trim()) payload.notes        = notes.trim()
    onConfirm(payload)
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeSheet}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />

      <View style={styles.kavWrapper} pointerEvents="box-none">
        <Animated.View
          style={[styles.sheet, { height: FULL_HEIGHT, transform: [{ translateY }] }]}
        >
          {/* ── Handle + Header — drag zone ── */}
          <View {...panResponder.panHandlers}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Set Schedule</Text>
                <Text style={styles.sheetSubtitle}>Request ticket · Admin only</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={isExpanded ? collapseSheet : expandSheet}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.expandBtn}
                >
                  <Text style={styles.expandBtnText}>{isExpanded ? '▾' : '▴'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeSheet}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Form ── */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={[
              styles.formContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Date — required */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              </View>
              <TextInput
                style={[
                  styles.input,
                  dateError ? styles.inputError
                    : dateValid && date.length > 0 ? styles.inputValid : null,
                ]}
                placeholder="DD-MM-YYYY"
                placeholderTextColor={colors.textMuted}
                value={date}
                onChangeText={(t) => setDate(formatDateInput(t))}
                onFocus={expandSheet}
                keyboardType="numeric"
                maxLength={10}
                autoCorrect={false}
              />
              {dateError && <Text style={styles.errorText}>{dateError}</Text>}
              {dateValid && date.length > 0 && (
                <Text style={styles.successText}>
                  {(() => {
                    const [dd, mm, yyyy] = date.split('-').map(Number)
                    return new Date(yyyy, mm - 1, dd).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })
                  })()}
                </Text>
              )}
            </View>

            {/* Time row */}
            <View style={styles.timeRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Start Time</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    startError ? styles.inputError
                      : startValid && startTime.length > 0 ? styles.inputValid : null,
                  ]}
                  placeholder="09:00"
                  placeholderTextColor={colors.textMuted}
                  value={startTime}
                  onChangeText={(t) => setStartTime(formatTimeInput(t))}
                  onFocus={expandSheet}
                  keyboardType="numeric"
                  maxLength={5}
                  autoCorrect={false}
                />
                {startError && <Text style={styles.errorText}>{startError}</Text>}
              </View>

              <View style={styles.timeSep}>
                <Text style={styles.timeSepText}>→</Text>
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>End Time</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    endError ? styles.inputError
                      : endValid && endTime.length > 0 ? styles.inputValid : null,
                  ]}
                  placeholder="17:00"
                  placeholderTextColor={colors.textMuted}
                  value={endTime}
                  onChangeText={(t) => setEndTime(formatTimeInput(t))}
                  onFocus={expandSheet}
                  keyboardType="numeric"
                  maxLength={5}
                  autoCorrect={false}
                />
                {endError && <Text style={styles.errorText}>{endError}</Text>}
              </View>
            </View>

            {/* Notes — optional */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <Text style={styles.optionalText}>Optional</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g. Koordinasi dengan user sebelum datang"
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                onFocus={expandSheet}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btnSubmit, !canSubmit && styles.btnSubmitDisabled]}
              onPress={handleConfirm}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={colors.textOnBrand} size="small" />
                : <Text style={styles.btnSubmitText}>Confirm Schedule</Text>
              }
            </TouchableOpacity>

            {!dateValid && date.length === 0 && (
              <Text style={styles.hintText}>Fill in the date to enable scheduling.</Text>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 20,
  },

  handleArea: { alignItems: 'center', paddingVertical: spacing.md },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderDefault },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  sheetTitle:    { fontSize: typography.sizes.label, fontFamily: typography.fonts.bold, color: colors.textPrimary },
  sheetSubtitle: { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted, marginTop: 2 },

  headerActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  expandBtn:     { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  expandBtnText: { fontSize: 12, color: colors.textSecondary },
  closeText:     { fontSize: 14, color: colors.textSecondary, marginTop: 2 },

  formScroll:   { flex: 1 },
  formContent:  { paddingHorizontal: screenPadding, paddingTop: spacing.lg, gap: spacing.lg },

  fieldGroup:    { gap: spacing.xs },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  fieldLabel:    { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.textPrimary },

  requiredBadge: { backgroundColor: colors.brandDim, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.badge },
  requiredText:  { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.medium, color: colors.brandText },
  optionalText:  { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted },

  input: {
    backgroundColor: colors.bgBase,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
  },
  inputMultiline: { minHeight: 80, paddingTop: 12 },
  inputError:     { borderColor: '#DC2626' },
  inputValid:     { borderColor: '#10B981' },

  errorText:   { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: '#DC2626', marginTop: 2 },
  successText: { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: '#10B981', marginTop: 2 },

  timeRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  timeSep:  { paddingTop: 38, alignItems: 'center' },
  timeSepText: { fontSize: 14, color: colors.textMuted },

  btnSubmit: {
    height: 48,
    backgroundColor: colors.brand,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  btnSubmitDisabled: { backgroundColor: colors.borderDefault },
  btnSubmitText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.textOnBrand,
  },
  hintText: {
    fontSize: typography.sizes.microcopy,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
})