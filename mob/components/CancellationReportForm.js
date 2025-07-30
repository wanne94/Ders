import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  borderGray: '#e0e0e0',
  error: '#f44336',
  warning: '#ff9800',
};

const CancellationReportForm = ({
  visible,
  onClose,
  lectureId,
  lectureTitle,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    howFound: '',
    additionalInfo: ''
  });
  const [errors, setErrors] = useState({});

  const howFoundOptions = [
    { label: 'Izaberite opciju...', value: '' },
    { label: 'Kontaktirao/la sam organizatora', value: 'contacted_organizer' },
    { label: 'Vidjeli objavu na društvenim mrežama', value: 'social_media' },
    { label: 'Informisan/a od prijatelja', value: 'friend' },
    { label: 'Nazvao/la džamiju/lokaciju', value: 'called_location' },
    { label: 'Drugo', value: 'other' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Razlog otkazivanja je obavezan';
    }

    if (!formData.howFound) {
      newErrors.howFound = 'Molimo izaberite kako ste saznali';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      reason: '',
      howFound: '',
      additionalInfo: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prijavi otkazivanje</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {lectureTitle && (
                <View style={styles.lectureInfo}>
                  <Text style={styles.lectureTitle}>{lectureTitle}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Razlog otkazivanja <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.reason && styles.inputError]}
                  value={formData.reason}
                  onChangeText={(text) => {
                    setFormData({ ...formData, reason: text });
                    if (errors.reason) setErrors({ ...errors, reason: null });
                  }}
                  placeholder="Unesite razlog otkazivanja..."
                  placeholderTextColor={COLORS.gray}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {errors.reason && (
                  <Text style={styles.errorText}>{errors.reason}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Kako ste saznali? <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.pickerContainer, errors.howFound && styles.inputError]}>
                  <Picker
                    selectedValue={formData.howFound}
                    onValueChange={(value) => {
                      setFormData({ ...formData, howFound: value });
                      if (errors.howFound) setErrors({ ...errors, howFound: null });
                    }}
                    style={styles.picker}
                  >
                    {howFoundOptions.map((option) => (
                      <Picker.Item 
                        key={option.value} 
                        label={option.label} 
                        value={option.value}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.howFound && (
                  <Text style={styles.errorText}>{errors.howFound}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dodatne informacije (opciono)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.additionalInfo}
                  onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
                  placeholder="Dodatne napomene..."
                  placeholderTextColor={COLORS.gray}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.noteContainer}>
                <Ionicons name="information-circle" size={20} color={COLORS.warning} />
                <Text style={styles.noteText}>
                  Nakon 3 prijave, predavanje će biti automatski označeno kao otkazano.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Slanje...' : 'Pošalji prijavu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  lectureInfo: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  lectureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.primary,
  },
  textArea: {
    minHeight: 80,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGray,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.warning,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CancellationReportForm;