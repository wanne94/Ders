import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentApiUrl, API_CONFIG } from '../config/api';
import { STORAGE_KEYS } from './authHelpers';

// Global token expiration handler - will be set by AuthContext
let globalTokenExpirationHandler = null;

export const setTokenExpirationHandler = (handler) => {
  globalTokenExpirationHandler = handler;
};

const axiosInstance = axios.create({
  baseURL: `${getCurrentApiUrl()}/api`,
  timeout: 30000,
  headers: API_CONFIG.headers,
});

// Log the final baseURL for debugging
console.log('🔗 Mobile axios baseURL:', axiosInstance.defaults.baseURL);
console.log('🔗 getCurrentApiUrl():', getCurrentApiUrl());

// Request interceptor - dodaje token u svaki zahtjev
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles token expiration and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    try {
      if (error.response) {
        // Handle token expiration or invalid token
        if (error.response.status === 401 || error.response.status === 403) {
          const errorMessage = error.response?.data?.message;
          
          // Only handle as token expiration if the error message specifically indicates token issues
          const isTokenError = errorMessage?.includes('Token expired') ||
                             errorMessage?.includes('Invalid token') ||
                             errorMessage?.includes('Token je istekao') ||
                             errorMessage?.includes('Token nije validan') ||
                             errorMessage?.includes('Nema tokena');
          
          if (isTokenError) {
            // Clear async storage using storage keys
            try {
              await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
            } catch (storageError) {
              console.error('Error clearing AsyncStorage:', storageError);
            }
            
            // Call global token expiration handler if available
            if (globalTokenExpirationHandler) {
              try {
                await globalTokenExpirationHandler();
              } catch (handlerError) {
                console.error('Error in token expiration handler:', handlerError);
              }
            }
          }
        }
      }
      
      return Promise.reject(error);
    } catch (interceptorError) {
      console.error('Error in response interceptor:', interceptorError);
      
      // Return the original error, not the interceptor error
      return Promise.reject(error);
    }
  }
);

export default axiosInstance; 