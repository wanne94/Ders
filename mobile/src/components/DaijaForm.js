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

const DaijaForm = ({ visible, onDismiss, onSuccess, daija = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    biography: '',
    education: [],
    image: '',
    status: 'pending'
  });

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Load data when form opens
  useEffect(() => {
    if (visible) {
      if (daija) {
        populateForm(daija);
      } else {
        resetForm();
      }
    }
  }, [visible, daija]);

  const populateForm = (daijaData) => {
    setFormData({
      title: daijaData.title || '',
      firstName: daijaData.firstName || '',
      lastName: daijaData.lastName || '',
      biography: daijaData.biography || '',
      education: Array.isArray(daijaData.education) 
        ? daijaData.education 
        : daijaData.education 
          ? daijaData.education.split('\n').filter(item => item.trim()) 
          : [],
      image: daijaData.image || '',
      status: daijaData.status || 'pending'
    });

    if (daijaData.image) {
      setImageUri(daijaData.image);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      firstName: '',
      lastName: '',
      biography: '',
      education: [''],
      image: '',
      status: 'pending'
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

  // Funkcije za upravljanje obrazovanjem
  const addEducationItem = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, '']
    }));
  };

  const updateEducationItem = (index, value) => {
    const updated = [...formData.education];
    updated[index] = value;
    setFormData(prev => ({ ...prev, education: updated }));
  };

  const removeEducationItem = (index) => {
    const updated = [...formData.education];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, education: updated }));
  };

  const moveEducationItem = (fromIndex, toIndex) => {
    const updated = [...formData.education];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFormData(prev => ({ ...prev, education: updated }));
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
    if (!formData.firstName.trim()) {
      showToast('Ime je obavezno', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Pripremi podatke za backend
      const finalFormData = {
        ...formData,
        // Filtriraj prazne education stavke i konvertuj u string za backend
        education: formData.education
          .filter(item => item.trim())
          .join('\n'),
        image: formData.image || '/uploads/images/daijaslika.jpg'
      };

      let response;
      if (daija) {
        response = await axios.put(`${SERVER_URL}/api/daije/${daija._id}`, finalFormData);
        showToast('Daija uspješno osvježen', 'success');
      } else {
        response = await axios.post(`${SERVER_URL}/api/daije`, {
          ...finalFormData,
          status: 'pending'
        });
        showToast('Daija uspješno dodan', 'success');
      }

      onSuccess(response.data);
      onDismiss();
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Greška pri čuvanju daije';
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
                  {daija ? 'Uredi daiju' : 'Dodaj daiju'}
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
                    Slika daije
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
                          Dodirnite za dodavanje slike
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                          ili prevucite sliku ovdje
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Title */}
                  <TextInput
                    label="Titula *"
                    value={formData.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                    placeholder="Dr., Hafiz, Imam..."
                  />

                  {/* First Name */}
                  <TextInput
                    label="Ime *"
                    value={formData.firstName}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                  />

                  {/* Last Name */}
                  <TextInput
                    label="Prezime"
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                    mode="outlined"
                    style={{ marginBottom: 16 }}
                  />

                  {/* Biography */}
                  <TextInput
                    label="Biografija"
                    value={formData.biography}
                    onChangeText={(text) => handleInputChange('biography', text)}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={{ marginBottom: 16 }}
                    placeholder="Kratka biografija daije..."
                  />

                  {/* Education */}
                  <Text variant="titleMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Obrazovanje
                  </Text>
                  {formData.education.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TextInput
                        label={`${index + 1}.`}
                        value={item}
                        onChangeText={(text) => updateEducationItem(index, text)}
                        mode="outlined"
                        style={{ flex: 1 }}
                      />
                      <IconButton
                        icon="delete"
                        size={24}
                        onPress={() => removeEducationItem(index)}
                      />
                    </View>
                  ))}
                  <Button
                    mode="outlined"
                    onPress={addEducationItem}
                    style={{ marginTop: 8 }}
                  >
                    Dodaj stavku obrazovanja
                  </Button>

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
                      {daija ? 'Osvježi' : 'Dodaj'}
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

export default DaijaForm; 