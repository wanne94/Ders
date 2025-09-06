import apiClient from './apiClient';
import { ENV } from '../config';

const daijeService = {
  getAllDaije: async () => {
    const response = await apiClient.get(ENV.API_ENDPOINTS.DAIJE);
    return response.data;
  },

  getAllDaijeForAdmin: async () => {
    try {
      // Try admin endpoint first
      const response = await apiClient.get('/admin/daije');
      return response.data;
    } catch (error) {
      // If admin endpoint fails (e.g., not authenticated), fall back to public endpoint
      console.warn('Admin daije endpoint failed, falling back to public endpoint:', error.message);
      const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/public`);
      return response.data;
    }
  },

  getDaijaById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
    return response.data;
  },

  getDaijaPredavanja: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}?daija=${id}`);
    return response.data;
  },

  searchDaije: async (query) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  createDaija: async (daijaData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.DAIJE, daijaData);
    return response.data;
  },

  updateDaija: async (id, daijaData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, daijaData);
    return response.data;
  },

  deleteDaija: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, reason = '') => {
    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, {
      status,
      reason
    });
    return response.data;
  },

  // Add new methods for dashboard functionality
  updateItem: async (id, itemData) => {
    return await daijeService.updateDaija(id, itemData);
  },

  deleteItem: async (id) => {
    return await daijeService.deleteDaija(id);
  }
};

export default daijeService;
