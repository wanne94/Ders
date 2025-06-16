import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import PageLayout from '@/components/PageLayout';
import { getToken, getUserData } from '@/utils/authHelpers';
import usersService from '@/services/usersService';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Form states
  const [emailForm, setEmailForm] = useState({ email: '', currentPassword: '' });
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    enabled: true,
    newLectures: true
  });
  const [originalNotificationPreferences, setOriginalNotificationPreferences] = useState({
    enabled: true,
    newLectures: true
  });
  const [notificationPreferencesChanged, setNotificationPreferencesChanged] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/auth');
      return;
    }
    
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = getUserData();
      if (userData) {
        setUser(userData);
        setEmailForm({ email: userData.email || '', currentPassword: '' });
      }
      
      // Load notification preferences
      const prefsResponse = await usersService.getNotificationPreferences();
      if (prefsResponse.success) {
        setNotificationPreferences(prefsResponse.preferences);
        setOriginalNotificationPreferences(prefsResponse.preferences);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Greška pri učitavanju profila.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!emailForm.email || !emailForm.currentPassword) {
      setError('Email i trenutna lozinka su obavezni.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await usersService.updateProfile({
        email: emailForm.email,
        currentPassword: emailForm.currentPassword
      });

      if (response.success) {
        setSuccess('Email je uspješno ažuriran.');
        setUser(response.user);
        setEmailDialogOpen(false);
        setEmailForm({ email: response.user.email, currentPassword: '' });
      } else {
        setError(response.message || 'Greška pri ažuriranju email-a.');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      setError('Greška pri ažuriranju email-a.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Sva polja su obavezna.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Nova lozinka i potvrda se ne slažu.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Nova lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await usersService.changePassword(passwordForm);

      if (response.success) {
        setSuccess('Lozinka je uspješno promijenjena.');
        setPasswordDialogOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(response.message || 'Greška pri promjeni lozinke.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Greška pri promjeni lozinke.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotificationChange = (field, value) => {
    const newPreferences = { ...notificationPreferences, [field]: value };
    setNotificationPreferences(newPreferences);
    
    // Check if preferences have changed from original
    const hasChanged = JSON.stringify(newPreferences) !== JSON.stringify(originalNotificationPreferences);
    setNotificationPreferencesChanged(hasChanged);
  };

  const handleNotificationSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const response = await usersService.updateNotificationPreferences(notificationPreferences);
      if (response.success) {
        setSuccess('Notification preferences ažurirane.');
        setOriginalNotificationPreferences(notificationPreferences);
        setNotificationPreferencesChanged(false);
      } else {
        setError('Greška pri ažuriranju notification preferences.');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setError('Greška pri ažuriranju notification preferences.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotificationReset = () => {
    setNotificationPreferences(originalNotificationPreferences);
    setNotificationPreferencesChanged(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'user': return 'Korisnik';
      default: return role;
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {user?.username}
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Chip 
                  label={getRoleLabel(user?.role)} 
                  color={getRoleColor(user?.role)}
                  size="small"
                />
                <Chip 
                  label={`RID: ${user?.rid}`} 
                  variant="outlined"
                  size="small"
                  icon={<BadgeIcon />}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <PersonIcon />
                  Osnovne informacije
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Email adresa
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1">
                      {user?.email || 'Nije postavljen'}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setEmailDialogOpen(true)}
                    >
                      Promijeni
                    </Button>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Lozinka
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1">
                      ••••••••
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<LockIcon />}
                      onClick={() => setPasswordDialogOpen(true)}
                    >
                      Promijeni
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Član od
                  </Typography>
                  <Typography variant="body1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('sr-RS') : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <NotificationsIcon />
                  Notifikacije
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationPreferences.enabled}
                        onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
                      />
                    }
                    label="Omogući notifikacije"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationPreferences.newLectures}
                        onChange={(e) => handleNotificationChange('newLectures', e.target.checked)}
                        disabled={!notificationPreferences.enabled}
                      />
                    }
                    label="Nova predavanja"
                  />
                </FormGroup>
                
                {notificationPreferencesChanged && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleNotificationReset}
                      disabled={submitting}
                    >
                      Poništi
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleNotificationSubmit}
                      disabled={submitting}
                    >
                      {submitting ? <CircularProgress size={16} /> : 'Sačuvaj'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Email Change Dialog */}
        <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Promjena email adrese</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nova email adresa"
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              label="Trenutna lozinka"
              type="password"
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
              helperText="Potrebna je trenutna lozinka za potvrdu promjene"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailDialogOpen(false)}>Otkaži</Button>
            <Button 
              onClick={handleEmailUpdate} 
              variant="contained"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Sačuvaj'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Promjena lozinke</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Trenutna lozinka"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              label="Nova lozinka"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Najmanje 6 karaktera"
            />
            <TextField
              fullWidth
              label="Potvrdi novu lozinku"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Otkaži</Button>
            <Button 
              onClick={handlePasswordChange} 
              variant="contained"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Promijeni'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default ProfilePage;