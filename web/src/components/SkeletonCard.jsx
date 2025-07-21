import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Skeleton
} from '@mui/material';

const SkeletonCard = React.memo(({ type = 'lecture' }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        animation: 'pulse 1.5s ease-in-out infinite alternate',
        '@keyframes pulse': {
          '0%': {
            opacity: 0.6,
          },
          '100%': {
            opacity: 1,
          },
        }
      }}
    >
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Left side - Information skeleton */}
          <Box sx={{ flex: 1, pr: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* Title skeleton */}
            <Skeleton 
              variant="text" 
              sx={{ 
                fontSize: { xs: '16px', sm: '18px' },
                mb: 1,
                width: '80%'
              }}
            />
            
            {/* Second line of title for longer titles */}
            <Skeleton 
              variant="text" 
              sx={{ 
                fontSize: { xs: '16px', sm: '18px' },
                mb: 2,
                width: '60%'
              }}
            />

            {/* Info items skeleton */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* First info item */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" sx={{ fontSize: '13px', width: '70%' }} />
              </Box>
              
              {/* Second info item */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" sx={{ fontSize: '13px', width: '50%' }} />
              </Box>
              
              {/* Third info item - conditional based on type */}
              {type === 'lecture' && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" sx={{ fontSize: '13px', width: '60%' }} />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" sx={{ fontSize: '13px', width: '40%' }} />
                  </Box>
                </>
              )}
              
              {type === 'daija' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="text" sx={{ fontSize: '13px', width: '65%' }} />
                </Box>
              )}
            </Box>

          </Box>

          {/* Right side - Image skeleton */}
          <Box 
            sx={{
              width: { xs: '80px', sm: '100px' },
              height: '100%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Skeleton
              variant={type === 'daija' ? 'circular' : 'rectangular'}
              width={{ xs: 80, sm: 100 }}
              height={type === 'lecture' ? { xs: 110, sm: 130 } : { xs: 80, sm: 100 }}
              sx={{
                borderRadius: type === 'daija' ? '50%' : '8px'
              }}
            />
          </Box>

        </Box>
      </CardContent>
      
      {/* Status badge skeleton for lectures */}
      {type === 'lecture' && (
        <Skeleton
          variant="rounded"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 80,
            height: 24,
            borderRadius: '12px'
          }}
        />
      )}
    </Card>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;