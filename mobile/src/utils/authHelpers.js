import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REMEMBER_EMAIL: 'remember_email',
  REMEMBER_PASSWORD: 'remember_password'
};

// Token management
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// User data management
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const setUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// Remember email functionality
export const getRememberedEmail = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
  } catch (error) {
    console.error('Error getting remembered email:', error);
    return null;
  }
};

export const setRememberedEmail = async (email) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
  } catch (error) {
    console.error('Error setting remembered email:', error);
  }
};

export const removeRememberedEmail = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
  } catch (error) {
    console.error('Error removing remembered email:', error);
  }
};

// Remember password functionality
export const getRememberedPassword = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_PASSWORD);
  } catch (error) {
    console.error('Error getting remembered password:', error);
    return null;
  }
};

export const setRememberedPassword = async (password) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_PASSWORD, password);
  } catch (error) {
    console.error('Error setting remembered password:', error);
  }
};

export const removeRememberedPassword = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_PASSWORD);
  } catch (error) {
    console.error('Error removing remembered password:', error);
  }
};

// Clear all remembered credentials
export const clearRememberedCredentials = async () => {
  try {
    await Promise.all([
      removeRememberedEmail(),
      removeRememberedPassword()
    ]);
  } catch (error) {
    console.error('Error clearing remembered credentials:', error);
  }
};

// Clear all auth data
export const clearAuthData = async () => {
  try {
    await Promise.all([
      removeToken(),
      removeUserData()
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

// User display helpers
export const getUserDisplayName = (user) => {
  if (!user) return 'Korisnik';
  
  // Check if user has username (new format)
  if (user.username) {
    return user.username;
  }
  
  // Fallback to firstName/lastName for backward compatibility
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return user.email || 'Korisnik';
  }
};

export const getUserInitials = (user) => {
  if (!user) return 'K';
  
  // Check if user has username (new format)
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  
  // Fallback to firstName/lastName for backward compatibility
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (lastName) {
    return lastName.charAt(0).toUpperCase();
  } else if (user.email) {
    return user.email.charAt(0).toUpperCase();
  } else {
    return 'K';
  }
}; 