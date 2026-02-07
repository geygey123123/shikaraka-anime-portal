import React from 'react';
import { BarChart3 } from 'lucide-react';

interface RatingStatsProps {
  average: number;
  count: number;
  distribution?: Record<number, number>;
  className?: string;
}

/**
 * RatingStats component - Displays rating distribution and statistics
 * 
 * @param average - Average rating value
 * @param count - Total number of ratings
 * @param distribution - Optional rating distribution (rating value -> count)
 * @param className - Additional CSS classes
 */
export const RatingStats: React.FC<RatingStatsProps> = ({
  average,
  count,
  distribution,
  className = '',
}) => {
  // Calculate distribution percentages
  const getDistributionPercentage = (rating: number): number => {
    if (!distribution || count === 0) return 0;
    return ((distribution[rating] || 0) / count) * 100;
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-[#ff0055]" size={20} />
        <h3 className="text-lg font-semibold text-white">Статистика оценок</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-800">
        <div>
          <p className="text-gray-400 text-sm mb-1">Средняя оценка</p>
          <p className="text-2xl font-bold text-white">
            {count > 0 ? average.toFixed(1) : '—'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Всего оценок</p>
          <p className="text-2xl font-bold text-white">{count}</p>
        </div>
      </div>

      {/* Distribution bars */}
      {distribution && count > 0 && (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm mb-3">Распределение оценок</p>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
            const percentage = getDistributionPercentage(rating);
            const ratingCount = distribution[rating] || 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                {/* Rating label */}
                <span className="text-gray-400 text-sm w-6 text-right">{rating}</span>

                {/* Progress bar */}
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#ff0055] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Count */}
                <span className="text-gray-500 text-xs w-8 text-right">
                  {ratingCount > 0 ? ratingCount : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {count === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            Пока нет оценок. Будьте первым!
          </p>
        </div>
      )}
    </div>
  );
};
