import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook za proveru autentifikacije korisnika
 * Vraća funkciju koja proverava da li je korisnik ulogovan
 * i prikazuje auth dialog ako nije
 */
export const useAuthCheck = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const checkAuthAndExecute = (callback) => {
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
    checkAuthAndExecute,
    handleAuthPromptClose,
    handleGoToAuth
  };
}; 