import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CssBaseline, Box, Snackbar, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Using Bosnian locale
import { bs } from 'date-fns/locale';
import theme from '@/config/theme';
import { initPageViewTracking, logEvent } from '@/services/analytics';
import tokenManager from '@/services/tokenManager';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authAlert, setAuthAlert] = useState({ open: false, message: '' });

  useEffect(() => {
    // Initialize page view tracking
    initPageViewTracking();

    // Pokreni Token Manager (optimizovan za performanse)
    tokenManager.startTokenCheck();

    // Slušaj auth eventi
    const handleAuthRequired = (event) => {
      setAuthAlert({
        open: true,
        message: event.detail.message || 'Molimo prijavite se ponovo.'
      });
      
      // Sačuvaj trenutnu rutu i preusmjeri na login nakon 2 sekunde
      setTimeout(() => {
        const returnUrl = event.detail.returnUrl || '/';
        router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      }, 2000);
    };

    const handleTokenExpiringSoon = () => {
      setAuthAlert({
        open: true,
        message: 'Vaša sesija uskoro ističe. Molimo sačuvajte svoj rad.'
      });
    };

    window.addEventListener('authRequired', handleAuthRequired);
    window.addEventListener('tokenExpiringSoon', handleTokenExpiringSoon);

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
      window.removeEventListener('authRequired', handleAuthRequired);
      window.removeEventListener('tokenExpiringSoon', handleTokenExpiringSoon);
      tokenManager.stopTokenCheck();
    };
  }, [router]);
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Ders</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-2PXHZSFM8R"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2PXHZSFM8R');
        `}
      </Script>

      <CssBaseline />
      <LocalizationProvider 
        dateAdapter={AdapterDateFns} 
        adapterLocale={bs}
        dateFormats={{ fullDate: 'EEEE, dd. MMMM yyyy.' }}
      >
        <Box sx={{ pt: '64px' }}>
          <Component {...pageProps} />
        </Box>
        
        {/* Auth Alert Snackbar */}
        <Snackbar
          open={authAlert.open}
          autoHideDuration={6000}
          onClose={() => setAuthAlert({ ...authAlert, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setAuthAlert({ ...authAlert, open: false })}
            severity="warning"
            sx={{ width: '100%' }}
          >
            {authAlert.message}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default MyApp; 