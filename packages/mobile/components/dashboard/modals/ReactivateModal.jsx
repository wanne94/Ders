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
 * ReactivateModal Component
 * Modal for reactivating a cancelled lecture with reason
 */
const ReactivateModal = ({
  visible = false,
  lecture = null,
  onClose,
  onConfirm
}) => {
  const [reactivateReason, setReactivateReason] = useState('');

  const handleConfirm = () => {
    if (onConfirm && reactivateReason.trim().length >= 5) {
      onConfirm(lecture, reactivateReason.trim());
    }
    handleClose();
  };

  const handleClose = () => {
    setReactivateReason('');
    if (onClose) onClose();
  };

  if (!lecture) return null;

  const isValidReason = reactivateReason.trim().length >= 5;
  const maxLength = 500;

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
            <Text style={styles.modalTitle}>Reaktiviraj predavanje</Text>

            <View style={styles.lectureInfoContainer}>
              <Text style={styles.lectureInfoLabel}>Predavanje za reaktivaciju:</Text>
              <Text style={styles.lectureInfoTitle}>{lecture.title}</Text>
              {lecture.date && (
                <Text style={styles.lectureInfoDetail}>
                  {formatDate(lecture.date)} u {lecture.time}
                </Text>
              )}
            </View>

            <Text style={styles.modalDescription}>
              Unesite razlog reaktiviranja predavanja (minimalno 5 karaktera):
            </Text>

            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Razlog reaktiviranja..."
              value={reactivateReason}
              onChangeText={setReactivateReason}
              multiline={true}
              numberOfLines={4}
              maxLength={maxLength}
              textAlignVertical="top"
            />

            <Text style={styles.characterCount}>
              {reactivateReason.length}/{maxLength} karaktera {!isValidReason && '(minimum 5)'}
            </Text>

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
                  styles.successButton,
                  !isValidReason && styles.disabledButton
                ]}
                onPress={handleConfirm}
                disabled={!isValidReason}
              >
                <Text style={styles.confirmButtonText}>Reaktiviraj predavanje</Text>
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
  modalDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
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
    marginBottom: 16,
    textAlign: 'right',
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
    backgroundColor: COLORS.success,
  },
  successButton: {
    backgroundColor: COLORS.success,
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

export default ReactivateModal;
