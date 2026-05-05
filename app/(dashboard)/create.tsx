//app/(dashboard)/create.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useCreateTicket } from '@/features/dashboard/hooks/useCreateTicket'
import { IssueTypeWithScope, Place } from '@/features/dashboard/types'
import { MOCK_ISSUE_TYPES, MOCK_PLACES, MOCK_PLACES_BY_BUILDING } from '@/mocks/createTicket.mock'

export default function CreateTicketScreen() {
  const router = useRouter()
  const {
    currentStep,
    totalSteps,
    form,
    canProceed,
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
    isSubmitting,
  } = useCreateTicket()

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56C4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={goPrev}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Create Ticket</Text>
          <Text style={styles.headerSubtitle}>Check your ticket status here</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <Text style={styles.stepLabel}>STEP {currentStep} OF {totalSteps}</Text>
        <View style={styles.stepBarRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepBar,
                i < currentStep ? styles.stepBarActive : styles.stepBarInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepTitle}>
          {currentStep === 1 ? 'SELECT CATEGORY' : 'DESCRIBE YOUR PROBLEM'}
        </Text>
      </View>

      {/* Step Content */}
      <View style={styles.body}>
        {currentStep === 1 && (
          <Step1IssueType
            issueTypes={MOCK_ISSUE_TYPES}
            selected={form.selectedIssueType}
            onSelect={selectIssueType}
          />
        )}
        {currentStep === 2 && (
          <Step2Details
            places={MOCK_PLACES}
            placesByBuilding={MOCK_PLACES_BY_BUILDING}
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
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevBtn} onPress={goPrev}>
            <Text style={styles.prevBtnText}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={[
              styles.nextBtn,
              !canProceed && styles.btnDisabled,
              currentStep === 1 && styles.nextBtnFull,
            ]}
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

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        onCancel={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  )
}

// ─── Step 1: Select Issue Type ─────────────────────────────

function Step1IssueType({
  issueTypes,
  selected,
  onSelect,
}: {
  issueTypes: IssueTypeWithScope[]
  selected: IssueTypeWithScope | null
  onSelect: (type: IssueTypeWithScope) => void
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      {issueTypes.map((item) => {
        const isSelected = selected?.id === item.id
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.issueTypeCard, isSelected && styles.issueTypeCardSelected]}
            onPress={() => onSelect(item)}
            activeOpacity={0.85}
          >
            <View style={[styles.issueTypeIcon, isSelected && styles.issueTypeIconSelected]}>
              <Text style={styles.issueTypeIconText}>{item.icon}</Text>
            </View>
            <View style={styles.issueTypeInfo}>
              <Text style={[styles.issueTypeName, isSelected && styles.issueTypeNameSelected]}>
                {item.name}
              </Text>
              <Text style={[styles.issueTypeDesc, isSelected && styles.issueTypeDescSelected]}>
                {item.description}
              </Text>
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

// ─── Step 2: Details ───────────────────────────────────────

function Step2Details({
  places,
  placesByBuilding,
  selectedPlaceId,
  onSelectPlace,
  shortDescription,
  onChangeShortDescription,
  description,
  onChangeDescription,
  attachmentUris,
  onAddAttachment,
  onRemoveAttachment,
}: {
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
  const [placeDropdownOpen, setPlaceDropdownOpen] = useState(false)
  const selectedPlace = places.find((p) => p.id === selectedPlaceId)

  const MAX_ATTACHMENTS = 5

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      return status === 'granted'
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      return status === 'granted'
    }
  }

  const handlePickFromLibrary = async () => {
    if (attachmentUris.length >= MAX_ATTACHMENTS) {
      Alert.alert('Batas Foto', `Maksimal ${MAX_ATTACHMENTS} foto.`)
      return
    }

    const granted = await requestPermission('library')
    if (!granted) {
      Alert.alert('Izin Diperlukan', 'Berikan akses ke galeri foto di pengaturan perangkat.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_ATTACHMENTS - attachmentUris.length,
      quality: 0.8,
    })

    if (!result.canceled) {
      result.assets.forEach((asset) => onAddAttachment(asset.uri))
    }
  }

  const handleTakePhoto = async () => {
    if (attachmentUris.length >= MAX_ATTACHMENTS) {
      Alert.alert('Batas Foto', `Maksimal ${MAX_ATTACHMENTS} foto.`)
      return
    }

    const granted = await requestPermission('camera')
    if (!granted) {
      Alert.alert('Izin Diperlukan', 'Berikan akses ke kamera di pengaturan perangkat.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })

    if (!result.canceled) {
      onAddAttachment(result.assets[0].uri)
    }
  }

  const handleUploadPress = () => {
    Alert.alert(
      'Tambah Foto',
      'Pilih sumber foto',
      [
        { text: 'Kamera', onPress: handleTakePhoto },
        { text: 'Galeri', onPress: handlePickFromLibrary },
        { text: 'Batal', style: 'cancel' },
      ]
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.stepContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Location */}
      <Text style={styles.fieldLabel}>Location</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setPlaceDropdownOpen(!placeDropdownOpen)}
        activeOpacity={0.85}
      >
        <Text style={[styles.dropdownText, !selectedPlace && styles.dropdownPlaceholder]}>
          {selectedPlace
            ? `${selectedPlace.building} — ${selectedPlace.name}`
            : 'Select Building'}
        </Text>
        <Text style={styles.dropdownChevron}>{placeDropdownOpen ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      {placeDropdownOpen && (
        <View style={styles.dropdownList}>
          {Object.entries(placesByBuilding).map(([building, buildingPlaces]) => (
            <View key={building}>
              <Text style={styles.dropdownGroupLabel}>{building}</Text>
              {buildingPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={[
                    styles.dropdownItem,
                    selectedPlaceId === place.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onSelectPlace(place.id)
                    setPlaceDropdownOpen(false)
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedPlaceId === place.id && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {place.name}
                  </Text>
                  {selectedPlaceId === place.id && (
                    <Text style={styles.dropdownItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Additional Details */}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Additional Details</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. B513, restroom, outdoor area, etc."
        placeholderTextColor="#9CA3AF"
        value={shortDescription}
        onChangeText={onChangeShortDescription}
        maxLength={150}
      />
      <Text style={styles.charCount}>{shortDescription.length}/150</Text>

      {/* Problem Description */}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Problem Description</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        placeholder="e.g. AC is not working normally, etc."
        placeholderTextColor="#9CA3AF"
        value={description}
        onChangeText={onChangeDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={500}
      />
      <Text style={styles.charCount}>{description.length}/500</Text>

      {/* Attachments */}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
        Attachments{' '}
        <Text style={styles.attachmentCount}>
          ({attachmentUris.length}/{MAX_ATTACHMENTS})
        </Text>
      </Text>

      {/* Thumbnail preview */}
      {attachmentUris.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentRow}
        >
          {attachmentUris.map((uri) => (
            <View key={uri} style={styles.attachmentThumb}>
              <Image source={{ uri }} style={styles.attachmentImage} />
              <TouchableOpacity
                style={styles.attachmentRemove}
                onPress={() => onRemoveAttachment(uri)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={styles.attachmentRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Upload box — sembunyikan kalau sudah penuh */}
      {attachmentUris.length < MAX_ATTACHMENTS && (
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={handleUploadPress}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadIcon}>🖼</Text>
          <Text style={styles.uploadTitle}>Upload or take photos</Text>
          <Text style={styles.uploadSubtitle}>
            Supported formats: JPG, PNG, JPEG. Max 10 MB
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  )
}

// ─── Confirm Modal ─────────────────────────────────────────

function ConfirmModal({
  visible,
  onCancel,
  onConfirm,
  isLoading,
}: {
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalIconCircle}>
            <Text style={styles.modalIconText}>!</Text>
          </View>
          <Text style={styles.modalTitle}>Create Ticket?</Text>
          <Text style={styles.modalSubtitle}>
            Please make sure all of the information submitted are correct
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalConfirmText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A56C4' },

  header: {
    backgroundColor: '#1A56C4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
    gap: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '300', marginTop: -2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.2 },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 1 },

  stepIndicatorContainer: {
    backgroundColor: '#1A56C4',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', marginBottom: 8 },
  stepBarRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  stepBar: { flex: 1, height: 3, borderRadius: 2 },
  stepBarActive: { backgroundColor: '#fff' },
  stepBarInactive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  stepTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  body: { flex: 1, backgroundColor: '#F3F4F6' },
  stepContent: { padding: 16, paddingBottom: 32 },

  // Issue Type Cards
  issueTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  issueTypeCardSelected: { borderColor: '#1A56C4', backgroundColor: '#EFF6FF' },
  issueTypeIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  issueTypeIconSelected: { backgroundColor: '#DBEAFE' },
  issueTypeIconText: { fontSize: 22 },
  issueTypeInfo: { flex: 1 },
  issueTypeName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  issueTypeNameSelected: { color: '#1A56C4' },
  issueTypeDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  issueTypeDescSelected: { color: '#3B82F6' },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#1A56C4' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1A56C4' },

  // Fields
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },

  // Dropdown
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 14, color: '#111827', flex: 1, marginRight: 8 },
  dropdownPlaceholder: { color: '#9CA3AF' },
  dropdownChevron: { fontSize: 13, color: '#6B7280' },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownGroupLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownItemSelected: { backgroundColor: '#EFF6FF' },
  dropdownItemText: { fontSize: 14, color: '#374151' },
  dropdownItemTextSelected: { color: '#1A56C4', fontWeight: '600' },
  dropdownItemCheck: { color: '#1A56C4', fontWeight: '700' },

  // Attachments
  attachmentCount: { fontSize: 12, color: '#9CA3AF', fontWeight: '400' },
  attachmentRow: { marginBottom: 10 },
  attachmentThumb: { marginRight: 8, position: 'relative' },
  attachmentImage: { width: 80, height: 80, borderRadius: 10 },
  attachmentRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
  },
  attachmentRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  uploadBox: {
    borderWidth: 1.5, borderColor: '#D1D5DB', borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center', backgroundColor: '#fff',
  },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: '#1A56C4', marginBottom: 4 },
  uploadSubtitle: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: '#F3F4F6',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  prevBtn: {
    flex: 1, backgroundColor: '#E5E7EB',
    borderRadius: 28, paddingVertical: 14, alignItems: 'center',
  },
  prevBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  nextBtn: {
    flex: 1, backgroundColor: '#1A56C4',
    borderRadius: 28, paddingVertical: 14, alignItems: 'center',
  },
  nextBtnFull: { flex: 1 },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.4 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, alignItems: 'center', width: '100%',
  },
  modalIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalIconText: { fontSize: 26, fontWeight: '700', color: '#1A56C4' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  modalSubtitle: {
    fontSize: 13, color: '#6B7280', textAlign: 'center',
    marginBottom: 24, lineHeight: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  modalConfirmBtn: {
    flex: 1, backgroundColor: '#1A56C4',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})
