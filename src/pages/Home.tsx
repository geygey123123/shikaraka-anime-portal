import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopularAnime, useSearchAnime } from '../hooks/useAnime';
import { usePagination } from '../hooks/usePagination';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { Pagination } from '../components/pagination/Pagination';
import { Header } from '../components/layout/Header';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentPage, goToPage, resetPage } = usePagination(1);
  
  // Fetch popular anime with pagination
  const { data: popularAnimes, isLoading: isLoadingPopular, error: popularError, refetch: refetchPopular } = usePopularAnime(currentPage);
  
  // Fetch search results (only when query is not empty)
  const { data: searchResults, isLoading: isLoadingSearch, error: searchError, refetch: refetchSearch } = useSearchAnime(searchQuery);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      resetPage();
    }
  }, [searchQuery, resetPage]);

  // Memoize computed values to prevent unnecessary recalculations
  const isSearching = useMemo(() => searchQuery.length > 0, [searchQuery]);
  const animes = useMemo(() => isSearching ? searchResults : popularAnimes, [isSearching, searchResults, popularAnimes]);
  const isLoading = useMemo(() => isSearching ? isLoadingSearch : isLoadingPopular, [isSearching, isLoadingSearch, isLoadingPopular]);
  const error = useMemo(() => isSearching ? searchError : popularError, [isSearching, searchError, popularError]);
  const refetch = useMemo(() => isSearching ? refetchSearch : refetchPopular, [isSearching, refetchSearch, refetchPopular]);

  // Calculate total pages (Shikimori API typically has many pages, we'll set a reasonable limit)
  const totalPages = 50; // Reasonable limit for popular anime pagination

  // Memoize callbacks to prevent recreation on every render
  const handleAnimeClick = useCallback((id: number) => {
    navigate(`/anime/${id}`);
  }, [navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((page: number) => {
    goToPage(page);
  }, [goToPage]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] pb-40">{/* Увеличено до pb-40 */}
      <Header onSearch={handleSearch} />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 pb-8">{/* Added bottom padding control */}
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4">
            ShiKaraKa
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-2">
            Современный аниме-портал
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            Смотрите популярные аниме с русской озвучкой
          </p>
        </div>
      </section>

      {/* Anime Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            {isSearching ? 'Результаты поиска' : 'Популярные аниме'}
          </h2>
          
          <AnimeGrid
            animes={animes || []}
            isLoading={isLoading}
            error={error}
            onAnimeClick={handleAnimeClick}
            onRetry={handleRetry}
          />

          {/* Pagination - only show for popular anime (not for search) */}
          {!isSearching && !error && animes && animes.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </div>
      </section>
      
      {/* Spacer для комфортной прокрутки */}
      <div className="h-40" aria-hidden="true"></div>
    </div>
  );
};
