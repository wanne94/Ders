import React from 'react';
import { Box, Typography } from '@mui/material';

const CancelledOverlay = ({ 
  show = false, 
  text = 'OTKAZANO',
  variant = 'diagonal' // 'diagonal' or 'full'
}) => {
  if (!show) return null;

  const diagonalStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: 'none',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '200%',
      height: '40px',
      backgroundColor: '#f44336', // Material red
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      transformOrigin: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      zIndex: 1
    },
    '&::after': {
      content: `"${text}"`,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      letterSpacing: '1.5px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      zIndex: 2,
      whiteSpace: 'nowrap',
      '@media (max-width: 600px)': {
        fontSize: '12px',
        letterSpacing: '1px'
      },
      '@media (max-width: 400px)': {
        fontSize: '11px',
        letterSpacing: '0.5px'
      }
    }
  };

  const fullOverlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    pointerEvents: 'none'
  };

  return (
    <Box
      sx={variant === 'diagonal' ? diagonalStyles : fullOverlayStyles}
      role="img"
      aria-label={`Predavanje je ${text.toLowerCase()}`}
    >
      {variant === 'full' && (
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontSize: {
              xs: '0.875rem',
              sm: '1rem',
              md: '1.25rem'
            }
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default CancelledOverlay;