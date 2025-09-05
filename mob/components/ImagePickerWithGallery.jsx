import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, getImageUrl } from '../utils/imageUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const imageSize = (screenWidth - 48) / 3; // 3 images per row with padding

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

const ImagePickerWithGallery = ({ 
  value, 
  onChange, 
  onUpload,
  disabled = false,
  placeholder = "Odaberite ili uploadujte sliku"
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (value) {
      // If value is already a URL, use it directly
      if (value.startsWith('http')) {
        setImageUri(value);
      } else {
        setImageUri(getImageUrl(value));
      }
    }
  }, [value]);


  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Dozvola potrebna',
          'Molimo dozvolite pristup galeriji da biste odabrali sliku.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setImageUri(localUri);
        
        // Upload the image
        if (onUpload) {
          setLoading(true);
          setUploadProgress('Uploaduje se slika...');
          try {
            const uploadResult = await uploadImage(localUri);
            const imagePath = uploadResult.path;
            onChange(imagePath);
            setUploadProgress('Slika uspješno uploadovana!');
            setTimeout(() => setUploadProgress(''), 2000);
          } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Greška', 'Došlo je do greške prilikom uploada slike.');
            setImageUri(null);
          } finally {
            setLoading(false);
          }
        } else {
          onChange(localUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom odabira slike.');
    }
  };


  const handleRemoveImage = () => {
    setImageUri(null);
    onChange('');
  };


  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Slika {!disabled && <Text style={styles.optional}>(opcionalno)</Text>}
      </Text>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          {!disabled && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.buttonSingle, disabled && styles.buttonDisabled]}
          onPress={handlePickImage}
          disabled={disabled || loading}
        >
          <Ionicons name="camera" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Odaberite sliku</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.progressText}>{uploadProgress}</Text>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  optional: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.gray,
  },
  buttonSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: undefined,
    height: screenHeight * 0.3, // 30% of screen height
    aspectRatio: 3/4, // Maintain aspect ratio
    maxWidth: '90%', // Limit width but allow flexible sizing
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignSelf: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default ImagePickerWithGallery;