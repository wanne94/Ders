import React, { useState, useEffect } from 'react';
import {
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ReportProblem as ReportIcon
} from '@mui/icons-material';
import { useAuthCheck } from '../utils/useAuthCheck';
import CancellationReportForm from './CancellationReportForm';
import api, { setTokenExpirationCallback, clearTokenExpirationCallback } from '../utils/axiosConfig';

const CancellationReportButton = ({ 
  lectureId, 
  lectureTitle = '',
  isAlreadyCancelled = false,
  onReportSuccess,
  variant = 'contained',
  size = 'medium',
  fullWidth = false
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { isLoggedIn, isValidatingToken } = useAuthCheck();

  // Set up token expiration callback
  useEffect(() => {
    const handleTokenExpiration = (error) => {
      setSnackbar({
        open: true,
        message: 'Vaša sesija je istekla. Prijavite se ponovo da biste nastavili.',
        severity: 'warning'
      });
      
      // Close form if open
      setFormOpen(false);
      setLoading(false);
      
      // Just show a message, no auth prompt needed
    };

    setTokenExpirationCallback(handleTokenExpiration);

    return () => {
      clearTokenExpirationCallback();
    };
  }, []);

  const handleReportClick = () => {
    if (isAlreadyCancelled) {
      setSnackbar({
        open: true,
        message: 'Ovo predavanje je već otkazano.',
        severity: 'info'
      });
      return;
    }

    // Wait for token validation to complete before proceeding
    if (isValidatingToken) {
      setSnackbar({
        open: true,
        message: 'Proverava se autentifikacija...',
        severity: 'info'
      });
      return;
    }

    // Direct open form - no authentication required anymore
    // Both authenticated and guest users can report cancellations
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!lectureId) {
      setSnackbar({
        open: true,
        message: 'Greška: ID predavanja nije valjan.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Send form data with cancellation report
      const response = await api.post(`/lectures/${lectureId}/report-cancellation`, {
        reason: formData.reason,
        howFound: formData.howFound,
        additionalInfo: formData.additionalInfo
      });
      
      setSnackbar({
        open: true,
        message: response.data.message || 'Prijava je uspješno poslana.',
        severity: 'success'
      });

      // Call callback if provided
      if (onReportSuccess) {
        onReportSuccess(response.data);
      }

      setFormOpen(false);

    } catch (error) {
      let errorMessage = 'Greška pri slanju prijave otkazivanja.';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Vaša sesija je istekla. Molimo prijavite se ponovo.';
        // Token expiration will be handled by axios interceptor callback
        // No need to manually trigger auth prompt here
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Zahtev je prekoračio vreme - server je možda spor.';
      } else if (!error.response) {
        errorMessage = 'Nema konekcije sa serverom. Proverite internet konekciju.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Don't render button if lecture is already cancelled
  if (isAlreadyCancelled) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleReportClick}
        startIcon={<ReportIcon />}
        sx={{
          backgroundColor: variant === 'contained' ? '#ff9800' : 'transparent',
          color: variant === 'contained' ? 'white' : '#ff9800',
          borderColor: '#ff9800',
          '&:hover': {
            backgroundColor: variant === 'contained' ? '#f57c00' : 'rgba(255, 152, 0, 0.08)',
            borderColor: '#f57c00'
          },
          '&:disabled': {
            backgroundColor: '#cccccc',
            color: '#666666'
          }
        }}
        disabled={loading}
      >
        {loading ? 'Slanje...' : 'Prijavi otkazivanje'}
      </Button>

      {/* Cancellation Report Form */}
      <CancellationReportForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        lectureId={lectureId}
        lectureTitle={lectureTitle}
        onSubmitSuccess={handleFormSubmit}
        loading={loading}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </>
  );
};

export default CancellationReportButton;