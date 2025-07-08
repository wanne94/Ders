import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config';

// Create a fetch-based API client to replace axios
class ApiClient {
  constructor(baseURL, timeout = 30000) {
    this.baseURL = baseURL;
    this.backupURL = ENV.BACKUP_API_URL || null;
    this.fallbackURL = ENV.FALLBACK_API_URL || null;
    this.timeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.urlIndex = 0; // 0: primary, 1: backup, 2: fallback (local only in development)
  }

  getCurrentBaseURL() {
    switch (this.urlIndex) {
      case 1: return this.backupURL;
      case 2: return this.fallbackURL;
      default: return this.baseURL;
    }
  }

  async request(url, options = {}, retries = 3) {
    const baseUrl = this.getCurrentBaseURL();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const urlType = this.urlIndex === 0 ? 'primary' : 
                    this.urlIndex === 1 ? 'backup' : 'fallback';
    console.log(`Making API request to: ${fullUrl} (${urlType})`);
    
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
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          data: responseData.data
        });
        const error = new Error(`HTTP Error: ${response.status}`);
        error.response = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        console.warn(`Request timeout for ${fullUrl}, retries left: ${retries}`);
        
        if (retries > 0) {
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request(url, options, retries - 1);
        }
        
        const timeoutError = new Error('Request timeout');
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }
      
      // For network errors, try next URL if available
      if (error.message.includes('Network request failed') || error.name === 'TypeError') {
        if (this.urlIndex < 2 && retries > 0) {
          this.urlIndex++;
          const nextType = this.urlIndex === 1 ? 'backup' : 'fallback';
          console.warn(`Switching to ${nextType} URL for ${url}`);
          return this.request(url, options, retries - 1);
        } else if (retries > 0) {
          console.warn(`Network error for ${fullUrl}, retries left: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request(url, options, retries - 1);
        }
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

  patch(url, data, config = {}) {
    return this.request(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete(url, config = {}) {
    return this.request(url, {
      ...config,
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient(ENV.API_URL, 30000); // 30 second timeout for local development

export default apiClient; 