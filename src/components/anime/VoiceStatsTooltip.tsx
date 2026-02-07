import { useState } from 'react';
import { useVoiceStats } from '../../hooks/useVoiceStats';
import { handleAPIError } from '../../utils/errorHandling';

interface VoiceStatsTooltipProps {
  animeId: number;
  position?: 'top' | 'bottom';
}

/**
 * Компонент для отображения статистики озвучек с всплывающей подсказкой
 * Показывает популярность каждой озвучки и выбор текущего пользователя
 */
export const VoiceStatsTooltip: React.FC<VoiceStatsTooltipProps> = ({
  animeId,
  position = 'bottom',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { stats, isLoading, error, userSelection, refetch } = useVoiceStats(animeId);

  // Get user-friendly error message
  const errorInfo = error ? handleAPIError(error) : null;

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  // Позиционирование тултипа
  const tooltipPositionClass =
    position === 'top'
      ? 'bottom-full mb-2'
      : 'top-full mt-2';

  return (
    <div className="relative inline-block">
      {/* Триггер */}
      <div
        className="text-sm text-blue-600 hover:text-blue-800 cursor-help underline decoration-dotted"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Какую озвучку выбрать?
      </div>

      {/* Тултип */}
      {isVisible && (
        <div
          className={`absolute ${tooltipPositionClass} left-0 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Стрелка */}
          <div
            className={`absolute left-4 w-3 h-3 bg-white border-gray-200 transform rotate-45 ${
              position === 'top'
                ? 'top-full -mt-1.5 border-b border-r'
                : 'bottom-full -mb-1.5 border-t border-l'
            }`}
          />

          {/* Содержимое */}
          <div className="relative">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Статистика озвучек
            </h3>

            {isLoading && (
              <div className="space-y-3">
                {/* Loading skeleton */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                ))}
              </div>
            )}

            {error && errorInfo && (
              <div className="space-y-2">
                <div className="text-sm text-red-600">
                  {errorInfo.message}
                </div>
                {errorInfo.retry && (
                  <button
                    onClick={handleRetry}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {errorInfo.action || 'Попробовать снова'}
                  </button>
                )}
              </div>
            )}

            {!isLoading && !error && stats.length === 0 && (
              <div className="text-sm text-gray-500">
                Пока нет данных о выборе озвучек
              </div>
            )}

            {!isLoading && !error && stats.length > 0 && (
              <div className="space-y-3">
                {stats.map((stat) => {
                  const isUserSelection = userSelection === stat.voice_name;

                  return (
                    <div key={stat.voice_name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${
                            isUserSelection
                              ? 'text-blue-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {stat.voice_name}
                          {isUserSelection && (
                            <span className="ml-1 text-xs text-blue-500">
                              (ваш выбор)
                            </span>
                          )}
                        </span>
                        <span className="text-gray-600">
                          {stat.percentage.toFixed(1)}%
                        </span>
                      </div>

                      {/* Прогресс-бар */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isUserSelection ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>

                      <div className="text-xs text-gray-500">
                        {stat.count} {stat.count === 1 ? 'выбор' : 'выборов'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
