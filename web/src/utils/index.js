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

// Daija title formatting utility
export const formatDaijaTitle = (name, title) => {
  if (!name || !title) return name || '';
  
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  
  if (title.toLowerCase() === 'prof') {
    return `${name}, ${capitalizedTitle}.`;
  }
  
  return `${capitalizedTitle}. ${name}`;
};

// Export image utilities
export * from './imageUtils'; 