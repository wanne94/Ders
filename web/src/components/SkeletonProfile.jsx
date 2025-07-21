import React from 'react';
import {
  Box,
  Container,
  Grid,
  Skeleton,
  Paper,
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SkeletonProfile = React.memo(({ type = 'lecture' }) => {
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 4,
        animation: 'fadeIn 0.5s ease-in',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        }
      }}
    >
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          disabled
          sx={{ mb: 2 }}
        >
          <Skeleton variant="text" width={120} />
        </Button>
      </Box>

      {/* Hero Section Skeleton */}
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
            {/* Profile Image Skeleton */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: 150, sm: 200 },
                  mx: 'auto'
                }}
              >
                <Skeleton
                  variant={type === 'daija' ? 'circular' : 'rectangular'}
                  width="100%"
                  height={type === 'daija' ? 200 : 250}
                  sx={{
                    borderRadius: type === 'daija' ? '50%' : 4,
                    border: '6px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                />
              </Box>
            </Grid>

            {/* Profile Info Skeleton */}
            <Grid item xs={12} md={8}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {/* Title Skeleton */}
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: { xs: '2rem', md: '3rem' },
                    mb: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }}
                />

                {/* Meta Information Skeleton */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                  {/* Create different number of meta items based on type */}
                  {Array.from({ length: type === 'lecture' ? 5 : 3 }, (_, index) => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      width={index === 0 ? 140 : index === 1 ? 100 : 120}
                      height={40}
                      sx={{
                        borderRadius: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  ))}
                </Box>

                {/* Description Skeleton */}
                <Box sx={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 3,
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 2, sm: 2.5 },
                  mb: 3,
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                    <Skeleton variant="text" width={120} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                  </Box>
                  <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                  <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                  <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                </Box>

                {/* Social Media Links Skeleton (for organizations) */}
                {type === 'organization' && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {Array.from({ length: 2 }, (_, index) => (
                      <Skeleton
                        key={index}
                        variant="rectangular"
                        width={100}
                        height={40}
                        sx={{
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.2)'
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Action Buttons Skeleton */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={50}
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={50}
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Related Lectures Section Skeleton */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Section Title Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Skeleton variant="text" width={200} sx={{ fontSize: '2rem' }} />
            <Skeleton variant="text" width={100} sx={{ display: { xs: 'none', sm: 'block' } }} />
          </Box>

          {/* Lectures Grid Skeleton */}
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
            {Array.from({ length: 8 }, (_, index) => (
              <Box key={index} sx={{ height: '280px' }}>
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height="100%" 
                  sx={{ borderRadius: 2 }} 
                />
              </Box>
            ))}
          </Box>

          {/* Pagination Skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 2 }} />
          </Box>
        </Container>
      </Box>
    </Container>
  );
});

SkeletonProfile.displayName = 'SkeletonProfile';

export default SkeletonProfile;