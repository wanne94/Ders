import axiosInstance from '@/utils/axiosConfig';

const suggestionsService = {
  getAllSuggestions: async () => {
    const response = await axiosInstance.get('/suggestions/public');
    return response.data || [];
  },

  getArchivedSuggestions: async () => {
    const response = await axiosInstance.get('/suggestions/archived/public');
    return response.data || [];
  },

  getSuggestionsCount: async () => {
    const response = await axiosInstance.get('/suggestions/count/public');
    return response.data || { total: 0, pending: 0, approved: 0, rejected: 0 };
  },

  getSuggestionById: async (id) => {
    const response = await axiosInstance.get(`/suggestions/${id}/public`);
    return response.data;
  },

  createSuggestion: async (suggestionData) => {
    const response = await axiosInstance.post('/suggestions', suggestionData);
    return response.data;
  },

  updateSuggestion: async (id, suggestionData) => {
    const response = await axiosInstance.put(`/suggestions/${id}`, suggestionData);
    return response.data;
  },

  deleteSuggestion: async (id) => {
    const response = await axiosInstance.delete(`/suggestions/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await axiosInstance.patch(`/suggestions/${id}`, payload);
    return response.data;
  },

  archiveSuggestion: async (id) => {
    const response = await axiosInstance.patch(`/suggestions/${id}/archive`);
    return response.data;
  }
};

export default suggestionsService; 