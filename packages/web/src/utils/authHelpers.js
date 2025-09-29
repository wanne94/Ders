// Web Auth Helpers for Remember Me functionality
import { secureSetToken, secureGetToken, secureClearToken } from './tokenManager';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'token',
  USER: 'user',
  REMEMBERED_EMAIL: 'rememberedEmail'
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

// Password is never stored in localStorage for security reasons

// Clear all remembered credentials
export const clearRememberedCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  }
};

// Set remembered credentials (only email)
export const setRememberedCredentials = (email) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
  }
};

// Get remembered credentials (only email)
export const getRememberedCredentials = () => {
  if (typeof window !== 'undefined') {
    return {
      email: localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL),
      password: null // Password is never stored
    };
  }
  return { email: null, password: null };
};

// Auth data management - using secure token manager
export const getToken = () => {
  return secureGetToken();
};

export const setToken = (token) => {
  return secureSetToken(token);
};

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    // Use sessionStorage instead of localStorage for user data
    const userData = sessionStorage.getItem(STORAGE_KEYS.USER);
    if (userData && userData !== 'undefined') {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('❌ Failed to parse userData from sessionStorage:', e);
        return null;
      }
    }
    return null;
  }
  return null;
};

export const setUserData = (user) => {
  if (typeof window !== 'undefined') {
    // Use sessionStorage instead of localStorage for user data
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Emit custom event da su se auth podaci promenili
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'login' } }));
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    secureClearToken();
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    // Emit custom event da su se auth podaci promenili
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'logout' } }));
  }
};

export const clearAllData = () => {
  if (typeof window !== 'undefined') {
    secureClearToken();
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
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