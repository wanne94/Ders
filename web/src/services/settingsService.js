import apiClient from './apiClient';

const settingsService = {
  getPublicSettings: async () => {
    const response = await apiClient.get('/settings/public');
    return response; // Backend returns settings directly, not wrapped in data property
  },

  updateApprovalSettings: async (settings) => {
    const response = await apiClient.put('/settings/approval-settings', settings);
    return response; // Backend returns response directly, not wrapped in data property
  },

  getApprovalSettings: async () => {
    const response = await apiClient.get('/settings/approval-settings');
    return response; // Backend returns settings directly, not wrapped in data property
  }
};

export default settingsService; 