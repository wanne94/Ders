import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';
import authService from '../services/authService';
import { setTokenExpirationHandler } from '../utils/axiosConfig';
import { 
  getToken, 
  getUserData, 
  getUserDisplayName, 
  getUserInitials,
  getRememberedEmail,
  getRememberedPassword
} from '../utils/authHelpers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState('');
  const [rememberedPassword, setRememberedPassword] = useState('');
  const [navigationRef, setNavigationRef] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  // Set navigation reference for global navigation
  const setNavigation = (navRef) => {
    console.log('🔧 setNavigation called with:', {
      hasRef: !!navRef,
      hasDispatch: navRef?.dispatch ? 'yes' : 'no',
      refType: typeof navRef
    });
    
    if (navRef && typeof navRef.dispatch === 'function') {
      setNavigationRef(navRef);
      console.log('✅ Navigation reference successfully set');
    } else {
      console.warn('⚠️ Invalid navigation reference provided to setNavigation');
    }
  };

  // Clear global messages
  const clearGlobalMessages = () => {
    setGlobalError('');
    setGlobalSuccess('');
  };

  // Centralized token expiration handler
  const handleTokenExpired = async () => {
    console.log('🔒 handleTokenExpired called - starting logout process...');
    
    try {
      // Clear auth state
      console.log('🔄 Clearing auth state...');
      setUser(null);
      setIsLoggedIn(false);
      
      // Clear global messages
      console.log('🔄 Clearing global messages...');
      clearGlobalMessages();
      
      // Clear storage (but keep remembered credentials)
      console.log('🔄 Calling authService.logout...');
      await authService.logout(false);
      
      // Navigate to Auth screen if navigation is available
      if (navigationRef && navigationRef.dispatch) {
        console.log('🔄 Navigation reference available, navigating to Auth screen...');
        try {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            })
          );
          console.log('✅ Successfully navigated to Auth screen');
        } catch (navError) {
          console.error('❌ Error during navigation:', navError);
        }
      } else {
        console.log('⚠️ No navigation reference available or dispatch method missing');
        console.log('Navigation ref state:', {
          hasRef: !!navigationRef,
          hasDispatch: navigationRef?.dispatch ? 'yes' : 'no',
          refType: typeof navigationRef
        });
      }
      
      console.log('✅ User logged out due to token expiration');
    } catch (error) {
      console.error('❌ Error during token expiration logout:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  };

  // Set up global token expiration handler on mount
  useEffect(() => {
    setTokenExpirationHandler(handleTokenExpired);
    console.log('🔧 Global token expiration handler set');
    
    return () => {
      setTokenExpirationHandler(null);
      console.log('🧹 Global token expiration handler cleared');
    };
  }, []);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Clear any existing messages
      clearGlobalMessages();
      
      // Get stored auth data
      const [token, userData, savedEmail, savedPassword] = await Promise.all([
        getToken(),
        getUserData(),
        getRememberedEmail(),
        getRememberedPassword()
      ]);

      if (savedEmail) {
        setRememberedEmail(savedEmail);
      }

      if (savedPassword) {
        setRememberedPassword(savedPassword);
      }

      if (token && userData) {
        // Verify token is still valid
        try {
          await authService.verifyToken();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          // Token is invalid, clear auth state
          console.log('Token verification failed:', error.message);
          await handleTokenExpired();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      // Clear any existing messages
      clearGlobalMessages();
      
      const { token, user: userData } = await authService.login(email, password, rememberMe);
      
      setUser(userData);
      setIsLoggedIn(true);
      
      if (rememberMe) {
        setRememberedEmail(email);
        setRememberedPassword(password);
      } else {
        setRememberedEmail('');
        setRememberedPassword('');
      }
      
      // Navigate to main app after successful login
      if (navigationRef && navigationRef.dispatch) {
        console.log('🔄 Navigating to MainTabs after successful login...');
        try {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          );
          console.log('✅ Successfully navigated to MainTabs');
        } catch (navError) {
          console.error('❌ Error during navigation after login:', navError);
        }
      } else {
        console.log('⚠️ No navigation reference available for post-login navigation');
      }
      
      return { token, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (clearRemembered = false) => {
    try {
      await authService.logout(clearRemembered);
      setUser(null);
      setIsLoggedIn(false);
      
      // Clear global messages on logout
      clearGlobalMessages();
      
      // Clear remembered credentials from state if requested
      if (clearRemembered) {
        setRememberedEmail('');
        setRememberedPassword('');
      }
      
      console.log('🚪 User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsLoggedIn(false);
      clearGlobalMessages();
    }
  };

  const forgotPasswordVerifyEmail = async (email) => {
    try {
      return await authService.forgotPasswordVerifyEmail(email);
    } catch (error) {
      throw error;
    }
  };

  const forgotPasswordVerifyAnswer = async (email, securityAnswer) => {
    try {
      return await authService.forgotPasswordVerifyAnswer(email, securityAnswer);
    } catch (error) {
      throw error;
    }
  };

  const forgotPasswordReset = async (email, newPassword) => {
    try {
      return await authService.forgotPasswordReset(email, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    try {
      console.log('🔄 Starting profile update with data:', userData);
      
      // Check and refresh token if needed before making the request
      const tokenRefreshed = await refreshTokenIfNeeded();
      if (!tokenRefreshed) {
        console.log('⚠️ Token refresh failed, but continuing with request...');
      }
      
      const result = await authService.updateUserProfile(userData);
      console.log('✅ Profile update successful:', result);
      setUser(result.user);
      return result;
    } catch (error) {
      console.log('❌ Profile update error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.response?.data?.message,
        errorMessage: error?.message,
        fullError: error
      });
      
      // Handle token expiration globally - but only if it's actually a token issue
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message;
        
        // Only handle as token expiration if the error message indicates token issues
        if (errorMessage?.toLowerCase().includes('token') || 
            errorMessage?.toLowerCase().includes('istekao') || 
            errorMessage?.toLowerCase().includes('validan')) {
          console.log('🔒 Token expired in updateProfile, handling expiration');
          await handleTokenExpired();
          
          // ⛔ PREKINI DALJI TOK
          return;
        } else {
          console.log('⚠️ 401/403 error but not token related:', errorMessage);
        }
      }
      
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      console.log('🔄 Starting user data refresh');
      const userData = await authService.getUserProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('❌ Error refreshing user data:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.response?.data?.message,
        errorMessage: error?.message
      });
      
      // Handle token expiration globally - but only if it's actually a token issue
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message;
        
        // Only handle as token expiration if the error message indicates token issues
        if (errorMessage?.toLowerCase().includes('token') || 
            errorMessage?.toLowerCase().includes('istekao') || 
            errorMessage?.toLowerCase().includes('validan')) {
          console.log('🔒 Token expired in refreshUserData, handling expiration');
          await handleTokenExpired();
          
          // ⛔ PREKINI DALJI TOK
          return;
        } else {
          console.log('⚠️ 401/403 error but not token related:', errorMessage);
        }
      }
      
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      console.log('🔄 Starting password change');
      return await authService.changePassword(passwordData);
    } catch (error) {
      console.log('❌ Password change error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.response?.data?.message,
        errorMessage: error?.message
      });
      
      // Handle token expiration globally - but only if it's actually a token issue
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message;
        
        // Only handle as token expiration if the error message indicates token issues
        if (errorMessage?.toLowerCase().includes('token') || 
            errorMessage?.toLowerCase().includes('istekao') || 
            errorMessage?.toLowerCase().includes('validan')) {
          console.log('🔒 Token expired in changePassword, handling expiration');
          await handleTokenExpired();
          
          // ⛔ PREKINI DALJI TOK
          return;
        } else {
          console.log('⚠️ 401/403 error but not token related:', errorMessage);
        }
      }
      
      throw error;
    }
  };

  const changeSecurityQuestion = async (securityData) => {
    try {
      console.log('🔄 Starting security question change');
      return await authService.changeSecurityQuestion(securityData);
    } catch (error) {
      console.log('❌ Security question change error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.response?.data?.message,
        errorMessage: error?.message
      });
      
      // Handle token expiration globally - but only if it's actually a token issue
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message;
        
        // Only handle as token expiration if the error message indicates token issues
        if (errorMessage?.toLowerCase().includes('token') || 
            errorMessage?.toLowerCase().includes('istekao') || 
            errorMessage?.toLowerCase().includes('validan')) {
          console.log('🔒 Token expired in changeSecurityQuestion, handling expiration');
          await handleTokenExpired();
          
          // ⛔ PREKINI DALJI TOK
          return;
        } else {
          console.log('⚠️ 401/403 error but not token related:', errorMessage);
        }
      }
      
      throw error;
    }
  };

  // Check token expiration for debugging
  const checkTokenExpiration = async () => {
    try {
      return await authService.checkTokenExpiration();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return { hasToken: false, error: error.message };
    }
  };

  // Refresh token if needed
  const refreshTokenIfNeeded = async () => {
    try {
      const tokenInfo = await authService.checkTokenExpiration();
      
      if (!tokenInfo.hasToken || !tokenInfo.isValid) {
        console.log('🔍 Token is invalid or missing, cannot refresh');
        return false;
      }
      
      if (tokenInfo.shouldRefresh) {
        console.log('🔄 Token should be refreshed, attempting refresh...');
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult.success) {
          console.log('✅ Token refreshed successfully');
          setUser(refreshResult.user);
          return true;
        } else {
          console.log('❌ Token refresh failed:', refreshResult.reason);
          return false;
        }
      }
      
      console.log('✅ Token is still valid, no refresh needed');
      return true;
    } catch (error) {
      console.error('❌ Error in refreshTokenIfNeeded:', error);
      return false;
    }
  };

  // Helper functions
  const getUserDisplayNameHelper = () => {
    return getUserDisplayName(user);
  };

  const getUserInitialsHelper = () => {
    return getUserInitials(user);
  };

  const value = {
    // State
    user,
    isLoggedIn,
    isLoading,
    rememberedEmail,
    rememberedPassword,
    globalError,
    globalSuccess,
    
    // Actions
    login,
    register,
    logout,
    forgotPasswordVerifyEmail,
    forgotPasswordVerifyAnswer,
    forgotPasswordReset,
    updateProfile,
    refreshUserData,
    changePassword,
    changeSecurityQuestion,
    handleTokenExpired,
    setNavigation,
    clearGlobalMessages,
    checkTokenExpiration,
    refreshTokenIfNeeded,
    
    // Helpers
    getUserDisplayName: getUserDisplayNameHelper,
    getUserInitials: getUserInitialsHelper
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 