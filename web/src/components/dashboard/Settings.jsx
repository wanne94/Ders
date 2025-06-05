import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const Settings = ({ approvalSettings, setApprovalSettings }) => {
  const [localSettings, setLocalSettings] = useState(approvalSettings);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings when prop changes
  useEffect(() => {
    setLocalSettings(approvalSettings);
    setHasChanges(false);
  }, [approvalSettings]);

  const handleToggleChange = (key) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(approvalSettings));
  };

  const handleSaveChanges = () => {
    try {
      // Update the parent component's state (which will save to database)
      setApprovalSettings(localSettings);
      
      setHasChanges(false);
      setSnackbar({
        open: true,
        message: 'Postavke su uspješno spašene!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Greška pri spašavanju postavki.',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Postavke odobravanja
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upravlja da li se novi sadržaj automatski odobrava ili zahtijeva ručno odobravanje administratora.
      </Typography>

      {Object.entries(localSettings).map(([key, value]) => (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box>
            <Typography variant="body1" fontWeight="medium">
              Odobravanje {key === 'lecture' ? 'predavanja' : key === 'daija' ? 'daija' : 'udruženja'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value ? 'Automatsko odobravanje uključeno' : 'Zahtijeva ručno odobravanje'}
            </Typography>
          </Box>
          <Switch
            checked={value}
            onChange={() => handleToggleChange(key)}
            color="primary"
          />
        </Box>
      ))}

      {hasChanges && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="warning.dark">
            Imate nespašene promjene. Kliknite na "Spasi promjene" da ih sačuvate.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          disabled={!hasChanges}
          sx={{ px: 4, py: 1.5 }}
        >
          Spasi promjene
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 