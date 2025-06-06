import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { School as SchoolIcon, Business as BusinessIcon, Person as PersonIcon } from '@mui/icons-material';
import PageLayout from '@/components/PageLayout';
import OrganizationCompactCard from '@/components/OrganizationCompactCard';
import DaijaCard from '@/components/DaijaCard';
import LectureCard from '@/components/LectureCard';
import { OrganizationsGrid, DaijeGrid, LecturesGrid } from '@/components/GridLayout';
import axiosInstance from '@/utils/axiosConfig';
import {
  sortOrganizationsByLectureProximity,
  sortDaijeByLectureProximity,
  sortLecturesByTimeProximity,
} from '@/utils/dataHelpers';

// HeroSection Component
const HeroSection = () => {
  return (
    <Box 
      sx={{ 
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        pt: 5, 
        pb: 5, 
        background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        DERS
      </Typography>
      <Divider color="white" sx={{ width: '20%', margin: '1rem auto', opacity: 0.5 }} />
      <Typography variant="h5" sx={{ mb: 3, opacity: 0.9, fontSize: '1.5rem' }}>
      Digitalna platforma za promociju islamskih predavanja
      </Typography>
    </Box>
  );
};

// Statistic Component
const Statistic = ({ lectures, organizations, daije }) => {
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Statistika
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary" gutterBottom>
              {lectures?.filter(org => org.status === 'approved').length || 0}
            </Typography>
            <Typography variant="h6">
              Broj predavanja
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" gutterBottom>
              {organizations?.length || 0}
            </Typography>
            <Typography variant="h6">
              Broj udruženja
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" gutterBottom>
              {daije?.filter(daija => daija.status === 'approved').length || 0}
            </Typography>
            <Typography variant="h6">
              Broj daija
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

// QuickActions Component
const QuickActions = () => {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Dersovi',
      description: 'Pregledajte sva dostupna predavanja',
      icon: SchoolIcon,
      color: 'success',
      path: '/lectures'
    },
    {
      title: 'Udruženja',
      description: 'Istražite udruženja i njihove aktivnosti',
      icon: BusinessIcon,
      color: 'info',
      path: '/organizations'
    },
    {
      title: 'Daije',
      description: 'Upoznajte naše predavače',
      icon: PersonIcon,
      color: 'warning',
      path: '/daije'
    }
  ];

  return (
    <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
        Navigacija
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 1 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3.5} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                cursor: 'pointer'
              }}
              onClick={() => router.push(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                  <action.icon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="outlined"
                  color={action.color}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(action.path);
                  }}
                >
                  Otvori
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// TenLectures Component
const TenLectures = ({ lectures }) => {
  const router = useRouter();
  
  // Sort lectures by proximity to current time and take first 8
  const proximityLectures = sortLecturesByTimeProximity(lectures).slice(0, 10);

  const handleViewAllLectures = () => {
    router.push('/lectures');
  };

  return (
    <Box sx={{ mt: 1, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        Dersovi
      </Typography>
      <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
        Posljednje najavljeni dersovi
      </Typography>

      {proximityLectures.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Trenutno nema dostupnih dersova.
        </Typography>
      ) : (
        <>
          <LecturesGrid 
            gap={3}
            sx={{
              width: '100%',
            }}
          >
            {proximityLectures.map((lecture) => (
              <Box key={lecture._id} sx={{ height: '300px' }}>
                <LectureCard lecture={lecture} />
              </Box>
            ))}
          </LecturesGrid>
          <Box sx={{ mt: 4, mb: 5 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={handleViewAllLectures}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Prikaži sve dersove
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// ActiveOrganizations Component
const ActiveOrganizations = ({ organizations }) => {
  const router = useRouter();
  const [displayOrganizations, setDisplayOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationsWithLectures = async () => {
      try {
        const [organizationsResponse, lecturesResponse] = await Promise.all([
          axiosInstance.get('/organizations'),
          axiosInstance.get('/lectures/public')
        ]);

        const organizations = organizationsResponse.data;
        const lectures = lecturesResponse.data; // Only approved lectures from /lectures/public

        console.log('Organizations:', organizations.length);
        console.log('Lectures:', lectures.length);
        console.log('Sample organization:', organizations[0]);
        console.log('Sample lecture:', lectures[0]);

        // Sort organizations by proximity of their closest lecture to current time
        // Show all organizations, limited to first 8
        const sortedOrganizations = sortOrganizationsByLectureProximity(organizations, lectures)
          .slice(0, 10); // Limit to 8 organizations

        console.log('Sorted organizations:', sortedOrganizations.length);
        setDisplayOrganizations(sortedOrganizations);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationsWithLectures();
  }, []);

  const handleViewAllOrganizations = () => {
    router.push('/organizations');
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box sx={{ mt: 0, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        Udruženja
      </Typography>
      <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
        Udruženja sa nedavno najvljenim dersom
      </Typography>

      {displayOrganizations.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Trenutno nema dostupnih udruženja.
        </Typography>
      ) : (
        <>
          <OrganizationsGrid
            gap={3}
            sx={{
              width: '100%',
            }}
          >
            {displayOrganizations.map((organization) => (
              <Box key={organization._id} sx={{ height: '200px' }}>
                <OrganizationCompactCard organization={organization} />
              </Box>
            ))}
          </OrganizationsGrid>

          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={handleViewAllOrganizations}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Prikaži sva udruženja
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// ActiveDaije Component
const ActiveDaije = () => {
  const router = useRouter();
  const [displayDaije, setDisplayDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDaijeAndLectures = async () => {
      try {
        // Fetch all daije and all lectures
        const [daijeResponse, lecturesResponse] = await Promise.all([
          axiosInstance.get('/daije'),
          axiosInstance.get('/lectures/public')
        ]);
        const daije = daijeResponse.data;
        const lectures = lecturesResponse.data; // Already filtered to approved on server

        // Calculate lecture count for each daija and sort by proximity
        const daijeWithLectureCount = daije.map(daija => {
          const daijaLectures = lectures.filter(lecture => 
            lecture.daijaId === daija._id || lecture.daija === daija._id
          );
          return {
            ...daija,
            lectureCount: daijaLectures.length
          };
        });

        // Sort daije by proximity of their closest lecture to current time
        // Show all daije, limited to first 8
        const sortedDaije = sortDaijeByLectureProximity(daijeWithLectureCount, lectures)
          .slice(0, 10); // Limit to 8 daije

        setDisplayDaije(sortedDaije);
      } catch (error) {
        setDisplayDaije([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDaijeAndLectures();
  }, []);

  const handleViewAllDaije = () => {
    router.push('/daije');
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box sx={{ mt: 1, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        Daije
      </Typography>
      <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
        Daije sa nedavno najvljenim dersom
      </Typography>

      {displayDaije.length === 0 ? (
        <Typography variant="body1" color="text.secondary" >
          Trenutno nema dostupnih daija.
        </Typography>
      ) : (
        <>
          <DaijeGrid 
            gap={3}
            sx={{
              width: '100%',
            }}
          >
            {displayDaije.map((daija) => (
              <Box key={daija._id} sx={{ height: '200px' }}>
                <DaijaCard daija={daija} lectureCount={daija.lectureCount} />
              </Box>
            ))}
          </DaijeGrid>
          <Box sx={{ mt: 4, mb: 5 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={handleViewAllDaije}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Prikaži sve daije
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// Main Home Component
export default function Home() {
  const [lectures, setLectures] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [daije, setDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch lectures
        const lecturesResponse = await axiosInstance.get('/lectures/public');
        const allLectures = lecturesResponse.data;

        // Normalize lectures data
        const lecturesData = allLectures.map(lecture => ({
          ...lecture,
          daija: lecture.daija || null,
          organization: lecture.organization || null
        }));

        // Debug each lecture's structure
        lecturesData.forEach(lecture => {
          // Structure validation without logging
        });

        setLectures(lecturesData);
        
        // Fetch organizations
        const organizationsResponse = await axiosInstance.get('/organizations');
        setOrganizations(organizationsResponse.data);
        
        // Fetch daije
        const daijeResponse = await axiosInstance.get('/daije');
        setDaije(daijeResponse.data);
        
      } catch (err) {
        console.error('Greška pri dohvaćanju podataka:', err);
        setError('Greška pri učitavanju podataka');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Provjeri da li treba prikazati poruku o uspješnoj registraciji
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('registrationSuccess') === 'true') {
        setShowRegistrationSuccess(true);
        localStorage.removeItem('registrationSuccess');
      }
    }
  }, []);

  return (
    <PageLayout 
      disableGutters
      containerSx={{
        px: 0,
        textAlign: 'center',
        alignItems: 'center'
      }}
    >
      {/* Poruka o uspješnoj registraciji/prijavi */}
      {showRegistrationSuccess && (
        <Alert severity="success" sx={{ mb: 4, width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          Uspješno ste registrovani i prijavljeni u sistem.
        </Alert>
      )}

      {/* Hero Section */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <HeroSection />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, width: '100%', maxWidth: '600px' }}>
          {error}
        </Alert>
      )}

      {/* 10 Lectures */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <TenLectures lectures={lectures} />
      </Box>

      {/* Active Organizations */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <ActiveOrganizations organizations={organizations} />
      </Box>

      {/* Active Daije */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <ActiveDaije daije={daije} />
      </Box>

      {/* Quick Actions */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <QuickActions />
      </Box>

      {/* Statistics */}
      <Box sx={{ width: '100%' }}>
        <Statistic lectures={lectures} organizations={organizations} daije={daije} />
      </Box>
    </PageLayout>
  );
} 