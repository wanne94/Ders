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
import { Picker } from '@react-native-picker/picker';
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
    role: 'user'
  });
  
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});

  // Get current user to check permissions
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedUser = jwtDecode(token);
          setCurrentUser(decodedUser);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  // Populate form data when editing
  useEffect(() => {
    if (editMode && editData) {
      setFormData({
        username: editData.username || '',
        email: editData.email || '',
        password: '', // Don't show existing password
        role: editData.role || 'user'
      });
    } else {
      // Reset form when not editing
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user'
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
        // Remove role if user is not super_admin
        if (!isSuperAdmin) {
          delete submitData.role;
        }
        response = await axiosInstance.put(`/users/${editData._id}`, submitData);
      } else {
        // Remove role if user is not super_admin
        if (!isSuperAdmin) {
          delete submitData.role;
        }
        response = await axiosInstance.post('/users', submitData);
      }

      if (response) {
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
              {renderInput('Korisničko ime', 'username', 'Unesite korisničko ime...', false, true)}
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

              {/* Role selector - only for super admins */}
              {isSuperAdmin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Uloga <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.role}
                      onValueChange={(value) => handleInputChange('role', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Korisnik" value="user" />
                      <Picker.Item label="Admin" value="admin" />
                      <Picker.Item label="Super Admin" value="super_admin" />
                    </Picker>
                  </View>
                </View>
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
    maxHeight: '80%',
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
});

export default UserForm;