import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearch } from './useSearch';
import { shikimoriService } from '../services/shikimori';
import type { Anime, GroupedAnime } from '../types/anime';

// Mock shikimori service
vi.mock('../services/shikimori', () => ({
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty results when query is empty', async () => {
    const { result } = renderHook(() => useSearch('', {}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should fetch and group search results', async () => {
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

    const mockGrouped: GroupedAnime = {
      main: mockAnime,
      related: [],
      isExpanded: false,
      isRoot: true,
    };

    vi.mocked(shikimoriService.searchWithFilters).mockResolvedValue([mockAnime]);
    vi.mocked(shikimoriService.groupAnimeWithRelated).mockResolvedValue([mockGrouped]);

    const { result } = renderHook(() => useSearch('test', {}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].main.name).toBe('Test Anime');
  });

  it('should handle search with filters', async () => {
    const filters = {
      genres: ['action'],
      kind: ['tv'],
    };

    vi.mocked(shikimoriService.searchWithFilters).mockResolvedValue([]);
    vi.mocked(shikimoriService.groupAnimeWithRelated).mockResolvedValue([]);

    const { result } = renderHook(() => useSearch('test', filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(shikimoriService.searchWithFilters).toHaveBeenCalledWith(
      'test',
      filters,
      20
    );
  });

  it('should paginate results correctly', async () => {
    const mockAnimes = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      name: `Anime ${i + 1}`,
      russian: `Аниме ${i + 1}`,
      image: {
        original: 'test.jpg',
        preview: 'test.jpg',
        x96: 'test.jpg',
        x48: 'test.jpg',
      },
      url: `/anime/${i + 1}`,
      kind: 'tv',
      score: '8.0',
      status: 'released',
      episodes: 12,
      episodes_aired: 12,
      aired_on: '2023-01-01',
      released_on: '2023-03-31',
      rating: 'pg_13',
      english: [`Anime ${i + 1}`],
      japanese: [`アニメ${i + 1}`],
      synonyms: [],
      license_name_ru: null,
      duration: 24,
      description: 'Test',
      description_html: '<p>Test</p>',
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
    }));

    const mockGrouped = mockAnimes.map((anime) => ({
      main: anime,
      related: [],
      isExpanded: false,
      isRoot: true,
    }));

    vi.mocked(shikimoriService.searchWithFilters).mockResolvedValue(mockAnimes);
    vi.mocked(shikimoriService.groupAnimeWithRelated).mockResolvedValue(mockGrouped);

    const { result } = renderHook(() => useSearch('test', {}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toHaveLength(40);
    expect(result.current.hasMore).toBe(true);
  });
});
