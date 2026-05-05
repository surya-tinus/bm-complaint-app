//src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { login } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { LoginPayload } from '@/types/api.types'
import { router } from 'expo-router'

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: ({ user, tokens }) => {
      setAuth(user, tokens)
      router.replace('/(dashboard)')
    },
  })
}
