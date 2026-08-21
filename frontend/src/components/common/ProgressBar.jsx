import React from 'react';

export default function ProgressBar({ percentage = 0, showLabel = true, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const getGradient = (pct) => {
    if (pct === 100) return 'from-emerald-500 to-teal-500';
    if (pct >= 60) return 'from-purple-600 to-indigo-500';
    if (pct >= 25) return 'from-purple-600 to-violet-500';
    return 'from-purple-600 to-purple-500';
  };

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Progress</span>
          <span className="font-semibold text-purple-700">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-purple-50 rounded-full overflow-hidden p-0.5 border border-purple-200 ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(clamped)} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
