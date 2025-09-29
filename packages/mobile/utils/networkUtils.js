/**
 * Network Utility Functions for Mobile App
 * Provides network connectivity checks and status monitoring
 */

import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

/**
 * Check if device is connected to internet
 * @returns {Promise<boolean>} - True if connected, false otherwise
 */
export const isConnectedToInternet = async () => {
  try {
    const netInfoState = await NetInfo.fetch();
    return netInfoState.isConnected && netInfoState.isInternetReachable;
  } catch (error) {
    console.warn('Failed to check network connectivity:', error);
    // Assume connected if check fails
    return true;
  }
};

/**
 * Get detailed network information
 * @returns {Promise<Object>} - Network state object
 */
export const getNetworkInfo = async () => {
  try {
    const netInfoState = await NetInfo.fetch();
    return {
      isConnected: netInfoState.isConnected,
      isInternetReachable: netInfoState.isInternetReachable,
      type: netInfoState.type, // wifi, cellular, none, etc.
      details: netInfoState.details
    };
  } catch (error) {
    console.warn('Failed to get network info:', error);
    return {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
      details: null
    };
  }
};

/**
 * Check network connectivity before API call
 * @param {Function} onSuccess - Function to call if connected
 * @param {Function} onError - Function to call if not connected
 * @returns {Promise<boolean>} - True if connected and onSuccess called
 */
export const checkConnectivityBeforeApiCall = async (onSuccess, onError) => {
  const isConnected = await isConnectedToInternet();
  
  if (isConnected) {
    if (onSuccess) onSuccess();
    return true;
  } else {
    if (onError) {
      onError({
        title: 'Nema internetske konekcije',
        message: 'Nije moguće poslati zahtjev bez internetske konekcije.',
        actions: [
          'Provjerite Wi-Fi ili mobilnu konekciju',
          'Pokušajte ponovo kada se povežete na internet',
          'Provjerite da li je internet dostupan na drugim aplikacijama'
        ],
        canRetry: true
      });
    }
    return false;
  }
};

/**
 * Test server connectivity by pinging API endpoint
 * @param {string} serverUrl - Server URL to test
 * @returns {Promise<Object>} - Result with success status and details
 */
export const testServerConnectivity = async (serverUrl) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${serverUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return {
        success: true,
        status: response.status,
        message: 'Server is reachable'
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `Server returned ${response.status}`,
        canRetry: response.status >= 500
      };
    }
  } catch (error) {
    let message = 'Server is not reachable';
    let canRetry = true;
    
    if (error.name === 'AbortError') {
      message = 'Connection timeout (server is slow or unreachable)';
    } else if (error.message?.includes('Network request failed')) {
      message = 'Network connection failed';
    }
    
    return {
      success: false,
      status: 0,
      message,
      error: error.message,
      canRetry
    };
  }
};

/**
 * Show network connectivity alert
 * @param {Object} networkError - Network error information
 * @param {Function} onRetry - Function to call when user wants to retry
 * @param {Function} onCancel - Function to call when user cancels
 */
export const showNetworkAlert = (networkError, onRetry = null, onCancel = null) => {
  const buttons = [];

  if (onCancel) {
    buttons.push({ text: 'Otkaži', style: 'cancel', onPress: onCancel });
  }

  if (networkError.canRetry && onRetry) {
    buttons.push({ text: 'Pokušaj ponovo', onPress: onRetry });
  } else {
    buttons.push({ text: 'OK', onPress: onCancel });
  }

  const actionsText = networkError.actions?.join('\n• ') || '';
  const message = `${networkError.message}\n\nŠta da pokušate:\n• ${actionsText}`;

  Alert.alert(networkError.title || 'Problem sa mrežom', message, buttons);
};

/**
 * Subscribe to network state changes
 * @param {Function} callback - Function to call when network state changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToNetworkState = (callback) => {
  return NetInfo.addEventListener((state) => {
    callback({
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type
    });
  });
};

export default {
  isConnectedToInternet,
  getNetworkInfo,
  checkConnectivityBeforeApiCall,
  testServerConnectivity,
  showNetworkAlert,
  subscribeToNetworkState
};