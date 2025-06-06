import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  SafeAreaView,
} from 'react-native';
import {
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  Menu,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { colors } from '../config/theme';
import { useToast } from '../contexts/ToastContext';
import { processAndUploadImage, getImageDisplayUri } from '../utils/imageUpload';
import { SERVER_URL } from '../config/api';

const OrganizationForm = ({ visible, onDismiss, onSuccess, organization = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    facebook: '',
    instagram: '',
    telegram: '',
    viber: '',
    status: 'pending',
    image: ''
  });

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Load data when form opens
  useEffect(() => {
    if (visible) {
      if (organization) {
        populateForm(organization);
      } else {
        resetForm();
      }
    }
  }, [visible, organization]);

  const populateForm = (orgData) => {
    setFormData({
      name: orgData.name || '',
      description: orgData.description || '',
      address: orgData.address || '',
      city: orgData.city || '',
      facebook: orgData.facebook || '',
      instagram: orgData.instagram || '',
      telegram: orgData.telegram || '',
      viber: orgData.viber || '',
      status: orgData.status || 'pending',
      image: orgData.image || ''
    });

    if (orgData.image) {
      setImageUri(orgData.image);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      facebook: '',
      instagram: '',
      telegram: '',
      viber: '',
      status: 'pending',
      image: ''
    });
    setImageUri(null);
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Greška', 'Potrebna je dozvola za pristup galeriji');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        try {
          // Show loading state
          setImageUri(asset.uri); // Show local image immediately
          
          // Upload image to server
          const serverImagePath = await processAndUploadImage(asset);
          
          // Update form data with server path instead of base64
          handleInputChange('image', serverImagePath);
          
          console.log('✅ Image uploaded and form updated:', serverImagePath);
        } catch (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          Alert.alert('Greška', uploadError.message || 'Greška pri upload-u slike');
          
          // Reset image state on error
          setImageUri(null);
          handleInputChange('image', '');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Greška', 'Greška pri odabiru slike');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast('Naziv udruženja je obavezan', 'error');
      return;
    }

    if (!formData.city) {
      showToast('Mjesto je obavezno', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Remove empty fields
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );

      let response;
      if (organization) {
        response = await axios.put(`${SERVER_URL}/api/organizations/${organization._id}`, cleanedFormData);
        showToast('Udruženje uspješno ažurirano', 'success');
      } else {
        response = await axios.post(`${SERVER_URL}/api/organizations`, {
          ...cleanedFormData,
          status: 'pending'
        });
        showToast('Udruženje uspješno dodano', 'success');
      }

      onSuccess(response.data);
      onDismiss();
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Greška pri čuvanju udruženja';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Header with close button */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}>
                <Text variant="headlineSmall" style={{ 
                  color: colors.primary.main,
                  fontWeight: 'bold'
                }}>
                  {organization ? 'Uredi udruženje' : 'Dodaj udruženje'}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={onDismiss}
                />
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                <View style={{ padding: 20 }}>
                  {error && (
                    <Card style={{ backgroundColor: colors.error.light, marginBottom: 16 }}>
                      <Card.Content>
                        <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>{error}</Text>
                      </Card.Content>
                    </Card>
                  )}

                  {/* Image Upload */}
                  <Text variant="titleMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Logo udruženja
                  </Text>
                  <TouchableOpacity onPress={pickImage} style={{
                    borderWidth: 2,
                    borderColor: '#ccc',
                    borderStyle: 'dashed',
                    borderRadius: 8,
                    padding: 20,
                    alignItems: 'center',
                    marginBottom: 16,
                    minHeight: 120,
                    justifyContent: 'center'
                  }}>
                    {imageUri ? (
                      <View style={{ alignItems: 'center' }}>
                        <Image 
                          source={{ uri: imageUri }} 
                          style={{ 
                            width: '100%', 
                            height: 120, 
                            borderRadius: 8,
                            marginBottom: 8
                          }}
                          resizeMode="cover"
                        />
                        <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                          Dodirnite za promjenu slike
                        </Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <Ionicons name="cloud-upload-outline" size={48} color={colors.text.secondary} />
                        <Text variant="bodyLarge" style={{ marginTop: 8 }}>
                          Dodirnite za dodavanje loga
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                          ili prevucite sliku ovdje
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Name */}
                  <TextInput
                    label="Naziv udruženja *"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                  />

                  {/* Description */}
                  <TextInput
                    label="Opis"
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={{ marginBottom: 16 }}
                    placeholder="Kratki opis udruženja..."
                  />

                  {/* Address */}
                  <TextInput
                    label="Adresa *"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                  />

                  {/* City */}
                  <TextInput
                    label="Mjesto *"
                    value={formData.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                  />

                  {/* Linkovi */}
                  <Text variant="titleMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Linkovi
                  </Text>
                  <TextInput
                    label="Facebook"
                    value={formData.facebook}
                    onChangeText={(text) => handleInputChange('facebook', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                    keyboardType="url"
                    autoCapitalize="none"
                    placeholder="https://..."
                  />
                  <TextInput
                    label="Instagram"
                    value={formData.instagram}
                    onChangeText={(text) => handleInputChange('instagram', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                    keyboardType="url"
                    autoCapitalize="none"
                    placeholder="https://..."
                  />
                  <TextInput
                    label="Telegram"
                    value={formData.telegram}
                    onChangeText={(text) => handleInputChange('telegram', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                    keyboardType="url"
                    autoCapitalize="none"
                    placeholder="https://..."
                  />
                  <TextInput
                    label="Viber"
                    value={formData.viber}
                    onChangeText={(text) => handleInputChange('viber', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                    keyboardType="url"
                    autoCapitalize="none"
                    placeholder="https://..."
                  />

                  {/* Action Buttons */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    marginTop: 20,
                    paddingBottom: 20
                  }}>
                    <Button
                      mode="outlined"
                      onPress={onDismiss}
                      style={{ flex: 1, marginRight: 8 }}
                      disabled={loading}
                    >
                      Otkaži
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={{ flex: 1, marginLeft: 8 }}
                      loading={loading}
                      disabled={loading}
                    >
                      {organization ? 'Osvježi' : 'Dodaj'}
                    </Button>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default OrganizationForm; 