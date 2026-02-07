import { supabase } from './supabase';

export interface Rating {
  id: string;
  user_id: string;
  anime_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AnimeRating {
  average: number;
  weighted: number;
  count: number;
}

export interface TopRatedAnime {
  anime_id: number;
  average: number;
  weighted: number;
  count: number;
}

class RatingsService {
  // Minimum number of votes required for Bayesian average calculation
  private readonly MIN_VOTES = 10;

  /**
   * Get rating statistics for a specific anime
   * @param animeId - The anime ID
   * @returns Rating statistics including simple average, weighted (Bayesian) average, and count
   */
  async getRating(animeId: number): Promise<AnimeRating> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('anime_id', animeId);

    if (error) throw error;

    const count = data?.length || 0;
    const average = count > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    // Calculate Bayesian average for weighted rating
    const globalAverage = await this.getGlobalAverage();
    const weighted = this.calculateBayesianAverage(average, count, globalAverage);

    return { average, weighted, count };
  }

  /**
   * Get the user's rating for a specific anime
   * @param animeId - The anime ID
   * @param userId - User ID
   * @returns The user's rating or null if not rated
   */
  async getUserRating(animeId: number, userId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('anime_id', animeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data?.rating || null;
  }

  /**
   * Set or update a user's rating for an anime with rate limit check
   * @param animeId - The anime ID
   * @param rating - Rating value (1-10)
   * @param userId - User ID
   */
  async setRating(animeId: number, rating: number, userId: string): Promise<void> {
    // Validate rating
    if (rating < 1 || rating > 10) {
      throw new Error('Оценка должна быть от 1 до 10');
    }

    // Check rate limit before setting rating
    const rateLimitModule = await import('./rateLimit.service');
    await rateLimitModule.checkRateLimit(userId, 'rating');

    // First, try to update existing rating
    const { data: existing } = await supabase
      .from('ratings')
      .select('id')
      .eq('anime_id', animeId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing rating
      const { error } = await supabase
        .from('ratings')
        .update({
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new rating
      const { error } = await supabase
        .from('ratings')
        .insert({
          anime_id: animeId,
          rating,
          user_id: userId,
        });

      if (error) throw error;
    }
  }

  /**
   * Get top rated anime using Bayesian average
   * @param limit - Number of anime to return
   * @returns Array of top rated anime with statistics
   */
  async getTopRatedAnime(limit: number = 10): Promise<TopRatedAnime[]> {
    const { data, error } = await supabase
      .from('ratings')
      .select('anime_id, rating');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Group ratings by anime_id
    const grouped = data.reduce((acc, item) => {
      const existing = acc.find(a => a.anime_id === item.anime_id);
      if (existing) {
        existing.total += item.rating;
        existing.count++;
      } else {
        acc.push({ anime_id: item.anime_id, total: item.rating, count: 1 });
      }
      return acc;
    }, [] as Array<{ anime_id: number; total: number; count: number }>);

    // Calculate Bayesian average for each anime
    const globalAverage = await this.getGlobalAverage();

    return grouped
      .map(item => ({
        anime_id: item.anime_id,
        average: item.total / item.count,
        weighted: this.calculateBayesianAverage(
          item.total / item.count,
          item.count,
          globalAverage
        ),
        count: item.count,
      }))
      .sort((a, b) => b.weighted - a.weighted)
      .slice(0, limit);
  }

  /**
   * Get the global average rating across all anime
   * @returns Global average rating
   */
  async getGlobalAverage(): Promise<number> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating');

    if (error || !data || data.length === 0) return 5.0; // Default to 5.0

    return data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  }

  /**
   * Calculate Bayesian average (IMDB formula)
   * @param animeAverage - Average rating for the anime
   * @param animeVotes - Number of votes for the anime
   * @param globalAverage - Global average rating
   * @returns Weighted (Bayesian) average
   */
  calculateBayesianAverage(
    animeAverage: number,
    animeVotes: number,
    globalAverage: number
  ): number {
    // IMDB formula: (v / (v + m)) * R + (m / (v + m)) * C
    // v = number of votes for the anime
    // m = minimum votes required
    // R = average rating for the anime
    // C = global average rating
    const v = animeVotes;
    const m = this.MIN_VOTES;
    const R = animeAverage;
    const C = globalAverage;

    return (v / (v + m)) * R + (m / (v + m)) * C;
  }
}

export const ratingsService = new RatingsService();
