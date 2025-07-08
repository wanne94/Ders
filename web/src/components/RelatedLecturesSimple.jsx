import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LecturesGrid } from './GridLayout';
import UniversalCard from './UniversalCard';
import { predavanjaService } from '@/services';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';

const RelatedLecturesSimple = ({ currentLectureId }) => {
  const router = useRouter();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortLectures = useCallback((lectures) => {
    const filtered = lectures
      .filter(lecture => lecture._id !== currentLectureId) // Isključi trenutno predavanje
      .filter(lecture => lecture.status === 'approved'); // Samo odobreni dersovi
    
    const sorted = sortLecturesByStatus(filtered);
    return sorted.slice(0, 12); // Prikaži maksimalno 12 dersova
  }, [currentLectureId]);

  const fetchLectures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all lectures
      const allLectures = await predavanjaService.getAllPredavanja();
      
      // Normalize and sort lectures
      const lecturesData = (allLectures || []).map(lecture => ({
        ...lecture,
        type: 'Predavanje'
      }));

      const sortedLectures = sortLectures(lecturesData);
      setLectures(sortedLectures);
    } catch (error) {
      console.error('Error fetching related lectures:', error);
      setError('Greška pri dohvaćanju povezanih predavanja');
      setLectures([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortLectures]);

  useEffect(() => {
    if (currentLectureId) {
      fetchLectures();
    }
  }, [currentLectureId, fetchLectures]);

  const handleViewAllLectures = () => {
    router.push('/lectures');
  };

  // Don't render if no lectures
  if (!isLoading && lectures.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 } }}>
        {/* Section Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: '#022C43',
              mb: 1
            }}
          >
            Ostali dersovi
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Pogledajte ostala dostupna predavanja
          </Typography>
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 350px))',
                gap: 3,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {lectures.map((lecture) => (
                <UniversalCard key={lecture._id} data={lecture} />
              ))}
            </Box>

            {/* View All Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
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

        {/* Empty State */}
        {!isLoading && !error && lectures.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nema drugih dostupnih predavanja
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trenutno je ovo jedino dostupno predavanje.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RelatedLecturesSimple;