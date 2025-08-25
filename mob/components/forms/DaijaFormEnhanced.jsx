import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import daijeService from '../../services/daijeService';
import { uploadImage } from '../../utils/imageUtils';
import { parseApiError, showDetailedErrorAlert } from '../../utils/errorUtils';
import { checkConnectivityBeforeApiCall, showNetworkAlert } from '../../utils/networkUtils';

// Import UI komponenti
import ImageSelector from '../ui/ImageSelector';
import LoadingOverlay from '../ui/LoadingOverlay';
import Toast from '../Toast';

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
  facebook: '#1877F2',
  viber: '#665CAC',
  telegram: '#0088CC'
};

const DaijaFormEnhanced = ({ onBack, onSuccess, editMode = false, editData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: 'prof',
    biography: '',
    image: '',
    status: 'approved',
    facebook: '',
    viber: '',
    telegram: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [education, setEducation] = useState([]);
  const [educationInput, setEducationInput] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [selectedImage, setSelectedImage] = useState(null);

  const titles = [
    { value: 'prof', label: 'Prof.' },
    { value: 'mr', label: 'Mr.' },
    { value: 'dr', label: 'Dr.' }
  ];

  const populateFormWithEditData = useCallback(() => {
    if (!editData) return;
    
    setFormData({
      name: editData.name || '',
      title: editData.title || 'prof',
      biography: editData.biography || '',
      image: editData.image || '',
      status: editData.status || 'approved',
      facebook: editData.facebook || '',
      viber: editData.viber || '',
      telegram: editData.telegram || ''
    });

    if (editData.education && Array.isArray(editData.education)) {
      setEducation(editData.education);
    }

    if (editData.image) {
      setSelectedImage({ uri: editData.image, type: 'existing' });
    }
  }, [editData]);

  useEffect(() => {
    if (editMode && editData) {
      populateFormWithEditData();
    }
  }, [editMode, editData, populateFormWithEditData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addEducation = () => {
    if (educationInput.trim()) {
      setEducation(prev => [...prev, educationInput.trim()]);
      setEducationInput('');
    }
  };

  const removeEducation = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Greška', 'Ime je obavezno');
      return false;
    }
    
    if (!formData.biography.trim()) {
      Alert.alert('Greška', 'Biografija je obavezna');
      return false;
    }
    
    // Validate social media URLs if provided
    if (formData.facebook && !formData.facebook.includes('facebook.com')) {
      Alert.alert('Greška', 'Facebook link mora biti valjan Facebook URL');
      return false;
    }
    
    if (formData.telegram && !formData.telegram.includes('t.me')) {
      Alert.alert('Greška', 'Telegram link mora biti valjan Telegram URL');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const isConnected = await checkConnectivityBeforeApiCall();
    if (!isConnected) {
      showNetworkAlert();
      return;
    }
    
    setLoading(true);
    setUploadProgress('Priprema podataka...');
    
    try {
      let imageUrl = formData.image;
      
      // Upload new image if selected
      if (selectedImage && selectedImage.type === 'new') {
        setUploadProgress('Upload slike...');
        try {
          imageUrl = await uploadImage(selectedImage.uri, selectedImage.fileName);
        } catch (uploadError) {
          const errorMessage = parseImageUploadError(uploadError);
          showDetailedErrorAlert('Upload slike neuspješan', errorMessage);
          setLoading(false);
          setUploadProgress('');
          return;
        }
      } else if (selectedImage && selectedImage.type === 'existing') {
        imageUrl = selectedImage.uri;
      }
      
      const daijaData = {
        ...formData,
        image: imageUrl,
        education: education
      };
      
      setUploadProgress('Čuvanje podataka...');
      
      if (editMode && editData?._id) {
        await daijeService.update(editData._id, daijaData);
        setToast({ visible: true, message: 'Daija uspješno ažuriran!', type: 'success' });
      } else {
        await daijeService.create(daijaData);
        setToast({ visible: true, message: 'Daija uspješno dodat!', type: 'success' });
      }
      
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1500);
      
    } catch (error) {
      const errorMessage = parseApiError(error);
      showDetailedErrorAlert(
        editMode ? 'Ažuriranje neuspješno' : 'Dodavanje neuspješno',
        errorMessage
      );
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const formatSocialMediaLink = (platform, value) => {
    if (!value) return '';
    
    switch(platform) {
      case 'facebook':
        if (!value.includes('facebook.com')) {
          return `https://facebook.com/${value}`;
        }
        return value;
      case 'telegram':
        if (!value.includes('t.me')) {
          return `https://t.me/${value}`;
        }
        return value;
      case 'viber':
        // Viber usually uses phone numbers
        return value;
      default:
        return value;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editMode ? 'Uredi daiju' : 'Novi daija'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ime i prezime *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Unesite ime i prezime"
            />
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titula</Text>
            <View style={styles.titleButtons}>
              {titles.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.titleButton,
                    formData.title === t.value && styles.titleButtonActive
                  ]}
                  onPress={() => handleInputChange('title', t.value)}
                >
                  <Text style={[
                    styles.titleButtonText,
                    formData.title === t.value && styles.titleButtonTextActive
                  ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Biography */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biografija *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.biography}
              onChangeText={(text) => handleInputChange('biography', text)}
              placeholder="Unesite biografiju"
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Education */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Obrazovanje</Text>
            <View style={styles.educationInput}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={educationInput}
                onChangeText={setEducationInput}
                placeholder="Dodaj obrazovanje"
                onSubmitEditing={addEducation}
              />
              <TouchableOpacity style={styles.addButton} onPress={addEducation}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.educationList}>
              {education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <Text style={styles.educationText}>{edu}</Text>
                  <TouchableOpacity onPress={() => removeEducation(index)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Social Media Section */}
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Socijalne mreže</Text>
            
            {/* Facebook */}
            <View style={styles.inputGroup}>
              <View style={styles.socialLabel}>
                <Ionicons name="logo-facebook" size={20} color={COLORS.facebook} />
                <Text style={styles.socialLabelText}>Facebook</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.facebook}
                onChangeText={(text) => handleInputChange('facebook', text)}
                placeholder="facebook.com/username ili username"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Viber */}
            <View style={styles.inputGroup}>
              <View style={styles.socialLabel}>
                <MaterialCommunityIcons name="phone-message" size={20} color={COLORS.viber} />
                <Text style={styles.socialLabelText}>Viber</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.viber}
                onChangeText={(text) => handleInputChange('viber', text)}
                placeholder="Broj telefona za Viber"
                keyboardType="phone-pad"
              />
            </View>

            {/* Telegram */}
            <View style={styles.inputGroup}>
              <View style={styles.socialLabel}>
                <MaterialCommunityIcons name="telegram" size={20} color={COLORS.telegram} />
                <Text style={styles.socialLabelText}>Telegram</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.telegram}
                onChangeText={(text) => handleInputChange('telegram', text)}
                placeholder="t.me/username ili username"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Image */}
          <ImageSelector
            label="Slika daije"
            value={selectedImage}
            onValueChange={setSelectedImage}
          />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {editMode ? 'Ažuriraj daiju' : 'Dodaj daiju'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingOverlay 
        visible={loading}
        message={uploadProgress || 'Čuvanje...'}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  titleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  titleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  titleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  titleButtonText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  titleButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  educationInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginLeft: 8,
  },
  educationList: {
    marginTop: 8,
  },
  educationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  educationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
  },
  socialSection: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  socialLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialLabelText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DaijaFormEnhanced;