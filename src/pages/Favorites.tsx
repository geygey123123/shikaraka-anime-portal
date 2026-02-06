import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogIn } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { shikimoriService } from '../services/shikimori';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import type { Anime } from '../types/anime';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: favorites, isLoading: favoritesLoading, error: favoritesError } = useFavorites();
  
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoadingAnimes, setIsLoadingAnimes] = useState(false);
  const [animesError, setAnimesError] = useState<Error | null>(null);

  // Fetch full anime details for each favorite
  useEffect(() => {
    const fetchFavoriteAnimes = async () => {
      if (!favorites || favorites.length === 0) {
        setAnimes([]);
        return;
      }

      setIsLoadingAnimes(true);
      setAnimesError(null);

      try {
        // Fetch anime details for each favorite
        const animePromises = favorites.map(favorite =>
          shikimoriService.getAnimeById(favorite.shikimori_id)
        );
        
        const animeResults = await Promise.allSettled(animePromises);
        
        // Filter out failed requests and extract successful results
        const successfulAnimes = animeResults
          .filter((result): result is PromiseFulfilledResult<Anime> => result.status === 'fulfilled')
          .map(result => result.value);
        
        setAnimes(successfulAnimes);
      } catch (error) {
        console.error('Error fetching favorite animes:', error);
        setAnimesError(error as Error);
      } finally {
        setIsLoadingAnimes(false);
      }
    };

    fetchFavoriteAnimes();
  }, [favorites]);

  const handleAnimeClick = (id: number) => {
    navigate(`/anime/${id}`);
  };

  const handleRetry = () => {
    // Trigger refetch by navigating away and back
    window.location.reload();
  };

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <LogIn className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Войдите в аккаунт
          </h2>
          <p className="text-gray-400 mb-6">
            Чтобы просматривать избранное, необходимо войти в систему
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#ff0055] text-white rounded-lg hover:bg-[#cc0044] transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Empty favorites state
  if (!favoritesLoading && !isLoadingAnimes && favorites && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Избранное
            </h1>
            
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Heart className="w-16 h-16 text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                Ваш список избранного пуст
              </h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Добавляйте аниме в избранное, чтобы быстро находить их позже
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-[#ff0055] text-white rounded-lg hover:bg-[#cc0044] transition-colors"
              >
                Найти аниме
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Избранное
            </h1>
            {favorites && favorites.length > 0 && (
              <span className="text-gray-400">
                {favorites.length} {favorites.length === 1 ? 'аниме' : 'аниме'}
              </span>
            )}
          </div>

          <AnimeGrid
            animes={animes}
            isLoading={favoritesLoading || isLoadingAnimes}
            error={favoritesError || animesError}
            onAnimeClick={handleAnimeClick}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </div>
  );
};
