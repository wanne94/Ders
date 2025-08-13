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
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';

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
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [education, setEducation] = useState([]);
  const [educationInput, setEducationInput] = useState('');

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
      
      setDaije(daijeResponse.data || []);
      setOrganizations(organizationsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
          organization: '',
          organizationId: ''
        };
      case 'daija':
        return {
          name: '',
          title: 'prof',
          biography: '',
          status: 'pending'
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
          status: 'pending'
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
    setUseCustomSpeaker(false);
    setUseCustomOrganization(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('sr-RS');
  };

  const handleTimeSelect = (time) => {
    handleInputChange('time', time);
  };

  const handleDaijaSelect = (daijaId) => {
    if (daijaId === 'custom') {
      setUseCustomSpeaker(true);
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
    } else {
      setUseCustomOrganization(false);
      const selectedOrg = organizations.find(o => o._id === orgId);
      handleInputChange('organizationId', orgId);
      handleInputChange('organization', selectedOrg ? selectedOrg.name : '');
      handleInputChange('city', selectedOrg ? selectedOrg.city || '' : '');
      handleInputChange('address', selectedOrg ? selectedOrg.address || '' : '');
    }
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
        if (!formData.time) errors.push('Vrijeme je obavezno');
        if (!formData.address?.trim()) errors.push('Adresa je obavezna');
        if (!formData.city?.trim()) errors.push('Grad je obavezan');
        if (!useCustomSpeaker && !formData.daijaId) errors.push('Odaberite daiju');
        if (useCustomSpeaker && !formData.speaker?.trim()) errors.push('Ime daije je obavezno');
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

  const renderPicker = (label, options, selectedValue, onSelect, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value || option}
            style={[
              styles.pickerOption,
              (selectedValue === (option.value || option)) && styles.pickerOptionSelected
            ]}
            onPress={() => onSelect(option.value || option)}
          >
            <Text style={[
              styles.pickerOptionText,
              (selectedValue === (option.value || option)) && styles.pickerOptionTextSelected
            ]}>
              {option.label || option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLectureForm = () => (
    <ScrollView style={styles.formContainer}>
      {renderInput('Naslov predavanja', 'title', 'Unesite naslov...', false, true)}
      {renderInput('Opis predavanja', 'description', 'Unesite opis...')}
      
      {renderInput('Datum', 'date', 'DD.MM.YYYY (npr. 15.06.2024)', false, true)}

      {/* Time Picker */}
      {renderPicker('Vrijeme', timeOptions, formData.time, handleTimeSelect, true)}

      {/* Speaker Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Predavač <Text style={styles.required}>*</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
          {daije.map((daija) => (
            <TouchableOpacity
              key={daija._id}
              style={[
                styles.pickerOption,
                (formData.daijaId === daija._id) && styles.pickerOptionSelected
              ]}
              onPress={() => handleDaijaSelect(daija._id)}
            >
              <Text style={[
                styles.pickerOptionText,
                (formData.daijaId === daija._id) && styles.pickerOptionTextSelected
              ]}>
                {daija.title} {daija.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.pickerOption,
              useCustomSpeaker && styles.pickerOptionSelected
            ]}
            onPress={() => handleDaijaSelect('custom')}
          >
            <Text style={[
              styles.pickerOptionText,
              useCustomSpeaker && styles.pickerOptionTextSelected
            ]}>
              ➕ Upiši ime
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {useCustomSpeaker && renderInput('Ime daije', 'speaker', 'Unesite ime i prezime...', false, true)}

      {/* Organization Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Udruženje</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
          <TouchableOpacity
            style={[
              styles.pickerOption,
              (!formData.organizationId && !useCustomOrganization) && styles.pickerOptionSelected
            ]}
            onPress={() => handleOrganizationSelect('')}
          >
            <Text style={[
              styles.pickerOptionText,
              (!formData.organizationId && !useCustomOrganization) && styles.pickerOptionTextSelected
            ]}>
              Nije navedeno
            </Text>
          </TouchableOpacity>
          {organizations.map((org) => (
            <TouchableOpacity
              key={org._id}
              style={[
                styles.pickerOption,
                (formData.organizationId === org._id) && styles.pickerOptionSelected
              ]}
              onPress={() => handleOrganizationSelect(org._id)}
            >
              <Text style={[
                styles.pickerOptionText,
                (formData.organizationId === org._id) && styles.pickerOptionTextSelected
              ]}>
                {org.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.pickerOption,
              useCustomOrganization && styles.pickerOptionSelected
            ]}
            onPress={() => handleOrganizationSelect('custom')}
          >
            <Text style={[
              styles.pickerOptionText,
              useCustomOrganization && styles.pickerOptionTextSelected
            ]}>
              ➕ Upiši naziv
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {useCustomOrganization && renderInput('Naziv udruženja', 'organization', 'Unesite naziv...', false, true)}

      {renderInput('Adresa', 'address', 'Unesite adresu...', false, true)}
      {renderInput('mjesto', 'city', 'Unesite mjesto...', false, true)}
    </ScrollView>
  );

  const renderDaijaForm = () => (
    <ScrollView style={styles.formContainer}>
      {renderInput('Ime i prezime', 'firstName', 'Unesite ime i prezime...', false, true)}
      
      {/* Title Selection */}
      {renderPicker('Titula', titles, formData.title, (value) => handleInputChange('title', value), true)}
      
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
  pickerContainer: {
    flexDirection: 'row',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  pickerOptionTextSelected: {
    color: COLORS.white,
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
});

export default AddContentScreen;