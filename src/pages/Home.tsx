import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopularAnime } from '../hooks/useAnime';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { Pagination } from '../components/pagination/Pagination';
import { Header } from '../components/layout/Header';
import { SearchComponent } from '../components/anime/SearchComponent';
import { FilterPanel } from '../components/anime/FilterPanel';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentPage, goToPage, resetPage } = usePagination(1);
  const { filters, clearFilters } = useFilters();
  
  // Fetch popular anime with pagination (only when not searching)
  const { data: popularAnimes, isLoading: isLoadingPopular, error: popularError, refetch: refetchPopular } = usePopularAnime(currentPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      resetPage();
    }
  }, [searchQuery, resetPage]);

  // Determine if we're in search mode
  const isSearching = useMemo(() => searchQuery.length > 0 || Object.keys(filters).length > 0, [searchQuery, filters]);

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
    refetchPopular();
  }, [refetchPopular]);

  const handlePageChange = useCallback((page: number) => {
    goToPage(page);
  }, [goToPage]);

  const handleFilterChange = useCallback(() => {
    // Filters are already updated via useFilters hook
  }, []);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSearchQuery('');
  }, [clearFilters]);

  // Detect mobile for drawer mode
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] pb-40">
      <Header onSearch={handleSearch} />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 pb-8">
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

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Section */}
          {isSearching ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filter Panel - Desktop Inline */}
              {!isMobile && (
                <div className="lg:col-span-1">
                  <FilterPanel
                    filters={filters}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                    mode="inline"
                  />
                </div>
              )}

              {/* Search Results */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                  Результаты поиска
                </h2>
                <SearchComponent
                  onAnimeSelect={handleAnimeClick}
                  initialFilters={filters}
                  showPagination={true}
                  searchQuery={searchQuery}
                />
              </div>

              {/* Filter Panel - Mobile Drawer */}
              {isMobile && (
                <FilterPanel
                  filters={filters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                  mode="drawer"
                />
              )}
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Популярные аниме
              </h2>

              <AnimeGrid
                animes={popularAnimes || []}
                isLoading={isLoadingPopular}
                error={popularError}
                onAnimeClick={handleAnimeClick}
                onRetry={handleRetry}
              />

              {/* Pagination - only show for popular anime */}
              {!popularError && popularAnimes && popularAnimes.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoadingPopular}
                />
              )}
            </>
          )}
        </div>
      </section>
      
      {/* Spacer для комфортной прокрутки */}
      <div className="h-40" aria-hidden="true"></div>
    </div>
  );
};
