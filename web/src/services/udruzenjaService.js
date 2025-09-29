import axiosInstance from '@/utils/axiosConfig';
import { ENV } from './config';

const udruzenjaService = {
  getAllUdruzenja: async () => {
    const response = await axiosInstance.get(ENV.API_ENDPOINTS.ORGANIZATIONS);
    return response.data;
  },

  getAllUdruzenjaForAdmin: async () => {
    const response = await axiosInstance.get('/admin/organizations');
    return response.data;
  },

  getUdruzenjeById: async (id) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/${id}`);
    return response.data;
  },

  getUdruzenjePredavanja: async (id) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}?organizationId=${id}`);
    return response.data;
  },

  searchUdruzenja: async (query) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  createUdruzenje: async (udruzenjeData) => {
    const response = await axiosInstance.post(ENV.API_ENDPOINTS.ORGANIZATIONS, udruzenjeData);
    return response.data;
  },

  updateUdruzenje: async (id, udruzenjeData) => {
    const response = await axiosInstance.put(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/${id}`, udruzenjeData);
    return response.data;
  },

  deleteUdruzenje: async (id) => {
    const response = await axiosInstance.delete(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await axiosInstance.patch(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/${id}`, payload);
    return response.data;
  },

  // Bulk operations
  bulkApprove: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/bulk/approve`, { ids });
    return response.data;
  },

  bulkReject: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/bulk/reject`, { ids });
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.ORGANIZATIONS}/bulk/delete`, { ids });
    return response.data;
  }
};

export default udruzenjaService; 