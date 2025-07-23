import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert, Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

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

const SuggestionForm = ({ onBack, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [referenceType, setReferenceType] = useState('općenito');
  const [referenceId, setReferenceId] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions = [
    { value: 'daija', label: 'Daija' },
    { value: 'udruženje', label: 'Udruženje' },
    { value: 'stranica', label: 'Stranica' },
    { value: 'općenito', label: 'Općeniti prijedlog' }
  ];

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
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom odabira slike.');
    }
  };


  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Greška', 'Molimo unesite opis prijedloga');
      return;
    }

    setIsSubmitting(true);

    try {
      // const suggestionData = {
      //   description: description.trim(),
      //   referenceType: referenceType !== 'općenito' ? referenceType : null,
      //   referenceId: referenceType !== 'općenito' ? referenceId : null,
      //   image: image || null
      // };

      // Here you would make the API call
      // const response = await axiosInstance.post('/suggestions', payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Uspjeh', 'Prijedlog je uspješno poslan!', [
        { text: 'OK', onPress: onSuccess }
      ]);
      
    } catch (_error) {
      Alert.alert('Greška', 'Greška pri slanju prijedloga');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Text style={styles.headerTitle}>Predloži Izmjenu</Text>
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
                <Text style={styles.inputLabel}>Slika (neobavezno)</Text>
                {imageUri ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                            <Ionicons name="close-circle" size={30} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                        <View style={styles.imagePickerContent}>
                            <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
                            <Text style={styles.imagePickerText}>Dodaj sliku</Text>
                            <Text style={styles.imagePickerSubtext}>Kliknite za odabir slike</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.subtitle}>
                Imaš prijedlog ili izmjenu? Podijeli s nama!
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Čega se prijedlog tiče</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={referenceType}
                        onValueChange={(itemValue) => setReferenceType(itemValue)}
                        style={styles.picker}
                    >
                        {typeOptions.map((option) => (
                            <Picker.Item 
                                key={option.value} 
                                label={option.label} 
                                value={option.value} 
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {referenceType !== 'općenito' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ID reference (opcionalno)</Text>
                    <TextInput
                        style={styles.input}
                        value={referenceId}
                        onChangeText={setReferenceId}
                        placeholder="Unesite ID ako ga znate"
                        placeholderTextColor={COLORS.gray}
                    />
                </View>
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Vaš prijedlog / izmjena *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Opišite vašu izmjenu ili prijedlog..."
                    placeholderTextColor={COLORS.gray}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />
            </View>
        </ScrollView>

        <View style={styles.submitContainer}>
            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Slanje...' : 'Pošalji Prijedlog'}
                </Text>
            </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerRight: {
    width: 32,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Space for submit button + bottom navigation
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
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
    height: 80,
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
    color: COLORS.gray,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: COLORS.primary,
  },
  submitContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SuggestionForm; 