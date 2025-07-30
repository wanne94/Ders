import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import UniversalCard from './UniversalCard';
import SkeletonGrid from './SkeletonGrid';
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
  cardHeight = '240px' // Povećana default visina sa 200px na 240px
}) => {
  const router = useRouter();
  
  // Debug logging
  console.log('🔍 [LecturesSection] Raw lectures received:', lectures.length);
  const cancelledInRaw = lectures.filter(l => l.status === 'cancelled' || l.isCancelled);
  console.log('❌ [LecturesSection] Cancelled lectures in raw data:', cancelledInRaw.length);
  if (cancelledInRaw.length > 0) {
    console.log('❌ [LecturesSection] Sample cancelled lecture:', cancelledInRaw[0]);
  }
  
  // Filtriramo approved i cancelled predavanja
  const filteredLectures = lectures.filter(lecture => 
    lecture.status === 'approved' || lecture.status === 'cancelled'
  );
  console.log('✅ [LecturesSection] After filtering (approved + cancelled):', filteredLectures.length);
  
  // Sortiramo predavanja
  const sortedLectures = sortLecturesByStatus(filteredLectures);
  console.log('📊 [LecturesSection] After sorting:', sortedLectures.length);
  
  // Primenjujemo limit ako je potrebno
  const displayLectures = limit ? sortedLectures.slice(0, limit) : sortedLectures;
  console.log('📋 [LecturesSection] Final display lectures:', displayLectures.length);
  
  // Check if Diskriminacija lecture is in display
  const diskriminacija = displayLectures.find(l => l.title && l.title.includes('Diskriminacija žena'));
  if (diskriminacija) {
    console.log('✅ [LecturesSection] Diskriminacija lecture IS in display list!');
  } else {
    console.log('❌ [LecturesSection] Diskriminacija lecture NOT in display list');
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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2.5,
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            {displayLectures.map((lecture) => {
              // Debug weekly lecture before passing to UniversalCard
              if (lecture.title?.toLowerCase().includes('test')) {
                console.log('📌 LecturesSection passing to UniversalCard:', {
                  title: lecture.title,
                  isWeeklyLecture: lecture.isWeeklyLecture,
                  type: 'Predavanje'
                });
              }
              return (
                <Box 
                  key={lecture._id} 
                  sx={{ 
                    width: {
                      xs: '100%',
                      sm: 'calc(50% - 10px)',
                      md: 'calc(33.333% - 13.33px)',
                      lg: 'calc(25% - 15px)',
                      xl: 'calc(20% - 16px)'
                    },
                    height: cardHeight
                  }}
                >
                  <UniversalCard data={{ ...lecture, type: 'Predavanje' }} />
                </Box>
              );
            })}
          </Box>
          
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