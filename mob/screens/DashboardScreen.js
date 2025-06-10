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
import { applySorting } from '../utils/sortingUtils';
import { getApiUrl } from '../config';
import { getToken } from '../utils/authHelpers';

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
  const [activeSection, setActiveSection] = useState('predavanja');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data states
  const [data, setData] = useState({
    users: [],
    lectures: [],
    daije: [],
    organizations: [],
    suggestions: [],
    archivedSuggestions: [],
    suggestionsCount: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });

  // Counts for badges
  const [counts, setCounts] = useState({
    pendingLectures: 0,
    pendingDaije: 0,
    pendingOrganizations: 0,
    pendingSuggestions: 0,
    rejectedItems: 0
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

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get daija name by ID
  const getDaijaName = (daijaId) => {
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
        settingsRes
      ] = await Promise.all([
        usersService?.getAllUsers ? usersService.getAllUsers() : Promise.resolve([]),
        predavanjaService.getAllPredavanjaForAdmin(),
        daijeService.getAllDaije(),
        udruzenjaService.getAllUdruzenjaForAdmin(),
        suggestionsService?.getAllSuggestions ? suggestionsService.getAllSuggestions() : Promise.resolve([]),
        suggestionsService?.getArchivedSuggestions ? suggestionsService.getArchivedSuggestions() : Promise.resolve([]),
        // Load approval settings from server
        fetch(`${getApiUrl()}/api/settings/public`, {
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
        archivedSuggestions: Array.isArray(archivedSuggestionsRes) ? archivedSuggestionsRes : (archivedSuggestionsRes?.data ? (Array.isArray(archivedSuggestionsRes.data) ? archivedSuggestionsRes.data : []) : [])
      };

      setData(newData);

      // Update approval settings from server
      if (settingsRes && settingsRes.approvalSettings) {
        setApprovalSettings(settingsRes.approvalSettings);
      }

      // Calculate counts with safety checks
      const newCounts = {
        pendingLectures: (newData.lectures || []).filter(l => l.status === 'pending').length,
        pendingDaije: (newData.daije || []).filter(d => d.status === 'pending').length,
        pendingOrganizations: (newData.organizations || []).filter(o => o.status === 'pending').length,
        pendingSuggestions: (newData.suggestions || []).filter(s => s.status === 'pending').length,
        rejectedItems: [
          ...(newData.lectures || []).filter(l => l.status === 'rejected'),
          ...(newData.daije || []).filter(d => d.status === 'rejected'),
          ...(newData.organizations || []).filter(o => o.status === 'rejected')
        ].length
      };

      setCounts(newCounts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom učitavanja podataka');
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

  // Save approval settings to server
  const saveApprovalSettings = async (newSettings) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return false;
      }

      const response = await fetch(`${getApiUrl()}/api/settings/approval-settings`, {
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
        count: counts.pendingLectures + counts.pendingDaije + counts.pendingOrganizations,
        badge: true
      },
      {
        id: 'prijedlozi',
        title: 'Prijedlozi',
        icon: 'bulb-outline',
        color: COLORS.info,
        count: counts.pendingSuggestions,
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

  // Handle item press
  const handleItemPress = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowItemModal(true);
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

  // Confirm approval action
  const confirmApprovalAction = async () => {
    if (!selectedItem) {
      console.log('No selected item');
      return;
    }

    console.log('confirmApprovalAction called with selectedItem:', selectedItem);

    try {
      const { action, type, _id } = selectedItem;
      
      console.log('Extracted values:', { action, type, _id });
      
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
        default:
          console.error('Unknown item type:', type);
          throw new Error(`Unknown item type: ${type}`);
      }

      console.log('Selected service:', service);
      console.log('About to call updateStatus with:', { _id, action, rejectionReason });

      if (action === 'approve') {
        const result = await service.updateStatus(_id, 'approved');
        console.log('Approve result:', result);
      } else if (action === 'reject') {
        const result = await service.updateStatus(_id, 'rejected', rejectionReason);
        console.log('Reject result:', result);
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
      Alert.alert('Greška', `Došlo je do greške prilikom ažuriranja statusa: ${error.message}`);
    }
  };

  // Filter data based on search
  const filterData = (items, query) => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      const searchFields = [
        item.name,
        item.title,
        item.speaker,
        item.organization,
        item.email,
        item.username,
                    item.name,
        item.lastName
      ];
      
      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(lowerQuery)
      );
    });
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
        // Show only PENDING items in approval section
        const pendingLectures = (data.lectures || []).filter(l => l.status === 'pending').map(l => ({ ...l, type: 'lecture' }));
        const pendingDaije = (data.daije || []).filter(d => d.status === 'pending').map(d => ({ ...d, type: 'daija' }));
        const pendingOrgs = (data.organizations || []).filter(o => o.status === 'pending').map(o => ({ ...o, type: 'organization' }));
        
        // Apply sorting to each category separately, then combine
        const sortedPendingLectures = applySorting(pendingLectures, 'lectures', data.lectures || []);
        const sortedPendingDaije = applySorting(pendingDaije, 'daije', data.lectures || []);
        const sortedPendingOrgs = applySorting(pendingOrgs, 'organizations', data.lectures || []);
        
        items = [...sortedPendingLectures, ...sortedPendingDaije, ...sortedPendingOrgs];
        type = 'mixed';
        break;
      case 'odbijeno':
        // Show only REJECTED items
        const rejectedLectures = (data.lectures || []).filter(l => l.status === 'rejected').map(l => ({ ...l, type: 'lecture' }));
        const rejectedDaije = (data.daije || []).filter(d => d.status === 'rejected').map(d => ({ ...d, type: 'daija' }));
        const rejectedOrgs = (data.organizations || []).filter(o => o.status === 'rejected').map(o => ({ ...o, type: 'organization' }));
        
        // Apply sorting to each category separately, then combine
        const sortedRejectedLectures = applySorting(rejectedLectures, 'lectures', data.lectures || []);
        const sortedRejectedDaije = applySorting(rejectedDaije, 'daije', data.lectures || []);
        const sortedRejectedOrgs = applySorting(rejectedOrgs, 'organizations', data.lectures || []);
        
        items = [...sortedRejectedLectures, ...sortedRejectedDaije, ...sortedRejectedOrgs];
        type = 'mixed';
        break;
      case 'prijedlozi':
        items = data.suggestions || [];
        type = 'suggestion';
        break;
      default:
        items = [];
    }

    // Apply centralized sorting for single-type sections
    if (type !== 'mixed' && type !== 'user' && type !== 'suggestion') {
      items = applySorting(items, type, data.lectures || []);
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
    const itemType = type === 'mixed' ? item.type : type;
    
    return (
      <TouchableOpacity
        style={styles.dataItem}
        onPress={() => handleItemPress(item, itemType)}
      >
        <View style={styles.dataItemHeader}>
          <View style={styles.dataItemTitleContainer}>
            {itemType === 'lecture' && item.image && (
              <Image source={{ uri: item.image }} style={styles.dataItemImage} />
            )}
            <View style={styles.dataItemTextContainer}>
              <Text style={styles.dataItemTitle} numberOfLines={2}>
                {itemType === 'daija' 
                  ? `${item.title || ''} ${item.name || ''}`.trim() || 'Bez naziva'
                  : item.title || item.name || item.username || 'Bez naziva'
                }
              </Text>
            </View>
          </View>
          <View style={styles.dataItemActions}>
            {(activeSection === 'za-odobrenje' || item.status === 'pending') && (
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
          </View>
        </View>
        
        <View style={styles.dataItemInfo}>
          {itemType === 'lecture' && (
            <>
              <Text style={styles.dataItemSubtitle}>
                {(() => {
                  if (item.daijaId) {
                    const daijaName = getDaijaName(item.daijaId);
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
            <>
              <Text style={styles.dataItemSubtitle}>{item.email}</Text>
              <Text style={styles.dataItemDetail}>{item.role}</Text>
            </>
          )}
          {itemType === 'suggestion' && (
            <>
              <Text style={styles.dataItemSubtitle}>{item.submitterName}</Text>
              <Text style={styles.dataItemDetail}>{item.reason}</Text>
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
      default: return type;
    }
  };

  // Render main content
  const renderContent = () => {
    const { items } = getCurrentSectionData();

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>Nema podataka za prikaz</Text>
        </View>
      );
    }

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
        <Text style={styles.detailsTitle}>{selectedItem.title}</Text>
        
        {selectedItem.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedItem.image }} style={styles.detailsImage} />
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
              if (selectedItem.daijaId) {
                const daijaName = getDaijaName(selectedItem.daijaId);
                return daijaName || 'Daija iz baze podataka';
              }
              return selectedItem.speaker || 'Nije navedeno';
            })()}
          </Text>
        </View>

        {selectedItem.daijaId && (
          <View style={styles.detailRow}>
            <Ionicons name="id-card-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>ID Daije:</Text>
            <Text style={styles.detailValue}>{selectedItem.daijaId}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Organizacija:</Text>
          <Text style={styles.detailValue}>{selectedItem.organization || 'Nije navedeno'}</Text>
        </View>

        {selectedItem.organizationId && (
          <View style={styles.detailRow}>
            <Ionicons name="id-card-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailLabel}>ID Organizacije:</Text>
            <Text style={styles.detailValue}>{selectedItem.organizationId}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Datum:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.date)}</Text>
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
      </View>
    );

    const renderDaijaDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
        
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

        {selectedItem.biography && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Biografija:</Text>
            <Text style={styles.descriptionText}>{selectedItem.biography}</Text>
          </View>
        )}
      </View>
    );

    const renderOrganizationDetails = () => (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
        
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
          <Text style={styles.detailValue}>{selectedItem.role || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Kreiran:</Text>
          <Text style={styles.detailValue}>{formatDate(selectedItem.createdAt)}</Text>
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
              style={[styles.modalButton, styles.cancelButton]}
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
              style={[styles.modalButton, styles.cancelButton]}
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
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    paddingBottom: 20,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'medium',
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
    marginTop: 16,
    padding: 12,
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
  itemModalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
  cancelButton: {
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
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default DashboardScreen; 