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
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar } from 'react-native-paper';
import apiService from '../services/apiService';
import { colors, COLOR_USAGE } from '../config/theme';
import UniversalCard from '../components/UniversalCard';
import { useBackHandler } from '../utils/useBackHandler';
import { useScrollDirection } from '../utils/useScrollDirection';
import { SERVER_URL } from '../config/api';

// Remove hardcoded SERVER_URL
// const SERVER_URL = 'http://192.168.0.20:5003';

export default function OrganizationsScreen({ navigation }) {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [searchQuery, organizations]);

  const fetchOrganizations = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setIsLoading(true);
      }
      setError(null);
      
      const [organizationsData, lecturesData] = await Promise.all([
        apiService.getOrganizations(),
        apiService.getLectures()
      ]);
      
      // Add lecture count to each organization
      const organizationsWithLectureCount = organizationsData.map(organization => {
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
      
      setOrganizations(organizationsWithLectureCount);
      setFilteredOrganizations(organizationsWithLectureCount);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Greška pri dohvaćanju udruženja. Molimo pokušajte ponovo.');
      
      // Set empty array if no data
      setOrganizations([]);
      setFilteredOrganizations([]);
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrganizations(true);
  };

  const filterOrganizations = () => {
    let filtered = organizations;

    // Filter by search query - improved search
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(organization => {
        // Search in name (most important)
        const nameMatch = organization.name?.toLowerCase().includes(query);
        
        // Search in description
        const descriptionMatch = organization.shortDescription?.toLowerCase().includes(query) ||
                                organization.description?.toLowerCase().includes(query);
        
        // Search in location
        const locationMatch = organization.address?.toLowerCase().includes(query) ||
                             organization.city?.toLowerCase().includes(query);
        
        return nameMatch || descriptionMatch || locationMatch;
      });
    }

    setFilteredOrganizations(filtered);
  };

  const navigateToOrganizationDetail = (organization) => {
    navigation.navigate('OrganizationDetail', { organizationId: organization._id });
  };

  const renderOrganizationItem = ({ item }) => {
    // Prepare info rows for the card
    const infoRows = [
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

    return (
      <UniversalCard
        title={item.name}
        infoRows={infoRows}
        rightContentType="image"
        imageUrl={item.image}
        onPress={() => navigateToOrganizationDetail(item)}
        searchQuery={searchQuery}
        serverUrl={SERVER_URL}
        defaultImagePath="/uploads/images/udruzenjeslika.jpg"
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Učitavam udruženja...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={filteredOrganizations}
          renderItem={renderOrganizationItem}
          keyExtractor={(item) => item._id}
          style={styles.organizationsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          ListHeaderComponent={() => (
            <View style={styles.searchContainer}>
              <View style={styles.header}>
                <View style={styles.searchInputContainer}>
                  <Searchbar
                    placeholder="Pretraži po nazivu, mjestu, opisu..."
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
                      Pretražuje se: naziv, opis, grad, adresa
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: colors.text.secondary }}>
                Nema udruženja koja odgovaraju pretrazi.
              </Text>
            </View>
          )}
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
  organizationsList: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
}); 