import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import AppLayout from '../components/layout/AppLayout';
import ProjectCard from '../components/projects/ProjectCard';
import TaskCard from '../components/tasks/TaskCard';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';
import DeadlineHistoryModal from '../components/tasks/DeadlineHistoryModal';
import { PriorityBadge, StatusBadge, RoleBadge } from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import {
  Layers,
  FolderKanban,
  CheckSquare,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [historyTask, setHistoryTask] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const data = await dashboardService.getAdminMetrics();
        setMetrics(data);
      } else {
        const data = await dashboardService.getMemberMetrics();
        setMetrics(data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [isAdmin]);

  const handleOpenTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  const handleOpenHistory = (taskObj) => {
    setHistoryTask(taskObj);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-purple-100 text-purple-800 border border-purple-200">
                Workspace Overview
              </span>
              <RoleBadge role={user?.role} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-sans">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {isAdmin
                ? 'Manage projects, coordinate team assignments, and audit task deadlines.'
                : 'Track your assigned tasks, update statuses, and log your progress updates.'}
            </p>
          </div>

          {/* Quick Action Buttons for Admin */}
          {isAdmin && (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-purple-50/50 text-slate-700 text-xs font-semibold border border-purple-200 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>New Project</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading metrics and tasks...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ===================== ADMIN DASHBOARD ===================== */}
        {!loading && metrics && isAdmin && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Active Projects */}
              <div className="stat-card-violet p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm transition">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Active Projects</span>
                  <div className="text-3xl font-bold text-purple-950 tracking-tight">{metrics.summary?.total_projects || 0}</div>
                  <span className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Active Workspaces
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shadow-xs">
                  <FolderKanban className="w-6 h-6" />
                </div>
              </div>

              {/* Total Tasks */}
              <div className="stat-card-indigo p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm transition">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Total Tasks</span>
                  <div className="text-3xl font-bold text-indigo-950 tracking-tight">{metrics.summary?.total_tasks || 0}</div>
                  <span className="text-[11px] text-indigo-700 font-medium">{metrics.summary?.completed_tasks || 0} completed</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-xs">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>

              {/* Completion Rate */}
              <div className="stat-card-teal p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm transition">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Completion Rate</span>
                  <div className="text-3xl font-bold text-teal-950 tracking-tight">{metrics.summary?.completion_rate || 0}%</div>
                  <span className="text-[11px] text-teal-700 font-medium">Overall Velocity</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Overdue Tasks */}
              <div className="stat-card-rose p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm transition">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Overdue Tasks</span>
                  <div className="text-3xl font-bold text-rose-950 tracking-tight">{metrics.summary?.overdue_tasks || 0}</div>
                  <span className="text-[11px] text-rose-700 font-medium">Attention Needed</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Projects with Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-purple-600" />
                  <span>Recent Projects & Progress</span>
                </h2>
                <a href="/projects" className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 transition">
                  <span>View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {metrics.recent_projects?.length === 0 ? (
                <div className="p-8 text-center glass-card rounded-2xl border border-purple-100 text-slate-500 text-xs">
                  No projects created yet. Click "New Project" above to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {metrics.recent_projects?.map((proj) => (
                    <ProjectCard key={proj.id} project={proj} />
                  ))}
                </div>
              )}
            </div>

            {/* Team Workload Breakdown */}
            <div className="glass-card rounded-2xl p-6 border border-purple-100 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Team Workload & Task Distribution</span>
                </h2>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  {metrics.team_workload?.length || 0} Members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Member</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Assigned</th>
                      <th className="pb-3">Completed</th>
                      <th className="pb-3">Pending</th>
                      <th className="pb-3 w-48">Workload Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {metrics.team_workload?.map((member) => {
                      const compPct = member.total_assigned > 0
                        ? Math.round((member.completed / member.total_assigned) * 100)
                        : 0;
                      return (
                        <tr key={member.id} className="hover:bg-purple-50/40 transition">
                          <td className="py-3.5 font-semibold text-slate-900 flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs">
                              {member.full_name?.charAt(0)}
                            </div>
                            <span>{member.full_name}</span>
                          </td>
                          <td className="py-3.5">
                            <RoleBadge role={member.role} />
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700">{member.total_assigned}</td>
                          <td className="py-3.5 text-emerald-700 font-semibold">{member.completed}</td>
                          <td className="py-3.5 text-amber-700 font-semibold">{member.pending}</td>
                          <td className="py-3.5">
                            <ProgressBar percentage={compPct} size="sm" showLabel={false} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TEAM MEMBER DASHBOARD ===================== */}
        {!loading && metrics && !isAdmin && (
          <div className="space-y-8">
            {/* Member Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="stat-card-violet p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">My Assigned Tasks</span>
                  <div className="text-3xl font-bold text-purple-950 tracking-tight">{metrics.summary?.total_assigned || 0}</div>
                  <span className="text-[11px] text-purple-700 font-medium">Total Workload</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shadow-xs">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="stat-card-indigo p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">In Progress</span>
                  <div className="text-3xl font-bold text-indigo-950 tracking-tight">{metrics.summary?.in_progress_tasks || 0}</div>
                  <span className="text-[11px] text-indigo-700 font-medium">Active Tasks</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="stat-card-teal p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Completed</span>
                  <div className="text-3xl font-bold text-teal-950 tracking-tight">{metrics.summary?.completed_tasks || 0}</div>
                  <span className="text-[11px] text-teal-700 font-medium">{metrics.summary?.completion_rate || 0}% Completed</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="stat-card-rose p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Overdue Tasks</span>
                  <div className="text-3xl font-bold text-rose-950 tracking-tight">{metrics.summary?.overdue_tasks || 0}</div>
                  <span className="text-[11px] text-rose-700 font-medium">Attention Needed</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* My Active Tasks Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  <span>My Assigned Tasks</span>
                </h2>
                <a href="/tasks" className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 transition">
                  <span>Open Tasks Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {metrics.my_tasks?.length === 0 ? (
                <div className="p-8 text-center glass-card rounded-2xl border border-purple-100 text-slate-500 text-xs">
                  You currently have no tasks assigned to you.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {metrics.my_tasks?.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onClick={() => handleOpenTask(t.id)}
                      onHistoryClick={(tObj) => handleOpenHistory(tObj)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* My Assigned Projects */}
            {metrics.my_projects?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-purple-600" />
                  <span>My Project Memberships</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {metrics.my_projects?.map((proj) => (
                    <ProjectCard key={proj.id} project={proj} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        taskId={selectedTaskId}
        onTaskUpdated={() => loadDashboard()}
      />

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => loadDashboard()}
      />

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => loadDashboard()}
      />

      {/* Deadline History Modal */}
      <DeadlineHistoryModal
        isOpen={!!historyTask}
        onClose={() => setHistoryTask(null)}
        task={historyTask}
      />
    </AppLayout>
  );
}
