import apiClient from './apiClient';
import { ENV } from './config';

const daijeService = {
  // Public endpoint - returns only approved daije with lecture count
  getAllDaije: async () => {
    const response = await apiClient.get(ENV.API_ENDPOINTS.DAIJE);
    return response;
  },

  // Admin endpoint - returns all daije including pending/rejected
  getAllDaijeForAdmin: async () => {
    const response = await apiClient.get('/admin/daije');
    return response;
  },

  getDaijaById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
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
  },

  // Bulk operations
  bulkApprove: async (ids) => {
    const response = await apiClient.post(`${ENV.API_ENDPOINTS.DAIJE}/bulk/approve`, { ids });
    return response;
  },

  bulkReject: async (ids) => {
    const response = await apiClient.post(`${ENV.API_ENDPOINTS.DAIJE}/bulk/reject`, { ids });
    return response;
  },

  bulkDelete: async (ids) => {
    const response = await apiClient.post(`${ENV.API_ENDPOINTS.DAIJE}/bulk/delete`, { ids });
    return response;
  }
};

export default daijeService; 