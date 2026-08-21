import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { taskService } from '../../services/taskService';
import { 
  Clock, 
  ArrowRight, 
  Calendar, 
  User, 
  Info, 
  History,
  AlertCircle
} from 'lucide-react';

export default function DeadlineHistoryModal({ isOpen, onClose, task }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && task?.id) {
      loadHistory(task.id);
    }
  }, [isOpen, task?.id]);

  const loadHistory = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getDeadlineHistory(taskId);
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load deadline history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'None (No Deadline)';
    let s = String(isoString).trim();
    if (s.includes('T') && !s.endsWith('Z') && !s.slice(10).includes('+') && !s.slice(10).includes('-')) {
      s += 'Z';
    } else if (!s.includes('T') && s.includes(' ') && !s.endsWith('Z') && !s.includes('+')) {
      s = s.replace(' ', 'T') + 'Z';
    }
    const date = new Date(s);
    if (isNaN(date.getTime())) return 'None';
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deadline Change Audit History"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Task Summary Banner */}
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{task?.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Current Deadline:{' '}
              <span className="font-bold text-purple-900">
                {task?.deadline ? formatDate(task.deadline) : 'No deadline set'}
              </span>
            </p>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading audit history...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Audit History Timeline */}
        {!loading && !error && history.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-slate-800">No Deadline Modifications Recorded</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The deadline for this task has not been changed since creation. Any future edits by an Admin will appear here in chronological order.
            </p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center justify-between">
              <span>Change Timeline ({history.length} {history.length === 1 ? 'record' : 'records'})</span>
              <span className="text-[11px] text-purple-600 font-semibold">Newest First</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  </div>

                  {/* Timeline card */}
                  <div className="glass-card p-4 rounded-xl border border-purple-100 space-y-3 shadow-xs hover:border-purple-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {/* Changed By */}
                      <div className="flex items-center space-x-2 text-slate-700">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px]">
                          {item.changed_by?.full_name?.charAt(0) || 'A'}
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.changed_by?.full_name || 'Admin'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 font-semibold">
                          {item.changed_by?.role || 'ADMIN'}
                        </span>
                      </div>

                      {/* Changed At */}
                      <div className="text-slate-400 text-[11px] flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.changed_at)}</span>
                      </div>
                    </div>

                    {/* Deadline Comparison */}
                    <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          Previous Deadline
                        </span>
                        <span className="text-rose-600 font-semibold line-through">
                          {formatDate(item.previous_deadline)}
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center justify-center text-purple-400">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                      <div className="space-y-0.5 sm:text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          Updated Deadline
                        </span>
                        <span className="text-emerald-700 font-extrabold">
                          {formatDate(item.new_deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Reason Note */}
                    {item.reason && (
                      <div className="flex items-start space-x-1.5 text-xs text-slate-700 italic bg-purple-50/70 p-2 rounded-lg border border-purple-100 font-medium">
                        <Info className="w-3.5 h-3.5 mt-0.5 text-purple-600 flex-shrink-0" />
                        <span>&ldquo;{item.reason}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-purple-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
