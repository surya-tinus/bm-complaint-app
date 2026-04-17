import React from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.menuIcon}>☰</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder ?? 'Search...'}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity>
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    padding: 0,
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
})