import apiClient from './apiClient';
import { ENV } from './config';

const daijeService = {
  getAllDaije: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/public`);
    return response;
  },

  getDaijaById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
    return response;
  },

  getDaijaBySlug: async (slug) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/slug/${slug}`);
    return response;
  },

  getDaijaPredavanja: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}?daija=${id}`);
    return response;
  },

  searchDaije: async (query) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/search?q=${encodeURIComponent(query)}`);
    return response;
  },

  createDaija: async (daijaData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.DAIJE, daijaData);
    return response;
  },

  updateDaija: async (id, daijaData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, daijaData);
    return response;
  },

  deleteDaija: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
    return response;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, payload);
    return response;
  }
};

export default daijeService; 