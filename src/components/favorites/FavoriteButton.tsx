import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../../hooks/useFavorites';

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

  // Скрыть кнопку для неаутентифицированных пользователей
  if (!isAuthenticated) {
    return null;
  }

  // Проверить, находится ли аниме в избранном
  const isFavorite = favorites?.some(favorite => favorite.shikimori_id === animeId) ?? false;

  // Определить состояние загрузки
  const isLoading = favoritesLoading || addMutation.isPending || removeMutation.isPending;

  /**
   * Обработчик переключения состояния избранного
   */
  const handleToggle = async () => {
    try {
      if (isFavorite) {
        // Удалить из избранного
        await removeMutation.mutateAsync(animeId);
      } else {
        // Добавить в избранное
        await addMutation.mutateAsync({ 
          shikimori_id: animeId, 
          anime_name: animeName 
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Ошибка уже обработана в хуках
    }
  };

  return (
    <button
      onClick={handleToggle}
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
  );
};
