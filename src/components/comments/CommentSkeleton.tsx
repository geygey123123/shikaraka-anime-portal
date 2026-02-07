import React from 'react';

/**
 * CommentSkeleton - Loading skeleton for comments
 * Used while comments are being fetched
 */
export const CommentSkeleton: React.FC = () => {
  return (
    <div
      className="bg-gray-900 rounded-lg p-4 animate-pulse"
      role="status"
      aria-label="Loading comment..."
    >
      <div className="flex items-start gap-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
        
        <div className="flex-1 space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-800 rounded w-24" />
            <div className="h-3 bg-gray-800 rounded w-16" />
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-800 rounded w-5/6" />
            <div className="h-3 bg-gray-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CommentListSkeleton - Multiple comment skeletons
 */
export const CommentListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </div>
  );
};
