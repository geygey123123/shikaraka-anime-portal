import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { shikimoriService } from './shikimori';
import type { Anime, RelatedAnime } from '../types/anime';

/**
 * Feature: advanced-search-and-voice-stats
 * Property 2: Related anime grouping and chronological ordering
 * Validates: Requirements 1.3, 1.4, 1.5
 */

describe('Feature: advanced-search-and-voice-stats, Property 2: Related anime grouping and chronological ordering', () => {
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

  // Arbitrary for generating related anime
  const relatedAnimeArbitrary = fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    relation: fc.constantFrom('sequel', 'prequel', 'side_story', 'alternative', 'summary', 'parent_story', 'spin_off'),
    relation_russian: fc.string(),
    anime: animeArbitrary,
  }) as fc.Arbitrary<RelatedAnime>;

  it('should sort related anime chronologically by aired_on date', () => {
    fc.assert(
      fc.property(
        fc.array(relatedAnimeArbitrary, { minLength: 2, maxLength: 10 }),
        (relatedAnimeList) => {
          const sorted = shikimoriService.sortRelatedChronologically(relatedAnimeList);

          // Verify chronological ordering
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentDate = new Date(sorted[i].anime.aired_on || '9999-12-31');
            const nextDate = new Date(sorted[i + 1].anime.aired_on || '9999-12-31');
            
            expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
          }

          // Verify all items are present
          expect(sorted.length).toBe(relatedAnimeList.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should determine root anime based on highest score', () => {
    fc.assert(
      fc.property(
        fc.array(animeArbitrary, { minLength: 2, maxLength: 10 }),
        (animeList) => {
          const root = shikimoriService.determineRootAnime(animeList);

          // Root should be in the list
          expect(animeList.some(a => a.id === root.id)).toBe(true);

          // Root should have the highest score (or tied for highest)
          const rootScore = parseFloat(root.score) || 0;
          const allScores = animeList.map(a => parseFloat(a.score) || 0);
          const maxScore = Math.max(...allScores);

          expect(rootScore).toBe(maxScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should determine root anime by earliest date when scores are equal', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 0, max: 10 }).map(n => n.toFixed(2)), // score as string
          fc.array(fc.date({ min: new Date('1960-01-01'), max: new Date('2030-12-31') }), { minLength: 2, maxLength: 5 })
        ),
        ([score, dates]) => {
          // Create anime with same score but different dates
          // Use unique IDs to ensure we can identify which anime was selected
          const animeList: Anime[] = dates.map((date, index) => ({
            id: 1000 + index, // Unique IDs
            name: `Anime ${index}`,
            russian: `Аниме ${index}`,
            image: {
              original: 'https://example.com/image.jpg',
              preview: 'https://example.com/preview.jpg',
              x96: 'https://example.com/x96.jpg',
              x48: 'https://example.com/x48.jpg',
            },
            url: 'https://example.com',
            kind: 'tv',
            score: score,
            status: 'released',
            episodes: 12,
            episodes_aired: 12,
            aired_on: date.toISOString().split('T')[0],
            released_on: null,
            rating: 'pg_13',
            english: [],
            japanese: [],
            synonyms: [],
            license_name_ru: null,
            duration: 24,
            description: '',
            description_html: '',
            description_source: null,
            franchise: null,
            favoured: false,
            thread_id: 0,
            topic_id: 0,
            myanimelist_id: 0,
            rates_scores_stats: [],
            rates_statuses_stats: [],
            updated_at: new Date().toISOString(),
            next_episode_at: null,
            genres: [],
            studios: [],
          }));

          const root = shikimoriService.determineRootAnime(animeList);

          // Find the earliest date (comparing date strings since that's what aired_on stores)
          const dateStrings = animeList.map(a => a.aired_on);
          const earliestDateString = dateStrings.reduce((earliest, current) => 
            current < earliest ? current : earliest
          );

          // Root should have the earliest date string
          expect(root.aired_on).toBe(earliestDateString);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should group anime without duplicates', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(animeArbitrary, { minLength: 1, maxLength: 10 }).chain(animeList => {
          // Ensure unique IDs by mapping indices
          const uniqueAnimeList = animeList.map((anime, index) => ({
            ...anime,
            id: index + 1, // Force unique IDs
          }));
          return fc.constant(uniqueAnimeList);
        }),
        async (animeList) => {
          const grouped = await shikimoriService.groupAnimeWithRelated(animeList);

          // All anime should be grouped
          expect(grouped.length).toBe(animeList.length);

          // Each group should have a main anime
          grouped.forEach(group => {
            expect(group.main).toBeDefined();
            expect(group.isExpanded).toBe(false);
            expect(group.isRoot).toBe(true);
          });

          // No duplicate IDs in main anime
          const mainIds = grouped.map(g => g.main.id);
          const uniqueIds = new Set(mainIds);
          expect(mainIds.length).toBe(uniqueIds.size);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty anime list for grouping', async () => {
    const grouped = await shikimoriService.groupAnimeWithRelated([]);
    expect(grouped).toEqual([]);
  });

  it('should throw error when determining root from empty list', () => {
    expect(() => shikimoriService.determineRootAnime([])).toThrow('Cannot determine root anime from empty list');
  });

  it('should return single anime as root when list has one item', () => {
    fc.assert(
      fc.property(
        animeArbitrary,
        (anime) => {
          const root = shikimoriService.determineRootAnime([anime]);
          expect(root.id).toBe(anime.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
