import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
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
  Checkbox,
  FormControlLabel,
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
import ContentContainer from '@/components/ContentContainer';
import { OrganizationsGrid, DaijeGrid, LecturesGrid } from '@/components/GridLayout';
import UniversalCard from '@/components/UniversalCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import LecturesSection from '@/components/LecturesSection';
import SimplifiedStatistics from '@/components/SimplifiedStatistics';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';
import { deviceUtils, storage } from '@/utils';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';
import { logNavigation, logSocialShare } from '@/services/analytics';
import { usePerformanceTracking, measureAsyncOperation } from '@/hooks/usePerformanceTracking';



// HeroSection Component
const HeroSection = () => {
  return (
    <Box 
      sx={{ 
        width: '100vw',
        position: 'relative',
        left: '50%',
        marginLeft: '-50vw',
        pt: 5, 
        pb: 5, 
        background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <ContentContainer>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Islamska predavanja - Ders.ba
        </Typography>
        <Divider color="white" sx={{ width: '20%', margin: '1rem auto', opacity: 0.5 }} />
        <Typography variant="h5" sx={{ mb: 3, opacity: 0.9, fontSize: '1.5rem' }}>
        Digitalna platforma za promociju islamskih predavanja
        </Typography>
        
        {/* Download App Section */}
        <Box sx={{ mt: 5 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              mb: 3,
              fontWeight: 400
            }}
          >
            Preuzmi DERS mobilnu aplikaciju
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              alignItems: 'flex-start'
            }}
          >
            {/* Google Play Button */}
            <Box
              component="a"
              href="https://play.google.com/store/apps/details?id=com.daije.mobile"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 160, md: 180 },
                  height: { xs: 48, md: 54 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image
                  src="/google-play-badge.png"
                  alt="Download on Google Play"
                  width={180}
                  height={54}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Box>
            
            {/* App Store Button - Disabled */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: 0.5,
                cursor: 'not-allowed'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 160, md: 180 },
                  height: { xs: 48, md: 54 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image
                  src="/app shore download.png"
                  alt="Download on App Store - Coming Soon"
                  width={180}
                  height={54}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  color: 'white'
                }}
              >
                Uskoro dostupno
              </Typography>
            </Box>
          </Box>
        </Box>
      </ContentContainer>
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
      icon: <SchoolIcon />,
      color: 'success',
      path: '/lectures'
    },
    {
      title: 'Udruženja',
      description: 'Istražite udruženja i njihove aktivnosti',
      icon: <BusinessIcon />,
      color: 'info',
      path: '/organizations'
    },
    {
      title: 'Daije',
      description: 'Upoznajte naše daije',
      icon: <PersonIcon />,
      color: 'warning',
      path: '/daije'
    }
  ];

  return (
    <ContentContainer>
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
                  {React.cloneElement(action.icon, { sx: { fontSize: 40 } })}
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
    </ContentContainer>
  );
};

// Benefits Section Component
const BenefitsSection = () => {
  const router = useRouter();

  const benefits = [
    {
      icon: <CheckCircleIcon />,
      title: 'Dodavanje sadržaja',
      description: 'Registrirani korisnici mogu objavljivati nova predavanja, kao i predlagati daije i udruženja za dodavanje na platformu.'
    },
    {
      icon: <StarIcon />,
      title: 'Doprinos znanju i sticanje sevapa',
      description: 'Svako korisno predavanje koje podijeliš može nekome koristiti – a za to ti se piše nagrada kod Allaha. "Ko uputi na dobro, ima nagradu kao i onaj koji to dobro čini." (Muslim)'
    },
    {
      icon: <BookmarkIcon />,
      title: 'Predlaganje izmjena postojećih informacija',
      description: 'Ako primijetiš netačne ili zastarjele podatke, možeš predložiti izmjene koje će biti pregledane od strane admin tima.'
    },
    {
      icon: <EventIcon />,
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
        width: 'calc(100vw)',
        py: 8,
        background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
        color: 'white',
        mt: 6,
        mb: 1,
        mx: 'calc(-50vw + 50%)',
        position: 'relative'
      }}
    >
      <ContentContainer 
        sx={{ 
          maxWidth: '1900px !important',
          width: '100%',
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

        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mb: 6,
            maxWidth: '100%',
            width: '100%',
            overflow: 'hidden'
          }}
        >
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
                  {React.cloneElement(benefit.icon, { sx: { fontSize: 28, color: 'white' } })}
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
      </ContentContainer>
    </Box>
  );
};

// ActiveOrganizations Component
const ActiveOrganizations = ({ organizations, lectures, isLoading }) => {
  const router = useRouter();
  const [displayOrganizations, setDisplayOrganizations] = useState([]);

  useEffect(() => {
    if (organizations && lectures) {
      // Filtriramo samo odobrena udruženja koja imaju bar jedno predavanje
      const approvedOrgs = (organizations || []).filter(org => {
        if (org.status !== 'approved') return false;
        
        // Ako organizacija već ima lectureCount iz backend-a, koristi ga
        // Backend računa samo odobrena predavanja
        if (typeof org.lectureCount === 'number') {
          return org.lectureCount > 0;
        }
        
        // Fallback: Provjeri da li udruženje ima bar jedno odobreno predavanje
        // Organizacije u predavanjima su sačuvane kao stringovi (imena), ne kao ID reference
        const hasPredavanje = lectures.some(lecture => {
          // Provjeri da li je predavanje odobreno
          if (lecture.status !== 'approved') return false;
          if (!lecture.organization) return false;
          
          // Ako je organizacija string, poredi sa imenom
          if (typeof lecture.organization === 'string') {
            return lecture.organization === org.name;
          }
          
          // Ako je organizacija objekat, poredi ID ili ime
          if (typeof lecture.organization === 'object') {
            return lecture.organization._id === org._id || 
                   lecture.organization.name === org.name;
          }
          
          return false;
        });
        
        return hasPredavanje;
      });
      
      // Nasumično mešamo array
      const shuffled = [...approvedOrgs].sort(() => Math.random() - 0.5);
      
      // Uzimamo prvih 10
      const sortedOrganizations = shuffled.slice(0, 10);

      setDisplayOrganizations(sortedOrganizations || []);
    }
  }, [organizations, lectures]);

  const handleViewAllOrganizations = () => {
    router.push('/organizations');
  };

  // Inside the component, filter data before using it
  const approvedOrganizations = (displayOrganizations || []).filter(item => item.status === 'approved');

  return (
    <ContentContainer>
      <Box sx={{ mt: 0, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
          Udruženja
        </Typography>
        <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
          Upoznaj 10 nasumično odabranih udruženja koja su imala najavljeno predavanje.
        </Typography>

      {isLoading ? (
        <SkeletonGrid count={6} type="organization" />
      ) : approvedOrganizations.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Trenutno nema dostupnih udruženja.
        </Typography>
      ) : (
        <>
          <OrganizationsGrid
            gap={3}
            sx={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {approvedOrganizations.map((organization) => (
              <Box key={organization._id} sx={{ 
                height: '200px',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
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
    </ContentContainer>
  );
};

// Social Media Section Component
const SocialMediaSection = () => {
  return (
    <ContentContainer>
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
            onClick={() => logSocialShare('social_media', 'ders_page', 'facebook')}
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
            onClick={() => logSocialShare('social_media', 'ders_page', 'instagram')}
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
    </ContentContainer>
  );
};

// ActiveDaije Component
const ActiveDaije = ({ daije, lectures, isLoading }) => {
  const router = useRouter();
  const [displayDaije, setDisplayDaije] = useState([]);

  useEffect(() => {
    if (daije && lectures) {
      // Filtriramo samo odobrene daije koji imaju bar jedno predavanje
      const approvedDaije = (daije || []).filter(daija => {
        if (daija.status !== 'approved') return false;
        
        // Ako daija već ima lectureCount iz backend-a, koristi ga
        // Backend računa samo odobrena predavanja
        if (typeof daija.lectureCount === 'number') {
          return daija.lectureCount > 0;
        }
        
        // Fallback: Provjeri da li daija ima bar jedno odobreno predavanje
        const hasPredavanje = lectures.some(lecture => 
          lecture.status === 'approved' &&
          lecture.daija && 
          (lecture.daija._id === daija._id || lecture.daija === daija._id)
        );
        
        return hasPredavanje;
      });
      
      // Nasumično mešamo array
      const shuffled = [...approvedDaije].sort(() => Math.random() - 0.5);
      
      // Uzimamo prvih 10
      const randomDaije = shuffled.slice(0, 10);
      setDisplayDaije(randomDaije || []);
    }
  }, [daije, lectures]);

  const handleViewAllDaije = () => {
    router.push('/daije');
  };

  // displayDaije already contains only approved daije from the sorting function
  const approvedDaije = displayDaije;

  return (
    <ContentContainer>
      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
          Daije
        </Typography>
        <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
        Upoznaj 10 nasumično odabranih daija koji su imali najavljeno predavanje.
        </Typography>

      {isLoading ? (
        <SkeletonGrid count={6} type="daija" />
      ) : approvedDaije.length === 0 ? (
        <Typography variant="body1" color="text.secondary" >
          Trenutno nema dostupnih daija.
        </Typography>
      ) : (
        <>
          <DaijeGrid 
            gap={3}
            sx={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {approvedDaije.map((daija) => (
              <Box key={daija._id} sx={{ 
                height: '200px',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
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
    </ContentContainer>
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
  
  // Track page performance
  usePerformanceTracking('home_page_render');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch lectures with performance tracking
        const allLectures = await measureAsyncOperation('fetch_lectures', async () => {
          return await predavanjaService.getAllPredavanja(1, 100, 'all');
        });
        
        // Debug cancelled lectures
        const cancelledLectures = allLectures.filter(l => l.status === 'cancelled' || l.isCancelled);
        
        // Look for specific lecture
        const diskriminacija = allLectures.find(l => l.title && l.title.includes('Diskriminacija žena'));
        
        // Debug weekly lectures
        const weeklyLectures = allLectures.filter(l => l.isWeeklyLecture);

        // Normalize lectures data and add type field
        const lecturesData = (allLectures || []).map(lecture => ({
          ...lecture,
          type: 'Predavanje', // Add type field for UniversalCard
          daija: lecture.daija || null,
          organization: lecture.organization || null
        }));

        // Debug each lecture's structure
        lecturesData.forEach(lecture => {
          // Structure validation without logging
        });

        setLectures(lecturesData);
        
        // Fetch organizations with performance tracking
        const organizationsData = await measureAsyncOperation('fetch_organizations', async () => {
          return await udruzenjaService.getAllUdruzenja();
        });
        setOrganizations(organizationsData || []);
        
        // Fetch daije with performance tracking
        const daijeData = await measureAsyncOperation('fetch_daije', async () => {
          return await daijeService.getAllDaije();
        });
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
      <Head>
        <title>Islamska predavanja - Ders.ba</title>
        <meta name="description" content="Pronađite najnovija predavanja, pratite omiljene daije i organizacije na jednom mjestu." />
        <link rel="canonical" href="https://ders.ba" />
      </Head>
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
      <Box sx={{ width: '100%', mb: 4, mt: 4 }}>
        <ContentContainer>
          <LecturesSection 
            lectures={lectures} 
            isLoading={isLoading}
            limit={10}
            subtitle="Posljednjih 10 najavljenih dersova"
            showViewAllButton={true}
          />
        </ContentContainer>
      </Box>
      

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Active Daije */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <ActiveDaije daije={daije} lectures={lectures} isLoading={isLoading} />
      </Box>

      {/* Social Media Section */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <SocialMediaSection />
      </Box>

      {/* Active Organizations */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <ActiveOrganizations organizations={organizations} lectures={lectures} isLoading={isLoading} />
      </Box>


      {/* Quick Actions - REMOVED
      <Box sx={{ width: '100%', mb: 4 }}>
        <QuickActions />
      </Box> */}

      {/* Lecture Statistics */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <SimplifiedStatistics />
      </Box>

     
    </PageLayout>
  );
}

// Force server-side rendering to ensure fresh content on every request
export async function getServerSideProps() {
  // This function runs on every request, forcing server-side rendering
  // We don't need to fetch data here since the component fetches it client-side
  return {
    props: {
      // Add a timestamp to verify fresh rendering
      timestamp: new Date().toISOString()
    }
  };
}