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
  Menu,
  Divider,
  Chip,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../services/apiService';
import { colors } from '../config/theme';
import { useToast } from '../contexts/ToastContext';
import { processAndUploadImage, getImageDisplayUri } from '../utils/imageUpload';
import { SERVER_URL } from '../config/api';

const LectureForm = ({ visible, onDismiss, onSuccess, lecture = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    daijaId: '',
    speaker: '',
    organizationId: '',
    organization: '',
    date: '',
    time: '',
    address: '',
    city: '',
    shortDescription: '',
    image: '',
    status: 'pending'
  });

  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Menu states
  const [daijaMenuVisible, setDaijaMenuVisible] = useState(false);
  const [organizationMenuVisible, setOrganizationMenuVisible] = useState(false);

  // Search states
  const [daijaSearch, setDaijaSearch] = useState('');
  const [organizationSearch, setOrganizationSearch] = useState('');

  // Date and Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Toast for feedback
  const { showSuccess, showError } = useToast();

  // Check if organization is selected (disable address/city fields)
  const isOrganizationSelected = formData.organizationId && !useCustomOrganization;

  // Filter daije based on search term
  const filteredDaije = Array.isArray(daije) ? daije.filter(d =>
    (`${d.title} ${d.firstName} ${d.lastName || ''}`).toLowerCase().includes(daijaSearch.toLowerCase())
  ) : [];

  console.log('🔍 LectureForm debug:', {
    daijeLength: daije.length,
    filteredDaijeLength: filteredDaije.length,
    daijaSearch,
    sampleDaija: daije[0]
  });

  // Filter organizations based on search term
  const filteredOrganizations = Array.isArray(organizations) ? organizations.filter(org =>
    org.name.toLowerCase().includes(organizationSearch.toLowerCase())
  ) : [];

  // Load data when form opens
  useEffect(() => {
    if (visible) {
      fetchData();
      if (lecture) {
        populateForm(lecture);
      } else {
        resetForm();
      }
    }
  }, [visible, lecture]);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching daije and organizations for LectureForm...');
      
      const [daijeData, organizationsData] = await Promise.all([
        apiService.getDaije(),
        apiService.getOrganizations()
      ]);
      
      console.log('✅ Daije fetched:', Array.isArray(daijeData) ? daijeData.length : 'Not array', daijeData);
      console.log('✅ Organizations fetched:', Array.isArray(organizationsData) ? organizationsData.length : 'Not array', organizationsData);
      
      setDaije(Array.isArray(daijeData) ? daijeData : []);
      setOrganizations(Array.isArray(organizationsData) ? organizationsData : []);
    } catch (error) {
      console.error('❌ Error fetching data for LectureForm:', error);
      setError('Greška pri dohvaćanju podataka');
      showError('Greška pri dohvaćanju podataka');
      
      // Set empty arrays as fallback
      setDaije([]);
      setOrganizations([]);
    }
  };

  const populateForm = (lectureData) => {
    setFormData({
      title: lectureData.title || '',
      daijaId: lectureData.daijaId || '',
      speaker: lectureData.speaker || '',
      organizationId: lectureData.organizationId || '',
      organization: lectureData.organization || '',
      date: lectureData.date || '',
      time: lectureData.time || '',
      address: lectureData.address || '',
      city: lectureData.city || '',
      shortDescription: lectureData.shortDescription || '',
      image: lectureData.image || '',
      status: lectureData.status || 'pending'
    });

    setUseCustomSpeaker(!lectureData.daijaId && !!lectureData.speaker);
    setUseCustomOrganization(!lectureData.organizationId && !!lectureData.organization);

    if (lectureData.image) {
      setImageUri(lectureData.image);
    }

    if (lectureData.date) {
      setSelectedDate(new Date(lectureData.date));
    }

    if (lectureData.time) {
      // Parse time string (HH:MM) and create a Date object for today with that time
      const [hours, minutes] = lectureData.time.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10));
      timeDate.setMinutes(parseInt(minutes, 10));
      timeDate.setSeconds(0);
      setSelectedTime(timeDate);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      daijaId: '',
      speaker: '',
      organizationId: '',
      organization: '',
      date: '',
      time: '',
      address: '',
      city: '',
      shortDescription: '',
      image: '',
      status: 'pending'
    });
    setUseCustomSpeaker(false);
    setUseCustomOrganization(false);
    setImageUri(null);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Naslov predavanja je obavezan');
      return false;
    }
    if (formData.title.length > 80) {
      showError('Naslov ne može biti duži od 80 karaktera');
      return false;
    }
    if (!useCustomSpeaker && !formData.daijaId) {
      showError('Molimo odaberite daiju ili unesite ime daije');
      return false;
    }
    if (useCustomSpeaker && !formData.speaker.trim()) {
      showError('Ime daije je obavezno');
      return false;
    }
    if (!formData.date) {
      showError('Datum je obavezan');
      return false;
    }
    if (!formData.time) {
      showError('Vrijeme je obavezno');
      return false;
    }
    if (!formData.address.trim()) {
      showError('Adresa je obavezna');
      return false;
    }
    if (!formData.city.trim()) {
      showError('Mjesto je obavezno');
      return false;
    }
    return true;
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

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      handleInputChange('date', date.toISOString());
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
      const formatted = time.toLocaleTimeString('bs-BA', {
        hour: '2-digit',
        minute: '2-digit',
      });
      handleInputChange('time', formatted);
    }
  };

  const handleDaijaSelect = (daija) => {
    if (daija === 'custom') {
      setUseCustomSpeaker(true);
      handleInputChange('daijaId', '');
      handleInputChange('speaker', '');
    } else {
      setUseCustomSpeaker(false);
      handleInputChange('daijaId', daija._id);
      handleInputChange('speaker', `${daija.title} ${daija.firstName}`);
    }
    setDaijaMenuVisible(false);
  };

  const handleOrganizationSelect = (org) => {
    if (org === 'custom') {
      setUseCustomOrganization(true);
      handleInputChange('organizationId', '');
      handleInputChange('organization', '');
      handleInputChange('city', '');
      handleInputChange('address', '');
    } else if (org === null) {
      setUseCustomOrganization(false);
      handleInputChange('organizationId', '');
      handleInputChange('organization', '');
      handleInputChange('city', '');
      handleInputChange('address', '');
    } else {
      setUseCustomOrganization(false);
      handleInputChange('organizationId', org._id);
      handleInputChange('organization', org.name);
      handleInputChange('city', org.city || '');
      handleInputChange('address', org.address || '');
    }
    setOrganizationMenuVisible(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Submitting lecture form...', formData);
      
      // If no image is provided, use default image
      const finalFormData = {
        ...formData,
        image: formData.image || '/uploads/images/predavanjeslika.jpg',
        status: 'pending' // Always pending for mobile submissions
      };

      console.log('📤 Final form data:', finalFormData);

      let response;
      if (lecture) {
        response = await apiService.put(`lectures/${lecture._id}`, finalFormData);
        showSuccess('Predavanje uspješno ažurirano');
      } else {
        response = await apiService.post('lectures', finalFormData);
        showSuccess('Predavanje uspješno dodano');
      }

      console.log('✅ Lecture submitted successfully:', response);
      onSuccess(response);
      onDismiss();
    } catch (error) {
      console.error('❌ Error submitting lecture form:', error);
      const errorMessage = error.response?.data?.message || 
        `Greška pri ${lecture ? 'ažuriranju' : 'dodavanju'} predavanja`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('bs-BA');
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('bs-BA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSelectedDaijaName = () => {
    if (useCustomSpeaker) return formData.speaker || 'Unesi novog daiju';
    const selectedDaija = daije.find(d => d._id === formData.daijaId);
    return selectedDaija ? `${selectedDaija.title} ${selectedDaija.firstName}` : 'Odaberi daiju';
  };

  const getSelectedOrganizationName = () => {
    if (useCustomOrganization) return formData.organization || 'Unesi novo udruženje';
    if (!formData.organizationId) return 'Nije navedeno';
    const selectedOrg = organizations.find(o => o._id === formData.organizationId);
    return selectedOrg ? selectedOrg.name : 'Odaberi udruženje';
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
                  {lecture ? 'Uredi predavanje' : 'Dodaj ders'}
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
                    Slika predavanja
                  </Text>
                  <TouchableOpacity onPress={pickImage} style={{
                    borderWidth: 2,
                    borderColor: '#ccc',
                    borderStyle: 'dashed',
                    borderRadius: 8,
                    padding: 20,
                    alignItems: 'center',
                    marginBottom: 8,
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

                  {/* Upload restrictions info */}
                  <Card style={{ 
                    backgroundColor: '#f5f5f5', 
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#e0e0e0'
                  }}>
                    <Card.Content style={{ paddingVertical: 12 }}>
                      <Text variant="bodySmall" style={{ fontWeight: '500', marginBottom: 4 }}>
                        📋 Ograničenja uploada:
                      </Text>
                      <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                        • Maksimalna veličina: 5 MB{'\n'}
                        • Podržani formati: JPG, PNG, GIF, WebP
                      </Text>
                    </Card.Content>
                  </Card>

                  {/* Title */}
                  <TextInput
                    label="Naslov predavanja *"
                    value={formData.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                    mode="outlined"
                    style={{ marginBottom: 8 }}
                    maxLength={80}
                  />
                  <HelperText type="info" style={{ marginBottom: 16 }}>
                    {formData.title.length}/80 karaktera
                  </HelperText>

                  {/* Short Description */}
                  <TextInput
                    label="Kratki opis (neobavezno)"
                    value={formData.shortDescription}
                    onChangeText={(text) => handleInputChange('shortDescription', text)}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={{ marginBottom: 8 }}
                    maxLength={500}
                    placeholder="Kratki opis predavanja koji će se prikazivati na kartici..."
                  />
                  <HelperText type="info" style={{ marginBottom: 16 }}>
                    {formData.shortDescription.length}/500 karaktera
                  </HelperText>

                  {/* Speaker Selection */}
                  <Text variant="bodyMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Daija *
                  </Text>
                  <Menu
                    visible={daijaMenuVisible}
                    onDismiss={() => {
                      setDaijaMenuVisible(false);
                      setDaijaSearch(''); // Reset search when menu closes
                    }}
                    contentStyle={{ maxHeight: 400 }}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setDaijaMenuVisible(true)}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 4,
                          padding: 16,
                          marginBottom: 16,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Text>{getSelectedDaijaName()}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    }
                  >
                    <View style={{ padding: 8 }}>
                      <TextInput
                        label="Pretraži daije"
                        value={daijaSearch}
                        onChangeText={(text) => setDaijaSearch(text)}
                        mode="outlined"
                        style={{ marginBottom: 8 }}
                        autoFocus={false}
                        blurOnSubmit={false}
                      />
                    </View>
                    <Divider />
                    <ScrollView 
                      style={{ maxHeight: 250 }}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                    >
                      {Array.isArray(filteredDaije) && filteredDaije.map((daija) => (
                        <Menu.Item
                          key={daija._id}
                          onPress={() => {
                            handleDaijaSelect(daija);
                            setDaijaSearch(''); // Reset search when item selected
                          }}
                          title={`${daija.title} ${daija.firstName}`}
                        />
                      ))}
                    </ScrollView>
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        handleDaijaSelect('custom');
                        setDaijaSearch(''); // Reset search when custom selected
                      }}
                      title="➕ Upiši ime daije"
                    />
                  </Menu>

                  {useCustomSpeaker && (
                    <TextInput
                      label="Ime i prezime daije *"
                      value={formData.speaker}
                      onChangeText={(text) => handleInputChange('speaker', text)}
                      mode="outlined"
                      style={{ marginBottom: 16 }}
                    />
                  )}

                  {/* Organization Selection */}
                  <Text variant="bodyMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Udruženje
                  </Text>
                  <Menu
                    visible={organizationMenuVisible}
                    onDismiss={() => {
                      setOrganizationMenuVisible(false);
                      setOrganizationSearch(''); // Reset search when menu closes
                    }}
                    contentStyle={{ maxHeight: 400 }}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setOrganizationMenuVisible(true)}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 4,
                          padding: 16,
                          marginBottom: 16,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Text>{getSelectedOrganizationName()}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    }
                  >
                    <View style={{ padding: 8 }}>
                      <TextInput
                        label="Pretraži udruženja"
                        value={organizationSearch}
                        onChangeText={(text) => setOrganizationSearch(text)}
                        mode="outlined"
                        style={{ marginBottom: 8 }}
                        autoFocus={false}
                        blurOnSubmit={false}
                      />
                    </View>
                    <Divider />
                    <ScrollView 
                      style={{ maxHeight: 250 }}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                    >
                      <Menu.Item
                        onPress={() => {
                          handleOrganizationSelect(null);
                          setOrganizationSearch(''); // Reset search
                        }}
                        title="Nije navedeno"
                      />
                      {filteredOrganizations.map((org) => (
                        <Menu.Item
                          key={org._id}
                          onPress={() => {
                            handleOrganizationSelect(org);
                            setOrganizationSearch(''); // Reset search when item selected
                          }}
                          title={org.name}
                        />
                      ))}
                    </ScrollView>
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        handleOrganizationSelect('custom');
                        setOrganizationSearch(''); // Reset search when custom selected
                      }}
                      title="➕ Upiši ime udruženja"
                    />
                  </Menu>

                  {/* Date and Time */}
                  <Text variant="bodyMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Datum *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 4,
                      padding: 16,
                      marginBottom: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Text>{formData.date ? formatDate(selectedDate) : 'Odaberite datum'}</Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Time Selection */}
                  <Text variant="bodyMedium" style={{ marginBottom: 8, color: colors.text.primary }}>
                    Vrijeme *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 4,
                      padding: 16,
                      marginBottom: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Text>{formData.time ? formatTime(selectedTime) : 'Odaberite vrijeme'}</Text>
                    <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}

                  {/* Address and City */}
                  <TextInput
                    label="Adresa *"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    mode="outlined"
                    style={{ marginBottom: 8 }}
                    disabled={isOrganizationSelected}
                  />
                  {isOrganizationSelected && (
                    <HelperText type="info" style={{ marginBottom: 16 }}>
                      Adresa se automatski popunjava iz odabranog udruženja
                    </HelperText>
                  )}

                  <TextInput
                    label="Mjesto *"
                    value={formData.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                    mode="outlined"
                    style={{ marginBottom: 8 }}
                    disabled={isOrganizationSelected}
                  />
                  {isOrganizationSelected && (
                    <HelperText type="info" style={{ marginBottom: 16 }}>
                      Mjesto se automatski popunjava iz odabranog udruženja
                    </HelperText>
                  )}

                  {/* Custom organization name field */}
                  {useCustomOrganization && (
                    <TextInput
                      label="Naziv udruženja"
                      value={formData.organization}
                      onChangeText={(text) => handleInputChange('organization', text)}
                      mode="outlined"
                      style={{ marginBottom: 16 }}
                    />
                  )}

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
                      {lecture ? 'Osvježi' : 'Dodaj'}
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

export default LectureForm; 