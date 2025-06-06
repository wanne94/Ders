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
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { SERVER_URL } from '../config/api';
import UniversalCard from '../components/UniversalCard';

const { width, height } = Dimensions.get('window');

// Content Item Card Component
const ContentItemCard = ({ item, type, onEdit, onDelete, onStatusChange, onSelect, isSelected, canEdit, canDelete, onItemPress }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const getItemTitle = () => {
    switch (type) {
      case 'lectures':
        return item.title || 'Bez naziva';
      case 'daije':
        return `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Bez imena';
      case 'organizations':
        return item.name || 'Bez naziva';
      case 'users':
        return item.username || item.email || 'Bez imena';
      default:
        return 'Nepoznato';
    }
  };

  const getDefaultImagePath = () => {
    switch (type) {
      case 'lectures':
        return '/uploads/images/predavanjeslika.jpg';
      case 'daije':
        return '/uploads/images/daijaslika.jpg';
      case 'organizations':
        return '/uploads/images/udruzenjeslika.jpg';
      case 'users':
        return '/uploads/images/daijaslika.jpg'; // Use daija image as default for users
      default:
        return '/uploads/images/predavanjeslika.jpg';
    }
  };

  const getInfoRows = () => {
    switch (type) {
      case 'lectures':
        return [
          item.speaker && {
            icon: 'person-outline',
            text: item.speaker,
            highlightSearch: false
          },
          item.date && {
            icon: 'calendar-outline',
            text: new Date(item.date).toLocaleDateString('sr-RS'),
            highlightSearch: false
          },
          item.city && {
            icon: 'location-outline',
            text: item.city,
            highlightSearch: false
          }
        ].filter(Boolean);
      case 'daije':
        return [
          item.specialization && {
            icon: 'school-outline',
            text: item.specialization,
            highlightSearch: false
          },
          item.city && {
            icon: 'location-outline',
            text: item.city,
            highlightSearch: false
          }
        ].filter(Boolean);
      case 'organizations':
        return [
          item.shortDescription && {
            icon: 'document-text-outline',
            text: item.shortDescription,
            highlightSearch: false,
            numberOfLines: 2
          },
          item.city && {
            icon: 'location-outline',
            text: item.city,
            highlightSearch: false
          }
        ].filter(Boolean);
      case 'users':
        return [
          item.email && {
            icon: 'mail-outline',
            text: item.email,
            highlightSearch: false
          },
          item.role && {
            icon: 'shield-outline',
            text: item.role === 'admin' ? 'Administrator' : item.role === 'super_admin' ? 'Super Admin' : 'Korisnik',
            highlightSearch: false
          },
          item.createdAt && {
            icon: 'calendar-outline',
            text: new Date(item.createdAt).toLocaleDateString('sr-RS'),
            highlightSearch: false
          }
        ].filter(Boolean);
      default:
        return [];
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(item, newStatus);
    setMenuVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Main card using UniversalCard */}
      <TouchableOpacity
        onPress={() => onItemPress(item)}
        onLongPress={() => onSelect(item._id)}
        activeOpacity={0.7}
        style={styles.cardTouchable}
      >
        <UniversalCard
          title={getItemTitle()}
          infoRows={getInfoRows()}
          rightContentType="image"
          imageUrl={item.image}
          serverUrl={SERVER_URL}
          defaultImagePath={getDefaultImagePath()}
          titleStyle={type === 'lectures' ? { textTransform: 'uppercase' } : undefined}
          cardStyle={[
            styles.universalCardStyle,
            isSelected && styles.selectedCardStyle,
            type !== 'users' && { borderLeftWidth: 4, borderLeftColor: getStatusColor(item.status) }
          ]}
        />
      </TouchableOpacity>

      {/* Selection overlay - only visible when selected */}
      {isSelected && (
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark" size={16} color={colors.text.onPrimary} />
          </View>
        </View>
      )}

      {/* Admin menu button - subtle, top right - only for items with status */}
      {type !== 'users' && (
        <TouchableOpacity 
          style={styles.adminMenuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      )}

      {/* Action Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.actionMenu}>
            <Text style={styles.menuTitle} numberOfLines={2}>{getItemTitle()}</Text>
            
            {canEdit && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onEdit(item);
                }}
              >
                <Ionicons name="create-outline" size={20} color={colors.text.primary} />
                <Text style={styles.menuItemText}>Uredi</Text>
              </TouchableOpacity>
            )}

            {type !== 'users' && (
              <>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleStatusChange('approved')}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success.main} />
                  <Text style={styles.menuItemText}>Odobri</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleStatusChange('rejected')}
                >
                  <Ionicons name="close-circle-outline" size={20} color={colors.error.main} />
                  <Text style={styles.menuItemText}>Odbaci</Text>
                </TouchableOpacity>
              </>
            )}

            {canDelete && (
              <TouchableOpacity 
                style={[styles.menuItem, styles.deleteMenuItem]}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete(item);
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error.main} />
                <Text style={[styles.menuItemText, { color: colors.error.main }]}>Obriši</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return colors.success.main;
    case 'active': // Backward compatibility
      return colors.success.main;
    case 'pending':
      return colors.warning.main;
    case 'rejected':
      return colors.error.main;
    default:
      return colors.text.secondary;
  }
};

// Filter Chip Component
const FilterChip = ({ label, active, onPress, count }) => (
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

// Bulk Actions Bar Component
const BulkActionsBar = ({ selectedCount, onBulkAction, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <View style={styles.bulkActionsBar}>
      <View style={styles.bulkActionsLeft}>
        <Ionicons name="checkmark-circle" size={20} color={colors.text.onPrimary} />
        <Text style={styles.bulkActionsText}>{selectedCount} odabrano</Text>
      </View>
      <View style={styles.bulkActionsButtons}>
        <TouchableOpacity 
          style={[styles.bulkActionButton, { backgroundColor: colors.success.main }]}
          onPress={() => onBulkAction('approve')}
        >
          <Ionicons name="checkmark" size={16} color={colors.text.onPrimary} />
          <Text style={styles.bulkActionText}>Odobri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bulkActionButton, { backgroundColor: colors.error.main }]}
          onPress={() => onBulkAction('reject')}
        >
          <Ionicons name="close" size={16} color={colors.text.onPrimary} />
          <Text style={styles.bulkActionText}>Odbaci</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bulkActionButton, { backgroundColor: colors.text.secondary }]}
          onPress={onClearSelection}
        >
          <Ionicons name="close" size={16} color={colors.text.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AdminContentManagerScreen = ({ route, navigation }) => {
  const { type, title, filters = {}, canEdit = true, canDelete = false } = route.params;
  const { user } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(filters.status || 'all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchData = useCallback(async () => {
    try {
      const endpoints = {
        lectures: '/admin/lectures/all',
        daije: '/admin/daije/all',
        organizations: '/admin/organizations/all',
        users: '/users'
      };

      console.log('🔄 AdminContentManager - Fetching data for type:', type);
      console.log('🔄 AdminContentManager - Using endpoint:', endpoints[type]);
      
      const response = await axiosInstance.get(endpoints[type]);
      const responseData = Array.isArray(response.data) ? response.data : response.data[type] || [];
      
      console.log('✅ AdminContentManager - Received data count:', responseData.length);
      console.log('✅ AdminContentManager - Sample item:', responseData[0]);
      if (responseData[0]) {
        console.log('✅ AdminContentManager - Sample item image:', responseData[0].image);
      }
      
      setData(responseData);
    } catch (error) {
      console.error('❌ AdminContentManager - Error fetching data:', error);
      
      // Provide fallback data when API is not available
      setData([]);
      
      Alert.alert('Greška', 'Nije moguće učitati podatke sa servera. Prikazuju se prazni podaci.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    if (type === 'users') {
      // Users don't have status, so show all users in 'all' filter
      return {
        all: data.length,
        active: data.length, // All users are considered active
        pending: 0
      };
    }
    
    return {
      all: data.length,
      approved: data.filter(item => item.status === 'approved').length,
      pending: data.filter(item => item.status === 'pending').length,
      rejected: data.filter(item => item.status === 'rejected').length
    };
  }, [data, type]);

  // Filter data based on active filter
  const filteredData = useMemo(() => {
    if (type === 'users') {
      // Users don't have status filtering
      return data;
    }
    
    if (activeFilter === 'all') return data;
    return data.filter(item => item.status === activeFilter);
  }, [data, activeFilter, type]);

  // Quick filter mapping
  const filterMapping = {
    all: 'all',
    approved: 'approved',
    pending: 'pending',
    rejected: 'rejected',
    approve: 'approved', // For bulk actions
    reject: 'rejected'   // For bulk actions
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    // Users don't have status, so bulk actions don't apply
    if (type === 'users') {
      Alert.alert('Info', 'Bulk akcije nisu dostupne za korisnike');
      return;
    }

    const newStatus = filterMapping[action];
    if (!newStatus) return;

    try {
      const endpoints = {
        lectures: '/lectures',
        daije: '/daije',
        organizations: '/organizations',
        users: '/users'
      };

      await Promise.all(
        selectedItems.map(id => 
          axiosInstance.patch(`${endpoints[type]}/${id}`, { status: newStatus })
        )
      );

      // Update local state
      setData(prev => 
        prev.map(item => 
          selectedItems.includes(item._id) 
            ? { ...item, status: newStatus }
            : item
        )
      );

      setSelectedItems([]);
      Alert.alert('Uspjeh', `${selectedItems.length} stavki je uspješno ažurirano`);
    } catch (error) {
      console.error('Error updating items:', error);
      Alert.alert('Greška', 'Nije moguće osvježiti stavke');
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    // Users don't have status
    if (type === 'users') {
      Alert.alert('Info', 'Korisnici nemaju status koji se može mijenjati');
      return;
    }

    try {
      const endpoints = {
        lectures: '/lectures',
        daije: '/daije',
        organizations: '/organizations',
        users: '/users'
      };

      await axiosInstance.patch(`${endpoints[type]}/${item._id}`, { status: newStatus });

      // Update local state
      setData(prev => 
        prev.map(dataItem => 
          dataItem._id === item._id 
            ? { ...dataItem, status: newStatus }
            : dataItem
        )
      );

      Alert.alert('Uspjeh', 'Status je uspješno ažuriran');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Greška', 'Nije moguće osvježiti status');
    }
  };

  const handleEdit = (item) => {
    const routes = {
      lectures: 'LectureDetail',
      daije: 'DaijaDetail',
      organizations: 'OrganizationDetail',
      users: 'Profile' // Users can be edited through Profile screen
    };

    if (type === 'users') {
      // For users, navigate to profile screen with user data
      navigation.navigate(routes[type], {
        userId: item._id,
        isAdmin: true,
        mode: 'edit',
        returnTo: 'AdminContentManager'
      });
    } else {
      // For other types, navigate to detail screen in edit mode
      const paramKey = type === 'lectures' ? 'lectureId' : 
                       type === 'daije' ? 'daijaId' : 'organizationId';

      navigation.navigate(routes[type], {
        [paramKey]: item._id,
        isAdmin: true,
        mode: 'edit',
        returnTo: 'AdminContentManager'
      });
    }
  };

  const handleItemPress = (item) => {
    // Navigate to detail screen when item is tapped
    const routes = {
      lectures: 'LectureDetail',
      daije: 'DaijaDetail',
      organizations: 'OrganizationDetail',
      users: 'Profile'
    };

    if (type === 'users') {
      navigation.navigate(routes[type], {
        userId: item._id,
        returnTo: 'AdminContentManager'
      });
    } else {
      const paramKey = type === 'lectures' ? 'lectureId' : 
                       type === 'daije' ? 'daijaId' : 'organizationId';

      navigation.navigate(routes[type], {
        [paramKey]: item._id,
        returnTo: 'AdminContentManager'
      });
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Potvrda brisanja',
      `Da li ste sigurni da želite obrisati ovu stavku?`,
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Obriši', 
          style: 'destructive',
          onPress: async () => {
            try {
              const endpoints = {
                lectures: '/lectures',
                daije: '/daije',
                organizations: '/organizations',
                users: '/users'
              };

              await axiosInstance.delete(`${endpoints[type]}/${item._id}`);
              
              setData(prev => prev.filter(dataItem => dataItem._id !== item._id));
              Alert.alert('Uspjeh', 'Stavka je uspješno obrisana');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Greška', 'Nije moguće obrisati stavku');
            }
          }
        }
      ]
    );
  };

  const handleAdd = () => {
    const routes = {
      lectures: 'LectureDetail',
      daije: 'DaijaDetail',
      organizations: 'OrganizationDetail',
      users: 'Auth' // For adding users, navigate to Auth screen in registration mode
    };

    if (type === 'users') {
      // For users, navigate to Auth screen in admin mode
      navigation.navigate(routes[type], {
        isAdmin: true,
        mode: 'register',
        returnTo: 'AdminContentManager'
      });
    } else {
      navigation.navigate(routes[type], {
        isAdmin: true,
        mode: 'add'
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Učitavam podatke...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Content List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ContentItemCard
            item={item}
            type={type}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onSelect={handleItemSelect}
            isSelected={selectedItems.includes(item._id)}
            canEdit={canEdit}
            canDelete={canDelete}
            onItemPress={handleItemPress}
          />
        )}
        ListHeaderComponent={
          <View>
            {/* Search Bar with Add Button */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Pretraži..."
                placeholderTextColor={colors.text.secondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAdd}
              >
                <Ionicons name="add" size={24} color={colors.primary.main} />
              </TouchableOpacity>
            </View>

            {/* Filter Chips - only for items with status */}
            {type !== 'users' && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
              >
                <FilterChip
                  label="Sve"
                  active={activeFilter === 'all'}
                  onPress={() => setActiveFilter('all')}
                  count={filterCounts.all}
                />
                <FilterChip
                  label="Odobreno"
                  active={activeFilter === 'approved'}
                  onPress={() => setActiveFilter('approved')}
                  count={filterCounts.approved}
                />
                <FilterChip
                  label="Na čekanju"
                  active={activeFilter === 'pending'}
                  onPress={() => setActiveFilter('pending')}
                  count={filterCounts.pending}
                />
                <FilterChip
                  label="Odbačeno"
                  active={activeFilter === 'rejected'}
                  onPress={() => setActiveFilter('rejected')}
                  count={filterCounts.rejected}
                />
              </ScrollView>
            )}

            {/* Bulk Actions Bar - only for items with status */}
            {type !== 'users' && (
              <BulkActionsBar
                selectedCount={selectedItems.length}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedItems([])}
              />
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>Nema podataka</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Nema rezultata za vašu pretragu' : 'Nema dostupnih stavki'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    paddingTop: StatusBar.currentHeight || 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    marginHorizontal: 10,
    marginVertical: 1,
    marginTop: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginRight: 8,
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    height: 40,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.paper,
    borderWidth: 2,
    borderColor: colors.divider,
    marginRight: 0,
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
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 36,
    borderRadius: 8,
  },
  bulkActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkActionsText: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  bulkActionsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  bulkActionText: {
    color: colors.text.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 20,
  },
  cardContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  cardTouchable: {
    flex: 1,
  },
  universalCardStyle: {
    // Add any custom styles for the UniversalCard component here
  },
  selectedCardStyle: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenu: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: width * 0.8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: 8,
    paddingTop: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  flatList: {
    paddingBottom: 20,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 44, 67, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 5,
  },
  selectionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminMenuButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
});

export default AdminContentManagerScreen; 