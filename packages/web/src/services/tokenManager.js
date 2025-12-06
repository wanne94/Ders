/**
 * Token Manager Service
 * Optimizovan za performanse - koristi throttling i memoizaciju
 */

import { getToken, clearAuthData, setToken, getUserData } from '@/utils/authHelpers';
import { secureGetToken } from '@/utils/tokenManager';
const debugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

class TokenManager {
  constructor() {
    this.tokenCheckInterval = null;
    this.lastTokenCheck = 0;
    this.cachedToken = null;
    this.cachedTokenExpiry = null;
    this.checkThrottle = 5000; // Minimum 5 sekundi između provjera
    this.warningThreshold = 300000; // 5 minuta prije isteka
    this.refreshThreshold = 600000; // 10 minuta prije isteka
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Dekodira JWT token (bez eksterne biblioteke za bolju performansu)
   */
  decodeToken(token) {
    try {
      if (!token) return null;
      
      // Keširaj dekodirani token
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Provjerava da li je token valjan (sa keširanjem)
   */
  isTokenValid(token = null) {
    // Throttle provjere za performanse
    const now = Date.now();
    if (now - this.lastTokenCheck < this.checkThrottle) {
      return this.cachedToken !== null && this.cachedTokenExpiry > now;
    }

    this.lastTokenCheck = now;
    
    if (!token) {
      token = getToken();
    }

    if (!token) {
      this.cachedToken = null;
      this.cachedTokenExpiry = null;
      return false;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      this.cachedToken = null;
      this.cachedTokenExpiry = null;
      return false;
    }

    const expiryTime = decoded.exp * 1000;
    this.cachedToken = token;
    this.cachedTokenExpiry = expiryTime;

    return expiryTime > now;
  }

  /**
   * Provjerava da li token uskoro ističe
   */
  isTokenExpiringSoon() {
    if (!this.cachedTokenExpiry) {
      this.isTokenValid(); // Populate cache
    }

    if (!this.cachedTokenExpiry) return false;

    const now = Date.now();
    const timeUntilExpiry = this.cachedTokenExpiry - now;
    
    return timeUntilExpiry > 0 && timeUntilExpiry < this.refreshThreshold;
  }

  /**
   * Osvježava token (sa debouncing)
   */
  async refreshToken() {
    // Ako već osvježavamo, vrati postojeći promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    
    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const currentToken = getToken();
        if (!currentToken) {
          throw new Error('No token to refresh');
        }

        // Pozovi refresh endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/users/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        if (data.token) {
          setToken(data.token);
          this.cachedToken = data.token;
          const decoded = this.decodeToken(data.token);
          this.cachedTokenExpiry = decoded.exp * 1000;
          if (debugEnabled) {
            console.log('✅ Token refreshed successfully');
          }
          resolve(data.token);
        } else {
          throw new Error('No token in refresh response');
        }
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        // Ne brišemo token odmah - dajemo korisniku šansu da se ponovo prijavi
        reject(error);
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  /**
   * Pokreće periodičnu provjeru tokena (optimizovano)
   */
  startTokenCheck() {
    // Ako već radi, ne pokreći ponovo
    if (this.tokenCheckInterval) {
      return;
    }

    // Početna provjera
    this.performTokenCheck();

    // Periodična provjera svakih 30 sekundi
    this.tokenCheckInterval = setInterval(() => {
      this.performTokenCheck();
    }, 30000); // 30 sekundi

    // Slušaj promjene između tabova
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      
      // Slušaj kada korisnik vraća focus na tab (optimizacija)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.performTokenCheck();
        }
      });
    }
  }

  /**
   * Izvršava provjeru tokena
   */
  async performTokenCheck() {
    try {
      // Provjeri validnost
      if (!this.isTokenValid()) {
        if (debugEnabled) {
          console.log('⚠️ Token is invalid or missing');
        }
        // Emituj event da token nije valjan
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tokenInvalid'));
        }
        return;
      }

      // Provjeri da li ističe uskoro
      if (this.isTokenExpiringSoon()) {
        if (debugEnabled) {
          console.log('⚠️ Token expires soon, attempting refresh...');
        }
        try {
          await this.refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Emituj warning event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokenExpiringSoon'));
          }
        }
      }
    } catch (error) {
      console.error('Error in token check:', error);
    }
  }

  /**
   * Hendluje promjene u localStorage između tabova
   */
  handleStorageChange(event) {
    if (event.key === (process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'token')) {
      if (debugEnabled) {
        console.log('🔄 Token changed in another tab');
      }
      
      // Reset cache
      this.cachedToken = null;
      this.cachedTokenExpiry = null;
      this.lastTokenCheck = 0;
      
      // Provjeri novi token
      this.performTokenCheck();
      
      // Emituj event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenUpdated'));
      }
    }
  }

  /**
   * Zaustavlja periodičnu provjeru
   */
  stopTokenCheck() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Čisti sve podatke
   */
  clearAll() {
    this.stopTokenCheck();
    this.cachedToken = null;
    this.cachedTokenExpiry = null;
    this.lastTokenCheck = 0;
    clearAuthData();
  }
}

// Singleton instanca
const tokenManager = new TokenManager();

// Dodaj secureGetToken kao metodu klase za kompatibilnost
tokenManager.secureGetToken = secureGetToken;

export default tokenManager;
