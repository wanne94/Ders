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

// Generate SEO-friendly slug from text
export const generateSlug = (text) => {
  if (!text) return '';
  
  // Convert to lowercase
  let slug = text.toLowerCase();
  
  // Replace special Bosnian characters
  const charMap = {
    'š': 's', 'đ': 'd', 'č': 'c', 'ć': 'c', 'ž': 'z',
    'Š': 's', 'Đ': 'd', 'Č': 'c', 'Ć': 'c', 'Ž': 'z'
  };
  
  for (const [key, value] of Object.entries(charMap)) {
    slug = slug.replace(new RegExp(key, 'g'), value);
  }
  
  // Remove special characters and replace spaces with hyphens
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
  
  return slug;
};

// Generate URL for daija profile with SEO-friendly slug
export const generateDaijaUrl = (daija) => {
  if (!daija) return '';
  
  const slug = generateSlug(daija.name);
  return `/profile/daija/${daija._id}${slug ? `/${slug}` : ''}`;
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