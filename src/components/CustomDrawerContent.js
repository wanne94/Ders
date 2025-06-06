import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import {
  Title,
  Caption,
  Paragraph,
  Drawer,
  Button,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';

// Custom component for admin shortcuts with pending count
const AdminShortcutItem = ({ label, icon, pendingCount, onPress, colors, styles, isMain = false }) => (
  <TouchableOpacity style={isMain ? styles.mainItemCustom : styles.shortcutItemCustom} onPress={onPress}>
    <View style={styles.shortcutContent}>
      <Ionicons 
        name={icon} 
        size={isMain ? 24 : 20} 
        color={isMain ? colors.primary.main : colors.text.secondary} 
        style={styles.shortcutIcon} 
      />
      <Text style={[
        styles.drawerItemLabel, 
        isMain ? styles.mainLabel : styles.shortcutLabel
      ]}>
        {label}
      </Text>
      {pendingCount > 0 && (
        <View style={[styles.pendingBadge, { backgroundColor: colors.primary.main }]}>
          <Text style={[styles.pendingBadgeText, { color: colors.text.onPrimary }]}>{pendingCount}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const CustomDrawerContent = (props) => {
  const { user, isLoggedIn, logout, getUserDisplayName, isLoading } = useAuth();
  const [pendingCounts, setPendingCounts] = React.useState({
    lectures: 0,
    daije: 0,
    organizations: 0,
    suggestions: 0
  });

  // Helper function for safe navigation
  const safeNavigate = (screenName, params = {}) => {
    if (props.navigation) {
      if (typeof props.navigation.closeDrawer === 'function') {
        props.navigation.closeDrawer();
      }
      if (typeof props.navigation.navigate === 'function') {
        props.navigation.navigate(screenName, params);
      }
    }
  };

  // Fetch pending counts for admin users
  React.useEffect(() => {
    const fetchPendingCounts = async () => {
      if (!isLoggedIn || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return;
      }

      try {
        const [lecturesRes, daijeRes, organizationsRes, suggestionsRes] = await Promise.all([
          axiosInstance.get('/lectures'),
          axiosInstance.get('/daije'),
          axiosInstance.get('/organizations'),
          axiosInstance.get('/suggestions').catch(() => ({ data: [] })) // Suggestions might not exist
        ]);

        const counts = {
          lectures: (lecturesRes.data || []).filter(item => item?.status === 'pending').length,
          daije: (daijeRes.data || []).filter(item => item?.status === 'pending').length,
          organizations: (organizationsRes.data || []).filter(item => item?.status === 'pending').length,
          suggestions: (suggestionsRes.data || []).filter(item => item?.status === 'pending').length
        };

        setPendingCounts(counts);
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };

    fetchPendingCounts();
  }, [isLoggedIn, user]);

  // Refresh pending counts when drawer opens
  React.useEffect(() => {
    // Check if navigation and addListener exist
    if (!props.navigation || typeof props.navigation.addListener !== 'function') {
      return;
    }

    const unsubscribe = props.navigation.addListener('drawerOpen', () => {
      if (isLoggedIn && user && (user.role === 'admin' || user.role === 'super_admin')) {
        // Refresh pending counts when drawer opens
        const fetchPendingCounts = async () => {
          try {
            const [lecturesRes, daijeRes, organizationsRes, suggestionsRes] = await Promise.all([
              axiosInstance.get('/lectures'),
              axiosInstance.get('/daije'),
              axiosInstance.get('/organizations'),
              axiosInstance.get('/suggestions').catch(() => ({ data: [] }))
            ]);

            const counts = {
              lectures: (lecturesRes.data || []).filter(item => item?.status === 'pending').length,
              daije: (daijeRes.data || []).filter(item => item?.status === 'pending').length,
              organizations: (organizationsRes.data || []).filter(item => item?.status === 'pending').length,
              suggestions: (suggestionsRes.data || []).filter(item => item?.status === 'pending').length
            };

            setPendingCounts(counts);
          } catch (error) {
            console.error('Error refreshing pending counts:', error);
          }
        };

        fetchPendingCounts();
      }
    });

    return unsubscribe;
  }, [props.navigation, isLoggedIn, user]);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
      >
        <View style={styles.loadingSection}>
          <View style={styles.guestInfo}>
            <Ionicons name="person-circle-outline" size={60} color={colors.text.secondary} />
            <View style={styles.guestDetails}>
              <Title style={styles.guestTitle}>Učitavanje...</Title>
              <Caption style={styles.guestCaption}>
                Molimo sačekajte
              </Caption>
            </View>
          </View>
        </View>
      </DrawerContentScrollView>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Odjava',
      'Da li ste sigurni da se želite odjaviti?',
      [
        {
          text: 'Ne',
          style: 'cancel',
        },
        {
          text: 'Da',
          onPress: async () => {
            try {
              await logout(false); // Don't clear remembered credentials
              if (props.navigation && typeof props.navigation.closeDrawer === 'function') {
                props.navigation.closeDrawer();
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Greška', 'Došlo je do greške pri odjavi');
            }
          },
        },
      ]
    );
  };

  const handleAuthNavigation = () => {
    if (props.navigation) {
      if (typeof props.navigation.closeDrawer === 'function') {
        props.navigation.closeDrawer();
      }
      if (typeof props.navigation.navigate === 'function') {
        props.navigation.navigate('Auth');
      }
    }
  };

  const renderUserSection = () => {
    if (isLoggedIn && user) {
      return (
        <View style={styles.userInfoSection}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={60} color={colors.text.onPrimary} />
            <View style={styles.userDetails}>
              <Title style={styles.userName}>{getUserDisplayName()}</Title>
              <Caption style={styles.userEmail}>{user.email}</Caption>
              {user.role && user.role !== 'user' && (
                <Caption style={styles.userRole}>
                  {user.role === 'admin' ? 'Administrator' : 
                   user.role === 'super_admin' ? 'Super Administrator' : user.role}
                </Caption>
              )}
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.guestSection}>
          <View style={styles.guestInfo}>
            
            <View style={styles.guestDetails}>
              <Title style={styles.guestTitle}>Dobrodošli!</Title>
              <Caption style={styles.guestCaption}>
                Prijavite se da biste pristupili svim funkcijama
              </Caption>
            </View>
          </View>
          <View style={styles.authButtons}>
            <Button
              mode="contained"
              onPress={handleAuthNavigation}
              style={styles.loginButton}
              compact
            >
              Prijavi se
            </Button>
            <Button
              mode="outlined"
              onPress={handleAuthNavigation}
              style={styles.registerButton}
              compact
            >
              Registruj se
            </Button>
          </View>
        </View>
      );
    }
  };

  const renderUserActions = () => {
    if (!isLoggedIn) return null;

    const userActions = [
      {
        label: 'Profil',
        icon: 'person-circle-outline',
        onPress: () => safeNavigate('Profile')
      }
    ];

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Korisnički meni</Text>
        </View>
        {userActions.map((item, index) => (
          <DrawerItem
            key={index}
            label={item.label}
            icon={({ color, size }) => (
              <Ionicons name={item.icon} color={color} size={size} />
            )}
            onPress={item.onPress}
            activeTintColor={colors.primary.main}
            inactiveTintColor={colors.text.secondary}
            labelStyle={styles.drawerItemLabel}
          />
        ))}
      </>
    );
  };

  const renderAdminActions = () => {
    if (!isLoggedIn || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return null;
    }

    const adminActions = [
      {
        label: 'Dashboard',
        icon: 'speedometer-outline',
        pendingCount: pendingCounts.lectures + pendingCounts.daije + pendingCounts.organizations + pendingCounts.suggestions,
        onPress: () => safeNavigate('AdminStack')
      }
    ];

    const adminShortcuts = [
      {
        label: 'Dersovi',
        icon: 'book-outline',
        pendingCount: pendingCounts.lectures,
        onPress: () => safeNavigate('AdminStack', {
          screen: 'AdminContentManager',
          params: {
            type: 'lectures',
            title: 'Upravljanje predavanjima',
            canDelete: true
          }
        })
      },
      {
        label: 'Daije',
        icon: 'person-outline',
        pendingCount: pendingCounts.daije,
        onPress: () => safeNavigate('AdminStack', {
          screen: 'AdminContentManager',
          params: {
            type: 'daije',
            title: 'Upravljanje daijama',
            canDelete: true
          }
        })
      },
      {
        label: 'Udruženja',
        icon: 'business-outline',
        pendingCount: pendingCounts.organizations,
        onPress: () => safeNavigate('AdminStack', {
          screen: 'AdminContentManager',
          params: {
            type: 'organizations',
            title: 'Upravljanje udruženjima',
            canDelete: true
          }
        })
      },
      {
        label: 'Korisnici',
        icon: 'people-outline',
        pendingCount: 0, // Users don't have pending status
        onPress: () => safeNavigate('AdminStack', {
          screen: 'AdminContentManager',
          params: {
            type: 'users',
            title: 'Upravljanje korisnicima',
            canDelete: true
          }
        })
      }
    ];

    return (
      <>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Admin dashboard</Text>
        </View>
        {adminActions.map((item, index) => (
          <AdminShortcutItem
            key={index}
            label={item.label}
            icon={item.icon}
            pendingCount={item.pendingCount}
            onPress={item.onPress}
            colors={colors}
            styles={styles}
            isMain
          />
        ))}
        
        {/* Admin Shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Brzi pristup</Text>
        </View>
        {adminShortcuts.map((item, index) => (
          <AdminShortcutItem
            key={`shortcut-${index}`}
            label={item.label}
            icon={item.icon}
            pendingCount={item.pendingCount}
            onPress={item.onPress}
            colors={colors}
            styles={styles}
          />
        ))}
      </>
    );
  };

  const renderBottomSection = () => {
    if (isLoggedIn) {
      return (
        <View style={styles.bottomSection}>
          <DrawerItem
            label="Odjavi se"
            icon={({ color, size }) => (
              <Ionicons name="log-out-outline" color={color} size={size} />
            )}
            onPress={handleLogout}
            activeTintColor={colors.error.main}
            inactiveTintColor={colors.error.main}
            labelStyle={[styles.drawerItemLabel, { color: colors.error.main }]}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.bottomSection}>
          <DrawerItem
            label="O aplikaciji"
            icon={({ color, size }) => (
              <Ionicons name="information-circle-outline" color={color} size={size} />
            )}
            onPress={() => {
              if (props.navigation && typeof props.navigation.closeDrawer === 'function') {
                props.navigation.closeDrawer();
              }
              // TODO: Navigate to about screen or show about modal
            }}
            activeTintColor={colors.text.secondary}
            inactiveTintColor={colors.text.secondary}
            labelStyle={styles.drawerItemLabel}
          />
        </View>
      );
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      {renderUserSection()}
      
      {renderUserActions()}
      {renderAdminActions()}
      
      <View style={styles.spacer} />
      {renderBottomSection()}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 40,
  },
  loadingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background.paper,
  },
  userInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.primary.main,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.onPrimary,
    opacity: 0.8,
  },
  userRole: {
    fontSize: 12,
    color: colors.text.onPrimary,
    opacity: 0.7,
    fontWeight: '500',
    marginTop: 2,
  },
  guestSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background.paper,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  guestDetails: {
    marginLeft: 15,
    flex: 1,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  guestCaption: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  loginButton: {
    flex: 1,
  },
  registerButton: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: colors.border.light,
    height: 1,
    marginVertical: 5,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  shortcutLabel: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
  shortcutItem: {
    marginLeft: 16,
    paddingLeft: 8,
  },
  shortcutItemCustom: {
    padding: 10,
    marginLeft: 16,
    minHeight: 48,
  },
  shortcutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  shortcutIcon: {
    marginRight: 10,
  },
  pendingBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 'auto',
    minWidth: 20,
    alignItems: 'center',
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainItemCustom: {
    padding: 10,
    marginLeft: 0,
    minHeight: 56,
  },
  mainLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomDrawerContent; 