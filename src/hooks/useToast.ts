// src/hooks/useToast.ts
import { useState } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: 'error' | 'success' | 'warning'
  }>({ visible: false, message: '', type: 'error' })

  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ visible: true, message, type })
  }

  const hideToast = () => setToast((t) => ({ ...t, visible: false }))

  return { toast, showToast, hideToast }
}