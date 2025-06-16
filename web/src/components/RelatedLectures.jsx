import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { LecturesGrid } from './GridLayout';
import UniversalCard from './UniversalCard';
import { predavanjaService } from '@/services';
import { safeApiCall, normalizeToArray } from '../utils/dataHelpers';

const RelatedLectures = ({ 
  currentLectureId, 
  type, 
  organizationId, 
  daijaId, 
  organizationName,
  daijaName 
}) => {
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lecturesPerPage = 20;

  // Get the appropriate title based on profile type
  const getTitle = () => {
    switch (type) {
      case 'lecture':
        return 'Ostali dersovi';
      case 'organization':
        return `Organizovani dersovi${organizationName ? ` - ${organizationName}` : ''}`;
      case 'daija':
        return `Organizovani dersovi${daijaName ? ` - ${daijaName}` : ''}`;
      default:
        return 'Povezani dersovi';
    }
  };

  const fetchLectures = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      let allLectures = [];

      switch (type) {
        case 'lecture':
          // Get all lectures from homepage and exclude current one
          response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
          allLectures = normalizeToArray(response);
          // Filter out current lecture
          allLectures = allLectures.filter(lecture => lecture._id !== currentLectureId);
          break;

        case 'organization':
          if (organizationId) {
            try {
              response = await safeApiCall(() => predavanjaService.getPredavanjaByOrganization(organizationId), []);
              allLectures = normalizeToArray(response);
            } catch (error) {
              console.warn('Organization lectures endpoint may not exist:', error);
              // Fallback: get all lectures and filter by organizationId
              response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
              const allLecturesData = normalizeToArray(response);
              allLectures = allLecturesData.filter(lecture => 
                lecture.organizationId === organizationId || 
                (organizationName && lecture.organization && lecture.organization.includes(organizationName))
              );
            }
          }
          break;

        case 'daija':
          if (daijaId) {
            try {
              response = await safeApiCall(() => predavanjaService.getPredavanjaByDaija(daijaId), []);
              allLectures = normalizeToArray(response);
            } catch (error) {
              console.warn('Daija lectures endpoint may not exist:', error);
              // Fallback: get all lectures and filter by daija
              response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
              const allLecturesData = normalizeToArray(response);
              allLectures = allLecturesData.filter(lecture => 
                (lecture.daija && (lecture.daija._id === daijaId || lecture.daija === daijaId)) ||
                (daijaName && lecture.speaker && lecture.speaker.includes(daijaName))
              );
            }
          }
          break;

        default:
          allLectures = [];
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

      setLectures(currentPageLectures);
    } catch (error) {
      console.error('Error fetching related lectures:', error);
      setError('Greška pri dohvaćanju povezanih predavanja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [type, currentLectureId, organizationId, daijaId, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top of related lectures section
    const element = document.getElementById('related-lectures');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Don't render if no lectures or if it's a lecture type with no other lectures
  if (!isLoading && lectures.length === 0) {
    return null;
  }

  return (
    <Box id="related-lectures" sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
      <Container maxWidth="lg">
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
            {getTitle()}
          </Typography>
          {!isLoading && totalPages > 1 && (
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
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Lectures Grid */}
        {!isLoading && !error && lectures.length > 0 && (
          <>
            <LecturesGrid>
              {lectures.map((lecture) => (
                <Box key={lecture._id} sx={{ height: '300px' }}>
                  <UniversalCard data={lecture} />
                </Box>
              ))}
            </LecturesGrid>

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
        {!isLoading && !error && lectures.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {type === 'lecture' 
                ? 'Nema drugih dostupnih predavanja' 
                : 'Nema organizovanih predavanja'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type === 'lecture' 
                ? 'Trenutno je ovo jedino dostupno predavanje.' 
                : 'Ova organizacija/daija još uvijek nije organizovala predavanja.'
              }
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RelatedLectures;