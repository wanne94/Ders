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
      // Only clear auth on 401 with specific token-related messages
      // 403 means "forbidden" not "token expired" - don't clear auth for permission issues
      const tokenErrorMessages = [
        'Token expired',
        'Invalid token',
        'Token je istekao',
        'Token nije validan',
        'jwt expired',
        'jwt malformed',
        'No token provided',
        'Unauthorized'
      ];

      const isTokenError = tokenErrorMessages.some(
        msg => error.response.data?.message?.includes(msg)
      );

      // Only clear auth if it's a 401 with a specific token error message
      if (error.response.status === 401 && isTokenError) {
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