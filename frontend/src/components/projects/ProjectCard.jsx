import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Users, 
  ChevronRight,
  User
} from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Active</span>;
      case 'PLANNING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Planning</span>;
      case 'ON_HOLD':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">On Hold</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Completed</span>;
      default:
        return null;
    }
  };

  const progress = project.progress || {
    total_tasks: 0,
    completed_tasks: 0,
    completion_percentage: 0,
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="glass-card glass-card-hover rounded-2xl p-5 border border-purple-100 flex flex-col justify-between space-y-4 cursor-pointer group hover:border-purple-300"
    >
      <div className="space-y-3">
        {/* Top bar: Icon & Status */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:scale-105 transition">
            <FolderKanban className="w-5 h-5" />
          </div>
          {getStatusBadge(project.status)}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition line-clamp-1">
            {project.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {project.description || <span className="italic text-slate-400">No description provided.</span>}
          </p>
        </div>
      </div>

      {/* Progress & Metrics */}
      <div className="space-y-3 pt-2">
        <ProgressBar percentage={progress.completion_percentage} size="sm" />

        <div className="flex items-center justify-between pt-2 border-t border-purple-50 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px] text-slate-700 font-medium">
              {project.creator?.full_name || 'Admin'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-purple-700 font-semibold">
            <span>{progress.completed_tasks}/{progress.total_tasks} Tasks</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>
  );
}
