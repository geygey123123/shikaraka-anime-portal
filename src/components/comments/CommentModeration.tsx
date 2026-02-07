import React, { useState } from 'react';
import { Shield, Trash2, Filter, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { commentsService } from '../../services/comments.service';
import type { Comment } from '../../services/comments.service';

interface CommentModerationProps {
  userId: string;
}

type FilterType = 'all' | 'recent' | 'deleted';

/**
 * CommentModeration component for moderators to manage comments
 * Displays list of recent comments with filtering and delete actions
 */
export const CommentModeration: React.FC<CommentModerationProps> = ({ userId }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all comments for moderation
  const { data: comments, isLoading, error } = useQuery<Comment[], Error>({
    queryKey: ['moderationComments', filter],
    queryFn: async () => {
      // First, get comments
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply filter
      if (filter === 'deleted') {
        query = query.eq('is_deleted', true);
      } else if (filter === 'recent') {
        query = query.eq('is_deleted', false);
      }

      const { data: commentsData, error: commentsError } = await query;

      if (commentsError) throw commentsError;
      if (!commentsData || commentsData.length === 0) return [];

      // Then, fetch profiles separately
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      // Map profiles to comments
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return commentsData.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id) || { username: null, avatar_url: null }
      }));
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await commentsService.deleteComment(commentId, userId, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationComments'] });
    },
  });

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredCount = () => {
    if (!comments) return 0;
    return comments.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="text-[#ff0055]" size={28} />
        <h2 className="text-2xl font-bold text-white">Модерация комментариев</h2>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={18} />
          <span className="text-sm">Фильтр:</span>
        </div>
        
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-[#ff0055] text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Все комментарии
        </button>
        
        <button
          onClick={() => setFilter('recent')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'recent'
              ? 'bg-[#ff0055] text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Активные
        </button>
        
        <button
          onClick={() => setFilter('deleted')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'deleted'
              ? 'bg-[#ff0055] text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Удаленные
        </button>
      </div>

      {/* Comments count */}
      <div className="text-gray-400 text-sm">
        Найдено комментариев: {getFilteredCount()}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff0055] mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка комментариев...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 bg-red-900/20 border border-red-900 rounded-lg text-center">
          <p className="text-red-400">
            Не удалось загрузить комментарии: {error.message}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && comments && comments.length === 0 && (
        <div className="p-12 bg-gray-900 rounded-lg border border-gray-800 text-center">
          <MessageSquare className="text-gray-600 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Комментарии не найдены</p>
        </div>
      )}

      {/* Comments list */}
      {!isLoading && !error && comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.is_deleted
                  ? 'bg-red-900/10 border-red-900/30'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-white">
                      {comment.profiles?.username || 'Аноним'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(comment.created_at)}
                    </span>
                    {comment.is_deleted && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">
                        Удален
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <p className={`text-sm ${
                    comment.is_deleted ? 'text-gray-500 italic' : 'text-gray-300'
                  }`}>
                    {comment.is_deleted
                      ? '[Комментарий удален модератором]'
                      : comment.content}
                  </p>

                  {/* Anime ID info */}
                  <div className="mt-2 text-xs text-gray-500">
                    Аниме ID: {comment.anime_id}
                  </div>
                </div>

                {/* Delete button */}
                {!comment.is_deleted && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deletingCommentId === comment.id}
                    className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Удалить комментарий"
                  >
                    {deletingCommentId === comment.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span className="text-sm">Удалить</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
