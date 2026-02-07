import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Film, Star, TrendingUp } from 'lucide-react';
import { useAnimeDetails } from '../hooks/useAnime';
import VideoPlayer from '../components/anime/VideoPlayer';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FavoriteButton } from '../components/favorites/FavoriteButton';
import { CommentSection } from '../components/comments/CommentSection';
import { RatingDisplay, RatingInput, RatingStats } from '../components/rating';
import { useAuth } from '../hooks/useAuth';
import { useAnimeRating, useUserRating, useSetRating } from '../hooks/useRatings';
import { parseRateLimitError, logSuspiciousActivity } from '../utils/rateLimit';

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const animeId = parseInt(id || '0', 10);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const { user, isAuthenticated } = useAuth();
  
  const { data: anime, isLoading, error, refetch } = useAnimeDetails(animeId);
  
  // Fetch rating data
  const { data: ratingData, isLoading: isRatingLoading } = useAnimeRating(animeId);
  const { data: userRating } = useUserRating(animeId);
  const setRatingMutation = useSetRating();

  // Handle rating submission
  const handleRate = async (rating: number) => {
    try {
      await setRatingMutation.mutateAsync({ animeId, rating });
    } catch (error: any) {
      // Parse and handle rate limiting errors
      const parsed = parseRateLimitError(error.message || '');
      
      if (parsed.isRateLimit) {
        // Log suspicious activity
        logSuspiciousActivity(user?.id || null, 'rating', {
          animeId,
          rating,
          remainingMinutes: parsed.remainingMinutes,
        });
        
        // Show user-friendly error message
        alert(parsed.message);
      } else {
        alert('Не удалось сохранить оценку. Попробуйте еще раз.');
      }
    }
  };

  // Добавляем базовый URL для изображений Shikimori
  const getImageUrl = (url: string) => {
    if (!url) return '/anime-placeholder.svg';
    if (url.startsWith('http')) return url;
    return `https://shikimori.one${url}`;
  };

  // Initialize image URL when anime data is loaded
  React.useEffect(() => {
    if (anime?.image?.original) {
      setImageUrl(getImageUrl(anime.image.original));
      setImageError(false);
    }
  }, [anime]);

  // Handle image loading errors with fallback strategy
  const handleImageError = () => {
    if (!imageError && anime) {
      // First try: attempt to use preview image URL
      if (imageUrl === getImageUrl(anime.image.original) && anime.image.preview) {
        setImageUrl(getImageUrl(anime.image.preview));
      } else {
        // Final fallback: use placeholder
        setImageError(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#ff0055] mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            message={error?.message || 'Не удалось загрузить информацию об аниме'}
            onRetry={() => refetch()}
          />
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const displayName = anime.russian || anime.name;
  const year = anime.aired_on ? new Date(anime.aired_on).getFullYear() : 'N/A';

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-40">{/* Увеличено до pb-40 для комфортной прокрутки */}
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 pb-20">{/* Дополнительный padding снизу */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop: Two columns, Mobile: One column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <img
                  src={imageError ? '/anime-placeholder.svg' : imageUrl}
                  alt={displayName}
                  className="w-full rounded-lg shadow-2xl"
                  onError={handleImageError}
                />
                
                {/* Favorite Button */}
                <div className="mt-4">
                  <FavoriteButton animeId={anime.id} animeName={displayName} />
                </div>
              </div>
            </div>

            {/* Right Column - Details and Video */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  {displayName}
                </h1>
                {anime.name !== anime.russian && (
                  <p className="text-xl text-gray-400 mb-4">{anime.name}</p>
                )}
                
                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {/* Internal Rating - Use Bayesian weighted rating for detail page */}
                  {!isRatingLoading && ratingData && ratingData.count > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="text-[#ff0055]" size={18} />
                      <span className="text-gray-300">{ratingData.weighted.toFixed(1)}</span>
                      <span className="text-gray-500 text-xs">({ratingData.count})</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-500" size={18} />
                    <span className="text-gray-300">{year}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Film className="text-gray-500" size={18} />
                    <span className="text-gray-300">{anime.kind}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-gray-500" size={18} />
                    <span className="text-gray-300">{anime.status}</span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Рейтинг</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Rating Display and Input */}
                  <div className="space-y-6">
                    {/* Display current rating */}
                    {!isRatingLoading && ratingData && (
                      <RatingDisplay
                        rating={ratingData.weighted}
                        count={ratingData.count}
                        variant="detail"
                      />
                    )}

                    {/* Rating input for authenticated users */}
                    {isAuthenticated ? (
                      <div className="pt-4 border-t border-gray-800">
                        <RatingInput
                          animeId={animeId}
                          currentRating={userRating}
                          onRate={handleRate}
                          disabled={setRatingMutation.isPending}
                        />
                        {setRatingMutation.isPending && (
                          <p className="text-sm text-gray-400 mt-2">Сохранение...</p>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm">
                          Войдите, чтобы оценить это аниме
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Rating Stats */}
                  <div>
                    {!isRatingLoading && ratingData && (
                      <RatingStats
                        average={ratingData.average}
                        count={ratingData.count}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Смотреть онлайн</h2>
                <VideoPlayer shikimoriId={anime.id} animeName={displayName} />
              </div>

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Жанры</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-900 text-gray-300 rounded-full text-sm"
                      >
                        {genre.russian || genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Studios */}
              {anime.studios && anime.studios.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Студия</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <span
                        key={studio.id}
                        className="px-3 py-1 bg-gray-900 text-gray-300 rounded-full text-sm"
                      >
                        {studio.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {anime.description && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Описание</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {anime.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Эпизоды</p>
                  <p className="text-gray-300">
                    {anime.episodes_aired} / {anime.episodes || '?'}
                  </p>
                </div>
                
                {anime.duration && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Длительность эпизода</p>
                    <p className="text-gray-300">{anime.duration} мин</p>
                  </div>
                )}
                
                {anime.rating && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Рейтинг</p>
                    <p className="text-gray-300">{anime.rating}</p>
                  </div>
                )}
              </div>

              {/* Comment Section */}
              <CommentSection
                animeId={anime.id}
                isAuthenticated={isAuthenticated}
                currentUserId={user?.id}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer для комфортной прокрутки */}
      <div className="h-40" aria-hidden="true"></div>
    </div>
  );
};
