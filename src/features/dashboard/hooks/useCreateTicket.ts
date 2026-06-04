// src/features/dashboard/hooks/useCreateTicket.ts
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { createTicket } from '@/services/ticket.service'
import { CreateTicketForm, IssueTypeWithScope, TicketCategory } from '@/features/dashboard/types'

// Update initial form state


const TOTAL_STEPS = 3

export const useCreateTicket = () => {
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)

  const [form, setForm] = useState<CreateTicketForm>({
  selectedCategory: null,   // ← tambah
  selectedIssueType: null,
  placeId: null,
  shortDescription: '',
  description: '',
  attachmentUris: [],
})

const selectCategory = (category: TicketCategory) =>
  setForm((f) => ({ ...f, selectedCategory: category, selectedIssueType: null }))

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

 const isStep1Valid = !!form.selectedCategory
const isStep2Valid = !!form.selectedIssueType
const isStep3Valid =
  form.placeId !== null &&
  form.shortDescription.trim().length > 0 &&
  form.description.trim().length > 0

const canProceed =
  currentStep === 1 ? isStep1Valid :
  currentStep === 2 ? isStep2Valid :
  isStep3Valid

  const mutation = useMutation({
    mutationFn: () =>
  createTicket({
    issue_type_id: form.selectedIssueType!.id,
    place_id: form.placeId!,
    short_description: form.shortDescription.trim(),
    description: form.description.trim(),
    priority: form.selectedIssueType!.defaultPriority,
    attachmentUris: form.attachmentUris,   // ← tambah
  }),
    onSuccess: () => {
    setConfirmModalVisible(false)
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    router.replace('/(dashboard)')
  },
  onError: (error: any) => {
    setConfirmModalVisible(false)  // tutup modal dulu
    console.log('create error:', error)
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
    selectCategory,
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
  isSubmitError: mutation.isError,
  resetSubmitError: mutation.reset,
  }
}
