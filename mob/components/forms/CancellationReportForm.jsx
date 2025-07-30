import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import predavanjaService from '../../services/predavanjaService';
import { uploadImage } from '../../utils/imageUtils';

const CancellationReportForm = ({ 
  visible, 
  onClose, 
  lecture, 
  onSuccess 
}) => {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];


  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Dozvola potrebna',
          'Potreban je pristup galeriji slika za dodavanje dokaza',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker with size constraints
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 900,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // Basic file size validation (approximate, since mobile doesn't always provide exact file size)
        if (selectedImage.fileSize && selectedImage.fileSize > MAX_FILE_SIZE) {
          Alert.alert(
            'Slika je prevelika',
            'Molimo odaberite sliku manju od 5MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Check file type based on URI extension
        const fileExtension = selectedImage.uri.split('.').pop()?.toLowerCase();
        if (fileExtension && !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
          Alert.alert(
            'Neodgovarajući format',
            'Molimo odaberite JPEG ili PNG sliku.',
            [{ text: 'OK' }]
          );
          return;
        }

        setProofImage(selectedImage);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Greška',
        'Nije moguće odabrati sliku. Pokušajte ponovo.',
        [{ text: 'OK' }]
      );
    }
  };

  const removeImage = () => {
    setProofImage(null);
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      Alert.alert(
        'Potvrda potrebna',
        'Morate potvrditi da ste sigurni da je predavanje otkazano',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      let uploadedImagePath = null;

      // Upload image if selected
      if (proofImage) {
        setImageUploading(true);
        try {
          const uploadResult = await uploadImage(proofImage.uri, `cancellation-proof-${Date.now()}.jpg`);
          uploadedImagePath = uploadResult.imagePath;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert(
            'Greška pri upload-u slike',
            'Slika se nije mogla poslati. Želite li nastaviti bez dokaza?',
            [
              {
                text: 'Odustani',
                onPress: () => {
                  setLoading(false);
                  return;
                },
                style: 'cancel'
              },
              {
                text: 'Nastavi bez slike',
                onPress: () => {
                  // Continue without image
                }
              }
            ]
          );
        } finally {
          setImageUploading(false);
        }
      }

      const response = await predavanjaService.reportCancellation(lecture._id, {
        reason: reason.trim(),
        proof_image: uploadedImagePath
      });

      Alert.alert(
        'Uspješno prijavljeno',
        response.message || 'Prijava otkazivanja je uspješno poslana',
        [{ text: 'OK' }]
      );

      if (onSuccess) {
        onSuccess(response);
      }

      handleClose();
    } catch (error) {
      console.error('Error reporting cancellation:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Greška pri prijavi otkazivanja. Pokušajte ponovo.';
      
      Alert.alert(
        'Greška',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !imageUploading) {
      setReason('');
      setConfirmed(false);
      setProofImage(null);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="warning" size={28} color="#ff9800" />
              <Text style={styles.headerTitle}>Prijavi otkazano predavanje</Text>
            </View>

            {/* Lecture Info */}
            <View style={styles.lectureInfo}>
              <Text style={styles.lectureInfoLabel}>Predavanje:</Text>
              <Text style={styles.lectureInfoText}>{lecture?.title}</Text>
              <Text style={styles.lectureInfoLabel}>Datum:</Text>
              <Text style={styles.lectureInfoText}>{formatDate(lecture?.date)}</Text>
            </View>

            <View style={styles.divider} />

            {/* Description */}
            <Text style={styles.description}>
              Ako ste sigurni da je predavanje otkazano, molimo vas da nas obavijestite.
            </Text>

            {/* Reason Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Razlog otkazivanja (opcionalno)</Text>
              <TextInput
                style={styles.textArea}
                value={reason}
                onChangeText={setReason}
                placeholder="Npr. Objavljeno na Instagramu udruženja, obavještenje na web stranici..."
                placeholderTextColor="#666666"
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {reason.length}/500 karaktera
              </Text>
            </View>

            {/* Proof Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Dokaz otkazivanja (opcionalno)</Text>
              <Text style={styles.imageHelperText}>
                Dodajte sliku koja potvrđuje otkazivanje (screenshot objave, e-mail, itd.)
              </Text>
              
              {proofImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: proofImage.uri }} style={styles.imagePreview} resizeMode="contain" />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={24} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                  activeOpacity={0.7}
                  disabled={imageUploading}
                >
                  <Ionicons name="camera" size={24} color="#666666" />
                  <Text style={styles.imagePickerText}>
                    {imageUploading ? 'Učitavanje...' : 'Dodaj sliku'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Confirmation Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setConfirmed(!confirmed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                {confirmed && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Siguran sam da je predavanje otkazano
              </Text>
            </TouchableOpacity>

            {/* Info Alert */}
            <View style={styles.infoAlert}>
              <Ionicons name="information-circle" size={20} color="#2196f3" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Napomena:</Text>
                <Text style={styles.infoDescription}>
                  Ako 3 ili više korisnika prijavi isto predavanje kao otkazano, 
                  sistem će ga automatski označiti kao otkazano. Administratori mogu 
                  također ručno pregledati prijave.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleClose}
              disabled={loading || imageUploading}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#666666" />
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Otkaži
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.buttonPrimary,
                (!confirmed || loading || imageUploading) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!confirmed || loading || imageUploading}
              activeOpacity={0.7}
            >
              {loading || imageUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {imageUploading ? 'Šalje sliku...' : loading ? 'Šalje se...' : 'Prijavi otkazivanje'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollContent: {
    maxHeight: 500,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333333',
  },
  lectureInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  lectureInfoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  lectureInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  description: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333333',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ff9800',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#ff9800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: '#2196f3',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonPrimary: {
    backgroundColor: '#ff9800',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonTextSecondary: {
    color: '#666666',
  },
  buttonTextPrimary: {
    color: 'white',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageHelperText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 16,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default CancellationReportForm;