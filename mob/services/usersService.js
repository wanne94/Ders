import apiClient from './apiClient';

export const usersService = {
  async getAllUsers() {
    try {
      const response = await apiClient.get('/users/public');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(id) {
    try {
      // Pokušaj prvo sa direktnim endpoint-om
      const response = await apiClient.get(`/users/${id}/public`);
      return response.data;
    } catch (error) {
      // Ako endpoint ne postoji (404), koristi fallback bez logovanja greške
      if (error.status === 404) {
        try {
          const allUsersResponse = await apiClient.get('/users/public');
          const users = allUsersResponse.data || [];
          const user = users.find(u => u._id === id || u.id === id);
          if (user) {
            return user;
          }
          throw new Error('User not found in public list');
        } catch (fallbackError) {
          console.error('Error fetching user:', fallbackError);
          throw fallbackError;
        }
      }
      // Za druge greške, loguj i baci grešku
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async updateStatus(id, status, reason = null) {
    try {
      const payload = { status };
      if (reason) {
        payload.rejectionReason = reason;
      }
      
      const response = await apiClient.patch(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async updateProfile(data) {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async changePassword(data) {
    try {
      const response = await apiClient.post('/users/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

}; 