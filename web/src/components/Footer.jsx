import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import ContentContainer from './ContentContainer';
import {
  Home as HomeIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import LogoCircle from './LogoCircle';


const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { name: 'Početna', path: '/', icon: <HomeIcon /> },
    { name: 'Dersovi', path: '/lectures', icon: <EventIcon /> },
    { name: 'Daije', path: '/daije', icon: <PersonIcon /> },
    { name: 'Udruženja', path: '/organizations', icon: <BusinessIcon /> }
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 6
      }}
    >
      <ContentContainer>
        <Grid container spacing={4}>
          {/* Logo i opis */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 0 }}>
              <LogoCircle />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              DERS
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.8, fontSize: 20 }}>
              Digitalna platforma za promociju islamskih predavanja
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, fontSize: 18 }}>
              Ova platforma promoviše isključivo stvari koje su u skladu sa razumjevanjem islama poput prvih generacija u islamu.
            </Typography>
          </Grid>

          {/* Navigacija */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Navigacija
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  component="button"
                  variant="body2"
                  onClick={() => handleNavigation(link.path)}
                  sx={{
                    fontSize: 16,
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    opacity: 0.8,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    padding: 0,
                    '&:hover': {
                      opacity: 1,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Informacije */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: 20 }}>
              Kontakt
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: 18 }}>
                  info@ders.ba
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: 18 }}>
                  062 092 827
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Linkovi */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Pratite nas
            </Typography>
            <Box sx={{ display: 'flex', gap: 0 }}>
              <IconButton
                component="a"
                href="https://www.facebook.com/profile.php?id=61561889404089"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white', 
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } 
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://www.instagram.com/ders_ba/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'white', 
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } 
                }}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Divider i Copyright */}
        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {currentYear} DERS. Sva prava zadržana.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => handleNavigation('/privacy-policy')}
              sx={{
                color: 'white',
                opacity: 0.7,
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                padding: 0,
                '&:hover': {
                  opacity: 1,
                  textDecoration: 'underline'
                }
              }}
            >
              Politika privatnosti
            </Link>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Napravljeno da koristi muslimanima.
            </Typography>
          </Box>
        </Box>
      </ContentContainer>
    </Box>
  );
};

export default Footer; 