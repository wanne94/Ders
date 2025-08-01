import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Using Bosnian locale
import { bs } from 'date-fns/locale';
import theme from '@/config/theme';
import { initPageViewTracking, logEvent } from '@/services/analytics';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Initialize page view tracking
    initPageViewTracking();

    // Track route changes
    const handleRouteChange = (url) => {
      logEvent('page_view', {
        page_path: url,
        page_title: document.title
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Ders</title>
      </Head>
      <CssBaseline />
      <LocalizationProvider 
        dateAdapter={AdapterDateFns} 
        adapterLocale={bs}
        dateFormats={{ fullDate: 'EEEE, dd. MMMM yyyy.' }}
      >
        <Box sx={{ pt: '64px' }}>
          <Component {...pageProps} />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default MyApp; 