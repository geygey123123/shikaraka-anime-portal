import React, { useState } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useComments, useAddComment, useDeleteComment } from '../../hooks/useComments';
import { useIsAdmin, useIsModerator } from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { CommentListSkeleton } from './CommentSkeleton';
import { parseRateLimitError, logSuspiciousActivity } from '../../utils/rateLimit';

interface CommentSectionProps {
  animeId: number;
  isAuthenticated: boolean;
  currentUserId?: string;
}

/**
 * CommentSection component for displaying and managing comments
 * Shows comment list with pagination, form for authenticated users, and login prompt for guests
 */
export const CommentSection: React.FC<CommentSectionProps> = ({
  animeId,
  isAuthenticated,
  currentUserId,
}) => {
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();
  const { data: comments, isLoading, error } = useComments(animeId, currentPage);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const { isAdmin } = useIsAdmin();
  const { isModerator } = useIsModerator();

  const handleAddComment = async (content: string) => {
    try {
      await addComment.mutateAsync({ animeId, content });
      // Reset to first page after adding a comment to see the new comment
      setCurrentPage(1);
    } catch (err) {
      // Log suspicious activity if rate limit is exceeded
      if (err instanceof Error) {
        const parsed = parseRateLimitError(err.message);
        if (parsed.isRateLimit) {
          logSuspiciousActivity(user?.id || null, 'comment', {
            animeId,
            remainingMinutes: parsed.remainingMinutes,
          });
        }
      }
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment.mutateAsync({
        commentId,
        animeId,
        isModerator: isAdmin || isModerator,
      });
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const canDeleteComment = (comment: { user_id: string }) => {
    // User can delete their own comments, or if they are admin/moderator
    const canDelete = comment.user_id === currentUserId || isAdmin || isModerator;
    
    // Debug logging
    if (currentUserId) {
      console.log('Delete permission check:', {
        commentUserId: comment.user_id,
        currentUserId,
        isAdmin,
        isModerator,
        canDelete
      });
    }
    
    return canDelete;
  };

  return (
    <div className="mt-12 border-t border-gray-800 pt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-[#ff0055]" size={28} />
        <h2 className="text-2xl font-bold text-white">Комментарии</h2>
        {comments && comments.length > 0 && (
          <span className="text-gray-500">({comments.length})</span>
        )}
      </div>

      {/* Comment Form or Login Prompt */}
      <div className="mb-8">
        {isAuthenticated ? (
          <div>
            <CommentForm
              onSubmit={handleAddComment}
              isLoading={addComment.isPending}
            />
            
            {/* Error message for rate limiting */}
            {addComment.isError && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-900 rounded-lg text-red-400 text-sm">
                {addComment.error?.message || 'Не удалось отправить комментарий'}
              </div>
            )}
            
            {/* Success message */}
            {addComment.isSuccess && (
              <div className="mt-3 p-3 bg-green-900/20 border border-green-900 rounded-lg text-green-400 text-sm">
                Комментарий успешно добавлен!
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 text-center">
            <p className="text-gray-400 mb-3">
              Войдите, чтобы оставить комментарий
            </p>
            <button
              onClick={() => {
                // This would typically open a login modal
                // For now, we'll just show an alert
                alert('Функция входа будет реализована в AuthModal');
              }}
              className="px-6 py-2 bg-[#ff0055] text-white rounded-lg hover:bg-[#cc0044] transition-colors"
            >
              Войти
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading && <CommentListSkeleton count={3} />}

        {error && (
          <div className="p-6 bg-red-900/20 border border-red-900 rounded-lg text-center">
            <p className="text-red-400">
              Не удалось загрузить комментарии: {error.message}
            </p>
          </div>
        )}

        {!isLoading && !error && comments && comments.length === 0 && (
          <div className="p-8 bg-gray-900 rounded-lg border border-gray-800 text-center">
            <MessageSquare className="text-gray-600 mx-auto mb-3" size={48} />
            <p className="text-gray-400">
              Пока нет комментариев. Будьте первым!
            </p>
          </div>
        )}

        {!isLoading && !error && comments && comments.length > 0 && (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canDelete={canDeleteComment(comment)}
                onDelete={() => handleDeleteComment(comment.id)}
                isDeleting={deletingCommentId === comment.id}
              />
            ))}

            {/* Pagination controls */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
              <button
                onClick={() => {
                  setCurrentPage(prev => prev - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
              >
                <ChevronLeft size={20} />
                <span>Предыдущая</span>
              </button>

              <div className="text-gray-400 text-sm">
                Страница {currentPage}
                {comments.length === 20 && (
                  <span className="text-gray-500"> • Показано {comments.length} комментариев</span>
                )}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => prev + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={comments.length < 20 || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
              >
                <span>Следующая</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
