import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  FlatList,
  Switch,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { SERVER_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

// Section Navigation Component (similar to web sidebar)
const SectionNavigation = ({ activeSection, onSectionChange, stats, userRole }) => {
  const mainSections = [
    { id: 'predavanja', title: 'Dersovi', icon: 'book-outline', color: colors.primary.main },
    { id: 'organizations', title: 'Udruženja', icon: 'business-outline', color: colors.info.main },
    { id: 'daije', title: 'Daije', icon: 'person-outline', color: colors.success.main },
    { id: 'korisnici', title: 'Korisnici', icon: 'people-outline', color: colors.secondary.main }
  ];

  const approvalSections = [
    { 
      id: 'za-odobrenje', 
      title: 'Za odobrenje', 
      icon: 'time-outline', 
      color: colors.warning.main,
      badge: stats.totalPending
    },
    ...(userRole === 'super_admin' ? [{
      id: 'odbijeno',
      title: 'Odbijeno',
      icon: 'close-circle-outline',
      color: colors.error.main
    }] : []),
    {
      id: 'prijedlozi',
      title: 'Prijedlozi',
      icon: 'bulb-outline',
      color: colors.warning.main,
      badge: stats.pendingSuggestions
    }
  ];

  const renderSectionButton = (section) => (
    <TouchableOpacity
      key={section.id}
      style={[
        styles.sectionButton,
        activeSection === section.id && styles.activeSectionButton
      ]}
      onPress={() => onSectionChange(section.id)}
    >
      <View style={[styles.sectionIconContainer, { backgroundColor: section.color + '15' }]}>
        <Ionicons 
          name={section.icon} 
          size={20} 
          color={activeSection === section.id ? colors.text.onPrimary : section.color} 
        />
        {section.badge > 0 && (
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{section.badge}</Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.sectionButtonText,
        activeSection === section.id && styles.activeSectionButtonText
      ]}>
        {section.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.sectionNavigation}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScrollContainer}>
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionGroupTitle}>GLAVNI MENI</Text>
          <View style={styles.sectionButtonsRow}>
            {mainSections.map(renderSectionButton)}
          </View>
        </View>
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionGroupTitle}>ODOBRAVANJE</Text>
          <View style={styles.sectionButtonsRow}>
            {approvalSections.map(renderSectionButton)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Content List Component (similar to web DataTable)
const ContentList = ({ data, type, onEdit, onDelete, onApprove, onReject, showApprovalActions = false, refreshing = false, onRefresh }) => {
  const getItemType = (item) => {
    if (item.title && item.speaker) return 'lecture';
    if (item.firstName && item.lastName) return 'daija';
    if (item.name && !item.firstName) return 'organization';
    if (item.username || (item.email && !item.name && !item.firstName)) return 'user';
    if (item.description && !item.speaker) return 'suggestion';
    return 'unknown';
  };

  const getItemTitle = (item, type) => {
    const itemType = type === 'mixed' ? getItemType(item) : type;
    switch (itemType) {
      case 'lecture': return item.title;
      case 'daija': return `${item.firstName} ${item.lastName}`;
      case 'organization': return item.name;
      case 'user': return item.username || item.email;
      case 'suggestion': return item.title || 'Prijedlog';
      default: return 'Nepoznato';
    }
  };

  const getItemSubtitle = (item, type) => {
    const itemType = type === 'mixed' ? getItemType(item) : type;
    switch (itemType) {
      case 'lecture': return `${item.speaker} • ${item.organization}`;
      case 'daija': return item.specialization || 'Daija';
      case 'organization': return item.shortDescription || item.address;
      case 'user': return item.email;
      case 'suggestion': return item.description;
      default: return '';
    }
  };

  const getItemIcon = (item, type) => {
    const itemType = type === 'mixed' ? getItemType(item) : type;
    switch (itemType) {
      case 'lecture': return 'book-outline';
      case 'daija': return 'person-outline';
      case 'organization': return 'business-outline';
      case 'user': return 'people-outline';
      case 'suggestion': return 'bulb-outline';
      default: return 'document-outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return colors.success.main;
      case 'pending': return colors.warning.main;
      case 'rejected': return colors.error.main;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Odobreno';
      case 'pending': return 'Na čekanju';
      case 'rejected': return 'Odbačeno';
      default: return 'Nepoznato';
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.contentListItem}>
      <View style={styles.contentItemLeft}>
        <View style={[styles.contentItemIcon, { backgroundColor: colors.primary.main + '15' }]}>
          <Ionicons name={getItemIcon(item, type)} size={24} color={colors.primary.main} />
        </View>
        <View style={styles.contentItemText}>
          <Text style={styles.contentItemTitle} numberOfLines={1}>
            {getItemTitle(item, type)}
          </Text>
          <Text style={styles.contentItemSubtitle} numberOfLines={1}>
            {getItemSubtitle(item, type)}
          </Text>
          {item.status && (
            <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <Text style={[styles.statusChipText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.contentItemActions}>
        {showApprovalActions && item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error.main }]}
              onPress={() => onReject && onReject(item)}
            >
              <Ionicons name="close" size={16} color={colors.text.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success.main }]}
              onPress={() => onApprove && onApprove(item)}
            >
              <Ionicons name="checkmark" size={16} color={colors.text.onPrimary} />
            </TouchableOpacity>
          </>
        )}
        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.info.main }]}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil" size={16} color={colors.text.onPrimary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error.main }]}
            onPress={() => onDelete(item)}
          >
            <Ionicons name="trash" size={16} color={colors.text.onPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="document-outline" size={64} color={colors.text.disabled} />
        <Text style={styles.emptyStateTitle}>Nema podataka</Text>
        <Text style={styles.emptyStateSubtitle}>Trenutno nema stavki za prikaz</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || index.toString()}
      style={styles.contentList}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

// Modern Action Card Component
const ModernActionCard = ({ title, subtitle, icon, color, onPress, badge, disabled = false }) => (
  <TouchableOpacity 
    style={[styles.modernActionCard, disabled && styles.disabledCard]} 
    onPress={disabled ? null : onPress}
    activeOpacity={disabled ? 1 : 0.7}
  >
    <View style={styles.actionCardContent}>
      <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={32} color={disabled ? colors.text.disabled : color} />
        {badge && (
          <View style={[styles.actionBadge, { backgroundColor: colors.error.main }]}>
            <Text style={styles.actionBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionTitle, disabled && { color: colors.text.disabled }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, disabled && { color: colors.text.disabled }]}>{subtitle}</Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={disabled ? colors.text.disabled : colors.text.secondary} 
      />
    </View>
  </TouchableOpacity>
);

// Quick Filter Component
const QuickFilterChip = ({ label, active, onPress, count }) => (
  <TouchableOpacity 
    style={[styles.filterChip, active && styles.activeFilterChip]} 
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
      {label}
      {count !== undefined && ` (${count})`}
    </Text>
  </TouchableOpacity>
);

// Search Bar Component
const SearchBar = ({ value, onChangeText, placeholder, onClear }) => (
  <View style={styles.searchContainer}>
    <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.secondary}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    )}
  </View>
);

// Settings Modal Component
const SettingsModal = ({ visible, onClose, approvalSettings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState(approvalSettings);

  useEffect(() => {
    setLocalSettings(approvalSettings);
  }, [approvalSettings]);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const toggleSetting = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Postavke</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Spremi</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Postavke odobrenja</Text>
            <Text style={styles.sectionSubtitle}>Kontrolirajte koji sadržaj zahtijeva odobrenje</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dersovi</Text>
                <Text style={styles.settingDescription}>Zahtijeva odobrenje za nova predavanja</Text>
              </View>
              <Switch
                value={localSettings.lecture}
                onValueChange={() => toggleSetting('lecture')}
                trackColor={{ false: colors.background.disabled, true: colors.primary.main + '40' }}
                thumbColor={localSettings.lecture ? colors.primary.main : colors.text.disabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daije</Text>
                <Text style={styles.settingDescription}>Zahtijeva odobrenje za nove daije</Text>
              </View>
              <Switch
                value={localSettings.daija}
                onValueChange={() => toggleSetting('daija')}
                trackColor={{ false: colors.background.disabled, true: colors.primary.main + '40' }}
                thumbColor={localSettings.daija ? colors.primary.main : colors.text.disabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Udruženja</Text>
                <Text style={styles.settingDescription}>Zahtijeva odobrenje za nova udruženja</Text>
              </View>
              <Switch
                value={localSettings.organization}
                onValueChange={() => toggleSetting('organization')}
                trackColor={{ false: colors.background.disabled, true: colors.primary.main + '40' }}
                thumbColor={localSettings.organization ? colors.primary.main : colors.text.disabled}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Add Options Modal Component
const AddOptionsModal = ({ visible, onClose, onSelectOption }) => {
  const addOptions = [
    {
      id: 'lecture',
      title: 'Predavanje',
      subtitle: 'Dodaj novo predavanje',
      icon: 'book-outline',
      color: colors.primary.main
    },
    {
      id: 'daija',
      title: 'Daija',
      subtitle: 'Dodaj novi profil daije',
      icon: 'person-outline',
      color: colors.success.main
    },
    {
      id: 'organization',
      title: 'Udruženje',
      subtitle: 'Dodaj novo udruženje',
      icon: 'business-outline',
      color: colors.info.main
    },
    {
      id: 'user',
      title: 'Korisnik',
      subtitle: 'Dodaj novog korisnika',
      icon: 'person-add-outline',
      color: colors.secondary.main
    }
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Što želite dodati?</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.addOptionsGrid}>
            {addOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.addOptionCard}
                onPress={() => {
                  onSelectOption(option.id);
                  onClose();
                }}
              >
                <View style={[styles.addOptionIcon, { backgroundColor: option.color + '15' }]}>
                  <Ionicons name={option.icon} size={32} color={option.color} />
                </View>
                <Text style={styles.addOptionTitle}>{option.title}</Text>
                <Text style={styles.addOptionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Approval Card Component
const ApprovalCard = ({ item, type, onApprove, onReject }) => {
  const [imageError, setImageError] = useState(false);

  const getItemTitle = () => {
    switch (type) {
      case 'lecture':
        return item.title || 'Bez naslova';
      case 'daija':
        return `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Bez imena';
      case 'organization':
        return item.name || 'Bez naziva';
      default:
        return 'Nepoznato';
    }
  };

  const getItemSubtitle = () => {
    switch (type) {
      case 'lecture':
        return `Predavač: ${item.speaker || 'Nepoznato'}`;
      case 'daija':
        return `Grad: ${item.city || 'Nepoznato'}`;
      case 'organization':
        return `Grad: ${item.city || 'Nepoznato'}`;
      default:
        return '';
    }
  };

  const getItemIcon = () => {
    switch (type) {
      case 'lecture':
        return 'book-outline';
      case 'daija':
        return 'person-outline';
      case 'organization':
        return 'business-outline';
      default:
        return 'help-outline';
    }
  };

  const getItemColor = () => {
    switch (type) {
      case 'lecture':
        return colors.primary.main;
      case 'daija':
        return colors.success.main;
      case 'organization':
        return colors.info.main;
      default:
        return colors.text.secondary;
    }
  };

  const getDefaultImagePath = () => {
    switch (type) {
      case 'lecture':
        return '/uploads/images/predavanjeslika.jpg';
      case 'daija':
        return '/uploads/images/daijaslika.jpg';
      case 'organization':
        return '/uploads/images/udruzenjeslika.jpg';
      default:
        return '/uploads/images/predavanjeslika.jpg';
    }
  };

  const getImageUrl = () => {
    const baseUrl = SERVER_URL; // Use the same server URL as other components
    let finalUrl;
    
    if (item.image) {
      // Handle both relative and absolute paths
      if (item.image.startsWith('http')) {
        finalUrl = item.image;
      } else if (item.image.startsWith('/')) {
        finalUrl = `${baseUrl}${item.image}`;
      } else {
        finalUrl = `${baseUrl}/${item.image}`;
      }
    } else {
      finalUrl = `${baseUrl}${getDefaultImagePath()}`;
    }
    
    console.log('🖼️ Generated image URL for', type, ':', finalUrl);
    console.log('🖼️ Item image value:', item.image);
    console.log('🖼️ Base URL used:', baseUrl);
    
    return finalUrl;
  };

  const renderRightContent = () => {
    // Always try to show image first (either item image or default), fallback to icon only if image fails
    if (!imageError) {
      return (
        <View style={styles.approvalImageContainer}>
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.approvalImage}
            onError={() => {
              console.log('❌ Image failed to load for:', type, getImageUrl());
              setImageError(true);
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully for:', type, getImageUrl());
            }}
            resizeMode="cover"
          />
        </View>
      );
    } else {
      // Fallback to icon only if image loading failed
      console.log('🔄 Using icon fallback for:', type);
      return (
        <View style={[styles.approvalIconContainer, { backgroundColor: getItemColor() + '15' }]}>
          <Ionicons name={getItemIcon()} size={24} color={getItemColor()} />
        </View>
      );
    }
  };

  return (
    <View style={styles.approvalCard}>
      <View style={styles.approvalCardContent}>
        {renderRightContent()}
        <View style={styles.approvalTextContainer}>
          <Text style={styles.approvalTitle}>{getItemTitle()}</Text>
          <Text style={styles.approvalSubtitle}>{getItemSubtitle()}</Text>
          <Text style={styles.approvalDate}>
            Dodano: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('hr-HR') : 'Nepoznato'}
          </Text>
        </View>
        <View style={styles.approvalActions}>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Ionicons name="close" size={20} color={colors.text.onError} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
            <Ionicons name="checkmark" size={20} color={colors.text.onSuccess} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [data, setData] = useState({
    users: [],
    lectures: [],
    daije: [],
    organizations: [],
    suggestions: [],
    archivedSuggestions: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('predavanja'); // Add section state
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [approvalSettings, setApprovalSettings] = useState({
    lecture: true,
    daija: true,
    organization: true
  });
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const canDelete = user?.role === 'admin' || user?.role === 'super_admin';

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      console.log('Starting fetchData...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const apiPromises = [
        axiosInstance.get('/users').catch(err => {
          console.log('❌ Users API error:', err.message);
          return { data: [] };
        }),
        axiosInstance.get('/admin/lectures/all').catch(err => {
          console.log('❌ Admin Lectures API error:', err.message);
          return { data: [] };
        }),
        axiosInstance.get('/admin/daije/all').catch(err => {
          console.log('❌ Admin Daije API error:', err.message);
          return { data: [] };
        }),
        axiosInstance.get('/admin/organizations/all').catch(err => {
          console.log('❌ Admin Organizations API error:', err.message);
          return { data: [] };
        }),
        axiosInstance.get('/suggestions').catch(err => {
          console.log('❌ Suggestions API error:', err.message);
          return { data: [] };
        }),
        axiosInstance.get('/suggestions/archived').catch(err => {
          console.log('❌ Archived suggestions API error:', err.message);
          return { data: [] };
        }),
        axiosInstance.get('/settings').catch(err => {
          console.log('❌ Settings API error:', err.message);
          return { data: {} };
        })
      ];

      const [usersRes, lecturesRes, daijeRes, organizationsRes, suggestionsRes, archivedSuggestionsRes, settingsRes] = await Promise.race([
        Promise.all(apiPromises),
        timeoutPromise
      ]);

      console.log('✅ API responses received');
      console.log('Users:', Array.isArray(usersRes.data) ? usersRes.data.length : 'Not array');
      console.log('Lectures:', Array.isArray(lecturesRes.data) ? lecturesRes.data.length : 'Not array');
      console.log('Daije:', Array.isArray(daijeRes.data) ? daijeRes.data.length : 'Not array');

      // Dodaj detaljnije logiranje za debugging
      console.log('🔎 Full users response:', usersRes.data);
      console.log('🔎 Full lectures response:', lecturesRes.data);
      console.log('🔎 Full daije response:', daijeRes.data);
      console.log('🔎 Full organizations response:', organizationsRes.data);
      console.log('🔎 Full suggestions response:', suggestionsRes.data);

      setData({
        users: Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [],
        lectures: Array.isArray(lecturesRes.data) ? lecturesRes.data : lecturesRes.data.lectures || [],
        daije: Array.isArray(daijeRes.data) ? daijeRes.data : daijeRes.data.daije || [],
        organizations: Array.isArray(organizationsRes.data) ? organizationsRes.data : organizationsRes.data.organizations || [],
        suggestions: Array.isArray(suggestionsRes.data) ? suggestionsRes.data : suggestionsRes.data.suggestions || [],
        archivedSuggestions: Array.isArray(archivedSuggestionsRes.data) ? archivedSuggestionsRes.data : archivedSuggestionsRes.data.suggestions || []
      });

      // Load approval settings
      if (settingsRes.data.approvalSettings) {
        setApprovalSettings(settingsRes.data.approvalSettings);
      }
      
      console.log('✅ Data set successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      // Provide fallback data when API is not available
      const fallbackData = {
        users: [
          { _id: '1', username: 'AdminUser', role: 'admin', email: 'admin@example.com' }
        ],
        lectures: [
          { _id: '1', title: 'Primjer predavanja', status: 'approved', speaker: 'Test Speaker', date: new Date().toISOString() }
        ],
        daije: [
          { _id: '1', firstName: 'Test', lastName: 'Daija', status: 'approved', city: 'Sarajevo' }
        ],
        organizations: [
          { _id: '1', name: 'Test Udruženje', status: 'approved', city: 'Sarajevo' }
        ],
        suggestions: [],
        archivedSuggestions: []
      };
      
      setData(fallbackData);
      
      if (error.message === 'Request timeout') {
        Alert.alert('Greška', 'Zahtjev je istekao. Prikazuju se demo podaci. Molimo provjerite internetsku vezu i pokušajte ponovo.');
      } else {
        Alert.alert('Greška', 'Nije moguće učitati podatke sa servera. Prikazuju se demo podaci.');
      }
    } finally {
      console.log('🏁 Setting loading and refreshing to false');
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [fetchData, isAdmin]);

  // Refresh data when screen comes into focus (when returning from other screens)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isAdmin) {
        console.log('🔄 Dashboard focused - refreshing data');
        fetchData();
      }
    });

    return unsubscribe;
  }, [navigation, fetchData, isAdmin]);

  const onRefresh = useCallback(() => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    
    // Dodaj timeout kao backup da se refreshing završi nakon 30 sekundi
    const timeoutId = setTimeout(() => {
      console.log('⏰ Refresh timeout - forcing refresh to stop');
      setRefreshing(false);
    }, 30000);
    
    fetchData().finally(() => {
      clearTimeout(timeoutId);
      console.log('🏁 Pull to refresh completed');
    });
  }, [fetchData]);

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    const totalLectures = data.lectures.length;
    const activeLectures = data.lectures.filter(l => l?.status === 'approved').length;
    const pendingLectures = data.lectures.filter(l => l?.status === 'pending').length;
    const rejectedLectures = data.lectures.filter(l => l?.status === 'rejected').length;
    
    const totalDaije = data.daije.length;
    const activeDaije = data.daije.filter(d => d?.status === 'approved').length;
    const pendingDaije = data.daije.filter(d => d?.status === 'pending').length;
    const rejectedDaije = data.daije.filter(d => d?.status === 'rejected').length;
    
    const totalOrganizations = data.organizations.length;
    const activeOrganizations = data.organizations.filter(o => o?.status === 'approved').length;
    const pendingOrganizations = data.organizations.filter(o => o?.status === 'pending').length;
    
    const totalUsers = data.users.length;
    const totalSuggestions = data.suggestions.length;
    const pendingSuggestions = data.suggestions.filter(s => s?.status === 'pending').length;

    const totalPending = pendingLectures + pendingDaije + pendingOrganizations;
    const totalActive = activeLectures + activeDaije + activeOrganizations;
    const totalContent = totalLectures + totalDaije + totalOrganizations;

    return {
      totalLectures, activeLectures, pendingLectures,
      totalDaije, activeDaije, pendingDaije,
      totalOrganizations, activeOrganizations, pendingOrganizations,
      totalUsers, totalSuggestions, pendingSuggestions,
      totalPending, totalActive, totalContent
    };
  }, [data]);

  // Navigation handlers with enhanced functionality
  const navigateToManagement = (type, filters = {}) => {
    console.log('🔄 Navigating to management:', type);
    
    const routes = {
      lectures: 'AdminContentManager',
      daije: 'AdminContentManager',
      organizations: 'AdminContentManager',
      users: 'AdminContentManager',
      suggestions: 'AdminContentManager'
    };

    const titles = {
      lectures: 'Upravljanje predavanjima',
      daije: 'Upravljanje daijama',
      organizations: 'Upravljanje udruženjima',
      users: 'Upravljanje korisnicima',
      suggestions: 'Upravljanje prijedlozima'
    };

    console.log('🎯 Route:', routes[type], 'Title:', titles[type]);

    navigation.navigate(routes[type], {
      type,
      title: titles[type],
      filters,
      data: data[type === 'lectures' ? 'lectures' : type === 'daije' ? 'daije' : type === 'organizations' ? 'organizations' : type === 'users' ? 'users' : 'suggestions'],
      canEdit: isAdmin,
      canDelete: canDelete,
      returnTo: 'AdminDashboardMain'
    });
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add_lecture':
        navigation.navigate('LectureDetail', { 
          isAdmin: true, 
          mode: 'add',
          approvalEnabled: approvalSettings.lecture,
          returnTo: 'AdminDashboardMain'
        });
        break;
      case 'add_daija':
        navigation.navigate('DaijaDetail', { 
          isAdmin: true, 
          mode: 'add',
          approvalEnabled: approvalSettings.daija,
          returnTo: 'AdminDashboardMain'
        });
        break;
      case 'add_organization':
        navigation.navigate('OrganizationDetail', { 
          isAdmin: true, 
          mode: 'add',
          approvalEnabled: approvalSettings.organization,
          returnTo: 'AdminDashboardMain'
        });
        break;
      case 'add_user':
        navigation.navigate('AdminContentManager', {
          type: 'users',
          title: 'Dodaj korisnika',
          mode: 'add',
          returnTo: 'AdminDashboardMain'
        });
        break;
    }
  };

  const updateApprovalSettings = async (newSettings) => {
    try {
      await axiosInstance.put('/settings/approvalSettings', {
        value: newSettings,
        description: 'Mobile admin dashboard approval settings'
      });
      setApprovalSettings(newSettings);
      Alert.alert('Uspjeh', 'Postavke su uspješno spremljene');
    } catch (error) {
      console.error('Error saving approval settings:', error);
      Alert.alert('Greška', 'Nije moguće spremiti postavke');
    }
  };

  const handleAddOption = (optionId) => {
    switch (optionId) {
      case 'lecture':
        handleQuickAction('add_lecture');
        break;
      case 'daija':
        handleQuickAction('add_daija');
        break;
      case 'organization':
        handleQuickAction('add_organization');
        break;
      case 'user':
        handleQuickAction('add_user');
        break;
    }
  };

  // Filter data based on search query (similar to web)
  const filterData = (items, searchQuery, type) => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      switch (type) {
        case 'lecture':
          return item.title?.toLowerCase().includes(query) ||
                 item.speaker?.toLowerCase().includes(query) ||
                 item.organization?.toLowerCase().includes(query);
        case 'daija':
          return item.firstName?.toLowerCase().includes(query) ||
                 item.lastName?.toLowerCase().includes(query) ||
                 item.specialization?.toLowerCase().includes(query);
        case 'organization':
          return item.name?.toLowerCase().includes(query) ||
                 item.shortDescription?.toLowerCase().includes(query);
        case 'user':
          return item.username?.toLowerCase().includes(query) ||
                 item.email?.toLowerCase().includes(query);
        case 'suggestion':
          return item.title?.toLowerCase().includes(query) ||
                 item.description?.toLowerCase().includes(query);
        default:
          return true;
      }
    });
  };

  // Get content for current section (similar to web renderContent)
  const getCurrentSectionContent = () => {
    switch (activeSection) {
      case 'predavanja': {
        const approvedLectures = filterData(
          (data.lectures || []).filter(l => l.status === 'approved'),
          searchQuery,
          'lecture'
        );
        return {
          title: 'Odobrena predavanja (Dersovi)',
          data: approvedLectures,
          type: 'lecture',
          showApprovalActions: false
        };
      }
      case 'organizations': {
        const approvedOrganizations = filterData(
          (data.organizations || []).filter(o => o.status === 'approved'),
          searchQuery,
          'organization'
        );
        return {
          title: 'Odobrena udruženja',
          data: approvedOrganizations,
          type: 'organization',
          showApprovalActions: false
        };
      }
      case 'daije': {
        const approvedDaije = filterData(
          (data.daije || []).filter(d => d.status === 'approved'),
          searchQuery,
          'daija'
        );
        return {
          title: 'Odobrene daije',
          data: approvedDaije,
          type: 'daija',
          showApprovalActions: false
        };
      }
      case 'korisnici': {
        const filteredUsers = filterData(data.users, searchQuery, 'user');
        return {
          title: 'Korisnici',
          data: filteredUsers,
          type: 'user',
          showApprovalActions: false
        };
      }
      case 'za-odobrenje': {
        const pendingItems = [
          ...filterData((data.lectures || []).filter(l => l.status === 'pending'), searchQuery, 'lecture'),
          ...filterData((data.daije || []).filter(d => d.status === 'pending'), searchQuery, 'daija'),
          ...filterData((data.organizations || []).filter(o => o.status === 'pending'), searchQuery, 'organization')
        ];
        return {
          title: 'Sadržaj za odobrenje',
          data: pendingItems,
          type: 'mixed',
          showApprovalActions: true
        };
      }
      case 'odbijeno': {
        if (user?.role !== 'super_admin') {
          setActiveSection('predavanja');
          return null;
        }
        const rejectedItems = [
          ...filterData((data.lectures || []).filter(l => l.status === 'rejected'), searchQuery, 'lecture'),
          ...filterData((data.daije || []).filter(d => d.status === 'rejected'), searchQuery, 'daija'),
          ...filterData((data.organizations || []).filter(o => o.status === 'rejected'), searchQuery, 'organization')
        ];
        return {
          title: 'Odbačeni sadržaj',
          data: rejectedItems,
          type: 'mixed',
          showApprovalActions: false
        };
      }
      case 'prijedlozi': {
        const activeSuggestions = filterData(
          (data.suggestions || []).filter(s => s.status !== 'archived'),
          searchQuery,
          'suggestion'
        );
        return {
          title: 'Prijedlozi',
          data: activeSuggestions,
          type: 'suggestion',
          showApprovalActions: false
        };
      }
      default:
        return {
          title: 'Odobrena predavanja (Dersovi)',
          data: filterData((data.lectures || []).filter(l => l.status === 'approved'), searchQuery, 'lecture'),
          type: 'lecture',
          showApprovalActions: false
        };
    }
  };

  const handleApproval = async (itemId, type, action) => {
    try {
      const endpoints = {
        lecture: '/lectures',
        daija: '/daije', 
        organization: '/organizations'
      };
      
      const endpoint = endpoints[type];
      
      if (action === 'approve') {
        // Approve the item by setting status to approved
        await axiosInstance.patch(`${endpoint}/${itemId}`, { status: 'approved' });
      } else if (action === 'reject') {
        // Delete the item instead of marking as rejected
        await axiosInstance.delete(`${endpoint}/${itemId}`);
      }
      
      // Refresh data after approval/deletion
      await fetchData();
      
      const actionText = action === 'approve' ? 'odobreno' : 'obrisano';
      const typeText = type === 'lecture' ? 'Predavanje' : type === 'daija' ? 'Daija' : 'Udruženje';
      
      Alert.alert('Uspjeh', `${typeText} je uspješno ${actionText}`);
    } catch (error) {
      console.error(`Error ${action}ing ${type}:`, error);
      Alert.alert('Greška', `Nije moguće ${action === 'approve' ? 'odobriti' : 'obrisati'} stavku`);
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Ionicons name="shield-checkmark-outline" size={80} color={colors.text.secondary} />
          <Text style={styles.unauthorizedTitle}>Pristup ograničen</Text>
          <Text style={styles.unauthorizedText}>
            Potrebne su administratorske privilegije za pristup ovoj stranici
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Nazad</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Učitavam admin panel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentContent = getCurrentSectionContent();

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.enhancedHeader}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Dobrodošli, {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.onPrimary} />
          </TouchableOpacity>
        </View>
        
        {/* Quick Stats Overview */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.totalContent}</Text>
            <Text style={styles.quickStatLabel}>Ukupno sadržaja</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: colors.warning.main }]}>{stats.totalPending}</Text>
            <Text style={styles.quickStatLabel}>Na čekanju</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: colors.success.main }]}>{stats.totalActive}</Text>
            <Text style={styles.quickStatLabel}>Aktivno</Text>
          </View>
        </View>
      </View>

      {/* Section Navigation */}
      <SectionNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        stats={stats}
        userRole={user?.role}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.secondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Add Button */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.text.onPrimary} />
          <Text style={styles.quickAddText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>{currentContent?.title}</Text>
          <Text style={styles.contentSubtitle}>
            {currentContent?.data?.length || 0} stavki
          </Text>
        </View>
        
        <ContentList
          data={currentContent?.data || []}
          type={currentContent?.type}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEdit={isAdmin ? (item) => {
            // Navigate to edit screen based on type
            const itemType = item.title ? 'lecture' : item.firstName ? 'daija' : item.name ? 'organization' : 'user';
            navigateToManagement(itemType === 'lecture' ? 'lectures' : itemType === 'daija' ? 'daije' : itemType === 'organization' ? 'organizations' : 'users', { editItem: item });
          } : undefined}
          onDelete={canDelete ? (item) => {
            Alert.alert(
              'Potvrdi brisanje',
              'Da li ste sigurni da želite obrisati ovu stavku?',
              [
                { text: 'Otkaži', style: 'cancel' },
                { text: 'Obriši', style: 'destructive', onPress: () => {
                  // Handle delete
                  console.log('Delete item:', item);
                }}
              ]
            );
          } : undefined}
          onApprove={currentContent?.showApprovalActions ? (item) => {
            const itemType = item.title ? 'lecture' : item.firstName ? 'daija' : 'organization';
            handleApproval(item._id, itemType, 'approve');
          } : undefined}
          onReject={currentContent?.showApprovalActions ? (item) => {
            const itemType = item.title ? 'lecture' : item.firstName ? 'daija' : 'organization';
            handleApproval(item._id, itemType, 'reject');
          } : undefined}
          showApprovalActions={currentContent?.showApprovalActions}
        />
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        approvalSettings={approvalSettings}
        onUpdateSettings={updateApprovalSettings}
      />

      {/* Add Options Modal */}
      <AddOptionsModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSelectOption={handleAddOption}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unauthorizedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  unauthorizedText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  enhancedHeader: {
    backgroundColor: colors.primary.main,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.onPrimary,
    opacity: 0.9,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.text.onPrimary,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  quickActionsGrid: {
    gap: 12,
  },
  modernActionCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledCard: {
    opacity: 0.6,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: colors.text.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusOverviewCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.main,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    marginLeft: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.divider,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: colors.text.onPrimary,
  },
  addOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  addOptionCard: {
    width: '48%',
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  addOptionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Section Navigation Styles
  sectionNavigation: {
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: 12,
  },
  sectionScrollContainer: {
    paddingHorizontal: 16,
  },
  sectionGroup: {
    marginRight: 24,
  },
  sectionGroupTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  activeSectionButton: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  sectionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBadgeText: {
    color: colors.text.onPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activeSectionButtonText: {
    color: colors.text.onPrimary,
  },
  // Search Container Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    marginLeft: 12,
  },
  // Quick Add Button Styles
  quickAddContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickAddText: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Content Container Styles
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  contentHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background.paper,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  // Content List Styles
  contentList: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  contentListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentItemText: {
    flex: 1,
  },
  contentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  contentItemSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyApprovalCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyApprovalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyApprovalSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  approvalCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  approvalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  approvalTextContainer: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  approvalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  approvalDate: {
    fontSize: 12,
    color: colors.text.secondary,
    opacity: 0.8,
  },
  approvalActions: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 12,
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  approveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  approvalImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginRight: 16,
  },
  approvalImage: {
    width: '100%',
    height: '100%',
  },
});

export default AdminDashboardScreen; 