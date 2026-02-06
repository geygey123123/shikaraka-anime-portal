import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Anime } from '../../types/anime';
import { shikimoriService } from '../../services/shikimori';

interface AnimeCardProps {
  anime: Anime;
  onClick: (id: number) => void;
}

const AnimeCardComponent: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  const queryClient = useQueryClient();
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
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img
          src={anime.image.preview}
          alt={displayName}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="anime-card-gradient absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.9)] via-transparent to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
            {displayName}
          </h3>
          
          <div className="flex items-center gap-3 text-xs">
            {/* Rating */}
            {anime.score && (
              <div className="flex items-center gap-1">
                <span className="text-[#ff0055]">★</span>
                <span className="text-gray-300">{anime.score}</span>
              </div>
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
