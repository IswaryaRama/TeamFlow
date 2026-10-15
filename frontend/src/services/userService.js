import api from './api';

export const userService = {
  // Get all users
  async getUsers(role = null) {
    const response = await api.get('/users', { params: role ? { role } : {} });
    return response.data;
  },

  // Get lightweight user summaries for dropdowns
  async getUserSummaries() {
    const response = await api.get('/users/summaries');
    return response.data;
  },

  // Get team workload stats (Admin only)
  async getTeamStats() {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Create new user (Admin)
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user (Admin)
  async updateUser(userId, userData) {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (Admin)
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};
