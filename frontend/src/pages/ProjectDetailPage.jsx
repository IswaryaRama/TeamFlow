import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import DeadlineHistoryModal from '../components/tasks/DeadlineHistoryModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import { RoleBadge } from '../components/common/Badge';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  Users,
  CheckSquare,
  Plus,
  Trash2,
  UserPlus,
  UserX,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState(!isAdmin ? 'MINE' : 'ALL'); // 'ALL' or 'MINE'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Member management state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [memberAddLoading, setMemberAddLoading] = useState(false);

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [historyTask, setHistoryTask] = useState(null);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, taskData] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasks({ project_id: id }),
      ]);
      setProject(projData);
      setTasks(taskData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddMemberModal = async () => {
    try {
      const allUsers = await userService.getUserSummaries();
      const existingMemberIds = project.members?.map((m) => m.user?.id) || [];
      const nonMembers = allUsers.filter((u) => !existingMemberIds.includes(u.id));
      setAvailableUsers(nonMembers);
      if (nonMembers.length > 0) setSelectedUserToAdd(nonMembers[0].id);
      setIsAddMemberOpen(true);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserToAdd) return;
    setMemberAddLoading(true);
    try {
      await projectService.addMember(project.id, selectedUserToAdd);
      setIsAddMemberOpen(false);
      loadProjectDetails();
    } catch (err) {
      setError('Failed to add member to project.');
    } finally {
      setMemberAddLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectService.removeMember(project.id, userId);
      loadProjectDetails();
    } catch (err) {
      setError('Failed to remove member.');
    }
  };

  const handleDeleteProject = async () => {
    setDeleteLoading(true);
    try {
      await projectService.deleteProject(project.id);
      navigate('/projects');
    } catch (err) {
      setError('Failed to delete project.');
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading project details & tasks...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className="p-8 text-center glass-card rounded-2xl border border-purple-100 space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Project Not Found</h3>
          <p className="text-xs text-slate-600">{error || 'The requested project could not be found.'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            Back to Projects
          </button>
        </div>
      </AppLayout>
    );
  }

  const progress = project.progress || {
    total_tasks: 0,
    completed_tasks: 0,
    completion_percentage: 0,
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Back Link & Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Project Workspace
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {project.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                {project.description || 'No project description provided.'}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteProjectOpen(true)}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-400 transition cursor-pointer shadow-xs"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Progress Statistics Banner */}
        <div className="glass-card rounded-2xl p-6 border border-purple-100 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Overall Completion Progress</h3>
              <p className="text-xs text-slate-600">
                {progress.completed_tasks} of {progress.total_tasks} total deliverables completed
              </p>
            </div>
            <div className="text-2xl font-black text-purple-900">
              {progress.completion_percentage}%
            </div>
          </div>
          <ProgressBar percentage={progress.completion_percentage} size="md" showLabel={false} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-100 text-center">
            {/* To Do Card */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'TODO' ? 'ALL' : 'TODO')}
              className={`p-3 rounded-xl border transition cursor-pointer text-center group ${
                statusFilter === 'TODO'
                  ? 'bg-purple-100/90 border-purple-400 ring-2 ring-purple-400 shadow-xs'
                  : 'bg-purple-50/70 border-purple-100 hover:bg-purple-100/50 hover:border-purple-200'
              }`}
              title={statusFilter === 'TODO' ? 'Click to show all tasks' : 'Click to filter To Do tasks'}
            >
              <span className="text-[11px] text-slate-500 font-semibold block group-hover:text-purple-900">To Do</span>
              <span className="text-base font-extrabold text-slate-900">{progress.todo_tasks || 0}</span>
            </button>

            {/* In Progress Card */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
              className={`p-3 rounded-xl border transition cursor-pointer text-center group ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-purple-100/90 border-purple-400 ring-2 ring-purple-400 shadow-xs'
                  : 'bg-purple-50/70 border-purple-100 hover:bg-purple-100/50 hover:border-purple-200'
              }`}
              title={statusFilter === 'IN_PROGRESS' ? 'Click to show all tasks' : 'Click to filter In Progress tasks'}
            >
              <span className="text-[11px] text-purple-700 font-semibold block group-hover:text-purple-950">In Progress</span>
              <span className="text-base font-extrabold text-purple-900">{progress.in_progress_tasks || 0}</span>
            </button>

            {/* In Review Card */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'IN_REVIEW' ? 'ALL' : 'IN_REVIEW')}
              className={`p-3 rounded-xl border transition cursor-pointer text-center group ${
                statusFilter === 'IN_REVIEW'
                  ? 'bg-indigo-100/90 border-indigo-400 ring-2 ring-indigo-400 shadow-xs'
                  : 'bg-purple-50/70 border-purple-100 hover:bg-purple-100/50 hover:border-purple-200'
              }`}
              title={statusFilter === 'IN_REVIEW' ? 'Click to show all tasks' : 'Click to filter In Review tasks'}
            >
              <span className="text-[11px] text-indigo-700 font-semibold block group-hover:text-indigo-950">In Review</span>
              <span className="text-base font-extrabold text-indigo-900">{progress.in_review_tasks || 0}</span>
            </button>

            {/* Completed Card */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
              className={`p-3 rounded-xl border transition cursor-pointer text-center group ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-400 shadow-xs'
                  : 'bg-purple-50/70 border-purple-100 hover:bg-purple-100/50 hover:border-purple-200'
              }`}
              title={statusFilter === 'COMPLETED' ? 'Click to show all tasks' : 'Click to filter Completed tasks'}
            >
              <span className="text-[11px] text-emerald-700 font-semibold block group-hover:text-emerald-950">Completed</span>
              <span className="text-base font-extrabold text-emerald-900">{progress.completed_tasks || 0}</span>
            </button>
          </div>
        </div>

        {/* Members Roster */}
        <div className="glass-card rounded-2xl p-6 border border-purple-100 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                Assigned Team Members ({project.members?.length || 0})
              </h3>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAddMemberModal}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {project.members?.map((m) => {
              const mTasks = (tasks || []).filter((t) => t.assigned_to_id === m.user?.id);
              const mCompleted = mTasks.filter((t) => t.status === 'COMPLETED').length;
              const mTotal = mTasks.length;
              const mPct = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-white/90 border border-purple-100 flex flex-col justify-between space-y-3 group shadow-xs hover:border-purple-300 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {m.user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{m.user?.full_name}</div>
                        <RoleBadge role={m.user?.role} />
                      </div>
                    </div>

                    {isAdmin && m.user?.id !== project.created_by_id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.user?.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove from project"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Individual Member Progress */}
                  <div className="space-y-1 pt-2 border-t border-purple-50">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {mTotal === 0 ? 'No tasks' : `${mCompleted}/${mTotal} tasks done`}
                      </span>
                      <span className={`font-bold ${mPct === 100 ? 'text-emerald-700' : 'text-purple-800'}`}>
                        {mPct}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-50 rounded-full h-1.5 overflow-hidden border border-purple-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          mPct === 100 ? 'bg-emerald-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${mPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Tasks */}
        {(() => {
          const myProjectTasks = (tasks || []).filter((t) => t.assigned_to_id === user?.id);
          let displayedTasks = taskFilter === 'MINE' ? myProjectTasks : tasks;
          if (statusFilter !== 'ALL') {
            displayedTasks = displayedTasks.filter((t) => t.status === statusFilter);
          }

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-600" />
                    <span>Project Tasks ({tasks.length})</span>
                  </h3>

                  {/* Filter Switcher for Members & Admins */}
                  <div className="flex items-center p-0.5 rounded-xl bg-purple-50 border border-purple-200">
                    <button
                      type="button"
                      onClick={() => setTaskFilter('MINE')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        taskFilter === 'MINE'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-purple-800'
                      }`}
                    >
                      My Tasks ({myProjectTasks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        taskFilter === 'ALL'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-purple-800'
                      }`}
                    >
                      All Tasks ({tasks.length})
                    </button>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>

              {displayedTasks.length === 0 ? (
                <div className="p-12 text-center glass-card rounded-2xl border border-purple-100 text-slate-500 text-xs shadow-xs">
                  {taskFilter === 'MINE'
                    ? 'You have no tasks assigned to you in this project.'
                    : 'No tasks in this project yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      projectName={project?.title}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setIsTaskDetailOpen(true);
                      }}
                      onHistoryClick={(tObj) => setHistoryTask(tObj)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Member to Project"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {availableUsers.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              All active users are already members of this project.
            </p>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Team Member
              </label>
              <select
                value={selectedUserToAdd}
                onChange={(e) => setSelectedUserToAdd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role}) - {u.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-purple-100">
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            {availableUsers.length > 0 && (
              <button
                type="submit"
                disabled={memberAddLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shadow-md shadow-purple-500/20 disabled:opacity-50"
              >
                {memberAddLoading ? 'Adding...' : 'Add Member'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        initialProjectId={project.id}
        onTaskCreated={() => loadProjectDetails()}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        taskId={selectedTaskId}
        onTaskUpdated={() => loadProjectDetails()}
      />

      {/* Deadline History Modal */}
      <DeadlineHistoryModal
        isOpen={!!historyTask}
        onClose={() => setHistoryTask(null)}
        task={historyTask}
      />

      {/* Delete Project Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to delete "${project.title}"? This will permanently delete all associated tasks, comments, and deadline history logs.`}
        confirmText="Delete Project"
        loading={deleteLoading}
      />
    </AppLayout>
  );
}
