import React from 'react';

export function SkeletonScreen({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="h-4 bg-slate-700 rounded w-full"></div>
      ))}
    </div>
  );
}

export function ProgressIndicator({ progress, total, label = 'Progress' }) {
  const percentage = total > 0 ? (progress / total) * 100 : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm text-gray-400">{progress} / {total}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} ${className}`}></div>
  );
}

export default { SkeletonScreen, ProgressIndicator, Spinner };
