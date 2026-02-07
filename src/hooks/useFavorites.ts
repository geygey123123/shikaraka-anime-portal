import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import type { Favorite } from '../types/anime';

export type WatchStatus = 'watching' | 'plan_to_watch' | 'completed' | 'dropped' | 'on_hold';

/**
 * Hook для получения списка избранных аниме пользователя
 * @param watchStatus - Опциональный фильтр по статусу просмотра
 * @returns React Query результат с массивом избранных аниме
 */
export const useFavorites = (watchStatus?: WatchStatus) => {
  const { user } = useAuth();

  return useQuery<Favorite[], Error>({
    queryKey: ['favorites', user?.id, watchStatus],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      // Применить фильтр по watch_status если указан
      if (watchStatus) {
        query = query.eq('watch_status', watchStatus);
      }

      const { data, error } = await query.order('added_at', { ascending: false });

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

/**
 * Hook для обновления статуса просмотра аниме в избранном с оптимистичными обновлениями
 * @returns React Query mutation для обновления статуса просмотра
 */
export const useUpdateWatchStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    void,
    Error,
    { shikimoriId: number; watchStatus: WatchStatus },
    { previousFavorites?: Favorite[]; previousFavoritesByStatus?: Record<string, Favorite[] | undefined> }
  >({
    mutationFn: async ({ shikimoriId, watchStatus }: { shikimoriId: number; watchStatus: WatchStatus }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorites')
        .update({
          watch_status: watchStatus,
          status_updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('shikimori_id', shikimoriId);

      if (error) {
        console.error('Error updating watch status:', error);
        throw new Error(error.message);
      }
    },
    // Оптимистичное обновление перед отправкой запроса
    onMutate: async ({ shikimoriId, watchStatus }) => {
      // Отменить текущие запросы для избежания конфликтов
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });

      // Сохранить предыдущие значения для отката
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites', user?.id, undefined]);
      const previousFavoritesByStatus: Record<string, Favorite[] | undefined> = {};
      
      // Сохранить данные для всех статусов
      const statuses: WatchStatus[] = ['watching', 'plan_to_watch', 'completed', 'dropped', 'on_hold'];
      statuses.forEach(status => {
        previousFavoritesByStatus[status] = queryClient.getQueryData<Favorite[]>(['favorites', user?.id, status]);
      });

      // Оптимистично обновить статус в общем списке
      if (previousFavorites) {
        const updatedFavorites = previousFavorites.map(fav =>
          fav.shikimori_id === shikimoriId
            ? { ...fav, watch_status: watchStatus, status_updated_at: new Date().toISOString() }
            : fav
        );
        queryClient.setQueryData<Favorite[]>(['favorites', user?.id, undefined], updatedFavorites);
      }

      // Оптимистично обновить статус в отфильтрованных списках
      statuses.forEach(status => {
        const favoritesForStatus = previousFavoritesByStatus[status];
        if (favoritesForStatus) {
          if (status === watchStatus) {
            // Добавить в новый статус, если его там еще нет
            const exists = favoritesForStatus.some(fav => fav.shikimori_id === shikimoriId);
            if (!exists && previousFavorites) {
              const favorite = previousFavorites.find(fav => fav.shikimori_id === shikimoriId);
              if (favorite) {
                queryClient.setQueryData<Favorite[]>(
                  ['favorites', user?.id, status],
                  [{ ...favorite, watch_status: watchStatus, status_updated_at: new Date().toISOString() }, ...favoritesForStatus]
                );
              }
            } else {
              // Обновить существующий
              const updated = favoritesForStatus.map(fav =>
                fav.shikimori_id === shikimoriId
                  ? { ...fav, watch_status: watchStatus, status_updated_at: new Date().toISOString() }
                  : fav
              );
              queryClient.setQueryData<Favorite[]>(['favorites', user?.id, status], updated);
            }
          } else {
            // Удалить из старого статуса
            const filtered = favoritesForStatus.filter(fav => fav.shikimori_id !== shikimoriId);
            queryClient.setQueryData<Favorite[]>(['favorites', user?.id, status], filtered);
          }
        }
      });

      // Вернуть контекст для отката в случае ошибки
      return { previousFavorites, previousFavoritesByStatus };
    },
    onSuccess: () => {
      // Инвалидировать кэш для получения точных данных с сервера
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
    onError: (error, _variables, context) => {
      console.error('Update watch status mutation error:', error);
      
      // Откатить оптимистичные обновления в случае ошибки
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user?.id, undefined], context.previousFavorites);
      }
      
      // Откатить для всех статусов
      if (context?.previousFavoritesByStatus) {
        Object.entries(context.previousFavoritesByStatus).forEach(([status, favorites]) => {
          if (favorites) {
            queryClient.setQueryData(['favorites', user?.id, status], favorites);
          }
        });
      }
    },
  });
};
