import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../services/comments.service';
import { useAuth } from './useAuth';
import type { Comment } from '../services/comments.service';

/**
 * Hook для получения комментариев для конкретного аниме с пагинацией
 * @param animeId - ID аниме
 * @param page - Номер страницы (по умолчанию 1)
 * @returns React Query результат с массивом комментариев
 */
export const useComments = (animeId: number, page: number = 1) => {
  return useQuery<Comment[], Error>({
    queryKey: ['comments', animeId, page],
    queryFn: () => commentsService.getComments(animeId, page),
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 5 * 60 * 1000, // 5 минут
    enabled: animeId > 0, // Запрос выполняется только если animeId валидный
  });
};

/**
 * Hook для добавления комментария с оптимистичными обновлениями
 * @returns React Query mutation для добавления комментария
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    Comment,
    Error,
    { animeId: number; content: string },
    { previousComments?: Comment[] }
  >({
    mutationFn: async ({ animeId, content }: { animeId: number; content: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      return commentsService.addComment(animeId, content, user.id);
    },
    // Оптимистичное обновление перед отправкой запроса
    onMutate: async ({ animeId, content }) => {
      // Отменить текущие запросы для избежания конфликтов
      await queryClient.cancelQueries({ queryKey: ['comments', animeId] });

      // Сохранить предыдущие значения для отката
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', animeId, 1]);

      // Создать оптимистичный комментарий
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`, // Временный ID
        user_id: user!.id,
        anime_id: animeId,
        content,
        is_deleted: false,
        deleted_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Пользователь',
          avatar_url: user?.user_metadata?.avatar_url || null,
        },
      };

      // Оптимистично добавить комментарий в начало списка
      if (previousComments) {
        queryClient.setQueryData<Comment[]>(
          ['comments', animeId, 1],
          [optimisticComment, ...previousComments]
        );
      }

      // Вернуть контекст для отката в случае ошибки
      return { previousComments };
    },
    onSuccess: (_, variables) => {
      // Инвалидировать кэш для получения точных данных с сервера
      queryClient.invalidateQueries({ queryKey: ['comments', variables.animeId] });
    },
    onError: (error, variables, context) => {
      console.error('Add comment mutation error:', error);
      
      // Откатить оптимистичные обновления в случае ошибки
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', variables.animeId, 1], context.previousComments);
      }
    },
  });
};

/**
 * Hook для удаления комментария с оптимистичными обновлениями
 * @returns React Query mutation для удаления комментария
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    void,
    Error,
    { commentId: string; animeId: number; isModerator: boolean },
    { previousComments?: Comment[] }
  >({
    mutationFn: async ({ commentId, isModerator }: { commentId: string; animeId: number; isModerator: boolean }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      return commentsService.deleteComment(commentId, user.id, isModerator);
    },
    // Оптимистичное обновление перед отправкой запроса
    onMutate: async ({ commentId, animeId }) => {
      // Отменить текущие запросы для избежания конфликтов
      await queryClient.cancelQueries({ queryKey: ['comments', animeId] });

      // Сохранить предыдущие значения для отката
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', animeId, 1]);

      // Оптимистично удалить комментарий из списка
      if (previousComments) {
        queryClient.setQueryData<Comment[]>(
          ['comments', animeId, 1],
          previousComments.filter(comment => comment.id !== commentId)
        );
      }

      // Вернуть контекст для отката в случае ошибки
      return { previousComments };
    },
    onSuccess: (_, variables) => {
      // Инвалидировать кэш для получения точных данных с сервера
      queryClient.invalidateQueries({ queryKey: ['comments', variables.animeId] });
    },
    onError: (error, variables, context) => {
      console.error('Delete comment mutation error:', error);
      
      // Откатить оптимистичные обновления в случае ошибки
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', variables.animeId, 1], context.previousComments);
      }
    },
  });
};
