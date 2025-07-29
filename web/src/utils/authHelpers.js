// Web Auth Helpers for Remember Me functionality

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'token',
  USER: 'user',
  REMEMBERED_EMAIL: 'rememberedEmail',
  REMEMBERED_PASSWORD: 'rememberedPassword'
};

// Remember email functionality
export const getRememberedEmail = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  }
  return null;
};

export const setRememberedEmail = (email) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
  }
};

export const removeRememberedEmail = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  }
};

// Remember password functionality
export const getRememberedPassword = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
  return null;
};

export const setRememberedPassword = (password) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_PASSWORD, password);
  }
};

export const removeRememberedPassword = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
};

// Clear all remembered credentials
export const clearRememberedCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
};

// Set remembered credentials
export const setRememberedCredentials = (email, password) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_PASSWORD, password);
  }
};

// Get remembered credentials
export const getRememberedCredentials = () => {
  if (typeof window !== 'undefined') {
    return {
      email: localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL),
      password: localStorage.getItem(STORAGE_KEYS.REMEMBERED_PASSWORD)
    };
  }
  return { email: null, password: null };
};

// Auth data management
export const getToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('🔑 getToken: Retrieved token with key:', STORAGE_KEYS.TOKEN);
    console.log('🔑 getToken: Token value:', token);
    return token;
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    console.log('🔑 setToken: Storing token with key:', STORAGE_KEYS.TOKEN);
    console.log('🔑 setToken: Token value:', token);
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    console.log('🔑 setToken: Token stored, verifying...');
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('🔑 setToken: Verification - stored token:', storedToken);
    // Emit custom event da su se auth podaci promenili
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'login' } }));
  }
};

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData && userData !== 'undefined') {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('❌ Failed to parse userData from localStorage:', e);
        return null;
      }
    }
    return null;
  }
  return null;
};

export const setUserData = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Emit custom event da su se auth podaci promenili
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'login' } }));
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // Emit custom event da su se auth podaci promenili
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'logout' } }));
  }
};

export const clearAllData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
    // Emit custom event da su se auth podaci promenili
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'logout' } }));
  }
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} je obavezan`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (value && value.toString().trim().length < minLength) {
    return `${fieldName} mora imati najmanje ${minLength} karaktera`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.toString().trim().length > maxLength) {
    return `${fieldName} ne može biti duži od ${maxLength} karaktera`;
  }
  return null;
};

export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return '';
  return 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
}; 