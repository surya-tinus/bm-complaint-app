//app/_layout.tsx
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useNotificationSetup } from '@/features/notifications/hooks/useNotifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  useFonts,
  Rubik_300Light,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_700Bold,
  Rubik_900Black,
} from '@expo-google-fonts/rubik'
import * as SplashScreen from 'expo-splash-screen'
import { useAuthStore } from '@/store/auth.store'

SplashScreen.preventAutoHideAsync()

export const queryClient = new QueryClient()

function AppWithNotifications() {
  useNotificationSetup()
  const router = useRouter()
  const sessionExpired = useAuthStore((s) => s.sessionExpired)
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired)

  useEffect(() => {
    if (sessionExpired) {
      setSessionExpired(false)
      router.replace('/(auth)/login')
    }
  }, [sessionExpired])

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
    Rubik_900Black,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppWithNotifications />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}