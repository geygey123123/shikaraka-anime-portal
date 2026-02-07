import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearch } from '../../hooks/useSearch';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { handleAPIError } from '../../utils/errorHandling';
import type { SearchFilters } from '../../types/anime';
import { AnimeCard } from './AnimeCard';
import { SkeletonCard } from '../ui/SkeletonCard';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Pagination } from '../pagination/Pagination';

interface SearchComponentProps {
  onAnimeSelect?: (animeId: number) => void;
  initialFilters?: SearchFilters;
  showPagination?: boolean;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  onAnimeSelect,
  initialFilters = {},
  showPagination = true,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { filters } = useFilters(initialFilters);
  const { currentPage, goToPage } = usePagination(1);

  // Debounce search query (300ms)
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Use search hook with debounced query
  const { results, isLoading, error, toggleGroup, expandGroup, refetch } = useSearch(
    debouncedQuery,
    filters,
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

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      goToPage(1); // Reset to first page on new search
    },
    [goToPage]
  );

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
      const group = results.find((g) => g.main.id === animeId);
      if (!group) return;

      // If expanding and no related anime loaded yet, load them
      if (!group.isExpanded && group.related.length === 0) {
        await expandGroup(animeId);
      }
      
      toggleGroup(animeId);
    },
    [results, expandGroup, toggleGroup]
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
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Поиск аниме..."
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
            aria-label="Поиск аниме"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

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

                    {/* Expand/Collapse Button */}
                    {group.main.id && (
                      <button
                        onClick={() => handleToggleGroup(group.main.id)}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center gap-1"
                        aria-expanded={group.isExpanded}
                        aria-label={
                          group.isExpanded
                            ? 'Скрыть связанные аниме'
                            : 'Показать связанные аниме'
                        }
                      >
                        {group.isExpanded ? (
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
                    )}
                  </div>
                </div>

                {/* Related Anime (Expanded) */}
                {group.isExpanded && group.related.length > 0 && (
                  <div className="ml-8 pl-4 border-l-2 border-gray-700">
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
