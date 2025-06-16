import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsIcon from '@mui/icons-material/Directions';
import PageLayout from '../../../components/PageLayout';
import ShareButton from '../../../components/ShareButton';
import AddressLink from '../../../components/AddressLink';
import RelatedLectures from '../../../components/RelatedLectures';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';
import { formatDateWithDay } from '../../../utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '../../../utils/imageUtils';
import { toTitleCase } from '../../../utils';

const UnifiedProfile = () => {
  const router = useRouter();
  const { type, id } = router.query;
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
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
  };

  useEffect(() => {
    if (type && id) {
      fetchProfileData();
    }
  }, [type, id]);

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
            {type === 'daija' ? 'Nazad na sve daije' : type === 'organization' ? 'Nazad na sva udruženja' : 'Nazad na sva predavanja'}
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
            {type === 'daija' ? 'Nazad na sve daije' : type === 'organization' ? 'Nazad na sva udruženja' : 'Nazad na sva predavanja'}
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
                      ? `${profileData.title || ''}. ${profileData.name || ''}`.trim()
                      : type === 'organization'
                      ? profileData.name
                      : profileData.title
                    }
                  </Typography>

                  {/* All Info Items with Share Button Style */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {/* Date and Time for lectures */}
                    {type === 'lecture' && profileData.date && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid',
                          color: 'white',
                          borderRadius: 3,
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500,
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 18 }} />
                        <span>{formatDateWithDay(profileData.date)}</span>
                      </Box>
                    )}
                    {type === 'lecture' && profileData.time && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid',
                          color: 'white',
                          borderRadius: 3,
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500,
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 18 }} />
                        <span>{profileData.time}</span>
                      </Box>
                    )}
                    
                    {/* Speaker and Organization for lectures */}
                    {type === 'lecture' && profileData.speaker && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid',
                          color: 'white',
                          borderRadius: 3,
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500,
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 18 }} />
                        <span>{profileData.speaker}</span>
                      </Box>
                    )}
                    {type === 'lecture' && profileData.organization && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid',
                          color: 'white',
                          borderRadius: 3,
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500,
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: 18 }} />
                        <span>{profileData.organization}</span>
                      </Box>
                    )}
                    
                    {/* Location for all types */}
                    {(profileData.address || profileData.city) && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid',
                          color: 'white',
                          borderRadius: 3,
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500,
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: 18 }} />
                        <span>{[profileData.address, profileData.city].filter(Boolean).join(', ')}</span>
                      </Box>
                    )}
                  </Box>

                  {/* Description Section */}
                  {(profileData.description || profileData.biography) && (
                    <Box
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        border: '1px solid',
                        color: 'white',
                        borderRadius: 3,
                        px: { xs: 2.5, sm: 3 },
                        py: { xs: 2, sm: 2.5 },
                        mb: 3,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        maxWidth: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {type === 'organization' ? 'O udruženju' : type === 'daija' ? 'Biografija' : 'Opis predavanja'}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.95rem',
                          lineHeight: 1.7,
                          opacity: 0.95,
                        }}
                      >
                        {profileData.description || profileData.biography}
                      </Typography>
                    </Box>
                  )}

                  {/* Social Media Links for Organizations */}
                  {type === 'organization' && (profileData.facebook || profileData.instagram || profileData.telegram || profileData.viber) && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                      {profileData.facebook && (
                        <Button
                          variant="outlined"
                          startIcon={<FacebookIcon />}
                          href={profileData.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: 3,
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                        >
                          Facebook
                        </Button>
                      )}
                      {profileData.instagram && (
                        <Button
                          variant="outlined"
                          startIcon={<InstagramIcon />}
                          href={profileData.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: 3,
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                        >
                          Instagram
                        </Button>
                      )}
                      {profileData.telegram && (
                        <Button
                          variant="outlined"
                          startIcon={<TelegramIcon />}
                          href={profileData.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: 3,
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                        >
                          Telegram
                        </Button>
                      )}
                      {profileData.viber && (
                        <Button
                          variant="outlined"
                          startIcon={<ChatIcon />}
                          href={profileData.viber}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: 3,
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                          }}
                        >
                          Viber
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {/* Location Button - For lectures and organizations with address */}
                    {(type === 'lecture' || type === 'organization') && (profileData.address || profileData.city) && (
                      <Button
                        variant="outlined"
                        startIcon={<DirectionsIcon />}
                        onClick={() => {
                          const address = [profileData.address, profileData.city].filter(Boolean).join(', ');
                          const encodedAddress = encodeURIComponent(address);
                          // Try to use Google Maps first, fallback to Apple Maps on iOS
                          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                          
                          if (isMobile) {
                            if (isIOS) {
                              // iOS - try Apple Maps first, fallback to Google Maps
                              window.open(`maps://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
                              // Fallback to Google Maps if Apple Maps doesn't work
                              setTimeout(() => {
                                window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
                              }, 500);
                            } else {
                              // Android - use Google Maps
                              window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
                            }
                          } else {
                            // Desktop - open Google Maps in browser
                            window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
                          }
                        }}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          borderRadius: 3,
                          px: 3,
                          py: 1.5,
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          transition: 'all 0.2s ease',
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                    
                    {/* Share Button */}
                    <ShareButton profileData={profileData} type={type} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Container>

      {/* Related Lectures Section */}
      <RelatedLectures
        currentLectureId={type === 'lecture' ? id : null}
        type={type}
        organizationId={type === 'organization' ? id : null}
        daijaId={type === 'daija' ? id : null}
        organizationName={type === 'organization' ? profileData?.name : null}
        daijaName={type === 'daija' ? `${profileData?.title || ''} ${profileData?.name || ''}`.trim() : null}
      />
    </PageLayout>
  );
};

export default UnifiedProfile;