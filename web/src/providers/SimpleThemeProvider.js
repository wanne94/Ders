import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a minimal theme that works with React 18
const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#022C43',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function SimpleThemeProvider({ children, theme = defaultTheme }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}