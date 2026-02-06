import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import type { Favorite } from '../types/anime';

/**
 * Hook для получения списка избранных аниме пользователя
 * @returns React Query результат с массивом избранных аниме
 */
export const useFavorites = () => {
  const { user } = useAuth();

  return useQuery<Favorite[], Error>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        throw new Error(error.message);
      }

      return data as Favorite[];
    },
    enabled: !!user, // Запрос выполняется только если пользователь аутентифицирован
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 5 * 60 * 1000, // 5 минут
  });
};

/**
 * Hook для добавления аниме в избранное
 * @returns React Query mutation для добавления в избранное
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    Favorite,
    Error,
    { shikimori_id: number; anime_name: string }
  >({
    mutationFn: async (favorite: { shikimori_id: number; anime_name: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          shikimori_id: favorite.shikimori_id,
          anime_name: favorite.anime_name,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding favorite:', error);
        
        // Обработка ошибки дублирования
        if (error.code === '23505') {
          throw new Error('Это аниме уже в вашем списке избранного');
        }
        
        throw new Error(error.message);
      }

      return data as Favorite;
    },
    onSuccess: () => {
      // Инвалидировать кэш избранного для обновления UI
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
    onError: (error) => {
      console.error('Add favorite mutation error:', error);
    },
  });
};

/**
 * Hook для удаления аниме из избранного
 * @returns React Query mutation для удаления из избранного
 */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, number>({
    mutationFn: async (shikimoriId: number) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('shikimori_id', shikimoriId);

      if (error) {
        console.error('Error removing favorite:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // Инвалидировать кэш избранного для обновления UI
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
    onError: (error) => {
      console.error('Remove favorite mutation error:', error);
    },
  });
};

/**
 * Hook для проверки, находится ли аниме в избранном
 * @param shikimoriId - ID аниме в Shikimori
 * @returns boolean - true если аниме в избранном
 */
export const useIsFavorite = (shikimoriId: number): boolean => {
  const { data: favorites } = useFavorites();
  
  if (!favorites) {
    return false;
  }

  return favorites.some(favorite => favorite.shikimori_id === shikimoriId);
};
