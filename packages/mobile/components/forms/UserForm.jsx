import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  background: '#f8fafc',
  border: '#e2e8f0',
};

const UserForm = ({
  visible = false,
  onClose,
  onSuccess,
  editMode = false,
  editData = null
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    firstName: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Get current user to check permissions
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const decodedUser = jwtDecode(token);
          setCurrentUser(decodedUser);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, [visible]); // Re-run when modal becomes visible

  // Populate form data when editing
  useEffect(() => {
    if (editMode && editData) {
      const userRole = editData.role || 'user';
      setFormData({
        username: editData.username || '',
        email: editData.email || '',
        password: '', // Don't show existing password
        role: userRole,
        firstName: editData.firstName || '',
        phone: editData.phone || ''
      });
    } else {
      // Reset form when not editing
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        firstName: '',
        phone: ''
      });
    }
    setErrors({});
  }, [editMode, editData, visible]);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Korisničko ime je obavezno';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Korisničko ime mora imati najmanje 3 karaktera';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email nije valjan';
    }

    // Password validation (only for new users or if password is being changed)
    if (!editMode || formData.password) {
      if (!editMode && !formData.password) {
        newErrors.password = 'Šifra je obavezna';
      } else if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Šifra mora imati najmanje 6 karaktera';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    console.log('[handleInputChange] Changing field:', field, 'to value:', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('[handleInputChange] New formData:', newData);
      return newData;
    });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      const submitData = { ...formData };

      if (editMode) {
        // Remove password if empty (not changing password)
        if (!submitData.password) {
          delete submitData.password;
        }
        // Keep role if user is super_admin
        if (!isSuperAdmin) {
          delete submitData.role;
        }
        console.log('Submitting data for update:', submitData);
        console.log('User ID:', editData._id);
        console.log('Is super admin:', isSuperAdmin);
        response = await axiosInstance.put(`/users/${editData._id}`, submitData);
      } else {
        // Remove role if user is not super_admin
        if (!isSuperAdmin) {
          delete submitData.role;
        }
        response = await axiosInstance.post('/users', submitData);
      }

      if (response) {
        console.log('Response from server:', response.data || response);
        Alert.alert(
          'Uspjeh',
          editMode ? 'Korisnik uspješno ažuriran!' : 'Korisnik uspješno dodat!',
          [{ text: 'OK', onPress: () => {
            onSuccess?.(response.data || response);
            onClose();
          }}]
        );
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Greška pri ${editMode ? 'ažuriranju' : 'dodavanju'} korisnika`;
      Alert.alert('Greška', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, secureTextEntry = false, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        secureTextEntry={secureTextEntry}
        autoCapitalize={field === 'email' ? 'none' : 'sentences'}
        keyboardType={field === 'email' ? 'email-address' : 'default'}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {editMode ? 'Uredi korisnika' : 'Dodaj korisnika'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {renderInput('Člansko ime', 'username', 'Unesite člansko ime...', false, true)}
              {renderInput('Email', 'email', 'Unesite email...', false, true)}
              {renderInput(
                editMode ? 'Nova šifra' : 'Šifra', 
                'password', 
                editMode ? 'Ostavite prazno da ne mijenjate' : 'Unesite šifru...', 
                true, 
                !editMode
              )}
              
              {editMode && (
                <Text style={styles.helperText}>
                  Ostavite polje šifre prazno ako ne želite mijenjati lozinku
                </Text>
              )}

              {/* Personal Information Section */}
              <Text style={styles.sectionTitle}>Lične informacije</Text>
              {renderInput('Ime', 'firstName', 'Unesite ime...')}
              {renderInput('Telefon', 'phone', 'Unesite broj telefona...')}

              {/* Role selector - only for super admins */}
              {isSuperAdmin && (
                <>
                  <Text style={styles.sectionTitle}>Administrativno</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Uloga <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowRoleDropdown(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {formData.role === 'user' ? 'Član' :
                         formData.role === 'admin' ? 'Admin' :
                         formData.role === 'super_admin' ? 'Super Admin (ne može se mijenjati)' : 'Član'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Otkaži</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editMode ? 'Ažuriraj' : 'Dodaj'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Role Dropdown Modal */}
      <Modal
        visible={showRoleDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowRoleDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Izaberite ulogu</Text>
              <TouchableOpacity onPress={() => setShowRoleDropdown(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => {
                console.log('[Dropdown] Selected USER');
                handleInputChange('role', 'user');
                setShowRoleDropdown(false);
              }}
            >
              <Text style={[styles.dropdownOptionText, formData.role === 'user' && styles.selectedOption]}>
                Član
              </Text>
              {formData.role === 'user' && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => {
                console.log('[Dropdown] Selected ADMIN');
                handleInputChange('role', 'admin');
                setShowRoleDropdown(false);
              }}
            >
              <Text style={[styles.dropdownOptionText, formData.role === 'admin' && styles.selectedOption]}>
                Admin
              </Text>
              {formData.role === 'admin' && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: -8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  selectedOption: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default UserForm;