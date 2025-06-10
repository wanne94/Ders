import axios from 'axios';
import { ENV } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Don't add token for auth routes
      const authRoutes = ['/users/auth', '/users/register', '/users/forgot-password'];
      const isAuthRoute = authRoutes.some(route => config.url?.includes(route));
      
      if (!isAuthRoute) {
        // Get token from AsyncStorage using the same key as authHelpers
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - match web implementation
apiClient.interceptors.response.use(
  (response) => {
    // Return full response object, not just response.data
    return response;
  },
  (error) => {
    // Handle different error cases
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient; 