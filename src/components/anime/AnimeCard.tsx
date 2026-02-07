import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Play, Clock, Check, X, Pause, type LucideIcon } from 'lucide-react';
import { Anime } from '../../types/anime';
import { shikimoriService } from '../../services/shikimori';
import { RatingDisplay } from '../rating/RatingDisplay';
import { useAnimeRating } from '../../hooks/useRatings';
import type { WatchStatus } from '../../hooks/useFavorites';

interface AnimeCardProps {
  anime: Anime;
  onClick: (id: number) => void;
  watchStatus?: WatchStatus;
}

const STATUS_CONFIG: Record<WatchStatus, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  watching: { label: 'Смотрю', icon: Play, color: '#ff0055', bgColor: 'rgba(255, 0, 85, 0.9)' },
  plan_to_watch: { label: 'Планирую', icon: Clock, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.9)' },
  completed: { label: 'Завершено', icon: Check, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.9)' },
  dropped: { label: 'Брошено', icon: X, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.9)' },
  on_hold: { label: 'Отложено', icon: Pause, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.9)' },
};

const AnimeCardComponent: React.FC<AnimeCardProps> = ({ anime, onClick, watchStatus }) => {
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  
  // DEBUG: Log watchStatus
  if (watchStatus) {
    console.log('AnimeCard - watchStatus:', watchStatus, 'for anime:', anime.name);
  }
  
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
      className="anime-card bg-[#0a0a0c] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,0,85,0.3)] relative"
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
      <div className="relative w-full aspect-[2/3] bg-gray-900">
        <img
          src={imageError ? '/anime-placeholder.svg' : imageUrl}
          alt={displayName}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Watch Status Badge */}
        {watchStatus && (
          <div 
            className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: STATUS_CONFIG[watchStatus].bgColor }}
          >
            {React.createElement(STATUS_CONFIG[watchStatus].icon, {
              size: 14,
              color: 'white',
              strokeWidth: 2.5
            })}
            <span className="text-white text-xs font-semibold">
              {STATUS_CONFIG[watchStatus].label}
            </span>
          </div>
        )}
        
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
