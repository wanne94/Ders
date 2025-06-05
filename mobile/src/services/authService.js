import axiosInstance from '../utils/axiosConfig';
import { 
  setToken, 
  setUserData, 
  clearAuthData,
  setRememberedEmail,
  removeRememberedEmail,
  setRememberedPassword,
  removeRememberedPassword,
  clearRememberedCredentials,
  STORAGE_KEYS
} from '../utils/authHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Login
  async login(email, password, rememberMe = false) {
    try {
      console.log('🔐 authService.login called with:', {
        email: email,
        password: password ? '***' : 'empty',
        rememberMe: rememberMe,
        baseURL: axiosInstance.defaults.baseURL
      });

      // Detaljana validacija
      const errors = [];
      
      if (!email || !email.trim()) {
        errors.push('Email ili ime je obavezno');
      }
      
      if (!password || !password.trim()) {
        errors.push('Lozinka je obavezna');
      } else if (password.length < 6) {
        errors.push('Lozinka mora imati najmanje 6 karaktera');
      }

      if (errors.length > 0) {
        throw new Error('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      }

      console.log('📤 Sending login request...');
      const response = await axiosInstance.post('users/auth', {
        identifier: email.trim(),
        password: password
      });

      console.log('📥 Login response received:', {
        status: response.status,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        userEmail: response.data?.user?.email
      });

      const { token, user } = response.data;

      console.log('💾 Storing auth data...');
      // Store auth data
      await setToken(token);
      await setUserData(user);

      // Handle remember me functionality
      if (rememberMe) {
        console.log('💾 Storing remembered credentials...');
        await setRememberedEmail(email);
        await setRememberedPassword(password);
      } else {
        console.log('🗑️ Clearing remembered credentials...');
        await clearRememberedCredentials();
      }

      console.log('✅ authService.login completed successfully');
      return { token, user };
    } catch (error) {
      console.log('❌ authService.login failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        isAxiosError: error.isAxiosError,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // More specific error messages
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Greška mreže - proverite da li je server pokrenut na ' + axiosInstance.defaults.baseURL);
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        throw new Error('Server nije dostupan - proverite da li je pokrenut na portu 5003');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint nije pronađen - proverite server konfiguraciju');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Neispravni podaci za prijavu');
      } else if (error.response?.status === 401) {
        throw new Error('Pogrešan email ili lozinka');
      } else if (error.response?.status >= 500) {
        throw new Error('Greška na serveru. Molimo pokušajte ponovo.');
      } else if (error.message.includes('Molimo ispravite')) {
        // This is our validation error, re-throw as is
        throw error;
      } else {
        throw new Error(error.response?.data?.message || 'Greška pri prijavi: ' + error.message);
      }
    }
  },

  // Register
  async register(userData) {
    try {
      // Detaljana validacija
      const errors = [];
      
      if (!userData.firstName || !userData.firstName.trim()) {
        errors.push('Ime je obavezno');
      } else if (userData.firstName.trim().length < 2) {
        errors.push('Ime mora imati najmanje 2 karaktera');
      } else if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(userData.firstName.trim())) {
        errors.push('Ime može sadržavati samo slova');
      }
      
      if (!userData.lastName || !userData.lastName.trim()) {
        errors.push('Prezime je obavezno');
      } else if (userData.lastName.trim().length < 2) {
        errors.push('Prezime mora imati najmanje 2 karaktera');
      } else if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(userData.lastName.trim())) {
        errors.push('Prezime može sadržavati samo slova');
      }
      
      if (userData.email && userData.email.trim() && !/\S+@\S+\.\S+/.test(userData.email)) {
        errors.push('Email format nije ispravan');
      }
      
      if (!userData.password || !userData.password.trim()) {
        errors.push('Lozinka je obavezna');
      } else if (userData.password.length < 6) {
        errors.push('Lozinka mora imati najmanje 6 karaktera');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(userData.password)) {
        errors.push('Lozinka mora sadržavati najmanje jedno malo i jedno veliko slovo');
      }
      
      if (!userData.confirmPassword || !userData.confirmPassword.trim()) {
        errors.push('Potvrda lozinke je obavezna');
      } else if (userData.password !== userData.confirmPassword) {
        errors.push('Lozinke se ne podudaraju');
      }
      
      if (userData.securityQuestionIndex === '' || userData.securityQuestionIndex === null || userData.securityQuestionIndex === undefined) {
        errors.push('Sigurnosno pitanje je obavezno');
      }
      
      if (!userData.securityAnswer || !userData.securityAnswer.trim()) {
        errors.push('Odgovor na sigurnosno pitanje je obavezan');
      } else if (userData.securityAnswer.trim().length < 2) {
        errors.push('Odgovor na sigurnosno pitanje mora imati najmanje 2 karaktera');
      }

      if (errors.length > 0) {
        throw new Error('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      }

      const registrationData = {
        username: (userData.firstName + userData.lastName).replace(/\s+/g, ''),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: 'user',
        securityQuestionIndex: parseInt(userData.securityQuestionIndex),
        securityAnswer: userData.securityAnswer.trim()
      };

      // Add email only if provided
      if (userData.email && userData.email.trim()) {
        registrationData.email = userData.email.trim().toLowerCase();
      }

      const response = await axiosInstance.post('users/register', registrationData);

      return response.data;
    } catch (error) {
      if (error.message.includes('Molimo ispravite')) {
        // This is our validation error, re-throw as is
        throw error;
      }
      
      let errorMessage = 'Greška pri registraciji';
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('email')) {
          errorMessage = 'Korisnik sa ovim emailom već postoji';
        } else {
          errorMessage = error.response?.data?.message || 'Neispravni podaci za registraciju';
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'Korisnik sa ovim emailom već postoji';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Greška na serveru. Molimo pokušajte ponovo.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Logout
  async logout(clearRemembered = false) {
    try {
      console.log('🚪 authService.logout called with clearRemembered:', clearRemembered);
      
      console.log('🔄 Calling clearAuthData...');
      await clearAuthData();
      
      // Optionally clear remembered credentials
      if (clearRemembered) {
        console.log('🔄 Clearing remembered credentials...');
        await clearRememberedCredentials();
      }
      
      console.log('✅ authService.logout completed successfully');
    } catch (error) {
      console.error('❌ Error during authService.logout:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  },

  // Forgot Password - Step 1: Verify Email
  async forgotPasswordVerifyEmail(email) {
    try {
      const response = await axiosInstance.post('users/forgot-password/verify-email', {
        email: email
      });

      return response.data; // Should contain securityQuestionIndex
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Greška pri pronalaženju korisnika');
    }
  },

  // Forgot Password - Step 2: Verify Security Answer
  async forgotPasswordVerifyAnswer(email, securityAnswer) {
    try {
      const response = await axiosInstance.post('users/forgot-password/verify-answer', {
        email: email,
        securityAnswer: securityAnswer
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Netačan odgovor na sigurnosno pitanje');
    }
  },

  // Forgot Password - Step 3: Reset Password
  async forgotPasswordReset(email, newPassword) {
    try {
      const response = await axiosInstance.post('users/forgot-password/reset', {
        email: email,
        newPassword: newPassword
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Greška pri resetovanju lozinke');
    }
  },

  // Verify token (check if user is still authenticated)
  async verifyToken() {
    try {
      const response = await axiosInstance.get('users/verify-token');
      return response.data;
    } catch (error) {
      // Token is invalid, clear auth data
      await clearAuthData();
      throw new Error('Token expired or invalid');
    }
  },

  // Check token expiration time
  async checkTokenExpiration() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.log('🔍 No token found in storage');
        return { hasToken: false };
      }

      // Decode token to check expiration (without verification)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('🔍 Invalid token format');
        return { hasToken: true, isValid: false };
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const timeUntilExpiration = expirationTime - currentTime;

      console.log('🔍 Token expiration info:', {
        currentTime: new Date(currentTime * 1000).toISOString(),
        expirationTime: new Date(expirationTime * 1000).toISOString(),
        timeUntilExpiration: timeUntilExpiration,
        timeUntilExpirationHours: (timeUntilExpiration / 3600).toFixed(2),
        isExpired: timeUntilExpiration <= 0
      });

      return {
        hasToken: true,
        isValid: timeUntilExpiration > 0,
        expirationTime,
        timeUntilExpiration,
        timeUntilExpirationHours: (timeUntilExpiration / 3600).toFixed(2),
        shouldRefresh: timeUntilExpiration < 86400 // Refresh if less than 24 hours left
      };
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return { hasToken: true, isValid: false, error: error.message };
    }
  },

  // Refresh token by re-authenticating with stored credentials
  async refreshToken() {
    try {
      console.log('🔄 Attempting to refresh token...');
      
      // Get remembered credentials
      const email = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
      const password = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_PASSWORD);
      
      if (!email || !password) {
        console.log('⚠️ No remembered credentials for token refresh');
        return { success: false, reason: 'No remembered credentials' };
      }
      
      // Re-authenticate to get new token
      const response = await axiosInstance.post('users/auth', {
        identifier: email,
        password: password,
        loginType: 'email'
      });

      const { token, user } = response.data;

      // Store new auth data
      await setToken(token);
      await setUserData(user);

      console.log('✅ Token refreshed successfully');
      return { success: true, token, user };
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      return { success: false, reason: error.message };
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await axiosInstance.get('users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Greška pri dohvaćanju profila');
    }
  },

  // Update user profile
  async updateUserProfile(userData) {
    try {
      console.log('📤 Sending profile update request:', userData);
      console.log('🔗 API URL:', axiosInstance.defaults.baseURL);
      
      // Check if we have a token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await axiosInstance.put('users/profile', userData);
      console.log('✅ Profile update response:', response.data);
      
      // Update stored user data
      await setUserData(response.data.user);
      
      return response.data;
    } catch (error) {
      console.log('❌ Profile update error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers
        } : 'No config',
        isAxiosError: error.isAxiosError,
        code: error.code,
        fullError: error
      });
      throw new Error(error.response?.data?.message || error.message || 'Greška pri ažuriranju profila');
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      console.log('Sending password change request');
      const response = await axiosInstance.put('users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      console.log('Password change response:', response.data);
      
      return response.data;
    } catch (error) {
      console.log('Password change error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Greška pri promjeni lozinke');
    }
  },

  // Change security question
  async changeSecurityQuestion(securityData) {
    try {
      console.log('Sending security question change request');
      const response = await axiosInstance.put('users/change-security-question', {
        currentPassword: securityData.currentPassword,
        securityQuestionIndex: parseInt(securityData.securityQuestionIndex),
        securityAnswer: securityData.securityAnswer.trim()
      });
      console.log('Security question change response:', response.data);
      
      return response.data;
    } catch (error) {
      console.log('Security question change error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Greška pri promjeni sigurnosnog pitanja');
    }
  }
};

export default authService; 