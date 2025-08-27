import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config';

// Create axios-like instance wrapper for API calls
class AxiosInstance {
  constructor() {
    this.baseURL = ENV.API_BASE_URL;
    this.timeout = 30000;
  }

  async getHeaders() {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async request(config) {
    const url = config.url.startsWith('http') 
      ? config.url 
      : `${this.baseURL}${config.url}`;

    const headers = await this.getHeaders();
    
    const options = {
      method: config.method || 'GET',
      headers: {
        ...headers,
        ...config.headers
      },
      ...(config.data ? { body: JSON.stringify(config.data) } : {})
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data, status: response.status } };
      }
      
      return { data };
    } catch (error) {
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