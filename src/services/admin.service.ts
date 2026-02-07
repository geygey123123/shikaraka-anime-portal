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
    const [
      totalUsers,
      activeUsers,
      totalFavorites,
      totalComments,
      totalRatings,
      topAnime,
      topRated,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getTotalFavorites(),
      this.getTotalComments(),
      this.getTotalRatings(),
      this.getTopAnime(),
      this.getTopRated(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalFavorites,
      totalComments,
      totalRatings,
      topAnime,
      topRated,
    };
  }

  /**
   * Get total number of registered users
   * @returns Total user count
   */
  private async getTotalUsers(): Promise<number> {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  /**
   * Get number of active users in the last 7 days
   * @returns Active user count
   */
  private async getActiveUsers(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', sevenDaysAgo.toISOString());

    if (error) throw error;
    return count || 0;
  }

  /**
   * Get total number of favorites
   * @returns Total favorites count
   */
  private async getTotalFavorites(): Promise<number> {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  /**
   * Get total number of comments
   * @returns Total comments count
   */
  private async getTotalComments(): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Get total number of ratings
   * @returns Total ratings count
   */
  private async getTotalRatings(): Promise<number> {
    const { count, error } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  /**
   * Get top 10 anime by favorites count
   * @returns Array of top anime with counts
   */
  async getTopAnime(): Promise<Array<{ anime_id: number; count: number; anime_name: string }>> {
    const { data, error } = await supabase
      .from('favorites')
      .select('anime_id, anime_name');

    if (error) throw error;
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
  }

  /**
   * Get top 10 rated anime using Bayesian average
   * @returns Array of top rated anime
   */
  async getTopRated(): Promise<Array<{ anime_id: number; weighted: number; count: number }>> {
    return await ratingsService.getTopRatedAnime(10);
  }
}

export const adminService = new AdminService();
