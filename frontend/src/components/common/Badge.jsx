import React from 'react';

export function PriorityBadge({ priority }) {
  const configs = {
    LOW: {
      label: 'Low',
      className: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-500',
    },
    MEDIUM: {
      label: 'Medium',
      className: 'bg-purple-50 text-purple-800 border-purple-200',
      dot: 'bg-purple-600',
    },
    HIGH: {
      label: 'High',
      className: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-600',
    },
    URGENT: {
      label: 'Urgent',
      className: 'bg-rose-50 text-rose-800 border-rose-300',
      dot: 'bg-rose-600 animate-ping',
    },
  };

  const config = configs[priority] || configs.MEDIUM;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const configs = {
    TODO: {
      label: 'To Do',
      className: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-500',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      className: 'bg-purple-50 text-purple-800 border-purple-200',
      dot: 'bg-purple-600 animate-pulse',
    },
    IN_REVIEW: {
      label: 'In Review',
      className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-600',
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-600',
    },
  };

  const config = configs[status] || configs.TODO;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export function RoleBadge({ role }) {
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
        ADMIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
      MEMBER
    </span>
  );
}
