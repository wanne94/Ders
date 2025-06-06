import axiosInstance from '../utils/axiosConfig';
import { normalizeToArray } from '../utils/dataHelpers';

/**
 * API Service for DERS mobile app
 * Provides methods to interact with the backend API
 */

export const apiService = {
  // Get base URL for debugging
  getBaseURL() {
    return axiosInstance.defaults.baseURL;
  },

  // Generic HTTP methods
  async get(endpoint) {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error GET ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error POST ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error PUT ${endpoint}:`, error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error DELETE ${endpoint}:`, error);
      throw error;
    }
  },

  // Lectures API
  async getLectures() {
    try {
      const response = await axiosInstance.get('lectures');
      return normalizeToArray(response);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      throw error;
    }
  },

  async getLectureById(id) {
    try {
      const response = await axiosInstance.get(`lectures/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture by ID:', error);
      
      // Ako je 404 (predavanje ne postoji), vrati fallback objekat
      if (error.response?.status === 404) {
        return {
          _id: id,
          title: 'Nepoznato predavanje',
          speaker: 'Nepoznata daija',
          organization: 'Nepoznato udruženje',
          date: new Date().toISOString(),
          time: '',
          address: '',
          city: 'Nepoznato',
          description: 'Ovo predavanje više ne postoji u bazi podataka',
          status: 'inactive',
          image: null
        };
      }
      
      throw error;
    }
  },

  // Daije API
  async getDaije() {
    try {
      const response = await axiosInstance.get('daije');
      return normalizeToArray(response);
    } catch (error) {
      console.error('Error fetching daije:', error);
      throw error;
    }
  },

  async getDaijaById(id) {
    try {
      const response = await axiosInstance.get(`daije/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daija by ID:', error);
      throw error;
    }
  },

  // Organizations API
  async getOrganizations() {
    try {
      const response = await axiosInstance.get('organizations');
      return normalizeToArray(response);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  async getOrganizationById(id) {
    try {
      const response = await axiosInstance.get(`organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization by ID:', error);
      
      // Ako je 404 (organizacija ne postoji), vrati fallback objekat
      if (error.response?.status === 404) {
        return {
          _id: id,
          name: 'Test Udruženje',
          shortDescription: 'Test opis udruženja',
          city: 'Sarajevo',
          address: 'Test adresa',
          status: 'rejected',
          image: null
        };
      }
      
      throw error;
    }
  },

  // Authentication API
  async login(credentials) {
    try {
      const response = await axiosInstance.post('users/auth', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await axiosInstance.post('users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  // Forgot Password API
  async forgotPasswordVerifyEmail(email) {
    try {
      const response = await axiosInstance.post('users/forgot-password/verify-email', { email });
      return response.data;
    } catch (error) {
      console.error('Error verifying email for password reset:', error);
      throw error;
    }
  },

  async forgotPasswordVerifyAnswer(email, securityAnswer) {
    try {
      const response = await axiosInstance.post('users/forgot-password/verify-answer', { 
        email, 
        securityAnswer 
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying security answer:', error);
      throw error;
    }
  },

  async forgotPasswordReset(email, newPassword) {
    try {
      const response = await axiosInstance.post('users/forgot-password/reset', { 
        email, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // User Profile API
  async verifyToken() {
    try {
      const response = await axiosInstance.get('users/verify-token');
      return response.data;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },

  async getUserProfile() {
    try {
      const response = await axiosInstance.get('users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userData) {
    try {
      const response = await axiosInstance.put('users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Search API
  async searchAll(query) {
    try {
      const response = await axiosInstance.get(`search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error during search:', error);
      throw error;
    }
  },

  // Statistics API
  async getStats() {
    try {
      const response = await axiosInstance.get('stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};

export default apiService; 