import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Remove default Content-Type header - let browser set it automatically
  // This allows FormData uploads to work properly with multipart/form-data
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
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
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect automatically - let users continue as guests
        console.log('🔓 Unauthorized access - user can continue as guest');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 