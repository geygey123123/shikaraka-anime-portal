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
  userActivity: Array<{ date: string; users: number }>;
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
        userActivity,
      ] = await Promise.allSettled([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalFavorites(),
        this.getTotalComments(),
        this.getTotalRatings(),
        this.getTopAnime(),
        this.getTopRated(),
        this.getUserActivity(),
      ]);

      return {
        totalUsers: totalUsers.status === 'fulfilled' ? totalUsers.value : 0,
        activeUsers: activeUsers.status === 'fulfilled' ? activeUsers.value : 0,
        totalFavorites: totalFavorites.status === 'fulfilled' ? totalFavorites.value : 0,
        totalComments: totalComments.status === 'fulfilled' ? totalComments.value : 0,
        totalRatings: totalRatings.status === 'fulfilled' ? totalRatings.value : 0,
        topAnime: topAnime.status === 'fulfilled' ? topAnime.value : [],
        topRated: topRated.status === 'fulfilled' ? topRated.value : [],
        userActivity: userActivity.status === 'fulfilled' ? userActivity.value : [],
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
        userActivity: [],
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
        .select('anime_id');

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
            anime_name: `Anime #${item.anime_id}`, // Placeholder name
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

  /**
   * Get user activity for the last 30 days
   * @returns Array of daily user activity
   */
  async getUserActivity(): Promise<Array<{ date: string; users: number }>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all profiles with last_active in the last 30 days
      const { data, error } = await supabase
        .from('profiles')
        .select('last_active')
        .gte('last_active', thirtyDaysAgo.toISOString())
        .order('last_active', { ascending: true });

      if (error) {
        console.error('Error getting user activity:', error);
        return this.generateEmptyActivityData();
      }

      if (!data || data.length === 0) {
        return this.generateEmptyActivityData();
      }

      // Group by date and count unique users
      const activityMap = new Map<string, Set<string>>();
      
      data.forEach(profile => {
        if (profile.last_active) {
          const date = new Date(profile.last_active);
          const dateKey = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
          
          if (!activityMap.has(dateKey)) {
            activityMap.set(dateKey, new Set());
          }
        }
      });

      // Generate array for last 30 days
      const result = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        
        result.push({
          date: dateKey,
          users: activityMap.get(dateKey)?.size || 0,
        });
      }

      return result;
    } catch (error) {
      console.error('Exception getting user activity:', error);
      return this.generateEmptyActivityData();
    }
  }

  /**
   * Generate empty activity data for last 30 days
   * @returns Array of empty activity data
   */
  private generateEmptyActivityData(): Array<{ date: string; users: number }> {
    const result = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      
      result.push({
        date: dateKey,
        users: 0,
      });
    }
    
    return result;
  }
}

export const adminService = new AdminService();
