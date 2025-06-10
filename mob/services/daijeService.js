import apiClient from './apiClient';
import { ENV } from '../config';

const daijeService = {
  getAllDaije: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/public`);
    return response.data;
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

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, payload);
    return response.data;
  }
};

export default daijeService;
