import axios from 'axios';
import { secureGetToken, secureClearToken } from './tokenManager';

console.log('🔧 API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Remove default Content-Type header - let browser set it automatically
  // This allows FormData uploads to work properly with multipart/form-data
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = secureGetToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Set Content-Type to application/json only for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear auth on 401 with specific token error messages
    // IMPORTANT: Do NOT add generic messages like 'Unauthorized' here
    // as they can trigger on legitimate authorization failures
    const tokenErrorMessages = [
      'Token expired',
      'Invalid token',
      'Token je istekao',
      'Token nije validan',
      'jwt expired',
      'jwt malformed',
      'Nema tokena ili pogrešan format',
      'Nema tokena'
    ];

    const isTokenError = error.response?.data?.message &&
      tokenErrorMessages.some(msg => error.response.data.message.includes(msg));

    if (error.response?.status === 401 && isTokenError) {
      // Handle unauthorized access - only for token-specific errors
      if (typeof window !== 'undefined') {
        secureClearToken();
        sessionStorage.removeItem('user');
        console.log('🔓 Token expired or invalid - user can continue as guest');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 