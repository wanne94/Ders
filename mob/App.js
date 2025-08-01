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
    const response = await apiClient.get('/lectures/dashboard/public');
    const data = response.data;
    
    // Lectures response received
    
    if (Array.isArray(data)) {
      // Processing lectures data
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
    // Fetching daije...
    const data = await daijeService.getAllDaije();
    // Daije response received
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching daije:', error);
    return [];
  }
};

// API function to fetch udruzenja
const fetchUdruzenja = async () => {
  try {
    // Fetching udruzenja...
    const data = await udruzenjaService.getAllUdruzenja();
    // Udruzenja response received
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
      
      
            )}
          </>
        );
      case 'lectures':
        return <UniversalPage type="lectures" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} isAuthenticated={isAuthenticated} user={user} />;
      case 'speakers':
        return <UniversalPage type="speakers" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} isAuthenticated={isAuthenticated} user={user} />;
      case 'organizations':
        return <UniversalPage type="organizations" onBack={handleBack} onProfileOpen={handleProfileOpen} allLectures={allLectures} isAuthenticated={isAuthenticated} user={user} />;
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
