import React, { useRef, useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated,
} from 'react-native'
import { ThumbsUp, ThumbsDown } from 'phosphor-react-native'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'

type ThumbsProps = {
  thumbsReview: boolean | null
  canReview: boolean
  isSubmitting: boolean
  onSubmit: (thumbs: boolean) => void
}

// ─── Inline (in-scroll) version ───────────────────────────

export const ThumbsReview = ({ thumbsReview, canReview, isSubmitting, onSubmit }: ThumbsProps) => {
  if (canReview) {
    return (
      <View style={styles.card}>
        <Text style={styles.question}>Was your issue resolved?</Text>
        {isSubmitting ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.md }} />
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.thumbsUp]} onPress={() => onSubmit(true)}>
              <ThumbsUp size={20} color="#fff" weight="fill" />
              <Text style={styles.buttonLabel}>Yes, it was</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.thumbsDown]} onPress={() => onSubmit(false)}>
              <ThumbsDown size={20} color="#fff" weight="fill" />
              <Text style={styles.buttonLabel}>Not yet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  if (thumbsReview === true) {
    return (
      <View style={styles.card}>
        <View style={styles.resultRow}>
          <ThumbsUp size={18} color={colors.status.resolved.accent} weight="fill" />
          <Text style={[styles.resultText, { color: colors.status.resolved.accent }]}>
            You confirmed this issue has been resolved
          </Text>
        </View>
      </View>
    )
  }

  if (thumbsReview === false) {
    return (
      <View style={styles.card}>
        <View style={styles.resultRow}>
          <ThumbsDown size={18} color={colors.status.unresolved.accent} weight="fill" />
          <Text style={[styles.resultText, { color: colors.status.unresolved.accent }]}>
            Your feedback has been noted. Submit a new report if the issue persists.
          </Text>
        </View>
      </View>
    )
  }

  return null
}

// ─── Floating banner version ───────────────────────────────

type BannerProps = ThumbsProps & { bottomOffset: number }

export const ThumbsFloatingBanner = ({
  canReview, thumbsReview, isSubmitting, onSubmit, bottomOffset,
}: BannerProps) => {
  const translateY = useRef(new Animated.Value(80)).current
  const opacity = useRef(new Animated.Value(0)).current
  const [dismissed, setDismissed] = useState(false)

  const shouldShow = !dismissed && (canReview || thumbsReview !== null)

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [shouldShow])

  useEffect(() => {
    if (thumbsReview !== null && !canReview) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 80, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => setDismissed(true))
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [thumbsReview, canReview])

  if (!shouldShow) return null

  return (
    <Animated.View style={[bannerStyles.container, { bottom: bottomOffset, transform: [{ translateY }], opacity }]}>
      {canReview ? (
        <>
          <Text style={bannerStyles.question}>Was your issue resolved?</Text>
          <View style={bannerStyles.buttonRow}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.brand} />
            ) : (
              <>
                <TouchableOpacity style={[bannerStyles.btn, bannerStyles.btnYes]} onPress={() => onSubmit(true)} activeOpacity={0.85}>
                  <ThumbsUp size={16} color={colors.status.resolved.text} weight="regular" />
                  <Text style={bannerStyles.btnYesText}>Yes, it was</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[bannerStyles.btn, bannerStyles.btnNo]} onPress={() => onSubmit(false)} activeOpacity={0.85}>
                  <ThumbsDown size={16} color={colors.status.unresolved.text} weight="regular" />
                  <Text style={bannerStyles.btnNoText}>Not yet</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      ) : thumbsReview === true ? (
        <View style={bannerStyles.resultRow}>
          <ThumbsUp size={18} color={colors.status.resolved.accent} weight="fill" />
          <Text style={[bannerStyles.resultText, { color: colors.status.resolved.text }]}>
            Thank you for confirming — issue marked as resolved
          </Text>
        </View>
      ) : (
        <View style={bannerStyles.resultRow}>
          <ThumbsDown size={18} color={colors.status.unresolved.accent} weight="fill" />
          <Text style={[bannerStyles.resultText, { color: colors.status.unresolved.text }]}>
            Feedback noted. Please submit a new report if needed.
          </Text>
        </View>
      )}
    </Animated.View>
  )
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  card:        { backgroundColor: colors.bgCard, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.md },
  question:    { fontSize: 14, fontFamily: 'Rubik_500Medium', color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },
  buttonRow:   { flexDirection: 'row', gap: spacing.sm },
  button:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm + 2, borderRadius: 8, gap: spacing.xs },
  thumbsUp:    { backgroundColor: colors.status.resolved.accent },
  thumbsDown:  { backgroundColor: colors.status.unresolved.accent },
  buttonLabel: { color: '#fff', fontFamily: 'Rubik_500Medium', fontSize: 14 },
  resultRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultText:  { flex: 1, fontSize: 13, fontFamily: 'Rubik_400Regular', lineHeight: 18 },
})

const bannerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: screenPadding,
    right: screenPadding,
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  question:   { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  buttonRow:  { flexDirection: 'row', gap: spacing.sm, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  btn:        { flex: 1, height: 40, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.xs },
  btnYes:     { backgroundColor: colors.status.resolved.bg, borderWidth: 1, borderColor: colors.status.resolved.accent ?? colors.borderDefault },
  btnNo:      { backgroundColor: colors.status.unresolved.bg, borderWidth: 1, borderColor: colors.status.unresolved.accent ?? colors.borderDefault },
  btnYesText: { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.status.resolved.text },
  btnNoText:  { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.status.unresolved.text },
  resultRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultText: { flex: 1, fontSize: typography.sizes.label, fontFamily: typography.fonts.regular, lineHeight: 20 },
})