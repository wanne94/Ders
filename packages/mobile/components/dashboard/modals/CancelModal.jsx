import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { COLORS, formatDate } from '../utils/dashboardHelpers';

/**
 * CancelModal Component
 * Modal for cancelling a lecture with reason
 */
const CancelModal = ({
  visible = false,
  lecture = null,
  onClose,
  onConfirm
}) => {
  const [cancelReason, setCancelReason] = useState('');

  const handleConfirm = () => {
    if (onConfirm && cancelReason.trim().length >= 10) {
      onConfirm(lecture, cancelReason.trim());
    }
    handleClose();
  };

  const handleClose = () => {
    setCancelReason('');
    if (onClose) onClose();
  };

  if (!lecture) return null;

  const isValidReason = cancelReason.trim().length >= 10;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Otkaži predavanje</Text>

            <View style={styles.lectureInfoContainer}>
              <Text style={styles.lectureInfoLabel}>Predavanje za otkazivanje:</Text>
              <Text style={styles.lectureInfoTitle}>{lecture.title}</Text>
              {lecture.date && (
                <Text style={styles.lectureInfoDetail}>
                  {formatDate(lecture.date)} u {lecture.time}
                </Text>
              )}
              {lecture.organization && (
                <Text style={styles.lectureInfoDetail}>
                  {lecture.organization}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Razlog otkazivanja *:</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={4}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Unesite razlog zašto otkazujete ovo predavanje... (minimum 10 karaktera)"
                placeholderTextColor={COLORS.gray}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {cancelReason.length} karaktera {!isValidReason && '(minimum 10)'}
              </Text>
            </View>

            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Pažnja: Ova akcija će trajno otkazati predavanje. Korisnici neće moći da se prijave za ovo predavanje.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Odustani</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  styles.dangerButton,
                  !isValidReason && styles.disabledButton
                ]}
                onPress={handleConfirm}
                disabled={!isValidReason}
              >
                <Text style={styles.confirmButtonText}>Otkaži predavanje</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  lectureInfoContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  lectureInfoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  lectureInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  lectureInfoDetail: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'right',
  },
  warningContainer: {
    backgroundColor: COLORS.warning + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CancelModal;
