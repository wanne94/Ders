import React from 'react';
import { Grid } from '@mui/material';
import SkeletonCard from './SkeletonCard';

const SkeletonGrid = React.memo(({ 
  count = 6, 
  type = 'lecture',
  gridProps = {}
}) => {
  return (
    <Grid 
      container 
      spacing={2} 
      {...gridProps}
      sx={{
        animation: 'slideUp 0.4s ease-out',
        '@keyframes slideUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        ...gridProps.sx
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          key={index}
          sx={{
            animationDelay: `${index * 0.05}s`,
            animation: 'fadeIn 0.5s ease-in-out',
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
          <SkeletonCard type={type} />
        </Grid>
      ))}
    </Grid>
  );
});

SkeletonGrid.displayName = 'SkeletonGrid';

export default SkeletonGrid;