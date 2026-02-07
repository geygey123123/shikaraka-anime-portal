import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearch } from '../../hooks/useSearch';
import { usePagination } from '../../hooks/usePagination';
import { handleAPIError } from '../../utils/errorHandling';
import type { SearchFilters } from '../../types/anime';
import { AnimeCard } from './AnimeCard';
import { SkeletonCard } from '../ui/SkeletonCard';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Pagination } from '../pagination/Pagination';

interface SearchComponentProps {
  onAnimeSelect?: (animeId: number) => void;
  filters?: SearchFilters; // Changed from initialFilters
  showPagination?: boolean;
  searchQuery?: string; // External search query
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  onAnimeSelect,
  filters = {}, // Changed from initialFilters
  showPagination = true,
  searchQuery: externalSearchQuery,
}) => {
  const navigate = useNavigate();
  const { currentPage, goToPage } = usePagination(1);
  const [loadingGroups, setLoadingGroups] = React.useState<Set<number>>(new Set());

  // Use external search query
  const searchQuery = externalSearchQuery || '';

  // Debounce search query (300ms)
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Use search hook with debounced query and filters from props
  const { results, isLoading, error, toggleGroup, refetch } = useSearch(
    debouncedQuery,
    filters, // Use filters from props
    { pageSize: 20 }
  );

  // Get user-friendly error message
  const errorInfo = error ? handleAPIError(error) : null;

  // Handle retry
  const handleRetry = useCallback(() => {
    if (refetch) {
      refetch();
    }
  }, [refetch]);

  // Paginate results client-side
  const { paginatedResults, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    const paginated = results.slice(startIndex, endIndex);
    const calculatedTotalPages = Math.ceil(results.length / 20);
    
    return {
      paginatedResults: paginated,
      totalPages: calculatedTotalPages,
    };
  }, [results, currentPage]);

  // Handle anime click
  const handleAnimeClick = useCallback(
    (animeId: number) => {
      if (onAnimeSelect) {
        onAnimeSelect(animeId);
      } else {
        navigate(`/anime/${animeId}`);
      }
    },
    [onAnimeSelect, navigate]
  );

  // Handle group toggle
  const handleToggleGroup = useCallback(
    async (animeId: number) => {
      setLoadingGroups((prev) => new Set(prev).add(animeId));
      try {
        await toggleGroup(animeId);
      } finally {
        setLoadingGroups((prev) => {
          const next = new Set(prev);
          next.delete(animeId);
          return next;
        });
      }
    },
    [toggleGroup]
  );

  // Render skeleton cards
  const renderSkeletons = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      )),
    []
  );

  return (
    <div className="w-full">
      {/* Results */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {renderSkeletons}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && errorInfo && (
          <div className="flex justify-center items-center min-h-[400px]">
            <ErrorMessage
              message={errorInfo.message}
              onRetry={errorInfo.retry ? handleRetry : undefined}
              className="max-w-md"
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && debouncedQuery && results.length === 0 && (
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-gray-400 text-lg">Ничего не найдено</p>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !error && paginatedResults.length > 0 && (
          <>
            {paginatedResults.map((group) => (
              <div key={group.main.id} className="space-y-4">
                {/* Main Anime */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-32 md:w-40">
                    <AnimeCard
                      anime={group.main}
                      onClick={handleAnimeClick}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {group.main.russian || group.main.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-3">
                      <span>{group.main.kind}</span>
                      <span>•</span>
                      <span>{group.main.aired_on?.split('-')[0] || 'N/A'}</span>
                      <span>•</span>
                      <span>⭐ {group.main.score}</span>
                    </div>

                    {/* Expand/Collapse Button - Always show */}
                    <button
                      onClick={() => handleToggleGroup(group.main.id)}
                      disabled={loadingGroups.has(group.main.id)}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-expanded={group.isExpanded}
                      aria-label={
                        group.isExpanded
                          ? 'Скрыть связанные аниме'
                          : 'Показать связанные аниме'
                      }
                    >
                      {loadingGroups.has(group.main.id) ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                          Загрузка...
                        </>
                      ) : group.isExpanded ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          Скрыть связанные
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Показать связанные
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Related Anime (Expanded) */}
                {group.isExpanded && (
                  <div className="ml-8 pl-4 border-l-2 border-gray-700">
                    {group.related.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {group.related.map((related) => (
                          <div key={related.anime.id} className="space-y-2">
                            <AnimeCard
                              anime={related.anime}
                              onClick={handleAnimeClick}
                            />
                            <p className="text-xs text-gray-500 text-center">
                              {related.relation_russian || related.relation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500 text-sm">
                        Связанные аниме не найдены
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {showPagination &&
        !isLoading &&
        !error &&
        results.length > 20 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              isLoading={isLoading}
            />
          </div>
        )}
    </div>
  );
};
