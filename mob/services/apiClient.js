import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config';

// Create a fetch-based API client to replace axios
class ApiClient {
  constructor(baseURL, timeout = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Add default headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add auth token if not an auth route
    const authRoutes = ['/users/auth', '/users/register', '/users/forgot-password'];
    const isAuthRoute = authRoutes.some(route => url.includes(route));
    
    if (!isAuthRoute) {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting token from AsyncStorage:', error);
      }
    }

    const config = {
      ...options,
      headers,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Create axios-like response object
      const responseData = {
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: config,
        request: { url: fullUrl },
      };

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData.data = await response.json();
      } else {
        responseData.data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        error.response = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }
      
      throw error;
    }
  }

  get(url, config = {}) {
    return this.request(url, { ...config, method: 'GET' });
  }

  post(url, data, config = {}) {
    return this.request(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put(url, data, config = {}) {
    return this.request(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete(url, config = {}) {
    return this.request(url, { ...config, method: 'DELETE' });
  }

  patch(url, data, config = {}) {
    return this.request(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

const apiClient = new ApiClient(ENV.API_URL, 10000);

export default apiClient; 