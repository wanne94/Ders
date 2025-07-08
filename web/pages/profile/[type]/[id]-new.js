import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Paper,
  Modal,
  IconButton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsIcon from '@mui/icons-material/Directions';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import PageLayout from '@/components/PageLayout';
import ShareButton from '@/components/ShareButton';
import UniversalCard from '@/components/UniversalCard';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';
import { formatDateWithDay } from '@/utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle } from '@/utils';

const NewUnifiedProfile = () => {
  const router = useRouter();
  const { type, id } = router.query;
  
  const [profileData, setProfileData] = useState(null);
  const [relatedLectures, setRelatedLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (type === 'lecture') {
        const lectureData = await predavanjaService.getPredavanjeById(id);
        setProfileData(lectureData);
      } else if (type === 'daija') {
        const daijaData = await daijeService.getDaijaById(id);
        setProfileData(daijaData);
      } else if (type === 'organization') {
        const organizationData = await udruzenjaService.getUdruzenjeById(id);
        setProfileData(organizationData);
      } else {
        setError('Tip profila nije podržan');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.response?.data?.message || 'Greška pri učitavanju profila');
    } finally {
      setIsLoading(false);
    }
  }, [type, id]);

  const fetchRelatedLectures = useCallback(async () => {
    if (type !== 'lecture') return;
    
    try {
      setLecturesLoading(true);
      const allLectures = await predavanjaService.getAllPredavanja();
      
      const filtered = (allLectures || [])
        .filter(lecture => lecture._id !== id && lecture.status === 'approved')
        .map(lecture => ({ ...lecture, type: 'Predavanje' }))
        .sort((a, b) => {
          const aFuture = new Date(a.date) > new Date();
          const bFuture = new Date(b.date) > new Date();
          
          if (aFuture && !bFuture) return -1;
          if (!aFuture && bFuture) return 1;
          
          return aFuture ? 
            new Date(a.date) - new Date(b.date) : 
            new Date(b.date) - new Date(a.date);
        })
        .slice(0, 12);
        
      setRelatedLectures(filtered);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLecturesLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    if (type && id) {
      fetchProfileData();
      fetchRelatedLectures();
    }
  }, [type, id, fetchProfileData, fetchRelatedLectures]);

  const handleBackNavigation = () => {
    if (type === 'daija') {
      router.push('/daije');
    } else if (type === 'organization') {
      router.push('/organizations');
    } else {
      router.push('/lectures');
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Container>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackNavigation}
          >
            {type === 'daija' ? 'Nazad na sve daije' : type === 'organization' ? 'Nazad na sva udruženja' : 'Nazad na sve predavanja'}
          </Button>
        </Container>
      </PageLayout>
    );
  }

  if (!profileData) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 4 }}>
            Profil nije pronađen
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackNavigation}
          >
            {type === 'daija' ? 'Nazad na sve daije' : type === 'organization' ? 'Nazad na sva udruženja' : 'Nazad na sve predavanja'}
          </Button>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackNavigation}
            sx={{ mb: 2 }}
          >
            {type === 'daija' ? 'Nazad na sve daije' : type === 'organization' ? 'Nazad na sva udruženja' : 'Nazad na sve predavanja'}
          </Button>
        </Box>

        {/* Hero Section */}
        <Paper 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
            color: 'white',
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            position: 'relative'
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="flex-start" sx={{ py: { xs: 4, sm: 6 } }}>
              {/* Profile Image */}
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Box
                  onClick={() => setOpenImageModal(true)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: { xs: 150, sm: 200 },
                    mx: 'auto',
                    aspectRatio: type === 'daija' ? '1/1' : 'auto',
                    borderRadius: type === 'daija' ? '50%' : 4,
                    overflow: 'hidden',
                    border: '6px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={getImageUrl(profileData.image) || (type === 'daija' ? getDefaultDaijaImage() : type === 'organization' ? getDefaultOrganizationImage() : getDefaultLectureImage())}
                    alt={profileData.title || profileData.name}
                    sx={{ 
                      width: '100%',
                      height: 'auto',
                      minHeight: { xs: 180, sm: 250 },
                      maxHeight: { xs: 280, sm: 350 },
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = type === 'daija' ? getDefaultDaijaImage() : type === 'organization' ? getDefaultOrganizationImage() : getDefaultLectureImage();
                    }}
                  />
                </Box>
              </Grid>

              {/* Profile Info */}
              <Grid item xs={12} md={8}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: type === 'lecture' ? 'bold' : 300,
                      fontSize: { xs: '2rem', md: '3rem' },
                      letterSpacing: '-0.02em',
                      mb: 2,
                      textTransform: type === 'lecture' ? 'uppercase' : 'none'
                    }}
                  >
                    {type === 'daija' 
                      ? formatDaijaTitle(profileData.name, profileData.title)
                      : type === 'organization'
                      ? profileData.name
                      : profileData.title
                    }
                  </Typography>

                  {/* Info Items */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {type === 'lecture' && profileData.date && (
                      <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white',
                        borderRadius: 3, px: 2.5, py: 1.2, fontSize: '0.9rem', fontWeight: 500,
                        backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <CalendarTodayIcon sx={{ fontSize: 18 }} />
                        <span>{formatDateWithDay(profileData.date)}</span>
                      </Box>
                    )}
                    {type === 'lecture' && profileData.time && (
                      <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white',
                        borderRadius: 3, px: 2.5, py: 1.2, fontSize: '0.9rem', fontWeight: 500,
                        backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <AccessTimeIcon sx={{ fontSize: 18 }} />
                        <span>{profileData.time}</span>
                      </Box>
                    )}
                    {type === 'lecture' && profileData.speaker && (
                      <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white',
                        borderRadius: 3, px: 2.5, py: 1.2, fontSize: '0.9rem', fontWeight: 500,
                        backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                        <span>{profileData.speaker}</span>
                      </Box>
                    )}
                    {type === 'lecture' && profileData.organization && (
                      <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white',
                        borderRadius: 3, px: 2.5, py: 1.2, fontSize: '0.9rem', fontWeight: 500,
                        backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <BusinessIcon sx={{ fontSize: 18 }} />
                        <span>{profileData.organization}</span>
                      </Box>
                    )}
                    {(profileData.address || profileData.city) && (
                      <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white',
                        borderRadius: 3, px: 2.5, py: 1.2, fontSize: '0.9rem', fontWeight: 500,
                        backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <LocationOnIcon sx={{ fontSize: 18 }} />
                        <span>{[profileData.address, profileData.city].filter(Boolean).join(', ')}</span>
                      </Box>
                    )}
                  </Box>

                  {/* Description */}
                  {(profileData.description || profileData.biography) && (
                    <Box sx={{
                      border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white',
                      borderRadius: 3, px: 3, py: 2.5, mb: 3,
                      backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {type === 'organization' ? 'O udruženju' : type === 'daija' ? 'Biografija' : 'Opis predavanja'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.95 }}>
                        {profileData.description || profileData.biography}
                      </Typography>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {(type === 'lecture' || type === 'organization') && (profileData.address || profileData.city) && (
                      <Button
                        variant="outlined"
                        startIcon={<DirectionsIcon />}
                        onClick={() => {
                          const address = [profileData.address, profileData.city].filter(Boolean).join(', ');
                          const encodedAddress = encodeURIComponent(address);
                          window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
                        }}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white',
                          borderRadius: 3, px: 3, py: 1.5, fontSize: '0.95rem', fontWeight: 500,
                          textTransform: 'none', transition: 'all 0.2s ease',
                          backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }
                        }}
                      >
                        Lokacija
                      </Button>
                    )}
                    
                    <ShareButton profileData={profileData} type={type} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Container>

      {/* Related Lectures Section - NOVA IMPLEMENTACIJA */}
      {type === 'lecture' && relatedLectures.length > 0 && (
        <Box sx={{ width: '100%', py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 600,
                color: '#022C43',
                textAlign: 'center',
                mb: 4
              }}
            >
              Ostali dersovi
            </Typography>
            
            {lecturesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(auto-fit, minmax(280px, 1fr))',
                      sm: 'repeat(auto-fit, minmax(300px, 1fr))',
                      md: 'repeat(auto-fit, minmax(320px, 1fr))',
                      lg: 'repeat(auto-fit, minmax(300px, 350px))'
                    },
                    gap: { xs: 2, sm: 2.5, md: 3 },
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  {relatedLectures.map((lecture) => (
                    <Box
                      key={lecture._id}
                      sx={{
                        height: { xs: 280, sm: 300 },
                        minHeight: 280
                      }}
                    >
                      <UniversalCard data={lecture} />
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => router.push('/lectures')}
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
          </Container>
        </Box>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)'
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
          <IconButton
            onClick={() => setOpenImageModal(false)}
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={getImageUrl(profileData?.image) || (type === 'daija' ? getDefaultDaijaImage() : type === 'organization' ? getDefaultOrganizationImage() : getDefaultLectureImage())}
            alt={profileData?.title || profileData?.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = type === 'daija' ? getDefaultDaijaImage() : type === 'organization' ? getDefaultOrganizationImage() : getDefaultLectureImage();
            }}
          />
        </Box>
      </Modal>
    </PageLayout>
  );
};

export default NewUnifiedProfile;