import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { RoleBadge } from '../components/common/Badge';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  User
} from 'lucide-react';

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New user modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'TEAM_MEMBER',
  });
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Delete user dialog
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await userService.getTeamStats();
      setTeamStats(stats);
    } catch (err) {
      setError('Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserData.full_name.trim() || !newUserData.username.trim() || !newUserData.email.trim() || !newUserData.password) {
      setError('All fields are required.');
      return;
    }
    setAddUserLoading(true);
    setError(null);
    try {
      await userService.createUser(newUserData);
      setIsAddUserOpen(false);
      setNewUserData({
        full_name: '',
        username: '',
        email: '',
        password: '',
        role: 'TEAM_MEMBER',
      });
      loadTeam();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user.');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUser(deleteTargetUser.id);
      setDeleteTargetUser(null);
      loadTeam();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Team Member Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Manage user accounts, assign workspace roles, and monitor team task workloads.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading team members...</p>
          </div>
        )}

        {/* Team Table */}
        {!loading && (
          <div className="glass-card rounded-2xl border border-purple-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 bg-purple-50/50 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Assigned Tasks</th>
                    <th className="py-3.5 px-4">Completed</th>
                    <th className="py-3.5 px-4">Pending</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {teamStats.map((member) => (
                    <tr key={member.id} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 font-bold flex items-center justify-center text-xs">
                            {member.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{member.full_name}</div>
                            <div className="text-slate-500 text-[11px]">@{member.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {member.total_assigned_tasks}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {member.completed_tasks}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-700">
                        {member.pending_tasks}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {member.id !== currentUser?.id ? (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetUser(member)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-200 transition cursor-pointer shadow-xs"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New Team Member"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={newUserData.full_name}
              onChange={(e) => setNewUserData((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="e.g. Rachel Green"
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username *
            </label>
            <input
              type="text"
              value={newUserData.username}
              onChange={(e) => setNewUserData((p) => ({ ...p, username: e.target.value }))}
              placeholder="e.g. rachel_g"
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData((p) => ({ ...p, email: e.target.value }))}
              placeholder="rachel@teamflow.com"
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Temporary Password *
            </label>
            <input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Role
            </label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
            >
              <option value="TEAM_MEMBER">Team Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-purple-100">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addUserLoading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {addUserLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetUser}
        onClose={() => setDeleteTargetUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account?"
        message={`Are you sure you want to delete ${deleteTargetUser?.full_name} (${deleteTargetUser?.email})? Their assigned tasks will remain in projects as unassigned.`}
        confirmText="Delete User"
        loading={deleteLoading}
      />
    </AppLayout>
  );
}
