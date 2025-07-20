import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REMEMBERED_EMAIL: 'remembered_email',
  REMEMBERED_PASSWORD: 'remembered_password'
};

// Token functions
export const setToken = async (token) => {
  try {
    console.log('Setting token:', token ? `${token.substring(0, 20)}...` : 'EMPTY TOKEN');
    if (!token || token.trim() === '') {
      console.error('Attempting to set empty token!');
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    console.log('Token saved successfully');
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// User data functions
export const setUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// Remember me functions
export const setRememberedCredentials = async (email, password) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBERED_PASSWORD, password);
  } catch (error) {
    console.error('Error setting remembered credentials:', error);
  }
};

export const getRememberedCredentials = async () => {
  try {
    const email = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    const password = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
    return {
      email: email || '',
      password: password || ''
    };
  } catch (error) {
    console.error('Error getting remembered credentials:', error);
    return { email: '', password: '' };
  }
};

export const clearRememberedCredentials = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  } catch (error) {
    console.error('Error clearing remembered credentials:', error);
  }
};

// Complete logout function
export const logout = async () => {
  try {
    await removeToken();
    await removeUserData();
    // Don't clear remembered credentials on logout if user wants to be remembered
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Get user role
export const getUserRole = async () => {
  try {
    const userData = await getUserData();
    return userData?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = async () => {
  try {
    const role = await getUserRole();
    return role === 'admin' || role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Check if user is super admin
export const isSuperAdmin = async () => {
  try {
    const role = await getUserRole();
    return role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

// Clear all authentication data (for account deletion)
export const clearAllAuthData = async () => {
  try {
    await removeToken();
    await removeUserData();
    await clearRememberedCredentials();
  } catch (error) {
    console.error('Error clearing all auth data:', error);
  }
}; 