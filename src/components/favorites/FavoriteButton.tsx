import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites, useAddFavorite, useRemoveFavorite, useUpdateWatchStatus, type WatchStatus } from '../../hooks/useFavorites';
import { WatchStatusSelector } from './WatchStatusSelector';

interface FavoriteButtonProps {
  animeId: number;
  animeName: string;
}

/**
 * FavoriteButton компонент для добавления/удаления аниме из избранного
 * 
 * Требования:
 * - Проверяет, находится ли аниме в избранном
 * - Отображает заполненное/пустое сердце
 * - Обрабатывает добавление/удаление через mutations
 * - Показывает loading состояние
 * - Скрывается для неаутентифицированных пользователей
 * - Позволяет выбрать статус просмотра при добавлении
 * - Показывает текущий статус для избранных аниме
 * - Позволяет изменять статус просмотра
 * 
 * @param animeId - ID аниме в Shikimori
 * @param animeName - Название аниме
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  animeId, 
  animeName 
}) => {
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading: favoritesLoading } = useFavorites();
  const addMutation = useAddFavorite();
  const removeMutation = useRemoveFavorite();
  const updateStatusMutation = useUpdateWatchStatus();

  // Скрыть кнопку для неаутентифицированных пользователей
  if (!isAuthenticated) {
    return null;
  }

  // Найти аниме в избранном
  const favoriteItem = favorites?.find(favorite => favorite.shikimori_id === animeId);
  const isFavorite = !!favoriteItem;
  const currentStatus: WatchStatus = (favoriteItem?.watch_status as WatchStatus) || 'plan_to_watch';

  // Определить состояние загрузки
  const isLoading = favoritesLoading || addMutation.isPending || removeMutation.isPending || updateStatusMutation.isPending;

  /**
   * Обработчик добавления в избранное
   */
  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({ 
        shikimori_id: animeId, 
        anime_name: animeName 
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  /**
   * Обработчик удаления из избранного
   */
  const handleRemove = async () => {
    try {
      await removeMutation.mutateAsync(animeId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  /**
   * Обработчик изменения статуса просмотра
   */
  const handleStatusChange = async (status: WatchStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        shikimoriId: animeId,
        watchStatus: status,
      });
    } catch (error) {
      console.error('Error updating watch status:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={isFavorite ? handleRemove : handleAdd}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-5 py-3 rounded-lg min-h-[44px]
          transition-all duration-200
          ${isFavorite 
            ? 'bg-[#ff0055] text-white hover:bg-[#cc0044]' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:ring-offset-2 focus:ring-offset-[#0a0a0c]
        `}
        aria-label={isFavorite ? 'Удалить из списка' : 'Добавить в список'}
        title={isFavorite ? 'Удалить из списка' : 'Добавить в список'}
      >
        <Heart
          size={20}
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          className={`transition-transform duration-200 ${isLoading ? 'animate-pulse' : ''}`}
        />
        <span className="font-medium text-sm">
          {isLoading 
            ? 'Загрузка...' 
            : isFavorite 
              ? 'Удалить из списка' 
              : 'Добавить в список'
          }
        </span>
      </button>

      {isFavorite && (
        <WatchStatusSelector
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
          disabled={isLoading}
        />
      )}
    </div>
  );
};
