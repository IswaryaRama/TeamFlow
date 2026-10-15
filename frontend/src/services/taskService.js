import api from './api';

export const taskService = {
  // Get list of tasks with filters
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get single task
  async getTask(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Create task (Admin)
  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task (Admin or Assignee)
  async updateTask(taskId, updateData) {
    const response = await api.patch(`/tasks/${taskId}`, updateData);
    return response.data;
  },

  // Delete task (Admin)
  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Get comments for task
  async getComments(taskId) {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  // Add comment / progress update to task
  async addComment(taskId, content) {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  // Delete comment
  async deleteComment(taskId, commentId) {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  // Get deadline history for task (Mandatory Additional Challenge)
  async getDeadlineHistory(taskId) {
    const response = await api.get(`/tasks/${taskId}/deadline-history`);
    return response.data;
  },
};
