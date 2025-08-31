import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  BackHandler,
  Appearance,
  StatusBar,
  InteractionManager,
  SectionList,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import UniverzalCard from './components/UniverzalCard';
import UniversalProfile from './components/UniversalProfile';
import BottomNavigation from './components/BottomNavigation';
import UniversalPage from './screens/UniversalPage';
import DashboardScreen from './screens/DashboardScreen';
import Header from './components/Header';
import Menu from './components/Menu';
import SimplifiedStatistics from './components/SimplifiedStatistics';
import apiClient from './services/apiClient';
import daijeService from './services/daijeService';
import udruzenjaService from './services/udruzenjaService';
import { ENV } from './config';
import { sortAssociations, sortAllDaijeWithActivePriority, sortEntitiesByUpcomingLecture, sortLecturesByStatus } from './utils/sortingUtils';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddContentMenu from './components/AddContentMenu';
import AddContentPopup from './components/AddContentPopup';
import SearchScreen from './screens/SearchScreen';
import UpdateChecker from './components/UpdateChecker';
import { ToastProvider } from './utils/ToastManager';
import { SkeletonCardList } from './components/SkeletonCard';
import {
  isAuthenticated as checkIsAuthenticated,
  getUserData,
  logout
} from './utils/authHelpers';
import TestFormsScreen from './screens/TestFormsScreen';

Dimensions.get('window');

// Colors matching the web app
const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#333333',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

// Utility functions for date formatting and sorting


// Old sorting function removed - now using centralized sorting from utils/sortingUtils.js

// API function to fetch lectures using apiClient with proper URL switching
const fetchLectures = async () => {
  try {
    // Fetching lectures...
    // Using same endpoint as web app to include cancelled lectures
    const response = await apiClient.get('/lectures/public?status=all');
    const data = response.data;
    
    // Lectures response received
    
    if (Array.isArray(data)) {
      // Processing lectures data - includes both approved and cancelled
      const cancelledLectures = data.filter(l => l.isCancelled === true || l.status === 'cancelled');
      if (cancelledLectures.length > 0) {
        console.log('📊 Otkazana predavanja pronadjena:', cancelledLectures.length);
        console.log('📊 Primjer otkazanog predavanja:', cancelledLectures[0]);
      }
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching lectures:', error.message);
    return [];
  }
};

// API function to fetch daije with filtering
const fetchDaije = async (allLectures = []) => {
  try {
    // Fetching daije...
    const data = await daijeService.getAllDaije();
    const daije = Array.isArray(data) ? data : [];
    
    // Filter only daije with at least one lecture (matching web implementation)
    console.log(`📊 Filtering daije: Total ${daije.length}, Lectures available: ${allLectures.length}`);
    const daijeWithLectures = daije.filter(daija => {
      // If daija has lectureCount from backend, use it
      if (typeof daija.lectureCount === 'number') {
        return daija.lectureCount > 0;
      }
      
      // Fallback: Check if daija has any approved lectures
      return allLectures.some(lecture => {
        if (!lecture || lecture.isCancelled || lecture.status === 'cancelled') {
          return false;
        }
        
        // Check if lecture is by this daija
        if (lecture.daija && typeof lecture.daija === 'object') {
          return lecture.daija._id === daija._id;
        } else if (lecture.daija) {
          return lecture.daija === daija._id;
        }
        
        // Check daijaIds array for multiple daija support
        if (lecture.daijaIds && Array.isArray(lecture.daijaIds)) {
          return lecture.daijaIds.includes(daija._id);
        }
        
        return false;
      });
    });
    
    // Daije response received
    console.log(`✅ Filtered daije: ${daijeWithLectures.length} with lectures (from ${daije.length} total)`);
    return daijeWithLectures;
  } catch (error) {
    console.error('❌ Error fetching daije:', error);
    return [];
  }
};

// API function to fetch udruzenja with filtering
const fetchUdruzenja = async (allLectures = []) => {
  try {
    // Fetching udruzenja...
    const data = await udruzenjaService.getAllUdruzenja();
    const organizations = Array.isArray(data) ? data : [];
    
    // Filter only organizations with at least one lecture (matching web implementation)
    console.log(`📊 Filtering organizations: Total ${organizations.length}, Lectures available: ${allLectures.length}`);
    const orgsWithLectures = organizations.filter(org => {
      // If organization has lectureCount from backend, use it
      if (typeof org.lectureCount === 'number') {
        return org.lectureCount > 0;
      }
      
      // Fallback: Check if organization has any approved lectures
      return allLectures.some(lecture => {
        if (!lecture || lecture.isCancelled || lecture.status === 'cancelled') {
          return false;
        }
        
        // Check if lecture is by this organization
        if (lecture.organizationId && typeof lecture.organizationId === 'object') {
          return lecture.organizationId._id === org._id;
        } else if (lecture.organizationId) {
          return lecture.organizationId === org._id;
        }
        
        return false;
      });
    });
    
    // Udruzenja response received
    console.log(`✅ Filtered organizations: ${orgsWithLectures.length} with lectures (from ${organizations.length} total)`);
    return orgsWithLectures;
  } catch (error) {
    console.error('❌ Error fetching udruzenja:', error);
    return [];
  }
};

// Home Page Section List Component
const HomePageSectionList = React.memo(({ onProfileOpen, onNavigateToSection, forceRefresh }) => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      // First fetch lectures as they are needed for filtering
      const lecturesData = await fetchLectures();
      const allLectures = Array.isArray(lecturesData) ? lecturesData : [];
      
      // Then fetch daije and udruzenja with lectures for filtering
      const [daijeData, udruzenjaData] = await Promise.all([
        fetchDaije(allLectures),
        fetchUdruzenja(allLectures)
      ]);
      
      // Process lectures - include all lectures (approved and cancelled) like web app
      // Add type field to each lecture
      const lecturesWithType = allLectures.map(lecture => ({
        ...lecture,
        type: 'predavanje'
      }));
      const sortedLectures = sortLecturesByStatus(lecturesWithType).slice(0, 10);
      
      // Process daije
      const approvedDaije = (Array.isArray(daijeData) ? daijeData : [])
        .filter(daija => daija.status === 'approved');
      const shuffledDaije = [...approvedDaije].sort(() => Math.random() - 0.5).slice(0, 10);
      
      // Process udruzenja
      const approvedOrgs = (Array.isArray(udruzenjaData) ? udruzenjaData : [])
        .filter(org => org.status === 'approved');
      const shuffledOrgs = [...approvedOrgs].sort(() => Math.random() - 0.5).slice(0, 10);
      
      // Create sections
      const newSections = [
        {
          title: 'Dersovi',
          data: sortedLectures,
          type: 'lecture',
          onViewAll: () => onNavigateToSection('lectures')
        },
        {
          title: 'Daije',
          subtitle: 'Upoznaj 10 nasumično odabranih daija.',
          data: shuffledDaije,
          type: 'daija',
          onViewAll: () => onNavigateToSection('speakers')
        },
        {
          title: 'Udruženja',
          subtitle: 'Upoznaj 10 nasumično odabranih udruženja.',
          data: shuffledOrgs,
          type: 'organization',
          onViewAll: () => onNavigateToSection('organizations')
        }
      ];
      
      setSections(newSections);
      setHasLoadedData(true);
    } catch (error) {
      console.error('Error loading home data:', error);
      setSections([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [onNavigateToSection]);
  
  useEffect(() => {
    // Only load data if we haven't loaded it yet
    if (!hasLoadedData) {
      loadAllData();
    }
  }, [hasLoadedData, loadAllData]);
  
  // Effect to handle force refresh
  useEffect(() => {
    if (forceRefresh) {
      setHasLoadedData(false);
      loadAllData();
    }
  }, [forceRefresh, loadAllData]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasLoadedData(false); // Force reload on manual refresh
    loadAllData();
  }, [loadAllData]);
  
  const renderItem = useCallback(({ item, section }) => (
    <UniverzalCard
      key={`${section.type}-${item._id || item.id}`}
      data={{
        ...item,
        type: section.type
      }}
      onPress={() => onProfileOpen(item, section.type)}
    />
  ), [onProfileOpen]);
  
  const renderSectionHeader = useCallback(({ section }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.subtitle && (
        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
      )}
    </View>
  ), []);
  
  const renderSectionFooter = useCallback(({ section }) => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={section.onViewAll}
      >
        <Text style={styles.viewAllButtonText}>
          Pogledaj sve {section.title.toLowerCase()}
        </Text>
      </TouchableOpacity>
    </View>
  ), []);
  
  const keyExtractor = useCallback((item, index) => 
    `${item._id || item.id || index}`, []);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.skeletonSection}>
          <Text style={styles.sectionTitle}>Dersovi</Text>
          <SkeletonCardList count={3} type="lecture" />
        </View>
        <View style={styles.skeletonSection}>
          <Text style={styles.sectionTitle}>Daije</Text>
          <SkeletonCardList count={3} type="daija" />
        </View>
        <View style={styles.skeletonSection}>
          <Text style={styles.sectionTitle}>Udruženja</Text>
          <SkeletonCardList count={3} type="organization" />
        </View>
      </View>
    );
  }
  
  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={renderSectionFooter}
      keyExtractor={keyExtractor}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.sectionListContent}
      ListFooterComponent={<SimplifiedStatistics />}
      bounces={true}
      overScrollMode="always"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
          title="Povlačite za osvježavanje..."
          titleColor={COLORS.primary}
        />
      }
      // Performance optimizations
      windowSize={5}
      initialNumToRender={6}
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 220, // Approximate height of each card including margin
        offset: 220 * index,
        index,
      })}
    />
  );
});

// Main App Component
export default function App() {
  // Force light theme regardless of system settings
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, []);
  
  const [activeTab, setActiveTab] = useState('home');
  const homeScrollRef = useRef(null);
  const universalPageRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shouldRefreshHome, setShouldRefreshHome] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [allLectures, setAllLectures] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          console.log('User loaded:', userData.username, 'Role:', userData.role);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Load all lectures for sorting purposes
  useEffect(() => {
    let mounted = true;
    
    const loadAllLectures = async () => {
      try {
        const data = await fetchLectures();
        if (mounted) {
          // Include all lectures (approved and cancelled) like web app
          const allLecturesData = Array.isArray(data) ? data : [];
          // Add type field to each lecture
          const lecturesWithType = allLecturesData.map(lecture => ({
            ...lecture,
            type: 'predavanje'
          }));
          setAllLectures(lecturesWithType);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error loading all lectures:', error);
          setAllLectures([]);
        }
      }
    };

    loadAllLectures();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // If we're on home screen, let default behavior happen (exit app)
        if (activeTab === 'home') {
          return false;
        }
        
        // Otherwise, go back to home
        setActiveTab('home');
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, [activeTab]);

  const handleBack = () => setActiveTab('home');
  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleMenuNavigate = (path) => {
    setActiveTab(path);
    setMenuOpen(false);
  };
  const handleProfileOpen = useCallback((data, type) => {
    setProfileData(data);
    setProfileType(type);
    setActiveTab('profile');
  }, []);
  const handleProfileBack = () => {
    setActiveTab('home');
    setProfileData(null);
    setProfileType(null);
  };
  const handleAuthNavigate = () => setActiveTab('auth');
  const handleLogout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('home');
  };
  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActiveTab('home');
  };
  const handleTabPress = (tab) => {
    // Handle add button separately
    if (tab === 'add') {
      setShowAddMenu(!showAddMenu);
      return;
    }
    
    // Removed auto-scroll to top when clicking same tab to prevent scroll issues
    setActiveTab(tab);
  };
  const handleLogoPress = () => setActiveTab('home');
  const handleContentAdded = () => {
    setShowFormPopup(false);
    setSelectedFormType(null);
    // Trigger refresh only for home page
    setShouldRefreshHome(true);
    // Reset the refresh trigger after a short delay
    setTimeout(() => setShouldRefreshHome(false), 100);
  };
  const handleAddContentOptionSelect = (type) => {
    setSelectedFormType(type);
    setShowFormPopup(true);
    setShowAddMenu(false);
  };
  const handleProfileNavigate = () => setActiveTab('userProfile');
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);
  
  const getPageTitle = () => {
    switch(activeTab) {
      case 'lectures': return 'Dersovi';
      case 'speakers': return 'Daije';
      case 'organizations': return 'Udruženja';
      case 'search': return 'Pretraga';
      default: return 'DERS.BA';
    }
  };
  
  const shouldShowBottomNavigation = () => {
    return !['dashboard', 'auth', 'userProfile', 'search'].includes(activeTab);
  };

  // Main component render
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePageSectionList 
            onProfileOpen={handleProfileOpen}
            onNavigateToSection={(section) => setActiveTab(section)}
            forceRefresh={shouldRefreshHome}
          />
        );
      case 'lectures':
        return <UniversalPage type="lectures" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} isAuthenticated={isAuthenticated} user={user} onNavigate={(screen) => setActiveTab(screen)} scrollRef={universalPageRef} />;
      case 'speakers':
        return <UniversalPage type="speakers" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} isAuthenticated={isAuthenticated} user={user} onNavigate={(screen) => setActiveTab(screen)} scrollRef={universalPageRef} />;
      case 'organizations':
        return <UniversalPage type="organizations" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} isAuthenticated={isAuthenticated} user={user} onNavigate={(screen) => setActiveTab(screen)} scrollRef={universalPageRef} />;
      case 'search':
        return <SearchScreen onBack={handleBack} onNavigate={(screen) => setActiveTab(screen)} onAddContent={handleAddContentOptionSelect} onProfileOpen={handleProfileOpen} />;
      case 'profile':
        return (
          <UniversalProfile 
            data={profileData} 
            type={profileType} 
            onBack={handleProfileBack}
            onProfileOpen={handleProfileOpen}
            onAdd={handleAddContentOptionSelect}
            user={user}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'dashboard':
        // Check if user is admin before showing dashboard
        if (!isAuthenticated) {
          Alert.alert('Greška', 'Morate biti ulogovani za pristup admin panelu');
          setActiveTab('auth');
          return null;
        }
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
          Alert.alert('Greška', 'Nemate dozvolu za pristup admin panelu');
          setActiveTab('home');
          return null;
        }
        return <DashboardScreen onBack={handleBack} userRole={user.role} onDataChange={handleContentAdded} />;
      case 'auth':
        if (isAuthenticated) {
          setActiveTab('home');
          return null;
        }
        return <AuthScreen onBack={handleBack} onAuthSuccess={handleAuthSuccess} />;
      case 'userProfile':
        if (!isAuthenticated) {
          Alert.alert('Greška', 'Morate biti ulogovani za pristup profilu');
          setActiveTab('auth');
          return null;
        }
        return <ProfileScreen navigation={{ navigate: (screen) => setActiveTab(screen) }} onBack={handleBack} />;
      
      case 'testforms':
        return <TestFormsScreen />;

      default:
        return (
          <HomePageSectionList 
            onProfileOpen={handleProfileOpen}
            onNavigateToSection={(section) => setActiveTab(section)}
            forceRefresh={shouldRefreshHome}
          />
        );
    }
  };

  return (
    <ToastProvider>
      <SafeAreaProvider>
        <StatusBar 
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'dark-content'}
          backgroundColor={Platform.OS === 'android' ? COLORS.primary : 'transparent'}
          translucent={Platform.OS === 'ios'}
        />
        <View style={styles.container}>
          <Header 
            onMenuPress={handleMenuToggle}
          title={getPageTitle()}
          onLogoPress={handleLogoPress}
        />
        
        {renderContent()}

        {shouldShowBottomNavigation() && (
          <BottomNavigation
            activeTab={activeTab}
            onTabPress={handleTabPress}
            isAddMenuOpen={showAddMenu}
          />
        )}

        <Menu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={handleMenuNavigate}
          isAuthenticated={isAuthenticated}
          user={user}
          onAuthNavigate={handleAuthNavigate}
          onLogout={handleLogout}
          onAddContent={() => setShowAddMenu(true)}
          onProfileNavigate={handleProfileNavigate}
        />

        <AddContentMenu
          visible={showAddMenu}
          onOptionSelect={handleAddContentOptionSelect}
          onClose={() => setShowAddMenu(false)}
        />

        <AddContentPopup
          visible={showFormPopup}
          onClose={() => {
            setShowFormPopup(false);
            setSelectedFormType(null);
          }}
          onSuccess={handleContentAdded}
          initialType={selectedFormType}
        />
        
        <UpdateChecker />
      </View>
    </SafeAreaProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionListContent: {
    paddingBottom: 150, // Padding for bottom navigation and statistics
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  cardsContainer: {
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 20,
  },
  skeletonSection: {
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  viewAllButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  viewAllButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Registration Benefits Styles
  registrationContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  benefitsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 48,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
  },
  // Quick Actions Styles
  quickActionsContainer: {
    padding: 20,
    backgroundColor: COLORS.lightGray,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
  },

});
