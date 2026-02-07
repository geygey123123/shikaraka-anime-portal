import { supabase } from './supabase';

export interface RateLimit {
  id: string;
  user_id: string;
  action_type: string;
  action_count: number;
  window_start: string;
  is_blocked: boolean;
  blocked_until: string | null;
}

export type ActionType = 'comment' | 'rating' | 'profile_update' | 'registration';

interface RateLimitRule {
  max: number;
  window: number; // in seconds
}

class RateLimitService {
  // Rate limit rules for different action types
  private readonly limits: Record<ActionType, RateLimitRule> = {
    comment: { max: 30, window: 3600 }, // 30 per hour (more reasonable for active users)
    rating: { max: 50, window: 3600 }, // 50 per hour (users might rate multiple anime)
    profile_update: { max: 10, window: 3600 }, // 10 per hour
    registration: { max: 3, window: 3600 }, // 3 per hour per IP
  };

  private readonly BLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds (reduced from 24h)

  /**
   * Check if a user has exceeded the rate limit for a specific action
   * @param userId - User ID
   * @param actionType - Type of action being performed
   * @throws Error if rate limit is exceeded
   */
  async checkRateLimit(userId: string, actionType: ActionType): Promise<void> {
    const limit = this.limits[actionType];
    if (!limit) {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    // Get existing rate limit record
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('action_type', actionType)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error; // Throw if it's not a "no rows" error
    }

    if (!data) {
      // First action - create new rate limit record
      await this.createRateLimit(userId, actionType);
      return;
    }

    const now = new Date();
    const windowStart = new Date(data.window_start);
    const windowElapsed = (now.getTime() - windowStart.getTime()) / 1000;

    // Check if user is currently blocked
    if (data.is_blocked && data.blocked_until) {
      const blockedUntil = new Date(data.blocked_until);
      if (now < blockedUntil) {
        const remainingMinutes = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000);
        throw new Error(
          `Слишком много действий. Попробуйте позже через ${remainingMinutes} минут.`
        );
      } else {
        // Block period expired, reset the limit
        await this.resetRateLimit(data.id);
        return;
      }
    }

    // Check if window has expired
    if (windowElapsed > limit.window) {
      // Reset window
      await this.resetRateLimit(data.id);
      return;
    }

    // Check if limit is exceeded
    if (data.action_count >= limit.max) {
      // Block user
      const blockedUntil = new Date(now.getTime() + this.BLOCK_DURATION);
      await this.blockUser(data.id, blockedUntil);
      throw new Error('Слишком много действий. Попробуйте позже.');
    }

    // Increment action count
    await this.updateRateLimit(data.id, data.action_count + 1);
  }

  /**
   * Create a new rate limit record for a user
   * @param userId - User ID
   * @param actionType - Type of action
   */
  private async createRateLimit(userId: string, actionType: ActionType): Promise<void> {
    const { error } = await supabase.from('rate_limits').insert({
      user_id: userId,
      action_type: actionType,
      action_count: 1,
      window_start: new Date().toISOString(),
      is_blocked: false,
      blocked_until: null,
    });

    if (error) throw error;
  }

  /**
   * Reset rate limit window for a user
   * @param rateLimitId - Rate limit record ID
   */
  private async resetRateLimit(rateLimitId: string): Promise<void> {
    const { error } = await supabase
      .from('rate_limits')
      .update({
        action_count: 1,
        window_start: new Date().toISOString(),
        is_blocked: false,
        blocked_until: null,
      })
      .eq('id', rateLimitId);

    if (error) throw error;
  }

  /**
   * Update the action count for a rate limit record
   * @param rateLimitId - Rate limit record ID
   * @param newCount - New action count
   */
  private async updateRateLimit(rateLimitId: string, newCount: number): Promise<void> {
    const { error } = await supabase
      .from('rate_limits')
      .update({ action_count: newCount })
      .eq('id', rateLimitId);

    if (error) throw error;
  }

  /**
   * Block a user for exceeding rate limits
   * @param rateLimitId - Rate limit record ID
   * @param blockedUntil - Date when block expires
   */
  private async blockUser(rateLimitId: string, blockedUntil: Date): Promise<void> {
    const { error } = await supabase
      .from('rate_limits')
      .update({
        is_blocked: true,
        blocked_until: blockedUntil.toISOString(),
      })
      .eq('id', rateLimitId);

    if (error) throw error;
  }
}

const rateLimitServiceInstance = new RateLimitService();

// Export the checkRateLimit method as a standalone function for easier imports
export const checkRateLimit = (userId: string, actionType: ActionType) =>
  rateLimitServiceInstance.checkRateLimit(userId, actionType);

export const rateLimitService = rateLimitServiceInstance;
