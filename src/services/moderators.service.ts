import { supabase } from './supabase';

export interface Moderator {
  id: string;
  user_id: string;
  email: string;
  added_by: string;
  created_at: string;
}

class ModeratorsService {
  /**
   * Get all moderators
   * @returns Array of moderators
   */
  async getModerators(): Promise<Moderator[]> {
    const { data, error } = await supabase
      .from('moderators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Add a new moderator by email
   * @param email - Email of the user to make moderator
   * @param addedBy - User ID of the admin adding the moderator
   * @returns The created moderator record
   */
  async addModerator(email: string, addedBy: string): Promise<Moderator> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Неверный формат email');
    }

    // Check if moderator already exists
    const { data: existing } = await supabase
      .from('moderators')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      throw new Error('Этот пользователь уже является модератором');
    }

    // Find user by email in auth.users
    const { data: authUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', email) // Note: This assumes profiles has email, might need adjustment
      .single();

    // If user doesn't exist yet, we can still add them by email
    // They will be linked when they register
    const userId = authUsers?.id || email; // Use email as placeholder if user not found

    // Add moderator
    const { data, error } = await supabase
      .from('moderators')
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        added_by: addedBy,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Этот пользователь уже является модератором');
      }
      throw error;
    }

    return data;
  }

  /**
   * Remove a moderator
   * @param moderatorId - ID of the moderator record to remove
   */
  async removeModerator(moderatorId: string): Promise<void> {
    const { error } = await supabase
      .from('moderators')
      .delete()
      .eq('id', moderatorId);

    if (error) throw error;
  }

  /**
   * Check if a user is a moderator
   * @param userId - User ID to check
   * @returns True if user is a moderator
   */
  async isModerator(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('moderators')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  /**
   * Check if a user is a moderator by email
   * @param email - Email to check
   * @returns True if email is in moderators list
   */
  async isModeratorByEmail(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('moderators')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const moderatorsService = new ModeratorsService();
