import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar } from 'react-native-paper';
import apiService from '../services/apiService';
import { colors, COLOR_USAGE } from '../config/theme';
import UniversalCard from '../components/UniversalCard';
import { useScrollDirection } from '../utils/useScrollDirection';
import { useBackHandler } from '../utils/useBackHandler';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { useToast } from '../contexts/ToastContext';
import OfflineBanner from '../components/OfflineBanner';
import { ListSkeleton } from '../components/SkeletonLoader';
import { SERVER_URL } from '../config/api';

// Configuration for different screen types
const SCREEN_CONFIGS = {
  lectures: {
    title: 'Dersovi',
    loadingText: 'Učitavam predavanja...',
    emptyText: 'Nema predavanja koja odgovaraju pretrazi.',
    searchPlaceholder: 'Pretraži po naslovu, daiji ili udruženju...',
    searchHint: 'Pretražuje se: naslov, daija, udruženje, lokacija, opis',
    defaultImagePath: '/uploads/images/predavanjeslika.jpg',
    useAnimatedHeader: true,
    sortByDateProximity: true
  },
  organizations: {
    title: 'Udruženja',
    loadingText: 'Učitavam udruženja...',
    emptyText: 'Nema udruženja koja odgovaraju pretrazi.',
    searchPlaceholder: 'Pretraži po nazivu, mjestu, opisu...',
    searchHint: 'Pretražuje se: naziv, opis, grad, adresa',
    defaultImagePath: '/uploads/images/udruzenjeslika.jpg',
    useAnimatedHeader: false,
    sortByDateProximity: false
  },
  daije: {
    title: 'Daije',
    loadingText: 'Učitavam daije...',
    emptyText: 'Nema daija koji odgovaraju pretrazi.',
    searchPlaceholder: 'Pretraži po imenu daije...',
    searchHint: 'Pretražuje se samo po imenu daije',
    defaultImagePath: '/uploads/images/daijaslika.jpg',
    useAnimatedHeader: true,
    sortByDateProximity: false
  }
};

// Helper function to sort lectures by date proximity
const sortLecturesByDateProximity = (lectures) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return lectures.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    // Calculate days difference from today
    const diffA = Math.abs(dateA - today);
    const diffB = Math.abs(dateB - today);
    
    // Sort by proximity to today (closest first)
    return diffA - diffB;
  });
};

// Helper function to format daija name
const formatDaijaName = (daija) => {
  const firstName = daija.firstName || '';
  const lastName = daija.lastName || '';
  const title = daija.title || '';
  
  if (title.toLowerCase() === 'prof' || title.toLowerCase() === 'prof.') {
    return `${firstName} ${lastName} prof.`.trim();
  } else if (title) {
    const titleWithPeriod = title.includes('.') ? title : `${title}.`;
    return `${titleWithPeriod} ${firstName} ${lastName}`.trim();
  } else {
    return `${firstName} ${lastName}`.trim();
  }
};

export default function UniversalListScreen({ route, navigation }) {
  const { screenType } = route.params;
  const config = SCREEN_CONFIGS[screenType];
  
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Scroll detection (only for animated headers)
  const { isVisible, updateScrollDirection } = useScrollDirection();
  const headerAnimation = new Animated.Value(1);

  // Network status and toast
  const { isConnected, isOffline } = useNetworkStatus();
  const { showError, showSuccess, showWarning } = useToast();

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  useEffect(() => {
    let skeletonTimeout = setTimeout(() => {
      setShowSkeleton(true);
    }, 400);

    fetchData().finally(() => {
      clearTimeout(skeletonTimeout);
    });

    return () => clearTimeout(skeletonTimeout);
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, items]);

  useEffect(() => {
    if (config.useAnimatedHeader) {
      Animated.timing(headerAnimation, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, config.useAnimatedHeader]);

  // Show offline warning when connection is lost
  useEffect(() => {
    if (isOffline && items.length > 0) {
      showWarning('Nema internetske veze. Prikazuju se sačuvani podaci.');
    }
  }, [isOffline]);

  const handleScroll = (event) => {
    if (config.useAnimatedHeader) {
      const scrollY = event.nativeEvent.contentOffset.y;
      updateScrollDirection(scrollY);
    }
  };

  const fetchData = async (isManualRefresh = false) => {
    // Use parameter instead of state to determine if this was a manual refresh
    const wasRefreshing = isManualRefresh;
    
    try {
      if (!wasRefreshing) {
        setIsLoading(true);
      }
      setError(null);
      
      // Minimum loading time to prevent flashing
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 300));
      
      // Check network connection
      if (isOffline) {
        throw new Error('Nema internetske veze');
      }
      
      let data = [];
      
      if (screenType === 'lectures') {
        data = await apiService.getLectures();
        if (config.sortByDateProximity) {
          data = sortLecturesByDateProximity(data);
        }
      } else if (screenType === 'organizations') {
        const [organizationsData, lecturesData] = await Promise.all([
          apiService.getOrganizations(),
          apiService.getLectures()
        ]);
        
        // Add lecture count to each organization
        data = organizationsData.map(organization => {
          const lectureCount = lecturesData.filter(lecture => 
            lecture.organizationId === organization._id || 
            lecture.organization === organization.name ||
            lecture.organization === organization._id
          ).length;
          
          return {
            ...organization,
            lectureCount
          };
        });
      } else if (screenType === 'daije') {
        const [daijeData, lecturesData] = await Promise.all([
          apiService.getDaije(),
          apiService.getLectures()
        ]);
        
        // Add lecture count to each daija
        data = daijeData.map(daija => {
          const lectureCount = lecturesData.filter(lecture => 
            lecture.daijaId === daija._id || 
            lecture.daija === daija._id ||
            lecture.speaker === `${daija.title || ''} ${daija.firstName || ''} ${daija.lastName || ''}`.trim()
          ).length;
          
          return {
            ...daija,
            lectureCount
          };
        });
      }
      
      // Wait for minimum loading time before setting data
      await minLoadingTime;
      
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.message || 'Greška pri dohvaćanju podataka';
      setError(errorMessage);
      
      if (isOffline) {
        showWarning('Nema internetske veze. Prikazuju se sačuvani podaci.');
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setShowSkeleton(false);
      if (wasRefreshing) setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(true); // signal da je manual refresh
  };

  const filterItems = () => {
    let filtered = items;

    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(item => {
        if (screenType === 'lectures') {
          const titleMatch = item.title?.toLowerCase().includes(query);
          const speakerMatch = item.speaker?.toLowerCase().includes(query);
          const organizationMatch = item.organization?.toLowerCase().includes(query);
          const descriptionMatch = item.shortDescription?.toLowerCase().includes(query) ||
                                  item.description?.toLowerCase().includes(query);
          const locationMatch = item.address?.toLowerCase().includes(query) ||
                               item.city?.toLowerCase().includes(query);
          
          return titleMatch || speakerMatch || organizationMatch || descriptionMatch || locationMatch;
        } else if (screenType === 'organizations') {
          const nameMatch = item.name?.toLowerCase().includes(query);
          const descriptionMatch = item.shortDescription?.toLowerCase().includes(query) ||
                                  item.description?.toLowerCase().includes(query);
          const locationMatch = item.address?.toLowerCase().includes(query) ||
                               item.city?.toLowerCase().includes(query);
          
          return nameMatch || descriptionMatch || locationMatch;
        } else if (screenType === 'daije') {
          const firstNameMatch = item.firstName?.toLowerCase().includes(query);
          const lastNameMatch = item.lastName?.toLowerCase().includes(query);
          const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
          const fullNameMatch = fullName.includes(query);
          
          return firstNameMatch || lastNameMatch || fullNameMatch;
        }
        
        return false;
      });
    }

    setFilteredItems(filtered);
  };

  const navigateToDetail = (item) => {
    if (screenType === 'lectures') {
      navigation.navigate('LectureDetail', { lectureId: item._id });
    } else if (screenType === 'organizations') {
      navigation.navigate('OrganizationDetail', { organizationId: item._id });
    } else if (screenType === 'daije') {
      navigation.navigate('DaijaDetail', { daijaId: item._id });
    }
  };

  const renderItem = ({ item }) => {
    let infoRows = [];
    let title = '';
    let subtitle = '';

    if (screenType === 'lectures') {
      title = item.title;
      infoRows = [
        {
          icon: 'person-outline',
          text: item.speaker || 'Nepoznato',
          highlightSearch: true
        },
        {
          icon: 'business-outline',
          text: item.organization || 'Nepoznato',
          highlightSearch: true
        },
        {
          icon: 'calendar-outline',
          text: new Date(item.date).toLocaleDateString('bs-BA'),
          highlightSearch: false
        },
        {
          icon: 'time-outline',
          text: item.time || 'Nepoznato vrijeme',
          highlightSearch: false
        },
        {
          icon: 'location-outline',
          text: `${item.address || ''}, ${item.city || ''}`.replace(/^, |, $/, ''),
          highlightSearch: true
        }
      ].filter(row => row.text && row.text !== 'Nepoznato' && row.text !== ', ');
    } else if (screenType === 'organizations') {
      title = item.name;
      infoRows = [
        item.shortDescription && {
          icon: 'document-text-outline',
          text: item.shortDescription,
          highlightSearch: true,
          numberOfLines: 2
        },
        item.address && {
          icon: 'location-outline',
          text: item.address,
          highlightSearch: true
        },
        item.city && {
          icon: 'business-outline',
          text: item.city,
          highlightSearch: true
        },
        {
          icon: 'book-outline',
          text: `${item.lectureCount || 0} predavanja`,
          highlightSearch: false
        }
      ].filter(Boolean);
    } else if (screenType === 'daije') {
      title = formatDaijaName(item);
      subtitle = item.specialization;
      infoRows = [
        item.city && {
          icon: 'location-outline',
          text: item.city,
          highlightSearch: false
        },
        {
          icon: 'book-outline',
          text: `${item.lectureCount || 0} predavanja`,
          highlightSearch: false
        }
      ].filter(Boolean);
    }

    return (
      <UniversalCard
        title={title}
        subtitle={subtitle}
        infoRows={infoRows}
        rightContentType="image"
        imageUrl={item.image}
        onPress={() => navigateToDetail(item)}
        searchQuery={searchQuery}
        titleStyle={screenType === 'lectures' ? { textTransform: 'uppercase' } : undefined}
        serverUrl={SERVER_URL}
        defaultImagePath={config.defaultImagePath}
      />
    );
  };

  const renderHeader = () => {
    const headerContent = (
      <View style={styles.header}>
        <View style={styles.searchInputContainer}>
          <Searchbar
            placeholder={config.searchPlaceholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={colors.primary.main}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <View style={styles.searchHints}>
            <Text style={styles.searchHintText}>
              {config.searchHint}
            </Text>
          </View>
        )}
      </View>
    );

    if (config.useAnimatedHeader) {
      return (
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              transform: [
                {
                  translateY: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-400, 0],
                  }),
                },
              ],
              opacity: headerAnimation,
            },
          ]}
        >
          {headerContent}
        </Animated.View>
      );
    } else {
      return (
        <View style={styles.searchContainer}>
          {headerContent}
        </View>
      );
    }
  };

  if (isLoading && showSkeleton && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <OfflineBanner isVisible={isOffline} />
        <ListSkeleton count={8} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner isVisible={isOffline} />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary.main]}
                tintColor={colors.primary.main}
              />
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Search header */}
            {renderHeader()}

            {/* List content */}
            <View style={[
              styles.listContainer,
              isOffline && { paddingTop: 56 } // Add padding when offline banner is visible
            ]}>
              {filteredItems.length === 0 ? (
                !isLoading && (
                  <View style={{ padding: 16 }}>
                    <Text style={{ textAlign: 'center', color: colors.text.secondary }}>
                      {error || config.emptyText}
                    </Text>
                    {error && !isOffline && (
                      <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => fetchData()}
                      >
                        <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              ) : (
                filteredItems.map((item) => (
                  <View key={item._id}>
                    {renderItem({ item })}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  searchContainer: {
    width: '100%',
    backgroundColor: colors.background.paper,
    elevation: 1,
    zIndex: 100,
    alignSelf: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: colors.background.paper,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: colors.background.default,
    flex: 1,
  },
  clearButton: {
    padding: 8,
  },
  searchHints: {
    padding: 8,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  searchHintText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 