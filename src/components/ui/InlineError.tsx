// src/components/ui/InlineError.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '@/constants'

interface Props {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: 32,
  },
  message: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    borderColor: colors.brand,
    marginTop: spacing.xs,
  },
  retryText: {
    fontSize: typography.sizes.button,
    fontFamily: typography.fonts.medium,
    color: colors.brand,
  },
})