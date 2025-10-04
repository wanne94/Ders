import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    Modal,
    Image,
    FlatList,
    Dimensions,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isBefore,
    startOfDay,
    parse
} from 'date-fns';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';
import uploadService from '../services/uploadService';
import { getApiUrl } from '../config';
import IOSCompatibleDropdown from '../components/IOSCompatibleDropdown';

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

const AddContentScreen = ({ onBack }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [education, setEducation] = useState([]);
  const [educationInput, setEducationInput] = useState('');
  const [showSeminarOptions, setShowSeminarOptions] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [approvalSettings, setApprovalSettings] = useState({
    lecture: true,
    daija: true,
    organization: true
  });
  
  // Calendar state for end date
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Multiple speakers state
  const [selectedDaije, setSelectedDaije] = useState([]);
  const [customSpeakers, setCustomSpeakers] = useState([]);
  const [showCustomSpeakerInput, setShowCustomSpeakerInput] = useState(false);
  const [customSpeakerInput, setCustomSpeakerInput] = useState('');
  const [showWeeklyOptions, setShowWeeklyOptions] = useState(false);

  useEffect(() => {
    const fetchApprovalSettings = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/settings/public`);
        const data = await response.json();
        if (data?.approvalSettings) {
          setApprovalSettings(prev => ({
            ...prev,
            ...data.approvalSettings
          }));
        }
      } catch (error) {
        console.error('Error fetching approval settings:', error);
      }
    };

    fetchApprovalSettings();
  }, []);

  const contentTypes = [
    {
      id: 'lecture',
      title: 'Dodaj Ders',
      description: 'Objavi novi Ders',
      icon: 'book-outline',
      color: COLORS.primary
    },
    {
      id: 'daija',
      title: 'Dodaj Daiju',
      description: 'Dodaj novog daiju',
      icon: 'person-outline',
      color: COLORS.secondary
    },
    {
      id: 'organization',
      title: 'Dodaj Udruženje',
      description: 'Registruj novo udruženje',
      icon: 'business-outline',
      color: COLORS.success
    }
  ];

  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const titles = [
    { value: 'prof', label: 'Prof.' },
    { value: 'mr', label: 'Mr.' },
    { value: 'dr', label: 'Dr.' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [daijeResponse, organizationsResponse] = await Promise.all([
        daijeService.getAllDaije(),
        udruzenjaService.getAllUdruzenja()
      ]);
      
      // Check if response is array or has data property
      const daijeData = Array.isArray(daijeResponse) ? daijeResponse : (daijeResponse.data || []);
      const orgsData = Array.isArray(organizationsResponse) ? organizationsResponse : (organizationsResponse.data || []);
      
      console.log('📚 Loaded daije:', daijeData.length, 'items');
      console.log('🏢 Loaded organizations:', orgsData.length, 'items');
      
      setDaije(daijeData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const pickImageFromGallery = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Greška', 'Potrebna je dozvola za pristup galeriji');
      return;
    }

    // Open gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageFile(asset);
      setImagePreview(asset.uri);
    }
  };

  const initializeFormData = (type) => {
    switch (type) {
      case 'lecture':
        return {
          title: '',
          description: '',
          date: '',
          time: '',
          address: '',
          city: '',
          speaker: '',
          daijaId: '',
          daijaIds: [],
          customSpeakers: [],
          organization: '',
          organizationId: '',
          isSeminar: false,
          endDate: '',
          isWeeklyLecture: false,
          totalWeeks: 4
        };
      case 'daija':
        return {
          name: '',
          title: 'prof',
          biography: '',
          status: approvalSettings.daija ? 'approved' : 'pending'
        };
      case 'organization':
        return {
          name: '',
          description: '',
          address: '',
          city: '',
          facebook: '',
          instagram: '',
          telegram: '',
          viber: '',
          status: approvalSettings.organization ? 'approved' : 'pending'
        };
      default:
        return {};
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData(initializeFormData(type));
    setEducation([]);
    setEducationInput('');
    setShowSeminarOptions(false);
    setImageFile(null);
    setImagePreview(null);
    setSelectedDaije([]);
    setCustomSpeakers([]);
    setShowCustomSpeakerInput(false);
    setCustomSpeakerInput('');
    setShowWeeklyOptions(false);
  };

  useEffect(() => {
    if (!selectedType) return;

    if (selectedType === 'daija') {
      setFormData(prev => ({
        ...prev,
        status: approvalSettings.daija ? 'approved' : 'pending'
      }));
    } else if (selectedType === 'organization') {
      setFormData(prev => ({
        ...prev,
        status: approvalSettings.organization ? 'approved' : 'pending'
      }));
    }
  }, [approvalSettings, selectedType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const addEducation = () => {
    if (educationInput.trim()) {
      setEducation(prev => [...prev, educationInput.trim()]);
      setEducationInput('');
    }
  };

  const removeEducation = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  // Funkcije za upravljanje sa više predavača
  const addDaija = (daijaId) => {
    const daija = daije.find(d => d._id === daijaId);
    if (daija && !selectedDaije.find(d => d._id === daijaId)) {
      setSelectedDaije(prev => [...prev, daija]);
      setFormData(prev => ({
        ...prev,
        daijaIds: [...prev.daijaIds, daijaId]
      }));
    }
  };

  const removeDaija = (daijaId) => {
    setSelectedDaije(prev => prev.filter(d => d._id !== daijaId));
    setFormData(prev => ({
      ...prev,
      daijaIds: prev.daijaIds.filter(id => id !== daijaId)
    }));
  };

  const addCustomSpeaker = () => {
    if (customSpeakerInput.trim()) {
      setCustomSpeakers(prev => [...prev, customSpeakerInput.trim()]);
      setFormData(prev => ({
        ...prev,
        customSpeakers: [...prev.customSpeakers, customSpeakerInput.trim()]
      }));
      setCustomSpeakerInput('');
      setShowCustomSpeakerInput(false);
    }
  };

  const removeCustomSpeaker = (index) => {
    setCustomSpeakers(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      customSpeakers: prev.customSpeakers.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = [];

    switch (selectedType) {
      case 'lecture':
        if (!formData.title?.trim()) errors.push('Naslov je obavezan');
        if (!formData.date) {
          errors.push('Datum je obavezan');
        } else {
          // Validate date format DD.MM.YYYY
          const dateRegex = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
          if (!dateRegex.test(formData.date)) {
            errors.push('Datum mora biti u formatu DD.MM.YYYY');
          } else {
            const dateParts = formData.date.split('.');
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]);
            const year = parseInt(dateParts[2]);
            
            if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2024) {
              errors.push('Unesite valjan datum');
            }
          }
        }
        
        // Validacija za seminare
        if (showSeminarOptions) {
          if (!formData.endDate) {
            errors.push('Datum završetka je obavezan za seminare');
          } else {
            const dateRegex = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
            if (!dateRegex.test(formData.endDate)) {
              errors.push('Datum završetka mora biti u formatu DD.MM.YYYY');
            }
          }
        }
        
        if (!formData.time) errors.push('Vrijeme je obavezno');
        if (!formData.address?.trim()) errors.push('Adresa je obavezna');
        if (!formData.city?.trim()) errors.push('Grad je obavezan');
        
        // Provjeri da li ima bar jednog predavača
        if ((!formData.daijaIds || formData.daijaIds.length === 0) && 
            (!formData.customSpeakers || formData.customSpeakers.length === 0)) {
          errors.push('Morate dodati bar jednog predavača');
        }
        break;
      case 'daija':
        if (!formData.firstName?.trim()) errors.push('Ime je obavezno');
        if (!formData.biography?.trim()) errors.push('Biografija je obavezna');
        break;
      case 'organization':
        if (!formData.name?.trim()) errors.push('Naziv je obavezan');
        if (!formData.description?.trim()) errors.push('Opis je obavezan');
        if (!formData.city?.trim()) errors.push('Grad je obavezan');
        break;
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Greška', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      let response;
      const submitData = { ...formData };
      
      // Upload image if selected
      if (imageFile) {
        try {
          const uploadResult = await uploadService.uploadImage(imageFile);
          if (uploadResult && uploadResult.path) {
            submitData.image = uploadResult.path;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Greška', 'Greška pri učitavanju slike');
          setLoading(false);
          return;
        }
      }

      switch (selectedType) {
        case 'lecture':
          // Format date for API - convert DD.MM.YYYY to YYYY-MM-DD
          if (submitData.date) {
            const dateParts = submitData.date.split('.');
            if (dateParts.length === 3) {
              const day = dateParts[0].padStart(2, '0');
              const month = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              submitData.date = `${year}-${month}-${day}`;
            }
          }
          
          // Format endDate for seminars
          if (showSeminarOptions && submitData.endDate) {
            const dateParts = submitData.endDate.split('.');
            if (dateParts.length === 3) {
              const day = dateParts[0].padStart(2, '0');
              const month = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              submitData.endDate = `${year}-${month}-${day}`;
            }
            submitData.isSeminar = true;
            submitData.seminarTheme = submitData.title; // Tema se uzima iz naslova
            submitData.totalDays = calculateSeminarDays(formData.date, formData.endDate);
          }
          
          // Pripremi podatke za više predavača
          submitData.daijaIds = formData.daijaIds;
          submitData.customSpeakers = formData.customSpeakers;
          
          // Za kompatibilnost sa starim kodom
          if (formData.daijaIds.length > 0) {
            submitData.daijaId = formData.daijaIds[0];
            submitData.daija = formData.daijaIds[0];
          }
          if (formData.customSpeakers.length > 0) {
            submitData.speaker = formData.customSpeakers.join(', ');
          }
          
          // Dodaj podatke za sedmična predavanja
          if (showWeeklyOptions) {
            submitData.isWeeklyLecture = true;
            submitData.totalWeeks = formData.totalWeeks || 4;
          }
          
          response = await predavanjaService.createPredavanje(submitData);
          break;
        case 'daija':
          // Add education and map firstName to name
          submitData.education = education;
          submitData.name = submitData.firstName;
          delete submitData.firstName;
          response = await daijeService.createDaija(submitData);
          break;
        case 'organization':
          response = await udruzenjaService.createUdruzenje(submitData);
          break;
      }

      Alert.alert(
        'Uspjeh',
        `${getTypeDisplayName()} je uspješno ${selectedType === 'lecture' ? 'dodano' : selectedType === 'daija' ? 'dodana' : 'dodano'} i čeka odobrenje.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedType(null);
              setFormData({});
              // Call onBack to refresh dashboard data
              if (onBack) {
                onBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Greška', error.response?.data?.message || 'Došlo je do greške');
    } finally {
      setLoading(false);
    }
  };

  const getTypeDisplayName = () => {
    switch (selectedType) {
      case 'lecture': return 'Predavanje';
      case 'daija': return 'Daija';
      case 'organization': return 'Udruženje';
      default: return '';
    }
  };

  const renderTypeSelection = () => (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onBack}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dodaj sadržaj</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onBack}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {contentTypes.map((type, index) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.listItem,
                  index === contentTypes.length - 1 && styles.lastListItem
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <View style={styles.listItemIcon}>
                  <Ionicons name={type.icon} size={20} color={type.color} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{type.title}</Text>
                  <Text style={styles.listItemDescription}>{type.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderInput = (label, field, placeholder, multiline = false, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field] || ''}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleEndDateSelect = (date) => {
    setSelectedEndDate(date);
    const formattedDate = formatDateForDisplay(date);
    handleInputChange('endDate', formattedDate);
    setShowEndDatePicker(false);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Get the first Monday of the calendar view
    const startDate = new Date(monthStart);
    const dayOfWeek = monthStart.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(monthStart.getDate() - daysToSubtract);
    
    // Get the last day to show
    const endDate = new Date(monthEnd);
    const lastDayOfWeek = monthEnd.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(monthEnd.getDate() + daysToAdd);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const today = startOfDay(new Date());
    
    // Parse start date if available
    let minDate = today;
    if (formData.date) {
      try {
        const parsedDate = parse(formData.date, 'dd.MM.yyyy', new Date());
        if (!isNaN(parsedDate)) {
          minDate = parsedDate;
        }
      } catch (e) {
        // Keep today as minimum
      }
    }
    
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
            const isPastDate = isBefore(dayStart, minDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedEndDate);
            const isDisabled = !isCurrentMonth || isPastDate;
            
            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[
                  styles.calendarDay,
                  isSelected && styles.calendarDaySelected,
                  isDisabled && styles.calendarDayDisabled
                ]}
                onPress={() => handleEndDateSelect(day)}
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

  const renderEndDatePicker = (label, field, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowEndDatePicker(true)}
      >
        <Text style={[styles.datePickerText, !formData[field] && styles.placeholderText]}>
          {formData[field] || 'Izaberite datum završetka'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );


  const renderLectureForm = () => {
    console.log('🎯 Rendering lecture form with:', {
      daijeCount: daije.length,
      orgsCount: organizations.length,
      timeOptions: timeOptions.length
    });
    
    return (
    <ScrollView style={styles.formContainer}>
      {renderInput('Naslov predavanja', 'title', 'Unesite naslov...', false, true)}
      {renderInput('Opis predavanja', 'description', 'Unesite opis...')}
      
      {/* Image Selection Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Slika predavanja</Text>
        
        {/* Show selected image preview */}
        {imagePreview && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: imagePreview }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Button to pick image from gallery */}
        {!imagePreview && (
          <TouchableOpacity 
            style={styles.selectImageButton}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="images-outline" size={24} color={COLORS.primary} />
            <Text style={styles.selectImageButtonText}>Dodaj sliku iz galerije</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {renderInput('Datum', 'date', 'DD.MM.YYYY (npr. 15.06.2024)', false, true)}

      {/* Time Picker */}
      <IOSCompatibleDropdown
        label="Vrijeme"
        items={timeOptions.map(time => ({ label: time, value: time }))}
        value={formData.time}
        onChangeValue={(value) => handleInputChange('time', value)}
        placeholder="Odaberite vrijeme"
        required={true}
        searchable={true}
      />

      {/* Multiple Speakers Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Daije / Predavači <Text style={styles.required}>*</Text>
        </Text>
        
        {/* List of selected speakers */}
        {(selectedDaije.length > 0 || customSpeakers.length > 0) && (
          <View style={styles.speakersListContainer}>
            {selectedDaije.map((daija) => (
              <View key={daija._id} style={styles.speakerItem}>
                <Text style={styles.speakerText}>
                  {daija.title} {daija.name}
                </Text>
                <TouchableOpacity onPress={() => removeDaija(daija._id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {customSpeakers.map((speaker, index) => (
              <View key={`custom-${index}`} style={styles.speakerItem}>
                <Text style={styles.speakerText}>{speaker}</Text>
                <TouchableOpacity onPress={() => removeCustomSpeaker(index)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {/* Add speaker dropdown or input */}
        {!showCustomSpeakerInput ? (
          <IOSCompatibleDropdown
            label=""
            items={[
              ...daije
                .filter(d => !selectedDaije.find(sd => sd._id === d._id))
                .map(daija => ({ 
                  label: `${daija.title} ${daija.name}`, 
                  value: daija._id 
                })),
              { label: '➕ Unesi prilagođeno ime...', value: 'custom' }
            ]}
            value=""
            onChangeValue={(value) => {
              if (value === 'custom') {
                setShowCustomSpeakerInput(true);
              } else if (value) {
                addDaija(value);
              }
            }}
            placeholder="Dodaj predavača..."
            searchable={true}
          />
        ) : (
          <View style={styles.customInputContainer}>
            <TextInput
              style={[styles.input, styles.customInput]}
              value={customSpeakerInput}
              onChangeText={setCustomSpeakerInput}
              placeholder="Unesite ime predavača..."
              placeholderTextColor={COLORS.gray}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCustomSpeaker}>
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: COLORS.gray }]} 
              onPress={() => {
                setShowCustomSpeakerInput(false);
                setCustomSpeakerInput('');
              }}
            >
              <Ionicons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Organization Selection */}
      <IOSCompatibleDropdown
        label="Udruženje"
        items={[
          { label: 'Nije navedeno', value: '' },
          ...organizations.map(org => ({ 
            label: org.name, 
            value: org._id 
          }))
        ]}
        value={formData.organizationId}
        onChangeValue={(value) => {
          handleInputChange('organizationId', value);
          if (value) {
            const selectedOrg = organizations.find(o => o._id === value);
            if (selectedOrg) {
              handleInputChange('organization', selectedOrg.name);
              if (selectedOrg.city) handleInputChange('city', selectedOrg.city);
              if (selectedOrg.address) handleInputChange('address', selectedOrg.address);
            }
          } else {
            handleInputChange('organization', '');
          }
        }}
        placeholder="Odaberite udruženje"
        searchable={true}
      />

      {renderInput('Adresa', 'address', 'Unesite adresu...', false, true)}
      {renderInput('mjesto', 'city', 'Unesite mjesto...', false, true)}
      
      {/* Weekly Lecture Options */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            if (!showSeminarOptions) {
              setShowWeeklyOptions(!showWeeklyOptions);
              handleInputChange('isWeeklyLecture', !showWeeklyOptions);
            }
          }}
        >
          <View style={[
            styles.checkbox, 
            showWeeklyOptions && styles.checkboxChecked,
            showSeminarOptions && styles.checkboxDisabled
          ]}>
            {showWeeklyOptions && (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={[
            styles.checkboxLabel,
            showSeminarOptions && styles.checkboxLabelDisabled
          ]}>
            Sedmično predavanje (ponavlja se svake sedmice)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Options */}
      {showWeeklyOptions && (
        <View style={styles.weeklyContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Broj sedmica</Text>
            <TextInput
              style={styles.input}
              value={formData.totalWeeks?.toString() || ''}
              onChangeText={(value) => {
                const num = parseInt(value) || 0;
                if (num >= 1 && num <= 52) {
                  handleInputChange('totalWeeks', num);
                }
              }}
              placeholder="4"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.helperText}>
              Predavanje će se ponavljati {formData.totalWeeks || 4} sedmica{formData.totalWeeks === 1 ? 'u' : formData.totalWeeks < 5 ? 'e' : 'a'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Seminar Options */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            if (!showWeeklyOptions) {
              setShowSeminarOptions(!showSeminarOptions);
              handleInputChange('isSeminar', !showSeminarOptions);
            }
          }}
        >
          <View style={[
            styles.checkbox, 
            showSeminarOptions && styles.checkboxChecked,
            showWeeklyOptions && styles.checkboxDisabled
          ]}>
            {showSeminarOptions && (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={[
            styles.checkboxLabel,
            showWeeklyOptions && styles.checkboxLabelDisabled
          ]}>
            Seminar (događaj koji traje više dana)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Seminar End Date */}
      {showSeminarOptions && (
        <View style={styles.seminarContainer}>
          <Text style={styles.seminarTitle}>
            <Ionicons name="school-outline" size={18} color={COLORS.warning} />
            {' '}Opcije seminara
          </Text>
          
          {renderEndDatePicker('Datum završetka', 'endDate', true)}
          
          {formData.date && formData.endDate && (
            <View style={styles.durationInfo}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.durationText}>
                Trajanje seminara: {calculateSeminarDays(formData.date, formData.endDate)} {
                  calculateSeminarDays(formData.date, formData.endDate) === 1 ? 'dan' : 
                  calculateSeminarDays(formData.date, formData.endDate) < 5 ? 'dana' : 'dana'
                }
              </Text>
            </View>
          )}
          
          <View style={styles.seminarNote}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.gray} />
            <Text style={styles.seminarNoteText}>
              Tema seminara će biti preuzeta iz naslova predavanja
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
  };
  
  const calculateSeminarDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const parseDate = (dateStr) => {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return null;
    };
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (start && end) {
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const renderDaijaForm = () => (
    <ScrollView style={styles.formContainer}>
      {renderInput('Ime i prezime', 'firstName', 'Unesite ime i prezime...', false, true)}
      
      {/* Title Selection */}
      <IOSCompatibleDropdown
        label="Titula"
        items={titles.map(title => ({ label: title.label, value: title.value }))}
        value={formData.title}
        onChangeValue={(value) => handleInputChange('title', value)}
        placeholder="Odaberite titulu"
        required={true}
      />
      
      {renderInput('Biografija', 'biography', 'Unesite biografiju...', true, true)}
      
      {/* Education Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Obrazovanje</Text>
        <View style={styles.educationInputContainer}>
          <TextInput
            style={[styles.input, styles.educationInput]}
            value={educationInput}
            onChangeText={setEducationInput}
            placeholder="Dodaj obrazovanje..."
            placeholderTextColor={COLORS.gray}
          />
          <TouchableOpacity style={styles.addButton} onPress={addEducation}>
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {education.map((item, index) => (
          <View key={index} style={styles.educationItem}>
            <Text style={styles.educationText}>{item}</Text>
            <TouchableOpacity onPress={() => removeEducation(index)}>
              <Ionicons name="close" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderOrganizationForm = () => (
    <ScrollView style={styles.formContainer}>
      {renderInput('Naziv udruženja', 'name', 'Unesite naziv...', false, true)}
      {renderInput('Opis udruženja', 'description', 'Unesite opis...', true, true)}
      {renderInput('Adresa', 'address', 'Unesite adresu...')}
      {renderInput('mjesto', 'city', 'Unesite mjesto...', false, true)}
      {renderInput('Facebook', 'facebook', 'https://facebook.com/...')}
      {renderInput('Instagram', 'instagram', 'https://instagram.com/...')}
      {renderInput('Telegram', 'telegram', 'https://t.me/...')}
      {renderInput('Viber', 'viber', '+387...')}
    </ScrollView>
  );

  const renderForm = () => {
    switch (selectedType) {
      case 'lecture': return renderLectureForm();
      case 'daija': return renderDaijaForm();
      case 'organization': return renderOrganizationForm();
      default: return null;
    }
  };


  if (!selectedType) {
    return renderTypeSelection();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedType(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTypeDisplayName()}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form */}
      {renderForm()}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Objavi</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* End Date Calendar Modal */}
      <Modal
        visible={showEndDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEndDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Odaberite datum završetka</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(false)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  listItemDescription: {
    fontSize: 14,
    color: COLORS.gray,
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
    padding: 16,
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
    color: COLORS.primary,
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
  educationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  educationInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  educationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
  },
  submitContainer: {
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
  checkboxContainer: {
    marginVertical: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  checkboxDisabled: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
  },
  checkboxLabelDisabled: {
    color: COLORS.gray,
  },
  weeklyContainer: {
    marginBottom: 16,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  seminarContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  seminarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  seminarNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  seminarNoteText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
    flex: 1,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  durationText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Image selection styles
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    backgroundColor: COLORS.lightGray,
  },
  selectImageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 4,
  },
  
  // Multiple speakers styles
  speakersListContainer: {
    marginBottom: 12,
  },
  speakerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  speakerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  // Calendar styles
  calendar: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarNavButton: {
    padding: 4,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  calendarDayTextDisabled: {
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    paddingBottom: 20,
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
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
});

export default AddContentScreen;
