import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogIn, Play, Clock, Check, X, Pause, type LucideIcon } from 'lucide-react';
import { useFavorites, type WatchStatus } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { shikimoriService } from '../services/shikimori';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import type { Anime } from '../types/anime';

interface StatusTab {
  value: WatchStatus | 'all';
  label: string;
  icon: LucideIcon;
  color: string;
}

const STATUS_TABS: StatusTab[] = [
  { value: 'all', label: 'Все', icon: Heart, color: '#ff0055' },
  { value: 'watching', label: 'Смотрю', icon: Play, color: '#ff0055' },
  { value: 'plan_to_watch', label: 'Планирую', icon: Clock, color: '#3b82f6' },
  { value: 'completed', label: 'Завершено', icon: Check, color: '#10b981' },
  { value: 'dropped', label: 'Брошено', icon: X, color: '#ef4444' },
  { value: 'on_hold', label: 'Отложено', icon: Pause, color: '#f59e0b' },
];

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<WatchStatus | 'all'>('all');
  
  // Fetch favorites with optional filter
  const watchStatusFilter = selectedTab === 'all' ? undefined : selectedTab;
  const { data: favorites, isLoading: favoritesLoading, error: favoritesError } = useFavorites(watchStatusFilter);
  
  // Fetch all favorites for counts
  const { data: allFavorites } = useFavorites();
  
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [animesWithStatus, setAnimesWithStatus] = useState<Array<{ anime: Anime; watchStatus: WatchStatus }>>([]);
  const [isLoadingAnimes, setIsLoadingAnimes] = useState(false);
  const [animesError, setAnimesError] = useState<Error | null>(null);

  // Calculate counts for each status
  const statusCounts = React.useMemo(() => {
    if (!allFavorites) return {};
    
    const counts: Record<string, number> = {
      all: allFavorites.length,
    };
    
    STATUS_TABS.forEach(tab => {
      if (tab.value !== 'all') {
        counts[tab.value] = allFavorites.filter(
          f => f.watch_status === tab.value
        ).length;
      }
    });
    
    return counts;
  }, [allFavorites]);

  // Fetch full anime details for each favorite
  useEffect(() => {
    const fetchFavoriteAnimes = async () => {
      if (!favorites || favorites.length === 0) {
        setAnimes([]);
        setAnimesWithStatus([]);
        return;
      }

      setIsLoadingAnimes(true);
      setAnimesError(null);

      try {
        // Fetch anime details for each favorite
        const animePromises = favorites.map(favorite =>
          shikimoriService.getAnimeById(favorite.shikimori_id)
            .then(anime => ({ anime, watchStatus: favorite.watch_status }))
        );
        
        const animeResults = await Promise.allSettled(animePromises);
        
        // Filter out failed requests and extract successful results
        const successfulResults = animeResults
          .filter((result): result is PromiseFulfilledResult<{ anime: Anime; watchStatus: WatchStatus }> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value);
        
        setAnimesWithStatus(successfulResults);
        setAnimes(successfulResults.map(r => r.anime));
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
  if (!favoritesLoading && !isLoadingAnimes && allFavorites && allFavorites.length === 0) {
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
    <div className="min-h-screen bg-[#0a0a0c] pb-40">{/* Увеличено до pb-40 */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 pb-20">{/* Дополнительный padding */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Избранное
            </h1>
            {allFavorites && allFavorites.length > 0 && (
              <span className="text-gray-400">
                {allFavorites.length} {allFavorites.length === 1 ? 'аниме' : 'аниме'}
              </span>
            )}
          </div>

          {/* Status Tabs */}
          <div className="mb-8">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 min-w-max pr-4">
                {STATUS_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = selectedTab === tab.value;
                  const count = statusCounts[tab.value] || 0;

                  return (
                    <button
                      key={tab.value}
                      onClick={() => setSelectedTab(tab.value)}
                      className={`
                        flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg
                        transition-all duration-200 flex-shrink-0
                        ${isActive
                          ? 'bg-gray-800 text-white shadow-lg'
                          : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                        }
                        focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:ring-offset-2 focus:ring-offset-[#0a0a0c]
                        min-h-[44px] touch-manipulation
                      `}
                      aria-label={`Фильтр: ${tab.label}`}
                    >
                      <TabIcon 
                        size={18} 
                        color={isActive ? tab.color : undefined}
                        className="flex-shrink-0"
                      />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {tab.label}
                      </span>
                      {count > 0 && (
                        <span className={`
                          text-xs px-2 py-0.5 rounded-full flex-shrink-0
                          ${isActive ? 'bg-gray-700' : 'bg-gray-800'}
                        `}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Empty state for filtered results */}
          {!favoritesLoading && !isLoadingAnimes && favorites && favorites.length === 0 && selectedTab !== 'all' && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="text-gray-500 mb-2">
                {STATUS_TABS.find(t => t.value === selectedTab)?.icon && 
                  React.createElement(STATUS_TABS.find(t => t.value === selectedTab)!.icon, { 
                    size: 48, 
                    className: 'mx-auto mb-4' 
                  })
                }
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Нет аниме с этим статусом
              </h3>
              <p className="text-gray-500">
                Попробуйте выбрать другой статус или добавьте новые аниме
              </p>
            </div>
          )}

          {/* Anime Grid */}
          {(favorites && favorites.length > 0) && (
            <AnimeGrid
              animes={animes}
              isLoading={favoritesLoading || isLoadingAnimes}
              error={favoritesError || animesError}
              onAnimeClick={handleAnimeClick}
              onRetry={handleRetry}
              animesWithStatus={animesWithStatus}
            />
          )}
        </div>
      </div>
      
      {/* Spacer для комфортной прокрутки */}
      <div className="h-40" aria-hidden="true"></div>
    </div>
  );
};
