import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Switch,
    Button,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import axiosInstance from '../../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

const Settings = ({ approvalSettings, setApprovalSettings }) => {
  const [localSettings, setLocalSettings] = useState(approvalSettings);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cleanupDialog, setCleanupDialog] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const decoded = jwtDecode(token);
      return decoded.role === 'super_admin';
    } catch (error) {
      return false;
    }
  };

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

  const handleSaveChanges = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Update the parent component's state (which will save to database)
      await setApprovalSettings(localSettings);
      
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleCleanupDatabase = async () => {
    if (isCleaningUp) return;
    
    setIsCleaningUp(true);
    try {
      const response = await axiosInstance.post('/admin/cleanup-database');
      const results = response.data;
      
      setSnackbar({
        open: true,
        message: `Baza očišćena! Ukupno obrisano: ${results.summary.totalDeleted} stavki`,
        severity: 'success'
      });
      
      console.log('🧹 Database cleanup results:', results);
    } catch (error) {
      console.error('Error cleaning database:', error);
      setSnackbar({
        open: true,
        message: 'Greška pri čišćenju baze podataka.',
        severity: 'error'
      });
    } finally {
      setIsCleaningUp(false);
      setCleanupDialog(false);
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
            disabled={isSaving}
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
          disabled={!hasChanges || isSaving}
          sx={{ px: 4, py: 1.5 }}
        >
          {isSaving ? 'Spašavam...' : 'Spasi promjene'}
        </Button>
      </Box>

      {/* Database Cleanup Section (Super Admin only) */}
      {isSuperAdmin() && (
        <>
          <Divider sx={{ mt: 6, mb: 4 }} />
          
          <Typography variant="h6" gutterBottom color="error">
            Čišćenje baze podataka
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Briše sve daije, organizacije i predavanja koji nemaju valjan status (pending, approved, rejected).
            Ova akcija je nepovratna!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CleaningServicesIcon />}
              onClick={() => setCleanupDialog(true)}
              disabled={isCleaningUp}
              sx={{ px: 4, py: 1.5 }}
            >
              {isCleaningUp ? 'Čistim...' : 'Očisti bazu'}
            </Button>
          </Box>
        </>
      )}

      {/* Cleanup Confirmation Dialog */}
      <Dialog
        open={cleanupDialog}
        onClose={() => setCleanupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">
          Potvrda čišćenja baze
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Da li ste sigurni da želite da obršite sve nevalidne podatke iz baze?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Ova akcija će obrisati:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>Daije bez status-a ili sa nevalidnim status-om</li>
            <li>Organizacije bez status-a ili sa nevalidnim status-om</li>
            <li>Predavanja bez status-a ili sa nevalidnim status-om</li>
            <li>Predavanja koja referenciraju obrisane daije/organizacije</li>
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Ova akcija je nepovratna! Podaci će biti trajno obrisani.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialog(false)} disabled={isCleaningUp}>
            Otkaži
          </Button>
          <Button 
            onClick={handleCleanupDatabase} 
            color="error" 
            variant="contained"
            disabled={isCleaningUp}
          >
            {isCleaningUp ? 'Čistim...' : 'Potvrdi brisanje'}
          </Button>
        </DialogActions>
      </Dialog>

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