import apiClient from './apiClient';
import { ENV } from './config';


const predavanjaService = {
  getAllPredavanja: async (page = 1, limit = 10, includeStatus = null) => {
    let endpoint = `${ENV.API_ENDPOINTS.PREDAVANJA}/public`;
    const params = new URLSearchParams();
    
    
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (includeStatus) params.append('status', includeStatus);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    
    const response = await apiClient.get(endpoint);
    
    return response; // Backend returns lectures directly, not wrapped in data property
  },

  getAllPredavanjaForAdmin: async () => {
    const response = await apiClient.get(ENV.API_ENDPOINTS.PREDAVANJA);
    return response; // Backend returns lectures directly, not wrapped in data property
  },

  getApprovedPredavanja: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/approved?page=${page}&limit=${limit}`);
    return response;
  },

  getPendingPredavanja: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/pending?page=${page}&limit=${limit}`);
    return response;
  },

  getPredavanjeById: async (id) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`);
    return response; // Backend returns lecture directly, not wrapped in data property
  },

  getPredavanjaByDaija: async (daijaId) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/daija/${daijaId}`);
    return response; // Backend returns lectures directly, not wrapped in data property
  },

  getPredavanjaByOrganization: async (organizationId) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/organization/${organizationId}`);
    return response; // Backend returns lectures directly, not wrapped in data property
  },

  searchPredavanja: async (query) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/search?q=${encodeURIComponent(query)}`);
    return response; // Backend returns lectures directly, not wrapped in data property
  },

  getLatestPredavanja: async (limit = 10) => {
    const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/latest?limit=${limit}`);
    return response; // Backend returns lectures directly, not wrapped in data property
  },

  createPredavanje: async (lectureData) => {
    const response = await apiClient.post(ENV.API_ENDPOINTS.PREDAVANJA, lectureData);
    return response; // Backend returns lecture directly, not wrapped in data property
  },

  updatePredavanje: async (id, lectureData) => {
    const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, lectureData);
    return response; // Backend returns lecture directly, not wrapped in data property
  },

  deletePredavanje: async (id) => {
    const response = await apiClient.delete(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`);
    return response; // Backend returns response directly, not wrapped in data property
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, payload);
    return response; // Backend returns response directly, not wrapped in data property
  },

  getStatistics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.startYear) queryParams.append('startYear', params.startYear);
    if (params.endYear) queryParams.append('endYear', params.endYear);
    
    const endpoint = `${ENV.API_ENDPOINTS.PREDAVANJA}/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(endpoint);
    return response;
  }
};

export default predavanjaService;