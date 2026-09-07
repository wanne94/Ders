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

  // Sortiramo predavanja (backend model više nema status polje - sva predavanja su javna)
  const sortedLectures = sortLecturesByStatus(lectures);

  // Primenjujemo limit ako je potrebno
  const displayLectures = limit ? sortedLectures.slice(0, limit) : sortedLectures;

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
            gap={1.5}
            sx={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {displayLectures.map((lecture) => {
              return (
                <UniversalCard
                  key={lecture._id}
                  data={{ ...lecture, type: 'Predavanje' }}
                />
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
