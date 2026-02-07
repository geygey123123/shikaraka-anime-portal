import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  animeId: number;
  currentRating?: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * RatingInput component - Interactive 10-star rating input
 * 
 * @param animeId - The anime ID being rated
 * @param currentRating - User's current rating (1-10) or null if not rated
 * @param onRate - Callback when user selects a rating
 * @param disabled - Whether the input is disabled (e.g., during submission)
 * @param className - Additional CSS classes
 */
export const RatingInput: React.FC<RatingInputProps> = ({
  currentRating,
  onRate,
  disabled = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleClick = (rating: number) => {
    if (!disabled) {
      onRate(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Determine which rating to display (hover takes precedence)
  const displayRating = hoverRating || currentRating || 0;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm font-medium">Ваша оценка:</span>
        {currentRating && !hoverRating && (
          <span className="text-[#ff0055] text-sm font-bold">{currentRating}/10</span>
        )}
        {hoverRating > 0 && (
          <span className="text-[#ff0055] text-sm font-bold">{hoverRating}/10</span>
        )}
      </div>

      {/* 10-star rating input */}
      <div
        className="flex items-center gap-1"
        onMouseLeave={handleMouseLeave}
        role="radiogroup"
        aria-label="Оценка аниме от 1 до 10"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
          const isFilled = rating <= displayRating;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              disabled={disabled}
              className={`
                transition-all duration-150 ease-in-out
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:ring-offset-2 focus:ring-offset-[#0a0a0c] rounded
              `}
              aria-label={`Оценить на ${rating} из 10`}
              role="radio"
              aria-checked={currentRating === rating}
            >
              <Star
                size={28}
                className={`
                  transition-colors duration-150
                  ${isFilled ? 'text-[#ff0055]' : 'text-gray-600'}
                `}
                fill={isFilled ? '#ff0055' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        {currentRating
          ? 'Нажмите на звезду, чтобы изменить оценку'
          : 'Нажмите на звезду, чтобы оценить'}
      </p>
    </div>
  );
};
