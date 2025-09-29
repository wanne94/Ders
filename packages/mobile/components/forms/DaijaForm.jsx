import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import daijeService from '../../services/daijeService';
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

const DaijaForm = ({ onBack, onSuccess, editMode = false, editData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: 'prof',
    biography: '',
    image: '',
    status: 'approved',
    // Social networks
    facebook: '',
    viber: '',
    telegram: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [education, setEducation] = useState([]);
  const [educationInput, setEducationInput] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [imageUri, setImageUri] = useState(null);

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

    // Set education array
    if (editData.education && Array.isArray(editData.education)) {
      setEducation(editData.education);
    }

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
      Alert.alert('Greška', 'Ime i prezime je obavezno');
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
          console.log('📤 Starting image upload for daija...');
          setUploadProgress('Upload slike u toku...');
          
          const uploadResult = await uploadImage(imageUri);
          // Extract the path from the upload response
          imagePath = uploadResult.path || uploadResult.imagePath || '';
          
          setUploadProgress('Spremanje podataka daije...');
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
        education: education,
        image: imagePath
      };

      // Submit the form - either create or update
      console.log('📤 Submitting daija form data...');
      if (editMode && editData?._id) {
        await daijeService.updateItem(editData._id, finalFormData);
        console.log('✅ Daija updated successfully');
        Alert.alert(
          'Uspjeh', 
          'Daija je uspješno ažuriran!',
          [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]
        );
      } else {
        await daijeService.createDaija(finalFormData);
        console.log('✅ Daija created successfully');
        Alert.alert(
          'Uspjeh', 
          'Daija je uspješno dodan!',
          [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]
        );
      }
      
      // Success callback is now called from Alert button
      
      // Clear form only if not in edit mode
      if (!editMode) {
        setFormData({
          name: '',
          title: 'prof',
          biography: '',
          image: '',
          status: 'approved'
        });
        setEducation([]);
        setImageUri(null);
      }
      
    } catch (error) {
      console.error('❌ Daija form submission failed:', error);
      
      // Parse the API error for detailed information
      const operation = editMode ? 'updating daija' : 'creating daija';
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

  const renderPicker = (label, options, selectedValue, onSelect, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value || option}
            style={[
              styles.pickerOption,
              (selectedValue === (option.value || option)) && styles.pickerOptionSelected
            ]}
            onPress={() => onSelect(option.value || option)}
          >
            <Text style={[
              styles.pickerOptionText,
              (selectedValue === (option.value || option)) && styles.pickerOptionTextSelected
            ]}>
              {option.label || option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        enabled
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Uredi Daiju' : 'Dodaj Daiju'}</Text>
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
          placeholder="Odaberite sliku daije"
        />

        {renderInput('Ime i prezime', 'name', 'Unesite ime i prezime...', false, true)}
        
        {/* Title Selection */}
        {renderPicker('Titula', titles, formData.title, (value) => handleInputChange('title', value), true)}
        
        {renderInput('Biografija', 'biography', 'Unesite biografiju...', true, false)}
        
        {/* Social Networks */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Društvene mreže (neobavezno)</Text>
          {renderInput('Facebook', 'facebook', 'https://facebook.com/...')}
          {renderInput('Viber', 'viber', '+387...')}
          {renderInput('Telegram', 'telegram', 'https://t.me/...')}
        </View>
        
        {/* Education Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Obrazovanje</Text>
          <View style={styles.educationInputContainer}>
            <TextInput
              style={[styles.input, styles.educationInput]}
              value={educationInput}
              onChangeText={setEducationInput}
              placeholder="Dodaj obrazovanje..."
            />
            <TouchableOpacity style={styles.addButton} onPress={addEducation}>
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {education.map((item, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.educationText}>{item}</Text>
              <TouchableOpacity onPress={() => removeEducation(index)}>
                <Ionicons name="close" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
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
                {uploadProgress || (editMode ? 'Ažuriranje daije...' : 'Dodavanje daije...')}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {editMode ? 'Ažuriraj Daiju' : 'Dodaj Daiju'}
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
  pickerContainer: {
    flexDirection: 'row',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  pickerOptionTextSelected: {
    color: COLORS.white,
  },
  educationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  educationInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  educationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
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
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
});

export default DaijaForm; 