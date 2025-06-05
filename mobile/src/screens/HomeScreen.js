import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';
import apiService from '../services/apiService';
import { colors, COLOR_USAGE } from '../config/theme';
import UniversalCard from '../components/UniversalCard';
import { useBackHandler } from '../utils/useBackHandler';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { useToast } from '../contexts/ToastContext';
import OfflineBanner from '../components/OfflineBanner';
import { HomeCardSkeleton } from '../components/SkeletonLoader';
import { SERVER_URL } from '../config/api';

const { width } = Dimensions.get('window');

// NoDataMessage component for consistent empty state display
const NoDataMessage = ({ title, subtitle }) => (
  <View style={styles.noLecturesContainer}>
    <Text style={styles.noLecturesText}>{title}</Text>
    {subtitle && <Text style={styles.noLecturesSubtext}>{subtitle}</Text>}
  </View>
);

// Helper function to format date with day (same as web)
const formatDateWithDay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Dan u sedmici na bosanskom/hrvatskom
  const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  const dayOfWeek = days[date.getDay()];

  return `${day}.${month}.${year}. (${dayOfWeek})`;
};

// Helper function to get lectures sorted by proximity to current time (same as web)
const sortLecturesByTimeProximity = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  const now = new Date();
  
  return lectures
    .map(lecture => {
      const lectureDateTime = new Date(lecture.date);
      
      // If lecture has time, parse and add it to the date
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        lectureDateTime.setHours(hours, minutes, 0, 0);
      } else {
        // If no time specified, assume it's at noon
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      // Calculate difference in milliseconds (positive for future, negative for past)
      const timeDifference = lectureDateTime - now;
      const absoluteTimeDifference = Math.abs(timeDifference);
      const isFuture = timeDifference > 0;
      
      return {
        ...lecture,
        lectureDateTime,
        timeDifference,
        absoluteTimeDifference,
        isFuture
      };
    })
    .sort((a, b) => {
      // First priority: future lectures come before past lectures
      if (a.isFuture && !b.isFuture) return -1;
      if (!a.isFuture && b.isFuture) return 1;
      
      // Second priority: within same category (future/past), sort by proximity
      return a.absoluteTimeDifference - b.absoluteTimeDifference;
    });
};

// Helper function to sort organizations by lecture proximity (same as web)
const sortOrganizationsByLectureProximity = (organizations, lectures) => {
  if (!Array.isArray(organizations) || !Array.isArray(lectures)) return organizations || [];
  
  const now = new Date();
  
  return organizations
    .map(organization => {
      // Find all lectures for this organization
      const orgLectures = lectures.filter(lecture => 
        lecture.organizationId === organization._id || 
        lecture.organization === organization._id ||
        lecture.organization === organization.name
      );
      
      if (orgLectures.length === 0) {
        return {
          ...organization,
          closestLectureTime: Infinity,
          lectureCount: 0,
          hasFutureLecture: false
        };
      }
      
      // Find the lecture closest to current time, prioritizing future lectures
      let closestTime = Infinity;
      let hasFutureLecture = false;
      
      orgLectures.forEach(lecture => {
        const lectureDateTime = new Date(lecture.date);
        
        if (lecture.time) {
          const [hours, minutes] = lecture.time.split(':').map(Number);
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
        
        const timeDifference = lectureDateTime - now;
        const absoluteTimeDifference = Math.abs(timeDifference);
        const isFuture = timeDifference > 0;
        
        if (isFuture) {
          hasFutureLecture = true;
        }
        
        // Prioritize future lectures: if we have a future lecture and current closest is past, replace it
        // Or if both are future/past, choose the one with smaller absolute difference
        if ((isFuture && closestTime === Infinity) || 
            (isFuture && !hasFutureLecture) ||
            (isFuture === (closestTime < Infinity) && absoluteTimeDifference < Math.abs(closestTime))) {
          closestTime = timeDifference;
        }
      });
      
      return {
        ...organization,
        closestLectureTime: Math.abs(closestTime),
        lectureCount: orgLectures.length,
        hasFutureLecture,
        actualClosestTime: closestTime
      };
    })
    .sort((a, b) => {
      // First priority: organizations with future lectures come first
      if (a.hasFutureLecture && !b.hasFutureLecture) return -1;
      if (!a.hasFutureLecture && b.hasFutureLecture) return 1;
      
      // Second priority: within same category, sort by proximity
      return a.closestLectureTime - b.closestLectureTime;
    });
};

// Helper function to sort daije by lecture proximity (same as web)
const sortDaijeByLectureProximity = (daije, lectures) => {
  if (!Array.isArray(daije) || !Array.isArray(lectures)) return daije || [];
  
  const now = new Date();
  
  return daije
    .map(daija => {
      // Find all lectures for this daija
      const daijaLectures = lectures.filter(lecture => 
        lecture.daija === daija._id || 
        lecture.daijaId === daija._id ||
        (lecture.speaker && (
          lecture.speaker.includes(daija.firstName) ||
          lecture.speaker.includes(daija.lastName)
        ))
      );
      
      if (daijaLectures.length === 0) {
        return {
          ...daija,
          closestLectureTime: Infinity,
          lectureCount: 0,
          hasFutureLecture: false
        };
      }
      
      // Find the lecture closest to current time, prioritizing future lectures
      let closestTime = Infinity;
      let hasFutureLecture = false;
      
      daijaLectures.forEach(lecture => {
        const lectureDateTime = new Date(lecture.date);
        
        if (lecture.time) {
          const [hours, minutes] = lecture.time.split(':').map(Number);
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
        
        const timeDifference = lectureDateTime - now;
        const absoluteTimeDifference = Math.abs(timeDifference);
        const isFuture = timeDifference > 0;
        
        if (isFuture) {
          hasFutureLecture = true;
        }
        
        // Prioritize future lectures: if we have a future lecture and current closest is past, replace it
        // Or if both are future/past, choose the one with smaller absolute difference
        if ((isFuture && closestTime === Infinity) || 
            (isFuture && !hasFutureLecture) ||
            (isFuture === (closestTime < Infinity) && absoluteTimeDifference < Math.abs(closestTime))) {
          closestTime = timeDifference;
        }
      });
      
      return {
        ...daija,
        closestLectureTime: Math.abs(closestTime),
        lectureCount: daijaLectures.length,
        hasFutureLecture,
        actualClosestTime: closestTime
      };
    })
    .sort((a, b) => {
      // First priority: daije with future lectures come first
      if (a.hasFutureLecture && !b.hasFutureLecture) return -1;
      if (!a.hasFutureLecture && b.hasFutureLecture) return 1;
      
      // Second priority: within same category, sort by proximity
      return a.closestLectureTime - b.closestLectureTime;
    });
};

export default function HomeScreen({ navigation }) {
  const [allLectures, setAllLectures] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [daije, setDaije] = useState([]);
  const [displayOrganizations, setDisplayOrganizations] = useState([]);
  const [displayDaije, setDisplayDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Network status and toast
  const { isConnected, isOffline } = useNetworkStatus();
  const { showError, showSuccess, showWarning } = useToast();

  // Add back handler for exit confirmation
  useBackHandler(navigation);

  // Compute proximity lectures from allLectures (same as web TenLectures component)
  const proximityLectures = useMemo(() => {
    return sortLecturesByTimeProximity(allLectures).slice(0, 8);
  }, [allLectures]);

  useEffect(() => {
    fetchData();
    
    // Show skeleton only if loading takes longer than 400ms
    const skeletonTimeout = setTimeout(() => {
      if (isLoading) {
        setShowSkeleton(true);
      }
    }, 400);
    
    // Maximum skeleton display time - force hide after 2 seconds
    const maxSkeletonTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setShowSkeleton(false);
      }
    }, 2000);

    return () => {
      clearTimeout(skeletonTimeout);
      clearTimeout(maxSkeletonTimeout);
    };
  }, []);

  // Show offline warning when connection is lost
  useEffect(() => {
    if (isOffline && (proximityLectures.length > 0 || organizations.length > 0 || daije.length > 0)) {
      showWarning('Nema internetske veze. Prikazuju se sačuvani podaci.');
    }
  }, [isOffline, proximityLectures.length, organizations.length, daije.length]);

  const fetchData = async (isManualRefresh = false) => {
    const wasRefreshing = isManualRefresh;
    
    try {
      if (!wasRefreshing) {
        setIsLoading(true);
        setShowSkeleton(false);
      }
      setError(null);
      
      // Minimum loading time to prevent flashing
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 200));
      
      // Check network connection
      if (isOffline) {
        throw new Error('Nema internetske veze');
      }

      // Fetch all data in parallel (same as web)
      const [lecturesData, organizationsData, daijeData] = await Promise.all([
        apiService.getLectures(),
        apiService.getOrganizations(),
        apiService.getDaije()
      ]);

      // Wait for minimum loading time
      await minLoadingTime;

      // Store all lectures for sorting (same as web)
      const allLecturesData = lecturesData || [];
      setAllLectures(allLecturesData);

      // Store base data
      setOrganizations(organizationsData || []);
      setDaije(daijeData || []);

      // Process organizations with lecture proximity sorting (same as web)
      await fetchOrganizationsWithLectures(organizationsData || [], allLecturesData);

      // Process daije with lecture proximity sorting (same as web)
      await fetchDaijeWithLectures(daijeData || [], allLecturesData);

    } catch (error) {
      console.error('Error fetching home data:', error);
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

  // Separate function to fetch and sort organizations (same logic as web)
  const fetchOrganizationsWithLectures = async (organizationsData, lecturesData) => {
    try {
      // Sort organizations by proximity of their closest lecture to current time
      // Show all organizations, limited to first 8
      const sortedOrganizations = sortOrganizationsByLectureProximity(organizationsData, lecturesData)
        .slice(0, 8); // Limit to 8 organizations

      setDisplayOrganizations(sortedOrganizations);
    } catch (error) {
      console.error('Error processing organizations:', error);
      setDisplayOrganizations([]);
    }
  };

  // Separate function to fetch and sort daije (same logic as web)
  const fetchDaijeWithLectures = async (daijeData, lecturesData) => {
    try {
      // Filter active lectures for daije sorting
      const activeLectures = lecturesData.filter(lecture => lecture.status === 'approved');

      // Sort daije by proximity of their closest lecture to current time
      // Show all daije, limited to first 8
      const sortedDaije = sortDaijeByLectureProximity(daijeData, activeLectures)
        .slice(0, 8); // Limit to 8 daije

      setDisplayDaije(sortedDaije);
    } catch (error) {
      console.error('Error processing daije:', error);
      setDisplayDaije([]);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(true); // signal da je manual refresh
  };

  const handleLecturePress = (lecture) => {
    navigation.navigate('LectureDetail', { lectureId: lecture._id });
  };

  const handleDaijaPress = (daija) => {
    console.log('🔍 HomeScreen - Navigating to daija detail:', daija);
    console.log('🔍 HomeScreen - Daija ID:', daija._id);
    
    if (!daija._id) {
      console.error('❌ HomeScreen - Daija nema valjan ID:', daija);
      showError('Daija nema valjan ID. Molimo pokušajte ponovo.');
      return;
    }
    
    navigation.navigate('DaijaDetail', { daijaId: daija._id });
  };

  const handleOrganizationPress = (organization) => {
    navigation.navigate('OrganizationDetail', { organizationId: organization._id });
  };

  // Helper function to format daija name with proper title handling
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

  // Prikaz organizacije
  const renderOrganizationName = (org) => org?.name || 'Nepoznato udruženje';

  const renderSkeletonContent = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Hero Section Skeleton - simplified without LinearGradient */}
      <View style={[styles.heroSection, { backgroundColor: '#022C43' }]}>
        <Text style={styles.heroTitle}>DERS</Text>
        <View style={styles.divider} />
        <Text style={styles.heroSubtitle}>
          Digitalna platforma za promociju islamskih predavanja
        </Text>
      </View>

      {/* Skeleton Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dersovi</Text>
        <HomeCardSkeleton />
        <HomeCardSkeleton />
        <HomeCardSkeleton />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Udruženja</Text>
        <HomeCardSkeleton />
        <HomeCardSkeleton />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daije</Text>
        <HomeCardSkeleton />
        <HomeCardSkeleton />
      </View>
    </ScrollView>
  );

  if (isLoading && showSkeleton) {
    return (
      <SafeAreaView style={styles.container}>
        <OfflineBanner isVisible={isOffline} />
        {renderSkeletonContent()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner isVisible={isOffline} />
      <ScrollView 
        style={[styles.scrollView, isOffline && { marginTop: 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Error Message */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {!isOffline && (
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hero Section */}
        <LinearGradient
          colors={['#022C43', '#055A87']}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>DERS</Text>
          <View style={styles.divider} />
          <Text style={styles.heroSubtitle}>
            Digitalna platforma za promociju islamskih predavanja
          </Text>
        </LinearGradient>

        {/* Latest Lectures Section (same as web TenLectures) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dersovi</Text>
            <Pressable onPress={() => navigation.navigate('Lectures')} hitSlop={10}>
              <Text style={styles.seeAllText}>Prikaži sve dersove</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionDescription}>Posljednje najavljeni dersovi</Text>
          
          {proximityLectures.length === 0 ? (
            !isLoading && <NoDataMessage 
              title="Trenutno nema dostupnih dersova." 
            />
          ) : (
            proximityLectures.map((lecture) => {
              // Prepare info rows for the card (same format as web)
              const infoRows = [
                {
                  icon: 'person-outline',
                  text: lecture.speaker || 'Nepoznato',
                  highlightSearch: false
                },
                {
                  icon: 'calendar-outline',
                  text: formatDateWithDay(lecture.date),
                  highlightSearch: false
                },
                lecture.time && {
                  icon: 'time-outline',
                  text: lecture.time,
                  highlightSearch: false
                },
                {
                  icon: 'location-outline',
                  text: `${(lecture.address || lecture.location || '').trim()}, ${(lecture.city || '').trim()}`.replace(/^, |, $/, ''),
                  highlightSearch: false
                }
              ].filter(Boolean);

              return (
                <UniversalCard
                  key={lecture._id}
                  title={lecture.title}
                  infoRows={infoRows}
                  rightContentType="image"
                  imageUrl={lecture.image}
                  onPress={() => handleLecturePress(lecture)}
                  titleStyle={{ textTransform: 'uppercase' }}
                  serverUrl={SERVER_URL}
                  defaultImagePath="/uploads/images/predavanjeslika.jpg"
                />
              );
            })
          )}
        </View>

        {/* Active Organizations Section (same as web ActiveOrganizations) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Udruženja</Text>
            <Pressable onPress={() => navigation.navigate('Organizations')} hitSlop={10}>
              <Text style={styles.seeAllText}>Prikaži sva udruženja</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionDescription}>Udruženja sa nedavno najvljenim dersom</Text>
          
          {displayOrganizations.length === 0 ? (
            !isLoading && <NoDataMessage title="Trenutno nema dostupnih udruženja." />
          ) : (
            displayOrganizations.map((org) => {
              const infoRows = [
                org.shortDescription && {
                  icon: 'document-text-outline',
                  text: org.shortDescription,
                  highlightSearch: false,
                  numberOfLines: 2
                },
                org.city && {
                  icon: 'location-outline',
                  text: org.city,
                  highlightSearch: false
                },
                {
                  icon: 'book-outline',
                  text: `${org.lectureCount} predavanja`,
                  highlightSearch: false
                }
              ].filter(Boolean);

              return (
                <UniversalCard
                  key={org._id}
                  title={renderOrganizationName(org)}
                  infoRows={infoRows}
                  rightContentType="image"
                  imageUrl={org.image}
                  onPress={() => handleOrganizationPress(org)}
                  serverUrl={SERVER_URL}
                  defaultImagePath="/uploads/images/udruzenjeslika.jpg"
                />
              );
            })
          )}
        </View>

        {/* Active Daije Section (same as web ActiveDaije) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daije</Text>
            <Pressable onPress={() => navigation.navigate('Daije')} hitSlop={10}>
              <Text style={styles.seeAllText}>Prikaži sve daije</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionDescription}>Daije sa nedavno najvljenim dersom</Text>
          
          {displayDaije.length === 0 ? (
            !isLoading && <NoDataMessage title="Trenutno nema dostupnih daija." />
          ) : (
            displayDaije.map((daija) => {
              const fullName = formatDaijaName(daija);
              const infoRows = [
                daija.specialization && {
                  icon: 'school-outline',
                  text: daija.specialization,
                  highlightSearch: false
                },
                daija.city && {
                  icon: 'location-outline',
                  text: daija.city,
                  highlightSearch: false
                },
                {
                  icon: 'book-outline',
                  text: `${daija.lectureCount} predavanja`,
                  highlightSearch: false
                }
              ].filter(Boolean);

              return (
                <UniversalCard
                  key={daija._id}
                  title={fullName}
                  infoRows={infoRows}
                  rightContentType="image"
                  imageUrl={daija.image}
                  onPress={() => handleDaijaPress(daija)}
                  serverUrl={SERVER_URL}
                  defaultImagePath="/uploads/images/daijaslika.jpg"
                />
              );
            })
          )}
        </View>

        {/* Quick Actions (same as web QuickActions) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigacija</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Lectures')}
            >
              <Ionicons name="book" size={32} color="#fff" />
              <Text style={styles.quickActionText}>Dersovi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Organizations')}
            >
              <Ionicons name="business" size={32} color="#fff" />
              <Text style={styles.quickActionText}>Udruženja</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Daije')}
            >
              <Ionicons name="person" size={32} color="#fff" />
              <Text style={styles.quickActionText}>Daije</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics (same as web Statistic) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistika</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={24} color="#022C43" />
              <Text style={styles.statNumber}>{allLectures?.filter(lecture => lecture.status === 'approved').length || 0}</Text>
              <Text style={styles.statLabel}>Broj predavanja</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="business-outline" size={24} color="#022C43" />
              <Text style={styles.statNumber}>{organizations?.length || 0}</Text>
              <Text style={styles.statLabel}>Broj udruženja</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={24} color="#022C43" />
              <Text style={styles.statNumber}>{daije?.filter(daija => daija.status === 'approved').length || 0}</Text>
              <Text style={styles.statLabel}>Broj daija</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#022C43',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#022C43',
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#022C43',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    elevation: 3,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#022C43',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noLecturesContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  noLecturesText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noLecturesSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
}); 