import axios from 'axios';
import { getToken, clearAllData } from './authHelpers';

// Global callback for token expiration - komponente mogu da se pretplate
let tokenExpirationCallback = null;

export const setTokenExpirationCallback = (callback) => {
  tokenExpirationCallback = callback;
};

export const clearTokenExpirationCallback = () => {
  tokenExpirationCallback = null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // Increased to 30 seconds for slow servers
  headers: {
    'Accept': 'application/json',
  }
});


// Request interceptor - adds token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type to application/json only for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles token expiration and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle token expiration or invalid token
      if (
        error.response.status === 401 || 
        error.response.status === 403 || 
        error.response.data?.message === 'Token expired' ||
        error.response.data?.message === 'Invalid token' ||
        error.response.data?.message === 'Token je istekao' ||
        error.response.data?.message === 'Token nije validan'
      ) {
        // Clear all data including remembered credentials
        clearAllData();
        
        // Notify components about token expiration
        if (tokenExpirationCallback) {
          tokenExpirationCallback({
            status: error.response.status,
            message: error.response.data?.message || 'Token je istekao'
          });
        }
        
        console.log('🔓 Token expired or invalid - user can continue as guest');
      }
    }
    
    // Log timeout errors for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout:', error.config?.url);
      console.log('💡 Tip: API server might be slow. Consider checking server performance.');
    }
    
    return Promise.reject(error);
  }
);

// Export the api instance directly since interceptors are already set up
// The retry logic is handled within the response interceptor
export default api; 