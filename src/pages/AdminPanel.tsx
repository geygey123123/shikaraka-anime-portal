import React from 'react';
import { Navigate } from 'react-router-dom';
import { Users, UserCheck, Heart, MessageSquare, Star, Shield } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useIsAdmin, useAdminStats } from '../hooks/useAdmin';
import { StatisticsCard } from '../components/admin/StatisticsCard';
import { UserActivityChart } from '../components/admin/UserActivityChart';
import { TopAnimeList } from '../components/admin/TopAnimeList';
import { ModeratorManager } from '../components/admin/ModeratorManager';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const AdminPanel: React.FC = () => {
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: stats, isLoading: isStatsLoading, error } = useAdminStats();

  // Show loading screen while checking admin status
  if (isAdminLoading) {
    return <LoadingScreen />;
  }

  // Redirect if not admin (only after loading is complete)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Show loading screen while fetching stats
  if (isStatsLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message="Ошибка загрузки статистики" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message="Нет данных для отображения" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-[#ff0055]" />
            <h1 className="text-3xl font-bold text-white">Админ-панель</h1>
          </div>
          <p className="text-gray-400">
            Статистика и управление платформой ShiKaraKa
          </p>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatisticsCard
            icon={Users}
            label="Всего пользователей"
            value={stats.totalUsers}
            iconColor="#3b82f6"
          />
          <StatisticsCard
            icon={UserCheck}
            label="Активных за 7 дней"
            value={stats.activeUsers}
            iconColor="#10b981"
          />
          <StatisticsCard
            icon={Heart}
            label="Всего в избранном"
            value={stats.totalFavorites}
            iconColor="#ff0055"
          />
          <StatisticsCard
            icon={MessageSquare}
            label="Всего комментариев"
            value={stats.totalComments}
            iconColor="#f59e0b"
          />
          <StatisticsCard
            icon={Star}
            label="Всего оценок"
            value={stats.totalRatings}
            iconColor="#fbbf24"
          />
          <StatisticsCard
            icon={Shield}
            label="Модераторов"
            value={stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 0.05) : 0}
            iconColor="#8b5cf6"
          />
        </div>

        {/* User Activity Chart */}
        <div className="mb-8">
          <UserActivityChart data={stats.userActivity} />
        </div>

        {/* Top Anime Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopAnimeList type="favorites" data={stats.topAnime} />
          <TopAnimeList type="rating" data={stats.topRated} />
        </div>

        {/* Moderator Management */}
        <div className="mb-8">
          <ModeratorManager />
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
