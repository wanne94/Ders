import apiClient from './apiClient';
import { ENV } from '../config';

const predavanjaService = {
  getAllPredavanja: async (page = 1, limit = 10, includeStatus = null) => {
    let endpoint = `${ENV.API_ENDPOINTS.PREDAVANJA}/public`;
    if (includeStatus) {
      endpoint += `?status=${includeStatus}`;
    }
    const response = await apiClient.get(endpoint);
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

  updateStatus: async (id, status, reason = '') => {
    try {
      const response = await apiClient.patch(`${ENV.API_ENDPOINTS.PREDAVANJA}/${id}`, {
        status,
        rejectionReason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Add new methods for dashboard functionality
  updateItem: async (id, itemData) => {
    return await predavanjaService.updatePredavanje(id, itemData);
  },

  deleteItem: async (id) => {
    return await predavanjaService.deletePredavanje(id);
  },

  // Report lecture as cancelled
  reportCancellation: async (lectureId, reportData) => {
    try {
      const response = await apiClient.post(`${ENV.API_ENDPOINTS.PREDAVANJA}/${lectureId}/report-cancellation`, {
        reason: reportData.reason || '',
        proof_image: reportData.proof_image || null,
        platform: 'mobile'
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting cancellation:', error);
      throw error;
    }
  },

  // Admin: Get cancelled reports  
  getCancelledReports: async (status = 'pending', page = 1, limit = 50) => {
    try {
      const response = await apiClient.get(`${ENV.API_ENDPOINTS.PREDAVANJA}/admin/cancellation-reports?status=${status}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting cancelled reports:', error);
      throw error;
    }
  },

  // Admin: Review cancelled report
  reviewCancelledReport: async (reportId, action, adminNotes = '') => {
    try {
      const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/admin/cancellation-reports/${reportId}`, {
        action, // 'approve' or 'reject'
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error reviewing cancelled report:', error);
      throw error;
    }
  },

  // Admin: Direct cancel lecture
  cancelLectureDirectly: async (lectureId, reason) => {
    try {
      const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/admin/${lectureId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling lecture directly:', error);
      throw error;
    }
  },

  // Admin: Bulk update cancelled reports
  bulkUpdateCancelledReports: async (reportIds, action, adminNote = null) => {
    try {
      const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/admin/cancellation-reports/bulk`, {
        reportIds,
        action,
        adminNote
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating cancelled reports:', error);
      throw error;
    }
  },

  // Admin: Bulk cancel lectures
  bulkCancelLectures: async (lectureIds, reason) => {
    try {
      const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/admin/lectures/bulk-cancel`, {
        lectureIds,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk cancelling lectures:', error);
      throw error;
    }
  },

  // Admin: Reactivate cancelled lecture
  reactivateLecture: async (lectureId, reason) => {
    try {
      const response = await apiClient.put(`${ENV.API_ENDPOINTS.PREDAVANJA}/admin/${lectureId}/reactivate`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error reactivating lecture:', error);
      throw error;
    }
  }
};

export default predavanjaService;
