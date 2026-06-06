// src/components/ui/Toast.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View, Platform, StatusBar } from 'react-native'
import { colors, spacing, typography, radius } from '@/constants'

type ToastType = 'error' | 'success' | 'warning'

interface Props {
  visible: boolean
  message: string
  type?: ToastType
  duration?: number
  onHide: () => void
}

const CONFIG: Record<ToastType, { bg: string; border: string; text: string }> = {
  error:   { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
}

export function Toast({ visible, message, type = 'error', duration = 3500, onHide }: Props) {
  const opacity     = useRef(new Animated.Value(0)).current
  const translateY  = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity,    { toValue: 1, useNativeDriver: true, bounciness: 4 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
      ]).start()

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
        ]).start(() => onHide())
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  const cfg = CONFIG[type]

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <Text style={[styles.message, { color: cfg.text }]}>{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 52,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
  },
  toast: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.medium,
    lineHeight: 20,
  },
})