import React from 'react';
import { Box, Container } from '@mui/material';
import Navigation from './Navigation';
import Footer from './Footer';

const PageLayout = ({ 
  children, 
  showNavigation = true, 
  showFooter = true, 
  maxWidth = 'xl',
  disableGutters = false,
  sx = {},
  containerSx = {},
  contentSx = {},
  ...props 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        ...sx 
      }}
      {...props}
    >
      {showNavigation && <Navigation />}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...contentSx
        }}
      >
        <Container 
          maxWidth={maxWidth}
          disableGutters={disableGutters}
          sx={{ 
            py: 0,
            px: { xs: 0.625 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: { xs: 'center', md: 'left' },
            width: '100%',
            ...containerSx
          }}
        >
          {children}
        </Container>
      </Box>
      
      {showFooter && <Footer />}
    </Box>
  );
};

export default PageLayout; 