import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  count: number;
  variant?: 'card' | 'detail';
  className?: string;
}

/**
 * RatingDisplay component - Displays anime rating with star visualization
 * 
 * @param rating - The rating value to display (0-10)
 * @param count - Number of ratings
 * @param variant - Display variant: 'card' for simple average on cards, 'detail' for Bayesian on detail pages
 * @param className - Additional CSS classes
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  count,
  variant = 'card',
  className = '',
}) => {
  // Convert 10-point rating to 5-star scale for visualization
  const starRating = rating / 2;
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;

  // Format rating display
  const formattedRating = rating > 0 ? rating.toFixed(1) : '—';

  if (variant === 'card') {
    // Compact display for anime cards
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Star className="text-[#ff0055]" size={16} fill="#ff0055" />
        <span className="text-gray-300 text-sm font-medium">{formattedRating}</span>
      </div>
    );
  }

  // Detailed display for anime detail pages
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Star visualization */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, index) => {
            const isFilled = index < fullStars;
            const isHalf = index === fullStars && hasHalfStar;

            return (
              <div key={index} className="relative">
                {isHalf ? (
                  <>
                    {/* Half star effect */}
                    <Star
                      size={20}
                      className="text-gray-600"
                      fill="none"
                      stroke="currentColor"
                    />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                      <Star
                        size={20}
                        className="text-[#ff0055]"
                        fill="#ff0055"
                        stroke="#ff0055"
                      />
                    </div>
                  </>
                ) : (
                  <Star
                    size={20}
                    className={isFilled ? 'text-[#ff0055]' : 'text-gray-600'}
                    fill={isFilled ? '#ff0055' : 'none'}
                    stroke="currentColor"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Rating value */}
        <span className="text-2xl font-bold text-white">{formattedRating}</span>
        <span className="text-gray-400 text-sm">/ 10</span>
      </div>

      {/* Rating count */}
      <div className="text-sm text-gray-400">
        {count === 0 ? (
          'Нет оценок'
        ) : count === 1 ? (
          '1 оценка'
        ) : count < 5 ? (
          `${count} оценки`
        ) : (
          `${count} оценок`
        )}
      </div>
    </div>
  );
};
