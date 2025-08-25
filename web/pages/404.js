import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Grid,
} from '@mui/material';
import {
    Home as HomeIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import PageLayout from '@/components/PageLayout';

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSearch = () => {
    router.push('/lectures');
  };

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          {/* 404 Hero Section */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '6rem', md: '8rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              404
            </Typography>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: '#022C43',
                mb: 2
              }}
            >
              Stranica nije pronađena
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Izvinjavamo se, ali stranica koju tražite ne postoji ili je premještena.
              <br />
              Možda je link zastario ili ste ukucali pogrešnu adresu.
            </Typography>
          </Box>

          {/* Illustration/Icon */}
          <Box sx={{ mb: 6 }}>
            <Paper
              elevation={0}
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                border: '3px solid #022C43',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(2, 44, 67, 0.1) 0%, rgba(5, 90, 135, 0.1) 100%)',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 0.3,
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      opacity: 0.1,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 0.3,
                    },
                  },
                  animation: 'pulse 2s infinite'
                }
              }}
            >
              <SearchIcon 
                sx={{ 
                  fontSize: 80, 
                  color: '#022C43',
                  opacity: 0.7,
                  zIndex: 1
                }} 
              />
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                fullWidth
                sx={{
                  backgroundColor: '#022C43',
                  color: 'white',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(2, 44, 67, 0.3)',
                  '&:hover': {
                    backgroundColor: '#055A87',
                    boxShadow: '0 6px 20px rgba(2, 44, 67, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Početna stranica
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                fullWidth
                sx={{
                  borderColor: '#022C43',
                  color: '#022C43',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#055A87',
                    backgroundColor: 'rgba(2, 44, 67, 0.05)',
                    borderWidth: 2
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Pretraži dersove
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="text"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                fullWidth
                sx={{
                  color: '#666',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    color: '#022C43'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Idi nazad
              </Button>
            </Grid>
          </Grid>

         
        </Box>
      </Container>


    </PageLayout>
  );
}