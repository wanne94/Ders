import axiosInstance from '@/utils/axiosConfig';
import { ENV } from './config';

const usersService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.USERS}/public`);
    return response.data; // Backend returns users directly, not wrapped in data property
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.USERS}/${id}`);
    return response.data; // Backend returns user directly, not wrapped in data property
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post(ENV.API_ENDPOINTS.USERS, userData);
    return response.data; // Backend returns user directly, not wrapped in data property
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`${ENV.API_ENDPOINTS.USERS}/${id}`, userData);
    return response.data; // Backend returns user directly, not wrapped in data property
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`${ENV.API_ENDPOINTS.USERS}/${id}`);
    return response.data; // Backend returns response directly, not wrapped in data property
  },

  updateUserRole: async (id, role) => {
    const response = await axiosInstance.patch(`${ENV.API_ENDPOINTS.USERS}/${id}/role`, { role });
    return response.data; // Backend returns response directly, not wrapped in data property
  },

  // Profile management methods
  getCurrentProfile: async () => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.USERS}/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axiosInstance.put(`${ENV.API_ENDPOINTS.USERS}/profile`, profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.USERS}/change-password`, passwordData);
    return response.data;
  },

  deleteOwnProfile: async (currentPassword) => {
    const response = await axiosInstance.delete(`${ENV.API_ENDPOINTS.USERS}/profile/delete`, {
      data: { currentPassword }
    });
    return response.data;
  },

};

export default usersService; 