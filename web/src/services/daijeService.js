import axiosInstance from '@/utils/axiosConfig';
import { ENV } from './config';

const daijeService = {
  // Public endpoint - returns only approved daije with lecture count
  getAllDaije: async () => {
    const response = await axiosInstance.get(ENV.API_ENDPOINTS.DAIJE);
    return response.data;
  },

  // Admin endpoint - returns all daije including pending/rejected
  getAllDaijeForAdmin: async () => {
    const response = await axiosInstance.get('/admin/daije');
    return response.data;
  },

  getDaijaById: async (id) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
    return response.data;
  },

  getDaijaPredavanja: async (id) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}?daija=${id}`);
    return response.data;
  },

  searchDaije: async (query) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.DAIJE}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  createDaija: async (daijaData) => {
    const response = await axiosInstance.post(ENV.API_ENDPOINTS.DAIJE, daijaData);
    return response.data;
  },

  updateDaija: async (id, daijaData) => {
    const response = await axiosInstance.put(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, daijaData);
    return response.data;
  },

  deleteDaija: async (id) => {
    const response = await axiosInstance.delete(`${ENV.API_ENDPOINTS.DAIJE}/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await axiosInstance.patch(`${ENV.API_ENDPOINTS.DAIJE}/${id}`, payload);
    return response.data;
  },

  // Bulk operations
  bulkApprove: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.DAIJE}/bulk/approve`, { ids });
    return response.data;
  },

  bulkReject: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.DAIJE}/bulk/reject`, { ids });
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.DAIJE}/bulk/delete`, { ids });
    return response.data;
  }
};

export default daijeService; 