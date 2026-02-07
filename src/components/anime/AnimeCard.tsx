import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Anime } from '../../types/anime';
import { shikimoriService } from '../../services/shikimori';
import { RatingDisplay } from '../rating/RatingDisplay';
import { useAnimeRating } from '../../hooks/useRatings';

interface AnimeCardProps {
  anime: Anime;
  onClick: (id: number) => void;
}

const AnimeCardComponent: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  
  // Fetch internal rating - use simple average for cards
  const { data: ratingData } = useAnimeRating(anime.id);
  
  // Добавляем базовый URL для изображений Shikimori
  const getImageUrl = (url: string) => {
    if (!url) return '/anime-placeholder.svg';
    if (url.startsWith('http')) return url;
    return `https://shikimori.one${url}`;
  };
  
  const [imageUrl, setImageUrl] = useState(getImageUrl(anime.image.preview));
  
  const displayName = anime.russian || anime.name;
  const year = anime.aired_on ? new Date(anime.aired_on).getFullYear() : 'N/A';
  
  // Prefetch anime details on hover for instant page load
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['anime', 'details', anime.id],
      queryFn: () => shikimoriService.getAnimeById(anime.id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };
  
  // Handle image loading errors with fallback strategy
  const handleImageError = () => {
    if (!imageError) {
      // First try: attempt to use original image URL
      if (imageUrl === getImageUrl(anime.image.preview) && anime.image.original) {
        setImageUrl(getImageUrl(anime.image.original));
      } else {
        // Final fallback: use placeholder
        setImageError(true);
      }
    }
  };
  
  return (
    <div
      className="anime-card bg-[#0a0a0c] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,0,85,0.3)]"
      onClick={() => onClick(anime.id)}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(anime.id);
        }
      }}
    >
      {/* Poster with lazy loading */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-gray-900">
        <img
          src={imageError ? '/anime-placeholder.svg' : imageUrl}
          alt={displayName}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Gradient overlay */}
        <div className="anime-card-gradient absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.9)] via-transparent to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
            {displayName}
          </h3>
          
          <div className="flex items-center gap-3 text-xs">
            {/* Internal Rating - Use simple average for cards */}
            {ratingData && ratingData.count > 0 && (
              <RatingDisplay
                rating={ratingData.average}
                count={ratingData.count}
                variant="card"
              />
            )}
            
            {/* Year */}
            <span className="text-gray-400">{year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const AnimeCard = React.memo(AnimeCardComponent);
