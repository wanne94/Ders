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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar } from 'react-native-paper';
import apiService from '../services/apiService';
import { colors, COLOR_USAGE } from '../config/theme';
import UniversalCard from '../components/UniversalCard';
import { useScrollDirection } from '../utils/useScrollDirection';
import { useBackHandler } from '../utils/useBackHandler';
import { SERVER_URL } from '../config/api';

export default function DaijeScreen({ navigation }) {
  const [daije, setDaije] = useState([]);
  const [filteredDaije, setFilteredDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // Scroll detection
  const { isVisible, updateScrollDirection } = useScrollDirection();
  const headerAnimation = new Animated.Value(1);

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  useEffect(() => {
    fetchDaije();
  }, []);

  useEffect(() => {
    filterDaije();
  }, [searchQuery, daije]);

  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    updateScrollDirection(scrollY);
  };

  const fetchDaije = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setIsLoading(true);
      }
      setError(null);
      
      const [daijeData, lecturesData] = await Promise.all([
        apiService.getDaije(),
        apiService.getLectures()
      ]);
      
      // Add lecture count to each daija
      const daijeWithLectureCount = daijeData.map(daija => {
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
      
      setDaije(daijeWithLectureCount);
      setFilteredDaije(daijeWithLectureCount);
    } catch (err) {
      console.error('Error fetching daije:', err);
      setError('Greška pri dohvaćanju daija. Molimo pokušajte ponovo.');
      
      // Set mock data if API fails
      const mockDaije = [
        {
          _id: '1',
          firstName: 'Mustafa',
          lastName: 'Cerić',
          title: 'Dr',
          city: 'Sarajevo',
          status: 'approved',
          specialization: 'Islamska teologija',
          image: null,
          lectureCount: 5
        },
        {
          _id: '2',
          firstName: 'Husein',
          lastName: 'Kavazović',
          title: 'Dr.',
          city: 'Sarajevo',
          status: 'approved',
          specialization: 'Islamsko pravo',
          image: null,
          lectureCount: 3
        },
        {
          _id: '3',
          firstName: 'Ahmed',
          lastName: 'Smajlović',
          title: 'prof',
          city: 'Tuzla',
          status: 'approved',
          specialization: 'Islamska filozofija',
          image: null,
          lectureCount: 2
        }
      ];
      setDaije(mockDaije);
      setFilteredDaije(mockDaije);
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDaije(true);
  };

  const filterDaije = () => {
    let filtered = daije;

    // Filter by search query - only search by name
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(daija => {
        // Search in first name
        const firstNameMatch = daija.firstName?.toLowerCase().includes(query);
        
        // Search in last name
        const lastNameMatch = daija.lastName?.toLowerCase().includes(query);
        
        // Search in full name (first + last)
        const fullName = `${daija.firstName} ${daija.lastName}`.toLowerCase();
        const fullNameMatch = fullName.includes(query);
        
        return firstNameMatch || lastNameMatch || fullNameMatch;
      });
    }

    setFilteredDaije(filtered);
  };

  const renderDaijaItem = ({ item }) => {
    // Format the full name with proper title handling
    let fullName = '';
    const firstName = item.firstName || '';
    const lastName = item.lastName || '';
    const title = item.title || '';
    
    if (title.toLowerCase() === 'prof' || title.toLowerCase() === 'prof.') {
      // For "prof." title, display it after the name
      fullName = `${firstName} ${lastName} prof.`.trim();
    } else if (title) {
      // For other titles (Dr., etc.), display before name with period
      const titleWithPeriod = title.includes('.') ? title : `${title}.`;
      fullName = `${titleWithPeriod} ${firstName} ${lastName}`.trim();
    } else {
      // No title
      fullName = `${firstName} ${lastName}`.trim();
    }
    
    // Prepare info rows for the card
    const infoRows = [
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

    return (
      <UniversalCard
        title={fullName}
        subtitle={item.specialization}
        infoRows={infoRows}
        rightContentType="image"
        imageUrl={item.image}
        onPress={() => navigateToDaijaDetail(item)}
        searchQuery={searchQuery}
        serverUrl={SERVER_URL}
        defaultImagePath="/uploads/images/daijaslika.jpg"
      />
    );
  };

  const navigateToDaijaDetail = (daija) => {
    console.log('🔍 Navigating to daija detail:', daija);
    console.log('🔍 Daija ID:', daija._id);
    
    if (!daija._id) {
      console.error('❌ Daija nema valjan ID:', daija);
      Alert.alert('Greška', 'Daija nema valjan ID. Molimo pokušajte ponovo.');
      return;
    }
    
    navigation.navigate('DaijaDetail', { daijaId: daija._id });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Učitavam daije...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={filteredDaije}
          renderItem={renderDaijaItem}
          keyExtractor={(item) => item._id}
          style={styles.daijeList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          ListHeaderComponent={() => (
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
              <View style={styles.header}>
                <View style={styles.searchInputContainer}>
                  <Searchbar
                    placeholder="Pretraži po imenu daije..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    iconColor={colors.primary.main}
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
                      Pretražuje se samo po imenu daije
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    width: '400',
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
  daijeList: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: colors.primary.main,
  },
}); 