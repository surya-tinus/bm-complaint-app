// src/features/dashboard/hooks/useCreateTicket.ts
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { createTicket } from '@/services/ticket.service'
import { CreateTicketForm, IssueTypeWithScope } from '@/features/dashboard/types'

const TOTAL_STEPS = 2

export const useCreateTicket = () => {
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)

  const [form, setForm] = useState<CreateTicketForm>({
    selectedIssueType: null,
    placeId: null,
    shortDescription: '',
    description: '',
    attachmentUris: [],
  })

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1)
  }

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
    else router.back()
  }

  const selectIssueType = (issueType: IssueTypeWithScope) =>
    setForm((f) => ({ ...f, selectedIssueType: issueType }))

  const setPlaceId = (placeId: number) =>
    setForm((f) => ({ ...f, placeId }))

  const setShortDescription = (text: string) =>
    setForm((f) => ({ ...f, shortDescription: text }))

  const setDescription = (text: string) =>
    setForm((f) => ({ ...f, description: text }))

  const addAttachment = (uri: string) =>
    setForm((f) => ({ ...f, attachmentUris: [...f.attachmentUris, uri] }))

  const removeAttachment = (uri: string) =>
    setForm((f) => ({
      ...f,
      attachmentUris: f.attachmentUris.filter((u) => u !== uri),
    }))

  const isStep1Valid = !!form.selectedIssueType
  const isStep2Valid =
    form.placeId !== null &&
    form.shortDescription.trim().length > 0 &&
    form.description.trim().length > 0
  const canProceed = currentStep === 1 ? isStep1Valid : isStep2Valid

  const mutation = useMutation({
    mutationFn: () =>
      createTicket({
        issue_type_id: form.selectedIssueType!.id,
        place_id: form.placeId!,
        short_description: form.shortDescription.trim(),
        description: form.description.trim(),
        priority: form.selectedIssueType!.defaultPriority,
      }),
    onSuccess: () => {
      setConfirmModalVisible(false)
      // Invalidate list tiket supaya auto-refresh
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      router.replace('/(dashboard)')
    },
  })

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
    handleSubmitPress: () => setConfirmModalVisible(true),
    handleConfirmSubmit: mutation.mutate,
    handleCancelSubmit: () => setConfirmModalVisible(false),
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
  }
}
