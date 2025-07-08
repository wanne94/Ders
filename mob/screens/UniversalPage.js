import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, ActivityIndicator, Text, SafeAreaView } from 'react-native';
import UniverzalCard from '../components/UniverzalCard';
import Menu from '../components/Menu';
import apiClient from '../services/apiClient';
import udruzenjaService from '../services/udruzenjaService';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import { formatDateWithDay } from '../utils/dateUtils';
import { applySorting, sortLecturesByStatus } from '../utils/sortingUtils';
import { ENV } from '../config';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
};

const UniversalPage = ({ type = 'lectures', onBack, onProfileOpen, allLectures = [], onNavigate, user, isAuthenticated }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await pageConfig.fetchFunction();
      const rawData = Array.isArray(result) ? result : [];
      
      // Apply centralized sorting
      const sortedData = type === 'lectures' 
        ? sortLecturesByStatus(rawData)
        : applySorting(rawData, type, allLectures);
      setData(sortedData);
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom učitavanja podataka');
      console.error('Error loading data:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type]);

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
    Alert.alert('Pretraga', 'Funkcionalnost pretrage će biti dostupna uskoro');
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

  const handleLogout = () => {
    // TODO: Implement real logout logic
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleAddContent = () => {
    if (onNavigate) {
      onNavigate('add-content');
    }
  };

  const handleAddContentWithType = (type) => {
    // TODO: Implement specific content type adding
    if (onNavigate) {
      onNavigate('add-content');
    }
  };

  const handleProfileNavigate = (userId, userType) => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Učitavanje...</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Trenutno nema dostupnih podataka.</Text>
          </View>
        ) : (
          data.map((item, index) => (
            <UniverzalCard
              key={item?.id || item?._id || index}
              data={{
                ...item,
                type: type === 'lectures' ? 'predavanje' : 
                      type === 'speakers' ? 'daija' : 
                      type === 'organizations' ? 'udruženje' : item.type
              }}
              onPress={() => handleItemPress(item)}
            />
          ))
        )}
      </ScrollView>
      
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

// API functions using the real services
const fetchLectures = async () => {
  try {
    console.log('UniversalPage: Fetching lectures...');
    const response = await apiClient.get('/lectures/dashboard/public');
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('UniversalPage: Error fetching lectures:', error.message);
    return [];
  }
};

const fetchDaije = async () => {
  try {
    const data = await daijeService.getAllDaije();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching daije:', error);
    return [];
  }
};

const fetchOrganizations = async () => {
  try {
    const data = await udruzenjaService.getAllUdruzenja();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
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
});

export default UniversalPage; 