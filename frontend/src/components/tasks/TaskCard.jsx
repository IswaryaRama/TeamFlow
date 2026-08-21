import React from 'react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  History, 
  AlertTriangle,
  FolderKanban,
  Lock,
  Eye
} from 'lucide-react';

export default function TaskCard({ task, projectName, onClick, onHistoryClick }) {
  const { user, isAdmin } = useAuth();

  const isAssignedToMe = task.assigned_to_id === user?.id;
  const isReadOnly = !isAdmin && !isAssignedToMe;
  const projectTitle = projectName || task.project_title || task.project?.title;

  const parseDate = (iso) => {
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

  const formatDate = (iso) => {
    const d = parseDate(iso);
    if (!d) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = task.deadline && parseDate(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border-2 flex flex-col justify-between space-y-3 cursor-pointer group transition-all duration-150 shadow-xs hover:shadow-md ${
        isReadOnly
          ? 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
          : 'border-purple-200 bg-white hover:border-purple-500'
      }`}
    >
      <div className="space-y-2">
        {/* Project Tag */}
        {projectTitle && (
          <div className="flex items-center">
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/80 truncate max-w-full">
              <FolderKanban className="w-3 h-3 text-violet-600 flex-shrink-0" />
              <span className="truncate">{projectTitle}</span>
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          {isReadOnly && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0">
              <Eye className="w-2.5 h-2.5" />
              <span>Read Only</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-purple-50 flex items-center justify-between text-xs text-slate-500 gap-2">
        {/* Assignee */}
        <div className="flex items-center space-x-1.5 truncate max-w-[120px]">
          <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 text-purple-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
            {task.assignee?.full_name?.charAt(0) || '?'}
          </div>
          <span className="truncate text-slate-700 text-[11px] font-medium">
            {task.assignee?.full_name || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Comments count */}
          {task.comments_count > 0 && (
            <div className="flex items-center space-x-1 text-slate-500 text-[11px]" title="Comments">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.comments_count}</span>
            </div>
          )}

          {/* Deadline History indicator */}
          {task.deadline_history_count > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onHistoryClick) onHistoryClick(task);
              }}
              className="flex items-center space-x-0.5 text-purple-800 hover:text-purple-900 text-[11px] px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 font-semibold"
              title="View deadline changes history"
            >
              <History className="w-3 h-3" />
              <span>{task.deadline_history_count}</span>
            </button>
          )}

          {/* Deadline */}
          {task.deadline && (
            <div
              className={`flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                isOverdue
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                  : 'text-slate-600 bg-purple-50/60 border border-purple-100'
              }`}
            >
              {isOverdue ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <Calendar className="w-3 h-3 text-purple-500" />}
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
