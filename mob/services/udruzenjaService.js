import apiClient from './apiClient';
import { ENV } from '../config';

const udruzenjaService = {
  getAllUdruzenja: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/public`);
    return response.data;
  },

  getAllUdruzenjaForAdmin: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/../admin/organizations`);
    return response.data;
  },

  getUdruzenjeById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`);
    return response.data;
  },

  getUdruzenjePredavanja: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}?organizationId=${id}`);
    return response.data;
  },

  searchUdruzenja: async (query) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  createUdruzenje: async (udruzenjeData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.UDRUZENJA, udruzenjeData);
    return response.data;
  },

  updateUdruzenje: async (id, udruzenjeData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`, udruzenjeData);
    return response.data;
  },

  deleteUdruzenje: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`, payload);
    return response.data;
  }
};

export default udruzenjaService;
