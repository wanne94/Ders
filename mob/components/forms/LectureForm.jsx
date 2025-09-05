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
    TouchableWithoutFeedback,
    SafeAreaView,
    StatusBar
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import IOSCompatibleDropdown from '../IOSCompatibleDropdown';
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
import { formatDaijaTitle } from '../../utils';
import { sortLecturers, sortAssociations } from '../../utils/sortingUtils';
import Toast from '../Toast';
import { uploadImage, getImageUrl } from '../../utils/imageUtils';
import ImagePickerWithGallery from '../ImagePickerWithGallery';
import { isAuthenticated as checkIsAuthenticated } from '../../utils/authHelpers';

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
    date: format(new Date(), 'dd.MM.yyyy'),
    time: '',
    address: '',
    city: '',
    speaker: '',
    daijaId: '',
    organization: '',
    organizationId: '',
    image: '',
    isWeeklyLecture: false,
    totalWeeks: 2,
    // Seminar fields
    isSeminar: false,
    endDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [imageUri, setImageUri] = useState(null);
  
  // Separate state for picker selected values to ensure proper updates
  const [selectedDaijaId, setSelectedDaijaId] = useState('');
  
  // Calendar and time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTimeValue, setTempTimeValue] = useState('');
  
  // Seminar states
  const [showSeminarOptions, setShowSeminarOptions] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [currentEndMonth, setCurrentEndMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');

  // Hardcoded time options with 15-minute intervals (same as web version)
  const timeOptions = [
    { label: 'Odaberite vrijeme', value: '' },
    { label: '06:00', value: '06:00' }, { label: '06:15', value: '06:15' }, { label: '06:30', value: '06:30' }, { label: '06:45', value: '06:45' },
    { label: '07:00', value: '07:00' }, { label: '07:15', value: '07:15' }, { label: '07:30', value: '07:30' }, { label: '07:45', value: '07:45' },
    { label: '08:00', value: '08:00' }, { label: '08:15', value: '08:15' }, { label: '08:30', value: '08:30' }, { label: '08:45', value: '08:45' },
    { label: '09:00', value: '09:00' }, { label: '09:15', value: '09:15' }, { label: '09:30', value: '09:30' }, { label: '09:45', value: '09:45' },
    { label: '10:00', value: '10:00' }, { label: '10:15', value: '10:15' }, { label: '10:30', value: '10:30' }, { label: '10:45', value: '10:45' },
    { label: '11:00', value: '11:00' }, { label: '11:15', value: '11:15' }, { label: '11:30', value: '11:30' }, { label: '11:45', value: '11:45' },
    { label: '12:00', value: '12:00' }, { label: '12:15', value: '12:15' }, { label: '12:30', value: '12:30' }, { label: '12:45', value: '12:45' },
    { label: '13:00', value: '13:00' }, { label: '13:15', value: '13:15' }, { label: '13:30', value: '13:30' }, { label: '13:45', value: '13:45' },
    { label: '14:00', value: '14:00' }, { label: '14:15', value: '14:15' }, { label: '14:30', value: '14:30' }, { label: '14:45', value: '14:45' },
    { label: '15:00', value: '15:00' }, { label: '15:15', value: '15:15' }, { label: '15:30', value: '15:30' }, { label: '15:45', value: '15:45' },
    { label: '16:00', value: '16:00' }, { label: '16:15', value: '16:15' }, { label: '16:30', value: '16:30' }, { label: '16:45', value: '16:45' },
    { label: '17:00', value: '17:00' }, { label: '17:15', value: '17:15' }, { label: '17:30', value: '17:30' }, { label: '17:45', value: '17:45' },
    { label: '18:00', value: '18:00' }, { label: '18:15', value: '18:15' }, { label: '18:30', value: '18:30' }, { label: '18:45', value: '18:45' },
    { label: '19:00', value: '19:00' }, { label: '19:15', value: '19:15' }, { label: '19:30', value: '19:30' }, { label: '19:45', value: '19:45' },
    { label: '20:00', value: '20:00' }, { label: '20:15', value: '20:15' }, { label: '20:30', value: '20:30' }, { label: '20:45', value: '20:45' },
    { label: '21:00', value: '21:00' }, { label: '21:15', value: '21:15' }, { label: '21:30', value: '21:30' }, { label: '21:45', value: '21:45' },
    { label: '22:00', value: '22:00' }, { label: '22:15', value: '22:15' }, { label: '22:30', value: '22:30' }, { label: '22:45', value: '22:45' },
    { label: '23:00', value: '23:00' }, { label: '23:15', value: '23:15' }, { label: '23:30', value: '23:30' }, { label: '23:45', value: '23:45' }
  ];

  const loadData = async () => {
    try {
      console.log('🔄 LectureForm - Starting data load...');
      // Load basic data first
      const [daijeResponse, organizationsResponse, allLecturesResponse] = await Promise.all([
        daijeService.getAllDaije(),
        udruzenjaService.getAllUdruzenja(),
        predavanjaService.getAllPredavanja()
      ]);
      
      console.log('✅ LectureForm - Raw responses:', {
        daije: daijeResponse,
        organizations: organizationsResponse,
        lectures: allLecturesResponse
      });
      
      // Filter only approved items
      const approvedDaije = Array.isArray(daijeResponse) ? daijeResponse.filter(d => d.status === 'approved') : [];
      const approvedOrganizations = Array.isArray(organizationsResponse) ? organizationsResponse.filter(o => o.status === 'approved') : [];
      const allLectures = Array.isArray(allLecturesResponse) ? allLecturesResponse : [];
      
      // Apply centralized sorting - lecturers and associations with upcoming lectures first
      const sortedDaije = sortLecturers(approvedDaije, allLectures);
      const sortedOrganizations = sortAssociations(approvedOrganizations, allLectures);
      
      console.log('📚 LectureForm - Loaded daije:', sortedDaije.length, 'items');
      console.log('🏢 LectureForm - Loaded organizations:', sortedOrganizations.length, 'items');
      
      setDaije(sortedDaije);
      setOrganizations(sortedOrganizations);
      console.log('✅ LectureForm - Data set successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setDaije([]);
      setOrganizations([]);
    }
  };

  const populateFormWithEditData = useCallback(() => {
    if (!editData) return;
    
    setFormData({
      title: editData.title || '',
      date: editData.date || format(new Date(), 'dd.MM.yyyy'),
      time: editData.time || '',
      address: editData.address || '',
      city: editData.city || '',
      speaker: editData.speaker || '',
      daijaId: editData.daijaId || '',
      organization: editData.organization || '',
      organizationId: editData.organizationId || '',
      image: editData.image || '',
      isWeeklyLecture: editData.isWeeklyLecture || false,
      totalWeeks: editData.totalWeeks || 2,
      isSeminar: editData.isSeminar || false,
      endDate: editData.endDate ? format(new Date(editData.endDate), 'dd.MM.yyyy') : ''
    });

    // Set image URI if exists
    if (editData.image) {
      setImageUri(getImageUrl(editData.image));
    }
    
    // Set seminar options
    setShowSeminarOptions(editData.isSeminar || false);
    
    // Parse end date if exists
    if (editData.endDate) {
      try {
        let endDateObj;
        if (editData.endDate.includes('.')) {
          const [day, month, year] = editData.endDate.split('.');
          endDateObj = new Date(year, month - 1, day);
        } else {
          endDateObj = new Date(editData.endDate);
        }
        setSelectedEndDate(endDateObj);
      } catch (e) {
        console.error('Error parsing end date:', e);
      }
    }

    // Set custom speaker/organization flags and picker values
    if (editData.speaker && !editData.daijaId) {
      setUseCustomSpeaker(true);
      setSelectedDaijaId('custom');
    } else if (editData.daijaId) {
      setSelectedDaijaId(editData.daijaId);
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
  
  const handleEndDateChange = (event, selectedDate) => {
    // Ne zatvarati modal automatski - čeka se klik na dugme Potvrdi
    if (selectedDate) {
      setSelectedEndDate(selectedDate);
    }
  };
  
  const confirmEndDate = () => {
    setShowEndDatePicker(false);
    handleInputChange('endDate', format(selectedEndDate, 'dd.MM.yyyy'));
  };
  
  const confirmTime = () => {
    setShowTimePicker(false);
    if (selectedTime) {
      handleInputChange('time', selectedTime);
    }
  };
  
  const calculateSeminarDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const parseDate = (dateStr) => {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(year, month - 1, day);
      }
      return null;
    };
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (start && end) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1; // Include both start and end day
    }
    
    return 0;
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

  const renderEndCalendar = () => {
    const monthStart = startOfMonth(currentEndMonth);
    const monthEnd = endOfMonth(currentEndMonth);
    
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
    const minDate = startOfDay(selectedDate); // Minimum date is the selected start date
    
    // Bosnian month names
    const bosnianMonths = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
      'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    
    const previousMonth = () => {
      setCurrentEndMonth(new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth() - 1));
    };
    
    const nextMonth = () => {
      setCurrentEndMonth(new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth() + 1));
    };

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={previousMonth} style={styles.calendarNavButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {bosnianMonths[currentEndMonth.getMonth()]} {currentEndMonth.getFullYear()}
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
            const isCurrentMonth = isSameMonth(day, currentEndMonth);
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
                onPress={() => {
                  if (!isDisabled) {
                    setSelectedEndDate(day);
                    handleInputChange('endDate', format(day, 'dd.MM.yyyy'));
                    setShowEndDatePicker(false);
                  }
                }}
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
    setSelectedDaijaId(daijaId); // Update picker state
    
    if (daijaId === 'custom') {
      setUseCustomSpeaker(true);
      setFormData(prev => ({ 
        ...prev, 
        daijaId: '',
        speaker: ''
      }));
    } else if (daijaId === '') {
      setUseCustomSpeaker(false);
      setFormData(prev => ({ 
        ...prev, 
        daijaId: '',
        speaker: ''
      }));
    } else {
      setUseCustomSpeaker(false);
      const selectedDaija = daije.find(d => d._id === daijaId);
      setFormData(prev => ({ 
        ...prev, 
        daijaId: daijaId,
        speaker: selectedDaija ? formatDaijaTitle(selectedDaija.name, selectedDaija.title) : ''
      }));
    }
  };

  const handleOrganizationSelect = (orgId) => {
    if (orgId === 'custom') {
      setUseCustomOrganization(true);
      setFormData(prev => ({ 
        ...prev, 
        organizationId: '',
        organization: '',
        city: prev.city || '',
        address: prev.address || ''
      }));
    } else if (orgId === '') {
      setUseCustomOrganization(false);
      setFormData(prev => ({ 
        ...prev, 
        organizationId: '',
        organization: ''
      }));
    } else {
      setUseCustomOrganization(false);
      const selectedOrg = organizations.find(o => o._id === orgId);
      setFormData(prev => ({ 
        ...prev, 
        organizationId: orgId,
        organization: selectedOrg ? selectedOrg.name : '',
        city: selectedOrg ? selectedOrg.city || prev.city : prev.city,
        address: selectedOrg ? selectedOrg.address || prev.address : prev.address
      }));
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
    if ((!formData.speaker || !formData.speaker.trim()) && !formData.daijaId) {
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
    
    // Validacija za seminare
    if (showSeminarOptions) {
      if (!formData.endDate) {
        Alert.alert('Greška', 'Datum završetka je obavezan za seminare');
        return false;
      }
      
      if (!validateDate(formData.endDate)) {
        Alert.alert('Greška', 'Unesite valjan datum završetka u formatu DD.MM.YYYY');
        return false;
      }
      
      // Provjeri da li je datum završetka nakon datuma početka
      const startParts = formData.date.split('.');
      const endParts = formData.endDate.split('.');
      if (startParts.length === 3 && endParts.length === 3) {
        const startDate = new Date(startParts[2], startParts[1] - 1, startParts[0]);
        const endDate = new Date(endParts[2], endParts[1] - 1, endParts[0]);
        
        if (endDate < startDate) {
          Alert.alert('Greška', 'Datum završetka mora biti nakon datuma početka');
          return false;
        }
      }
    }
    
    return true;
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const isAuth = await checkIsAuthenticated();
      if (!isAuth) {
        Alert.alert(
          'Prijavite se', 
          'Morate biti prijavljeni da biste dodali predavanje. Molimo prijavite se na svoj nalog.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        setLoading(false);
        return;
      }

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
      
      // Format end date for seminars
      let formattedEndDate = formData.endDate;
      if (showSeminarOptions && formData.endDate && formData.endDate.includes('.')) {
        const [day, month, year] = formData.endDate.split('.');
        formattedEndDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Prepare final form data - map daijaId to daija for server compatibility
      const finalFormData = {
        ...formData,
        daija: formData.daijaId, // Server expects 'daija' field, not 'daijaId'
        image: imagePath,
        date: formattedDate,
        ...(showSeminarOptions && {
          isSeminar: true,
          endDate: formattedEndDate,
          seminarTheme: formData.title // Use title as seminar theme
        })
      };

      // Submit the form - either create or update
      if (editMode && editData?._id) {
        await predavanjaService.updateItem(editData._id, finalFormData);
        const message = showSeminarOptions ? 'Uspješno ste ažurirali seminar!' : 'Uspješno ste ažurirali predavanje!';
        Alert.alert('Uspjeh', message);
      } else {
        await predavanjaService.createPredavanje(finalFormData);
        const message = showSeminarOptions ? 'Uspješno ste dodali seminar!' : 'Uspješno ste dodali predavanje!';
        Alert.alert('Uspjeh', message);
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Clear form only if not in edit mode
      if (!editMode) {
        setFormData({
          title: '',
          date: format(new Date(), 'dd.MM.yyyy'),
          time: '',
          address: '',
          city: '',
          speaker: '',
          daijaId: '',
          organization: '',
          organizationId: '',
          image: '',
          isWeeklyLecture: false,
          totalWeeks: 2,
          isSeminar: false,
          endDate: ''
        });
        setImageUri(null);
        setSelectedDate(new Date());
        setSelectedEndDate(new Date());
        setSelectedDaijaId('');
        setUseCustomSpeaker(false);
        setShowSeminarOptions(false);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = editMode ? 'Došlo je do greške prilikom ažuriranja. Pokušajte ponovo.' : 'Došlo je do greške prilikom spremanja. Pokušajte ponovo.';
      Alert.alert('Greška', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, multiline = false, required = false, disabled = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, disabled && styles.inputDisabled]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        editable={!disabled}
      />
      {disabled && field === 'address' && (
        <Text style={styles.helperText}>Adresa se automatski popunjava iz odabranog udruženja</Text>
      )}
      {disabled && field === 'city' && (
        <Text style={styles.helperText}>Mjesto se automatski popunjava iz odabranog udruženja</Text>
      )}
    </View>
  );

  const renderTimeDropdown = () => {
    return (
      <IOSCompatibleDropdown
        label="Vrijeme"
        items={timeOptions.filter(opt => opt.value !== '')}
        value={formData.time}
        onChangeValue={(value) => handleInputChange('time', value)}
        placeholder="Odaberite vrijeme"
        required={true}
        searchable={true}
      />
    );
  };

  const renderDaijaDropdown = () => {
    console.log('renderDaijaDropdown - daije array:', daije);
    console.log('renderDaijaDropdown - daije length:', daije.length);
    
    const daijaOptions = daije.map(d => ({
      label: formatDaijaTitle(d.name, d.title),
      value: d._id
    }));
    
    console.log('renderDaijaDropdown - daijaOptions:', daijaOptions);

    return (
      <IOSCompatibleDropdown
        label="Daija/Predavač"
        items={daijaOptions}
        value={formData.daijaId}
        onChangeValue={(value) => {
          handleInputChange('daijaId', value);
          const selectedDaija = daije.find(d => d._id === value);
          if (selectedDaija) {
            handleInputChange('speaker', formatDaijaTitle(selectedDaija.name, selectedDaija.title));
          }
        }}
        placeholder="Odaberite predavača"
        required={true}
        searchable={true}
      />
    );
  };

  const renderOrganizationDropdown = () => {
    const organizationOptions = [
      { label: 'Nije navedeno', value: '' },
      ...organizations.map(o => ({
        label: o.name,
        value: o._id
      })),
      { label: '➕ Unesi ručno naziv udruženja', value: 'custom' }
    ];

    return (
      <IOSCompatibleDropdown
        label="Udruženje"
        items={organizationOptions.filter(item => item.value !== 'custom')}
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
    );
  };

  const renderDropdown = (label, selectedValue, onValueChange, items, required = false) => {
    return (
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
            dropdownIconColor="#000000"
          >
            {items.map((item, index) => (
              <Picker.Item
                key={item.value || `item-${index}`}
                label={item.label}
                value={item.value}
                style={styles.pickerItem}
                color="#000000"
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
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
        {/* Image Picker with Gallery */}
        <ImagePickerWithGallery
          value={formData.image}
          onChange={(imagePath) => {
            handleInputChange('image', imagePath);
            if (imagePath) {
              setImageUri(imagePath.startsWith('http') ? imagePath : getImageUrl(imagePath));
            } else {
              setImageUri(null);
            }
          }}
          onUpload={true}
          disabled={loading}
          placeholder="Odaberite sliku predavanja"
        />

        {renderInput('Naslov predavanja', 'title', 'Unesite naslov...', false, true)}
        
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
        {renderTimeDropdown()}

        {/* Daija Dropdown */}
        {renderDaijaDropdown()}

        {/* Organization Dropdown */}
        {renderOrganizationDropdown()}

        {renderInput('Adresa', 'address', 'Unesite adresu...', false, true, Boolean(formData.organizationId && !useCustomOrganization))}
        {renderInput('Mjesto', 'city', 'Unesite mjesto...', false, true, Boolean(formData.organizationId && !useCustomOrganization))}


        {/* Weekly lecture section */}
        <View style={styles.weeklyLectureSection}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('isWeeklyLecture', !formData.isWeeklyLecture)}
            disabled={editMode}
          >
            <View style={[styles.checkbox, formData.isWeeklyLecture && styles.checkboxChecked]}>
              {formData.isWeeklyLecture && (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              )}
            </View>
            <Text style={[styles.checkboxLabel, editMode && styles.disabledText]}>
              Sedmično predavanje
            </Text>
          </TouchableOpacity>

          {formData.isWeeklyLecture && (
            <View style={styles.weeksInputContainer}>
              <Text style={styles.inputLabel}>Broj sedmica</Text>
              <View style={styles.weeksInputWrapper}>
                <TouchableOpacity 
                  style={styles.weeksButton}
                  onPress={() => {
                    if (formData.totalWeeks > 2 && !editMode) {
                      handleInputChange('totalWeeks', formData.totalWeeks - 1);
                    }
                  }}
                  disabled={editMode || formData.totalWeeks <= 2}
                >
                  <Ionicons name="remove" size={20} color={editMode || formData.totalWeeks <= 2 ? COLORS.gray : COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.weeksNumber}>{formData.totalWeeks}</Text>
                <TouchableOpacity 
                  style={styles.weeksButton}
                  onPress={() => {
                    if (formData.totalWeeks < 12 && !editMode) {
                      handleInputChange('totalWeeks', formData.totalWeeks + 1);
                    }
                  }}
                  disabled={editMode || formData.totalWeeks >= 12}
                >
                  <Ionicons name="add" size={20} color={editMode || formData.totalWeeks >= 12 ? COLORS.gray : COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.weeksHelperText}>Min: 2, Max: 12 sedmica</Text>
            </View>
          )}
        </View>

        
        {/* Seminar section */}
        <View style={styles.seminarSection}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => {
              setShowSeminarOptions(!showSeminarOptions);
              handleInputChange('isSeminar', !showSeminarOptions);
              // Disable weekly lectures if seminar is selected
              if (!showSeminarOptions) {
                handleInputChange('isWeeklyLecture', false);
              }
            }}
            disabled={editMode || formData.isWeeklyLecture}
          >
            <View style={[styles.checkbox, showSeminarOptions && styles.checkboxCheckedSeminar]}>
              {showSeminarOptions && (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              )}
            </View>
            <Text style={[
              styles.checkboxLabel, 
              styles.seminarLabel,
              (editMode || formData.isWeeklyLecture) && styles.disabledText
            ]}>
              Seminar (događaj koji traje više dana)
            </Text>
          </TouchableOpacity>
          
          {showSeminarOptions && (
            <View style={styles.seminarContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Datum završetka <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {formData.endDate || 'Odaberite datum završetka'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              {formData.date && formData.endDate && (
                <View style={styles.durationInfo}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.warning} />
                  <Text style={styles.durationText}>
                    Trajanje seminara: {calculateSeminarDays(formData.date, formData.endDate)} dana
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Submit Button */}
        <View style={styles.submitButtonWrapper}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading 
                ? (editMode ? 'Ažuriranje...' : 'Dodavanje...') 
                : (editMode 
                    ? (showSeminarOptions ? 'Ažuriraj Seminar' : 'Ažuriraj Ders')
                    : (showSeminarOptions ? 'Dodaj Seminar' : 'Dodaj Ders')
                  )
              }
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Extra padding at bottom */}
        <View style={{ height: 20 }} />
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
      
      {/* End Date Picker Modal for Seminars */}
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
                  <Text style={styles.modalTitle}>Datum završetka seminara</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {renderEndCalendar()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Time Picker Modal - Centered with confirm button */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.timeModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Odaberite vrijeme</Text>
            </View>
            
            <ScrollView 
              style={styles.timeModalScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {timeOptions.slice(1).map((time) => (
                <TouchableOpacity
                  key={time.value}
                  style={[
                    styles.timeItem,
                    selectedTime === time.value && styles.timeItemSelected
                  ]}
                  onPress={() => {
                    setSelectedTime(time.value);
                  }}
                >
                  <Text style={[
                    styles.timeItemText,
                    selectedTime === time.value && styles.timeItemTextSelected
                  ]}>
                    {time.label}
                  </Text>
                  {selectedTime === time.value && (
                    <Ionicons name="checkmark" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowTimePicker(false);
                  setSelectedTime(formData.time || '');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmTime}
              >
                <Text style={styles.modalConfirmButtonText}>Potvrdi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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
    // Add extra padding for iOS without SafeAreaView
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    zIndex: 10,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    zIndex: 11,
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
    paddingBottom: 16, // Standard padding
  },
  bottomPadding: {
    height: 80, // Space for submit button (approx 60px) + some extra margin
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
    backgroundColor: '#FFFFFF',
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 0,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.primary,
    flex: 1,
  },
  picker: {
    height: 50,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  pickerItem: {
    color: '#000000',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
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
  centeredModal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  timeModalContent: {
    maxHeight: '70%',
    width: '90%',
  },
  timeModalScrollView: {
    maxHeight: 300,
    marginVertical: 10,
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
  submitButtonWrapper: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 10,
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
    height: 120,
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
  // Section styles
  sectionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  // Weekly lecture styles
  weeklyLectureSection: {
    marginBottom: 16,
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: COLORS.gray,
  },
  // Seminar styles
  seminarSection: {
    marginBottom: 16,
    backgroundColor: '#fff5e6', // Light amber background
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  checkboxCheckedSeminar: {
    backgroundColor: COLORS.warning,
  },
  seminarLabel: {
    color: COLORS.warning,
    fontWeight: 'bold',
  },
  seminarContainer: {
    marginTop: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  dateInputText: {
    fontSize: 16,
    color: COLORS.primary,
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
    color: COLORS.warning,
    fontWeight: '500',
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  imageOptionButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
  },
  imageOptionContent: {
    alignItems: 'center',
  },
  imageOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  imageOptionSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.gray,
  },
  imageGrid: {
    padding: 16,
  },
  imageGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridImageItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedImage: {
    borderColor: COLORS.primary,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  weeksInputContainer: {
    marginTop: 16,
  },
  weeksInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  weeksButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  weeksNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  weeksHelperText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  timeButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  timeListContainer: {
    maxHeight: 400,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 60,
  },
  timeItemSelected: {
    backgroundColor: '#E8F4FD',
  },
  timeItemText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  timeItemTextSelected: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  largeModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: '60%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  largeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  largeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  largeModalScrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default LectureForm; 