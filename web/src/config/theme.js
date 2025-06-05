import { createTheme } from '@mui/material/styles';
import { BRAND_COLORS, COLOR_USAGE } from './colors';

const theme = createTheme({
  palette: {
    primary: {
      main: BRAND_COLORS.primary,
      light: BRAND_COLORS.primaryLight,
      dark: BRAND_COLORS.primaryDark,
      contrastText: BRAND_COLORS.text.onPrimary,
    },
    secondary: {
      main: BRAND_COLORS.secondary,
      light: BRAND_COLORS.secondaryLight,
      dark: BRAND_COLORS.secondaryDark,
      contrastText: BRAND_COLORS.text.onSecondary,
    },
    background: {
      default: BRAND_COLORS.background.default,
      paper: BRAND_COLORS.background.paper,
    },
    text: {
      primary: BRAND_COLORS.text.primary,
      secondary: BRAND_COLORS.text.secondary,
      disabled: BRAND_COLORS.text.disabled,
    },
    success: {
      main: BRAND_COLORS.status.success,
    },
    warning: {
      main: BRAND_COLORS.status.warning,
    },
    error: {
      main: BRAND_COLORS.status.error,
    },
    info: {
      main: BRAND_COLORS.status.info,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Povećani fontovi za mobilne uređaje
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2.2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.6rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.4rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.2rem',
      },
    },
    h6: {
      fontSize: '1.125rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
  },
  components: {
    // Standardizovani stilovi za naslove
    MuiTypography: {
      styleOverrides: {
        root: {
          // Standardni stilovi za naslove predavanja, imena daija i udruženja
          '&.title-standard': {
            textTransform: 'uppercase',
            color: BRAND_COLORS.primary,
            fontWeight: 'bold',
          },
          '&.title-lecture': {
            textTransform: 'uppercase',
            color: BRAND_COLORS.primary,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            '@media (max-width:600px)': {
              fontSize: '1.1rem',
            },
          },
          '&.title-daija': {
            textTransform: 'uppercase',
            color: BRAND_COLORS.primary,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            '@media (max-width:600px)': {
              fontSize: '1.1rem',
            },
          },
          '&.title-organization': {
            textTransform: 'uppercase',
            color: BRAND_COLORS.primary,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            '@media (max-width:600px)': {
              fontSize: '1.1rem',
            },
          },
        },
      },
    },
  },
});

export default theme; 