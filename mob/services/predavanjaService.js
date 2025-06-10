import apiClient from './apiClient';
import { ENV } from '../config';

const predavanjaService = {
  getAllPredavanja: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/public`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  getAllPredavanjaForAdmin: async () => {
    const response = await apiClient.get(ENV.API_ENDPOINTS.PREDAVANJA);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  getApprovedPredavanja: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/approved?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPendingPredavanja: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPredavanjeById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  getPredavanjaByDaija: async (daijaId) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/daija/${daijaId}`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  getPredavanjaByOrganization: async (organizationId) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/organization/${organizationId}`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  searchPredavanja: async (query) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/search?q=${encodeURIComponent(query)}`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  getLatestPredavanja: async (limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/latest?limit=${limit}`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  createPredavanje: async (lectureData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.PREDAVANJA, lectureData);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  updatePredavanje: async (id, lectureData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, lectureData);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  deletePredavanje: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`);
    return response.data; // Axios interceptor returns full response, so we need .data
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, payload);
    return response.data; // Axios interceptor returns full response, so we need .data
  }
};

export default predavanjaService;
