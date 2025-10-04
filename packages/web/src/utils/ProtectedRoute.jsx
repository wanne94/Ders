import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { getToken, getUserData } from '@/utils/authHelpers';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken(); // Use authHelpers function
      const user = getUserData(); // Use authHelpers function
      
      // If no token, redirect to auth
      if (!token) {
        if (window.location.pathname !== '/auth') {
          router.push('/auth');
        }
        return;
      }

      // Validate token format and expiration
      try {
        const decodedToken = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/auth') {
            router.push('/auth');
          }
          return;
        }

        // Check admin requirements
        if (requireAdmin && decodedToken.role !== 'admin' && decodedToken.role !== 'super_admin') {
          router.push('/');
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);

      } catch (error) {
        console.error('🔐 Error decoding token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/auth') {
          router.push('/auth');
        }
        return;
      }
    };

    // Check auth immediately
    checkAuth();

    // Listen for auth changes (when token is set after login)
    const handleAuthChange = (event) => {
      if (event.detail.type === 'login') {
        // Wait a bit for localStorage to be updated, then check auth again
        setTimeout(checkAuth, 200);
      }
    };

    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, [router, requireAdmin]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute; 
