import Head from 'next/head';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Using Bosnian locale
import { bs } from 'date-fns/locale';
import theme from '@/config/theme';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
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