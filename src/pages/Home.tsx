import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopularAnime, useSearchAnime } from '../hooks/useAnime';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { Header } from '../components/layout/Header';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch popular anime
  const { data: popularAnimes, isLoading: isLoadingPopular, error: popularError, refetch: refetchPopular } = usePopularAnime();
  
  // Fetch search results (only when query is not empty)
  const { data: searchResults, isLoading: isLoadingSearch, error: searchError, refetch: refetchSearch } = useSearchAnime(searchQuery);

  // Memoize computed values to prevent unnecessary recalculations
  const isSearching = useMemo(() => searchQuery.length > 0, [searchQuery]);
  const animes = useMemo(() => isSearching ? searchResults : popularAnimes, [isSearching, searchResults, popularAnimes]);
  const isLoading = useMemo(() => isSearching ? isLoadingSearch : isLoadingPopular, [isSearching, isLoadingSearch, isLoadingPopular]);
  const error = useMemo(() => isSearching ? searchError : popularError, [isSearching, searchError, popularError]);
  const refetch = useMemo(() => isSearching ? refetchSearch : refetchPopular, [isSearching, refetchSearch, refetchPopular]);

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

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header onSearch={handleSearch} />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>
    </div>
  );
};
