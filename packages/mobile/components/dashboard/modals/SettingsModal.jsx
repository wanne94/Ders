import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch
} from 'react-native';
import { COLORS } from '../utils/dashboardHelpers';

/**
 * SettingsModal Component
 * Modal for configuring approval requirements for different content types
 */
const SettingsModal = ({
  visible = false,
  settings = {},
  onClose,
  onSave,
  onSettingChange
}) => {
  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Postavke odobrenja</Text>

          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dersovi</Text>
              <Switch
                value={settings.lecture || false}
                onValueChange={(value) => {
                  if (onSettingChange) {
                    onSettingChange('lecture', value);
                  }
                }}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={settings.lecture ? COLORS.primary : COLORS.gray}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Daije</Text>
              <Switch
                value={settings.daija || false}
                onValueChange={(value) => {
                  if (onSettingChange) {
                    onSettingChange('daija', value);
                  }
                }}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={settings.daija ? COLORS.primary : COLORS.gray}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Udruženja</Text>
              <Switch
                value={settings.organization || false}
                onValueChange={(value) => {
                  if (onSettingChange) {
                    onSettingChange('organization', value);
                  }
                }}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={settings.organization ? COLORS.primary : COLORS.gray}
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Otkaži</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSave}
            >
              <Text style={styles.confirmButtonText}>Spremi</Text>
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
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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

export default SettingsModal;
