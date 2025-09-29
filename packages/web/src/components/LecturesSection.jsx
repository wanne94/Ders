import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import UniversalCard from './UniversalCard';
import SkeletonGrid from './SkeletonGrid';
import { LecturesGrid } from './GridLayout';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';

const LecturesSection = ({ 
  lectures = [], 
  isLoading = false,
  limit = null,
  title = 'Dersovi',
  subtitle = null,
  showViewAllButton = false,
  viewAllButtonText = 'Prikaži sve dersove',
  viewAllPath = '/lectures',
  emptyMessage = 'Trenutno nema dostupnih dersova.',
  cardHeight = '240px' // Fiksna visina kartice
}) => {
  const router = useRouter();
  
  // Debug logging
  const cancelledInRaw = lectures.filter(l => l.status === 'cancelled' || l.isCancelled);
  if (cancelledInRaw.length > 0) {
  }
  
  // Filtriramo approved i cancelled predavanja
  const filteredLectures = lectures.filter(lecture => 
    lecture.status === 'approved' || lecture.status === 'cancelled'
  );
  
  // Sortiramo predavanja
  const sortedLectures = sortLecturesByStatus(filteredLectures);
  
  // Primenjujemo limit ako je potrebno
  const displayLectures = limit ? sortedLectures.slice(0, limit) : sortedLectures;
  
  // Check if Diskriminacija lecture is in display
  const diskriminacija = displayLectures.find(l => l.title && l.title.includes('Diskriminacija žena'));
  if (diskriminacija) {
  } else {
  }

  const handleViewAll = () => {
    router.push(viewAllPath);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1, textAlign: 'center' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="p" component="p" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
            {subtitle}
          </Typography>
        )}
        <SkeletonGrid count={limit || 6} type="lecture" />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}

      {displayLectures.length === 0 ? (
        <Alert severity="info" sx={{ justifyContent: 'center' }}>
          {emptyMessage}
        </Alert>
      ) : (
        <>
          <LecturesGrid
            gap={3}
            sx={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {displayLectures.map((lecture) => {
              return (
                <Box
                  key={lecture._id}
                  sx={{
                    height: '240px',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <UniversalCard data={{ ...lecture, type: 'Predavanje' }} />
                </Box>
              );
            })}
          </LecturesGrid>
          
          {showViewAllButton && sortedLectures.length > displayLectures.length && (
            <Box sx={{ mt: 4, mb: 0 }}>
              <Button 
                variant="outlined" 
                size="large"
                onClick={handleViewAll}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {viewAllButtonText}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LecturesSection;