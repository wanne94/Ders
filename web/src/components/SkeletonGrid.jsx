import React from 'react';
import { Box } from '@mui/material';
import SkeletonCard from './SkeletonCard';

const SkeletonGrid = React.memo(({
  count = 6,
  type = 'lecture',
  gridProps = {}
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
        width: '100%',
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
      {...gridProps}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          sx={{
            width: '320px',
            height: '240px',
            flexShrink: 0,
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
        </Box>
      ))}
    </Box>
  );
});

SkeletonGrid.displayName = 'SkeletonGrid';

export default SkeletonGrid;