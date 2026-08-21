import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { PriorityBadge, StatusBadge, RoleBadge } from '../common/Badge';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import DeadlineHistoryModal from './DeadlineHistoryModal';
import {
  Calendar,
  User,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  History,
  FolderKanban,
  AlertTriangle,
  UserPlus,
  Check,
  Lock,
  Eye
} from 'lucide-react';

const parseUtcDate = (iso) => {
  if (!iso) return null;
  let s = String(iso).trim();
  if (s.includes('T') && !s.endsWith('Z') && !s.slice(10).includes('+') && !s.slice(10).includes('-')) {
    s += 'Z';
  } else if (!s.includes('T') && s.includes(' ') && !s.endsWith('Z') && !s.includes('+')) {
    s = s.replace(' ', 'T') + 'Z';
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export default function TaskDetailModal({
  isOpen,
  onClose,
  taskId,
  onTaskUpdated,
}) {
  const { user, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Assignee edit state
  const [usersList, setUsersList] = useState([]);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assigneeSaveLoading, setAssigneeSaveLoading] = useState(false);

  // Deadline edit mode state
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [deadlineReason, setDeadlineReason] = useState('');
  const [deadlineSaveLoading, setDeadlineSaveLoading] = useState(false);

  // Status update state
  const [statusLoading, setStatusLoading] = useState(false);

  // History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskData(taskId);
    }
  }, [isOpen, taskId]);

  const loadTaskData = async (id) => {
    setLoading(true);
    setError(null);
    setIsEditingAssignee(false);
    setIsEditingDeadline(false);
    try {
      const [taskData, commentsData, usersData] = await Promise.all([
        taskService.getTask(id),
        taskService.getComments(id),
        userService.getUserSummaries().catch(() => []),
      ]);
      setTask(taskData);
      setComments(commentsData);
      setUsersList(usersData || []);
      setSelectedAssigneeId(taskData.assigned_to_id || '');

      if (taskData.deadline) {
        const d = parseUtcDate(taskData.deadline);
        if (d) {
          const pad = (n) => String(n).padStart(2, '0');
          const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setNewDeadlineDate(localIso);
        } else {
          setNewDeadlineDate('');
        }
      } else {
        setNewDeadlineDate('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const updated = await taskService.updateTask(task.id, { status: newStatus });
      setTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveAssignee = async (e) => {
    e?.preventDefault?.();
    setAssigneeSaveLoading(true);
    setError(null);
    try {
      const targetUserId = selectedAssigneeId ? selectedAssigneeId : null;
      const updated = await taskService.updateTask(task.id, {
        assigned_to_id: targetUserId,
      });
      setTask(updated);
      setIsEditingAssignee(false);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update assigned member');
    } finally {
      setAssigneeSaveLoading(false);
    }
  };

  const handleSaveDeadline = async (e) => {
    e.preventDefault();
    if (!newDeadlineDate) {
      setError('Please select a valid deadline date.');
      return;
    }
    setDeadlineSaveLoading(true);
    setError(null);
    try {
      const updated = await taskService.updateTask(task.id, {
        deadline: new Date(newDeadlineDate).toISOString(),
        deadline_change_reason: deadlineReason.trim() || 'Deadline adjusted by Admin',
      });
      setTask(updated);
      setIsEditingDeadline(false);
      setDeadlineReason('');
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update deadline');
    } finally {
      setDeadlineSaveLoading(false);
    }
  };

  const handleClearDeadline = async () => {
    setDeadlineSaveLoading(true);
    setError(null);
    try {
      const updated = await taskService.updateTask(task.id, {
        deadline: null,
        deadline_change_reason: 'Deadline removed by Admin',
      });
      setTask(updated);
      setIsEditingDeadline(false);
      setNewDeadlineDate('');
      setDeadlineReason('');
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to clear deadline');
    } finally {
      setDeadlineSaveLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const created = await taskService.addComment(task.id, newComment);
      setComments((prev) => [...prev, created]);
      setNewComment('');
      setTask((prev) => ({ ...prev, comments_count: (prev?.comments_count || 0) + 1 }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskService.deleteComment(task.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTask((prev) => ({ ...prev, comments_count: Math.max(0, (prev?.comments_count || 1) - 1) }));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'None (No deadline)';
    const d = parseUtcDate(iso);
    if (!d) return 'None';
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isOverdue = task?.deadline && parseUtcDate(task.deadline) < new Date() && task?.status !== 'COMPLETED';
  const isAssignedToMe = task?.assigned_to_id === user?.id;
  const canEditStatus = isAdmin || isAssignedToMe;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Task Overview & Updates" maxWidth="max-w-3xl">
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading task details...</p>
          </div>
        )}

        {!loading && task && (
          <div className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Task Header & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.project_title && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
                    <span>{task.project_title}</span>
                  </span>
                )}
                {isOverdue && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {task.title}
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 font-medium">
                {task.description || <span className="italic text-slate-400">No description provided.</span>}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee Card */}
              <div className="glass-card p-4 rounded-xl border border-purple-100 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Assigned To</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAssignee(!isEditingAssignee)}
                      className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingAssignee ? 'Cancel' : (task.assignee ? 'Change Member' : '+ Assign Member')}</span>
                    </button>
                  )}
                </div>

                {!isEditingAssignee ? (
                  <div className="flex items-center space-x-2 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs">
                      {task.assignee?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {task.assignee?.full_name || 'Unassigned'}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {task.assignee ? (task.assignee.role || 'Team Member') : 'No member assigned'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAssignee} className="pt-1 space-y-2 animate-fadeIn">
                    <select
                      value={selectedAssigneeId}
                      onChange={(e) => setSelectedAssigneeId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="">-- Unassigned (No Assignee) --</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.role})
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAssignee(false)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={assigneeSaveLoading}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg flex items-center space-x-1 shadow-xs disabled:opacity-50"
                      >
                        {assigneeSaveLoading ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Save Assignee</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Deadline & Audit Card */}
              <div className="glass-card p-4 rounded-xl border border-purple-100 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Task Deadline</span>
                  </div>
                  {/* Deadline History Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition cursor-pointer"
                  >
                    <History className="w-3 h-3" />
                    <span>History ({task.deadline_history_count || 0})</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                      {formatDate(task.deadline)}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDeadline(!isEditingDeadline)}
                      className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingDeadline ? 'Cancel' : 'Change Deadline'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Deadline Edit Box */}
            {isAdmin && isEditingDeadline && (
              <form onSubmit={handleSaveDeadline} className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-purple-700" />
                  <span>Update Deadline (Triggers Audit History Log)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">New Deadline Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newDeadlineDate}
                      onChange={(e) => setNewDeadlineDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Deadline Change</label>
                    <input
                      type="text"
                      placeholder="e.g. Scope extension, client feedback"
                      value={deadlineReason}
                      onChange={(e) => setDeadlineReason(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  {task.deadline && (
                    <button
                      type="button"
                      onClick={handleClearDeadline}
                      disabled={deadlineSaveLoading}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                    >
                      Clear Deadline
                    </button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsEditingDeadline(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deadlineSaveLoading}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-purple-500/20 disabled:opacity-50"
                    >
                      {deadlineSaveLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>Save & Log Deadline</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Status Section: Editable for Admin & Assigned Owner; Read-Only for others */}
            {canEditStatus ? (
              <div className="glass-card p-4 rounded-xl border border-purple-100 space-y-2 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-800">
                  Update Task Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'TODO', label: 'To Do', color: 'hover:border-slate-400' },
                    { value: 'IN_PROGRESS', label: 'In Progress', color: 'hover:border-purple-400' },
                    { value: 'IN_REVIEW', label: 'In Review', color: 'hover:border-indigo-400' },
                    { value: 'COMPLETED', label: 'Completed', color: 'hover:border-emerald-400' },
                  ].map((s) => {
                    const isCurrent = task.status === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        disabled={statusLoading}
                        onClick={() => handleStatusChange(s.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                          isCurrent
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                            : `bg-white text-slate-700 border-purple-200 ${s.color}`
                        } disabled:opacity-50`}
                      >
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Task Status (Read-Only)</span>
                  </label>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-600 border border-slate-200">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>View Only</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Current Status:</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium italic">
                    Assigned to {task.assignee?.full_name || 'another member'} (Only owner or Admin can modify)
                  </span>
                </div>
              </div>
            )}

            {/* Comments & Progress Updates Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Comments & Progress Updates ({comments.length})</span>
                </div>
              </div>

              {/* Comment Stream */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No progress updates posted yet. Add a comment below to share your progress!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                            {c.author?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-slate-900">{c.author?.full_name}</span>
                          <RoleBadge role={c.author?.role} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400">{formatDate(c.created_at)}</span>
                          {(isAdmin || c.author_id === user?.id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-7 font-medium">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* New Comment Form */}
              <form onSubmit={handleAddComment} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Post a progress update or comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shadow-md shadow-purple-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Embedded Deadline History Modal */}
      <DeadlineHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        task={task}
      />
    </>
  );
}
