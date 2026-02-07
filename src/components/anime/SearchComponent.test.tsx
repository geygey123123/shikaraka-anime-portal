import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SearchComponent } from './SearchComponent';
import { shikimoriService } from '../../services/shikimori';
import type { Anime } from '../../types/anime';

// Mock shikimori service
vi.mock('../../services/shikimori', () => ({
  shikimoriService: {
    searchWithFilters: vi.fn(),
    groupAnimeWithRelated: vi.fn(),
    getRelatedAnime: vi.fn(),
    sortRelatedChronologically: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
};

describe('SearchComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchComponent />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText('Поиск аниме...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show loading indicator while searching', async () => {
    const mockAnime: Anime = {
      id: 1,
      name: 'Test Anime',
      russian: 'Тестовое Аниме',
      image: {
        original: 'test.jpg',
        preview: 'test.jpg',
        x96: 'test.jpg',
        x48: 'test.jpg',
      },
      url: '/anime/1',
      kind: 'tv',
      score: '8.5',
      status: 'released',
      episodes: 12,
      episodes_aired: 12,
      aired_on: '2023-01-01',
      released_on: '2023-03-31',
      rating: 'pg_13',
      english: ['Test Anime'],
      japanese: ['テストアニメ'],
      synonyms: [],
      license_name_ru: null,
      duration: 24,
      description: 'Test description',
      description_html: '<p>Test description</p>',
      description_source: null,
      franchise: null,
      favoured: false,
      thread_id: 1,
      topic_id: 1,
      myanimelist_id: 1,
      rates_scores_stats: [],
      rates_statuses_stats: [],
      updated_at: '2023-01-01',
      next_episode_at: null,
      genres: [],
      studios: [],
    };

    vi.mocked(shikimoriService.searchWithFilters).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([mockAnime]), 100))
    );
    vi.mocked(shikimoriService.groupAnimeWithRelated).mockResolvedValue([
      {
        main: mockAnime,
        related: [],
        isExpanded: false,
        isRoot: true,
      },
    ]);

    render(<SearchComponent />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText('Поиск аниме...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should show loading indicator
    await waitFor(() => {
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  it('should display search results', async () => {
    const mockAnime: Anime = {
      id: 1,
      name: 'Test Anime',
      russian: 'Тестовое Аниме',
      image: {
        original: 'test.jpg',
        preview: 'test.jpg',
        x96: 'test.jpg',
        x48: 'test.jpg',
      },
      url: '/anime/1',
      kind: 'tv',
      score: '8.5',
      status: 'released',
      episodes: 12,
      episodes_aired: 12,
      aired_on: '2023-01-01',
      released_on: '2023-03-31',
      rating: 'pg_13',
      english: ['Test Anime'],
      japanese: ['テストアニメ'],
      synonyms: [],
      license_name_ru: null,
      duration: 24,
      description: 'Test description',
      description_html: '<p>Test description</p>',
      description_source: null,
      franchise: null,
      favoured: false,
      thread_id: 1,
      topic_id: 1,
      myanimelist_id: 1,
      rates_scores_stats: [],
      rates_statuses_stats: [],
      updated_at: '2023-01-01',
      next_episode_at: null,
      genres: [],
      studios: [],
    };

    vi.mocked(shikimoriService.searchWithFilters).mockResolvedValue([mockAnime]);
    vi.mocked(shikimoriService.groupAnimeWithRelated).mockResolvedValue([
      {
        main: mockAnime,
        related: [],
        isExpanded: false,
        isRoot: true,
      },
    ]);

    render(<SearchComponent />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText('Поиск аниме...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce and results
    await waitFor(
      () => {
        const elements = screen.getAllByText('Тестовое Аниме');
        expect(elements.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );
  });

  it('should show empty state when no results found', async () => {
    vi.mocked(shikimoriService.searchWithFilters).mockResolvedValue([]);
    vi.mocked(shikimoriService.groupAnimeWithRelated).mockResolvedValue([]);

    render(<SearchComponent />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText('Поиск аниме...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Wait for debounce and empty state
    await waitFor(
      () => {
        expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
