import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import predavanjaService from '../../services/predavanjaService';
import daijeService from '../../services/daijeService';
import udruzenjaService from '../../services/udruzenjaService';
import { formatDaijaTitle } from '../../utils';
import { sortLecturers, sortAssociations } from '../../utils/sortingUtils';
import { uploadImage } from '../../utils/imageUtils';
import apiClient from '../../services/apiClient';

// Import UI komponenti
import Combobox from '../ui/Combobox';
import ImageSelector from '../ui/ImageSelector';
import LoadingOverlay from '../ui/LoadingOverlay';
import Toast from '../Toast';

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

const LectureFormEnhanced = ({ onBack, onSuccess, editMode = false, editData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    date: format(new Date(), 'dd.MM.yyyy'),
    time: '',
    address: '',
    city: '',
    speaker: '',
    daijaIds: [],
    customSpeakers: [],
    organization: '',
    organizationId: '',
    image: '',
    isWeeklyLecture: false,
    totalWeeks: 4
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Time options
  const timeOptions = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push({ label: time, value: time });
    }
  }

  // Load data
  useEffect(() => {
    loadData();
    loadExistingImages();
  }, []);

  useEffect(() => {
    if (editMode && editData) {
      populateFormWithEditData();
    }
  }, [editMode, editData]);

  const loadData = async () => {
    try {
      const [daijeResponse, orgsResponse] = await Promise.all([
        daijeService.getAll(),
        udruzenjaService.getAll()
      ]);

      const sortedDaije = sortLecturers(daijeResponse.data);
      const sortedOrgs = sortAssociations(orgsResponse.data);
      
      setDaije(sortedDaije.map(d => ({
        value: d._id,
        label: formatDaijaTitle(d.name, d.title)
      })));
      
      setOrganizations(sortedOrgs.map(o => ({
        value: o._id,
        label: o.name
      })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadExistingImages = async () => {
    try {
      const response = await apiClient.get('/lectures/images');
      if (response.data && response.data.images) {
        setExistingImages(response.data.images);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const populateFormWithEditData = () => {
    if (!editData) return;
    
    const daijaIds = editData.daijaIds || [];
    const customSpeakers = editData.customSpeakers || [];
    
    // Backwards compatibility
    if (daijaIds.length === 0 && editData.daija) {
      daijaIds.push(editData.daija._id || editData.daija);
    }
    
    setFormData({
      title: editData.title || '',
      description: editData.description || '',
      shortDescription: editData.shortDescription || '',
      date: editData.date || format(new Date(), 'dd.MM.yyyy'),
      time: editData.time || '',
      address: editData.address || '',
      city: editData.city || '',
      speaker: '',
      daijaIds: daijaIds,
      customSpeakers: customSpeakers,
      organization: editData.organization || '',
      organizationId: editData.organizationId?._id || editData.organizationId || '',
      image: editData.image || '',
      isWeeklyLecture: editData.isWeeklyLecture || false,
      totalWeeks: editData.totalWeeks || 4
    });
    
    setUseCustomSpeaker(customSpeakers.length > 0);
    setUseCustomOrganization(!editData.organizationId);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDaija = (daijaId) => {
    if (daijaId && !formData.daijaIds.includes(daijaId)) {
      setFormData(prev => ({
        ...prev,
        daijaIds: [...prev.daijaIds, daijaId]
      }));
    }
  };

  const removeDaija = (daijaId) => {
    setFormData(prev => ({
      ...prev,
      daijaIds: prev.daijaIds.filter(id => id !== daijaId)
    }));
  };

  const addCustomSpeaker = () => {
    if (formData.speaker.trim()) {
      setFormData(prev => ({
        ...prev,
        customSpeakers: [...prev.customSpeakers, prev.speaker.trim()],
        speaker: ''
      }));
    }
  };

  const removeCustomSpeaker = (index) => {
    setFormData(prev => ({
      ...prev,
      customSpeakers: prev.customSpeakers.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Greška', 'Naslov je obavezan');
      return false;
    }
    
    if (!useCustomSpeaker && formData.daijaIds.length === 0) {
      Alert.alert('Greška', 'Morate dodati barem jednog predavača');
      return false;
    }
    
    if (useCustomSpeaker && formData.customSpeakers.length === 0) {
      Alert.alert('Greška', 'Morate dodati barem jednog predavača');
      return false;
    }
    
    if (!formData.date) {
      Alert.alert('Greška', 'Datum je obavezan');
      return false;
    }
    
    if (!formData.time) {
      Alert.alert('Greška', 'Vrijeme je obavezno');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setUploadProgress('Priprema podataka...');
    
    try {
      let imageUrl = formData.image;
      
      // Upload new image if selected
      if (selectedImage && selectedImage.type === 'new') {
        setUploadProgress('Upload slike...');
        imageUrl = await uploadImage(selectedImage.uri, selectedImage.fileName);
      } else if (selectedImage && selectedImage.type === 'existing') {
        imageUrl = selectedImage.uri;
      }
      
      const lectureData = {
        ...formData,
        image: imageUrl,
        daija: !useCustomSpeaker && formData.daijaIds.length === 1 ? formData.daijaIds[0] : null,
        daijaIds: !useCustomSpeaker ? formData.daijaIds : [],
        customSpeakers: useCustomSpeaker ? formData.customSpeakers : [],
        speaker: useCustomSpeaker && formData.customSpeakers.length === 1 ? formData.customSpeakers[0] : '',
        organizationId: !useCustomOrganization ? formData.organizationId : null,
        organization: useCustomOrganization ? formData.organization : ''
      };
      
      setUploadProgress('Čuvanje predavanja...');
      
      if (editMode && editData?._id) {
        await predavanjaService.update(editData._id, lectureData);
        setToast({ visible: true, message: 'Predavanje uspješno ažurirano!', type: 'success' });
      } else {
        await predavanjaService.create(lectureData);
        setToast({ visible: true, message: 'Predavanje uspješno dodato!', type: 'success' });
      }
      
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('Submit error:', error);
      setToast({ 
        visible: true, 
        message: error.response?.data?.message || 'Greška pri čuvanju predavanja', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editMode ? 'Uredi predavanje' : 'Novo predavanje'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Naslov *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Unesite naslov predavanja"
            />
          </View>

          {/* Short Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kratak opis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.shortDescription}
              onChangeText={(text) => handleInputChange('shortDescription', text)}
              placeholder="Kratak opis (max 200 karaktera)"
              multiline
              numberOfLines={2}
              maxLength={200}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Opis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Detaljni opis predavanja"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Speaker Type Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Tip predavača</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[styles.toggleButton, !useCustomSpeaker && styles.toggleButtonActive]}
                onPress={() => setUseCustomSpeaker(false)}
              >
                <Text style={[styles.toggleButtonText, !useCustomSpeaker && styles.toggleButtonTextActive]}>
                  Daija iz baze
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useCustomSpeaker && styles.toggleButtonActive]}
                onPress={() => setUseCustomSpeaker(true)}
              >
                <Text style={[styles.toggleButtonText, useCustomSpeaker && styles.toggleButtonTextActive]}>
                  Prilagođen
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Speakers */}
          {!useCustomSpeaker ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daije *</Text>
              <Combobox
                options={daije}
                value=""
                onValueChange={addDaija}
                placeholder="Dodaj daiju"
                searchPlaceholder="Pretraži daije..."
              />
              <View style={styles.tagContainer}>
                {formData.daijaIds.map(daijaId => {
                  const daija = daije.find(d => d.value === daijaId);
                  return (
                    <View key={daijaId} style={styles.tag}>
                      <Text style={styles.tagText}>{daija?.label}</Text>
                      <TouchableOpacity onPress={() => removeDaija(daijaId)}>
                        <Ionicons name="close-circle" size={20} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prilagođeni predavači *</Text>
              <View style={styles.customSpeakerInput}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={formData.speaker}
                  onChangeText={(text) => handleInputChange('speaker', text)}
                  placeholder="Ime predavača"
                />
                <TouchableOpacity style={styles.addButton} onPress={addCustomSpeaker}>
                  <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.tagContainer}>
                {formData.customSpeakers.map((speaker, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{speaker}</Text>
                    <TouchableOpacity onPress={() => removeCustomSpeaker(index)}>
                      <Ionicons name="close-circle" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Date and Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Datum *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formData.date}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Vrijeme *</Text>
              <Combobox
                options={timeOptions}
                value={formData.time}
                onValueChange={(value) => handleInputChange('time', value)}
                placeholder="Odaberi"
              />
            </View>
          </View>

          {/* Weekly Options */}
          <View style={styles.weeklyContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Sedmično predavanje</Text>
              <Switch
                value={formData.isWeeklyLecture}
                onValueChange={(value) => handleInputChange('isWeeklyLecture', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={formData.isWeeklyLecture ? COLORS.primary : COLORS.gray}
              />
            </View>
            {formData.isWeeklyLecture && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Broj sedmica</Text>
                <Combobox
                  options={[
                    { label: '2 sedmice', value: 2 },
                    { label: '3 sedmice', value: 3 },
                    { label: '4 sedmice', value: 4 },
                    { label: '5 sedmica', value: 5 },
                    { label: '6 sedmica', value: 6 },
                    { label: '8 sedmica', value: 8 },
                    { label: '10 sedmica', value: 10 },
                    { label: '12 sedmica', value: 12 }
                  ]}
                  value={formData.totalWeeks}
                  onValueChange={(value) => handleInputChange('totalWeeks', value)}
                  placeholder="Odaberi broj sedmica"
                />
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresa</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              placeholder="Unesite adresu"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grad</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
              placeholder="Unesite grad"
            />
          </View>

          {/* Organization Type Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Organizator</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[styles.toggleButton, !useCustomOrganization && styles.toggleButtonActive]}
                onPress={() => setUseCustomOrganization(false)}
              >
                <Text style={[styles.toggleButtonText, !useCustomOrganization && styles.toggleButtonTextActive]}>
                  Iz baze
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useCustomOrganization && styles.toggleButtonActive]}
                onPress={() => setUseCustomOrganization(true)}
              >
                <Text style={[styles.toggleButtonText, useCustomOrganization && styles.toggleButtonTextActive]}>
                  Prilagođen
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Organization */}
          {!useCustomOrganization ? (
            <View style={styles.inputGroup}>
              <Combobox
                options={organizations}
                value={formData.organizationId}
                onValueChange={(value) => handleInputChange('organizationId', value)}
                placeholder="Odaberi udruženje"
                searchPlaceholder="Pretraži udruženja..."
              />
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={formData.organization}
                onChangeText={(text) => handleInputChange('organization', text)}
                placeholder="Naziv organizatora"
              />
            </View>
          )}

          {/* Image */}
          <ImageSelector
            label="Slika predavanja"
            value={selectedImage}
            onValueChange={setSelectedImage}
            existingImages={existingImages}
            allowExisting={true}
          />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {editMode ? 'Ažuriraj predavanje' : 'Dodaj predavanje'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingOverlay 
        visible={loading}
        message={uploadProgress || 'Čuvanje...'}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
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
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleContainer: {
    marginBottom: 16,
  },
  toggleButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  customSpeakerInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginLeft: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 14,
    marginRight: 4,
  },
  weeklyContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LectureFormEnhanced;