import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, getImageUrl } from '../utils/imageUtils';
import axiosInstance from '../utils/axiosConfig';

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
  const [showGallery, setShowGallery] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
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

  // Fetch existing images when gallery opens
  const fetchExistingImages = async () => {
    try {
      setLoadingImages(true);
      console.log('📸 [ImagePickerWithGallery] Fetching existing images...');
      const response = await axiosInstance.get('/existing-images?lecturesOnly=true');
      console.log('📸 [ImagePickerWithGallery] Response:', {
        hasData: !!response.data,
        hasImages: !!response.data?.images,
        imageCount: response.data?.images?.length,
        source: response.data?.source,
        firstImage: response.data?.images?.[0]
      });
      if (response.data?.images) {
        // Filter out default/placeholder images
        const defaultImages = ['predavanjeslika.jpg', 'daijaslika.jpg', 'udruzenjeslika.jpg', 
                              'logo.jpg', 'favicon.png', 'icon.png', 'adaptive-icon.png', 
                              'splash.png', 'splash-icon.png', 'maxresdefault.jpg'];
        
        const filteredImages = response.data.images.filter(img => {
          const imageName = img.name || img.url.split('/').pop();
          return !defaultImages.includes(imageName.toLowerCase());
        });
        
        setExistingImages(filteredImages);
        console.log(`✅ [ImagePickerWithGallery] Set ${filteredImages.length} lecture images (filtered from ${response.data.images.length})`);
      }
    } catch (error) {
      console.error('❌ [ImagePickerWithGallery] Error fetching existing images:', error);
      Alert.alert('Greška', 'Nije moguće učitati postojeće slike');
    } finally {
      setLoadingImages(false);
    }
  };

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
        allowsEditing: true,
        aspect: [4, 3],
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

  const handleSelectExisting = (image) => {
    const imageUrl = image.url.startsWith('http') ? image.url : getImageUrl(image.url);
    setImageUri(imageUrl);
    onChange(image.url);
    setShowGallery(false);
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    onChange('');
  };

  const openGallery = () => {
    setShowGallery(true);
    fetchExistingImages();
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={handlePickImage}
            disabled={disabled || loading}
          >
            <Ionicons name="camera" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Nova slika</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, disabled && styles.buttonDisabled]}
            onPress={openGallery}
            disabled={disabled || loading}
          >
            <Ionicons name="images" size={20} color={COLORS.primary} />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Postojeće slike
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.progressText}>{uploadProgress}</Text>
        </View>
      )}

      {/* Gallery Modal */}
      <Modal
        visible={showGallery}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Odaberite postojeću sliku</Text>
              <TouchableOpacity onPress={() => setShowGallery(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {loadingImages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Učitavanje slika...</Text>
              </View>
            ) : existingImages.length > 0 ? (
              <FlatList
                data={existingImages}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => handleSelectExisting(item)}
                  >
                    <Image
                      source={{ uri: item.url.startsWith('http') ? item.url : getImageUrl(item.url) }}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={48} color={COLORS.gray} />
                <Text style={styles.emptyText}>Nema postojećih slika</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
    elevation: 10,
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  gridContainer: {
    padding: 8,
    paddingBottom: 20,
  },
  gridItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 4,
    margin: 4,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  imageName: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default ImagePickerWithGallery;