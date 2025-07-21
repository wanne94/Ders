// Utility functions for API calls and common operations
import axios from 'axios';

// API utility class
export class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  async get(endpoint) {
    try {
      const response = await axios.get(
        `${this.baseURL}${endpoint}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async post(endpoint, data) {
    try {
      const response = await axios.post(
        `${this.baseURL}${endpoint}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async put(endpoint, data) {
    try {
      const response = await axios.put(
        `${this.baseURL}${endpoint}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async delete(endpoint) {
    try {
      const response = await axios.delete(
        `${this.baseURL}${endpoint}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

// Storage utilities
export const storage = {
  get: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  
  set: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  
  remove: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
};

// Text formatting utilities
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Daija title formatting utility
export const formatDaijaTitle = (name, title) => {
  if (!name || !title) return name || '';
  
  const lowercaseTitle = title.toLowerCase();
  
  if (lowercaseTitle === 'prof') {
    return `${name}, ${lowercaseTitle}.`;
  }
  
  return `${lowercaseTitle}. ${name}`;
};

// Device detection utilities
export const deviceUtils = {
  isAndroid: () => {
    if (typeof window === 'undefined') return false;
    return navigator.userAgent.toLowerCase().includes('android');
  },
  
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  isAndroidMobile: () => {
    return deviceUtils.isAndroid() && deviceUtils.isMobile();
  }
};

// Export image utilities
export * from './imageUtils'; 