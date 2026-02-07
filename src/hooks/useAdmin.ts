import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { moderatorsService } from '../services/moderators.service';
import { storageService } from '../services/storage.service';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import type { AdminStats } from '../services/admin.service';
import type { Moderator } from '../services/moderators.service';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  last_active: string | null;
}

/**
 * Hook для получения профиля пользователя
 * @param userId - ID пользователя
 * @returns React Query результат с профилем пользователя
 */
export const useProfile = (userId?: string) => {
  return useQuery<Profile | null, Error>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as Profile | null;
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    enabled: !!userId, // Запрос выполняется только если userId предоставлен
  });
};

/**
 * Hook для проверки, является ли текущий пользователь администратором
 * @returns Object with isAdmin status and loading state
 */
export const useIsAdmin = (): { isAdmin: boolean; isLoading: boolean } => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

  // Debug logging for admin status
  if (profile) {
    console.log('Current profile:', profile);
    console.log('is_admin status:', profile.is_admin);
  }

  return {
    isAdmin: profile?.is_admin === true,
    isLoading,
  };
};

/**
 * Hook для получения статистики админ-панели с проверкой прав администратора
 * @returns React Query результат со статистикой
 */
export const useAdminStats = () => {
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  return useQuery<AdminStats, Error>({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    enabled: isAdmin && !isAdminLoading, // Запрос выполняется только если пользователь является администратором
  });
};

/**
 * Hook для получения списка модераторов
 * @returns React Query результат с массивом модераторов
 */
export const useModerators = () => {
  return useQuery<Moderator[], Error>({
    queryKey: ['moderators'],
    queryFn: () => moderatorsService.getModerators(),
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 15 * 60 * 1000, // 15 минут
  });
};

/**
 * Hook для проверки, является ли текущий пользователь модератором
 * @returns True если пользователь является модератором
 */
export const useIsModerator = (): boolean => {
  const { user } = useAuth();
  const { data: moderators } = useModerators();

  if (!user || !moderators) {
    return false;
  }

  return moderators.some(m => m.user_id === user.id);
};

/**
 * Hook для обновления профиля пользователя
 * @returns React Query mutation для обновления профиля
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    void,
    Error,
    { username?: string; bio?: string }
  >({
    mutationFn: async (updates: { username?: string; bio?: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check rate limit before updating profile
      const rateLimitModule = await import('../services/rateLimit.service');
      await rateLimitModule.checkRateLimit(user.id, 'profile_update');

      // Validate username if provided
      if (updates.username !== undefined) {
        if (updates.username.length < 3 || updates.username.length > 20) {
          throw new Error('Username должен содержать от 3 до 20 символов');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(updates.username)) {
          throw new Error('Username может содержать только буквы, цифры и подчеркивание');
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Инвалидировать кэш профиля
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      console.error('Update profile mutation error:', error);
    },
  });
};

/**
 * Hook для загрузки аватара пользователя
 * @returns React Query mutation для загрузки аватара
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    string,
    Error,
    File
  >({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      return storageService.uploadAvatar(user.id, file);
    },
    onSuccess: () => {
      // Инвалидировать кэш профиля для обновления avatar_url
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      console.error('Upload avatar mutation error:', error);
    },
  });
};
