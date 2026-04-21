import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { config } from '@/constants/config'
import { api } from '@/services/api'
import {
  CreateTicketForm,
  CreateTicketPayload,
  IssueTypeWithScope,
} from '@/features/dashboard/types'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const submitCreateTicket = async (payload: CreateTicketPayload): Promise<void> => {
  if (config.USE_MOCK) {
    await delay(1000)
    // Mock success
    return
  }
  await api.post('/tickets', payload)
}

const TOTAL_STEPS = 2

export const useCreateTicket = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)

  const [form, setForm] = useState<CreateTicketForm>({
    selectedIssueType: null,
    placeId: null,
    shortDescription: '',
    description: '',
    attachmentUris: [],
  })

  // ─── Step navigation ───────────────────────────────────

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1)
  }

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
    else router.back()
  }

  // ─── Field setters ─────────────────────────────────────

  const selectIssueType = (issueType: IssueTypeWithScope) => {
    setForm((f) => ({ ...f, selectedIssueType: issueType }))
  }

  const setPlaceId = (placeId: number) => {
    setForm((f) => ({ ...f, placeId }))
  }

  const setShortDescription = (text: string) => {
    setForm((f) => ({ ...f, shortDescription: text }))
  }

  const setDescription = (text: string) => {
    setForm((f) => ({ ...f, description: text }))
  }

  const addAttachment = (uri: string) => {
    setForm((f) => ({
      ...f,
      attachmentUris: [...f.attachmentUris, uri],
    }))
  }

  const removeAttachment = (uri: string) => {
    setForm((f) => ({
      ...f,
      attachmentUris: f.attachmentUris.filter((u) => u !== uri),
    }))
  }

  // ─── Validation ────────────────────────────────────────

  const isStep1Valid = !!form.selectedIssueType

  const isStep2Valid =
    form.placeId !== null &&
    form.shortDescription.trim().length > 0 &&
    form.description.trim().length > 0

  const canProceed = currentStep === 1 ? isStep1Valid : isStep2Valid

  // ─── Submit ────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateTicketPayload = {
        issueTypeId: form.selectedIssueType!.id,
        placeId: form.placeId!,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        priority: form.selectedIssueType!.defaultPriority,
      }
      return submitCreateTicket(payload)
    },
    onSuccess: () => {
      setConfirmModalVisible(false)
      router.replace('/(dashboard)')
    },
  })

  const handleSubmitPress = () => setConfirmModalVisible(true)
  const handleConfirmSubmit = () => mutation.mutate()
  const handleCancelSubmit = () => setConfirmModalVisible(false)

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    form,
    canProceed,
    isStep1Valid,
    isStep2Valid,
    goNext,
    goPrev,
    selectIssueType,
    setPlaceId,
    setShortDescription,
    setDescription,
    addAttachment,
    removeAttachment,
    confirmModalVisible,
    handleSubmitPress,
    handleConfirmSubmit,
    handleCancelSubmit,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
  }
}
