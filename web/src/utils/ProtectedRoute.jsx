import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      

      if (requireAdmin && user?.role !== 'admin' && user?.role !== 'super_admin') {
        router.push('/');
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
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