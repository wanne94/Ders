import apiClient from './apiClient';
import { ENV } from './config';

const udruzenjaService = {
  getAllUdruzenja: async () => {
    const response = await apiClient.get(ENV.API_ENDPOINTS.UDRUZENJA);
    return response;
  },

  getAllUdruzenjaForAdmin: async () => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/../admin/organizations`);
    return response;
  },

  getUdruzenjeById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`);
    return response;
  },

  getUdruzenjePredavanja: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}?organizationId=${id}`);
    return response;
  },

  searchUdruzenja: async (query) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.UDRUZENJA}/search?q=${encodeURIComponent(query)}`);
    return response;
  },

  createUdruzenje: async (udruzenjeData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.UDRUZENJA, udruzenjeData);
    return response;
  },

  updateUdruzenje: async (id, udruzenjeData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`, udruzenjeData);
    return response;
  },

  deleteUdruzenje: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`);
    return response;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.UDRUZENJA}/${id}`, payload);
    return response;
  }
};

export default udruzenjaService; 