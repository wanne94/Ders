import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal, Image,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isBefore,
    startOfDay,
} from 'date-fns';
import predavanjaService from '../../services/predavanjaService';
import daijeService from '../../services/daijeService';
import udruzenjaService from '../../services/udruzenjaService';
import { sortLecturers, sortAssociations } from '../../utils/sortingUtils';
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

const LectureForm = ({ onBack, onSuccess, editMode = false, editData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'dd.MM.yyyy'),
    time: '',
    address: '',
    city: '',
    speaker: '',
    daijaId: '',
    organization: '',
    organizationId: '',
    image: '',
    status: 'pending'
  });
  
  const [loading, setLoading] = useState(false);
  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [imageUri, setImageUri] = useState(null);
  
  // Calendar and time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const timeOptions = [
    { label: 'Odaberite vrijeme', value: '' },
    // Start from 12:00 (noon) - most common time for lectures
    { label: '12:00', value: '12:00' },
    { label: '12:15', value: '12:15' },
    { label: '12:30', value: '12:30' },
    { label: '12:45', value: '12:45' },
    { label: '13:00', value: '13:00' },
    { label: '13:15', value: '13:15' },
    { label: '13:30', value: '13:30' },
    { label: '13:45', value: '13:45' },
    { label: '14:00', value: '14:00' },
    { label: '14:15', value: '14:15' },
    { label: '14:30', value: '14:30' },
    { label: '14:45', value: '14:45' },
    { label: '15:00', value: '15:00' },
    { label: '15:15', value: '15:15' },
    { label: '15:30', value: '15:30' },
    { label: '15:45', value: '15:45' },
    { label: '16:00', value: '16:00' },
    { label: '16:15', value: '16:15' },
    { label: '16:30', value: '16:30' },
    { label: '16:45', value: '16:45' },
    { label: '17:00', value: '17:00' },
    { label: '17:15', value: '17:15' },
    { label: '17:30', value: '17:30' },
    { label: '17:45', value: '17:45' },
    { label: '18:00', value: '18:00' },
    { label: '18:15', value: '18:15' },
    { label: '18:30', value: '18:30' },
    { label: '18:45', value: '18:45' },
    { label: '19:00', value: '19:00' },
    { label: '19:15', value: '19:15' },
    { label: '19:30', value: '19:30' },
    { label: '19:45', value: '19:45' },
    { label: '20:00', value: '20:00' },
    { label: '20:15', value: '20:15' },
    { label: '20:30', value: '20:30' },
    { label: '20:45', value: '20:45' },
    { label: '21:00', value: '21:00' },
    { label: '21:15', value: '21:15' },
    { label: '21:30', value: '21:30' },
    { label: '21:45', value: '21:45' },
    { label: '22:00', value: '22:00' },
    { label: '22:15', value: '22:15' },
    { label: '22:30', value: '22:30' },
    { label: '22:45', value: '22:45' },
    { label: '23:00', value: '23:00' },
    { label: '23:15', value: '23:15' },
    { label: '23:30', value: '23:30' },
    { label: '23:45', value: '23:45' },
    // Morning times (less common for lectures)
    { label: '00:00', value: '00:00' },
    { label: '00:15', value: '00:15' },
    { label: '00:30', value: '00:30' },
    { label: '00:45', value: '00:45' },
    { label: '01:00', value: '01:00' },
    { label: '01:15', value: '01:15' },
    { label: '01:30', value: '01:30' },
    { label: '01:45', value: '01:45' },
    { label: '02:00', value: '02:00' },
    { label: '02:15', value: '02:15' },
    { label: '02:30', value: '02:30' },
    { label: '02:45', value: '02:45' },
    { label: '03:00', value: '03:00' },
    { label: '03:15', value: '03:15' },
    { label: '03:30', value: '03:30' },
    { label: '03:45', value: '03:45' },
    { label: '04:00', value: '04:00' },
    { label: '04:15', value: '04:15' },
    { label: '04:30', value: '04:30' },
    { label: '04:45', value: '04:45' },
    { label: '05:00', value: '05:00' },
    { label: '05:15', value: '05:15' },
    { label: '05:30', value: '05:30' },
    { label: '05:45', value: '05:45' },
    { label: '06:00', value: '06:00' },
    { label: '06:15', value: '06:15' },
    { label: '06:30', value: '06:30' },
    { label: '06:45', value: '06:45' },
    { label: '07:00', value: '07:00' },
    { label: '07:15', value: '07:15' },
    { label: '07:30', value: '07:30' },
    { label: '07:45', value: '07:45' },
    { label: '08:00', value: '08:00' },
    { label: '08:15', value: '08:15' },
    { label: '08:30', value: '08:30' },
    { label: '08:45', value: '08:45' },
    { label: '09:00', value: '09:00' },
    { label: '09:15', value: '09:15' },
    { label: '09:30', value: '09:30' },
    { label: '09:45', value: '09:45' },
    { label: '10:00', value: '10:00' },
    { label: '10:15', value: '10:15' },
    { label: '10:30', value: '10:30' },
    { label: '10:45', value: '10:45' },
    { label: '11:00', value: '11:00' },
    { label: '11:15', value: '11:15' },
    { label: '11:30', value: '11:30' },
    { label: '11:45', value: '11:45' }
  ];

  const loadData = async () => {
    try {
      const [daijeResponse, organizationsResponse, allLecturesResponse] = await Promise.all([
        daijeService.getAllDaije(),
        udruzenjaService.getAllUdruzenja(),
        predavanjaService.getAllPredavanja()
      ]);
      
      // Debug logs removed - data loading working correctly
      
      // Filter only approved items
      const approvedDaije = Array.isArray(daijeResponse) ? daijeResponse.filter(d => d.status === 'approved') : [];
      const approvedOrganizations = Array.isArray(organizationsResponse) ? organizationsResponse.filter(o => o.status === 'approved') : [];
      const allLectures = Array.isArray(allLecturesResponse) ? allLecturesResponse : [];
      
      // Apply centralized sorting - lecturers and associations with upcoming lectures first
      const sortedDaije = sortLecturers(approvedDaije, allLectures);
      const sortedOrganizations = sortAssociations(approvedOrganizations, allLectures);
      
      setDaije(sortedDaije);
      setOrganizations(sortedOrganizations);
    } catch (error) {
      console.error('Error loading data:', error);
      setDaije([]);
      setOrganizations([]);
    }
  };

  const populateFormWithEditData = useCallback(() => {
    if (!editData) return;
    
    setFormData({
      title: editData.title || '',
      description: editData.description || '',
      date: editData.date || format(new Date(), 'dd.MM.yyyy'),
      time: editData.time || '',
      address: editData.address || '',
      city: editData.city || '',
      speaker: editData.speaker || '',
      daijaId: editData.daijaId || '',
      organization: editData.organization || '',
      organizationId: editData.organizationId || '',
      image: editData.image || '',
      status: editData.status || 'pending'
    });

    // Set image URI if exists
    if (editData.image) {
      setImageUri(getImageUrl(editData.image));
    }

    // Set custom speaker/organization flags
    if (editData.speaker && !editData.daijaId) {
      setUseCustomSpeaker(true);
    }
    if (editData.organization && !editData.organizationId) {
      setUseCustomOrganization(true);
    }

    // Parse and set date
    if (editData.date) {
      try {
        // Handle different date formats
        let dateObj;
        if (editData.date.includes('.')) {
          // DD.MM.YYYY format
          const [day, month, year] = editData.date.split('.');
          dateObj = new Date(year, month - 1, day);
        } else {
          // ISO format or other
          dateObj = new Date(editData.date);
        }
        
        if (!isNaN(dateObj.getTime())) {
          setSelectedDate(dateObj);
          setCurrentMonth(dateObj);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
  }, [editData]);

  useEffect(() => {
    loadData();
    
    // If in edit mode, populate form with existing data
    if (editMode && editData) {
      populateFormWithEditData();
    }
  }, [editMode, editData, populateFormWithEditData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calendar functions

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      handleInputChange('date', format(selectedDate, 'dd.MM.yyyy'));
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Get the first Monday of the calendar view (might be in previous month)
    const startDate = new Date(monthStart);
    const dayOfWeek = monthStart.getDay();
    // Adjust to start from Monday (getDay() returns 0 for Sunday, 1 for Monday)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(monthStart.getDate() - daysToSubtract);
    
    // Get the last day to show (might be in next month)
    const endDate = new Date(monthEnd);
    const lastDayOfWeek = monthEnd.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(monthEnd.getDate() + daysToAdd);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const today = startOfDay(new Date());
    
    // Bosnian month names
    const bosnianMonths = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
      'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    
    const previousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };
    
    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={previousMonth} style={styles.calendarNavButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {bosnianMonths[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calendarNavButton}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarGrid}>
          {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
            <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
          ))}
          
          {days.map(day => {
            const dayStart = startOfDay(day);
            const isPastDate = isBefore(dayStart, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            // Only disable past dates when creating new lectures, not when editing
            const isDisabled = !isCurrentMonth || (!editMode && isPastDate);
            
            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[
                  styles.calendarDay,
                  isSelected && styles.calendarDaySelected,
                  isDisabled && styles.calendarDayDisabled
                ]}
                onPress={() => handleDateChange(null, day)}
                disabled={isDisabled}
              >
                <Text style={[
                  styles.calendarDayText,
                  isSelected && styles.calendarDayTextSelected,
                  isDisabled && styles.calendarDayTextDisabled
                ]}>
                  {format(day, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const handleDaijaSelect = (daijaId) => {
    if (daijaId === 'custom') {
      setUseCustomSpeaker(true);
      handleInputChange('daijaId', '');
      handleInputChange('speaker', '');
    } else if (daijaId === '') {
      setUseCustomSpeaker(false);
      handleInputChange('daijaId', '');
      handleInputChange('speaker', '');
    } else {
      setUseCustomSpeaker(false);
      const selectedDaija = daije.find(d => d._id === daijaId);
      handleInputChange('daijaId', daijaId);
      handleInputChange('speaker', selectedDaija ? `${selectedDaija.title} ${selectedDaija.name}` : '');
    }
  };

  const handleOrganizationSelect = (orgId) => {
    if (orgId === 'custom') {
      setUseCustomOrganization(true);
      handleInputChange('organizationId', '');
      handleInputChange('organization', '');
      handleInputChange('city', '');
      handleInputChange('address', '');
    } else if (orgId === '') {
      setUseCustomOrganization(false);
      handleInputChange('organizationId', '');
      handleInputChange('organization', '');
    } else {
      setUseCustomOrganization(false);
      const selectedOrg = organizations.find(o => o._id === orgId);
      handleInputChange('organizationId', orgId);
      handleInputChange('organization', selectedOrg ? selectedOrg.name : '');
      handleInputChange('city', selectedOrg ? selectedOrg.city || '' : '');
      handleInputChange('address', selectedOrg ? selectedOrg.address || '' : '');
    }
  };

  const validateDate = (dateString) => {
    if (!dateString || dateString.length !== 10) return false;
    
    const parts = dateString.split('.');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2024) return false;
    
    const date = new Date(year, month - 1, day);
    const isValidDate = date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    
    if (!isValidDate) return false;
    
    // Only check if the date is today or in the future when creating new lectures, not when editing
    if (!editMode) {
      const today = startOfDay(new Date());
      const selectedDate = startOfDay(date);
      return !isBefore(selectedDate, today);
    }
    
    // When editing, any valid date is acceptable
    return true;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Greška', 'Naslov predavanja je obavezan');
      return false;
    }
    if (!formData.date.trim()) {
      Alert.alert('Greška', 'Datum je obavezan');
      return false;
    }
    if (!validateDate(formData.date)) {
      const errorMessage = editMode ? 
        'Unesite valjan datum u formatu DD.MM.YYYY' : 
        'Unesite valjan datum (danas ili u budućnosti) u formatu DD.MM.YYYY';
      Alert.alert('Greška', errorMessage);
      return false;
    }
    if (!formData.time) {
      Alert.alert('Greška', 'Vrijeme je obavezno');
      return false;
    }
    if (!formData.speaker.trim() && !formData.daijaId) {
      Alert.alert('Greška', 'Daija je obavezan');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Greška', 'Adresa je obavezna');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Greška', 'Mjesto je obavezno');
      return false;
    }
    return true;
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!validateForm()) {
        return;
      }

      let imagePath = formData.image;

      // If we have a new image (local URI), upload it first
      if (imageUri && imageUri.startsWith('file://')) {
        try {
          const uploadResult = await uploadImage(imageUri);
          imagePath = uploadResult.path; // Extract just the path from the upload response
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Greška', 'Došlo je do greške prilikom uploada slike. Pokušajte ponovo.');
          return;
        }
      }

      // Convert date from DD.MM.YYYY to YYYY-MM-DD format
      let formattedDate = formData.date;
      if (formData.date && formData.date.includes('.')) {
        const [day, month, year] = formData.date.split('.');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Prepare final form data
      const finalFormData = {
        ...formData,
        image: imagePath,
        date: formattedDate
      };

      // Submit the form - either create or update
      if (editMode && editData?._id) {
        await predavanjaService.updateItem(editData._id, finalFormData);
        Alert.alert('Uspjeh', 'Uspješno ste ažurirali predavanje!');
      } else {
        await predavanjaService.createPredavanje(finalFormData);
        Alert.alert('Uspjeh', 'Uspješno ste dodali predavanje!');
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Clear form only if not in edit mode
      if (!editMode) {
        setFormData({
          title: '',
          description: '',
          date: format(new Date(), 'dd.MM.yyyy'),
          time: '',
          address: '',
          city: '',
          speaker: '',
          daijaId: '',
          organization: '',
          organizationId: '',
          image: '',
          status: 'pending'
        });
        setImageUri(null);
        setSelectedDate(new Date());
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

  const renderDropdown = (label, selectedValue, onValueChange, items, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          mode="dropdown"
          itemStyle={styles.pickerItem}
        >
          {items.map((item, index) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup galeriji slika.');
        return;
      }

      // Launch image picker directly
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        // Don't set image in formData yet - it will be set after upload
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom odabira slike.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
    handleInputChange('image', '');
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
        <Text style={styles.headerTitle}>{editMode ? 'Uredi Ders' : 'Dodaj Ders'}</Text>
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
          <Text style={styles.inputLabel}>Slika predavanja (neobavezno)</Text>
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
                <Ionicons name="image-outline" size={48} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Dodaj sliku</Text>
                <Text style={styles.imagePickerSubtext}>Kliknite za odabir iz galerije</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {renderInput('Naslov predavanja', 'title', 'Unesite naslov...', false, true)}
        {renderInput('Opis predavanja (neobavezno)', 'description', 'Unesite opis...', true)}
        
        {/* Date Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Datum <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, !formData.date && styles.placeholderText]}>
              {formData.date || 'Odaberite datum'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Time Picker */}
        {renderDropdown(
          'Vrijeme',
          formData.time,
          (value) => handleInputChange('time', value),
          timeOptions,
          true
        )}

        {/* Speaker Dropdown */}
        {renderDropdown(
          'Daija',
          useCustomSpeaker ? 'custom' : formData.daijaId,
          handleDaijaSelect,
          [
            { label: 'Odaberite daiju', value: '' },
            ...daije.map(daija => ({
              label: `${daija.title} ${daija.name}`,
              value: daija._id
            })),
            { label: '➕ Unesi ručno ime daije', value: 'custom' }
          ],
          true
        )}

        {useCustomSpeaker && renderInput('Ime daije', 'speaker', 'Unesite ime i prezime...', false, true)}

        {/* Organization Dropdown */}
        {renderDropdown(
          'Udruženje',
          useCustomOrganization ? 'custom' : formData.organizationId,
          handleOrganizationSelect,
          [
            { label: 'Nije navedeno', value: '' },
            ...organizations.map(org => ({
              label: org.name,
              value: org._id
            })),
            { label: '➕ Unesi ručno naziv udruženja', value: 'custom' }
          ]
        )}

        {useCustomOrganization && renderInput('Naziv udruženja', 'organization', 'Unesite naziv...', false, true)}

        {renderInput('Adresa', 'address', 'Unesite adresu...', false, true)}
        {renderInput('Mjesto', 'city', 'Unesite mjesto...', false, true)}

        {/* Padding for sticky button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Odaberite datum</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {renderCalendar()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
              : (editMode ? 'Ažuriraj Ders' : 'Dodaj Ders')
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
    height: 100, // Space for sticky button
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  pickerItem: {
    // Add any custom styles for picker items if needed
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  // Calendar styles
  calendar: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray,
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 5,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  calendarDayTextDisabled: {
    color: COLORS.gray,
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePreview: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
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
});

export default LectureForm; 