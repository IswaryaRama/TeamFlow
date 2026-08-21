import api from './api';

export const projectService = {
  // Get list of projects
  async getProjects() {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get single project details
  async getProject(projectId) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create project (Admin)
  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project (Admin)
  async updateProject(projectId, updateData) {
    const response = await api.patch(`/projects/${projectId}`, updateData);
    return response.data;
  },

  // Delete project (Admin)
  async deleteProject(projectId) {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Add member to project (Admin)
  async addMember(projectId, userId) {
    const response = await api.post(`/projects/${projectId}/members`, { user_id: userId });
    return response.data;
  },

  // Remove member from project (Admin)
  async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};
