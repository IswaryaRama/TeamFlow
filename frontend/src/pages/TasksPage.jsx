import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import DeadlineHistoryModal from '../components/tasks/DeadlineHistoryModal';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  User,
  History,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(!isAdmin);

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [historyTask, setHistoryTask] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [projs, userSummaries] = await Promise.all([
        projectService.getProjects(),
        userService.getUserSummaries(),
      ]);
      setProjects(projs);
      setUsers(userSummaries);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
    loadTasks();
  };

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const myTasksCount = tasks.filter((t) => t.assigned_to_id === user?.id).length;

  // Client-side filtering logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

    const matchesProject = selectedProject === 'ALL' || t.project_id === selectedProject;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
    const matchesAssignedToMe = !assignedToMeOnly || t.assigned_to_id === user?.id;

    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesAssignedToMe;
  });

  const columns = [
    { key: 'TODO', label: 'To Do', border: 'border-purple-200', badge: 'bg-slate-100 text-slate-700' },
    { key: 'IN_PROGRESS', label: 'In Progress', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-800' },
    { key: 'IN_REVIEW', label: 'In Review', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' },
    { key: 'COMPLETED', label: 'Completed', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  ];

  const formatDate = (iso) => {
    if (!iso) return 'None';
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Task Workflows
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Tasks & Kanban Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Filter tasks by project, priority, and status. Review and modify deadlines with full audit trail.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white border border-purple-200 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'board' ? 'bg-purple-100 text-purple-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-purple-100 text-purple-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Member Scope Switcher (My Tasks vs All Team Tasks) */}
        {!isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAssignedToMeOnly(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 border shadow-xs ${
                assignedToMeOnly
                  ? 'bg-purple-600 text-white border-purple-600 shadow-purple-600/20'
                  : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Tasks ({myTasksCount})</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                assignedToMeOnly ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800'
              }`}>
                Editable
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAssignedToMeOnly(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 border shadow-xs ${
                !assignedToMeOnly
                  ? 'bg-purple-600 text-white border-purple-600 shadow-purple-600/20'
                  : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>All Team Tasks ({tasks.length})</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                !assignedToMeOnly ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                Read Only for others
              </span>
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="glass-card p-4 rounded-2xl border border-purple-100 space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Project Filter */}
            <div>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading tasks...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ===================== KANBAN BOARD VIEW ===================== */}
        {!loading && !error && viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.key);
              return (
                <div
                  key={col.key}
                  className="bg-white rounded-2xl p-4 border-2 border-purple-100/90 space-y-4 min-h-[500px] flex flex-col shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {col.label}
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] p-2 pt-2.5">
                    {colTasks.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-purple-100/80 rounded-xl text-center text-slate-400 text-xs italic font-medium">
                        No tasks in {col.label}
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          onClick={() => {
                            setSelectedTaskId(t.id);
                            setIsTaskDetailOpen(true);
                          }}
                          onHistoryClick={(tObj) => setHistoryTask(tObj)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================== TABLE LIST VIEW ===================== */}
        {!loading && !error && viewMode === 'list' && (
          <div className="glass-card rounded-2xl border border-purple-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 bg-purple-50/50 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4 text-center">Audit Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                        No tasks found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setIsTaskDetailOpen(true);
                        }}
                        className="hover:bg-purple-50/40 transition cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{t.title}</span>
                            {!isAdmin && t.assigned_to_id !== user?.id && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0">
                                Read Only
                              </span>
                            )}
                          </div>
                          {t.description && (
                            <div className="text-slate-500 text-[11px] line-clamp-1">
                              {t.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5 text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px]">
                              {t.assignee?.full_name?.charAt(0) || '?'}
                            </div>
                            <span>{t.assignee?.full_name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(t.deadline)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.deadline_history_count > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHistoryTask(t);
                              }}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold cursor-pointer"
                            >
                              <History className="w-3 h-3" />
                              <span>{t.deadline_history_count} logs</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={() => loadTasks()}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        taskId={selectedTaskId}
        onTaskUpdated={() => loadTasks()}
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
