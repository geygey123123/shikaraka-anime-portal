import React, { useMemo } from 'react';
import { Anime } from '../../types/anime';
import { AnimeCard } from './AnimeCard';
import { SkeletonCard } from '../ui/SkeletonCard';
import { ErrorMessage } from '../ui/ErrorMessage';

interface AnimeGridProps {
  animes: Anime[];
  isLoading: boolean;
  error: Error | null;
  onAnimeClick: (id: number) => void;
  onRetry?: () => void;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  animes,
  isLoading,
  error,
  onAnimeClick,
  onRetry,
}) => {
  // Memoize skeleton array to prevent recreation on every render
  const skeletonCards = useMemo(() => 
    Array.from({ length: 12 }).map((_, index) => (
      <SkeletonCard key={index} />
    )),
    []
  );

  // Show skeleton screens while loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {skeletonCards}
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorMessage
          message={error.message || 'Не удалось загрузить аниме'}
          onRetry={onRetry}
          className="max-w-md"
        />
      </div>
    );
  }

  // Show empty state if no animes
  if (animes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-400 text-lg">Ничего не найдено</p>
      </div>
    );
  }

  // Render anime grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} onClick={onAnimeClick} />
      ))}
    </div>
  );
};
