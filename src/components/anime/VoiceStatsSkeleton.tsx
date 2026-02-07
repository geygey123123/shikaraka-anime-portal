import React from 'react';

/**
 * Loading skeleton for voice stats tooltip
 */
export const VoiceStatsSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
};
