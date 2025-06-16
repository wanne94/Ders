import { useState, useEffect } from 'react';
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
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import daijeService from '../../services/daijeService';
import Toast from '../Toast';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, getImageUrl } from '../../utils/imageUtils';

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
    status: 'pending'
  });
  
  const [loading, setLoading] = useState(false);
  const [education, setEducation] = useState([]);
  const [educationInput, setEducationInput] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [imageUri, setImageUri] = useState(null);

  const titles = [
    { value: 'prof', label: 'Prof.' },
    { value: 'mr', label: 'Mr.' },
    { value: 'dr', label: 'Dr.' }
  ];

  useEffect(() => {
    // If in edit mode, populate form with existing data
    if (editMode && editData) {
      populateFormWithEditData();
    }
  }, [editMode, editData, populateFormWithEditData]);

  const populateFormWithEditData = () => {
    if (!editData) return;
    
    setFormData({
      name: editData.name || '',
      title: editData.title || 'prof',
      biography: editData.biography || '',
      image: editData.image || '',
      status: editData.status || 'pending'
    });

    // Set education array
    if (editData.education && Array.isArray(editData.education)) {
      setEducation(editData.education);
    }

    // Set image URI if exists
    if (editData.image) {
      setImageUri(getImageUrl(editData.image));
    }
  };

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
    if (!formData.biography.trim()) {
      Alert.alert('Greška', 'Biografija je obavezna');
      return false;
    }
    return true;
  };


  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup galeriji slika.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        handleInputChange('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom odabira slike.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup kameri.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        handleInputChange('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom snimanja fotografije.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Dodaj sliku',
      'Odaberite opciju',
      [
        { text: 'Galerija', onPress: pickImage },
        { text: 'Kamera', onPress: takePhoto },
        { text: 'Otkaži', style: 'cancel' }
      ]
    );
  };

  const removeImage = () => {
    setImageUri(null);
    handleInputChange('image', '');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!validateForm()) return;

      let imagePath = formData.image;

      // If we have a new image (local URI), upload it first
      if (imageUri && imageUri.startsWith('file://')) {
        try {
          imagePath = await uploadImage(imageUri);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Greška', 'Došlo je do greške prilikom uploada slike. Pokušajte ponovo.');
          return;
        }
      }

      // Prepare final form data
      const finalFormData = {
        ...formData,
        education: education,
        image: imagePath
      };

      // Submit the form - either create or update
      if (editMode && editData?._id) {
        await daijeService.updateItem(editData._id, finalFormData);
        Alert.alert('Uspjeh', 'Uspješno ste ažurirali daiju!');
      } else {
        await daijeService.createDaija(finalFormData);
        Alert.alert('Uspjeh', 'Uspješno ste dodali daiju!');
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Clear form only if not in edit mode
      if (!editMode) {
        setFormData({
          name: '',
          title: 'prof',
          biography: '',
          image: '',
          status: 'pending'
        });
        setEducation([]);
        setImageUri(null);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = editMode ? 'Došlo je do greške prilikom ažuriranja. Pokušajte ponovo.' : 'Došlo je do greške prilikom spremanja. Pokušajte ponovo.';
      Alert.alert('Greška', errorMessage);
    } finally {
      setLoading(false);
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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
        {/* Image Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Slika daije (neobavezno)</Text>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Ionicons name="close-circle" size={30} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePickerButton} onPress={showImageOptions}>
              <View style={styles.imagePickerContent}>
                <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Dodaj sliku</Text>
                <Text style={styles.imagePickerSubtext}>Kliknite za odabir slike</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {renderInput('Ime i prezime', 'name', 'Unesite ime i prezime...', false, true)}
        
        {/* Title Selection */}
        {renderPicker('Titula', titles, formData.title, (value) => handleInputChange('title', value), true)}
        
        {renderInput('Biografija', 'biography', 'Unesite biografiju...', true, true)}
        
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
          <Text style={styles.submitButtonText}>
            {loading 
              ? (editMode ? 'Ažuriranje...' : 'Dodavanje...') 
              : (editMode ? 'Ažuriraj Daiju' : 'Dodaj Daiju')
            }
          </Text>
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  },
  backButton: {
    padding: 8,
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
    paddingBottom: 120, // Extra space for keyboard and submit button
  },
  bottomPadding: {
    height: 80, // Space for sticky button
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
    width: 100,
    height: 100,
    borderRadius: 50,
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