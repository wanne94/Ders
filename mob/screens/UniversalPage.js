import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, FlatList, ActivityIndicator, Text, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UniverzalCard from '../components/UniverzalCard';
import Menu from '../components/Menu';
import apiClient from '../services/apiClient';
import udruzenjaService from '../services/udruzenjaService';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import { formatDateWithDay } from '../utils/dateUtils';
import { applySorting, sortLecturesByStatus } from '../utils/sortingUtils';
import { ENV } from '../config';
import { getUserData } from '../utils/authHelpers';
import { SkeletonCardList } from '../components/SkeletonCard';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
};

// API functions using the real services
const fetchLectures = async () => {
  try {
    // console.log('UniversalPage: Fetching lectures...');
    const response = await apiClient.get('/lectures/public?status=all');
    const data = response.data;
    // Return all lectures including cancelled ones
    const lectures = Array.isArray(data) ? data : [];
    // Add type field to each lecture
    return lectures.map(lecture => ({
      ...lecture,
      type: 'predavanje'
    }));
  } catch (error) {
    // console.error('UniversalPage: Error fetching lectures:', error.message);
    return [];
  }
};

const fetchDaije = async () => {
  try {
    const data = await daijeService.getAllDaije();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // console.error('Error fetching daije:', error);
    return [];
  }
};

const fetchOrganizations = async () => {
  try {
    const data = await udruzenjaService.getAllUdruzenja();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // console.error('Error fetching organizations:', error);
    return [];
  }
};

const UniversalPage = ({ type = 'lectures', onBack, onProfileOpen, allLectures = [], onNavigate, user, isAuthenticated, scrollRef }) => {
  const [data, setData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const ITEMS_PER_PAGE = 10; // Smanjen broj za bolje performanse

  const getPageConfig = () => {
    switch (type) {
      case 'lectures':
        return {
          title: 'Dersovi',
          subtitle: 'Svi dostupni dersovi',
          fetchFunction: fetchLectures,
          cardConfig: {
            titleKey: 'title',
            subtitleKey: 'speaker',
            descriptionKeys: ['organization', 'date', 'time', 'address'],
            formatDescription: (item) => {
              if (!item) return '';
              const date = formatDateWithDay(item.date);
              return `${item.organization || ''}\n${date} ${item.time || ''}\n${item.address || ''}, ${item.city || ''}`.trim();
            }
          }
        };
      case 'speakers':
        return {
          title: 'Daije',
          subtitle: 'Naši daije',
          fetchFunction: fetchDaije,
          cardConfig: {
            titleKey: 'name',
            subtitleKey: 'title',
            descriptionKeys: ['title'],
            formatDescription: (item) => {
              if (!item) return '';
              return item.title ? item.title.toUpperCase() : '';
            }
          }
        };
      case 'organizations':
        return {
          title: 'Udruženja',
          subtitle: 'Naši partneri',
          fetchFunction: fetchOrganizations,
          cardConfig: {
            titleKey: 'name',
            subtitleKey: 'city',
            descriptionKeys: ['address', 'city'],
            formatDescription: (item) => {
              if (!item) return '';
              return `${item.address || ''}, ${item.city || ''}`.trim();
            }
          }
        };
      default:
        return {
          title: 'Sadržaj',
          subtitle: 'Sav sadržaj',
          fetchFunction: fetchLectures,
          cardConfig: {
            titleKey: 'title',
            subtitleKey: 'type',
            descriptionKeys: [],
            formatDescription: () => ''
          }
        };
    }
  };

  const pageConfig = getPageConfig();

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }

      const result = await pageConfig.fetchFunction();
      const rawData = Array.isArray(result) ? result : [];
      
      // Apply centralized sorting
      const sortedData = type === 'lectures' 
        ? sortLecturesByStatus(rawData)
        : applySorting(rawData, type, allLectures);

      setData(sortedData);
      
      // Reset to first page when refreshing
      if (isRefresh) {
        setCurrentPage(1);
        setDisplayedData(sortedData.slice(0, ITEMS_PER_PAGE));
      } else {
        // Initially show first page
        setDisplayedData(sortedData.slice(0, ITEMS_PER_PAGE));
      }
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom učitavanja podataka');
      console.error('Error loading data:', error);
      setData([]);
      setDisplayedData([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    await loadData(true);
  }, [type, isAuthenticated]);

  const loadMoreItems = () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newItems = data.slice(0, endIndex);
    
    setDisplayedData(newItems);
    setCurrentPage(nextPage);
  };

  const hasMoreItems = displayedData.length < data.length;

  useEffect(() => {
    const loadAllData = async () => {

      
      
      
      // Then load main data
      await loadData();
    };
    
    loadAllData();
  }, [type, isAuthenticated]);

  const handleItemPress = (item) => {
    if (!item) return;
    
    if (onProfileOpen) {
      let profileType = '';
      switch (type) {
        case 'lectures':
          profileType = 'lecture';
          break;
        case 'speakers':
          profileType = 'daija';
          break;
        case 'organizations':
          profileType = 'organization';
          break;
      }
      onProfileOpen(item, profileType);
    } else {
      // Fallback to alert if no profile handler
      let message = '';
      switch (type) {
        case 'lectures':
          message = `${item.title || ''}\nPredavač: ${item.speaker || ''}\nOrganizacija: ${item.organization || ''}\nDatum: ${formatDateWithDay(item.date)}\nVrijeme: ${item.time || ''}`;
          break;
        case 'speakers':
          message = `${item.name || ''}\n${item.title || ''}\n${item.specialty || ''}\n${item.organization || ''}\nKontakt: ${item.contact || ''}`;
          break;
        case 'organizations':
          message = `${item.name || ''}\n${item.address || ''}, ${item.city || ''}\nTel: ${item.contact || ''}\nEmail: ${item.email || ''}`;
          break;
      }
      Alert.alert(pageConfig.title, message.trim());
    }
  };

  const handleSearch = () => {
    if (onNavigate) {
      onNavigate('search');
    }
  };

  const handleMenuPress = () => {
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleMenuNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleAuthNavigate = () => {
    if (onNavigate) {
      onNavigate('auth');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear auth token
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
      
      // Navigate to home
      if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddContent = () => {
    if (onNavigate) {
      onNavigate('add-content');
    }
  };

  const handleAddContentWithType = (type) => {
    // Navigate to add content screen with pre-selected type
    if (onNavigate) {
      onNavigate('add-content', { preselectedType: type });
    }
  };

  const handleProfileNavigate = (userId, userType) => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  // Memoized render item function for better performance
  const renderItem = useCallback(({ item }) => {
    // Render item called
    // Normalize ID - handle MongoDB ObjectId format
    const rawId = item._id || item.id;
    const itemId = typeof rawId === 'object' && rawId.toString ? rawId.toString() : String(rawId);
    const isFollowing = false;

    
    
    return (
      <UniverzalCard
        data={{
          ...item,
          type: type === 'lectures' ? 'predavanje' : 
                type === 'speakers' ? 'daija' : 
                type === 'organizations' ? 'udruženje' : item.type
        }}
        onPress={() => handleItemPress(item)}
        isFollowing={isFollowing}
      />
    );
  }, [type, handleItemPress]);

  // Key extractor for optimal list performance
  const keyExtractor = useCallback((item, index) => 
    item?._id || item?.id || `${type}-${index}`, [type]);

  // Empty component
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Trenutno nema dostupnih podataka.</Text>
    </View>
  );

  // Header component for lectures - shows statistics
  const ListHeaderComponent = () => {
    // Removed statistics from lectures screen
    return null;
  };

  // Show more button component
  const ListFooterComponent = () => {
    if (!hasMoreItems) return null;
    
    return (
      <TouchableOpacity 
        style={styles.showMoreButton} 
        onPress={loadMoreItems}
        activeOpacity={0.8}
      >
        <Text style={styles.showMoreText}>Prikaži više</Text>
      </TouchableOpacity>
    );
  };

  // Loading component
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <SkeletonCardList 
            count={6} 
            type={type === 'lectures' ? 'lecture' : type === 'speakers' ? 'daija' : 'organization'} 
          />
        </View>
        <Menu 
          isOpen={menuOpen}
          onClose={handleMenuClose}
          onNavigate={handleMenuNavigate}
          isAuthenticated={isAuthenticated || false}
          user={user}
          onAuthNavigate={handleAuthNavigate}
          onLogout={handleLogout}
          onAddContent={handleAddContent}
          onAddContentWithType={handleAddContentWithType}
          onProfileNavigate={handleProfileNavigate}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={scrollRef}
        data={displayedData}
        renderItem={renderItem}
        
        keyExtractor={keyExtractor}
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          displayedData.length === 0 && styles.emptyContentContainer
        ]}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
      />
      
      <Menu 
        isOpen={menuOpen}
        onClose={handleMenuClose}
        onNavigate={handleMenuNavigate}
        isAuthenticated={isAuthenticated || false}
        user={user}
        onAuthNavigate={handleAuthNavigate}
        onLogout={handleLogout}
        onAddContent={handleAddContent}
        onAddContentWithType={handleAddContentWithType}
        onProfileNavigate={handleProfileNavigate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  contentContainer: {
    padding: 8,
    paddingBottom: 100, // Extra padding for bottom navigation
    gap: 8, // Razmak između kartice
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptyContentContainer: {
    flex: 1,
  },
  showMoreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  showMoreText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UniversalPage; 