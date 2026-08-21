import api from './api';

export const dashboardService = {
  // Get Admin dashboard metrics
  async getAdminMetrics() {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get Member dashboard metrics
  async getMemberMetrics() {
    const response = await api.get('/dashboard/member');
    return response.data;
  },
};
