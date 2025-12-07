import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { secureGetToken, secureClearToken } from './tokenManager';
import { getUserData, clearAuthData as clearAuth } from './authHelpers';

/**
 * Custom hook za proveru autentifikacije korisnika
 * Vraća funkciju koja proverava da li je korisnik ulogovan
 * i prikazuje auth dialog ako nije
 */
export const useAuthCheck = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const router = useRouter();

  // Funkcija za validaciju tokena lokalno (bez API poziva)
  // Provjerava da li je token validan JWT i da li nije istekao
  const validateTokenLocally = (token) => {
    try {
      if (!token || typeof token !== 'string') return false;

      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      // Check expiration
      if (payload.exp) {
        const now = Date.now() / 1000;
        if (payload.exp < now) {
          console.log('⚠️ Token je istekao');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.log('🔍 Token validation failed:', error);
      return false;
    }
  };

  // Funkcija za čišćenje podataka o autentifikaciji
  const clearAuthData = useCallback(() => {
    clearAuth();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // Funkcija za provjeru i ažuriranje auth stanja
  const refreshAuthState = useCallback(() => {
    setIsValidatingToken(true);

    const token = secureGetToken();
    const userData = getUserData();

    if (token && userData) {
      // Proveri da li je token još uvek valjan lokalno
      const isTokenValid = validateTokenLocally(token);

      if (isTokenValid) {
        setIsLoggedIn(true);
        setUser(userData);
        console.log('✅ Token je valjan - korisnik je prijavljen');
      } else {
        // Token je istekao ili nije valjan - obriši podatke
        clearAuthData();
        console.log('⚠️ Token je istekao - obrisani su podaci o autentifikaciji');
      }
    } else {
      // Nema tokena ili korisničkih podataka
      setIsLoggedIn(false);
      setUser(null);
    }

    setIsValidatingToken(false);
  }, [clearAuthData]);

  useEffect(() => {
    // Inicijalna provjera auth stanja
    refreshAuthState();

    // Listener za promjene u localStorage (kada se korisnik prijavi/odjavi)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('🔄 Detected localStorage change, refreshing auth state...');
        refreshAuthState();
      }
    };

    // Dodaj event listener za storage promjene
    window.addEventListener('storage', handleStorageChange);

    // Custom event listener za lokalne promjene (ista stranica)
    const handleLocalAuthChange = () => {
      console.log('🔄 Detected local auth change, refreshing auth state...');
      refreshAuthState();
    };

    window.addEventListener('authChanged', handleLocalAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChanged', handleLocalAuthChange);
    };
  }, [refreshAuthState]);

  const checkAuthAndExecute = (callback) => {
    if (isValidatingToken) {
      // Čekaj da se završi validacija
      setTimeout(() => checkAuthAndExecute(callback), 100);
      return;
    }
    
    if (isLoggedIn) {
      callback();
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAuthPromptClose = () => {
    setAuthPromptOpen(false);
  };

  const handleGoToAuth = (mode = 'login') => {
    setAuthPromptOpen(false);
    router.push('/auth');
  };

  return {
    isLoggedIn,
    user,
    authPromptOpen,
    isValidatingToken,
    checkAuthAndExecute,
    handleAuthPromptClose,
    handleGoToAuth,
    clearAuthData,
    refreshAuthState
  };
}; 