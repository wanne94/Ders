import tokenManager from './tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.maxRetries = 1;
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'token';
      const token = localStorage.getItem(tokenKey);
      
      // Provjeri validnost tokena prije slanja (performanse optimizacija)
      if (token && tokenManager.isTokenValid(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token) {
        console.log('⚠️ API Client: Token exists but is invalid');
      }
    }
    
    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401 && retryCount < this.maxRetries) {
        console.log('🔄 API Client: 401 received, attempting token refresh...');
        
        // Pokušaj osvježiti token
        try {
          await tokenManager.refreshToken();
          // Ponovi zahtjev sa novim tokenom
          return this.request(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Emituj event da korisnik treba da se ponovo prijavi
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('authRequired', {
              detail: { 
                message: 'Sesija je istekla. Molimo prijavite se ponovo.',
                returnUrl: window.location.pathname
              }
            }));
          }
          
          // Proslijedi originalnu 401 grešku
          const error = await response.text();
          throw new Error(error || 'Unauthorized');
        }
      }
      
      if (!response.ok) {
        const error = await response.text();
        console.error('❌ API Client: Request failed:', {
          url,
          status: response.status,
          error: error.substring(0, 200) // Limitiraj log za performanse
        });
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Ne loguj svaku grešku detaljno (performanse)
      if (error.message !== 'Unauthorized') {
        console.error('❌ API Client error:', error.message);
      }
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

const apiClient = new ApiClient();
export default apiClient; 