import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTypeText } from '../utils/dashboardHelpers';

/**
 * EditModal Component
 * Simple modal that navigates to edit screen via AddContentPopup
 * This is a placeholder modal that shows item info and edit button
 */
const EditModal = ({
  visible = false,
  item = null,
  onClose,
  onNavigateToEdit
}) => {
  if (!item) return null;

  const itemName = item.title || item.name || 'Stavka';
  const itemType = item.itemType || item.type;
  const typeText = getTypeText(itemType);

  const handleEdit = () => {
    if (onNavigateToEdit) {
      onNavigateToEdit(item, itemType);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Uredi stavku</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemInfo}>
            <View style={styles.typeContainer}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.typeText}>{typeText}</Text>
            </View>

            <Text style={styles.itemName}>{itemName}</Text>

            <Text style={styles.infoText}>
              Kliknite na dugme ispod da otvorite formu za uređivanje.
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.editButton]}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
              <Text style={styles.editButtonText}>Otvori formu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  itemInfo: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EditModal;
