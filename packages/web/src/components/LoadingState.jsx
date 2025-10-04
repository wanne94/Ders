import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingState = ({ label = 'Učitavanje...' }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 2,
    }}
  >
    <CircularProgress size={32} thickness={4} />
    <Typography variant="body1" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default LoadingState;
