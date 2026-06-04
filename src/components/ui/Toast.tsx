// src/components/ui/Toast.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Platform, StatusBar } from 'react-native'

type ToastType = 'error' | 'success' | 'warning'

interface Props {
  visible: boolean
  message: string
  type?: ToastType
  duration?: number
  onHide: () => void
}

const CONFIG: Record<ToastType, { bg: string; icon: string; color: string }> = {
  error:   { bg: '#FEF2F2', icon: 'close-circle',     color: '#EF4444' },
  success: { bg: '#F0FDF4', icon: 'checkmark-circle',  color: '#22C55E' },
  warning: { bg: '#FFFBEB', icon: 'warning',            color: '#F59E0B' },
}

export function Toast({ visible, message, type = 'error', duration = 3500, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true, bounciness: 4 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
      ]).start()

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
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
      <View style={[styles.toast, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
        <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        <Text style={[styles.message, { color: cfg.color }]}>{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' 
      ? (StatusBar.currentHeight ?? 24) + 8 
      : 52,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
})