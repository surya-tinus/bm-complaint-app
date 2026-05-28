// app/_layout.tsx
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useNotificationSetup } from '@/features/notifications/hooks/useNotifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export const queryClient = new QueryClient()

function AppWithNotifications() {
  useNotificationSetup()

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
      <AppWithNotifications />
    </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
