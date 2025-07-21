import React from 'react';
import { Container } from '@mui/material';

const ContentContainer = ({ 
  children, 
  maxWidth = 1900,
  sx = {},
  ...props 
}) => {
  return (
    <Container 
      maxWidth={false}
      sx={{ 
        maxWidth: `${maxWidth}px`,
        px: { xs: 2, sm: 3, md: 4 },
        width: '100%',
        mx: 'auto',
        ...sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ContentContainer;