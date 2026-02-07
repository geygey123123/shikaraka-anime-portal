import React from 'react';
import { Heart, MessageCircle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

interface ProfileStatsProps {
  userId: string;
}

interface UserStats {
  favoritesCount: number;
  favoritesByStatus: {
    watching: number;
    plan_to_watch: number;
    completed: number;
    dropped: number;
    on_hold: number;
  };
  commentsCount: number;
  ratingsCount: number;
}

/**
 * ProfileStats Component
 * Displays user activity statistics including favorites, comments, and ratings
 */
export const ProfileStats: React.FC<ProfileStatsProps> = ({ userId }) => {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      // Get favorites count and breakdown by watch status
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('watch_status')
        .eq('user_id', userId);

      if (favError) throw favError;

      const favoritesByStatus = {
        watching: 0,
        plan_to_watch: 0,
        completed: 0,
        dropped: 0,
        on_hold: 0,
      };

      favorites?.forEach((fav) => {
        const status = fav.watch_status || 'plan_to_watch';
        if (status in favoritesByStatus) {
          favoritesByStatus[status as keyof typeof favoritesByStatus]++;
        }
      });

      // Get comments count
      const { count: commentsCount, error: commError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (commError) throw commError;

      // Get ratings count
      const { count: ratingsCount, error: ratError } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (ratError) throw ratError;

      return {
        favoritesCount: favorites?.length || 0,
        favoritesByStatus,
        commentsCount: commentsCount || 0,
        ratingsCount: ratingsCount || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-8 w-16 bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const watchStatusLabels = {
    watching: 'Смотрю',
    plan_to_watch: 'Планирую',
    completed: 'Завершено',
    dropped: 'Брошено',
    on_hold: 'Отложено',
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Favorites */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-[#ff0055] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#ff0055]/10 rounded-lg">
              <Heart className="text-[#ff0055]" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats?.favoritesCount || 0}</div>
              <div className="text-sm text-gray-400">В избранном</div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-[#ff0055] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <MessageCircle className="text-blue-500" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats?.commentsCount || 0}</div>
              <div className="text-sm text-gray-400">Комментариев</div>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-[#ff0055] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Star className="text-yellow-500" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stats?.ratingsCount || 0}</div>
              <div className="text-sm text-gray-400">Оценок</div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Breakdown by Watch Status */}
      {stats && stats.favoritesCount > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Статус просмотра</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.favoritesByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400">
                  {watchStatusLabels[status as keyof typeof watchStatusLabels]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
