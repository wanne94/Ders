import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/dashboardHelpers';

/**
 * BulkActionsModal Component
 * Confirmation modal for bulk approve/reject/delete actions
 */
const BulkActionsModal = ({
  visible = false,
  selectedCount = 0,
  action = null, // 'approve', 'reject', or 'delete'
  onClose,
  onConfirm
}) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = () => {
    if (onConfirm) {
      if (action === 'reject') {
        onConfirm(action, rejectionReason);
      } else {
        onConfirm(action);
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setRejectionReason('');
    if (onClose) onClose();
  };

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Odobri odabrane stavke',
          message: `Jeste li sigurni da želite odobriti ${selectedCount} odabranih stavki?`,
          icon: 'checkmark-circle',
          iconColor: COLORS.success,
          confirmText: 'Odobri',
          confirmColor: COLORS.success
        };
      case 'reject':
        return {
          title: 'Odbij odabrane stavke',
          message: `Jeste li sigurni da želite odbiti ${selectedCount} odabranih stavki?`,
          icon: 'close-circle',
          iconColor: COLORS.error,
          confirmText: 'Odbij',
          confirmColor: COLORS.error,
          showReasonInput: true
        };
      case 'delete':
        return {
          title: 'Obriši odabrane stavke',
          message: `Jeste li sigurni da želite obrisati ${selectedCount} odabranih stavki? Ova akcija se ne može poništiti.`,
          icon: 'trash',
          iconColor: COLORS.error,
          confirmText: 'Obriši',
          confirmColor: COLORS.error
        };
      default:
        return {
          title: 'Potvrda akcije',
          message: `Izvršiti akciju na ${selectedCount} stavki?`,
          icon: 'help-circle',
          iconColor: COLORS.gray,
          confirmText: 'Potvrdi',
          confirmColor: COLORS.primary
        };
    }
  };

  const config = getActionConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={config.icon} size={48} color={config.iconColor} />
            </View>

            <Text style={styles.modalTitle}>{config.title}</Text>
            <Text style={styles.modalMessage}>{config.message}</Text>

            {config.showReasonInput && (
              <View style={styles.reasonContainer}>
                <Text style={styles.label}>Razlog odbijanja (opcionalno):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Unesite razlog odbijanja..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Odustani</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: config.confirmColor }
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{config.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
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
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  reasonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
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

export default BulkActionsModal;
