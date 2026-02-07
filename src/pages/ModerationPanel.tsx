import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin, useIsModerator } from '../hooks/useAdmin';
import { CommentModeration } from '../components/comments/CommentModeration';
import { LoadingScreen } from '../components/ui/LoadingScreen';

/**
 * ModerationPanel - Page for moderators to manage comments
 * Accessible only to moderators and admins
 */
export const ModerationPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const isModerator = useIsModerator();

  // Wait for authentication and admin status to load
  if (authLoading || adminLoading) {
    return <LoadingScreen />;
  }

  // Redirect if not authenticated or not a moderator/admin
  if (!user || (!isAdmin && !isModerator)) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Назад</span>
            </button>

            <div className="flex items-center gap-3">
              <Shield className="text-[#ff0055]" size={32} />
              <h1 className="text-3xl sm:text-4xl font-bold">Панель модерации</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <CommentModeration userId={user.id} />
        </div>
      </div>
    </div>
  );
};
