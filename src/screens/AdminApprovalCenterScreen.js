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
  Image,
  SectionList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';

const { width, height } = Dimensions.get('window');

// Approval Item Card Component
const ApprovalItemCard = ({ item, type, onApprove, onReject, onView, isSelected, onSelect }) => {
  const getItemTitle = () => {
    switch (type) {
      case 'lectures':
        return item.title || 'Bez naziva';
      case 'daije':
        return `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Bez imena';
      case 'organizations':
        return item.name || 'Bez naziva';
      default:
        return 'Nepoznato';
    }
  };

  const getItemSubtitle = () => {
    switch (type) {
      case 'lectures':
        return `Predavač: ${item.speaker || 'Nepoznato'}`;
      case 'daije':
        return `Titula: ${item.title || 'Bez titule'}`;
      case 'organizations':
        return `Grad: ${item.city || 'Nepoznato'}`;
      default:
        return '';
    }
  };

  const getItemImage = () => {
    const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:5000';
    switch (type) {
      case 'lectures':
        return item.image ? `${baseUrl}${item.image}` : null;
      case 'daije':
        return item.image ? `${baseUrl}${item.image}` : null;
      case 'organizations':
        return item.logo ? `${baseUrl}${item.logo}` : null;
      default:
        return null;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'lectures':
        return 'book-outline';
      case 'daije':
        return 'person-outline';
      case 'organizations':
        return 'business-outline';
      default:
        return 'help-outline';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'lectures':
        return colors.primary.main;
      case 'daije':
        return colors.success.main;
      case 'organizations':
        return colors.info.main;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nepoznato';
    const date = new Date(dateString);
    return date.toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.approvalCard, isSelected && styles.selectedCard]}
      onPress={() => onView(item, type)}
      onLongPress={() => onSelect(item._id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => onSelect(item._id)}
        >
          <Ionicons 
            name={isSelected ? 'checkbox' : 'square-outline'} 
            size={24} 
            color={isSelected ? colors.primary.main : colors.text.secondary} 
          />
        </TouchableOpacity>

        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() + '20' }]}>
          <Ionicons name={getTypeIcon()} size={20} color={getTypeColor()} />
        </View>

        <View style={styles.cardContent}>
          {getItemImage() && (
            <Image source={{ uri: getItemImage() }} style={styles.itemImage} />
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>{getItemTitle()}</Text>
            <Text style={styles.itemSubtitle} numberOfLines={1}>{getItemSubtitle()}</Text>
            <Text style={styles.itemDate}>Poslano: {formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => onReject(item, type)}
        >
          <Ionicons name="close" size={16} color={colors.text.onPrimary} />
          <Text style={styles.actionButtonText}>Odbij</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => onApprove(item, type)}
        >
          <Ionicons name="checkmark" size={16} color={colors.text.onPrimary} />
          <Text style={styles.actionButtonText}>Odobri</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Section Header Component
const SectionHeader = ({ title, count, icon, color }) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={[styles.countBadge, { backgroundColor: color }]}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

// Bulk Actions Component
const BulkActionsBar = ({ selectedCount, onBulkApprove, onBulkReject, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <View style={styles.bulkActionsBar}>
      <Text style={styles.bulkActionsText}>{selectedCount} odabrano</Text>
      <View style={styles.bulkActionsButtons}>
        <TouchableOpacity 
          style={[styles.bulkActionButton, { backgroundColor: colors.success.main }]}
          onPress={onBulkApprove}
        >
          <Ionicons name="checkmark" size={16} color={colors.text.onPrimary} />
          <Text style={styles.bulkActionText}>Odobri sve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bulkActionButton, { backgroundColor: colors.error.main }]}
          onPress={onBulkReject}
        >
          <Ionicons name="close" size={16} color={colors.text.onPrimary} />
          <Text style={styles.bulkActionText}>Odbij sve</Text>
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

// Detail Modal Component
const DetailModal = ({ visible, item, type, onClose, onApprove, onReject }) => {
  if (!item) return null;

  const getItemDetails = () => {
    switch (type) {
      case 'lectures':
        return [
          { label: 'Naziv', value: item.title },
          { label: 'Predavač', value: item.speaker },
          { label: 'Udruženje', value: item.organization },
          { label: 'Datum', value: item.date ? new Date(item.date).toLocaleDateString('bs-BA') : 'Nepoznato' },
          { label: 'Lokacija', value: item.location },
          { label: 'Opis', value: item.description }
        ];
      case 'daije':
        return [
          { label: 'Ime', value: `${item.firstName || ''} ${item.lastName || ''}`.trim() },
          { label: 'Titula', value: item.title },
          { label: 'Biografija', value: item.biography },
          { label: 'Kontakt', value: item.contact }
        ];
      case 'organizations':
        return [
          { label: 'Naziv', value: item.name },
          { label: 'Grad', value: item.city },
          { label: 'Adresa', value: item.address },
          { label: 'Telefon', value: item.phone },
          { label: 'Email', value: item.email },
          { label: 'Opis', value: item.description }
        ];
      default:
        return [];
    }
  };

  const getItemImage = () => {
    const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:5000';
    switch (type) {
      case 'lectures':
        return item.image ? `${baseUrl}${item.image}` : null;
      case 'daije':
        return item.image ? `${baseUrl}${item.image}` : null;
      case 'organizations':
        return item.logo ? `${baseUrl}${item.logo}` : null;
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detalji za odobrenje</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {getItemImage() && (
            <Image source={{ uri: getItemImage() }} style={styles.modalImage} />
          )}

          <View style={styles.detailsContainer}>
            {getItemDetails().map((detail, index) => (
              detail.value ? (
                <View key={index} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{detail.label}:</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ) : null
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalActionButton, styles.rejectButton]}
              onPress={() => {
                onReject(item, type);
                onClose();
              }}
            >
              <Ionicons name="close" size={20} color={colors.text.onPrimary} />
              <Text style={styles.modalActionText}>Odbij</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalActionButton, styles.approveButton]}
              onPress={() => {
                onApprove(item, type);
                onClose();
              }}
            >
              <Ionicons name="checkmark" size={20} color={colors.text.onPrimary} />
              <Text style={styles.modalActionText}>Odobri</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const AdminApprovalCenterScreen = ({ route, navigation }) => {
  const { pendingData } = route.params;
  const { user } = useAuth();
  
  const [data, setData] = useState({
    lectures: [],
    daije: [],
    organizations: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const fetchPendingData = useCallback(async () => {
    try {
      const [lecturesRes, daijeRes, organizationsRes] = await Promise.all([
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
        })
      ]);

      setData({
        lectures: (Array.isArray(lecturesRes.data) ? lecturesRes.data : lecturesRes.data.lectures || [])
          .filter(item => item.status === 'pending'),
        daije: (Array.isArray(daijeRes.data) ? daijeRes.data : daijeRes.data.daije || [])
          .filter(item => item.status === 'pending'),
        organizations: (Array.isArray(organizationsRes.data) ? organizationsRes.data : organizationsRes.data.organizations || [])
          .filter(item => item.status === 'pending')
      });
    } catch (error) {
      console.error('Error fetching pending data:', error);
      
      // Provide fallback data when API is not available
      setData({
        lectures: [],
        daije: [],
        organizations: []
      });
      
      Alert.alert('Greška', 'Nije moguće učitati podatke sa servera. Prikazuju se prazni podaci.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (pendingData) {
      setData(pendingData);
      setLoading(false);
    } else {
      fetchPendingData();
    }
  }, [pendingData, fetchPendingData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingData();
  }, [fetchPendingData]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return {
      lectures: data.lectures.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.speaker?.toLowerCase().includes(query) ||
        item.organization?.toLowerCase().includes(query)
      ),
      daije: data.daije.filter(item =>
        item.firstName?.toLowerCase().includes(query) ||
        item.lastName?.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query)
      ),
      organizations: data.organizations.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    };
  }, [data, searchQuery]);

  // Prepare section list data
  const sectionData = useMemo(() => {
    const sections = [];
    
    if (filteredData.lectures.length > 0) {
      sections.push({
        title: 'Dersovi',
        data: filteredData.lectures,
        type: 'lectures',
        icon: 'book-outline',
        color: colors.primary.main
      });
    }
    
    if (filteredData.daije.length > 0) {
      sections.push({
        title: 'Daije',
        data: filteredData.daije,
        type: 'daije',
        icon: 'person-outline',
        color: colors.success.main
      });
    }
    
    if (filteredData.organizations.length > 0) {
      sections.push({
        title: 'Udruženja',
        data: filteredData.organizations,
        type: 'organizations',
        icon: 'business-outline',
        color: colors.info.main
      });
    }
    
    return sections;
  }, [filteredData]);

  const totalPendingCount = data.lectures.length + data.daije.length + data.organizations.length;

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleApprove = async (item, type) => {
    try {
      const endpoints = {
        lectures: '/lectures',
        daije: '/daije',
        organizations: '/organizations'
      };

      await axiosInstance.patch(`${endpoints[type]}/${item._id}`, { status: 'approved' });

      // Update local state
      setData(prev => ({
        ...prev,
        [type]: prev[type].filter(dataItem => dataItem._id !== item._id)
      }));

      Alert.alert('Uspjeh', 'Stavka je uspješno odobrena');
    } catch (error) {
      console.error('Error approving item:', error);
      Alert.alert('Greška', 'Nije moguće odobriti stavku');
    }
  };

  const handleReject = async (item, type) => {
    try {
      const endpoints = {
        lectures: '/lectures',
        daije: '/daije',
        organizations: '/organizations'
      };

      // Delete the item instead of marking as rejected
      await axiosInstance.delete(`${endpoints[type]}/${item._id}`);

      // Update local state
      setData(prev => ({
        ...prev,
        [type]: prev[type].filter(dataItem => dataItem._id !== item._id)
      }));

      Alert.alert('Uspjeh', 'Stavka je uspješno obrisana');
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Greška', 'Nije moguće obrisati stavku');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;

    try {
      const endpoints = {
        lectures: '/lectures',
        daije: '/daije',
        organizations: '/organizations'
      };

      // Group selected items by type
      const itemsByType = {};
      Object.keys(data).forEach(type => {
        itemsByType[type] = data[type].filter(item => selectedItems.includes(item._id));
      });

      // Update all selected items
      const updatePromises = [];
      Object.keys(itemsByType).forEach(type => {
        itemsByType[type].forEach(item => {
          updatePromises.push(
            axiosInstance.patch(`${endpoints[type]}/${item._id}`, { status: 'approved' })
          );
        });
      });

      await Promise.all(updatePromises);

      // Update local state
      setData(prev => {
        const newData = { ...prev };
        Object.keys(itemsByType).forEach(type => {
          newData[type] = prev[type].filter(item => !selectedItems.includes(item._id));
        });
        return newData;
      });

      setSelectedItems([]);
      Alert.alert('Uspjeh', `${selectedItems.length} stavki je uspješno odobreno`);
    } catch (error) {
      console.error('Error bulk approving:', error);
      Alert.alert('Greška', 'Nije moguće odobriti stavke');
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      'Potvrda',
      `Da li ste sigurni da želite obrisati ${selectedItems.length} stavki?`,
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
                organizations: '/organizations'
              };

              // Group selected items by type
              const itemsByType = {};
              Object.keys(data).forEach(type => {
                itemsByType[type] = data[type].filter(item => selectedItems.includes(item._id));
              });

              // Delete all selected items
              const deletePromises = [];
              Object.keys(itemsByType).forEach(type => {
                itemsByType[type].forEach(item => {
                  deletePromises.push(
                    axiosInstance.delete(`${endpoints[type]}/${item._id}`)
                  );
                });
              });

              await Promise.all(deletePromises);

              // Update local state
              setData(prev => {
                const newData = { ...prev };
                Object.keys(itemsByType).forEach(type => {
                  newData[type] = prev[type].filter(item => !selectedItems.includes(item._id));
                });
                return newData;
              });

              setSelectedItems([]);
              Alert.alert('Uspjeh', `${selectedItems.length} stavki je uspješno obrisano`);
            } catch (error) {
              console.error('Error bulk deleting:', error);
              Alert.alert('Greška', 'Nije moguće obrisati stavke');
            }
          }
        }
      ]
    );
  };

  const handleViewItem = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setDetailModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Učitavam stavke za odobrenje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centar za odobravanje</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.warning.main }]}>
          <Text style={styles.countText}>{totalPendingCount}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pretraži stavke..."
          placeholderTextColor={colors.text.secondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedItems.length}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onClearSelection={() => setSelectedItems([])}
      />

      {/* Content */}
      {sectionData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-outline" size={64} color={colors.success.main} />
          <Text style={styles.emptyTitle}>Sve je odobreno!</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Nema rezultata za vašu pretragu' : 'Nema stavki koje čekaju odobrenje'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sectionData}
          keyExtractor={(item) => item._id}
          renderItem={({ item, section }) => (
            <ApprovalItemCard
              item={item}
              type={section.type}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleViewItem}
              isSelected={selectedItems.includes(item._id)}
              onSelect={handleItemSelect}
            />
          )}
          renderSectionHeader={({ section }) => (
            <SectionHeader
              title={section.title}
              count={section.data.length}
              icon={section.icon}
              color={section.color}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* Detail Modal */}
      <DetailModal
        visible={detailModalVisible}
        item={selectedItem}
        type={selectedType}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedItem(null);
          setSelectedType(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background.paper,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: colors.text.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    marginHorizontal: 20,
    marginVertical: 16,
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
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  approvalCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectButton: {
    marginRight: 12,
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: colors.success.main,
  },
  rejectButton: {
    backgroundColor: colors.error.main,
  },
  actionButtonText: {
    color: colors.text.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalActionText: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminApprovalCenterScreen; 