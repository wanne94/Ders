import { useState, useEffect } from 'react';
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
  Pagination,
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
import CloseIcon from '@mui/icons-material/Close';
import PageLayout from '@/components/PageLayout';
import ContentContainer from '@/components/ContentContainer';
import ShareButton from '@/components/ShareButton';
import UniversalCard from '@/components/UniversalCard';
import CancellationReportButton from '@/components/CancellationReportButton';
import CancelledOverlay from '@/components/CancelledOverlay';
import SkeletonProfile from '@/components/SkeletonProfile';
import SkeletonGrid from '@/components/SkeletonGrid';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';
import { formatDateWithDay } from '@/utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle } from '@/utils';
import { safeApiCall, normalizeToArray } from '@/utils/dataHelpers';

const ProfilePage = () => {
  const router = useRouter();
  const { type, id } = router.query;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  // Related lectures state
  const [relatedLectures, setRelatedLectures] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lecturesPerPage = 10;

  useEffect(() => {
    if (!type || !id) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;
        if (type === 'lecture') {
          data = await predavanjaService.getPredavanjeById(id);
        } else if (type === 'daija') {
          data = await daijeService.getDaijaById(id);
        } else if (type === 'organization') {
          data = await udruzenjaService.getUdruzenjeById(id);
        } else {
          throw new Error('Nepoznat tip profila');
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Greška pri učitavanju profila');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [type, id]);

  // Fetch related lectures
  useEffect(() => {
    if (!type || !id || !profile) return;
    
    const fetchRelatedLectures = async () => {
      try {
        setRelatedLoading(true);
        setRelatedError(null);

        let response;
        let allLectures = [];

        if (type === 'lecture') {
          // Get all lectures from homepage and exclude current one
          response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
          allLectures = normalizeToArray(response);
          // Filter out current lecture
          allLectures = allLectures.filter(lecture => lecture._id !== id);
        } else if (type === 'organization') {
          // Get lectures by organization
          response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
          const allLecturesData = normalizeToArray(response);
          allLectures = allLecturesData.filter(lecture => 
            lecture.organizationId === id || 
            (profile.name && lecture.organization && lecture.organization.includes(profile.name))
          );
        } else if (type === 'daija') {
          // Get lectures by daija
          response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
          const allLecturesData = normalizeToArray(response);
          allLectures = allLecturesData.filter(lecture => {
            const matchById = lecture.daija && (lecture.daija._id === id || lecture.daija === id || lecture.daijaId === id);
            const matchByName = profile.name && lecture.speaker && lecture.speaker.includes(profile.name);
            return matchById || matchByName;
          });
        }

        // Add type field to all lectures
        const lecturesWithType = allLectures.map(lecture => ({
          ...lecture,
          type: 'Predavanje'
        }));

        // Calculate pagination
        const totalLectures = lecturesWithType.length;
        const calculatedTotalPages = Math.ceil(totalLectures / lecturesPerPage);
        setTotalPages(calculatedTotalPages);

        // Get lectures for current page
        const startIndex = (page - 1) * lecturesPerPage;
        const endIndex = startIndex + lecturesPerPage;
        const currentPageLectures = lecturesWithType.slice(startIndex, endIndex);

        setRelatedLectures(currentPageLectures);
      } catch (error) {
        console.error('Error fetching related lectures:', error);
        setRelatedError('Greška pri dohvaćanju povezanih predavanja');
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedLectures();
  }, [type, id, profile, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top of related lectures section
    const element = document.getElementById('related-lectures');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getBackPath = () => {
    if (type === 'daija') return '/daije';
    if (type === 'organization') return '/organizations';
    return '/lectures';
  };

  const getBackText = () => {
    if (type === 'daija') return 'Nazad na sve daije';
    if (type === 'organization') return 'Nazad na sva udruženja';
    return 'Nazad na sva predavanja';
  };

  const getTitle = () => {
    if (type === 'daija') {
      return formatDaijaTitle(profile.name, profile.title);
    }
    if (type === 'organization') {
      return profile.name;
    }
    // For lectures, add part number if exists
    let title = profile.title;
    if (type === 'lecture' && profile.lecturePart) {
      title += ` (dio ${profile.lecturePart}.)`;
    }
    return title;
  };

  const getDefaultImage = () => {
    if (type === 'daija') return getDefaultDaijaImage();
    if (type === 'organization') return getDefaultOrganizationImage();
    return getDefaultLectureImage();
  };

  const getRelatedTitle = () => {
    if (type === 'lecture') return 'Ostali najavljeni dersovi';
    if (type === 'organization') return 'Najavljeni dersovi';
    if (type === 'daija') return 'Najavljeni dersovi';
    return 'Najavljeni dersovi';
  };

  const openLocation = () => {
    const address = [profile.address, profile.city].filter(Boolean).join(', ');
    const encoded = encodeURIComponent(address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      if (isIOS) {
        window.open(`maps://maps.google.com/maps?daddr=${encoded}`, '_blank');
        setTimeout(() => {
          window.open(`https://maps.google.com/maps?daddr=${encoded}`, '_blank');
        }, 500);
      } else {
        window.open(`https://maps.google.com/maps?daddr=${encoded}`, '_blank');
      }
    } else {
      window.open(`https://maps.google.com/maps?daddr=${encoded}`, '_blank');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <SkeletonProfile type={type} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ContentContainer sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push(getBackPath())}
          >
            {getBackText()}
          </Button>
        </ContentContainer>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout>
        <ContentContainer sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 4 }}>
            Profil nije pronađen
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push(getBackPath())}
          >
            {getBackText()}
          </Button>
        </ContentContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ContentContainer sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push(getBackPath())}
            sx={{ mb: 2 }}
          >
            {getBackText()}
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
          <ContentContainer>
            <Grid container spacing={4} alignItems="stretch" sx={{ py: { xs: 4, sm: 6 } }}>
              {/* Profile Image - Left Column */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  onClick={() => setImageModalOpen(true)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: '40vh', md: '100%' },
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
                    src={getImageUrl(profile.image) || getDefaultImage()}
                    alt={profile.title || profile.name}
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultImage();
                    }}
                  />
                  {/* Cancellation Overlay for lectures */}
                  {type === 'lecture' && (
                    <CancelledOverlay 
                      show={profile.isCancelled || profile.status === 'cancelled'}
                      text="OTKAZANO"
                      variant="diagonal"
                    />
                  )}
                </Box>
              </Grid>

              {/* Profile Info - Right Column */}
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
                    {getTitle()}
                  </Typography>

                  {/* Weekly lecture badge */}
                  {type === 'lecture' && profile.isWeeklyLecture && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label="Sedmično predavanje"
                        size="medium"
                        sx={{
                          backgroundColor: '#e3f2fd',
                          color: '#1565c0',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          px: 2,
                          py: 0.5,
                          height: 'auto',
                          '& .MuiChip-label': {
                            px: 1,
                            py: 0.5
                          }
                        }}
                      />
                    </Box>
                  )}

                  {/* Meta Information */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {/* Date */}
                    {type === 'lecture' && profile.date && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: 3,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.2 },
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <CalendarTodayIcon sx={{ fontSize: 18 }} />
                        <span>{formatDateWithDay(profile.date)}</span>
                      </Box>
                    )}

                    {/* Time */}
                    {type === 'lecture' && profile.time && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: 3,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.2 },
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <AccessTimeIcon sx={{ fontSize: 18 }} />
                        <span>{profile.time}</span>
                      </Box>
                    )}
                    
                    {/* Speaker */}
                    {type === 'lecture' && profile.speaker && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: 3,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.2 },
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                        <span>{profile.speaker}</span>
                      </Box>
                    )}

                    {/* Organization */}
                    {type === 'lecture' && profile.organization && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: 3,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.2 },
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <BusinessIcon sx={{ fontSize: 18 }} />
                        <span>{profile.organization}</span>
                      </Box>
                    )}
                    
                    {/* Location */}
                    {(profile.address || profile.city) && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: 3,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.2 },
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <LocationOnIcon sx={{ fontSize: 18 }} />
                        <span>{[profile.address, profile.city].filter(Boolean).join(', ')}</span>
                      </Box>
                    )}
                  </Box>

                  {/* Cancellation Notice */}
                  {type === 'lecture' && (profile.isCancelled || profile.status === 'cancelled') && (
                    <Box sx={{
                      border: '2px solid #f44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      borderRadius: 3,
                      px: { xs: 2.5, sm: 3 },
                      py: { xs: 2, sm: 2.5 },
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#f44336', 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5
                      }}>
                        ❌ PREDAVANJE JE OTKAZANO
                      </Typography>
                      {profile.cancellationReason && (
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          textAlign: 'center',
                          fontSize: '0.95rem'
                        }}>
                          Razlog: {profile.cancellationReason}
                        </Typography>
                      )}
                      {profile.cancelledAt && (
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          mt: 1
                        }}>
                          Otkazano: {new Date(profile.cancelledAt).toLocaleDateString('bs-BA')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Description */}
                  {(profile.description || profile.biography) && (
                    <Box sx={{
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      borderRadius: 3,
                      px: { xs: 2.5, sm: 3 },
                      py: { xs: 2, sm: 2.5 },
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {type === 'organization' ? 'O udruženju' : type === 'daija' ? 'Biografija' : 'Opis predavanja'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        opacity: 0.95,
                      }}>
                        {profile.description || profile.biography}
                      </Typography>
                    </Box>
                  )}

                  {/* Social Media Links */}
                  {type === 'organization' && (profile.facebook || profile.instagram || profile.telegram || profile.viber) && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                      {profile.facebook && (
                        <Button
                          variant="outlined"
                          startIcon={<FacebookIcon />}
                          href={profile.facebook}
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
                      {profile.instagram && (
                        <Button
                          variant="outlined"
                          startIcon={<InstagramIcon />}
                          href={profile.instagram}
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
                      {profile.telegram && (
                        <Button
                          variant="outlined"
                          startIcon={<TelegramIcon />}
                          href={profile.telegram}
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
                      {profile.viber && (
                        <Button
                          variant="outlined"
                          startIcon={<ChatIcon />}
                          href={profile.viber}
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
                    {/* Location Button */}
                    {(type === 'lecture' || type === 'organization') && (profile.address || profile.city) && (
                      <Button
                        variant="outlined"
                        startIcon={<DirectionsIcon />}
                        onClick={openLocation}
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
                    <ShareButton profileData={profile} type={type} />
                    
                    {/* Cancellation Report Button - u istoj liniji sa ostalim dugmadima */}
                    {type === 'lecture' && profile && !profile.isCancelled && (
                      <Box sx={{
                        '& .MuiButton-root': {
                          backgroundColor: 'rgba(255, 152, 0, 0.15)', // Narandžasta pozadina
                          borderColor: 'rgba(255, 152, 0, 0.6)',      // Narandžasti border  
                          color: '#ff9800',                           // Narandžasta boja teksta
                          borderRadius: 3,
                          px: 3,
                          py: 1.5,
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          transition: 'all 0.2s ease',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.25)',
                            borderColor: 'rgba(255, 152, 0, 0.8)',
                            color: '#f57c00',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                          }
                        }
                      }}>
                        <CancellationReportButton 
                          lectureId={profile._id}
                          lectureTitle={profile.title}
                          variant="outlined"
                          size="medium"
                          onReportSuccess={(data) => {
                            // Optional: Refresh profile data nakon uspješne prijave
                            console.log('Cancellation reported successfully:', data);
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </ContentContainer>
        </Paper>
      </ContentContainer>

      {/* Related Lectures Section */}
      <Box id="related-lectures" sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
        <ContentContainer>
          {/* Section Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 600,
                color: '#022C43',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              {getRelatedTitle()}
            </Typography>
            {!relatedLoading && totalPages > 1 && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Stranica {page} od {totalPages}
              </Typography>
            )}
          </Box>

          {/* Loading State */}
          {relatedLoading && (
            <SkeletonGrid count={8} type="lecture" />
          )}

          {/* Error State */}
          {relatedError && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {relatedError}
            </Alert>
          )}

          {/* Lectures Grid */}
          {!relatedLoading && !relatedError && relatedLectures.length > 0 && (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                    xl: 'repeat(5, 1fr)'
                  },
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  width: '100%'
                }}
              >
                {relatedLectures.map((lecture) => (
                  <UniversalCard key={lecture._id} data={lecture} />
                ))}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 500,
                      },
                      '& .MuiPaginationItem-page.Mui-selected': {
                        backgroundColor: '#022C43',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#055A87',
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}

          {/* Empty State */}
          {!relatedLoading && !relatedError && relatedLectures.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {type === 'lecture' 
                  ? 'Nema drugih dostupnih predavanja' 
                  : type === 'daija'
                  ? 'Nema najavljenih predavanja'
                  : 'Nema organizovanih predavanja'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type === 'lecture' 
                  ? 'Trenutno je ovo jedino dostupno predavanje.' 
                  : type === 'daija'
                  ? 'Ovaj daija trenutno nema najavljena predavanja.'
                  : 'Ova organizacija još uvijek nije organizovala predavanja.'
                }
              </Typography>
            </Box>
          )}
        </ContentContainer>
      </Box>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)'
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
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
            src={getImageUrl(profile?.image) || getDefaultImage()}
            alt={profile?.title || profile?.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getDefaultImage();
            }}
          />
        </Box>
      </Modal>
    </PageLayout>
  );
};

export default ProfilePage;