import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  RefreshControl,
  BackHandler,
  Appearance,
  StatusBar,
  SectionList,
  Platform
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import UniverzalCard from './components/UniverzalCard';
import UniversalProfile from './components/UniversalProfile';
import BottomNavigation from './components/BottomNavigation';
import UniversalPage from './screens/UniversalPage';
import DashboardScreen from './screens/DashboardScreen';
import Header from './components/Header';
import Menu from './components/Menu';
import SimplifiedStatistics from './components/SimplifiedStatistics';
import { sortLecturesByStatus } from './utils/sortingUtils';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddContentMenu from './components/AddContentMenu';
import AddContentPopup from './components/AddContentPopup';
import SearchScreen from './screens/SearchScreen';
import UpdateChecker from './components/UpdateChecker';
import { ToastProvider } from './utils/ToastManager';
import { SkeletonCardList } from './components/SkeletonCard';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import {
  isAuthenticated as checkIsAuthenticated,
  getUserData,
  logout
} from './utils/authHelpers';

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
// Home Page Section List Component
const HomePageSectionList = React.memo(({ onProfileOpen, onNavigateToSection }) => {
  const { lectures, daije, organizations, loading, refresh } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  const lectureItems = useMemo(() => {
    if (!Array.isArray(lectures)) {
      return [];
    }

    const normalized = lectures.map(lecture => ({
      ...lecture,
      type: lecture.type || 'predavanje'
    }));

    return sortLecturesByStatus(normalized).slice(0, 10);
  }, [lectures]);

  const daijeItems = useMemo(() => {
    if (!Array.isArray(daije)) {
      return [];
    }

    const filtered = daije.filter(daija => {
      if (daija.status !== 'approved') {
        return false;
      }

      if (typeof daija.lectureCount === 'number') {
        return daija.lectureCount > 0;
      }

      return (lectures || []).some(lecture => {
        if (!lecture || lecture.status !== 'approved' || !lecture.daija) {
          return false;
        }

        if (typeof lecture.daija === 'object') {
          return lecture.daija._id === daija._id;
        }

        return lecture.daija === daija._id;
      });
    });

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [daije, lectures]);

  const organizationItems = useMemo(() => {
    if (!Array.isArray(organizations)) {
      return [];
    }

    const filtered = organizations.filter(org => {
      if (org.status !== 'approved') {
        return false;
      }

      if (typeof org.lectureCount === 'number') {
        return org.lectureCount > 0;
      }

      return (lectures || []).some(lecture => {
        if (!lecture || lecture.status !== 'approved' || !lecture.organization) {
          return false;
        }

        if (typeof lecture.organization === 'string') {
          return lecture.organization === org.name;
        }

        return lecture.organization._id === org._id || lecture.organization.name === org.name;
      });
    });

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [organizations, lectures]);

  const sections = useMemo(() => ([
    {
      key: 'lectures',
      title: 'Dersovi',
      subtitle: 'Posljednjih 10 najavljenih dersova.',
      data: lectureItems,
      type: 'lecture',
      emptyMessage: 'Trenutno nema dostupnih dersova.',
      onViewAll: () => onNavigateToSection('lectures')
    },
    {
      key: 'daije',
      title: 'Daije',
      subtitle: 'Upoznaj 10 nasumično odabranih daija.',
      data: daijeItems,
      type: 'daija',
      emptyMessage: 'Trenutno nema dostupnih daija.',
      onViewAll: () => onNavigateToSection('speakers')
    },
    {
      key: 'organizations',
      title: 'Udruženja',
      subtitle: 'Upoznaj 10 nasumično odabranih udruženja.',
      data: organizationItems,
      type: 'organization',
      emptyMessage: 'Trenutno nema dostupnih udruženja.',
      onViewAll: () => onNavigateToSection('organizations')
    }
  ]), [lectureItems, daijeItems, organizationItems, onNavigateToSection]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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
      {section.data.length === 0 ? (
        <Text style={styles.emptyText}>{section.emptyMessage}</Text>
      ) : (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={section.onViewAll}
        >
          <Text style={styles.viewAllButtonText}>
            Pogledaj sve {section.title.toLowerCase()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ), []);

  const keyExtractor = useCallback((item, index) => `${item._id || item.id || index}`, []);

  const hasLoadedContent = sections.some(section => section.data.length > 0);

  if (loading && !hasLoadedContent) {
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
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
          title="Povlačite za osvježavanje..."
          titleColor={COLORS.primary}
        />
      }
      windowSize={5}
      initialNumToRender={6}
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 220,
        offset: 220 * index,
        index
      })}
    />
  );
});

// Main App Component
const AppContent = () => {
  // Force light theme regardless of system settings
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, []);
  
  const [activeTab, setActiveTab] = useState('home');
  const universalPageRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { refresh } = useAppData();

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    checkAuthStatus();
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
  const handleContentAdded = useCallback(() => {
    setShowFormPopup(false);
    setSelectedFormType(null);
    refresh();
  }, [refresh]);
  const handleAddContentOptionSelect = (type) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Prijava potrebna',
        'Morate biti prijavljeni da biste dodali sadržaj.',
        [
          { text: 'Otkaži', style: 'cancel' },
          {
            text: 'Prijavi se',
            onPress: () => setActiveTab('auth')
          },
        ],
        { cancelable: true }
      );
      setShowAddMenu(false);
      return;
    }

    setSelectedFormType(type);
    setShowFormPopup(true);
    setShowAddMenu(false);
  };
  const handleProfileNavigate = () => setActiveTab('userProfile');
  
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
          />
        );
      case 'lectures':
        return <UniversalPage type="lectures" onBack={handleBack} onProfileOpen={handleProfileOpen} isAuthenticated={isAuthenticated} user={user} onNavigate={(screen) => setActiveTab(screen)} scrollRef={universalPageRef} />;
      case 'speakers':
        return <UniversalPage type="speakers" onBack={handleBack} onProfileOpen={handleProfileOpen} isAuthenticated={isAuthenticated} user={user} onNavigate={(screen) => setActiveTab(screen)} scrollRef={universalPageRef} />;
      case 'organizations':
        return <UniversalPage type="organizations" onBack={handleBack} onProfileOpen={handleProfileOpen} isAuthenticated={isAuthenticated} user={user} onNavigate={(screen) => setActiveTab(screen)} scrollRef={universalPageRef} />;
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
      

      default:
        return (
          <HomePageSectionList 
            onProfileOpen={handleProfileOpen}
            onNavigateToSection={(section) => setActiveTab(section)}
          />
        );
    }
  };

  return (
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
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AppDataProvider>
          <StatusBar
            barStyle={Platform.OS === 'ios' ? 'light-content' : 'dark-content'}
            backgroundColor={Platform.OS === 'android' ? COLORS.primary : 'transparent'}
            translucent={Platform.OS === 'ios'}
          />
          <AppContent />
        </AppDataProvider>
      </ToastProvider>
    </SafeAreaProvider>
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
