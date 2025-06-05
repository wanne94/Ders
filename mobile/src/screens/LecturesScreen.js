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
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar } from 'react-native-paper';
import apiService from '../services/apiService';
import { colors, COLOR_USAGE } from '../config/theme';
import UniversalCard from '../components/UniversalCard';
import { useScrollDirection } from '../utils/useScrollDirection';
import { useBackHandler } from '../utils/useBackHandler';

// Dinamička konfiguracija servera - za fizički uređaj
const SERVER_URL = 'http://192.168.0.20:5003'; // IP adresa računara + port servera

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

// Helper function to format date with day of week
const formatDateWithDay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  const dayOfWeek = days[date.getDay()];
  return `${day}.${month}.${year}. (${dayOfWeek})`;
};

export default function LecturesScreen({ navigation }) {
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
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
    fetchLectures();
  }, []);

  useEffect(() => {
    filterLectures();
  }, [searchQuery, lectures]);

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

  const fetchLectures = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setIsLoading(true);
      }
      setError(null);
      
      const lecturesData = await apiService.getLectures();
      
      // Sort lectures by date proximity (upcoming first)
      const sortedLectures = sortLecturesByDateProximity(lecturesData);
      setLectures(sortedLectures);
      setFilteredLectures(sortedLectures);
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Greška pri dohvaćanju predavanja. Molimo pokušajte ponovo.');
      
      // Set empty array if no data
      setLectures([]);
      setFilteredLectures([]);
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLectures(true);
  };

  const filterLectures = () => {
    let filtered = lectures;

    // Filter by search query - improved search
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(lecture => {
        // Search in title (naslov predavanja)
        const titleMatch = lecture.title?.toLowerCase().includes(query);
        
        // Search in speaker (daija)
        const speakerMatch = lecture.speaker?.toLowerCase().includes(query);
        
        // Search in organization (udruženje)
        const organizationMatch = lecture.organization?.toLowerCase().includes(query);
        
        // Search in description
        const descriptionMatch = lecture.shortDescription?.toLowerCase().includes(query) ||
                                lecture.description?.toLowerCase().includes(query);
        
        // Search in location
        const locationMatch = lecture.address?.toLowerCase().includes(query) ||
                             lecture.city?.toLowerCase().includes(query);
        
        return titleMatch || speakerMatch || organizationMatch || descriptionMatch || locationMatch;
      });
    }

    setFilteredLectures(filtered);
  };

  const navigateToLectureDetail = (lecture) => {
    navigation.navigate('LectureDetail', { lectureId: lecture._id });
  };

  const renderLectureItem = ({ item }) => {
    // Prepare info rows for the card
    const infoRows = [
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
        text: formatDateWithDay(item.date),
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

    return (
      <UniversalCard
        title={item.title}
        infoRows={infoRows}
        rightContentType="image"
        imageUrl={item.image}
        onPress={() => navigateToLectureDetail(item)}
        searchQuery={searchQuery}
        titleStyle={{ textTransform: 'uppercase' }}
        serverUrl={SERVER_URL}
        defaultImagePath="/uploads/images/predavanjeslika.jpg"
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Učitavam predavanja...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={filteredLectures}
          renderItem={renderLectureItem}
          keyExtractor={(item) => item._id}
          style={styles.lecturesList}
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
                    placeholder="Pretraži po naslovu, daiji ili udruženju"
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
                      Pretražuje se: naslov, daija, udruženje, lokacija, opis
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
    width: '100%',
    alignSelf: 'stretch',
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
  lecturesList: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  highlightedText: {
    fontWeight: 'bold',
  },
}); 