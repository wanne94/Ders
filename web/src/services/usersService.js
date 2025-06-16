import apiClient from './apiClient';
import { ENV } from './config';

const usersService = {
  getAllUsers: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.USERS}/public`);
    return response; // Backend returns users directly, not wrapped in data property
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.USERS}/${id}`);
    return response; // Backend returns user directly, not wrapped in data property
  },

  createUser: async (userData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.USERS, userData);
    return response; // Backend returns user directly, not wrapped in data property
  },

  updateUser: async (id, userData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.USERS}/${id}`, userData);
    return response; // Backend returns user directly, not wrapped in data property
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.USERS}/${id}`);
    return response; // Backend returns response directly, not wrapped in data property
  },

  updateUserRole: async (id, role) => {
    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.USERS}/${id}/role`, { role });
    return response; // Backend returns response directly, not wrapped in data property
  },

  // Profile management methods
  getCurrentProfile: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.USERS}/profile`);
    return response;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.USERS}/profile`, profileData);
    return response;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.post(`${ENV.API_ENDPOINTS.USERS}/change-password`, passwordData);
    return response;
  },

};

export default usersService; 