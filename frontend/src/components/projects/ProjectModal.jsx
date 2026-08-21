import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { AlertCircle, Users, Check } from 'lucide-react';

export default function ProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ACTIVE',
    member_ids: [],
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUserSummaries();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const toggleMember = (userId) => {
    setFormData((prev) => {
      const exists = prev.member_ids.includes(userId);
      return {
        ...prev,
        member_ids: exists
          ? prev.member_ids.filter((id) => id !== userId)
          : [...prev.member_ids, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Project title is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        member_ids: formData.member_ids,
      };

      const created = await projectService.createProject(payload);
      if (onProjectCreated) onProjectCreated(created);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'ACTIVE',
        member_ids: [],
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Project Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Mobile App Redesign"
            className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none placeholder-slate-400 font-medium"
            required
          />
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
            placeholder="Project goals, objectives, and scope..."
            className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none placeholder-slate-400 resize-none font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Team Members Multi-Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Assign Team Members</span>
            <span className="text-[11px] text-purple-700 font-bold">
              {formData.member_ids.length} selected
            </span>
          </label>
          <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-purple-50/50 border border-purple-100 rounded-xl">
            {users.length === 0 ? (
              <div className="text-xs text-slate-400 py-2 text-center">No other users found.</div>
            ) : (
              users.map((u) => {
                const isSelected = formData.member_ids.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleMember(u.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold shadow-xs'
                        : 'bg-white hover:bg-purple-50/70 text-slate-700 border border-purple-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                        {u.full_name?.charAt(0)}
                      </div>
                      <span className="font-semibold">{u.full_name}</span>
                      <span className="text-[10px] text-slate-500">({u.role})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-700 font-bold" />}
                  </button>
                );
              })
            )}
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
            <span>Create Project</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
