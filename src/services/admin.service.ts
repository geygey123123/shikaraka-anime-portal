import { supabase } from './supabase';
import { ratingsService } from './ratings.service';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFavorites: number;
  totalComments: number;
  totalRatings: number;
  topAnime: Array<{ anime_id: number; count: number; anime_name: string }>;
  topRated: Array<{ anime_id: number; weighted: number; count: number }>;
}

class AdminService {
  /**
   * Get comprehensive statistics for the admin panel
   * @returns Admin statistics object
   */
  async getStatistics(): Promise<AdminStats> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalFavorites,
        totalComments,
        totalRatings,
        topAnime,
        topRated,
      ] = await Promise.allSettled([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalFavorites(),
        this.getTotalComments(),
        this.getTotalRatings(),
        this.getTopAnime(),
        this.getTopRated(),
      ]);

      return {
        totalUsers: totalUsers.status === 'fulfilled' ? totalUsers.value : 0,
        activeUsers: activeUsers.status === 'fulfilled' ? activeUsers.value : 0,
        totalFavorites: totalFavorites.status === 'fulfilled' ? totalFavorites.value : 0,
        totalComments: totalComments.status === 'fulfilled' ? totalComments.value : 0,
        totalRatings: totalRatings.status === 'fulfilled' ? totalRatings.value : 0,
        topAnime: topAnime.status === 'fulfilled' ? topAnime.value : [],
        topRated: topRated.status === 'fulfilled' ? topRated.value : [],
      };
    } catch (error) {
      console.error('Error getting admin statistics:', error);
      // Return default values if there's an error
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalFavorites: 0,
        totalComments: 0,
        totalRatings: 0,
        topAnime: [],
        topRated: [],
      };
    }
  }

  /**
   * Get total number of registered users
   * @returns Total user count
   */
  private async getTotalUsers(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting total users:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Exception getting total users:', error);
      return 0;
    }
  }

  /**
   * Get number of active users in the last 7 days
   * @returns Active user count
   */
  private async getActiveUsers(): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Error getting active users:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Exception getting active users:', error);
      return 0;
    }
  }

  /**
   * Get total number of favorites
   * @returns Total favorites count
   */
  private async getTotalFavorites(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting total favorites:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Exception getting total favorites:', error);
      return 0;
    }
  }

  /**
   * Get total number of comments
   * @returns Total comments count
   */
  private async getTotalComments(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);

      if (error) {
        console.error('Error getting total comments:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Exception getting total comments:', error);
      return 0;
    }
  }

  /**
   * Get total number of ratings
   * @returns Total ratings count
   */
  private async getTotalRatings(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting total ratings:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Exception getting total ratings:', error);
      return 0;
    }
  }

  /**
   * Get top 10 anime by favorites count
   * @returns Array of top anime with counts
   */
  async getTopAnime(): Promise<Array<{ anime_id: number; count: number; anime_name: string }>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('anime_id, anime_name');

      if (error) {
        console.error('Error getting top anime:', error);
        return [];
      }
      if (!data || data.length === 0) return [];

      // Group by anime_id and count occurrences
      const grouped = data.reduce((acc, item) => {
        const existing = acc.find(a => a.anime_id === item.anime_id);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            anime_id: item.anime_id,
            anime_name: item.anime_name || 'Unknown',
            count: 1,
          });
        }
        return acc;
      }, [] as Array<{ anime_id: number; anime_name: string; count: number }>);

      // Sort by count descending and return top 10
      return grouped.sort((a, b) => b.count - a.count).slice(0, 10);
    } catch (error) {
      console.error('Exception getting top anime:', error);
      return [];
    }
  }

  /**
   * Get top 10 rated anime using Bayesian average
   * @returns Array of top rated anime
   */
  async getTopRated(): Promise<Array<{ anime_id: number; weighted: number; count: number }>> {
    try {
      return await ratingsService.getTopRatedAnime(10);
    } catch (error) {
      console.error('Exception getting top rated anime:', error);
      return [];
    }
  }
}

export const adminService = new AdminService();
