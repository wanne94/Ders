import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Image from 'next/image';

const DownloadAppSection = () => {
  return (
    <Box 
      sx={{ 
        width: '100%',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        py: 8,
        background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
        color: 'white',
        mt: 6,
        overflow: 'hidden',
        my: 1
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          mx: 'auto'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Preuzmi DERS mobilnu aplikaciju
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 4rem auto',
              lineHeight: 1.6
            }}
          >
            Pristup svim funkcijama DERS platforme u džepu - brže, lakše i uvijek dostupno
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              alignItems: 'flex-start'
            }}
          >
            {/* Google Play Button */}
            <Box
              component="a"
              href="https://play.google.com/store/apps/details?id=com.daije.mobile"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 180, md: 200 },
                  height: { xs: 54, md: 60 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image
                  src="/google-play-badge.png"
                  alt="Download on Google Play"
                  width={200}
                  height={60}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Box>
            
            {/* App Store Button - Disabled */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: 0.5,
                cursor: 'not-allowed'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 180, md: 200 },
                  height: { xs: 54, md: 60 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image
                  src="/app shore download.png"
                  alt="Download on App Store - Coming Soon"
                  width={200}
                  height={60}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}
              >
                Uskoro dostupno
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DownloadAppSection;