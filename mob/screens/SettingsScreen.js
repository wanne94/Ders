import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#333333',
  lightGray: '#f5f5f5',
  divider: '#e0e0e0'
};

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const darkMode = await AsyncStorage.getItem('darkModeEnabled');
      
      if (notifications !== null) {
        setNotificationsEnabled(JSON.parse(notifications));
      }
      if (darkMode !== null) {
        setDarkModeEnabled(JSON.parse(darkMode));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const toggleDarkMode = async (value) => {
    try {
      setDarkModeEnabled(value);
      await AsyncStorage.setItem('darkModeEnabled', JSON.stringify(value));
      Alert.alert('Theme Changed', 'Dark mode feature coming soon!');
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, rightComponent, onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <SettingItem
          icon="notifications"
          title="Push Notifications"
          subtitle="Receive notifications about new lectures"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          }
        />
        
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Coming soon"
          rightComponent={
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <SettingItem
          icon="information-circle"
          title="App Version"
          subtitle="1.0.0"
          rightComponent={null}
        />
        
        <SettingItem
          icon="document-text"
          title="Terms of Service"
          rightComponent={<Ionicons name="chevron-forward" size={20} color={COLORS.gray} />}
          onPress={() => Alert.alert('Terms of Service', 'Coming soon!')}
        />
        
        <SettingItem
          icon="shield-checkmark"
          title="Privacy Policy"
          rightComponent={<Ionicons name="chevron-forward" size={20} color={COLORS.gray} />}
          onPress={() => Alert.alert('Privacy Policy', 'Coming soon!')}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon="log-out"
          title="Logout"
          rightComponent={<Ionicons name="chevron-forward" size={20} color={COLORS.gray} />}
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default SettingsScreen;