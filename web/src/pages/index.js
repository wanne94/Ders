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
    Divider,
    Container,
    IconButton,
} from '@mui/material';
import {
    School as SchoolIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Notifications as NotificationsIcon,
    Bookmark as BookmarkIcon,
    Event as EventIcon,
    PersonAdd as PersonAddIcon,
    Star as StarIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon
} from '@mui/icons-material';
import PageLayout from '@/components/PageLayout';
import { OrganizationsGrid, DaijeGrid, LecturesGrid } from '@/components/GridLayout';
import { sortOrganizationsByLectureProximity, sortLecturesByTimeProximity } from '@/utils/dataHelpers';
import UniversalCard from '@/components/UniversalCard';
import { sortAllDaijeWithActivePriority } from '../utils/dataHelpers';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';



// HeroSection Component
const HeroSection = () => {
  return (
    <Box 
      sx={{ 
        width: '100%',
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
        DERSAAA
      </Typography>
      <Divider color="white" sx={{ width: '20%', margin: '1rem auto', opacity: 0.5 }} />
      <Typography variant="h5" sx={{ mb: 3, opacity: 0.9, fontSize: '1.5rem' }}>
      Digitalna platforma za promociju islamskih predavanja
      </Typography>
    </Box>
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
      description: 'Upoznajte naše daije',
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
                <UniversalCard data={{ ...lecture, type: 'Predavanje' }} />
              </Box>
            ))}
          </LecturesGrid>
          <Box sx={{ mt: 4, mb: 0 }}>
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

// Benefits Section Component
const BenefitsSection = () => {
  const router = useRouter();

  const benefits = [
    {
      icon: CheckCircleIcon,
      title: 'Dodavanje sadržaja',
      description: 'Registrirani korisnici mogu objavljivati nova predavanja, kao i predlagati daije i udruženja za dodavanje na platformu.'
    },
    {
      icon: StarIcon,
      title: 'Doprinos znanju i sticanje sevapa',
      description: 'Svako korisno predavanje koje podijeliš može nekome koristiti – a za to ti se piše nagrada kod Allaha. "Ko uputi na dobro, ima nagradu kao i onaj koji to dobro čini." (Muslim)'
    },
    {
      icon: NotificationsIcon,
      title: 'Primanje notifikacija (uskoro, inšallah)',
      description: 'Dobijaš obavijesti kada se organizuju nova predavanja, novosti i slično.'
    },
    {
      icon: PersonAddIcon,
      title: 'Praćenje daija i udruženja (uskoro, inšallah)',
      description: 'Moći ćeš zapratiti daije i udruženja, te primati notifikacije kada oni budu organizovali nova predavanja.'
    },
    {
      icon: BookmarkIcon,
      title: 'Predlaganje izmjena postojećih informacija',
      description: 'Ako primijetiš netačne ili zastarjele podatke, možeš predložiti izmjene koje će biti pregledane od strane admin tima.'
    },
    {
      icon: EventIcon,
      title: 'Mogućnost da postaneš dio admin tima',
      description: 'Registracijom imaš priliku da, kada se ukaže potreba, postaneš dio tima koji aktivno uređuje i razvija platformu.'
    }
  ];

  const handleRegister = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        position: 'relative',
       
        marginLeft: '-50vw',
        marginRight: '-50vw',
        py: 8,
        background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
        color: 'white',
        mt: 6,
        overflow: 'hidden',
       
        my: 1
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          mx: 'auto'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Zašto se registrovati?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Registracija vam omogućava pristup ekskluzivnim funkcijama koje će poboljšati vaše iskustvo na našoj platformi
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    p: 2,
                    mr: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 60,
                    height: 60
                  }}
                >
                  <benefit.icon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.9,
                      lineHeight: 1.6
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontWeight: 500
            }}
          >
            Pridružite se našoj zajednici danas!
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/auth')}
              sx={{
                backgroundColor: '#dc004e',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(220, 0, 78, 0.3)',
                '&:hover': {
                  backgroundColor: '#b8003d',
                  boxShadow: '0 6px 20px rgba(220, 0, 78, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Registrujte se
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/auth')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 2
                }
              }}
            >
              Prijavite se
            </Button>
          </Box>
        </Box>
      </Container>
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
        const [organizations, lectures] = await Promise.all([
          udruzenjaService.getAllUdruzenja(),
          predavanjaService.getAllPredavanja()
        ]);

        console.log('Organizations:', organizations.length);
        console.log('Lectures:', lectures.length);
        console.log('Sample organization:', organizations[0]);
        console.log('Sample lecture:', lectures[0]);

        // Sort organizations by proximity of their closest lecture to current time
        // Show all organizations, limited to first 8
        const sortedOrganizations = sortOrganizationsByLectureProximity(organizations || [], lectures || [])
          .slice(0, 10); // Limit to 10 organizations

        console.log('Sorted organizations:', sortedOrganizations.length);
        setDisplayOrganizations(sortedOrganizations || []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setDisplayOrganizations([]);
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

  // Inside the component, filter data before using it
  const approvedOrganizations = (displayOrganizations || []).filter(item => item.status === 'approved');

  return (
    <Box sx={{ mt: 0, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        Udruženja
      </Typography>
      <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
        Udruženja sa nedavno najvljenim dersom
      </Typography>

      {approvedOrganizations.length === 0 ? (
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
            {approvedOrganizations.map((organization) => (
              <Box key={organization._id} sx={{ height: '200px' }}>
                <UniversalCard data={{ ...organization, type: 'Udruženje' }} />
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

// Social Media Section Component
const SocialMediaSection = () => {
  return (
    <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 2 }}>
        Pratite nas na društvenim mrežama
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 4, 
          opacity: 0.8, 
          maxWidth: '300px', 
          margin: '0 auto 2rem auto',
          lineHeight: 1.6,
          fontWeight: 300
        }}
      >
        Budi u toku s najnovijim predavanjima, događajima i korisnim sadržajem.
        
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4,
          flexWrap: 'wrap'
        }}
      >
        {/* Facebook */}
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            component="a"
            href="https://www.facebook.com/profile.php?id=61561889404089"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: '#1877F2',
              color: 'white',
              width: 80,
              height: 80,
              mb: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#166FE5',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(24, 119, 242, 0.3)'
              }
            }}
          >
            <FacebookIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Facebook
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zaprati nas na Facebooku
          </Typography>
        </Box>

        {/* Instagram */}
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            component="a"
            href="https://www.instagram.com/ders_ba/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              background: 'linear-gradient(45deg, #F56040 0%, #E1306C 25%, #C13584 50%, #833AB4 75%, #5851DB 100%)',
              color: 'white',
              width: 80,
              height: 80,
              mb: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(225, 48, 108, 0.3)'
              }
            }}
          >
            <InstagramIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Instagram
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zaprati nas na Instagramu
          </Typography>
        </Box>
      </Box>
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
        // Fetch daije with lecture counts from server
        const [daije, lectures] = await Promise.all([
          daijeService.getAllDaije(),
          predavanjaService.getAllPredavanja()
        ]);

        // Sort all approved daije with random arrangement, prioritizing those with active lectures
        // Limit to maximum 10 for homepage
        const sortedDaije = sortAllDaijeWithActivePriority(daije || [], lectures || []).slice(0, 10);

        setDisplayDaije(sortedDaije || []);
      } catch (error) {
        console.error('Error fetching daije:', error);
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

  // displayDaije already contains only approved daije from the sorting function
  const approvedDaije = displayDaije;

  return (
    <Box sx={{ mt: 1, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        Daije
      </Typography>
      <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
      Daije koje imaju najavljen ders ili imaju profil na platformi.
      </Typography>

      {approvedDaije.length === 0 ? (
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
            {approvedDaije.map((daija) => (
              <Box key={daija._id} sx={{ height: '200px' }}>
                <UniversalCard data={{ ...daija, type: 'Daija' }} />
              </Box>
            ))}
          </DaijeGrid>
          <Box sx={{ mt: 4, mb: 0 }}>
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

// Filter function for approved items
const filterApproved = (items) => (items || []).filter(item => 
  item.status === 'approved'
);

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
        const allLectures = await predavanjaService.getAllPredavanja();

        // Normalize lectures data
        const lecturesData = (allLectures || []).map(lecture => ({
          ...lecture,
          daija: lecture.daija || null,
          organization: lecture.organization || null
        }));

        // Debug each lecture's structure
        lecturesData.forEach(lecture => {
          // Structure validation without logging
        });

        setLectures(lecturesData);
        
        // Fetch organizations with lecture counts from server
        const organizationsData = await udruzenjaService.getAllUdruzenja();
        setOrganizations(organizationsData || []);
        
        // Fetch daije with lecture counts from server
        const daijeData = await daijeService.getAllDaije();
        setDaije(daijeData || []);
        
      } catch (err) {
        console.error('Greška pri dohvaćanju podataka:', err);
        setError('Greška pri učitavanju podataka');
        // Set empty arrays in case of error
        setLectures([]);
        setOrganizations([]);
        setDaije([]);
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

  // Inside the component, filter data before using it with safety checks
  const approvedOrganizations = (organizations || []).filter(item => item.status === 'approved');

  const approvedDaije = (daije || []).filter(item => item.status === 'approved');

  const approvedLectures = (lectures || []).filter(item => item.status === 'approved');

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

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Active Daije */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <ActiveDaije daije={daije} />
      </Box>

      {/* Social Media Section */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <SocialMediaSection />
      </Box>

      {/* Active Organizations */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <ActiveOrganizations organizations={organizations} />
      </Box>

      {/* Quick Actions */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <QuickActions />
      </Box>


     
    </PageLayout>
  );
} 