import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e2e8f0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3'
};

const AdvancedFilters = ({ 
  visible, 
  onClose, 
  onApply,
  filterConfig = {},
  data = []
}) => {
  // Extract unique values for filters
  const getUniqueValues = (key) => {
    const values = data.map(item => item[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const cities = getUniqueValues('city');
  const organizations = getUniqueValues('organization');
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    status: '',
    city: '',
    organization: '',
    speaker: '',
    hasImage: null,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [showDatePicker, setShowDatePicker] = useState({
    from: false,
    to: false
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      status: '',
      city: '',
      organization: '',
      speaker: '',
      hasImage: null,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Apply filters
  const handleApply = () => {
    // Clean up empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onApply(activeFilters);
    onClose();
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(
      value => value !== null && value !== '' && value !== undefined
    ).length;
  };

  const formatDate = (date) => {
    if (!date) return 'Odaberi datum';
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  const renderDatePicker = (type) => {
    const isFrom = type === 'from';
    const value = isFrom ? filters.dateFrom : filters.dateTo;
    
    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>
          {isFrom ? 'Datum od:' : 'Datum do:'}
        </Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker({ ...showDatePicker, [type]: true })}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
          <Text style={styles.dateText}>{formatDate(value)}</Text>
          {value && (
            <TouchableOpacity
              onPress={() => setFilters({ ...filters, [isFrom ? 'dateFrom' : 'dateTo']: null })}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        {showDatePicker[type] && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker({ ...showDatePicker, [type]: false });
              if (selectedDate) {
                setFilters({
                  ...filters,
                  [isFrom ? 'dateFrom' : 'dateTo']: selectedDate
                });
              }
            }}
          />
        )}
      </View>
    );
  };

  const renderDropdown = (label, key, options) => {
    return (
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>{label}:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.optionsScroll}
        >
          <TouchableOpacity
            style={[
              styles.optionChip,
              filters[key] === '' && styles.optionChipActive
            ]}
            onPress={() => setFilters({ ...filters, [key]: '' })}
          >
            <Text style={[
              styles.optionText,
              filters[key] === '' && styles.optionTextActive
            ]}>
              Sve
            </Text>
          </TouchableOpacity>
          
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionChip,
                filters[key] === option && styles.optionChipActive
              ]}
              onPress={() => setFilters({ ...filters, [key]: option })}
            >
              <Text style={[
                styles.optionText,
                filters[key] === option && styles.optionTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Napredni filteri</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersList}>
            {/* Date filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Datum</Text>
              {renderDatePicker('from')}
              {renderDatePicker('to')}
            </View>

            {/* Status filter */}
            {filterConfig.showStatus !== false && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Status</Text>
                {renderDropdown('Status', 'status', statuses)}
              </View>
            )}

            {/* City filter */}
            {cities.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Lokacija</Text>
                {renderDropdown('Grad', 'city', cities)}
              </View>
            )}

            {/* Organization filter */}
            {organizations.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Organizacija</Text>
                {renderDropdown('Organizacija', 'organization', organizations)}
              </View>
            )}

            {/* Speaker filter */}
            {filterConfig.showSpeaker !== false && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Predavač</Text>
                <View style={styles.filterItem}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Unesite ime predavača..."
                    value={filters.speaker}
                    onChangeText={(text) => setFilters({ ...filters, speaker: text })}
                    placeholderTextColor={COLORS.gray}
                  />
                </View>
              </View>
            )}

            {/* Image filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Ostalo</Text>
              <View style={styles.filterItem}>
                <View style={styles.switchRow}>
                  <Text style={styles.filterLabel}>Samo sa slikom:</Text>
                  <Switch
                    value={filters.hasImage === true}
                    onValueChange={(value) => 
                      setFilters({ ...filters, hasImage: value ? true : null })
                    }
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                    thumbColor={filters.hasImage ? COLORS.primary : COLORS.gray}
                  />
                </View>
              </View>
            </View>

            {/* Sort options */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Sortiranje</Text>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Sortiraj po:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    { key: 'date', label: 'Datum' },
                    { key: 'title', label: 'Naslov' },
                    { key: 'city', label: 'Grad' },
                    { key: 'createdAt', label: 'Datum kreiranja' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.optionChip,
                        filters.sortBy === option.key && styles.optionChipActive
                      ]}
                      onPress={() => setFilters({ ...filters, sortBy: option.key })}
                    >
                      <Text style={[
                        styles.optionText,
                        filters.sortBy === option.key && styles.optionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Redosled:</Text>
                <View style={styles.sortOrderRow}>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      filters.sortOrder === 'asc' && styles.sortOrderButtonActive
                    ]}
                    onPress={() => setFilters({ ...filters, sortOrder: 'asc' })}
                  >
                    <Ionicons 
                      name="arrow-up" 
                      size={20} 
                      color={filters.sortOrder === 'asc' ? COLORS.white : COLORS.gray} 
                    />
                    <Text style={[
                      styles.sortOrderText,
                      filters.sortOrder === 'asc' && styles.sortOrderTextActive
                    ]}>
                      Uzlazno
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      filters.sortOrder === 'desc' && styles.sortOrderButtonActive
                    ]}
                    onPress={() => setFilters({ ...filters, sortOrder: 'desc' })}
                  >
                    <Ionicons 
                      name="arrow-down" 
                      size={20} 
                      color={filters.sortOrder === 'desc' ? COLORS.white : COLORS.gray} 
                    />
                    <Text style={[
                      styles.sortOrderText,
                      filters.sortOrder === 'desc' && styles.sortOrderTextActive
                    ]}>
                      Silazno
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>
                Poništi filtere
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Primjeni ({getActiveFilterCount()})
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  filtersList: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  filterItem: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.primary,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  optionTextActive: {
    color: COLORS.white,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    fontSize: 14,
    color: COLORS.primary,
    backgroundColor: COLORS.lightGray,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortOrderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    gap: 8,
  },
  sortOrderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOrderText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  sortOrderTextActive: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default AdvancedFilters;