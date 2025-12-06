import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import PageLayout from '@/components/PageLayout';
import { jwtDecode } from 'jwt-decode';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';

const AdminPanel = () => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lectures: { total: 0, approved: 0, pending: 0, cancelled: 0 },
    daije: { total: 0, approved: 0, pending: 0 },
    organizations: { total: 0, approved: 0, pending: 0 }
  });

  useEffect(() => {
    // Check if user is admin
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/auth');
        return;
      }

      try {
        const decodedUser = jwtDecode(token);
        if (['moderator', 'admin', 'super_admin'].includes(decodedUser.role)) {
          setIsAuthorized(true);
        } else {
          router.push('/');
        }
      } catch (e) {
        console.error('Error decoding token:', e);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all data
        const [lectures, daije, organizations] = await Promise.all([
          predavanjaService.getAllPredavanjaForAdmin(),
          daijeService.getAllDaije(),
          udruzenjaService.getAllUdruzenja()
        ]);

        // Calculate stats for lectures
        const lectureStats = {
          total: lectures.length,
          approved: lectures.filter(l => l.status === 'approved').length,
          pending: lectures.filter(l => l.status === 'pending').length,
          cancelled: lectures.filter(l => l.status === 'cancelled' || l.isCancelled).length
        };

        // Calculate stats for daije
        const daijeStats = {
          total: daije.length,
          approved: daije.filter(d => d.status === 'approved').length,
          pending: daije.filter(d => d.status === 'pending').length
        };

        // Calculate stats for organizations
        const orgStats = {
          total: organizations.length,
          approved: organizations.filter(o => o.status === 'approved').length,
          pending: organizations.filter(o => o.status === 'pending').length
        };

        setStats({
          lectures: lectureStats,
          daije: daijeStats,
          organizations: orgStats
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthorized]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  if (!isAuthorized) {
    return null;
  }

  const StatCard = ({ title, stats, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{ color: color, mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Ukupno:
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {stats.total}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Odobreno:
          </Typography>
          <Chip 
            label={stats.approved} 
            size="small" 
            color="success" 
            sx={{ minWidth: 40 }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Na čekanju:
          </Typography>
          <Chip 
            label={stats.pending} 
            size="small" 
            color="warning" 
            sx={{ minWidth: 40 }}
          />
        </Box>

        {stats.cancelled !== undefined && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Otkazano:
            </Typography>
            <Chip 
              label={stats.cancelled} 
              size="small" 
              color="error" 
              sx={{ minWidth: 40 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <Head>
        <title>Admin Panel - Ders.ba</title>
      </Head>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Admin Panel
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Statistics Section */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Statistike
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} md={4}>
                <StatCard 
                  title="Predavanja" 
                  stats={stats.lectures}
                  icon={<SchoolIcon />}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard 
                  title="Daije" 
                  stats={stats.daije}
                  icon={<PersonIcon />}
                  color="warning.main"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard 
                  title="Udruženja" 
                  stats={stats.organizations}
                  icon={<BusinessIcon />}
                  color="info.main"
                />
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Brze akcije
            </Typography>

            <Paper sx={{ width: '100%', mb: 4 }}>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label="Predavanja" 
                  icon={<SchoolIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Daije" 
                  icon={<PersonIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Udruženja" 
                  icon={<BusinessIcon />} 
                  iconPosition="start"
                />
              </Tabs>

              <Box p={3}>
                {value === 0 && (
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      Upravljanje predavanjima
                    </Typography>
                    <Box display="flex" gap={2} mt={2}>
                      <Button 
                        variant="contained" 
                        onClick={() => handleNavigate('/lectures')}
                      >
                        Pregledaj sva predavanja
                      </Button>
                      {stats.lectures.pending > 0 && (
                        <Button 
                          variant="outlined" 
                          color="warning"
                          onClick={() => handleNavigate('/lectures?status=pending')}
                        >
                          Pregledaj na čekanju ({stats.lectures.pending})
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {value === 1 && (
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      Upravljanje daijama
                    </Typography>
                    <Box display="flex" gap={2} mt={2}>
                      <Button 
                        variant="contained" 
                        onClick={() => handleNavigate('/daije')}
                      >
                        Pregledaj sve daije
                      </Button>
                      {stats.daije.pending > 0 && (
                        <Button 
                          variant="outlined" 
                          color="warning"
                          onClick={() => handleNavigate('/daije?status=pending')}
                        >
                          Pregledaj na čekanju ({stats.daije.pending})
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {value === 2 && (
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      Upravljanje udruženjima
                    </Typography>
                    <Box display="flex" gap={2} mt={2}>
                      <Button 
                        variant="contained" 
                        onClick={() => handleNavigate('/organizations')}
                      >
                        Pregledaj sva udruženja
                      </Button>
                      {stats.organizations.pending > 0 && (
                        <Button 
                          variant="outlined" 
                          color="warning"
                          onClick={() => handleNavigate('/organizations?status=pending')}
                        >
                          Pregledaj na čekanju ({stats.organizations.pending})
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Pending Items Alert */}
            {(stats.lectures.pending > 0 || stats.daije.pending > 0 || stats.organizations.pending > 0) && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body1">
                  Imate stavke koje čekaju odobrenje:
                </Typography>
                <Box mt={1}>
                  {stats.lectures.pending > 0 && (
                    <Typography variant="body2">
                      • {stats.lectures.pending} predavanja na čekanju
                    </Typography>
                  )}
                  {stats.daije.pending > 0 && (
                    <Typography variant="body2">
                      • {stats.daije.pending} daija na čekanju
                    </Typography>
                  )}
                  {stats.organizations.pending > 0 && (
                    <Typography variant="body2">
                      • {stats.organizations.pending} udruženja na čekanju
                    </Typography>
                  )}
                </Box>
              </Alert>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
};

export default AdminPanel;

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}