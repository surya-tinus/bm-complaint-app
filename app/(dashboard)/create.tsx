import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  SafeAreaView, StatusBar, Modal, ActivityIndicator, Image, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useCreateTicket } from '@/features/dashboard/hooks/useCreateTicket'
import { IssueTypeWithScope, Place } from '@/features/dashboard/types'
import { useMemo, useEffect } from 'react'
import { CATEGORIES, usePlaces, useIssueTypesByCategory } from '@/features/dashboard/hooks/useCreateTicketData'
import { TicketCategory } from '@/features/dashboard/types'
import { LocationPickerSheet } from '@/features/dashboard/components/LocationPickerSheet'
import { Toast } from '@/components/ui/Toast'
import { InlineError } from '@/components/ui/InlineError'
import { useToast } from '@/hooks/useToast'
import { colors, spacing, typography, radius, screenPadding, CATEGORY_TO_TYPE } from '@/constants'
import { Ionicons } from '@expo/vector-icons'
import { TicketTypeIcon } from '@/components/ui/TicketTypeIcon'
import { resolveCategoryKey } from '@/utils/resolveCategoryKey'

export default function CreateTicketScreen() {
  const { data: placesList = [], isLoading: placesLoading, isError: placesError, refetch: refetchPlaces } = usePlaces()
  const { data: issueTypesByCategory = {}, isLoading: typesLoading, isError: typesError, refetch: refetchTypes } = useIssueTypesByCategory()
  const { toast, showToast, hideToast } = useToast()

  const placesByBuilding = useMemo(
    () => placesList.reduce<Record<string, Place[]>>((acc, place) => {
      if (!acc[place.building]) acc[place.building] = []
      acc[place.building].push(place)
      return acc
    }, {}),
    [placesList]
  )

  const {
    currentStep, totalSteps, form, canProceed,
    goNext, goPrev, selectIssueType, selectCategory,
    setPlaceId, setShortDescription, setDescription,
    addAttachment, removeAttachment,
    confirmModalVisible, handleSubmitPress, handleConfirmSubmit, handleCancelSubmit,
    isSubmitting, isSubmitError, submitError, resetSubmitError,
  } = useCreateTicket()

  useEffect(() => {
    if (isSubmitError) {
      const msg = (submitError as any)?.response?.data?.message ?? 'Failed to create ticket. Please try again.'
      showToast(msg, 'error')
      resetSubmitError()
    }
  }, [isSubmitError])

  const STEP_TITLES = ['SELECT CATEGORY', 'SELECT TYPE', 'PROBLEM DESCRIPTION']
  const isFetchError = placesError || typesError

  if (placesLoading || typesLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.textOnBrand} size="large" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand} />

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Create Report</Text>
          <Text style={styles.headerSubtitle}>Report an issue in your area</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepLabel}>STEP {currentStep} OF {totalSteps}</Text>
        <View style={styles.stepBarRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.stepBar, i < currentStep ? styles.stepBarActive : styles.stepBarInactive]} />
          ))}
        </View>
        <Text style={styles.stepTitle}>{STEP_TITLES[currentStep - 1]}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isFetchError ? (
          <InlineError
            message="Failed to load data. Check your internet connection."
            onRetry={() => { if (placesError) refetchPlaces(); if (typesError) refetchTypes() }}
          />
        ) : (
          <>
            {currentStep === 1 && (
              <Step1Category
                categories={CATEGORIES}
                selectedCategory={form.selectedCategory}
                onSelectCategory={selectCategory}
              />
            )}
            {currentStep === 2 && (
              
              <Step2IssueType
                issueTypes={issueTypesByCategory[form.selectedCategory?.name ?? ''] ?? []}
                selectedIssueType={form.selectedIssueType}
                onSelectIssueType={selectIssueType}
              />
              
            )}
            {currentStep === 3 && (
              <Step3Details
                places={placesList}
                placesByBuilding={placesByBuilding}
                selectedPlaceId={form.placeId}
                onSelectPlace={setPlaceId}
                shortDescription={form.shortDescription}
                onChangeShortDescription={setShortDescription}
                description={form.description}
                onChangeDescription={setDescription}
                attachmentUris={form.attachmentUris}
                onAddAttachment={addAttachment}
                onRemoveAttachment={removeAttachment}
              />
            )}
          </>
        )}
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevBtn} onPress={goPrev}>
            <Text style={styles.prevBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.btnDisabled, currentStep === 1 && styles.nextBtnFull]}
            onPress={goNext}
            disabled={!canProceed}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.btnDisabled]}
            onPress={handleSubmitPress}
            disabled={!canProceed}
          >
            <Text style={styles.nextBtnText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmModal
        visible={confirmModalVisible}
        onCancel={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  )
}

// ─── Step 1: Category ──────────────────────────────────────

function Step1Category({ categories, selectedCategory, onSelectCategory }: {
  categories: TicketCategory[]
  selectedCategory: TicketCategory | null
  onSelectCategory: (cat: TicketCategory) => void
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Report Category</Text>
      {categories.map((cat) => {
        const isSelected = selectedCategory?.id === cat.id
        const categoryKey = resolveCategoryKey(cat.name)
        const ticketType  = CATEGORY_TO_TYPE[categoryKey]
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.selectionCard, isSelected && styles.selectionCardSelected]}
            onPress={() => onSelectCategory(cat)}
            activeOpacity={0.85}
          >
            <View style={[styles.selectionIconCircle, isSelected && styles.selectionIconCircleSelected]}>
              <TicketTypeIcon type={ticketType} category={categoryKey} variant="plain" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.selectionInfo}>
              <Text style={[styles.selectionName, isSelected && styles.selectionNameSelected]}>{cat.name}</Text>
              <Text style={[styles.selectionDesc, isSelected && styles.selectionDescSelected]}>{cat.description}</Text>
            </View>
            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

// ─── Step 2: Issue Type ────────────────────────────────────

function Step2IssueType({ issueTypes, selectedIssueType, onSelectIssueType }: {
  issueTypes: IssueTypeWithScope[]
  selectedIssueType: IssueTypeWithScope | null
  onSelectIssueType: (type: IssueTypeWithScope) => void
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Issue Type</Text>
      {issueTypes.map((item) => {
        const isSelected  = selectedIssueType?.id === item.id
        const categoryKey = resolveCategoryKey(item.name)
        const ticketType  = CATEGORY_TO_TYPE[categoryKey]
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.selectionCard, isSelected && styles.selectionCardSelected]}
            onPress={() => onSelectIssueType(item)}
            activeOpacity={0.85}
          >
            <View style={[styles.selectionIconCircle, isSelected && styles.selectionIconCircleSelected]}>
              <TicketTypeIcon type={ticketType} category={categoryKey} variant="plain" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.selectionInfo}>
              <Text style={[styles.selectionName, isSelected && styles.selectionNameSelected]}>{item.name}</Text>
              <Text style={[styles.selectionDesc, isSelected && styles.selectionDescSelected]}>{item.description}</Text>
            </View>
            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

// ─── Step 3: Details ───────────────────────────────────────

function Step3Details({ places, placesByBuilding, selectedPlaceId, onSelectPlace, shortDescription, onChangeShortDescription, description, onChangeDescription, attachmentUris, onAddAttachment, onRemoveAttachment }: {
  places: Place[]
  placesByBuilding: Record<string, Place[]>
  selectedPlaceId: number | null
  onSelectPlace: (id: number) => void
  shortDescription: string
  onChangeShortDescription: (text: string) => void
  description: string
  onChangeDescription: (text: string) => void
  attachmentUris: string[]
  onAddAttachment: (uri: string) => void
  onRemoveAttachment: (uri: string) => void
}) {
  const MAX_ATTACHMENTS = 5

  const requestPermission = async (type: 'camera' | 'library') => {
    const { status } = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
    return status === 'granted'
  }

  const handlePickFromLibrary = async () => {
    if (attachmentUris.length >= MAX_ATTACHMENTS) { Alert.alert('Photo Limit', `Maximum ${MAX_ATTACHMENTS} photos.`); return }
    if (!await requestPermission('library')) { Alert.alert('Permission Required', 'Please grant access to your photo library in device settings.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: MAX_ATTACHMENTS - attachmentUris.length, quality: 0.8 })
    if (!result.canceled) result.assets.forEach((a) => onAddAttachment(a.uri))
  }

  const handleTakePhoto = async () => {
    if (attachmentUris.length >= MAX_ATTACHMENTS) { Alert.alert('Photo Limit', `Maximum ${MAX_ATTACHMENTS} photos.`); return }
    if (!await requestPermission('camera')) { Alert.alert('Permission Required', 'Please grant camera access in device settings.'); return }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
    if (!result.canceled) onAddAttachment(result.assets[0].uri)
  }

  const handleUploadPress = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Gallery', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.fieldLabel}>Location</Text>
      <LocationPickerSheet
        places={places}
        placesByBuilding={placesByBuilding}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={onSelectPlace}
      />

      <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Additional Detail</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. B513, 3rd floor restroom, outdoor area"
        placeholderTextColor={colors.textMuted}
        value={shortDescription}
        onChangeText={onChangeShortDescription}
        maxLength={150}
      />
      <Text style={styles.charCount}>{shortDescription.length}/150</Text>

      <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Problem Description</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        placeholder="e.g. AC hasn't been cooling since Monday morning"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={onChangeDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={500}
      />
      <Text style={styles.charCount}>{description.length}/500</Text>

      <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>
        Attachments <Text style={styles.attachmentCount}>({attachmentUris.length}/{MAX_ATTACHMENTS})</Text>
      </Text>

      {attachmentUris.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentRow} contentContainerStyle={{ alignItems: 'center' }}>
          {attachmentUris.map((uri) => (
            <View key={uri} style={styles.attachmentThumb}>
              <Image source={{ uri }} style={styles.attachmentImage} />
              <TouchableOpacity style={styles.attachmentRemove} onPress={() => onRemoveAttachment(uri)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                <Text style={styles.attachmentRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {attachmentUris.length < MAX_ATTACHMENTS && (
            <TouchableOpacity style={styles.attachmentAddBtn} onPress={handleUploadPress} activeOpacity={0.7}>
              <Text style={styles.attachmentAddIcon}>+</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <TouchableOpacity style={styles.uploadBox} onPress={handleUploadPress} activeOpacity={0.8}>
          <Text style={styles.uploadTitle}>Upload or take a photo</Text>
          <Text style={styles.uploadSubtitle}>Format: JPG, PNG, JPEG · Max. 10 MB</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  )
}

// ─── Confirm Modal ─────────────────────────────────────────

function ConfirmModal({ visible, onCancel, onConfirm, isLoading }: {
  visible: boolean; onCancel: () => void; onConfirm: () => void; isLoading: boolean
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Submit this report?</Text>
          <Text style={styles.modalSubtitle}>Make sure all the information you entered is correct.</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel} disabled={isLoading}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={onConfirm} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={colors.textOnBrand} size="small" /> : <Text style={styles.modalConfirmText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: colors.brand },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: 'rgba(255,255,255,0.8)', fontSize: typography.sizes.body, fontFamily: typography.fonts.regular },

  header:         { backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', paddingHorizontal: screenPadding, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: 14 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backBtnText:    { color: colors.textOnBrand, fontSize: 18, lineHeight: 22 },
  headerTitle:    { color: colors.textOnBrand, fontSize: typography.sizes.appBarTitle, fontFamily: typography.fonts.bold },
  headerSubtitle: { color: 'rgba(255,255,255,0.55)', fontSize: typography.sizes.appBarSubtitle, fontFamily: typography.fonts.regular, marginTop: 2 },

  stepIndicator: { backgroundColor: colors.brand, paddingHorizontal: screenPadding, paddingBottom: spacing.lg },
  stepLabel:     { color: 'rgba(255,255,255,0.6)', fontSize: typography.sizes.stepLabel, fontFamily: typography.fonts.medium, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  stepBarRow:    { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  stepBar:       { flex: 1, height: 3, borderRadius: 2 },
  stepBarActive: { backgroundColor: colors.textOnBrand },
  stepBarInactive:{ backgroundColor: 'rgba(255,255,255,0.25)' },
  stepTitle:     { color: colors.textOnBrand, fontSize: typography.sizes.sectionHeader, fontFamily: typography.fonts.bold, letterSpacing: 0.5 },

  body:        { flex: 1, backgroundColor: colors.bgBase },
  stepContent: { padding: screenPadding, paddingBottom: 32 },

  sectionLabel: {
    fontSize: typography.sizes.stepLabel,
    fontFamily: typography.fonts.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  // Selection Cards (Step 1 & 2)
  selectionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectionCardSelected:       { borderColor: colors.brand, backgroundColor: colors.brandDim },
  selectionIconCircle:         { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  selectionIconCircleSelected: { backgroundColor: colors.brandSubtle },
  selectionInfo:               { flex: 1 },
  selectionName:               { fontSize: typography.sizes.cardTitle, fontFamily: typography.fonts.bold, color: colors.textPrimary, marginBottom: 2 },
  selectionNameSelected:       { color: colors.brand },
  selectionDesc:               { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textSecondary, lineHeight: 18 },
  selectionDescSelected:       { color: colors.brandText },
  radioOuter:         { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderDefault, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: colors.brand },
  radioInner:         { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },

  // Fields
  fieldLabel: { fontSize: typography.sizes.label, fontFamily: typography.fonts.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  textInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
  },
  textArea:   { minHeight: 100, paddingTop: spacing.md },
  charCount:  { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },

  // Attachments
  attachmentCount:    { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted },
  attachmentRow:      { marginBottom: spacing.sm },
  attachmentThumb:    { marginRight: spacing.sm, position: 'relative' },
  attachmentImage:    { width: 80, height: 80, borderRadius: radius.card },
  attachmentRemove:   { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  attachmentRemoveText: { color: '#fff', fontSize: 10, fontFamily: typography.fonts.bold },
  attachmentAddBtn:   { width: 80, height: 80, borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.brand, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandDim },
  attachmentAddIcon:  { fontSize: 24, color: colors.brand, lineHeight: 28 },
  uploadBox:          { borderWidth: 1.5, borderColor: colors.borderStrong, borderStyle: 'dashed', borderRadius: radius.card, padding: spacing.xl, alignItems: 'center', backgroundColor: colors.bgCard },
  uploadTitle:        { fontSize: typography.sizes.label, fontFamily: typography.fonts.medium, color: colors.brand, marginBottom: spacing.xs },
  uploadSubtitle:     { fontSize: typography.sizes.microcopy, fontFamily: typography.fonts.regular, color: colors.textMuted, textAlign: 'center' },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bgBase,
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderDefault,
  },
  prevBtn:     { flex: 1, backgroundColor: colors.borderDefault, borderRadius: radius.button, paddingVertical: 14, alignItems: 'center' },
  prevBtnText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  nextBtn:     { flex: 1, backgroundColor: colors.brand, borderRadius: radius.button, paddingVertical: 14, alignItems: 'center' },
  nextBtnFull: { flex: 1 },
  nextBtnText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textOnBrand },
  btnDisabled: { opacity: 0.4 },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: colors.bgOverlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalCard:       { backgroundColor: colors.bgCard, borderRadius: radius.modal, padding: spacing.xl, width: '100%' },
  modalTitle:      { fontSize: 18, fontFamily: typography.fonts.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  modalSubtitle:   { fontSize: typography.sizes.body, fontFamily: typography.fonts.regular, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  modalButtons:    { flexDirection: 'row', gap: spacing.md },
  modalCancelBtn:  { flex: 1, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.button, paddingVertical: 13, alignItems: 'center' },
  modalCancelText: { fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textPrimary },
  modalConfirmBtn: { flex: 1, backgroundColor: colors.brand, borderRadius: radius.button, paddingVertical: 13, alignItems: 'center' },
  modalConfirmText:{ fontSize: typography.sizes.button, fontFamily: typography.fonts.medium, color: colors.textOnBrand },
})