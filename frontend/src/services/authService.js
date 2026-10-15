import api from './api';

export const authService = {
  // Login with email/username and password
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('teamflow_token', response.data.access_token);
      localStorage.setItem('teamflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new account
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('teamflow_token', response.data.access_token);
      localStorage.setItem('teamflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Fetch current user profile
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Seed demo data
  async seedDemo() {
    const response = await api.post('/auth/seed-demo');
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('teamflow_token');
    localStorage.removeItem('teamflow_user');
  },
};
