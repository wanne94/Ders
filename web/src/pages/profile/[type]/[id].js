import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Typography,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosConfig';
import LectureCard from '../../../components/LectureCard';
import { LecturesGrid } from '../../../components/GridLayout';
import { sortLecturesByDateProximity, generateDaijaSlug, findDaijaBySlug, formatDateWithDay, generateOrganizationSlug, findOrganizationBySlug, generateLectureSlug, findLectureBySlug } from '../../../utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '../../../utils/imageUtils';

const UnifiedProfile = () => {
  const router = useRouter();
  const { type, id } = router.query;
  
  const [profileData, setProfileData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [relatedData, setRelatedData] = useState(null); // For daija/organization info in lectures
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const lecturesPerPage = 20;

  // Determine profile type and fetch appropriate data
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Profile Type:", type, "ID:", id);

      let profileResponse, lecturesResponse, relatedResponse;

      switch (type) {
        case 'daija':
          // Handle both ID and slug for daije
          if (id && id.length === 24) {
            // It's an ObjectId
            console.log("Fetching daija by ID:", id);
            profileResponse = await axiosInstance.get(`/daije/${id}`);
          } else {
            // It's a slug, fetch all daije and find by slug
            console.log("Fetching daija by slug:", id);
            const allDaijeResponse = await axiosInstance.get('/daije');
            const allDaije = Array.isArray(allDaijeResponse.data) ? allDaijeResponse.data : [];
            const foundDaija = findDaijaBySlug(id, allDaije);
            if (!foundDaija) {
              setError('Daija nije pronađen');
              return;
            }
            profileResponse = { data: foundDaija };
          }
          
          lecturesResponse = await axiosInstance.get(`/lectures/daija/${profileResponse.data._id}`);
          break;

        case 'organization':
          // Handle both ID and slug for organizations
          if (id && id.length === 24) {
            // It's an ObjectId
            console.log("Fetching organization by ID:", id);
            profileResponse = await axiosInstance.get(`/organizations/${id}`);
          } else {
            // It's a slug, fetch all organizations and find by slug
            console.log("Fetching organization by slug:", id);
            const allOrganizationsResponse = await axiosInstance.get('/organizations');
            const allOrganizations = Array.isArray(allOrganizationsResponse.data) ? allOrganizationsResponse.data : [];
            const foundOrganization = findOrganizationBySlug(id, allOrganizations);
            if (!foundOrganization) {
              setError('Organizacija nije pronađena');
              return;
            }
            profileResponse = { data: foundOrganization };
          }
          
          lecturesResponse = await axiosInstance.get(`/lectures/organization/${profileResponse.data._id}`);
          break;

        case 'lecture':
          // Handle both ID and slug for lectures
          if (id && id.length === 24) {
            // It's an ObjectId
            console.log("Fetching lecture by ID:", id);
            profileResponse = await axiosInstance.get(`/lectures/${id}`);
          } else {
            // It's a slug, fetch all lectures and find by slug
            console.log("Fetching lecture by slug:", id);
            const allLecturesResponse = await axiosInstance.get('/lectures');
            const allLectures = Array.isArray(allLecturesResponse.data) ? allLecturesResponse.data : [];
            const foundLecture = findLectureBySlug(id, allLectures);
            if (!foundLecture) {
              setError('Predavanje nije pronađeno');
              return;
            }
            profileResponse = { data: foundLecture };
          }
          
          // Fetch related daija and organization data
          const lectureData = profileResponse.data;
          console.log("Lecture data:", {
            id: lectureData._id,
            title: lectureData.title,
            daijaId: lectureData.daija || lectureData.daijaId,
            organizationId: lectureData.organizationId
          });
          
          const relatedPromises = [];
          
          if (lectureData.daija || lectureData.daijaId) {
            const daijaId = lectureData.daija || lectureData.daijaId;
            console.log("Fetching related daija:", daijaId);
            relatedPromises.push(
              axiosInstance.get(`/daije/${daijaId}`)
                .then(res => ({ type: 'daija', data: res.data }))
                .catch((error) => {
                  console.warn(`Daija with ID ${daijaId} not found:`, error.message);
                  return { type: 'daija', data: null };
                })
            );
          }
          
          if (lectureData.organizationId) {
            console.log("Fetching related organization:", lectureData.organizationId);
            relatedPromises.push(
              axiosInstance.get(`/organizations/${lectureData.organizationId}`)
                .then(res => ({ type: 'organization', data: res.data }))
                .catch((error) => {
                  console.warn(`Organization with ID ${lectureData.organizationId} not found:`, error.message);
                  return { type: 'organization', data: null };
                })
            );
          }

          if (relatedPromises.length > 0) {
            const relatedResults = await Promise.all(relatedPromises);
            const relatedInfo = {};
            relatedResults.forEach(result => {
              if (result.data) {
                relatedInfo[result.type] = result.data;
              }
            });
            setRelatedData(relatedInfo);
          }

          // For lectures, also fetch other lectures by same daija/organization
          const otherLecturesPromises = [];
          if (lectureData.daija || lectureData.daijaId) {
            const daijaId = lectureData.daija || lectureData.daijaId;
            console.log("Fetching other lectures by daija:", daijaId);
            otherLecturesPromises.push(
              axiosInstance.get(`/lectures/daija/${daijaId}`)
                .catch((error) => {
                  console.warn(`Failed to fetch lectures for daija ${daijaId}:`, error.message);
                  return { data: [] };
                })
            );
          }
          if (lectureData.organizationId) {
            console.log("Fetching other lectures by organization:", lectureData.organizationId);
            otherLecturesPromises.push(
              axiosInstance.get(`/lectures/organization/${lectureData.organizationId}`)
                .catch((error) => {
                  console.warn(`Failed to fetch lectures for organization ${lectureData.organizationId}:`, error.message);
                  return { data: [] };
                })
            );
          }

          if (otherLecturesPromises.length > 0) {
            const otherLecturesResults = await Promise.all(otherLecturesPromises);
            const allOtherLectures = otherLecturesResults.flatMap(res => 
              Array.isArray(res.data) ? res.data : []
            );
            // Remove current lecture and duplicates
            const uniqueOtherLectures = allOtherLectures
              .filter(lecture => lecture._id !== lectureData._id)
              .filter((lecture, index, self) => 
                index === self.findIndex(l => l._id === lecture._id)
              );
            setLectures(uniqueOtherLectures);
          }
          break;

        default:
          setError('Nepoznat tip profila');
          return;
      }

      if (profileResponse && profileResponse.data) {
        setProfileData(profileResponse.data);
        console.log("Profile data set:", profileResponse.data);
      } else {
        setError('Profil nije pronađen');
        return;
      }

      if (lecturesResponse && Array.isArray(lecturesResponse.data)) {
        const sortedLectures = sortLecturesByDateProximity(lecturesResponse.data);
        setLectures(sortedLectures);
        console.log("Lectures set:", sortedLectures.length);
      } else if (type !== 'lecture') {
        console.log("No lectures found or invalid response");
        setLectures([]);
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

  // Pagination logic
  const totalPages = Math.ceil(lectures.length / lecturesPerPage);
  const startIndex = (page - 1) * lecturesPerPage;
  const currentLectures = lectures.slice(startIndex, startIndex + lecturesPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleBackNavigation = () => {
    switch (type) {
      case 'daija':
        router.push('/daije');
        break;
      case 'organization':
        router.push('/organizations');
        break;
      case 'lecture':
        router.push('/lectures');
        break;
      default:
        router.push('/');
    }
  };

  const getProfileTitle = () => {
    if (!profileData) return '';
    
    switch (type) {
      case 'daija':
        // Return only the name without title (title is shown separately below)
        const name = profileData.name || profileData.firstName || '';
        return name || 'Nepoznat daija';
      case 'organization':
        return profileData.name || 'Nepoznata organizacija';
      case 'lecture':
        return profileData.title || 'Nepoznato predavanje';
      default:
        return 'Nepoznat profil';
    }
  };

  const getProfileImage = () => {
    if (!profileData) return '';
    
    switch (type) {
      case 'daija':
        return getImageUrl(profileData.image) || getDefaultDaijaImage();
      case 'organization':
        return getImageUrl(profileData.image) || getDefaultOrganizationImage();
      case 'lecture':
        return getImageUrl(profileData.image) || getDefaultLectureImage();
      default:
        return '';
    }
  };

  const getBackButtonText = () => {
    switch (type) {
      case 'daija':
        return 'Nazad na daije';
      case 'organization':
        return 'Nazad na udruženja';
      case 'lecture':
        return 'Nazad na predavanja';
      default:
        return 'Nazad';
    }
  };

  const formatSpeakerName = (speaker) => {
    return typeof speaker === 'object' && speaker.name ? speaker.name : speaker;
  };

  const handleRelatedClick = (relatedType, relatedData) => {
    if (relatedType === 'daija') {
      const slug = generateDaijaSlug(relatedData);
      router.push(`/profile/daija/${slug}`);
    } else if (relatedType === 'organization') {
      const slug = generateOrganizationSlug(relatedData);
      router.push(`/profile/organization/${slug}`);
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
            {getBackButtonText()}
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
            {getBackButtonText()}
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
            {getBackButtonText()}
          </Button>
        </Box>

        {/* Enhanced Profile Section for Daija */}
        {type === 'daija' ? (
          <Box sx={{ mb: 4 }}>
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
              {/* Decorative Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  opacity: 0.3
                }}
              />
              
              <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center" sx={{ py: 6 }}>
                  {/* Profile Image */}
                  <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-block'
                      }}
                    >
                      <Avatar
                        src={getProfileImage()}
                        alt={getProfileTitle()}
                        sx={{ 
                          width: 200,
                          height: 200,
                          border: '6px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          mb: 2
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDefaultDaijaImage();
                        }}
                      />
                      {/* Decorative Ring */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: -10,
                          width: 220,
                          height: 220,
                          border: '2px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite'
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
                          fontWeight: 300,
                          fontSize: { xs: '2.5rem', md: '3.5rem' },
                          letterSpacing: '-0.02em',
                          mb: 2
                        }}
                      >
                        {getProfileTitle()}
                      </Typography>
                      
                      {profileData.title && (
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            opacity: 0.9,
                            fontWeight: 400,
                            mb: 3,
                            fontStyle: 'italic'
                          }}
                        >
                          {profileData.title}
                        </Typography>
                      )}

                      {profileData.shortDescription && (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            opacity: 0.8,
                            fontWeight: 300,
                            lineHeight: 1.6,
                            mb: 3,
                            maxWidth: '600px'
                          }}
                        >
                          {profileData.shortDescription}
                        </Typography>
                      )}

                      {/* Contact Info */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        {profileData.email && (
                          <Chip
                            icon={<EmailIcon />}
                            label={profileData.email}
                            variant="outlined"
                            sx={{ 
                              color: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        )}
                        {profileData.phone && (
                          <Chip
                            icon={<PhoneIcon />}
                            label={profileData.phone}
                            variant="outlined"
                            sx={{ 
                              color: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              '& .MuiChip-icon': { color: 'white' }
                            }}
                          />
                        )}
                      </Box>

                      {/* Social Media Links */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {profileData.linkedin && (
                          <IconButton
                            href={profileData.linkedin}
                            target="_blank"
                            sx={{ 
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                            }}
                          >
                            <LinkedInIcon />
                          </IconButton>
                        )}
                        {profileData.twitter && (
                          <IconButton
                            href={profileData.twitter}
                            target="_blank"
                            sx={{ 
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                            }}
                          >
                            <TwitterIcon />
                          </IconButton>
                        )}
                        {profileData.facebook && (
                          <IconButton
                            href={profileData.facebook}
                            target="_blank"
                            sx={{ 
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                            }}
                          >
                            <FacebookIcon />
                          </IconButton>
                        )}
                        {profileData.instagram && (
                          <IconButton
                            href={profileData.instagram}
                            target="_blank"
                            sx={{ 
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                            }}
                          >
                            <InstagramIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Container>
            </Paper>

            {/* Detailed Information Cards */}
            <Grid container spacing={4}>
              {/* Education Card */}
              {profileData.education && profileData.education.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      border: '1px solid #e0e0e0',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            backgroundColor: '#022C43',
                            borderRadius: '50%',
                            p: 1.5,
                            mr: 2
                          }}
                        >
                          <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="600" color="#022C43">
                          Obrazovanje
                        </Typography>
                      </Box>
                      <List sx={{ p: 0 }}>
                        {profileData.education.map((edu, index) => (
                          <ListItem 
                            key={index} 
                            sx={{ 
                              px: 0, 
                              py: 1.5,
                              borderBottom: index < profileData.education.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}
                          >
                            <ListItemText 
                              primary={edu}
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontSize: '1.1rem',
                                  lineHeight: 1.6,
                                  color: '#333'
                                } 
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Experience Card */}
              {profileData.experience && profileData.experience.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      border: '1px solid #e0e0e0',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            backgroundColor: '#dc004e',
                            borderRadius: '50%',
                            p: 1.5,
                            mr: 2
                          }}
                        >
                          <RecordVoiceOverIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="600" color="#022C43">
                          Iskustvo
                        </Typography>
                      </Box>
                      <List sx={{ p: 0 }}>
                        {profileData.experience.map((exp, index) => (
                          <ListItem 
                            key={index} 
                            sx={{ 
                              px: 0, 
                              py: 1.5,
                              borderBottom: index < profileData.experience.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}
                          >
                            <ListItemText 
                              primary={exp}
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontSize: '1.1rem',
                                  lineHeight: 1.6,
                                  color: '#333'
                                } 
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Biography/Description Card */}
              {(profileData.biography || profileData.description) && (
                <Grid item xs={12}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography 
                        variant="h5" 
                        fontWeight="600" 
                        color="#022C43"
                        gutterBottom
                        sx={{ mb: 3 }}
                      >
                        Biografija
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: '1.1rem',
                          lineHeight: 1.8,
                          color: '#555',
                          textAlign: 'justify'
                        }}
                      >
                        {profileData.biography || profileData.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          // Original Profile Section for other types
          <Card sx={{ mb: 4, p: 3 }}>
            <Grid container spacing={4} alignItems="center" sx={{ minHeight: '400px' }}>
              {/* Left Column - Image */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <Box
                    component="img"
                    src={getProfileImage()}
                    alt={getProfileTitle()}
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      maxWidth: type === 'lecture' ? 300 : type === 'daija' ? 250 : type === 'organization' ? 250 : 500,
                      maxHeight: type === 'lecture' ? 800 : type === 'daija' ? 250 : type === 'organization' ? 250 : 500,
                      borderRadius: type === 'lecture' ? 2 : '50%',
                      objectFit: 'cover',
                      border: '4px solid',
                      borderColor: 'primary.main',
                      mb: 2
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = type === 'daija' ? getDefaultDaijaImage() : 
                                    type === 'organization' ? getDefaultOrganizationImage() : 
                                    getDefaultLectureImage();
                    }}
                  />
                  {(type === 'daija' || type === 'organization') && (
                    <Typography variant="h4" component="h1" gutterBottom>
                      {getProfileTitle()}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Right Column - Information */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {type === 'lecture' ? getProfileTitle() : 'Osnovne informacije'}
                  </Typography>
                  
                  {/* Organization Profile Information */}
                  {type === 'organization' && (
                    <>
                      {profileData.shortDescription && (
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                          {profileData.shortDescription}
                        </Typography>
                      )}
                      
                      {profileData.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <LocationOnIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Adresa:
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {profileData.address}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {profileData.city && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <LocationCityIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Mjesto:
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {profileData.city}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}

                  {/* Lecture Profile Information */}
                  {type === 'lecture' && (
                    <>
                      {profileData.speaker && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <PersonIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Predavač:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              color={relatedData?.daija ? 'primary.main' : 'text.secondary'}
                              sx={{ 
                                cursor: relatedData?.daija ? 'pointer' : 'default',
                                textDecoration: relatedData?.daija ? 'underline' : 'none'
                              }}
                              onClick={() => relatedData?.daija && handleRelatedClick('daija', relatedData.daija)}
                            >
                              {formatSpeakerName(profileData.speaker)}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {profileData.organization && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <BusinessIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Udruženje:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              color={relatedData?.organization ? 'primary.main' : 'text.secondary'}
                              sx={{ 
                                cursor: relatedData?.organization ? 'pointer' : 'default',
                                textDecoration: relatedData?.organization ? 'underline' : 'none'
                              }}
                              onClick={() => relatedData?.organization && handleRelatedClick('organization', relatedData.organization)}
                            >
                              {profileData.organization}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {profileData.date && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Datum:
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {formatDateWithDay(profileData.date)}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {profileData.time && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <AccessTimeIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Vrijeme:
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {profileData.time}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {(profileData.address || profileData.city) && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <LocationOnIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                              Lokacija:
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {[profileData.address, profileData.city].filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {profileData.shortDescription && (
                        <Box sx={{ mt: 3, mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" gutterBottom>
                            Kratki opis:
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {profileData.shortDescription}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}

                  {/* Description for all types */}
                  {profileData.description && type !== 'daija' && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                        {type === 'lecture' ? 'Opis predavanja:' : 'Opis:'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {profileData.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Card>
        )}

        {/* Related Lectures Section */}
        {lectures.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              {type === 'lecture' ? 'Ostala predavanja' : 'Dersovi'}
            </Typography>
            <LecturesGrid gap={3}>
              {currentLectures.map((lecture) => (
                <LectureCard 
                  key={lecture._id} 
                  lecture={lecture}
                  onClick={() => {
                    const slug = generateLectureSlug(lecture);
                    router.push(`/profile/lecture/${slug}`);
                  }}
                />
              ))}
            </LecturesGrid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Box>
        )}

        {/* No lectures message */}
        {lectures.length === 0 && type !== 'lecture' && (
          <Alert severity="info" sx={{ mt: 4 }}>
            {type === 'daija' ? 'Daija još nema predavanja na našoj platformi.' :
             type === 'organization' ? 'Udruženje još nema predavanja na našoj platformi.' :
             'Nema povezanih predavanja.'}
          </Alert>
        )}
      </Container>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default UnifiedProfile; 