import { useState, useEffect } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Stack,
    Snackbar
} from '@mui/material';
import { useRouter } from 'next/router';
import PageLayout from '@/components/PageLayout';
import axiosInstance from '@/utils/axiosConfig';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { SECURITY_QUESTIONS, getQuestionByIndex } from '@/data/securityQuestions';
import {
    getRememberedCredentials,
    setRememberedCredentials,
    clearRememberedCredentials,
    setToken,
    setUserData,
} from '@/utils/authHelpers';
import { logAuth } from '@/services/analytics';

const Authentication = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loginData, setLoginData] = useState({ 
    email: '',
    password: '' 
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestionIndex: '',
    securityAnswer: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    securityAnswer: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: security question, 3: new password
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // Function to show snackbar notifications
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Function to close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Load remembered credentials on component mount
  useEffect(() => {
    const { email } = getRememberedCredentials();
    
    if (email) {
      setLoginData(prev => ({ ...prev, email }));
      setRememberMe(true);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
    // Reset forgot password state when switching tabs
    if (newValue !== 2) {
      setForgotPasswordStep(1);
      setForgotPasswordData({
        email: '',
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setSecurityQuestion('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Detaljana validacija
    const errors = [];
    
    if (!loginData.email || !loginData.email.trim()) {
      errors.push('Email ili korisničko ime je obavezno');
    }

    if (errors.length > 0) {
      const errorMessage = 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/auth', {
        identifier: loginData.email.trim(),
        password: loginData.password
      });

      const { token, user } = response.data;

      // Store auth data
      console.log('🔑 AUTH: Setting token and user data');
      console.log('🔑 AUTH: Token:', token);
      console.log('🔑 AUTH: User:', user);
      setToken(token);
      setUserData(user);
      console.log('🔑 AUTH: Token and user data set successfully');

      // Handle remember me
      if (rememberMe) {
        setRememberedCredentials(loginData.email);
      } else {
        clearRememberedCredentials();
      }

      // Show success notification
      showNotification(`Dobrodošli, ${user.username}!`, 'success');
      
      // Log successful login
      logAuth('email', false);

      // Redirect based on user role
      if (['moderator', 'admin', 'super_admin'].includes(user.role)) {
        console.log('🔑 AUTH: Admin/Moderator user, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('🔑 AUTH: Regular user, redirecting to home');
        router.push('/');
      }
    } catch (err) {
      let errorMessage = 'Greška pri prijavi';
      
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Neispravni podaci za prijavu';
      } else if (err.response?.status === 401) {
        errorMessage = 'Pogrešan email/korisničko ime ili lozinka';
      } else if (err.response?.status === 404) {
        errorMessage = 'Korisnik sa ovim emailom/korisničkim imenom nije pronađen';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Greška na serveru. Molimo pokušajte ponovo.';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Detaljana validacija
    const errors = [];
    
    if (!registerData.username || !registerData.username.trim()) {
      errors.push('Username je obavezno');
    } else if (registerData.username.trim().length < 2) {
      errors.push('Username mora imati najmanje 2 karaktera');
    } else if (!/^[a-zA-Z0-9]+$/.test(registerData.username.trim())) {
      errors.push('Username može sadržavati samo slova i brojeve');
    }
    
    if (registerData.email && registerData.email.trim() && !/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.push('Email format nije ispravan');
    }
    
    if (!registerData.password || !registerData.password.trim()) {
      errors.push('Lozinka je obavezna');
    } else if (registerData.password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }
    
    if (!registerData.confirmPassword || !registerData.confirmPassword.trim()) {
      errors.push('Potvrda lozinke je obavezna');
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.push('Lozinke se ne podudaraju');
    }
    
    if (registerData.securityQuestionIndex === '' || registerData.securityQuestionIndex === null || registerData.securityQuestionIndex === undefined) {
      errors.push('Sigurnosno pitanje je obavezno');
    }
    
    if (!registerData.securityAnswer || !registerData.securityAnswer.trim()) {
      errors.push('Odgovor na sigurnosno pitanje je obavezan');
    } else if (registerData.securityAnswer.trim().length < 2) {
      errors.push('Odgovor na sigurnosno pitanje mora imati najmanje 2 karaktera');
    }

    if (errors.length > 0) {
      const errorMessage = 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: registerData.username.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        securityQuestionIndex: parseInt(registerData.securityQuestionIndex),
        securityAnswer: registerData.securityAnswer.trim()
      };

      const response = await axiosInstance.post('/users/register', registrationData);

      // Provjeri da li je registracija uspješna
      if (response.data.success) {
        // Automatski login nakon registracije
        setToken(response.data.token);
        setUserData(response.data.user);
        // Postavi flag u localStorage za prikaz poruke na početnoj
        if (typeof window !== 'undefined') {
          localStorage.setItem('registrationSuccess', 'true');
        }
        // Log successful registration
        logAuth('email', true);
        router.push('/');
        // Ne prikazuj poruku ovdje, već na početnoj
      } else {
        setError(response.data.message || 'Greška pri registraciji');
        showNotification(response.data.message || 'Greška pri registraciji', 'error');
      }
    } catch (err) {
      let errorMessage = 'Greška pri registraciji';
      
      if (err.response?.status === 400) {
        if (err.response?.data?.message?.includes('email')) {
          errorMessage = 'Korisnik sa ovim emailom već postoji';
        } else if (err.response?.data?.message?.includes('username')) {
          errorMessage = 'Korisnik sa ovim korisničkim imenom već postoji';
        } else {
          errorMessage = err.response?.data?.message || 'Neispravni podaci za registraciju';
        }
      } else if (err.response?.status === 409) {
        errorMessage = 'Korisnik sa ovim emailom već postoji';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Greška na serveru. Molimo pokušajte ponovo.';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Detaljana validacija
    const errors = [];
    
    if (!forgotPasswordData.email || !forgotPasswordData.email.trim()) {
      errors.push('Email ili korisničko ime je obavezno');
    }

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      setIsLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post('/users/forgot-password/verify-email', {
        email: forgotPasswordData.email.trim()
      });
      
      setSecurityQuestion(getQuestionByIndex(res.data.securityQuestionIndex));
      setForgotPasswordStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Greška pri pronalaženju korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordStep2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Detaljana validacija
    const errors = [];
    
    if (!forgotPasswordData.securityAnswer || !forgotPasswordData.securityAnswer.trim()) {
      errors.push('Odgovor na sigurnosno pitanje je obavezan');
    } else if (forgotPasswordData.securityAnswer.trim().length < 1) {
      errors.push('Odgovor mora imati najmanje 1 karakter');
    }

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/users/forgot-password/verify-answer', {
        email: forgotPasswordData.email,
        securityAnswer: forgotPasswordData.securityAnswer
      });
      
      setForgotPasswordStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Netačan odgovor na sigurnosno pitanje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordStep3 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Detaljana validacija
    const errors = [];
    
    if (!forgotPasswordData.newPassword || !forgotPasswordData.newPassword.trim()) {
      errors.push('Nova šifra je obavezna');
    }
    
    if (!forgotPasswordData.confirmNewPassword || !forgotPasswordData.confirmNewPassword.trim()) {
      errors.push('Potvrda nove šifre je obavezna');
    }
    
    if (forgotPasswordData.newPassword && forgotPasswordData.confirmNewPassword && forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      errors.push('Šifre se ne podudaraju');
    }

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      setIsLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      setError('Šifre se ne podudaraju');
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/users/forgot-password/reset', {
        email: forgotPasswordData.email,
        newPassword: forgotPasswordData.newPassword
      });
      
      setSuccess('Šifra je uspješno resetovana! Možete se prijaviti sa novom lozinkom.');
      setActiveTab(0); // Switch to l tab
      setForgotPasswordStep(1);
      setForgotPasswordData({
        email: '',
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setSecurityQuestion('');
    } catch (error) {
      setError(error.response?.data?.message || 'Greška pri resetovanju lozinke');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPasswordForm = () => {
    if (forgotPasswordStep === 1) {
      return (
        <Box component="form" onSubmit={handleForgotPasswordStep1} sx={{ width: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Unesite vaš email ili korisničko ime
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              sx={{ maxWidth: '100%' }}
              label="Email ili Korisničko ime"
              name="email"
              type="text"
              value={forgotPasswordData.email}
              onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
              disabled={isLoading}
              placeholder="Unesite email ili korisničko ime"
            />
            
            {/* Button Container with Flex */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              width: '100%',
              mt: 3 
            }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  maxWidth: '100%',
                  minHeight: 48,
                  flex: '1 1 auto'
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Nastavi'}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ 
                  maxWidth: '100%',
                  minHeight: 40,
                  flex: '1 1 auto'
                }}
                onClick={() => setActiveTab(0)}
              >
                Nazad na prijavu
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }

    if (forgotPasswordStep === 2) {
      return (
        <Box component="form" onSubmit={handleForgotPasswordStep2} sx={{ width: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Odgovorite na sigurnosno pitanje
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
              {securityQuestion}
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              sx={{ maxWidth: '100%' }}
              label="Vaš odgovor"
              name="securityAnswer"
              value={forgotPasswordData.securityAnswer}
              onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, securityAnswer: e.target.value })}
              disabled={isLoading}
            />
            
            {/* Button Container with Flex */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              width: '100%',
              mt: 3 
            }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  maxWidth: '100%',
                  minHeight: 48,
                  flex: '1 1 auto'
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Potvrdi'}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ 
                  maxWidth: '100%',
                  minHeight: 40,
                  flex: '1 1 auto'
                }}
                onClick={() => setForgotPasswordStep(1)}
              >
                Nazad
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }

    if (forgotPasswordStep === 3) {
      return (
        <Box component="form" onSubmit={handleForgotPasswordStep3} sx={{ width: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Unesite novu lozinku
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              sx={{ maxWidth: '100%' }}
              label="Nova šifra"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={forgotPasswordData.newPassword}
              onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              sx={{ maxWidth: '100%' }}
              label="Potvrda nove lozinke"
              name="confirmNewPassword"
              type={showConfirmNewPassword ? 'text' : 'password'}
              value={forgotPasswordData.confirmNewPassword}
              onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmNewPassword: e.target.value })}
              disabled={isLoading}
              error={forgotPasswordData.confirmNewPassword !== '' && forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword}
              helperText={forgotPasswordData.confirmNewPassword !== '' && forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword ? 'Lozinke se ne podudaraju' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      edge="end"
                    >
                      {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Button Container with Flex */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              width: '100%',
              mt: 3 
            }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  maxWidth: '100%',
                  minHeight: 48,
                  flex: '1 1 auto'
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Resetuj lozinku'}
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }
  };

  return (
    <PageLayout 
      maxWidth="sm"
      containerSx={{ 
        mt: 4,
        textAlign: 'center',
        alignItems: 'center',
        px: 2,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ 
        width: '100%', 
        maxWidth: '100%', 
        boxSizing: 'border-box' 
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            width: '100%', 
            maxWidth: 500, 
            margin: '0 auto', 
            boxSizing: 'border-box' 
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Dobrodošli
          </Typography>
          
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            mb: 3,
            flexWrap: 'wrap'
          }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              sx={{ 
                width: '100%',
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'center'
                },
                '& .MuiTab-root': {
                  minWidth: { xs: 'auto', sm: 120 },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  padding: { xs: '6px 8px', sm: '12px 16px' },
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              <Tab label="Prijava" />
              <Tab label="Registracija" />
              <Tab 
                label="Zaboravljena šifra" 
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}
              />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Box component="div" sx={{ whiteSpace: 'pre-line' }}>
                {error}
              </Box>
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {activeTab === 0 ? (
            // Login Form
            (<Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Email ili Korisničko ime"
                  name="email"
                  type="text"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={isLoading}
                  placeholder="Unesite email ili korisničko ime"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Šifra"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label="Zapamti me"
                />
                
                {/* Button Container with Flex */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1, 
                  width: '100%',
                  mt: 3 
                }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      maxWidth: '100%',
                      minHeight: 48,
                      flex: '1 1 auto'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Prijavi se'}
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ 
                      maxWidth: '100%',
                      minHeight: 40,
                      flex: '1 1 auto'
                    }}
                    onClick={() => setActiveTab(2)}
                  >
                    Zaboravili ste lozinku?
                  </Button>
                </Box>
              </Stack>
            </Box>)
          ) : activeTab === 1 ? (
            // Register Form
            (<Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Korisničko ime"
                  name="username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  disabled={isLoading}
                />
                <TextField
                  margin="normal"
                  required={true}
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={isLoading}
                  placeholder="Unesite email"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Šifra"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Potvrda šifre"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  error={registerData.confirmPassword !== '' && registerData.password !== registerData.confirmPassword}
                  helperText={registerData.confirmPassword !== '' && registerData.password !== registerData.confirmPassword ? 'Lozinke se ne podudaraju' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Sigurnosno pitanje */}
                <FormControl fullWidth margin="normal" required sx={{ maxWidth: '100%' }}>
                  <InputLabel>Sigurnosno pitanje</InputLabel>
                  <Select
                    value={registerData.securityQuestionIndex}
                    onChange={(e) => setRegisterData({ ...registerData, securityQuestionIndex: e.target.value })}
                    disabled={isLoading}
                    label="Sigurnosno pitanje"
                  >
                    {SECURITY_QUESTIONS.map((question, index) => (
                      <MenuItem key={index} value={index}>
                        {question}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  sx={{ maxWidth: '100%' }}
                  label="Odgovor na sigurnosno pitanje"
                  name="securityAnswer"
                  value={registerData.securityAnswer}
                  onChange={(e) => setRegisterData({ ...registerData, securityAnswer: e.target.value })}
                  disabled={isLoading}
                  helperText="⚠️ VAŽNO: Zapamtite ovaj odgovor - trebat će vam za resetovanje lozinke!"
                  FormHelperTextProps={{
                    sx: { 
                      color: 'warning.main',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    🔐 Sigurnosno pitanje je jedini način za resetovanje lozinke!
                  </Typography>
                  <Typography variant="body2">
                    Molimo vas da zapamtite odgovor koji ste uneli jer će vam biti potreban 
                    ako zaboravite lozinku. Bez tačnog odgovora nećete moći resetovati lozinku.
                  </Typography>
                </Alert>
                
                {/* Button Container with Flex */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1, 
                  width: '100%',
                  mt: 3 
                }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      maxWidth: '100%',
                      minHeight: 48,
                      flex: '1 1 auto'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Registriraj se'}
                  </Button>
                </Box>
              </Stack>
            </Box>)
          ) : (
            // Forgot Password Form
            (renderForgotPasswordForm())
          )}
        </Paper>
      </Box>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Authentication;
