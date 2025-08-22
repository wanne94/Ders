import React from 'react';
import { Box, Skeleton, Card, CardContent, Stack, Grid } from '@mui/material';

const LoadingSkeleton = ({ type = 'list', count = 5 }) => {
  const renderListItem = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
          <Box flex={1}>
            <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} mt={2}>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 10 }} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 10 }} />
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderCardItem = () => (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Skeleton variant="rectangular" width="45%" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="45%" height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderTableRow = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        gap: 2
      }}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Box flex={1}>
        <Skeleton variant="text" width="30%" height={20} />
      </Box>
      <Skeleton variant="text" width="15%" height={20} />
      <Skeleton variant="text" width="15%" height={20} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
    </Box>
  );

  const renderStatsSkeleton = () => (
    <Card>
      <CardContent>
        <Box textAlign="center" mb={3}>
          <Skeleton variant="text" width="60%" height={32} sx={{ margin: '0 auto', mb: 1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ margin: '0 auto' }} />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" height={200} mb={3}>
          {[...Array(12)].map((_, index) => (
            <Box key={index} width="7%" display="flex" flexDirection="column" alignItems="center">
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={Math.random() * 150 + 50}
                sx={{ mb: 1 }}
              />
              <Skeleton variant="text" width="100%" height={16} />
            </Box>
          ))}
        </Box>
        
        <Box textAlign="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ margin: '0 auto', borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderDetailsSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={300} />
      <CardContent>
        <Skeleton variant="text" width="75%" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={24} sx={{ mb: 3 }} />
        
        <Stack spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Box key={index}>
              <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={20} />
            </Box>
          ))}
        </Stack>
        
        <Stack direction="row" spacing={2} mt={4}>
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Grid container spacing={3}>
            {[...Array(count)].map((_, index) => (
              <React.Fragment key={index}>
                {renderCardItem()}
              </React.Fragment>
            ))}
          </Grid>
        );
      
      case 'table':
        return (
          <Card>
            {[...Array(count)].map((_, index) => (
              <React.Fragment key={index}>
                {renderTableRow()}
              </React.Fragment>
            ))}
          </Card>
        );
      
      case 'stats':
        return renderStatsSkeleton();
      
      case 'details':
        return renderDetailsSkeleton();
      
      case 'list':
      default:
        return (
          <>
            {[...Array(count)].map((_, index) => (
              <React.Fragment key={index}>
                {renderListItem()}
              </React.Fragment>
            ))}
          </>
        );
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {renderSkeleton()}
    </Box>
  );
};

export default LoadingSkeleton;