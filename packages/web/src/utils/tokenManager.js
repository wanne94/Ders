// Secure Token Management with XSS Protection
import axiosInstance from './axiosConfig';

// Token storage using a combination of memory and sessionStorage
let memoryToken = null;

// Session storage key (obfuscated) - only compute on client side
const getSessionKey = () => {
  if (typeof window !== 'undefined') {
    return btoa('auth_session_' + (process.env.NEXT_PUBLIC_APP_NAME || 'app'));
  }
  return 'auth_session_fallback';
};

// Store token securely
export const secureSetToken = (token) => {
  if (typeof window !== 'undefined' && token) {
    // Store in memory for immediate use
    memoryToken = token;
    
    // Store in sessionStorage (not localStorage) for tab persistence
    // This is cleared when browser is closed
    try {
      sessionStorage.setItem(getSessionKey(), btoa(token));
    } catch (e) {
      console.error('Failed to store token in session storage:', e);
    }
    
    // Set axios default header
    if (axiosInstance && axiosInstance.defaults) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Emit auth change event
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'login' } }));
    
    return true;
  }
  return false;
};

// Get token securely
export const secureGetToken = () => {
  if (typeof window !== 'undefined') {
    // First try memory
    if (memoryToken) {
      return memoryToken;
    }
    
    // Then try sessionStorage
    try {
      const encoded = sessionStorage.getItem(getSessionKey());
      if (encoded) {
        const token = atob(encoded);
        memoryToken = token; // Cache in memory
        return token;
      }
    } catch (e) {
      console.error('Failed to retrieve token from session storage:', e);
    }
  }
  return null;
};

// Clear token
export const secureClearToken = () => {
  if (typeof window !== 'undefined') {
    // Clear memory
    memoryToken = null;
    
    // Clear sessionStorage
    try {
      sessionStorage.removeItem(getSessionKey());
    } catch (e) {
      console.error('Failed to clear token from session storage:', e);
    }
    
    // Clear axios header
    if (axiosInstance && axiosInstance.defaults) {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
    
    // Emit auth change event
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { type: 'logout' } }));
  }
};

// Validate token format (basic check)
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // JWT format: header.payload.signature
  const parts = token.split('.');
  return parts.length === 3;
};

// Token refresh handler (to be implemented with backend)
export const refreshToken = async () => {
  try {
    const currentToken = secureGetToken();
    if (!currentToken) return null;
    
    const response = await axiosInstance.post('/users/refresh-token', {
      token: currentToken
    });
    
    if (response.data && response.data.token) {
      secureSetToken(response.data.token);
      return response.data.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    secureClearToken();
  }
  return null;
};

// Initialize token from session on app load
export const initializeToken = () => {
  if (typeof window !== 'undefined') {
    const token = secureGetToken();
    if (token && isValidTokenFormat(token)) {
      // Set axios header
      if (axiosInstance && axiosInstance.defaults) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return true;
    }
  }
  return false;
};

// Export for backward compatibility
const tokenManager = {
  secureSetToken,
  secureGetToken,
  secureClearToken,
  isValidTokenFormat,
  refreshToken,
  initializeToken
};

export default tokenManager;