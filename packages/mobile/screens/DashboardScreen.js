import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';
import { usersService } from '../services/usersService';
import suggestionsService from '../services/suggestionsService';
import { applySorting, sortLecturesByStatus } from '../utils/sortingUtils';
import { getApiUrl } from '../config';
import { getToken } from '../utils/authHelpers';
import AddContentPopup from '../components/AddContentPopup';
import AdvancedFilters from '../components/AdvancedFilters';
import UserForm from '../components/forms/UserForm';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getImageUrl } from '../utils/imageUtils';
import { appEvents, AUTH_EVENTS } from '../utils/eventEmitter';
import RoleBadge from '../components/RoleBadge';

const { width, height } = Dimensions.get('window');

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

const DashboardScreen = ({ onBack, userRole = 'admin', onDataChange }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  
  // Data states
  const [data, setData] = useState({
    users: [],
    lectures: [],
    daije: [],
    organizations: [],
    suggestions: [],
    archivedSuggestions: [],
    suggestionsCount: { total: 0, pending: 0, approved: 0, rejected: 0 },
    cancelledReports: []
  });

  // Counts for badges
  const [counts, setCounts] = useState({
    pendingDaije: 0,
    pendingOrganizations: 0,
    pendingSuggestions: 0,
    rejectedItems: 0,
    pendingCancelledReports: 0
  });

  // Approval settings
  const [approvalSettings, setApprovalSettings] = useState({
    lecture: true,
    daija: true,
    organization: true
  });

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reactivateReason, setReactivateReason] = useState('');
  
  // Bulk selection states
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get daija name by ID
  const getDaijaName = (daijaId, daijaObject = null) => {
    // If daija object is already provided (from populated data), use it
    if (daijaObject && typeof daijaObject === 'object') {
      return `${daijaObject.title || ''} ${daijaObject.name || ''}`.trim();
    }
    
    // Otherwise, look up by ID in the daije array
    if (!daijaId || !data.daije) return null;
    const daija = data.daije.find(d => d._id === daijaId);
    if (!daija) return null;
    return `${daija.title || ''} ${daija.name || ''}`.trim();
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        usersRes,
        lecturesRes,
        daijeRes,
        orgsRes,
        suggestionsRes,
        archivedSuggestionsRes,
        cancelledReportsRes,
        settingsRes
      ] = await Promise.all([
        usersService?.getAllUsers ? usersService.getAllUsers() : Promise.resolve([]),
        predavanjaService.getAllPredavanjaForAdmin(),
        daijeService.getAllDaijeForAdmin(),
        udruzenjaService.getAllUdruzenjaForAdmin(),
        suggestionsService?.getAllSuggestions ? suggestionsService.getAllSuggestions() : Promise.resolve([]),
        suggestionsService?.getArchivedSuggestions ? suggestionsService.getArchivedSuggestions() : Promise.resolve([]),
        predavanjaService.getCancelledReports('all').catch(() => ({ reports: [] })),
        // Load approval settings from server
        fetch(`${getApiUrl()}/settings/public`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => res.json()).catch(() => ({ approvalSettings: { lecture: true, daija: true, organization: true } }))
      ]);

      const newData = {
        users: Array.isArray(usersRes) ? usersRes : (usersRes?.data ? (Array.isArray(usersRes.data) ? usersRes.data : []) : []),
        lectures: Array.isArray(lecturesRes) ? lecturesRes : (lecturesRes?.data ? (Array.isArray(lecturesRes.data) ? lecturesRes.data : []) : []),
        daije: Array.isArray(daijeRes) ? daijeRes : (daijeRes?.data ? (Array.isArray(daijeRes.data) ? daijeRes.data : []) : []),
        organizations: Array.isArray(orgsRes) ? orgsRes : (orgsRes?.data ? (Array.isArray(orgsRes.data) ? orgsRes.data : []) : []),
        suggestions: Array.isArray(suggestionsRes) ? suggestionsRes : (suggestionsRes?.data ? (Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []) : []),
        archivedSuggestions: Array.isArray(archivedSuggestionsRes) ? archivedSuggestionsRes : (archivedSuggestionsRes?.data ? (Array.isArray(archivedSuggestionsRes.data) ? archivedSuggestionsRes.data : []) : []),
        cancelledReports: Array.isArray(cancelledReportsRes?.reports) ? cancelledReportsRes.reports : (Array.isArray(cancelledReportsRes) ? cancelledReportsRes : [])
      };

      setData(newData);

      // Update approval settings from server
      if (settingsRes && settingsRes.approvalSettings) {
        setApprovalSettings(settingsRes.approvalSettings);
      }

      // Calculate counts with safety checks
      const newCounts = {
        pendingDaije: (newData.daije || []).filter(d => d.status === 'pending').length,
        pendingOrganizations: (newData.organizations || []).filter(o => o.status === 'pending').length,
        pendingSuggestions: (newData.suggestions || []).filter(s => s.status === 'pending').length,
        pendingCancelledReports: (newData.cancelledReports || []).filter(r => r.status === 'pending').length,
        rejectedItems: [
          ...(newData.lectures || []).filter(l => l.status === 'rejected'),
          ...(newData.daije || []).filter(d => d.status === 'rejected'),
          ...(newData.organizations || []).filter(o => o.status === 'rejected')
        ].length
      };

      setCounts(newCounts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 403 || error.response?.status === 401) {
        // The apiClient will handle token refresh automatically
        // If we still get here, it means refresh failed
        Alert.alert(
          'Greška autentifikacije',
          'Molimo prijavite se ponovo.',
          [{ text: 'OK', onPress: onBack }]
        );
      } else {
        Alert.alert('Greška', 'Došlo je do greške prilikom učitavanja podataka');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Handle data changes (after approval/rejection/etc.)
  const handleDataChange = useCallback(async () => {
    await fetchData();
    // Notify parent component if callback provided
    if (onDataChange) {
      onDataChange();
    }
  }, [fetchData, onDataChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for auth events
  useEffect(() => {
    const unsubscribe = appEvents.on(AUTH_EVENTS.LOGIN_REQUIRED, () => {
      Alert.alert(
        'Sesija istekla',
        'Vaša sesija je istekla. Molimo prijavite se ponovo.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Call onBack to return to previous screen (usually login)
              if (onBack) {
                onBack();
              }
            }
          }
        ],
        { cancelable: false }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [onBack]);

  // Save approval settings to server
  const saveApprovalSettings = async (newSettings) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return false;
      }

      const response = await fetch(`${getApiUrl()}/settings/approval-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        setApprovalSettings(newSettings);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška pri spremanju postavki');
      }
    } catch (error) {
      console.error('Error saving approval settings:', error);
      Alert.alert('Greška', error.message || 'Greška pri spremanju postavki odobrenja');
      return false;
    }
  };

  // Menu items configuration
  const getMenuItems = () => {
    const mainItems = [
      {
        id: 'dashboard',
        title: 'Pregled',
        icon: 'grid-outline',
        color: COLORS.primary,
        count: 0
      },
      {
        id: 'predavanja',
        title: 'Dersovi',
        icon: 'book-outline',
        color: COLORS.primary,
        count: (data.lectures || []).filter(l => l.status === 'approved').length
      },
      {
        id: 'organizations',
        title: 'Udruženja',
        icon: 'business-outline',
        color: COLORS.info,
        count: (data.organizations || []).filter(o => o.status === 'approved').length
      },
      {
        id: 'daije',
        title: 'Daije',
        icon: 'people-outline',
        color: COLORS.success,
        count: (data.daije || []).filter(d => d.status === 'approved').length
      },
      {
        id: 'korisnici',
        title: 'Korisnici',
        icon: 'person-outline',
        color: COLORS.warning,
        count: (data.users || []).length
      }
    ];

    const approvalItems = [
      {
        id: 'za-odobrenje',
        title: 'Za odobrenje',
        icon: 'time-outline',
        color: COLORS.warning,
        count: counts.pendingDaije + counts.pendingOrganizations,
        badge: true
      },
      {
        id: 'prijedlozi',
        title: 'Prijedlozi',
        icon: 'bulb-outline',
        color: COLORS.info,
        count: counts.pendingSuggestions,
        badge: true
      },
      {
        id: 'otkazivanja',
        title: 'Otkazivanja',
        icon: 'alert-circle-outline',
        color: COLORS.warning,
        count: counts.pendingCancelledReports,
        badge: true
      }
    ];

    if (userRole === 'super_admin') {
      approvalItems.push({
        id: 'odbijeno',
        title: 'Odbijeno',
        icon: 'close-circle-outline',
        color: COLORS.error,
        count: counts.rejectedItems
      });
    }

    return { mainItems, approvalItems };
  };



  // Handle approval action
  const handleApprovalAction = (item, action) => {
    console.log('handleApprovalAction called:', { item, action });
    setSelectedItem({ ...item, action });
    if (action === 'reject') {
      setRejectionReason('');
    }
    setShowApprovalModal(true);
  };

  // Handle archive suggestion
  const handleArchiveSuggestion = async (item) => {
    try {
      await suggestionsService.archiveSuggestion(item._id);
      
      // Update local state
      setData(prev => ({
        ...prev,
        suggestions: prev.suggestions.filter(s => s._id !== item._id),
        archivedSuggestions: [...prev.archivedSuggestions, { ...item, archived: true }]
      }));
      
      
      Alert.alert('Uspjeh', 'Prijedlog je arhiviran');
    } catch (error) {
      console.error('Error archiving suggestion:', error);
      Alert.alert('Greška', 'Greška pri arhiviranju prijedloga');
    }
  };

  // Confirm approval action
  const confirmApprovalAction = async () => {
    if (!selectedItem) {
      console.log('No selected item');
      return;
    }

    try {
      const { action, type, _id } = selectedItem;
      
      let service;
      switch (type) {
        case 'lecture':
          service = predavanjaService;
          break;
        case 'daija':
          service = daijeService;
          break;
        case 'organization':
          service = udruzenjaService;
          break;
        case 'suggestion':
          service = suggestionsService;
          break;
        case 'cancelled_report':
          // Handle cancelled reports differently
          if (action === 'approve') {
            await predavanjaService.reviewCancelledReport(_id, 'approve', 'Odobreno iz mobile dashboard-a');
          } else if (action === 'reject') {
            await predavanjaService.reviewCancelledReport(_id, 'reject', rejectionReason || 'Odbačeno iz mobile dashboard-a');
          }
          
          setShowApprovalModal(false);
          setSelectedItem(null);
          setRejectionReason('');
          await handleDataChange();

          Alert.alert(
            'Uspjeh',
            `Prijava otkazivanja je uspješno ${action === 'approve' ? 'odobrena' : 'odbačena'}`
          );
          return;
        default:
          throw new Error(`Unknown item type: ${type}`);
      }

      if (action === 'approve') {
        await service.updateStatus(_id, 'approved');
      } else if (action === 'reject') {
        await service.updateStatus(_id, 'rejected', rejectionReason);
      }

      setShowApprovalModal(false);
      setSelectedItem(null);
      setRejectionReason('');
      await handleDataChange();

      Alert.alert(
        'Uspjeh',
        `Stavka je uspješno ${action === 'approve' ? 'odobrena' : 'odbačena'}`
      );

    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Greška',
        'Došlo je do greške prilikom ažuriranja statusa. Molimo provjerite vašu internet konekciju i pokušajte ponovo.'
      );
    }
  };

  // Filter data based on search and advanced filters
  const filterData = (items, query) => {
    let filtered = items;
    
    // Apply search query
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(item => {
        const searchFields = [
          item.name,
          item.title,
          item.speaker,
          item.organization,
          item.email,
          item.username,
          item.firstName,
          item.lastName,
          item.city
        ];
        
        return searchFields.some(field => 
          field && field.toString().toLowerCase().includes(lowerQuery)
        );
      });
    }
    
    // Apply advanced filters
    if (Object.keys(activeFilters).length > 0) {
      // Date filters
      if (activeFilters.dateFrom) {
        filtered = filtered.filter(item => {
          if (!item.date) return false;
          return new Date(item.date) >= new Date(activeFilters.dateFrom);
        });
      }
      
      if (activeFilters.dateTo) {
        filtered = filtered.filter(item => {
          if (!item.date) return false;
          return new Date(item.date) <= new Date(activeFilters.dateTo);
        });
      }
      
      // Status filter
      if (activeFilters.status) {
        filtered = filtered.filter(item => item.status === activeFilters.status);
      }
      
      // City filter
      if (activeFilters.city) {
        filtered = filtered.filter(item => item.city === activeFilters.city);
      }
      
      // Organization filter
      if (activeFilters.organization) {
        filtered = filtered.filter(item => item.organization === activeFilters.organization);
      }
      
      // Speaker filter
      if (activeFilters.speaker) {
        const speakerQuery = activeFilters.speaker.toLowerCase();
        filtered = filtered.filter(item => 
          item.speaker && item.speaker.toLowerCase().includes(speakerQuery)
        );
      }
      
      // Image filter
      if (activeFilters.hasImage === true) {
        filtered = filtered.filter(item => item.image);
      }
      
      // Sort
      if (activeFilters.sortBy) {
        filtered = [...filtered].sort((a, b) => {
          let aVal = a[activeFilters.sortBy];
          let bVal = b[activeFilters.sortBy];
          
          // Handle dates
          if (activeFilters.sortBy === 'date' || activeFilters.sortBy === 'createdAt') {
            aVal = new Date(aVal || 0);
            bVal = new Date(bVal || 0);
          }
          
          if (activeFilters.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }
    }
    
    return filtered;
  };
  
  // Handle filter apply
  const handleFiltersApply = (filters) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };
  
  // Get filter badge count
  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(
      key => key !== 'sortBy' && key !== 'sortOrder'
    ).length;
  };

  // Get current section data
  const getCurrentSectionData = () => {
    let items = [];
    let type = '';

    switch (activeSection) {
      case 'predavanja':
        // Show only APPROVED lectures in main menu
        items = (data.lectures || []).filter(l => l.status === 'approved');
        type = 'lectures';
        break;
      case 'organizations':
        // Show only APPROVED organizations in main menu
        items = (data.organizations || []).filter(o => o.status === 'approved');
        type = 'organizations';
        break;
      case 'daije':
        // Show only APPROVED daije in main menu
        items = (data.daije || []).filter(d => d.status === 'approved');
        type = 'daije';
        break;
      case 'korisnici':
        items = data.users || [];
        type = 'user';
        break;
      case 'za-odobrenje':
        // Show only PENDING items in approval section (lectures no longer need approval)
        const pendingDaije = (data.daije || []).filter(d => d.status === 'pending').map(d => ({ ...d, type: 'daija' }));
        const pendingOrgs = (data.organizations || []).filter(o => o.status === 'pending').map(o => ({ ...o, type: 'organization' }));
        
        // Apply sorting to each category separately
        const sortedPendingDaije = applySorting(pendingDaije, 'daije', data.lectures || []);
        const sortedPendingOrgs = applySorting(pendingOrgs, 'organizations', data.lectures || []);
        
        items = [...sortedPendingDaije, ...sortedPendingOrgs];
        type = 'mixed';
        break;
      case 'odbijeno':
        // Show only REJECTED items
        const rejectedLectures = (data.lectures || []).filter(l => l.status === 'rejected').map(l => ({ ...l, type: 'lecture' }));
        const rejectedDaije = (data.daije || []).filter(d => d.status === 'rejected').map(d => ({ ...d, type: 'daija' }));
        const rejectedOrgs = (data.organizations || []).filter(o => o.status === 'rejected').map(o => ({ ...o, type: 'organization' }));
        
        // Apply sorting to each category separately, then combine
        const sortedRejectedLectures = sortLecturesByStatus(rejectedLectures);
        const sortedRejectedDaije = applySorting(rejectedDaije, 'daije', data.lectures || []);
        const sortedRejectedOrgs = applySorting(rejectedOrgs, 'organizations', data.lectures || []);
        
        items = [...sortedRejectedLectures, ...sortedRejectedDaije, ...sortedRejectedOrgs];
        type = 'mixed';
        break;
      case 'prijedlozi':
        items = data.suggestions || [];
        type = 'suggestion';
        break;
      case 'otkazivanja':
        items = (data.cancelledReports || []).map(r => ({ ...r, type: 'cancelled_report' }));
        type = 'mixed';
        break;
      default:
        items = [];
    }

    // Apply centralized sorting for single-type sections
    if (type !== 'mixed' && type !== 'user' && type !== 'suggestion') {
      if (type === 'lectures') {
        items = sortLecturesByStatus(items);
      } else {
        items = applySorting(items, type, data.lectures || []);
      }
    }

    return { items: filterData(items, searchQuery), type };
  };

  // Render navigation header
  const renderNavigationHeader = () => {
    const { mainItems, approvalItems } = getMenuItems();

    return (
      <View style={styles.navigationHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.navSection}>
            <Text style={styles.navSectionTitle}>GLAVNI MENI</Text>
            <View style={styles.navItemsRow}>
              {mainItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navItem,
                    activeSection === item.id && styles.navItemActive
                  ]}
                  onPress={() => setActiveSection(item.id)}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={activeSection === item.id ? COLORS.white : item.color}
                  />
                  <Text style={[
                    styles.navItemText,
                    activeSection === item.id && styles.navItemTextActive
                  ]}>
                    {item.title}
                  </Text>
                  {item.count > 0 && (
                    <View style={styles.navItemCount}>
                      <Text style={styles.navItemCountText}>{item.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.navSection}>
            <Text style={styles.navSectionTitle}>ODOBRAVANJE</Text>
            <View style={styles.navItemsRow}>
              {approvalItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navItem,
                    activeSection === item.id && styles.navItemActive
                  ]}
                  onPress={() => setActiveSection(item.id)}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={activeSection === item.id ? COLORS.white : item.color}
                  />
                  <Text style={[
                    styles.navItemText,
                    activeSection === item.id && styles.navItemTextActive
                  ]}>
                    {item.title}
                  </Text>
                  {item.count > 0 && (
                    <View style={[
                      styles.navItemCount,
                      item.badge && styles.navItemBadge
                    ]}>
                      <Text style={styles.navItemCountText}>{item.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettingsModal(true)}
      >
        <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  // Render data item
  const renderDataItem = ({ item }) => {
    const { type } = getCurrentSectionData();
    let itemType = type === 'mixed' ? item.type : type;
    
    // Map plural types to singular for edit mode
    if (itemType === 'lectures') itemType = 'lecture';
    if (itemType === 'organizations') itemType = 'organization';
    if (itemType === 'daije') itemType = 'daija';
    
    const canEdit = userRole === 'admin' || userRole === 'super_admin';
    const canDelete = userRole === 'super_admin';
    const canApprove = userRole === 'admin' || userRole === 'super_admin';
    const isSelected = selectedItems.includes(item._id);

    return (
      <TouchableOpacity
        style={[
          styles.dataItem,
          bulkMode && isSelected && styles.dataItemSelected
        ]}
        onPress={() => {
          if (bulkMode) {
            toggleItemSelection(item._id);
          } else {
            setSelectedItem({ ...item, type: itemType });
            setShowItemModal(true);
          }
        }}
        onLongPress={() => {
          if (!bulkMode) {
            toggleBulkMode();
            toggleItemSelection(item._id);
          }
        }}
      >
        <View style={styles.dataItemHeader}>
          {/* Bulk mode checkbox */}
          {bulkMode && (
            <View style={styles.bulkCheckbox}>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={24} 
                color={isSelected ? COLORS.primary : COLORS.gray} 
              />
            </View>
          )}
          <View style={styles.dataItemTitleContainer}>
            {/* Show images for all item types that have them */}
            {((itemType === 'lecture' || activeSection === 'predavanja') || 
              (itemType === 'daija' || activeSection === 'daije') || 
              (itemType === 'organization' || activeSection === 'udruzenja')) && item.image && (
              <Image 
                source={{ uri: getImageUrl(item.image) }} 
                style={styles.dataItemImage}
                onError={(e) => {
                  console.log('Image load error:', e.nativeEvent.error);
                }}
              />
            )}
            <View style={styles.dataItemTextContainer}>
              {itemType === 'user' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.dataItemTitle, { flex: 1 }]} numberOfLines={2}>
                    {item.firstName || item.username || item.email}
                  </Text>
                  <RoleBadge role={item.role || 'user'} size="small" />
                </View>
              ) : (
                <Text style={styles.dataItemTitle} numberOfLines={2}>
                  {itemType === 'daija'
                    ? `${item.title || ''} ${item.name || ''}`.trim() || 'Bez naziva'
                    : item.title || item.name || item.username}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.dataItemActions}>
            {((activeSection === 'za-odobrenje' || item.status === 'pending') || 
              (activeSection === 'otkazivanja' && item.status === 'pending')) && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprovalAction(item, 'approve')}
                >
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleApprovalAction(item, 'reject')}
                >
                  <Ionicons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </>
            )}
            {/* Archive button for suggestions */}
            {activeSection === 'prijedlozi' && !item.archived && (
              <TouchableOpacity
                style={[styles.actionButton, styles.archiveButton]}
                onPress={() => handleArchiveSuggestion(item)}
              >
                <Ionicons name="archive-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
            {(activeSection === 'predavanja' || activeSection === 'daije' || activeSection === 'udruzenja') && (
              <>
                {/* Cancel button for lectures only */}
                {(itemType === 'lecture' || activeSection === 'predavanja') && !item.cancelled && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelLecture(item)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                )}
                {/* Reactivate button for cancelled lectures only */}
                {(itemType === 'lecture' || activeSection === 'predavanja') && item.cancelled && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reactivateButton]}
                    onPress={() => handleReactivateLecture(item)}
                  >
                    <Ionicons name="refresh-circle-outline" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditItem(item, itemType)}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteItem(item, itemType)}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.dataItemInfo}>
          {(itemType === 'lecture' || activeSection === 'predavanja') && (
            <>
              <Text style={styles.dataItemSubtitle}>
                {(() => {
                  if (item.daijaId || item.daija) {
                    const daijaName = getDaijaName(item.daijaId, item.daija);
                    return daijaName || 'Daija iz baze';
                  }
                  return item.speaker || 'Nema predavača';
                })()}
              </Text>
              <Text style={styles.dataItemDetail}>
                {item.organization || 'Nema organizacije'} • {item.city || 'Nema mjesta'}
              </Text>
              <Text style={styles.dataItemDetail}>
                {item.date ? formatDate(item.date) : 'Nema datuma'} • {item.time || 'Nema vremena'}
              </Text>
            </>
          )}
          {itemType === 'daija' && (
            <>
              <Text style={styles.dataItemSubtitle}>{item.organization || 'Nema organizacije'}</Text>
              <Text style={styles.dataItemDetail}>{item.education || 'Nema obrazovanja'}</Text>
            </>
          )}
          {itemType === 'organization' && (
            <>
              <Text style={styles.dataItemSubtitle}>{item.city}</Text>
              <Text style={styles.dataItemDetail}>{item.address}</Text>
            </>
          )}
          {itemType === 'user' && (
            <Text style={styles.dataItemSubtitle}>{item.email}</Text>
          )}
          {itemType === 'suggestion' && (
            <>
              <Text style={styles.dataItemSubtitle}>{item.submitterName}</Text>
              <Text style={styles.dataItemDetail}>{item.reason}</Text>
            </>
          )}
          {itemType === 'cancelled_report' && (
            <>
              <Text style={styles.dataItemSubtitle}>
                {item.lecture_id?.title || 'N/A'}
              </Text>
              <Text style={styles.dataItemDetail}>
                Korisnik: {item.user_id ? `${item.user_id.firstName || ''} ${item.user_id.lastName || ''}`.trim() || item.user_id.email : 'N/A'}
              </Text>
              <Text style={styles.dataItemDetail}>
                Platforma: {item.platform === 'web' ? 'Web' : 'Mobilna'} • {formatDate(item.createdAt || item.timestamp)}
              </Text>
              {item.reason && (
                <Text style={styles.dataItemDetail} numberOfLines={2}>
                  Razlog: {item.reason}
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.dataItemFooter}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {type === 'mixed' && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{getTypeText(item.type)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Handle edit item
  const handleEditItem = (item, itemType) => {
    setSelectedItem({ ...item, itemType });
    setShowEditModal(true);
  };

  // Handle delete item
  const handleDeleteItem = (item, itemType) => {
    const itemName = item.title || item.name || 'stavku';
    Alert.alert(
      'Potvrda brisanja',
      `Jeste li sigurni da želite obrisati "${itemName}"?`,
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              let service;
              switch (itemType) {
                case 'lecture':
                  service = predavanjaService;
                  break;
                case 'daija':
                  service = daijeService;
                  break;
                case 'organization':
                  service = udruzenjaService;
                  break;
                default:
                  Alert.alert('Greška', 'Nepoznat tip stavke');
                  return;
              }
              
              await service.deleteItem(item._id);
              await handleDataChange();
              Alert.alert('Uspjeh', `"${itemName}" je uspješno obrisano`);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja');
            }
          }
        }
      ]
    );
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };
  
  // Handle add new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    Alert.alert(
      'Potvrda brisanja korisnika',
      `Jeste li sigurni da želite obrisati korisnika "${user.username}"?\n\nOva akcija je nepovratna!`,
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              if (usersService?.deleteUser) {
                await usersService.deleteUser(user._id);
                await handleDataChange();
                Alert.alert('Uspjeh', `Korisnik "${user.username}" je uspješno obrisan`);
              } else {
                Alert.alert('Greška', 'Funkcionalnost brisanja korisnika nije dostupna');
              }
            } catch (error) {
              console.error('Delete user error:', error);
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja korisnika');
            }
          }
        }
      ]
    );
  };

  // Handle cancel lecture
  const handleCancelLecture = (lecture) => {
    if (lecture.cancelled) {
      Alert.alert('Greška', 'Predavanje je već otkazano');
      return;
    }
    setSelectedItem(lecture);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Handle reactivate lecture
  const handleReactivateLecture = (lecture) => {
    if (!lecture.cancelled) {
      Alert.alert('Greška', 'Predavanje nije otkazano');
      return;
    }
    setSelectedItem(lecture);
    setReactivateReason('');
    setShowReactivateModal(true);
  };

  // Confirm cancel lecture
  const confirmCancelLecture = async () => {
    if (!selectedItem || !cancelReason.trim()) {
      Alert.alert('Greška', 'Molimo unesite razlog otkazivanja');
      return;
    }

    if (cancelReason.trim().length < 10) {
      Alert.alert('Greška', 'Razlog mora biti najmanje 10 karaktera');
      return;
    }

    try {
      await predavanjaService.cancelLectureDirectly(selectedItem._id, cancelReason.trim());
      
      // Update local state
      setData(prev => ({
        ...prev,
        lectures: prev.lectures.map(l => 
          l._id === selectedItem._id 
            ? { 
                ...l, 
                cancelled: true, 
                cancelled_at: new Date().toISOString(),
                cancelled_reason: cancelReason.trim(),
                status: 'cancelled'
              }
            : l
        )
      }));
      
      setShowCancelModal(false);
      setSelectedItem(null);
      setCancelReason('');
      await handleDataChange();

      Alert.alert(
        'Uspjeh',
        `Predavanje "${selectedItem.title}" je uspješno otkazano`
      );

    } catch (error) {
      console.error('Error cancelling lecture:', error);
      Alert.alert(
        'Greška', 
        error.response?.data?.message || 'Došlo je do greške prilikom otkazivanja predavanja'
      );
    }
  };

  // Toggle bulk mode
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedItems([]);
    // Disable drag mode when entering bulk mode
  };
  
  

  // Toggle item selection in bulk mode
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Select all items
  const selectAllItems = () => {
    const { items } = getCurrentSectionData();
    const allIds = items.map(item => item._id);
    setSelectedItems(allIds);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedItems.length === 0) {
      Alert.alert('Greška', 'Nema odabranih stavki');
      return;
    }

    try {
      const { type } = getCurrentSectionData();
      let service;
      
      switch (type) {
        case 'lectures':
        case 'lecture':
          service = predavanjaService;
          break;
        case 'daije':
        case 'daija':
          service = daijeService;
          break;
        case 'organizations':
        case 'organization':
          service = udruzenjaService;
          break;
        default:
          Alert.alert('Greška', 'Nepoznat tip stavke');
          return;
      }

      // Update all selected items
      const promises = selectedItems.map(id => 
        service.updateStatus(id, newStatus)
      );
      
      await Promise.all(promises);
      
      Alert.alert(
        'Uspjeh', 
        `${selectedItems.length} stavki je uspješno ažurirano na status: ${newStatus}`
      );
      
      // Reset selection and refresh data
      setSelectedItems([]);
      setBulkMode(false);
      setShowBulkActionsModal(false);
      await handleDataChange();
      
    } catch (error) {
      console.error('Error bulk updating status:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom ažuriranja statusa');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Greška', 'Nema odabranih stavki');
      return;
    }

    Alert.alert(
      'Potvrda brisanja',
      `Jeste li sigurni da želite obrisati ${selectedItems.length} odabranih stavki?`,
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              const { type } = getCurrentSectionData();
              let service;
              
              switch (type) {
                case 'lectures':
                case 'lecture':
                  service = predavanjaService;
                  break;
                case 'daije':
                case 'daija':
                  service = daijeService;
                  break;
                case 'organizations':
                case 'organization':
                  service = udruzenjaService;
                  break;
                case 'users':
                case 'user':
                  service = usersService;
                  break;
                default:
                  Alert.alert('Greška', 'Nepoznat tip stavke');
                  return;
              }

              // Delete all selected items
              const promises = selectedItems.map(id => 
                service.deleteItem ? service.deleteItem(id) : 
                service.deleteUser ? service.deleteUser(id) :
                Promise.reject('No delete method')
              );
              
              await Promise.all(promises);
              
              Alert.alert(
                'Uspjeh', 
                `${selectedItems.length} stavki je uspješno obrisano`
              );
              
              // Reset selection and refresh data
              setSelectedItems([]);
              setBulkMode(false);
              setShowBulkActionsModal(false);
              await handleDataChange();
              
            } catch (error) {
              console.error('Error bulk deleting:', error);
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja');
            }
          }
        }
      ]
    );
  };

  // Handle reactivate lecture confirmation
  const handleReactivateConfirm = async () => {
    if (!selectedItem) {
      Alert.alert('Greška', 'Nema odabranog predavanja');
      return;
    }

    if (!reactivateReason.trim()) {
      Alert.alert('Greška', 'Razlog reaktiviranja je obavezan');
      return;
    }

    if (reactivateReason.trim().length < 5) {
      Alert.alert('Greška', 'Razlog mora biti najmanje 5 karaktera');
      return;
    }

    try {
      await predavanjaService.reactivateLecture(selectedItem._id, reactivateReason.trim());
      
      // Update local state
      setData(prev => ({
        ...prev,
        lectures: prev.lectures.map(l => 
          l._id === selectedItem._id 
            ? { 
                ...l, 
                cancelled: false,
                status: 'approved',
                reactivated_at: new Date().toISOString(),
                reactivated_reason: reactivateReason.trim()
              }
            : l
        ),
        // Also update cancelled reports to reflect the lecture status change
        cancelledReports: prev.cancelledReports.map(r => 
          r.lecture_id && r.lecture_id._id === selectedItem._id
            ? {
                ...r,
                lecture_id: {
                  ...r.lecture_id,
                  cancelled: false,
                  status: 'approved'
                }
              }
            : r
        )
      }));
      
      setShowReactivateModal(false);
      setSelectedItem(null);
      setReactivateReason('');
      await handleDataChange();

      Alert.alert(
        'Uspjeh',
        `Predavanje "${selectedItem.title}" je uspješno reaktivirano`
      );

    } catch (error) {
      console.error('Error reactivating lecture:', error);
      Alert.alert(
        'Greška', 
        error.response?.data?.message || 'Došlo je do greške prilikom reaktiviranja predavanja'
      );
    }
  };

  // Helper functions for status and type
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return COLORS.success + '20';
      case 'rejected': return COLORS.error + '20';
      case 'pending': return COLORS.warning + '20';
      default: return COLORS.gray + '20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Odobreno';
      case 'rejected': return 'Odbačeno';
      case 'pending': return 'Na čekanju';
      default: return 'Nepoznato';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.error;
      case 'pending': return COLORS.warning;
      default: return COLORS.gray;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'lecture': return 'Ders';
      case 'daija': return 'Daija';
      case 'organization': return 'Udruženje';
      case 'user': return 'Korisnik';
      case 'suggestion': return 'Prijedlog';
      case 'cancelled_report': return 'Prijava otkazivanja';
      default: return type;
    }
  };

  // Render statistics dashboard
  const renderStatistics = () => {
    const stats = [
      {
        title: 'Ukupno Dersova',
        count: data.lectures.length,
        icon: 'book-outline',
        color: COLORS.primary
      },
      {
        title: 'Odobrenih Dersova',
        count: data.lectures.filter(l => l.status === 'approved').length,
        icon: 'checkmark-circle-outline',
        color: COLORS.success
      },
      {
        title: 'Korisnika',
        count: data.users.length,
        icon: 'people-outline',
        color: COLORS.info
      },
      {
        title: 'Daija',
        count: data.daije.length,
        icon: 'person-outline',
        color: COLORS.primaryLight
      },
      {
        title: 'Udruženja',
        count: data.organizations.length,
        icon: 'business-outline',
        color: COLORS.secondary
      },
      {
        title: 'Na čekanju',
        count: counts.pendingDaije + counts.pendingOrganizations,
        icon: 'time-outline',
        color: COLORS.warning
      },
      {
        title: 'Prijedlozi',
        count: counts.pendingSuggestions,
        icon: 'bulb-outline',
        color: COLORS.info
      },
      {
        title: 'Odbijeno',
        count: counts.rejectedItems,
        icon: 'close-circle-outline',
        color: COLORS.error
      }
    ];

    return (
      <ScrollView
        style={styles.statsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Render main content
  const renderContent = () => {
    // Show statistics for dashboard section
    if (activeSection === 'dashboard') {
      return renderStatistics();
    }

    const { items, type } = getCurrentSectionData();
    const canEdit = userRole === 'admin' || userRole === 'super_admin';
    const canDelete = userRole === 'super_admin';

    if (isLoading) {
      return <LoadingSkeleton type="list" count={5} />;
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>Nema podataka za prikaz</Text>
        </View>
      );
    }

    // Use FlatList for rendering items
    return (
      <FlatList
        data={items}
        renderItem={renderDataItem}
        keyExtractor={(item, index) => item._id || item.id || `item-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Render item details modal
  const renderItemDetailsModal = () => {
    if (!selectedItem) return null;

    const renderLectureDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedItem.title || 'Bez naslova'}</Text>
        
        {selectedItem.image && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: getImageUrl(selectedItem.image) }} 
              style={styles.detailsImage}
              resizeMode="cover"
            />
          </View>
        )}

        {selectedItem.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Opis:</Text>
            <Text style={styles.descriptionText}>{selectedItem.description}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Predavač:</Text>
          <Text style={styles.detailValue}>
            {(() => {
              if (selectedItem.daijaId || selectedItem.daija) {
                const daijaName = getDaijaName(selectedItem.daijaId, selectedItem.daija);
                return daijaName || 'Daija iz baze';
              }
              return selectedItem.speaker || 'Nije navedeno';
            })()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Udruženje:</Text>
          <Text style={styles.detailValue}>{selectedItem.organization || 'Nije navedeno'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Datum:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.date) || 'Nije navedeno'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Vrijeme:</Text>
          <Text style={styles.detailValue}>{selectedItem.time || 'Nije navedeno'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Adresa:</Text>
          <Text style={styles.detailValue}>{selectedItem.address || 'Nije navedeno'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Mjesto:</Text>
          <Text style={styles.detailValue}>{selectedItem.city || 'Nije navedeno'}</Text>
        </View>

        {selectedItem.facebook && (
          <View style={styles.detailRow}>
            <Ionicons name="logo-facebook" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Facebook:</Text>
            <Text style={styles.detailValue}>{selectedItem.facebook}</Text>
          </View>
        )}

        {selectedItem.instagram && (
          <View style={styles.detailRow}>
            <Ionicons name="logo-instagram" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Instagram:</Text>
            <Text style={styles.detailValue}>{selectedItem.instagram}</Text>
          </View>
        )}

        {selectedItem.telegram && (
          <View style={styles.detailRow}>
            <Ionicons name="paper-plane-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Telegram:</Text>
            <Text style={styles.detailValue}>{selectedItem.telegram}</Text>
          </View>
        )}

        {selectedItem.viber && (
          <View style={styles.detailRow}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Viber:</Text>
            <Text style={styles.detailValue}>{selectedItem.viber}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Kreirano:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt) || 'Nije navedeno'}</Text>
        </View>

        {selectedItem.updatedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Ažurirano:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.updatedAt)}</Text>
          </View>
        )}
      </View>
    );

    const renderDaijaDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
        
        {selectedItem.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: getImageUrl(selectedItem.image) }} style={styles.detailsImage} />
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Titula:</Text>
          <Text style={styles.detailValue}>{selectedItem.title || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Organizacija:</Text>
          <Text style={styles.detailValue}>{selectedItem.organization || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{selectedItem.email || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Telefon:</Text>
          <Text style={styles.detailValue}>{selectedItem.phone || 'N/A'}</Text>
        </View>

        {selectedItem.dateOfBirth && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Datum rođenja:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.dateOfBirth)}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusTextColor(selectedItem.status) }]}>
            {getStatusText(selectedItem.status)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Kreiran:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt)}</Text>
        </View>

        {selectedItem.updatedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Ažuriran:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.updatedAt)}</Text>
          </View>
        )}

        {selectedItem.shortDescription && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Kratki opis:</Text>
            <Text style={styles.descriptionText}>{selectedItem.shortDescription}</Text>
          </View>
        )}

        {selectedItem.biography && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Biografija:</Text>
            <Text style={styles.descriptionText}>{selectedItem.biography}</Text>
          </View>
        )}

        {selectedItem.education && selectedItem.education.length > 0 && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Obrazovanje:</Text>
            {selectedItem.education.map((edu, index) => (
              <Text key={index} style={styles.descriptionText}>
                • {edu}
              </Text>
            ))}
          </View>
        )}
      </View>
    );

    const renderOrganizationDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
        
        {selectedItem.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: getImageUrl(selectedItem.image) }} style={styles.detailsImage} />
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{selectedItem.email || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Telefon:</Text>
          <Text style={styles.detailValue}>{selectedItem.phone || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Grad:</Text>
          <Text style={styles.detailValue}>{selectedItem.city || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="home-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Adresa:</Text>
          <Text style={styles.detailValue}>{selectedItem.address || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="globe-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Website:</Text>
          <Text style={styles.detailValue}>{selectedItem.website || 'N/A'}</Text>
        </View>

        {selectedItem.facebook && (
          <View style={styles.detailRow}>
            <Ionicons name="logo-facebook" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Facebook:</Text>
            <Text style={styles.detailValue}>{selectedItem.facebook}</Text>
          </View>
        )}

        {selectedItem.instagram && (
          <View style={styles.detailRow}>
            <Ionicons name="logo-instagram" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Instagram:</Text>
            <Text style={styles.detailValue}>{selectedItem.instagram}</Text>
          </View>
        )}

        {selectedItem.telegram && (
          <View style={styles.detailRow}>
            <Ionicons name="send-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Telegram:</Text>
            <Text style={styles.detailValue}>{selectedItem.telegram}</Text>
          </View>
        )}

        {selectedItem.viber && (
          <View style={styles.detailRow}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Viber:</Text>
            <Text style={styles.detailValue}>{selectedItem.viber}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusTextColor(selectedItem.status) }]}>
            {getStatusText(selectedItem.status)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Kreiran:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt)}</Text>
        </View>

        {selectedItem.updatedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Ažuriran:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.updatedAt)}</Text>
          </View>
        )}

        {selectedItem.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Opis:</Text>
            <Text style={styles.descriptionText}>{selectedItem.description}</Text>
          </View>
        )}
      </View>
    );

    const renderUserDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>
                          {selectedItem.name} {selectedItem.lastName}
        </Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Username:</Text>
          <Text style={styles.detailValue}>{selectedItem.username || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{selectedItem.email || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="shield-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Uloga:</Text>
          <RoleBadge role={selectedItem.role || 'user'} size="medium" showFullText={true} />
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Kreiran:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt)}</Text>
        </View>

        {selectedItem.updatedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Ažuriran:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.updatedAt)}</Text>
          </View>
        )}

        {selectedItem.lastLogin && (
          <View style={styles.detailRow}>
            <Ionicons name="log-in-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Zadnja prijava:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.lastLogin)}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="id-card-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>ID:</Text>
          <Text style={styles.detailValue}>{selectedItem._id}</Text>
        </View>
      </View>
    );

    const renderSuggestionDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedItem.title || 'Prijedlog'}</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Podnositelj:</Text>
          <Text style={styles.detailValue}>{selectedItem.submitterName || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{selectedItem.submitterEmail || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Datum:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt)}</Text>
        </View>

        {selectedItem.updatedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Ažuriran:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.updatedAt)}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusTextColor(selectedItem.status) }]}>
            {getStatusText(selectedItem.status)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="id-card-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>ID:</Text>
          <Text style={styles.detailValue}>{selectedItem._id}</Text>
        </View>

        {selectedItem.reason && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Razlog:</Text>
            <Text style={styles.descriptionText}>{selectedItem.reason}</Text>
          </View>
        )}

        {selectedItem.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Opis:</Text>
            <Text style={styles.descriptionText}>{selectedItem.description}</Text>
          </View>
        )}
      </View>
    );

    const renderCancelledReportDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Prijava otkazivanja</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="book-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Predavanje:</Text>
          <Text style={styles.detailValue}>{selectedItem.lecture_id?.title || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Korisnik:</Text>
          <Text style={styles.detailValue}>
            {selectedItem.user_id ? 
              `${selectedItem.user_id.firstName || ''} ${selectedItem.user_id.lastName || ''}`.trim() || selectedItem.user_id.email 
              : 'N/A'
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="phone-portrait-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Platforma:</Text>
          <Text style={styles.detailValue}>{selectedItem.platform === 'web' ? 'Web' : 'Mobilna'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Prijavljeno:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt || selectedItem.timestamp)}</Text>
        </View>

        {selectedItem.reviewed_at && (
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Pregledano:</Text>
            <Text style={styles.detailValue}>{formatDate(selectedItem.reviewed_at)}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusTextColor(selectedItem.status) }]}>
            {getStatusText(selectedItem.status)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="id-card-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>ID:</Text>
          <Text style={styles.detailValue}>{selectedItem._id}</Text>
        </View>

        {selectedItem.reason && selectedItem.reason.trim() && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Razlog otkazivanja:</Text>
            <Text style={styles.descriptionText}>{selectedItem.reason}</Text>
          </View>
        )}

        {selectedItem.admin_notes && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Napomene administratora:</Text>
            <Text style={styles.descriptionText}>{selectedItem.admin_notes}</Text>
          </View>
        )}

        {selectedItem.proof_image && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Dokaz priložen:</Text>
            <Text style={styles.descriptionText}>Da (slika)</Text>
          </View>
        )}
      </View>
    );

    const renderDetails = () => {
      switch (selectedItem.type) {
        case 'lecture':
          return renderLectureDetails();
        case 'daija':
          return renderDaijaDetails();
        case 'organization':
          return renderOrganizationDetails();
        case 'user':
          return renderUserDetails();
        case 'suggestion':
          return renderSuggestionDetails();
        case 'cancelled_report':
          return renderCancelledReportDetails();
        default:
          return <Text>Nepoznat tip stavke</Text>;
      }
    };

    return (
      <Modal
        visible={showItemModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowItemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.itemModalContent}>
            {/* Header */}
            <View style={styles.itemModalHeader}>
              <Text style={styles.itemModalTitle}>
                {getTypeText(selectedItem.type)} - Detalji
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowItemModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(selectedItem.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(selectedItem.status)}</Text>
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.itemModalBody} showsVerticalScrollIndicator={false}>
              {renderDetails()}
            </ScrollView>

            {/* Actions */}
            <View style={styles.itemModalActionsContainer}>
              {/* Approval Actions for Pending Items */}
              {selectedItem.status === 'pending' && (
                <View style={styles.itemModalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={() => {
                      setShowItemModal(false);
                      handleApprovalAction(selectedItem, 'reject');
                    }}
                  >
                    <Ionicons name="close" size={16} color={COLORS.white} />
                    <Text style={styles.rejectButtonText}>Odbaci</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={() => {
                      setShowItemModal(false);
                      handleApprovalAction(selectedItem, 'approve');
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    <Text style={styles.approveButtonText}>Odobri</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Edit/Delete Actions for Super Admins */}
              {userRole === 'super_admin' && selectedItem.type !== 'user' && selectedItem.type !== 'suggestion' && (
                <View style={styles.itemModalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.editButton]}
                    onPress={() => {
                      setShowItemModal(false);
                      handleEditItem(selectedItem, selectedItem.type);
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color={COLORS.white} />
                    <Text style={styles.editButtonText}>Uredi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => {
                      setShowItemModal(false);
                      handleDeleteItem(selectedItem, selectedItem.type);
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                    <Text style={styles.deleteButtonText}>Obriši</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* User Management Actions for Super Admins */}
              {userRole === 'super_admin' && selectedItem.type === 'user' && (
                <View style={styles.itemModalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.editButton]}
                    onPress={() => {
                      setShowItemModal(false);
                      handleEditUser(selectedItem);
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color={COLORS.white} />
                    <Text style={styles.editButtonText}>Uredi korisnika</Text>
                  </TouchableOpacity>
                  {selectedItem.role !== 'super_admin' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.deleteButton]}
                      onPress={() => {
                        setShowItemModal(false);
                        handleDeleteUser(selectedItem);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                      <Text style={styles.deleteButtonText}>Obriši korisnika</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render approval modal
  const renderApprovalModal = () => (
    <Modal
      visible={showApprovalModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowApprovalModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedItem?.action === 'approve' ? 'Odobriti stavku?' : 'Odbaciti stavku?'}
          </Text>
          
          {selectedItem?.action === 'reject' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Razlog odbacivanja:</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Unesite razlog odbacivanja..."
                placeholderTextColor={COLORS.gray}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowApprovalModal(false)}
            >
              <Text style={styles.cancelButtonText}>Otkaži</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmApprovalAction}
            >
              <Text style={styles.confirmButtonText}>
                {selectedItem?.action === 'approve' ? 'Odobriti' : 'Odbaciti'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render settings modal
  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Postavke odobrenja</Text>
          
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dersovi</Text>
              <Switch
                value={approvalSettings.lecture}
                onValueChange={(value) => 
                  setApprovalSettings(prev => ({ ...prev, lecture: value }))
                }
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={approvalSettings.lecture ? COLORS.primary : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Daije</Text>
              <Switch
                value={approvalSettings.daija}
                onValueChange={(value) => 
                  setApprovalSettings(prev => ({ ...prev, daija: value }))
                }
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={approvalSettings.daija ? COLORS.primary : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Udruženja</Text>
              <Switch
                value={approvalSettings.organization}
                onValueChange={(value) => 
                  setApprovalSettings(prev => ({ ...prev, organization: value }))
                }
                trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
                thumbColor={approvalSettings.organization ? COLORS.primary : COLORS.gray}
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Otkaži</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={async () => {
                const success = await saveApprovalSettings(approvalSettings);
                if (success) {
                  setShowSettingsModal(false);
                  Alert.alert('Uspjeh', 'Postavke su uspješno spremljene');
                }
              }}
            >
              <Text style={styles.confirmButtonText}>Spremi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render edit modal using AddContentPopup
  const renderEditModal = () => (
    <AddContentPopup
      visible={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setSelectedItem(null);
      }}
      onSuccess={async () => {
        setShowEditModal(false);
        setSelectedItem(null);
        await handleDataChange();
      }}
      initialType={selectedItem?.itemType}
      editMode={true}
      editData={selectedItem}
    />
  );

  // Render cancel lecture modal
  const renderCancelModal = () => (
    <Modal
      visible={showCancelModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Otkaži predavanje</Text>
          
          {selectedItem && (
            <View style={styles.lectureInfoContainer}>
              <Text style={styles.lectureInfoLabel}>Predavanje za otkazivanje:</Text>
              <Text style={styles.lectureInfoTitle}>{selectedItem.title}</Text>
              {selectedItem.date && (
                <Text style={styles.lectureInfoDetail}>
                  {formatDate(selectedItem.date)} u {selectedItem.time}
                </Text>
              )}
              {selectedItem.organization && (
                <Text style={styles.lectureInfoDetail}>
                  {selectedItem.organization}
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Razlog otkazivanja *:</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              multiline
              numberOfLines={4}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Unesite razlog zašto otkazujete ovo predavanje... (minimum 10 karaktera)"
              placeholderTextColor={COLORS.gray}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Pažnja: Ova akcija će trajno otkazati predavanje. Korisnici neće moći da se prijave za ovo predavanje.
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setShowCancelModal(false);
                setCancelReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, styles.dangerButton]}
              onPress={confirmCancelLecture}
              disabled={!cancelReason.trim() || cancelReason.trim().length < 10}
            >
              <Text style={styles.confirmButtonText}>Otkaži predavanje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render reactivate lecture modal
  const renderReactivateModal = () => (
    <Modal
      visible={showReactivateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowReactivateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reaktiviraj predavanje</Text>
          
          {selectedItem && (
            <View style={styles.lectureInfoContainer}>
              <Text style={styles.lectureInfoLabel}>Predavanje za reaktivaciju:</Text>
              <Text style={styles.lectureInfoTitle}>{selectedItem.title}</Text>
              {selectedItem.date && (
                <Text style={styles.lectureInfoDetail}>
                  {formatDate(selectedItem.date)} u {selectedItem.time}
                </Text>
              )}
            </View>
          )}
          
          <Text style={styles.modalDescription}>
            Unesite razlog reaktiviranja predavanja (minimalno 5 karaktera):
          </Text>
          
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            placeholder="Razlog reaktiviranja..."
            value={reactivateReason}
            onChangeText={setReactivateReason}
            multiline={true}
            numberOfLines={4}
            maxLength={500}
          />
          
          <Text style={styles.characterCount}>
            {reactivateReason.length}/500 karaktera
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setShowReactivateModal(false);
                setSelectedItem(null);
                setReactivateReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, styles.successButton]}
              onPress={handleReactivateConfirm}
              disabled={!reactivateReason.trim() || reactivateReason.trim().length < 5}
            >
              <Text style={styles.confirmButtonText}>Reaktiviraj predavanje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render bulk actions bar
  const renderBulkActionsBar = () => {
    if (!bulkMode || selectedItems.length === 0) return null;
    
    return (
      <View style={styles.bulkActionsBar}>
        <View style={styles.bulkActionsLeft}>
          <Text style={styles.bulkSelectionText}>
            {selectedItems.length} odabrano
          </Text>
          <TouchableOpacity onPress={selectAllItems}>
            <Text style={styles.bulkActionLink}>Odaberi sve</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deselectAllItems}>
            <Text style={styles.bulkActionLink}>Poništi odabir</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bulkActionsRight}>
          <TouchableOpacity
            style={[styles.bulkActionButton, styles.bulkApproveButton]}
            onPress={() => handleBulkStatusChange('approved')}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.bulkActionButtonText}>Odobri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkActionButton, styles.bulkRejectButton]}
            onPress={() => handleBulkStatusChange('rejected')}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.white} />
            <Text style={styles.bulkActionButtonText}>Odbaci</Text>
          </TouchableOpacity>
          {(userRole === 'super_admin') && (
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.bulkDeleteButton]}
              onPress={handleBulkDelete}
            >
              <Ionicons name="trash" size={20} color={COLORS.white} />
              <Text style={styles.bulkActionButtonText}>Obriši</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Navigation */}
      {renderNavigationHeader()}

      {/* Search */}
      {renderSearchBar()}

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {renderItemDetailsModal()}
      {renderApprovalModal()}
      {renderSettingsModal()}
      {renderEditModal()}
      {renderCancelModal()}
      {renderReactivateModal()}
      
      {/* User Form Modal */}
      <UserForm
        visible={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setShowUserForm(false);
          setSelectedUser(null);
          fetchData(); // Reload all data after success
        }}
        editMode={!!selectedUser}
        editData={selectedUser}
      />
      
      {/* FAB for adding users - only visible for super_admin and when in users section */}
      {userRole === 'super_admin' && activeSection === 'korisnici' && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleAddUser}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
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
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  navigationHeader: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  navSection: {
    marginHorizontal: 16,
  },
  navSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  navItemsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    gap: 6,
  },
  navItemActive: {
    backgroundColor: COLORS.primary,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: 'medium',
    color: COLORS.gray,
  },
  navItemTextActive: {
    color: COLORS.white,
  },
  navItemCount: {
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  navItemBadge: {
    backgroundColor: COLORS.error,
  },
  navItemCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Safe area for bottom navigation (80px height + 20px extra space)
  },
  dataItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dataItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dataItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dataItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  dataItemTextContainer: {
    flex: 1,
  },
  dataItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dataItemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  cancelButton: {
    backgroundColor: COLORS.warning,
  },
  reactivateButton: {
    backgroundColor: COLORS.success,
  },
  archiveButton: {
    backgroundColor: COLORS.info,
  },
  dataItemInfo: {
    marginBottom: 12,
  },
  dataItemSubtitle: {
    fontSize: 14,
    fontWeight: 'medium',
    color: COLORS.gray,
    marginBottom: 4,
  },
  dataItemDetail: {
    fontSize: 12,
    color: COLORS.gray,
  },
  dataItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'medium',
    color: COLORS.gray,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.info + '20',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'medium',
    color: COLORS.info,
  },
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
    width: width - 40,
    maxWidth: 400,
  },
  itemModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: width - 20,
    maxHeight: height * 0.9,
    maxWidth: 500,
    marginHorizontal: 10,
  },
  itemModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  itemModalBody: {
    paddingHorizontal: 15,
  },
  detailsContainer: {
    paddingVertical: 0,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.primary,
    flex: 1,
    marginLeft: 8,
  },
  descriptionContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
  },
  itemModalActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemModalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'medium',
    color: COLORS.gray,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.gray,
    textAlignVertical: 'top',
  },
  settingsContainer: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'medium',
    color: COLORS.gray,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'medium',
    color: COLORS.white,
  },
  approveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  rejectButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  imageContainer: {
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  detailsImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  editForm: {
    padding: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  lectureInfoContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lectureInfoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  lectureInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  lectureInfoDetail: {
    fontSize: 14,
    color: COLORS.gray,
  },
  warningContainer: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.warning,
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  // Bulk mode styles
  bulkButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginLeft: 8,
  },
  bulkButtonActive: {
    backgroundColor: COLORS.primary,
  },
  // Statistics styles
  statsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  // Drag mode styles
  dragButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginLeft: 8,
  },
  dragButtonActive: {
    backgroundColor: COLORS.primary,
  },
  // Filter button styles
  filterButton: {
    position: 'relative',
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dataItemSelected: {
    backgroundColor: COLORS.primaryLight + '10',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  bulkCheckbox: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  bulkActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bulkActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulkSelectionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bulkActionLink: {
    fontSize: 12,
    color: COLORS.primaryLight,
    textDecorationLine: 'underline',
  },
  bulkActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  bulkActionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  bulkApproveButton: {
    backgroundColor: COLORS.success,
  },
  bulkRejectButton: {
    backgroundColor: COLORS.warning,
  },
  bulkDeleteButton: {
    backgroundColor: COLORS.error,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default DashboardScreen; 