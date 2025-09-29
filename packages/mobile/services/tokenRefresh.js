import AsyncStorage from '@react-native-async-storage/async-storage';

// Separate token refresh logic to avoid circular dependency
export async function refreshAuthToken(apiClient) {
  try {
    const response = await apiClient.post('/users/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}