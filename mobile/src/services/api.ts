import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from app config
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5003';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // TODO: Add auth token when authentication is implemented
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized access
      console.log('Unauthorized access - redirect to login');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const lecturesAPI = {
  getAll: () => api.get('/lectures'),
  getById: (id: string) => api.get(`/lectures/${id}`),
  create: (data: any) => api.post('/lectures', data),
  update: (id: string, data: any) => api.put(`/lectures/${id}`, data),
  delete: (id: string) => api.delete(`/lectures/${id}`),
};

export const daijeAPI = {
  getAll: () => api.get('/daije'),
  getById: (id: string) => api.get(`/daije/${id}`),
  create: (data: any) => api.post('/daije', data),
  update: (id: string, data: any) => api.put(`/daije/${id}`, data),
  delete: (id: string) => api.delete(`/daije/${id}`),
};

export const organizationsAPI = {
  getAll: () => api.get('/organizations'),
  getById: (id: string) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post('/organizations', data),
  update: (id: string, data: any) => api.put(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
};

export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export default api; 