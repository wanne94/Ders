import apiClient from './apiClient';

const suggestionsService = {
  getAllSuggestions: async () => {
    const response = await apiClient.get('/suggestions/public');
    return response || [];
  },

  getArchivedSuggestions: async () => {
    const response = await apiClient.get('/suggestions/archived/public');
    return response || [];
  },

  getSuggestionsCount: async () => {
    const response = await apiClient.get('/suggestions/count/public');
    return response || { total: 0, pending: 0, approved: 0, rejected: 0 };
  },

  getSuggestionById: async (id) => {
    const response = await apiClient.get(`/suggestions/${id}/public`);
    return response;
  },

  createSuggestion: async (suggestionData) => {
    const response = await apiClient.post('/suggestions', suggestionData);
    return response;
  },

  updateSuggestion: async (id, suggestionData) => {
    const response = await apiClient.put(`/suggestions/${id}`, suggestionData);
    return response;
  },

  deleteSuggestion: async (id) => {
    const response = await apiClient.delete(`/suggestions/${id}`);
    return response;
  },

  updateStatus: async (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.rejectionReason = reason;

    const response = await apiClient.patch(`/suggestions/${id}`, payload);
    return response;
  },

  archiveSuggestion: async (id) => {
    const response = await apiClient.patch(`/suggestions/${id}/archive`);
    return response;
  }
};

export default suggestionsService; 