import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import fc from 'fast-check';
import { useSearch } from './useSearch';
import { shikimoriService } from '../services/shikimori';
import type { Anime, SearchFilters } from '../types/anime';
import React from 'react';

/**
 * Feature: advanced-search-and-voice-stats
 * Property 4: Search result caching
 * Validates: Requirements 1.10
 */

// Arbitrary for generating anime objects
const animeArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 100000 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  russian: fc.string({ minLength: 1, maxLength: 100 }),
  image: fc.record({
    original: fc.webUrl(),
    preview: fc.webUrl(),
    x96: fc.webUrl(),
    x48: fc.webUrl(),
  }),
  url: fc.webUrl(),
  kind: fc.constantFrom('tv', 'movie', 'ova', 'ona', 'special'),
  score: fc.float({ min: 0, max: 10 }).map(n => n.toFixed(2)),
  status: fc.constantFrom('ongoing', 'released', 'anons'),
  episodes: fc.integer({ min: 0, max: 1000 }),
  episodes_aired: fc.integer({ min: 0, max: 1000 }),
  aired_on: fc.date({ min: new Date('1960-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().split('T')[0]),
  released_on: fc.option(fc.date({ min: new Date('1960-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().split('T')[0]), { nil: null }),
  rating: fc.constantFrom('g', 'pg', 'pg_13', 'r', 'r_plus', 'rx'),
  english: fc.array(fc.string()),
  japanese: fc.array(fc.string()),
  synonyms: fc.array(fc.string()),
  license_name_ru: fc.option(fc.string(), { nil: null }),
  duration: fc.integer({ min: 1, max: 200 }),
  description: fc.string(),
  description_html: fc.string(),
  description_source: fc.option(fc.string(), { nil: null }),
  franchise: fc.option(fc.string(), { nil: null }),
  favoured: fc.boolean(),
  thread_id: fc.integer(),
  topic_id: fc.integer(),
  myanimelist_id: fc.integer(),
  rates_scores_stats: fc.array(fc.record({ name: fc.integer(), value: fc.integer() })),
  rates_statuses_stats: fc.array(fc.record({ name: fc.string(), value: fc.integer() })),
  updated_at: fc.date().map(d => d.toISOString()),
  next_episode_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
  genres: fc.array(fc.record({
    id: fc.integer(),
    name: fc.string(),
    russian: fc.string(),
    kind: fc.string(),
  })),
  studios: fc.array(fc.record({
    id: fc.integer(),
    name: fc.string(),
    filtered_name: fc.string(),
    real: fc.boolean(),
    image: fc.option(fc.webUrl(), { nil: null }),
  })),
}) as fc.Arbitrary<Anime>;

// Arbitrary for search query (filter out whitespace-only strings)
const searchQueryArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

// Arbitrary for search filters (only generate filters with actual values)
const searchFiltersArbitrary = fc.oneof(
  // Empty filters
  fc.constant({}),
  // Filters with at least one defined value
  fc.record({
    genres: fc.option(fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 })),
    year: fc.option(fc.record({
      from: fc.option(fc.integer({ min: 1960, max: 2030 })),
      to: fc.option(fc.integer({ min: 1960, max: 2030 })),
    })),
    kind: fc.option(fc.array(fc.constantFrom('tv', 'movie', 'ova', 'ona', 'special'), { minLength: 1, maxLength: 3 })),
    status: fc.option(fc.array(fc.constantFrom('ongoing', 'released', 'anons'), { minLength: 1, maxLength: 2 })),
  }).filter(f => 
    // Ensure at least one filter has a value
    f.genres !== null || f.year !== null || f.kind !== null || f.status !== null
  )
) as fc.Arbitrary<SearchFilters>;

describe('Feature: advanced-search-and-voice-stats, Property 4: Search result caching', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  it('should not trigger new API call for same query within cache window', async () => {
    await fc.assert(
      fc.asyncProperty(
        searchQueryArbitrary,
        searchFiltersArbitrary,
        fc.array(animeArbitrary, { minLength: 1, maxLength: 10 }),
        async (query, filters, mockResults) => {
          // Create fresh QueryClient for this property test run
          const testQueryClient = new QueryClient({
            defaultOptions: {
              queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                retry: false,
              },
            },
          });

          const testWrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
          );

          const searchSpy = vi.spyOn(shikimoriService, 'searchWithFilters')
            .mockResolvedValue(mockResults);
          const groupSpy = vi.spyOn(shikimoriService, 'groupAnimeWithRelated')
            .mockResolvedValue(mockResults.map(anime => ({
              main: anime,
              related: [],
              isExpanded: false,
              isRoot: true,
            })));

          const { result: result1, unmount: unmount1 } = renderHook(
            () => useSearch(query, filters),
            { wrapper: testWrapper }
          );

          await waitFor(() => {
            expect(result1.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          expect(searchSpy).toHaveBeenCalledTimes(1);
          expect(groupSpy).toHaveBeenCalledTimes(1);

          const { result: result2, unmount: unmount2 } = renderHook(
            () => useSearch(query, filters),
            { wrapper: testWrapper }
          );

          await waitFor(() => {
            expect(result2.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          expect(searchSpy).toHaveBeenCalledTimes(1);
          expect(groupSpy).toHaveBeenCalledTimes(1);

          expect(result1.current.results.length).toBe(result2.current.results.length);
          expect(result1.current.results).toEqual(result2.current.results);

          unmount1();
          unmount2();
          searchSpy.mockRestore();
          groupSpy.mockRestore();
          testQueryClient.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should trigger new API call for different queries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(searchQueryArbitrary, searchQueryArbitrary).filter(([q1, q2]) => q1 !== q2),
        searchFiltersArbitrary,
        fc.array(animeArbitrary, { minLength: 1, maxLength: 10 }),
        async ([query1, query2], filters, mockResults) => {
          const searchSpy = vi.spyOn(shikimoriService, 'searchWithFilters')
            .mockResolvedValue(mockResults);
          const groupSpy = vi.spyOn(shikimoriService, 'groupAnimeWithRelated')
            .mockResolvedValue(mockResults.map(anime => ({
              main: anime,
              related: [],
              isExpanded: false,
              isRoot: true,
            })));

          const { result: result1, unmount: unmount1 } = renderHook(
            () => useSearch(query1, filters),
            { wrapper }
          );

          await waitFor(() => {
            expect(result1.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          expect(searchSpy).toHaveBeenCalledTimes(1);

          const { result: result2, unmount: unmount2 } = renderHook(
            () => useSearch(query2, filters),
            { wrapper }
          );

          await waitFor(() => {
            expect(result2.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          expect(searchSpy).toHaveBeenCalledTimes(2);
          expect(groupSpy).toHaveBeenCalledTimes(2);

          unmount1();
          unmount2();
          searchSpy.mockRestore();
          groupSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should trigger new API call for different filters with same query', async () => {
    await fc.assert(
      fc.asyncProperty(
        searchQueryArbitrary,
        fc.tuple(searchFiltersArbitrary, searchFiltersArbitrary).filter(([f1, f2]) => 
          JSON.stringify(f1) !== JSON.stringify(f2)
        ),
        fc.array(animeArbitrary, { minLength: 1, maxLength: 10 }),
        async (query, [filters1, filters2], mockResults) => {
          const searchSpy = vi.spyOn(shikimoriService, 'searchWithFilters')
            .mockResolvedValue(mockResults);
          const groupSpy = vi.spyOn(shikimoriService, 'groupAnimeWithRelated')
            .mockResolvedValue(mockResults.map(anime => ({
              main: anime,
              related: [],
              isExpanded: false,
              isRoot: true,
            })));

          const { result: result1, unmount: unmount1 } = renderHook(
            () => useSearch(query, filters1),
            { wrapper }
          );

          await waitFor(() => {
            expect(result1.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          expect(searchSpy).toHaveBeenCalledTimes(1);

          const { result: result2, unmount: unmount2 } = renderHook(
            () => useSearch(query, filters2),
            { wrapper }
          );

          await waitFor(() => {
            expect(result2.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          expect(searchSpy).toHaveBeenCalledTimes(2);
          expect(groupSpy).toHaveBeenCalledTimes(2);

          unmount1();
          unmount2();
          searchSpy.mockRestore();
          groupSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return cached results immediately on subsequent renders', async () => {
    await fc.assert(
      fc.asyncProperty(
        searchQueryArbitrary,
        searchFiltersArbitrary,
        fc.array(animeArbitrary, { minLength: 1, maxLength: 10 }),
        async (query, filters, mockResults) => {
          const searchSpy = vi.spyOn(shikimoriService, 'searchWithFilters')
            .mockResolvedValue(mockResults);
          const groupSpy = vi.spyOn(shikimoriService, 'groupAnimeWithRelated')
            .mockResolvedValue(mockResults.map(anime => ({
              main: anime,
              related: [],
              isExpanded: false,
              isRoot: true,
            })));

          const { result: result1, unmount: unmount1 } = renderHook(
            () => useSearch(query, filters),
            { wrapper }
          );

          await waitFor(() => {
            expect(result1.current.isLoading).toBe(false);
          }, { timeout: 3000 });

          const firstResults = result1.current.results;

          const { result: result2, unmount: unmount2 } = renderHook(
            () => useSearch(query, filters),
            { wrapper }
          );

          expect(result2.current.results).toEqual(firstResults);

          unmount1();
          unmount2();
          searchSpy.mockRestore();
          groupSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });
});
