import 'react-native-gesture-handler';
import React, { useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, StyleSheet, Text, Image, StatusBar as RNStatusBar, Platform } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/config/theme';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import UniversalListScreen from './src/screens/UniversalListScreen';
import LectureDetailScreen from './src/screens/LectureDetailScreen';
import DaijaDetailScreen from './src/screens/DaijaDetailScreen';
import OrganizationDetailScreen from './src/screens/OrganizationDetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminContentManagerScreen from './src/screens/AdminContentManagerScreen';

// Import Auth components
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import CustomDrawerContent from './src/components/CustomDrawerContent';

// Import Form components
import LectureForm from './src/components/LectureForm';
import DaijaForm from './src/components/DaijaForm';
import OrganizationForm from './src/components/OrganizationForm';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Create custom theme for React Native Paper
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    surface: colors.background.paper,
    background: colors.background.default,
    error: colors.error.main,
    onPrimary: colors.text.onPrimary,
    onSecondary: colors.text.onSecondary,
    onSurface: colors.text.primary,
    onBackground: colors.text.primary,
  },
};

// Logo Component
function LogoComponent() {
  return (
    <View style={logoStyles.container}>
      <Image
        source={require('./assets/logo.jpg')}
        style={logoStyles.logoImage}
        resizeMode="cover"
      />
    </View>
  );
}

// Header with Logo and Title Component
function HeaderWithLogo({ title }) {
  return (
    <View style={logoStyles.headerContainer}>
      <Image
        source={require('./assets/logo.jpg')}
        style={logoStyles.headerLogo}
        resizeMode="cover"
      />
      <Text style={logoStyles.headerTitle}>{title}</Text>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#c89b3c',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#c89b3c',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

// Wrapper components for UniversalListScreen
const LecturesScreen = (props) => <UniversalListScreen {...props} route={{...props.route, params: {...props.route.params, screenType: 'lectures'}}} />;
const DaijeScreen = (props) => <UniversalListScreen {...props} route={{...props.route, params: {...props.route.params, screenType: 'daije'}}} />;
const OrganizationsScreen = (props) => <UniversalListScreen {...props} route={{...props.route, params: {...props.route.params, screenType: 'organizations'}}} />;

// Stack navigators for each section
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={({ navigation }) => ({
          headerTitle: () => <HeaderWithLogo title="Početna" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()}
              style={{ marginRight: 15 }}
            >
              <Ionicons 
                name="menu" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Moj profil" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="LectureDetail" 
        component={LectureDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji predavanja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="DaijaDetail" 
        component={DaijaDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji daije" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OrganizationDetail" 
        component={OrganizationDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji udruženja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function LecturesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LecturesMain" 
        component={LecturesScreen}
        options={({ navigation }) => ({ 
          headerTitle: () => <HeaderWithLogo title="Dersovi" />,
          headerStyle: { 
            backgroundColor: '#022C43', 
            elevation: 10
          },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()}
              style={{ marginRight: 15 }}
            >
              <Ionicons 
                name="menu" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Moj profil" />,
          headerStyle: { 
            backgroundColor: '#022C43', 
            elevation: 10
          },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="LectureDetail" 
        component={LectureDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji predavanja" />,
          headerStyle: { 
            backgroundColor: '#022C43', 
            elevation: 10
          },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="DaijaDetail" 
        component={DaijaDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji daije" />,
          headerStyle: { 
            backgroundColor: '#022C43', 
            elevation: 10
          },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OrganizationDetail" 
        component={OrganizationDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji udruženja" />,
          headerStyle: { 
            backgroundColor: '#022C43', 
            elevation: 10
          },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function DaijeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DaijeMain" 
        component={DaijeScreen}
        options={({ navigation }) => ({ 
          headerTitle: () => <HeaderWithLogo title="Daije" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()}
              style={{ marginRight: 15 }}
            >
              <Ionicons 
                name="menu" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Moj profil" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="DaijaDetail" 
        component={DaijaDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji daije" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="LectureDetail" 
        component={LectureDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji predavanja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function OrganizationsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="OrganizationsMain" 
        component={OrganizationsScreen}
        options={({ navigation }) => ({ 
          headerTitle: () => <HeaderWithLogo title="Udruženja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()}
              style={{ marginRight: 15 }}
            >
              <Ionicons 
                name="menu" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Moj profil" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OrganizationDetail" 
        component={OrganizationDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji udruženja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="LectureDetail" 
        component={LectureDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji predavanja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="DaijaDetail" 
        component={DaijaDetailScreen}
        options={{ 
          headerTitle: () => <HeaderWithLogo title="Detalji daije" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Custom Tab Bar Component with central "+" button
function CustomTabBar({ state, descriptors, navigation }) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showLectureForm, setShowLectureForm] = React.useState(false);
  const [showDaijaForm, setShowDaijaForm] = React.useState(false);
  const [showOrganizationForm, setShowOrganizationForm] = React.useState(false);

  const handleAddPress = () => {
    setShowAddModal(true);
  };

  const handleAddOption = (option) => {
    setShowAddModal(false);
    
    switch(option) {
      case 'ders':
        setShowLectureForm(true);
        break;
      case 'udruzenje':
        setShowOrganizationForm(true);
        break;
      case 'daija':
        setShowDaijaForm(true);
        break;
    }
  };

  const handleFormSuccess = (data) => {
    // Refresh the current screen data if needed
    // You can emit a custom event or use navigation state
    console.log('Form submitted successfully:', data);
    
    // Navigate to the appropriate tab to show the new item
    if (data.title) {
      // It's a lecture
      navigation.navigate('Lectures');
    } else if (data.firstName) {
      // It's a daija
      navigation.navigate('Daije');
    } else if (data.name) {
      // It's an organization
      navigation.navigate('Organizations');
    }
  };

  return (
    <>
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined 
              ? options.tabBarLabel 
              : options.title !== undefined 
              ? options.title 
              : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              // Handle Add button specially
              if (route.name === 'Add') {
                handleAddPress();
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Skip rendering the middle tab (index 2) as we'll replace it with custom button
            if (index === 2) {
              return (
                <View key={route.key} style={styles.centerButtonContainer}>
                  <TouchableOpacity
                    style={styles.centerButton}
                    onPress={onPress}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="add" 
                      size={32} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
              );
            }

            // Get icon for regular tabs
            let iconName;
            if (route.name === 'Home') {
              iconName = isFocused ? 'home' : 'home-outline';
            } else if (route.name === 'Lectures') {
              iconName = isFocused ? 'book' : 'book-outline';
            } else if (route.name === 'Daije') {
              iconName = isFocused ? 'person' : 'person-outline';
            } else if (route.name === 'Organizations') {
              iconName = isFocused ? 'business' : 'business-outline';
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabItem}
              >
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color={isFocused ? '#022C43' : 'gray'} 
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Add Options Modal */}
      {showAddModal && (
        <View style={styles.addMenuOverlay}>
          <TouchableOpacity 
            style={styles.addMenuBackdrop} 
            onPress={() => setShowAddModal(false)}
            activeOpacity={1}
          />
          <View style={styles.addMenu}>
            <TouchableOpacity 
              style={styles.addMenuItem}
              onPress={() => handleAddOption('ders')}
            >
              <Ionicons name="school" size={20} color="#022C43" style={styles.addMenuIcon} />
              <Text style={styles.addMenuText}>Dodaj Ders</Text>
            </TouchableOpacity>

            <View style={styles.addMenuSeparator} />

            <TouchableOpacity 
              style={styles.addMenuItem}
              onPress={() => handleAddOption('udruzenje')}
            >
              <Ionicons name="business" size={20} color="#022C43" style={styles.addMenuIcon} />
              <Text style={styles.addMenuText}>Dodaj Udruženje</Text>
            </TouchableOpacity>

            <View style={styles.addMenuSeparator} />

            <TouchableOpacity 
              style={styles.addMenuItem}
              onPress={() => handleAddOption('daija')}
            >
              <Ionicons name="person" size={20} color="#022C43" style={styles.addMenuIcon} />
              <Text style={styles.addMenuText}>Dodaj Daiju</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Form Modals */}
      <LectureForm
        visible={showLectureForm}
        onDismiss={() => setShowLectureForm(false)}
        onSuccess={handleFormSuccess}
      />

      <DaijaForm
        visible={showDaijaForm}
        onDismiss={() => setShowDaijaForm(false)}
        onSuccess={handleFormSuccess}
      />

      <OrganizationForm
        visible={showOrganizationForm}
        onDismiss={() => setShowOrganizationForm(false)}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}

// Styles for custom tab bar
const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // Lift the button above the tab bar
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#022C43', // Primary color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  addMenu: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 200,
    marginBottom: 80, // Position above the tab bar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  addMenuIcon: {
    marginRight: 15,
  },
  addMenuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addMenuSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
});

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Početna' }}
      />
      <Tab.Screen 
        name="Lectures" 
        component={LecturesStack}
        options={{ title: 'Dersovi' }}
      />
      <Tab.Screen 
        name="Add" 
        component={DaijeStack}
        options={{ title: 'Dodaj' }}
      />
      <Tab.Screen 
        name="Daije" 
        component={DaijeStack}
        options={{ title: 'Daije' }}
      />
      <Tab.Screen 
        name="Organizations" 
        component={OrganizationsStack}
        options={{ title: 'Udruženja' }}
      />
    </Tab.Navigator>
  );
}

// Drawer navigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: '#f5f5f5',
          width: 320,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerActiveTintColor: '#022C43',
        drawerInactiveTintColor: '#666',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Auth" 
        component={AuthScreen}
        options={{
          title: 'Prijava / Registracija',
          headerShown: true,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerTitle: 'Prijava / Registracija',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminStack" 
        component={AdminStack}
        options={{
          title: 'Admin Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Main App component wrapped with providers
function AppContent() {
  const navigationRef = useRef();
  const { setNavigation, isLoading } = useAuth();

  // Set navigation reference when NavigationContainer is ready
  const onNavigationReady = () => {
    if (navigationRef.current && setNavigation) {
      console.log('🧭 Navigation ready, setting reference in AuthContext');
      setNavigation(navigationRef.current);
    }
  };

  // Configure status bar for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor('#022C43', true);
      RNStatusBar.setBarStyle('light-content', true);
    }
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#022C43' }}>
        <StatusBar style="light" backgroundColor="#022C43" />
        <Image
          source={require('./assets/logo.jpg')}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }}
          resizeMode="cover"
        />
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>DERS</Text>
        <Text style={{ color: '#fff', fontSize: 14, marginTop: 10 }}>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={onNavigationReady}
    >
      <DrawerNavigator />
      <StatusBar style="light" backgroundColor="#022C43" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PaperProvider theme={paperTheme}>
          <AppContent />
        </PaperProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

// Admin Stack Navigator
function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminDashboardMain" 
        component={AdminDashboardScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LogoComponent />
              <Text style={{ 
                color: '#fff', 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginLeft: 10 
              }}>
                Admin Dashboard
              </Text>
            </View>
          ),
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs')}
              style={{ marginLeft: 15 }}
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()}
              style={{ marginRight: 15 }}
            >
              <Ionicons 
                name="menu" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="AdminContentManager" 
        component={AdminContentManagerScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="LectureDetail" 
        component={LectureDetailScreen}
        options={{
          headerTitle: () => <HeaderWithLogo title="Detalji predavanja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="DaijaDetail" 
        component={DaijaDetailScreen}
        options={{
          headerTitle: () => <HeaderWithLogo title="Detalji daije" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OrganizationDetail" 
        component={OrganizationDetailScreen}
        options={{
          headerTitle: () => <HeaderWithLogo title="Detalji udruženja" />,
          headerStyle: { backgroundColor: '#022C43' },
          headerTintColor: '#fff',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
