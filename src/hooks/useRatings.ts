import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsService } from '../services/ratings.service';
import { useAuth } from './useAuth';
import type { AnimeRating } from '../services/ratings.service';

/**
 * Hook для получения рейтинга аниме (средний, взвешенный, количество оценок)
 * @param animeId - ID аниме
 * @returns React Query результат с рейтингом аниме
 */
export const useAnimeRating = (animeId: number) => {
  return useQuery<AnimeRating, Error>({
    queryKey: ['rating', animeId],
    queryFn: () => ratingsService.getRating(animeId),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    enabled: animeId > 0, // Запрос выполняется только если animeId валидный
  });
};

/**
 * Hook для получения оценки пользователя для конкретного аниме
 * @param animeId - ID аниме
 * @returns React Query результат с оценкой пользователя (1-10) или null
 */
export const useUserRating = (animeId: number) => {
  const { user } = useAuth();

  return useQuery<number | null, Error>({
    queryKey: ['userRating', animeId, user?.id],
    queryFn: () => {
      if (!user?.id) {
        return null;
      }
      return ratingsService.getUserRating(animeId, user.id);
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    enabled: !!user && animeId > 0, // Запрос выполняется только если пользователь аутентифицирован
  });
};

/**
 * Hook для установки или обновления оценки пользователя с оптимистичными обновлениями
 * @returns React Query mutation для установки оценки
 */
export const useSetRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    void,
    Error,
    { animeId: number; rating: number },
    { previousRating?: AnimeRating; previousUserRating?: number | null }
  >({
    mutationFn: async ({ animeId, rating }: { animeId: number; rating: number }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      return ratingsService.setRating(animeId, rating, user.id);
    },
    // Оптимистичное обновление перед отправкой запроса
    onMutate: async ({ animeId, rating }) => {
      // Отменить текущие запросы для избежания конфликтов
      await queryClient.cancelQueries({ queryKey: ['rating', animeId] });
      await queryClient.cancelQueries({ queryKey: ['userRating', animeId, user?.id] });

      // Сохранить предыдущие значения для отката
      const previousRating = queryClient.getQueryData<AnimeRating>(['rating', animeId]);
      const previousUserRating = queryClient.getQueryData<number | null>(['userRating', animeId, user?.id]);

      // Оптимистично обновить оценку пользователя
      queryClient.setQueryData<number | null>(['userRating', animeId, user?.id], rating);

      // Оптимистично обновить общий рейтинг аниме
      if (previousRating) {
        const oldUserRating = previousUserRating || 0;
        const isNewRating = previousUserRating === null;
        
        // Пересчитать средний рейтинг
        let newCount = previousRating.count;
        let newTotal = previousRating.average * previousRating.count;
        
        if (isNewRating) {
          // Новая оценка - увеличить счетчик
          newCount += 1;
          newTotal += rating;
        } else {
          // Обновление существующей оценки
          newTotal = newTotal - oldUserRating + rating;
        }
        
        const newAverage = newTotal / newCount;
        
        queryClient.setQueryData<AnimeRating>(['rating', animeId], {
          ...previousRating,
          average: newAverage,
          count: newCount,
          // Weighted будет пересчитан на сервере
        });
      }

      // Вернуть контекст для отката в случае ошибки
      return { previousRating, previousUserRating };
    },
    onSuccess: (_, variables) => {
      // Инвалидировать кэш для получения точных данных с сервера
      queryClient.invalidateQueries({ queryKey: ['rating', variables.animeId] });
      queryClient.invalidateQueries({ queryKey: ['userRating', variables.animeId, user?.id] });
    },
    onError: (error, variables, context) => {
      console.error('Set rating mutation error:', error);
      
      // Откатить оптимистичные обновления в случае ошибки
      if (context?.previousRating) {
        queryClient.setQueryData(['rating', variables.animeId], context.previousRating);
      }
      if (context?.previousUserRating !== undefined) {
        queryClient.setQueryData(['userRating', variables.animeId, user?.id], context.previousUserRating);
      }
    },
  });
};
