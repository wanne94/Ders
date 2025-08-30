import axiosInstance from '@/utils/axiosConfig';

const settingsService = {
  getPublicSettings: async () => {
    const response = await axiosInstance.get('/settings/public');
    return response.data; // Backend returns settings directly, not wrapped in data property
  },

  updateApprovalSettings: async (settings) => {
    const response = await axiosInstance.put('/settings/approval-settings', settings);
    return response.data; // Backend returns response directly, not wrapped in data property
  },

  getApprovalSettings: async () => {
    const response = await axiosInstance.get('/settings/approval-settings');
    return response.data; // Backend returns settings directly, not wrapped in data property
  }
};

export default settingsService; 