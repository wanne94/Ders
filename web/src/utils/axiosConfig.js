import axios from 'axios';
import { getToken, clearAllData } from './authHelpers';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  timeout: 30000, // Increased to 30 seconds for slow servers
  headers: {
    'Accept': 'application/json',
  }
});

// Retry function for failed requests
const retryRequest = async (config, retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    return await api.request(config);
  } catch (error) {
    if (retryCount < maxRetries && (
      error.code === 'ECONNABORTED' || 
      error.code === 'NETWORK_ERROR' ||
      (error.response && error.response.status >= 500)
    )) {
      console.log(`🔄 Retrying request (${retryCount + 1}/${maxRetries}):`, config.url);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

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
        error.response.data?.message === 'Invalid token'
      ) {
        // Clear all data including remembered credentials
        clearAllData();
        // Don't redirect automatically - let users continue as guests
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

// Enhanced API instance with retry logic
const apiWithRetry = {
  get: (url, config = {}) => retryRequest({ ...config, method: 'get', url }),
  post: (url, data, config = {}) => retryRequest({ ...config, method: 'post', url, data }),
  put: (url, data, config = {}) => retryRequest({ ...config, method: 'put', url, data }),
  delete: (url, config = {}) => retryRequest({ ...config, method: 'delete', url }),
  patch: (url, data, config = {}) => retryRequest({ ...config, method: 'patch', url, data }),
};

export default apiWithRetry; 