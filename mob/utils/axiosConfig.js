import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config';

// Create axios-like instance wrapper for API calls
class AxiosInstance {
  constructor() {
    // Use API_URL with fallback to BACKUP_API_URL if localhost doesn't work
    this.baseURL = ENV.API_URL || ENV.BACKUP_API_URL || 'https://ders.ba/api';
    this.timeout = 30000;
    this.fallbackURL = ENV.BACKUP_API_URL || 'https://ders.ba/api';
  }

  async getHeaders() {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async request(config) {
    const makeRequest = async (baseUrl) => {
      const url = config.url.startsWith('http') 
        ? config.url 
        : `${baseUrl}${config.url}`;
      
      console.log(`🌐 [axiosConfig] Request to: ${url}`);

      const headers = await this.getHeaders();
      
      const options = {
        method: config.method || 'GET',
        headers: {
          ...headers,
          ...config.headers
        },
        ...(config.data ? { body: JSON.stringify(config.data) } : {})
      };

      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data, status: response.status } };
      }
      
      return { data };
    };

    try {
      // Try with primary URL first
      return await makeRequest(this.baseURL);
    } catch (error) {
      // If localhost fails and we have a fallback URL, try it
      if (this.baseURL.includes('localhost') && this.fallbackURL) {
        // Silently fallback to production API
        try {
          return await makeRequest(this.fallbackURL);
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  async post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }

  async patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
  }
}

const axiosInstance = new AxiosInstance();

export default axiosInstance;