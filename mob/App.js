import { useState, useEffect } from 'react';
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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { SystemBars } from 'react-native-edge-to-edge'; // Temporarily disabled
import UniverzalCard from './components/UniverzalCard';
import UniversalProfile from './components/UniversalProfile';
import BottomNavigation from './components/BottomNavigation';
import UniversalPage from './screens/UniversalPage';
import DashboardScreen from './screens/DashboardScreen';
import Header from './components/Header';
import Menu from './components/Menu';
import apiClient from './services/apiClient';
import daijeService from './services/daijeService';
import udruzenjaService from './services/udruzenjaService';
import { ENV } from './config';
import { sortAssociations, sortAllDaijeWithActivePriority, sortEntitiesByUpcomingLecture, sortLecturesByStatus } from './utils/sortingUtils';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddContentMenu from './components/AddContentMenu';
import AddContentPopup from './components/AddContentPopup';
import {
  isAuthenticated as checkIsAuthenticated,
  getUserData,
  logout
} from './utils/authHelpers';
import firebaseService from './config/firebase';

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
    console.log('🔍 Fetching lectures...');
    const response = await apiClient.get('/lectures/dashboard/public');
    const data = response.data;
    
    console.log('📊 Lectures response:', data);
    console.log('📊 Is array?', Array.isArray(data));
    console.log('📊 Length:', data?.length);
    
    if (Array.isArray(data)) {
      console.log('📋 First few lectures:', data.slice(0, 3).map(l => ({ 
        id: l._id, 
        title: l.title, 
        status: l.status,
        date: l.date 
      })));
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching lectures:', error.message);
    return [];
  }
};

// API function to fetch daije
const fetchDaije = async () => {
  try {
    console.log('🔍 Fetching daije...');
    const data = await daijeService.getAllDaije();
    console.log('📊 Daije response:', data);
    console.log('📊 Is array?', Array.isArray(data));
    console.log('📊 Length:', data?.length);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching daije:', error);
    return [];
  }
};

// API function to fetch udruzenja
const fetchUdruzenja = async () => {
  try {
    console.log('🔍 Fetching udruzenja...');
    const data = await udruzenjaService.getAllUdruzenja();
    console.log('📊 Udruzenja response:', data);
    console.log('📊 Is array?', Array.isArray(data));
    console.log('📊 Length:', data?.length);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching udruzenja:', error);
    return [];
  }
};

// Lectures Section Component
const LecturesSection = ({ onProfileOpen, allLectures = [], onNavigateToLectures }) => {
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLectures = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLectures();
        // Filter only approved and non-cancelled lectures, matching web app behavior
        const approvedLectures = (Array.isArray(data) ? data : []).filter(lecture => 
          lecture.status === 'approved' && !lecture.cancelled
        );
        // Apply centralized sorting by date
        const sortedData = sortLecturesByStatus(approvedLectures);
        setLectures(sortedData.slice(0, 8)); // Limit to 8 lectures for homepage
      } catch (err) {
        console.error('Error loading lectures:', err);
        setLectures([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLectures();
  }, [allLectures]);

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dersovi</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!lectures?.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dersovi</Text>
        <Text style={styles.emptyText}>Trenutno nema dostupnih dersova.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dersovi</Text>
      <Text style={styles.sectionSubtitle}>
        Posljednja 8 najavljenih dersova
      </Text>
      <View style={styles.cardsContainer}>
        {lectures?.map((lecture, index) => (
          lecture ? (
            <UniverzalCard
              key={`lecture-${lecture?._id || lecture?.id || index}`}
              data={lecture}
              onPress={() => {
                if (lecture && onProfileOpen) {
                  onProfileOpen(lecture, 'lecture');
                }
              }}
            />
          ) : null
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={onNavigateToLectures}
      >
        <Text style={styles.viewAllButtonText}>Pogledaj sve dersove</Text>
      </TouchableOpacity>
    </View>
  );
};

// Daije Section Component
const DaijeSection = ({ onProfileOpen, allLectures = [], onNavigateToDaije }) => {
  const [daije, setDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDaije = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDaije();
        // Sort all approved daije with random arrangement, prioritizing those with active lectures
        const sortedData = sortAllDaijeWithActivePriority(Array.isArray(data) ? data : [], allLectures);
        setDaije(sortedData.slice(0, 8)); // Limit to 8 daije for homepage
      } catch (err) {
        console.error('Error loading daije:', err);
        setDaije([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDaije();
  }, [allLectures]);

  const handleDaijaPress = (daija) => {
    if (!daija || !onProfileOpen) return;
    onProfileOpen(daija, 'daija');
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daije</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Učitavanje daija...</Text>
        </View>
      </View>
    );
  }

  if (!daije?.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daije</Text>
        <Text style={styles.emptyText}>Trenutno nema dostupnih daija.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daije</Text>
      <Text style={styles.sectionSubtitle}>
        Upoznaj 8 nasumično odabranih daija.
      </Text>
      <View style={styles.cardsContainer}>
        {daije.map((daija, index) => (
          daija ? (
            <UniverzalCard
              key={`daija-${daija._id || daija.id || index}`}
              data={{
                ...daija,
                type: 'daija'
              }}
              onPress={() => handleDaijaPress(daija)}
            />
          ) : null
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={onNavigateToDaije}
      >
        <Text style={styles.viewAllButtonText}>Pogledaj sve daije</Text>
      </TouchableOpacity>
    </View>
  );
};

// Udruzenja Section Component
const UdruzenjaSection = ({ onProfileOpen, allLectures = [], onNavigateToOrganizations }) => {
  const [udruzenja, setUdruzenja] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUdruzenja = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUdruzenja();
        // Apply centralized sorting - associations with upcoming lectures first
        const sortedData = sortAssociations(Array.isArray(data) ? data : [], allLectures);
        setUdruzenja(sortedData.slice(0, 8)); // Limit to 8 organizations for homepage
      } catch (err) {
        console.error('Error loading udruzenja:', err);
        setUdruzenja([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUdruzenja();
  }, [allLectures]);

  const handleUdruzenjePress = (udruzenje) => {
    if (!udruzenje || !onProfileOpen) return;
    onProfileOpen(udruzenje, 'organization');
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Udruženja</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Učitavanje udruženja...</Text>
        </View>
      </View>
    );
  }

  if (!udruzenja?.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Udruženja</Text>
        <Text style={styles.emptyText}>Trenutno nema dostupnih udruženja.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Udruženja</Text>
      <Text style={styles.sectionSubtitle}>
        Prikazuje se 8 odobrenih udruženja - prioritet imaju ona sa aktivnim predavanjima
      </Text>
      <View style={styles.cardsContainer}>
        {udruzenja.map((udruzenje, index) => (
          udruzenje ? (
            <UniverzalCard
              key={`udruzenje-${udruzenje._id || udruzenje.id || index}`}
              data={{
                ...udruzenje,
                type: 'udruženje'
              }}
              onPress={() => handleUdruzenjePress(udruzenje)}
            />
          ) : null
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={onNavigateToOrganizations}
      >
        <Text style={styles.viewAllButtonText}>Pogledaj sva udruženja</Text>
      </TouchableOpacity>
    </View>
  );
};

// Registration Benefits Component
const RegistrationBenefits = ({ onAuthNavigate, isAuthenticated }) => {
  const benefits = [
    {
      title: 'Dodavanje sadržaja',
      description: 'Objavljivanje novih predavanja', 
      icon: 'add-circle-outline',
      color: COLORS.primary
    },
    {
      title: 'Obavještenja (Uskoro inshallah)',
      description: 'Najnovija predavanja',
      icon: 'notifications-outline',
      color: COLORS.primary
    },
    {
      title: 'Doprinesi širenju znanja',
      description: 'Dijeljenje korisnog sadržaja',
      icon: 'star-outline',
      color: COLORS.primary
    }
  ];

  return (
    <View style={styles.registrationContainer}>
      <Text style={styles.sectionTitle}>Zašto se registrovati?</Text>
      
      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <View key={`benefit-${index}`} style={styles.benefitCard}>
            <Ionicons name={benefit.icon} size={20} color={benefit.color} />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {!isAuthenticated && (
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={onAuthNavigate}
          activeOpacity={0.7}
        >
          <Text style={styles.registerButtonText}>Registrujte se</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Hero Section Component



// Quick Actions Component
const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Dersovi',
      description: 'Sva dostupna predavanja',
      icon: 'book-outline',
      color: COLORS.primary,
      tabId: 'lectures'
    },
    {
      title: 'Udruženja',
      description: 'Udruženja i aktivnosti',
      icon: 'business-outline',
      color: COLORS.primary,
      tabId: 'organizations'
    },
    {
      title: 'Daije',
      description: 'Naši daije',
      icon: 'people-outline',
      color: COLORS.primary,
      tabId: 'speakers'
    },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Navigacija</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={`action-${index}`}
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => onNavigate && onNavigate(action.tabId)}
          >
            <Ionicons name={action.icon} size={24} color={action.color} />
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


// Main App Component
export default function App() {
  console.log('App component starting...');
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState(null);
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Shared lectures state for sorting purposes
  const [allLectures, setAllLectures] = useState([]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (activeTab === 'home') {
        // If we're on home screen, allow default behavior (exit app)
        return false;
      } else if (activeTab === 'profile') {
        // If we're viewing a profile, go back to the previous screen
        handleProfileBack();
        return true;
      } else {
        // For all other screens, go back to home
        setActiveTab('home');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [activeTab]);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await checkIsAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = await getUserData();
          setUser(userData);
          // Set user for Firebase analytics and crashlytics
          firebaseService.setUserId(userData.id || userData._id);
          firebaseService.setUserProperties({
            user_type: userData.role || 'user',
            registration_date: userData.createdAt || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        firebaseService.logError(error, { context: 'app_auth_check' });
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    // Initialize Firebase and check auth
    const initializeApp = async () => {
      try {
        // Force light theme regardless of system settings
        Appearance.setColorScheme('light');
        
        // Firebase trackanje pokretanja aplikacije
        firebaseService.logEvent('app_open');
        firebaseService.logScreenView('Home', 'HomeScreen');
        
        await checkAuth();
      } catch (error) {
        console.error('App initialization error:', error);
        firebaseService.logError(error, { context: 'app_initialization' });
      }
    };

    initializeApp();
  }, []);

  // Load all lectures for sorting purposes
  useEffect(() => {
    const loadAllLectures = async () => {
      try {
        const data = await fetchLectures();
        // Filter out cancelled lectures for sorting purposes
        const validLectures = (Array.isArray(data) ? data : []).filter(lecture => !lecture.cancelled);
        setAllLectures(validLectures);
      } catch (error) {
        console.error('Error loading all lectures for sorting:', error);
        setAllLectures([]);
      }
    };

    loadAllLectures();
  }, [refreshKey]);

  const handleTabPress = (tabId) => {
    // Firebase tracking za tab navigation
    firebaseService.trackUserAction('tab_press', { tab_id: tabId });
    firebaseService.logScreenView(tabId, `${tabId}Screen`);
    
    if (tabId === 'add') {
      if (!isAuthenticated) {
        Alert.alert('Greška', 'Morate biti ulogovani za dodavanje sadržaja');
        firebaseService.trackUserAction('auth_required', { context: 'add_content' });
        setActiveTab('auth');
        return;
      }
      setShowAddMenu(prev => !prev);
      firebaseService.trackUserAction('add_menu_toggle', { open: !showAddMenu });
    } else {
      setActiveTab(tabId);
      setShowAddMenu(false); // Zatvori add menu kada se klikne na drugi tab
    }
  };

  const handleBack = () => {
    setActiveTab('home');
  };

  const handleMenuToggle = () => {
    setMenuOpen(prev => !prev);
    // Zatvori add menu kada se otvori glavni menu
    if (!menuOpen) {
      setShowAddMenu(false);
    }
  };

  const handleMenuNavigate = (path) => {
    setActiveTab(path);
  };

  const handleProfileOpen = (data, type) => {
    setProfileData(data);
    setProfileType(type);
    setActiveTab('profile');
  };

  const handleProfileBack = () => {
    setProfileData(null);
    setProfileType(null);
    setActiveTab('home');
  };

  const handleProfileNavigate = () => {
    setActiveTab('userProfile');
  };

  const handleLogoPress = () => {
    setActiveTab('home');
    setMenuOpen(false);
    setShowAddMenu(false);
  };

  // Auth handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      setActiveTab('home');
      Alert.alert('Uspjeh', 'Uspješno ste se odjavili');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom odjave');
    }
  };

  const handleAuthNavigate = () => {
    setActiveTab('auth');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refresh of all data by changing the refresh key
      // This will cause all sections to remount and reload their data
      setRefreshKey(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for better UX
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle content addition success - refresh data
  const handleContentAdded = () => {
    // Force refresh of all data
    setRefreshKey(prev => prev + 1);
  };

  const handleAddContentOptionSelect = (optionId) => {
    // Zatvori menu prvo
    setShowAddMenu(false);
    // Otvori odgovarajući form
    setSelectedFormType(optionId);
    setShowFormPopup(true);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'lectures':
        return 'Predavanja';
      case 'speakers':
        return 'Daije';
      case 'organizations':
        return 'Udruženja';
      case 'dashboard':
        return 'Admin Panel';
      case 'auth':
        return 'Prijava';
      case 'userProfile':
        return 'Moj profil';
      default:
        return '';
    }
  };

  const shouldShowBottomNavigation = () => {
    const hiddenTabs = ['userProfile', 'dashboard'];
    return !hiddenTabs.includes(activeTab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <LecturesSection key={`lectures-${refreshKey}`} onProfileOpen={handleProfileOpen} allLectures={allLectures} onNavigateToLectures={() => setActiveTab('lectures')} />
            <RegistrationBenefits key={`benefits-${refreshKey}`} onAuthNavigate={handleAuthNavigate} isAuthenticated={isAuthenticated} />
            <DaijeSection key={`daije-${refreshKey}`} onProfileOpen={handleProfileOpen} allLectures={allLectures} onNavigateToDaije={() => setActiveTab('speakers')} />
            <UdruzenjaSection key={`udruzenja-${refreshKey}`} onProfileOpen={handleProfileOpen} allLectures={allLectures} onNavigateToOrganizations={() => setActiveTab('organizations')} />
            <QuickActions key={`actions-${refreshKey}`} onNavigate={setActiveTab} />
          </>
        );
      case 'lectures':
        return <UniversalPage type="lectures" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} />;
      case 'speakers':
        return <UniversalPage type="speakers" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} />;
      case 'organizations':
        return <UniversalPage type="organizations" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} />;
      case 'profile':
        return (
          <UniversalProfile 
            data={profileData} 
            type={profileType} 
            onBack={handleProfileBack}
            onProfileOpen={handleProfileOpen}
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
        return <ProfileScreen navigation={{ navigate: (screen) => setActiveTab(screen) }} />;

      default:
        return <LecturesSection onProfileOpen={handleProfileOpen} allLectures={allLectures} onNavigateToLectures={() => setActiveTab('lectures')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* <SystemBars style="light" hidden={false} /> */}
      <View style={styles.container}>
        <Header 
          onMenuPress={handleMenuToggle}
          title={getPageTitle()}
          onLogoPress={handleLogoPress}
        />
        
        {activeTab === 'home' ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: shouldShowBottomNavigation() ? 100 : 20 }
            ]}
            showsVerticalScrollIndicator={false}
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
          >
            {renderContent()}
          </ScrollView>
        ) : (
          renderContent()
        )}

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
      </View>
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
    alignItems: 'center',
    padding: 20,
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
