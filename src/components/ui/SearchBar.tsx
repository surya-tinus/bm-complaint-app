//src/components/ui/SearchBar.tsx
import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '@/constants'

interface Props {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder ?? 'Cari...'}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
    padding: 0,
  },
})