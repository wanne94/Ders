import React from 'react';
import Head from 'next/head';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Using default English (US) locale
import theme from '@/config/theme';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Ders</title>
      </Head>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} dateFormats={{ fullDate: 'EEEE, MMMM dd, yyyy' }}>
        <Box sx={{ pt: '64px' }}>
          <Component {...pageProps} />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default MyApp; 