import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { Plus, AlertCircle } from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  initialProjectId = null,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: initialProjectId || '',
    assigned_to_id: '',
    priority: 'MEDIUM',
    status: 'TODO',
    deadline: '',
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDropdownOptions();
      if (initialProjectId) {
        setFormData((prev) => ({ ...prev, project_id: initialProjectId }));
      }
    }
  }, [isOpen, initialProjectId]);

  const loadDropdownOptions = async () => {
    try {
      const [projs, usersList] = await Promise.all([
        projectService.getProjects(),
        userService.getUserSummaries(),
      ]);
      setProjects(projs);
      setUsers(usersList);
      if (!formData.project_id && projs.length > 0) {
        setFormData((prev) => ({ ...prev, project_id: projs[0].id }));
      }
    } catch (err) {
      console.error('Error loading dropdown options:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project_id) {
      setError('Task Title and Project are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        project_id: formData.project_id,
        assigned_to_id: formData.assigned_to_id || null,
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      const created = await taskService.createTask(payload);
      if (onTaskCreated) onTaskCreated(created);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        project_id: initialProjectId || '',
        assigned_to_id: '',
        priority: 'MEDIUM',
        status: 'TODO',
        deadline: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Implement authentication middleware"
            className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none placeholder-slate-400 font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Project *
          </label>
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
            required
          >
            <option value="">Select a Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of deliverables and specifications..."
            className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none placeholder-slate-400 resize-none font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Assignee
            </label>
            <select
              name="assigned_to_id"
              value={formData.assigned_to_id}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Initial Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Deadline (Date & Time)
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-purple-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Create Task</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
