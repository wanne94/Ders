import axiosInstance from '@/utils/axiosConfig';
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
    
    
    const response = await axiosInstance.get(endpoint);
    
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  getAllPredavanjaForAdmin: async () => {
    const response = await axiosInstance.get(ENV.API_ENDPOINTS.PREDAVANJA);
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  getApprovedPredavanja: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/approved?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPendingPredavanja: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPredavanjeById: async (id) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`);
    return response.data; // Backend returns lecture directly, not wrapped in data property
  },

  getPredavanjaByDaija: async (daijaId) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/daija/${daijaId}`);
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  getPredavanjaBySpeaker: async (speakerId) => {
    // This function uses the same endpoint as getPredavanjaByDaija
    // It's added for compatibility with the profile component
    if (!speakerId || speakerId === 'undefined') {
      return [];
    }
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/daija/${speakerId}`);
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  getPredavanjaByOrganization: async (organizationId) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/organization/${organizationId}`);
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  searchPredavanja: async (query) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/search?q=${encodeURIComponent(query)}`);
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  getLatestPredavanja: async (limit = 10) => {
    const response = await axiosInstance.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/latest?limit=${limit}`);
    return response.data; // Backend returns lectures directly, not wrapped in data property
  },

  createPredavanje: async (lectureData) => {
    const response = await axiosInstance.post(ENV.API_ENDPOINTS.PREDAVANJA, lectureData);
    return response.data; // Backend returns lecture directly, not wrapped in data property
  },

  updatePredavanje: async (id, lectureData) => {
    const response = await axiosInstance.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, lectureData);
    return response.data; // Backend returns lecture directly, not wrapped in data property
  },

  deletePredavanje: async (id) => {
    const response = await axiosInstance.delete(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`);
    return response.data; // Backend returns response directly, not wrapped in data property
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await axiosInstance.patch(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, payload);
    return response.data; // Backend returns response directly, not wrapped in data property
  },

  getStatistics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.startYear) queryParams.append('startYear', params.startYear);
    if (params.endYear) queryParams.append('endYear', params.endYear);
    
    const endpoint = `${ENV.API_ENDPOINTS.PREDAVANJA}/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  // Bulk operations
  bulkApprove: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.PREDAVANJA}/bulk/approve`, { ids });
    return response.data;
  },

  bulkReject: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.PREDAVANJA}/bulk/reject`, { ids });
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await axiosInstance.post(`${ENV.API_ENDPOINTS.PREDAVANJA}/bulk/delete`, { ids });
    return response.data;
  }
};

export default predavanjaService;