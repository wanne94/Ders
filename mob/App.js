import { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UniverzalCard from './components/UniverzalCard';
import UniversalProfile from './components/UniversalProfile';
import BottomNavigation from './components/BottomNavigation';
import UniversalPage from './screens/UniversalPage';
import DashboardScreen from './screens/DashboardScreen';
import Header from './components/Header';
import Menu from './components/Menu';
import daijeService from './services/daijeService';
import udruzenjaService from './services/udruzenjaService';
import { ENV } from './config';
import { sortAssociations } from './utils/sortingUtils';
import AuthScreen from './screens/AuthScreen';
import AddContentPopup from './components/AddContentPopup';
import {
  isAuthenticated as checkIsAuthenticated,
  getUserData,
  logout
} from './utils/authHelpers';
import { sortAllDaijeWithActivePriority } from './utils/sortingUtils';
import { sortEntitiesByUpcomingLecture } from './utils/sortingUtils';

const { width, height } = Dimensions.get('window');

// Colors matching the web app
const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

// Utility functions for date formatting and sorting
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}.`;
};

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

// Old sorting function removed - now using centralized sorting from utils/sortingUtils.js

// API function to fetch lectures
const fetchLectures = async () => {
  try {
    console.log('🔍 Fetching lectures...');
    console.log('🌐 API URL:', `${ENV.API_URL}/lectures/dashboard/public`);
    
    // Use dashboard endpoint to get all approved lectures (not just future ones)
    const response = await fetch(`${ENV.API_URL}/lectures/dashboard/public`);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
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
    console.error('❌ Error fetching lectures:', error);
    console.error('❌ Error details:', error.message);
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
const LecturesSection = ({ onProfileOpen, allLectures = [] }) => {
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLectures = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLectures();
        // Apply centralized sorting - upcoming lectures first, then by proximity
        const sortedData = sortEntitiesByUpcomingLecture(Array.isArray(data) ? data : [], allLectures);
        setLectures(sortedData.slice(0, 10)); // Limit to 10 lectures for homepage
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
        Nedavno najavljeni dersovi
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
    </View>
  );
};

// Daije Section Component
const DaijeSection = ({ onProfileOpen, allLectures = [] }) => {
  const [daije, setDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDaije = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDaije();
        // Sort all approved daije with random arrangement, prioritizing those with active lectures
        const sortedData = sortAllDaijeWithActivePriority(Array.isArray(data) ? data : [], allLectures);
        setDaije(sortedData.slice(0, 10)); // Limit to 10 daije for homepage
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
        Upoznaj 10 nasumično odabranih daija.
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
        onPress={() => Alert.alert('Sve daije', 'Ova funkcionalnost će biti dostupna uskoro.')}
      >
        <Text style={styles.viewAllButtonText}>Pogledaj sve daije</Text>
      </TouchableOpacity>
    </View>
  );
};

// Udruzenja Section Component
const UdruzenjaSection = ({ onProfileOpen, allLectures = [] }) => {
  const [udruzenja, setUdruzenja] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUdruzenja = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUdruzenja();
        // Apply centralized sorting - associations with upcoming lectures first
        const sortedData = sortAssociations(Array.isArray(data) ? data : [], allLectures);
        setUdruzenja(sortedData.slice(0, 10)); // Limit to 10 organizations for homepage
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
        Odobrena udruženja - prioritet imaju ona sa aktivnim predavanjima
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
        onPress={() => Alert.alert('Sva udruženja', 'Ova funkcionalnost će biti dostupna uskoro.')}
      >
        <Text style={styles.viewAllButtonText}>Pogledaj sva udruženja</Text>
      </TouchableOpacity>
    </View>
  );
};

// Registration Benefits Component
const RegistrationBenefits = ({ onAuthNavigate }) => {
  const benefits = [
    {
      title: 'Dodavanje sadržaja',
      description: 'Objavljivanje novih predavanja', 
      icon: 'add-circle-outline',
      color: COLORS.primary
    },
    {
      title: 'Obavještenja',
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

      <TouchableOpacity style={styles.registerButton} onPress={onAuthNavigate}>
        <Text style={styles.registerButtonText}>Registrujte se</Text>
      </TouchableOpacity>
    </View>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <View style={styles.heroSection}>
      <Text style={styles.heroTitle}>DERS</Text>
      <Text style={styles.heroSubtitle}>
        Digitalna platforma za promociju islamskih predavanja
      </Text>
    </View>
  );
};



// Quick Actions Component
const QuickActions = () => {
  const actions = [
    {
      title: 'Dersovi',
      description: 'Sva dostupna predavanja',
      icon: 'book-outline',
      color: COLORS.primary,
    },
    {
      title: 'Udruženja',
      description: 'Udruženja i aktivnosti',
      icon: 'business-outline',
      color: COLORS.primary,
    },
    {
      title: 'Daije',
      description: 'Naši daije',
      icon: 'people-outline',
      color: COLORS.primary,
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

// Benefits Section Component
const BenefitsSection = () => {
  const benefits = [
    {
      title: 'Besplatno korištenje',
      description: 'Potpuno besplatna platforma',
      icon: '✨',
    },
    {
      title: 'Jednostavno dodavanje',
      description: 'Lako dodavanje sadržaja',
      icon: '📝',
    },
    {
      title: 'Aktuelne informacije',
      description: 'Najnovije informacije',
      icon: '🔄',
    },
  ];

  return (
    <View style={styles.benefitsSectionContainer}>
      <Text style={styles.sectionTitle}>Zašto koristiti DERS?</Text>
      <View style={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <View key={`benefit-${index}`} style={styles.benefitSectionCard}>
            <Text style={styles.benefitIcon}>{benefit.icon}</Text>
            <Text style={styles.benefitSectionTitle}>{benefit.title}</Text>
            <Text style={styles.benefitSectionDescription}>{benefit.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addContentType, setAddContentType] = useState(null);
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Shared lectures state for sorting purposes
  const [allLectures, setAllLectures] = useState([]);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await checkIsAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = await getUserData();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load all lectures for sorting purposes
  useEffect(() => {
    const loadAllLectures = async () => {
      try {
        const data = await fetchLectures();
        setAllLectures(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading all lectures for sorting:', error);
        setAllLectures([]);
      }
    };

    loadAllLectures();
  }, [refreshKey]);

  const handleTabPress = (tabId) => {
    if (tabId === 'add') {
      if (!isAuthenticated) {
        Alert.alert('Greška', 'Morate biti ulogovani za dodavanje sadržaja');
        setActiveTab('auth');
        return;
      }
      setShowAddPopup(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleBack = () => {
    setActiveTab('home');
  };

  const handleMenuToggle = () => {
    setMenuOpen(prev => !prev);
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

  const handleAddContentWithType = (type) => {
    setAddContentType(type);
    setShowAddPopup(true);
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
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <HeroSection key={`hero-${refreshKey}`} />
            <LecturesSection key={`lectures-${refreshKey}`} onProfileOpen={handleProfileOpen} allLectures={allLectures} />
            <RegistrationBenefits key={`benefits-${refreshKey}`} onAuthNavigate={handleAuthNavigate} />
            <DaijeSection key={`daije-${refreshKey}`} onProfileOpen={handleProfileOpen} allLectures={allLectures} />
            <UdruzenjaSection key={`udruzenja-${refreshKey}`} onProfileOpen={handleProfileOpen} allLectures={allLectures} />
            <QuickActions key={`actions-${refreshKey}`} />
            <BenefitsSection key={`benefits-section-${refreshKey}`} />
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

      default:
        return <HeroSection />;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      <View style={styles.container}>
        <Header 
          onMenuPress={handleMenuToggle}
          title={getPageTitle()}
        />
        
        {activeTab === 'home' ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
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

        <BottomNavigation
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />

        <Menu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={handleMenuNavigate}
          isAuthenticated={isAuthenticated}
          user={user}
          onAuthNavigate={handleAuthNavigate}
          onLogout={handleLogout}
          onAddContent={() => setShowAddPopup(true)}
          onAddContentWithType={handleAddContentWithType}
        />

        <AddContentPopup
          visible={showAddPopup}
          onClose={() => {
            setShowAddPopup(false);
            setAddContentType(null);
          }}
          onSuccess={handleContentAdded}
          initialType={addContentType}
        />
      </View>
    </>
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
    paddingBottom: 100, // Safe area for bottom navigation (80px height + 20px extra space)
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
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '300',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.85,
    lineHeight: 24,
    maxWidth: '85%',
    fontWeight: '300',
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
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
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

  // Benefits Section Styles
  benefitsSectionContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  benefitsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  benefitSectionCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  benefitSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitSectionDescription: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
});
