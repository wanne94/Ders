import apiClient from './apiClient';

export const authService = {
  // Login user
  async login(identifier, password) {
    try {
      console.log('🔐 Attempting login with:', { identifier: identifier.trim(), password: '***' });
      
      const response = await apiClient.post('/users/auth', {
        identifier: identifier.trim(),
        password: password
      });
      
      console.log('📡 Full API response:', {
        status: response.status,
        data: response.data
      });
      
      // Extract only token and user from response
      const { token, user } = response.data;
      
      // Log response for debugging
      console.log('✅ Login API response:', {
        token: token ? 'EXISTS' : 'MISSING',
        user: user ? {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        } : 'MISSING'
      });
      
      return { token, user };
    } catch (error) {
      console.error('❌ Error logging in:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post('/users/register', {
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        securityQuestionIndex: parseInt(userData.securityQuestionIndex),
        securityAnswer: userData.securityAnswer.trim()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Verify email for forgot password
  async verifyEmailForPasswordReset(email) {
    try {
      const response = await apiClient.post('/users/forgot-password/verify-email', {
        email: email.trim()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  // Verify security answer
  async verifySecurityAnswer(email, securityAnswer) {
    try {
      const response = await apiClient.post('/users/forgot-password/verify-answer', {
        email: email,
        securityAnswer: securityAnswer
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying security answer:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email, newPassword) {
    try {
      const response = await apiClient.post('/users/forgot-password/reset', {
        email: email,
        newPassword: newPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post('/users/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Update profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}; 