import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  error: '#f44336',
  background: '#f8fafc',
  border: '#e2e8f0',
};

const IOSCompatibleDropdown = ({
  label,
  items = [],
  value,
  onChangeValue,
  placeholder = 'Odaberite...',
  required = false,
  searchable = false,
  containerStyle,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredItems = searchable && searchText
    ? items.filter(item => 
        item.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : items;

  const selectedItem = items.find(item => item.value === value);

  const handleSelect = (itemValue) => {
    console.log('IOSCompatibleDropdown - Item selected:', itemValue);
    if (onChangeValue && typeof onChangeValue === 'function') {
      onChangeValue(itemValue);
    }
    setOpen(false);
    setSearchText('');
  };
  
  // Debug log when modal opens
  useEffect(() => {
    if (open) {
      console.log(`IOSCompatibleDropdown [${label}] - Modal opened with ${filteredItems.length} items`);
      if (filteredItems.length > 0) {
        console.log('First few items:', filteredItems.slice(0, 3));
      }
    }
  }, [open, filteredItems, label]);

  const renderItem = ({ item }) => {
    console.log('Rendering item:', item);
    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          item.value === value && styles.selectedListItem
        ]}
        onPress={() => handleSelect(item.value)}
      >
        <Text style={[
          styles.listItemText,
          item.value === value && styles.selectedListItemText
        ]}>
          {item.label}
        </Text>
        {item.value === value && (
          <Ionicons name="checkmark" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dropdownText,
          !selectedItem && styles.placeholder
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons 
          name={open ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={COLORS.gray} 
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
        transparent={true}
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Odaberite opciju'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            
            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pretražite..."
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor={COLORS.gray}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            <View style={{ flex: 1 }}>
              <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.value ? item.value.toString() : 'empty'}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nema dostupnih opcija</Text>
                  </View>
                )}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.lightGray,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.primary,
    flex: 1,
  },
  placeholder: {
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        paddingBottom: 20,
      },
      android: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  modalInner: {
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContent: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedListItem: {
    backgroundColor: COLORS.lightGray,
  },
  listItemText: {
    fontSize: 16,
    color: COLORS.primary,
    flex: 1,
  },
  selectedListItemText: {
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default IOSCompatibleDropdown;