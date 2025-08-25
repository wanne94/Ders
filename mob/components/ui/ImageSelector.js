import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getImageUrl } from '../../utils/imageUtils';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 48) / 3;

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e2e8f0',
  text: '#333333',
  error: '#f44336'
};

const ImageSelector = ({
  value,
  onValueChange,
  label,
  required = false,
  existingImages = [],
  allowExisting = false,
  placeholder = "Dodaj sliku"
}) => {
  const [imageUri, setImageUri] = useState(null);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
    if (value) {
      setImageUri(getImageUrl(value));
    }
  }, [value]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.status !== 'granted') {
      Alert.alert('Dozvola', 'Potrebna je dozvola za pristup galeriji!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      onValueChange({
        uri: asset.uri,
        type: 'new',
        fileName: asset.fileName || `image_${Date.now()}.jpg`
      });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.status !== 'granted') {
      Alert.alert('Dozvola', 'Potrebna je dozvola za pristup kameri!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      onValueChange({
        uri: asset.uri,
        type: 'new',
        fileName: `photo_${Date.now()}.jpg`
      });
    }
  };

  const selectExistingImage = (imageUrl) => {
    setImageUri(getImageUrl(imageUrl));
    onValueChange({
      uri: imageUrl,
      type: 'existing'
    });
    setShowExistingModal(false);
  };

  const removeImage = () => {
    setImageUri(null);
    onValueChange(null);
  };

  const showImageOptions = () => {
    const options = ['Odaberi iz galerije', 'Napravi fotografiju'];
    if (allowExisting && existingImages.length > 0) {
      options.push('Odaberi postojeću sliku');
    }
    if (imageUri) {
      options.push('Ukloni sliku');
    }
    options.push('Otkaži');

    Alert.alert(
      'Odaberi sliku',
      '',
      options.map(option => ({
        text: option,
        onPress: () => {
          switch (option) {
            case 'Odaberi iz galerije':
              pickImage();
              break;
            case 'Napravi fotografiju':
              takePhoto();
              break;
            case 'Odaberi postojeću sliku':
              setShowExistingModal(true);
              break;
            case 'Ukloni sliku':
              removeImage();
              break;
          }
        }
      }))
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={showImageOptions}
      >
        {imageUri ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeImage}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={40} color={COLORS.gray} />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal for existing images */}
      <Modal
        visible={showExistingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExistingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Odaberi postojeću sliku</Text>
              <TouchableOpacity
                onPress={() => setShowExistingModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {loadingExisting ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
              <FlatList
                data={existingImages}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.imageGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridImageContainer}
                    onPress={() => selectExistingImage(item)}
                  >
                    <Image 
                      source={{ uri: getImageUrl(item) }} 
                      style={styles.gridImage}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Nema dostupnih slika</Text>
                }
              />
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
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  loader: {
    paddingVertical: 40,
  },
  imageGrid: {
    padding: 8,
  },
  gridImageContainer: {
    width: imageSize,
    height: imageSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 16,
    paddingVertical: 32,
  },
});

export default ImageSelector;