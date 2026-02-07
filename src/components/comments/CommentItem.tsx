import React, { useState } from 'react';
import { Trash2, User } from 'lucide-react';
import type { Comment } from '../../services/comments.service';

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
  isDeleting?: boolean;
}

/**
 * CommentItem component for displaying a single comment
 * Shows author info, content, timestamp, and delete button for authorized users
 */
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  canDelete,
  onDelete,
  isDeleting = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'только что';
    }

    // Less than 1 hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${getMinutesWord(minutes)} назад`;
    }

    // Less than 24 hours
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${getHoursWord(hours)} назад`;
    }

    // Less than 7 days
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${getDaysWord(days)} назад`;
    }

    // Format as date
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getMinutesWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'минуту';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'минуты';
    return 'минут';
  };

  const getHoursWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'час';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'часа';
    return 'часов';
  };

  const getDaysWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'дня';
    return 'дней';
  };

  const username = comment.profiles?.username || 'Аноним';
  const avatarUrl = comment.profiles?.avatar_url;

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{username}</span>
              <span className="text-gray-500 text-sm">
                {formatDate(comment.created_at)}
              </span>
            </div>

            {/* Delete button */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  showDeleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'text-gray-500 hover:text-red-500 hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={showDeleteConfirm ? 'Нажмите еще раз для подтверждения' : 'Удалить комментарий'}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Trash2 size={16} />
                    {showDeleteConfirm && (
                      <span className="text-xs">Подтвердить?</span>
                    )}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Comment text */}
          <p className="text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
};
