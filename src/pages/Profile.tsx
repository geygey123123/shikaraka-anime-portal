import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, ArrowLeft } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useAdmin';

/**
 * Profile Page Component
 * Displays user profile information, statistics, and allows editing
 */
export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const [isEditing, setIsEditing] = useState(false);

  // Debug logging for profile data
  React.useEffect(() => {
    if (profile) {
      console.log('Profile page - Current profile:', profile);
      console.log('Profile page - is_admin:', profile.is_admin);
    }
  }, [profile]);

  // Redirect to home if not authenticated (only after auth loading is complete)
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-800 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 w-48 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Loading Skeleton */}
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-800 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 w-48 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-gray-800 rounded"></div>
                </div>
              </div>
              <div className="h-32 bg-gray-800 rounded-lg"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 bg-gray-800 rounded-lg"></div>
                <div className="h-32 bg-gray-800 rounded-lg"></div>
                <div className="h-32 bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400">Профиль не найден</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Назад
          </Button>

          {/* Profile Header */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-gray-600" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {profile.username || 'Пользователь'}
                    </h1>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>

                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex-shrink-0"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Редактировать
                    </Button>
                  )}
                </div>

                {profile.bio && !isEditing && (
                  <p className="text-gray-300 mt-3">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                Редактирование профиля
              </h2>
              <ProfileEditor
                profile={profile}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            /* Statistics */
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Статистика
              </h2>
              <ProfileStats userId={profile.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
