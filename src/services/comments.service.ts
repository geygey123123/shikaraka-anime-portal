import { supabase } from './supabase';

export interface Comment {
  id: string;
  user_id: string;
  anime_id: number;
  content: string;
  is_deleted: boolean;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

class CommentsService {
  private readonly COMMENTS_PER_PAGE = 20;

  /**
   * Get comments for a specific anime with pagination
   * @param animeId - The anime ID
   * @param page - Page number (1-indexed)
   * @returns Array of comments with user profile data
   */
  async getComments(animeId: number, page: number = 1): Promise<Comment[]> {
    const start = (page - 1) * this.COMMENTS_PER_PAGE;
    const end = start + this.COMMENTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('anime_id', animeId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    
    // Manually fetch profile data for each comment
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      // Map profiles to comments
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id) || { username: null, avatar_url: null }
      }));
    }
    
    return data || [];
  }

  /**
   * Add a new comment with rate limit check
   * @param animeId - The anime ID
   * @param content - Comment content
   * @param userId - User ID
   * @returns The created comment
   */
  async addComment(animeId: number, content: string, userId: string): Promise<Comment> {
    // Validate content length
    if (content.length < 10 || content.length > 1000) {
      throw new Error('Комментарий должен содержать от 10 до 1000 символов');
    }

    // Check rate limit before adding comment
    const rateLimitModule = await import('./rateLimit.service');
    await rateLimitModule.checkRateLimit(userId, 'comment');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        anime_id: animeId,
        content,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Fetch profile data separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userId)
      .single();
    
    return {
      ...data,
      profiles: profile || { username: null, avatar_url: null }
    };
  }

  /**
   * Delete a comment (soft delete for moderators, hard delete for authors)
   * @param commentId - Comment ID
   * @param userId - User ID performing the deletion
   * @param isModerator - Whether the user is a moderator or admin
   */
  async deleteComment(commentId: string, userId: string, isModerator: boolean): Promise<void> {
    if (isModerator) {
      // Moderators/admins soft delete (mark as deleted)
      const { error } = await supabase
        .from('comments')
        .update({
          is_deleted: true,
          deleted_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) throw error;
    } else {
      // Authors hard delete their own comments
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    }
  }
}

export const commentsService = new CommentsService();
