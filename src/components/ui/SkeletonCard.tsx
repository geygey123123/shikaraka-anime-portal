import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden animate-pulse ${className}`}
      role="status"
      aria-label="Loading..."
    >
      {/* Image skeleton */}
      <div className="w-full aspect-[2/3] bg-gray-800" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        
        {/* Rating and year skeleton */}
        <div className="flex gap-2">
          <div className="h-3 bg-gray-800 rounded w-12" />
          <div className="h-3 bg-gray-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
};
