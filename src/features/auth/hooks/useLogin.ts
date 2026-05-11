// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { login } from '@/services/auth.service'
import { LoginPayload } from '@/types/api.types'
import { router } from 'expo-router'

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      // auth sudah di-set di dalam login() — tinggal navigate
      router.replace('/(dashboard)')
    },
  })
}