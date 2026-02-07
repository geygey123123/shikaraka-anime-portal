import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceStatsService } from '../services/voiceStats.service';
import { useAuth } from './useAuth';
import type { VoiceStats } from '../services/voiceStats.service';

/**
 * Hook для получения статистики озвучек для аниме
 * @param animeId - ID аниме
 * @returns React Query результат со статистикой озвучек
 */
export const useVoiceStats = (animeId: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Получить статистику озвучек
  const statsQuery = useQuery<VoiceStats[], Error>({
    queryKey: ['voiceStats', animeId],
    queryFn: () => voiceStatsService.getVoiceStats(animeId),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    enabled: animeId > 0,
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Получить выбор пользователя
  const userSelectionQuery = useQuery<string | null, Error>({
    queryKey: ['userVoiceSelection', animeId, user?.id],
    queryFn: () => {
      if (!user?.id) {
        return null;
      }
      return voiceStatsService.getUserVoiceSelection(user.id, animeId);
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    enabled: !!user && animeId > 0,
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Мутация для записи выбора озвучки
  const recordSelectionMutation = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: async (voiceName: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to record voice selection');
      }

      return voiceStatsService.recordVoiceSelection({
        user_id: user.id,
        anime_id: animeId,
        voice_name: voiceName,
      });
    },
    onSuccess: () => {
      // Инвалидировать кэш после записи выбора
      // Это обеспечивает отображение обновленной статистики
      queryClient.invalidateQueries({ queryKey: ['voiceStats', animeId] });
      queryClient.invalidateQueries({ queryKey: ['userVoiceSelection', animeId, user?.id] });
    },
    onError: (error) => {
      console.error('Record voice selection mutation error:', error);
    },
  });

  return {
    stats: statsQuery.data || [],
    isLoading: statsQuery.isLoading || userSelectionQuery.isLoading,
    error: statsQuery.error || userSelectionQuery.error,
    userSelection: userSelectionQuery.data || null,
    recordSelection: recordSelectionMutation.mutateAsync,
    isRecording: recordSelectionMutation.isPending,
    refetch: () => {
      statsQuery.refetch();
      userSelectionQuery.refetch();
    },
  };
};
