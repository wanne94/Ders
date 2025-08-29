import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import udruzenjaService from '../../services/udruzenjaService';
import Toast from '../Toast';
import { uploadImage, getImageUrl } from '../../utils/imageUtils';
import { parseApiError, parseImageUploadError, showDetailedErrorAlert } from '../../utils/errorUtils';
import { checkConnectivityBeforeApiCall, showNetworkAlert } from '../../utils/networkUtils';
import ImagePickerWithGallery from '../ImagePickerWithGallery';

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

const OrganizationForm = ({ onBack, onSuccess, editMode = false, editData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    telegram: '',
    viber: '',
    image: '',
    status: 'approved'
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [imageUri, setImageUri] = useState(null);

  const populateFormWithEditData = useCallback(() => {
    if (!editData) return;
    
    setFormData({
      name: editData.name || '',
      description: editData.description || '',
      address: editData.address || '',
      city: editData.city || '',
      phone: editData.phone || '',
      email: editData.email || '',
      website: editData.website || '',
      facebook: editData.facebook || '',
      instagram: editData.instagram || '',
      telegram: editData.telegram || '',
      viber: editData.viber || '',
      image: editData.image || '',
      status: editData.status || 'approved'
    });

    // Set image URI if exists
    if (editData.image) {
      setImageUri(getImageUrl(editData.image));
    }
  }, [editData]);

  useEffect(() => {
    // If in edit mode, populate form with existing data
    if (editMode && editData) {
      populateFormWithEditData();
    }
  }, [editMode, editData, populateFormWithEditData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Greška', 'Naziv udruženja je obavezan');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Greška', 'Opis udruženja je obavezan');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Greška', 'Mjesto je obavezno');
      return false;
    }
    return true;
  };


  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Check network connectivity before proceeding
      const isConnected = await checkConnectivityBeforeApiCall(
        null, // onSuccess - continue with submission
        (networkError) => {
          setLoading(false);
          showNetworkAlert(
            networkError,
            () => handleSubmit(), // retry
            null // cancel
          );
        }
      );
      
      if (!isConnected) {
        return; // Network error handling is done in the callback
      }

      let imagePath = formData.image;

      // If we have a new image (local URI), upload it first
      if (imageUri && imageUri.startsWith('file://')) {
        try {
          console.log('📤 Starting image upload...');
          setUploadProgress('Upload slike u toku...');
          
          const uploadResult = await uploadImage(imageUri);
          // Extract the path from the upload response
          imagePath = uploadResult.path || uploadResult.imagePath || '';
          
          setUploadProgress('Spremanje podataka...');
          console.log('✅ Image uploaded successfully:', imagePath);
        } catch (error) {
          console.error('❌ Image upload failed:', error);
          
          // Parse the specific upload error
          const uploadErrorInfo = parseImageUploadError(error);
          
          // Ask user if they want to continue without image
          const shouldContinue = await new Promise((resolve) => {
            const buttons = [
              { text: 'Prekini', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Nastavi bez slike', onPress: () => resolve(true) }
            ];
            
            // If error can be retried, add retry option
            if (uploadErrorInfo.canRetry !== false) {
              buttons.splice(1, 0, { 
                text: 'Pokušaj ponovo', 
                onPress: () => resolve('retry') 
              });
            }
            
            const actionsText = uploadErrorInfo.actions?.join('\n• ') || '';
            const message = `${uploadErrorInfo.message}\n\nŠta da pokušate:\n• ${actionsText}\n\nMožete nastaviti bez slike ili prekinuti i popraviti problem.`;
            
            Alert.alert(uploadErrorInfo.title, message, buttons);
          });
          
          if (shouldContinue === 'retry') {
            // Recursive retry
            setLoading(false);
            setTimeout(() => handleSubmit(), 1000);
            return;
          } else if (!shouldContinue) {
            setLoading(false);
            return;
          }
          
          imagePath = ''; // Continue without image
        }
      }

      // Prepare final form data
      const finalFormData = {
        ...formData,
        image: imagePath
      };

      // Submit the form - either create or update
      console.log('📤 Submitting form data...');
      if (editMode && editData?._id) {
        await udruzenjaService.updateItem(editData._id, finalFormData);
        console.log('✅ Organization updated successfully');
        Alert.alert(
          'Uspjeh', 
          'Udruženje je uspješno ažurirano!',
          [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]
        );
      } else {
        await udruzenjaService.createUdruzenje(finalFormData);
        console.log('✅ Organization created successfully');
        Alert.alert(
          'Uspjeh', 
          'Udruženje je uspješno dodano!',
          [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]
        );
      }
      
      // Success callback is now called from Alert button
      
      // Clear form only if not in edit mode
      if (!editMode) {
        setFormData({
          name: '',
          description: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          website: '',
          facebook: '',
          instagram: '',
          telegram: '',
          viber: '',
          image: '',
          status: 'approved'
        });
        setImageUri(null);
      }
      
    } catch (error) {
      console.error('❌ Form submission failed:', error);
      
      // Parse the API error for detailed information
      const operation = editMode ? 'updating organization' : 'creating organization';
      const errorInfo = parseApiError(error, operation);
      
      // Show detailed error with retry option
      showDetailedErrorAlert(
        errorInfo,
        errorInfo.canRetry ? () => {
          // Retry after a short delay
          setTimeout(() => handleSubmit(), 1000);
        } : null,
        () => {
          // User cancelled, just stop loading
          setLoading(false);
        }
      );
      
      // Don't set loading to false here if retrying
      if (!errorInfo.canRetry) {
        setLoading(false);
      }
    }
  };

  const renderInput = (label, field, placeholder, multiline = false, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        enabled
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Uredi Udruženje' : 'Dodaj Udruženje'}</Text>
          <View style={styles.headerRight} />
        </View>

      <ScrollView 
        style={styles.formContainer} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker with Gallery */}
        <ImagePickerWithGallery
          value={formData.image}
          onChange={(imagePath) => {
            handleInputChange('image', imagePath);
            if (imagePath) {
              setImageUri(imagePath.startsWith('http') ? imagePath : getImageUrl(imagePath));
            } else {
              setImageUri(null);
            }
          }}
          onUpload={true}
          disabled={loading}
          placeholder="Odaberite sliku udruženja"
        />

        {renderInput('Naziv udruženja', 'name', 'Unesite naziv...', false, true)}
        {renderInput('Opis udruženja', 'description', 'Unesite opis...', true, true)}
        {renderInput('Adresa', 'address', 'Unesite adresu...')}
        {renderInput('mjesto', 'city', 'Unesite mjesto...', false, true)}
        
        {/* Social Media Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Društvene mreže</Text>
          {renderInput('Facebook', 'facebook', 'https://facebook.com/...')}
          {renderInput('Instagram', 'instagram', 'https://instagram.com/...')}
          {renderInput('Telegram', 'telegram', 'https://t.me/...')}
          {renderInput('Viber', 'viber', '+387...')}
        </View>

        {/* Padding for sticky button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Sticky Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.submitButtonText}>
                {uploadProgress || (editMode ? 'Ažuriranje...' : 'Dodavanje...')}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {editMode ? 'Ažuriraj Udruženje' : 'Dodaj Udruženje'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    zIndex: 10,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    zIndex: 11,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerRight: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16, // Standard padding
  },
  bottomPadding: {
    height: 80, // Space for submit button (approx 60px) + some extra margin
  },
  sectionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
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
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    padding: 8,
  },
  imagePickerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
  },
  imagePickerSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.gray,
    marginTop: 4,
  },
});

export default OrganizationForm; 