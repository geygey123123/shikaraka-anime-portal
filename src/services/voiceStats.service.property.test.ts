import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { voiceStatsService } from './voiceStats.service';
import { supabase } from './supabase';

/**
 * Property-Based Tests for Voice Stats Service
 * Feature: advanced-search-and-voice-stats
 */

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Feature: advanced-search-and-voice-stats, Property 7: Voice stats sorting by popularity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should sort voice stats by count in descending order (most popular first)', () => {
    fc.assert(
      fc.property(
        // Generate array of voice selections with random voice names and counts
        fc.array(
          fc.record({
            voice_name: fc.oneof(
              fc.constant('Anilibria'),
              fc.constant('AniDUB'),
              fc.constant('Субтитры'),
              fc.constant('AniStar'),
              fc.constant('AniMedia'),
              fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)
            ),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        async (voiceSelections) => {
          // Skip if no valid selections
          if (voiceSelections.length === 0) return;

          // Mock Supabase response
          const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: voiceSelections,
                error: null,
              }),
            }),
          });

          (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

          // Call the service method
          const stats = await voiceStatsService.getVoiceStats(1);

          // Property: Stats should be sorted by count in descending order
          for (let i = 0; i < stats.length - 1; i++) {
            expect(stats[i].count).toBeGreaterThanOrEqual(stats[i + 1].count);
          }

          // Additional property: All counts should be positive
          stats.forEach((stat) => {
            expect(stat.count).toBeGreaterThan(0);
          });

          // Additional property: Sum of all counts should equal total selections
          const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
          expect(totalCount).toBe(voiceSelections.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain sorting invariant: for any two adjacent stats, first.count >= second.count', () => {
    fc.assert(
      fc.property(
        // Generate voice selections with specific counts to test edge cases
        fc.array(
          fc.record({
            voice_name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          }),
          { minLength: 2, maxLength: 50 }
        ),
        async (voiceSelections) => {
          // Skip if no valid selections
          if (voiceSelections.length === 0) return;

          // Mock Supabase response
          const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: voiceSelections,
                error: null,
              }),
            }),
          });

          (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

          // Call the service method
          const stats = await voiceStatsService.getVoiceStats(1);

          // Property: Sorting invariant - each element >= next element
          const isSorted = stats.every((stat, index) => {
            if (index === stats.length - 1) return true;
            return stat.count >= stats[index + 1].count;
          });

          expect(isSorted).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case: single voice selection', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (voiceName) => {
          // Mock Supabase response with single selection
          const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ voice_name: voiceName }],
                error: null,
              }),
            }),
          });

          (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

          // Call the service method
          const stats = await voiceStatsService.getVoiceStats(1);

          // Property: Single selection should have count of 1 and 100% percentage
          expect(stats).toHaveLength(1);
          expect(stats[0].voice_name).toBe(voiceName);
          expect(stats[0].count).toBe(1);
          expect(stats[0].percentage).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case: all selections are the same voice', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 1, max: 100 }),
        async (voiceName, count) => {
          // Mock Supabase response with multiple identical selections
          const voiceSelections = Array(count).fill({ voice_name: voiceName });

          const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: voiceSelections,
                error: null,
              }),
            }),
          });

          (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

          // Call the service method
          const stats = await voiceStatsService.getVoiceStats(1);

          // Property: Should have exactly one stat entry with 100% percentage
          expect(stats).toHaveLength(1);
          expect(stats[0].voice_name).toBe(voiceName);
          expect(stats[0].count).toBe(count);
          expect(stats[0].percentage).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case: multiple voices with equal counts', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), {
          minLength: 2,
          maxLength: 10,
        }).map(arr => [...new Set(arr)]), // Ensure unique voice names
        fc.integer({ min: 1, max: 10 }),
        async (voiceNames, countPerVoice) => {
          // Skip if we don't have at least 2 unique voice names
          if (voiceNames.length < 2) return;

          // Create selections where each voice has the same count
          const voiceSelections = voiceNames.flatMap((voiceName) =>
            Array(countPerVoice).fill({ voice_name: voiceName })
          );

          const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: voiceSelections,
                error: null,
              }),
            }),
          });

          (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

          // Call the service method
          const stats = await voiceStatsService.getVoiceStats(1);

          // Property: All stats should have the same count
          const allCountsEqual = stats.every(
            (stat) => stat.count === countPerVoice
          );
          expect(allCountsEqual).toBe(true);

          // Property: All stats should have the same percentage
          const expectedPercentage = 100 / voiceNames.length;
          stats.forEach((stat) => {
            expect(stat.percentage).toBeCloseTo(expectedPercentage, 1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
