import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Trash2, UserPlus, Search } from 'lucide-react';
import { useModerators } from '../../hooks/useAdmin';
import { moderatorsService } from '../../services/moderators.service';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../ui/Button';

export const ModeratorManager: React.FC = () => {
  const { user } = useAuth();
  const { data: moderators, isLoading } = useModerators();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debounce search query with 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter moderators based on debounced search query
  const filteredModerators = useMemo(() => {
    if (!moderators) return [];
    if (!debouncedSearchQuery.trim()) return moderators;

    const query = debouncedSearchQuery.toLowerCase();
    return moderators.filter(moderator =>
      moderator.email.toLowerCase().includes(query)
    );
  }, [moderators, debouncedSearchQuery]);

  const addMutation = useMutation({
    mutationFn: (email: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return moderatorsService.addModerator(email, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
      setEmail('');
      setError(null);
      setSuccess('Модератор успешно добавлен');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (moderatorId: string) => moderatorsService.removeModerator(moderatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
      setSuccess('Модератор успешно удален');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleAddModerator = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Неверный формат email');
      return;
    }

    // Check for duplicates
    if (moderators?.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      setError('Этот пользователь уже является модератором');
      return;
    }

    addMutation.mutate(email);
  };

  const handleRemoveModerator = (moderatorId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого модератора?')) {
      removeMutation.mutate(moderatorId);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-[#ff0055]" />
        <h3 className="text-xl font-bold text-white">Управление модераторами</h3>
      </div>

      {/* Add Moderator Form */}
      <form onSubmit={handleAddModerator} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email нового модератора"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-colors"
              disabled={addMutation.isPending}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={addMutation.isPending || !email.trim()}
            className="flex items-center gap-2"
          >
            <UserPlus size={18} />
            <span>Добавить</span>
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="mt-2 text-sm text-green-400">{success}</p>
        )}
      </form>

      {/* Moderators List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400 mb-3">
          Текущие модераторы ({moderators?.length || 0})
        </h4>

        {/* Search input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск модераторов по email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              aria-label="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : filteredModerators && filteredModerators.length > 0 ? (
          <div className="space-y-2">
            {filteredModerators.map((moderator) => (
              <div
                key={moderator.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-[#ff0055]" />
                  <div>
                    <p className="text-white text-sm font-medium">{moderator.email}</p>
                    <p className="text-gray-400 text-xs">
                      Добавлен {new Date(moderator.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveModerator(moderator.id)}
                  disabled={removeMutation.isPending}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Удалить модератора"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">
            {searchQuery ? 'Модераторы не найдены' : 'Нет модераторов'}
          </p>
        )}
      </div>
    </div>
  );
};
