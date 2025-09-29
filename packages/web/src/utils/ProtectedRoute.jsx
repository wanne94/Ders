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
      
      console.log('🔐 ProtectedRoute: Checking authentication...');
      console.log('🔐 Raw token:', token);
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 Token length:', token?.length);
      console.log('🔐 User from localStorage:', user);
      console.log('🔐 Current URL:', window.location.pathname);
      console.log('🔐 requireAdmin:', requireAdmin);

      // If no token, redirect to auth
      if (!token) {
        console.log('🔐 No token found, redirecting to auth');
        if (window.location.pathname !== '/auth') {
          router.push('/auth');
        }
        return;
      }

      // Validate token format and expiration
      try {
        const decodedToken = jwtDecode(token);
        console.log('🔐 Decoded token:', decodedToken);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.log('🔐 Token expired, clearing storage and redirecting to auth');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/auth') {
            router.push('/auth');
          }
          return;
        }

        // Check admin requirements
        if (requireAdmin && decodedToken.role !== 'admin' && decodedToken.role !== 'super_admin') {
          console.log('🔐 Admin access required but user is not admin, redirecting to home');
          router.push('/');
          return;
        }

        console.log('🔐 Authentication successful');
        setIsAuthorized(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('🔐 Error decoding token:', error);
        console.log('🔐 Invalid token, clearing storage and redirecting to auth');
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
      console.log('🔐 Auth changed event received:', event.detail);
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