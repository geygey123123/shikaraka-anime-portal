import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
}

/**
 * CommentForm component for adding new comments
 * Validates comment length (10-1000 characters) and handles submission
 */
export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isLoading = false }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const MIN_LENGTH = 10;
  const MAX_LENGTH = 1000;
  const characterCount = content.length;
  const isValid = characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate comment length
    if (characterCount < MIN_LENGTH) {
      setError(`Комментарий должен содержать минимум ${MIN_LENGTH} символов`);
      return;
    }

    if (characterCount > MAX_LENGTH) {
      setError(`Комментарий не должен превышать ${MAX_LENGTH} символов`);
      return;
    }

    // Submit comment
    onSubmit(content);
    setContent(''); // Clear form after submission
  };

  const getCharacterCountColor = () => {
    if (characterCount === 0) return 'text-gray-500';
    if (characterCount < MIN_LENGTH) return 'text-red-500';
    if (characterCount > MAX_LENGTH) return 'text-red-500';
    if (characterCount > MAX_LENGTH * 0.9) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Напишите ваш комментарий..."
          disabled={isLoading}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-800 focus:border-[#ff0055] focus:outline-none focus:ring-1 focus:ring-[#ff0055] resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          rows={4}
        />
        
        {/* Character count */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-sm ${getCharacterCountColor()}`}>
            {characterCount} / {MAX_LENGTH}
            {characterCount < MIN_LENGTH && characterCount > 0 && (
              <span className="ml-2 text-gray-500">
                (минимум {MIN_LENGTH})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="flex items-center gap-2 px-6 py-2 bg-[#ff0055] text-white rounded-lg hover:bg-[#cc0044] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ff0055]"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>Отправка...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Отправить</span>
          </>
        )}
      </button>
    </form>
  );
};
