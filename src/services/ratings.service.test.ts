import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ratingsService } from './ratings.service';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock rate limit service
vi.mock('./rateLimit.service', () => ({
  checkRateLimit: vi.fn(),
}));

describe('RatingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRating', () => {
    it('should calculate average and weighted rating', async () => {
      const mockRatings = [
        { rating: 8 },
        { rating: 9 },
        { rating: 7 },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: mockRatings, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      // Mock getGlobalAverage
      vi.spyOn(ratingsService as any, 'getGlobalAverage').mockResolvedValue(7.5);

      const result = await ratingsService.getRating(1);

      expect(result.count).toBe(3);
      expect(result.average).toBe(8);
      expect(result.weighted).toBeGreaterThan(0);
    });

    it('should return zero for anime with no ratings', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      vi.spyOn(ratingsService as any, 'getGlobalAverage').mockResolvedValue(5.0);

      const result = await ratingsService.getRating(1);

      expect(result.count).toBe(0);
      expect(result.average).toBe(0);
    });
  });

  describe('calculateBayesianAverage', () => {
    it('should calculate Bayesian average correctly', () => {
      const result = ratingsService.calculateBayesianAverage(8.5, 20, 7.0);
      
      // With 20 votes (above MIN_VOTES of 10), should be closer to anime average
      expect(result).toBeGreaterThan(7.0);
      expect(result).toBeLessThan(8.5);
    });

    it('should weight towards global average with few votes', () => {
      const result = ratingsService.calculateBayesianAverage(9.0, 2, 7.0);
      
      // With only 2 votes, should be closer to global average
      expect(result).toBeLessThan(8.0);
    });
  });

  describe('setRating', () => {
    it('should validate rating range', async () => {
      await expect(
        ratingsService.setRating(1, 11, 'user1')
      ).rejects.toThrow('Оценка должна быть от 1 до 10');

      await expect(
        ratingsService.setRating(1, 0, 'user1')
      ).rejects.toThrow('Оценка должна быть от 1 до 10');
    });

    it('should update existing rating', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'rating1' }, error: null });
      const mockUpdate = vi.fn().mockReturnThis();

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
      } as any);

      await ratingsService.setRating(1, 8, 'user1');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 8 })
      );
    });

    it('should insert new rating', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        insert: mockInsert,
      } as any);

      await ratingsService.setRating(1, 9, 'user1');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ anime_id: 1, rating: 9, user_id: 'user1' })
      );
    });
  });

  describe('getTopRatedAnime', () => {
    it('should return top rated anime sorted by weighted rating', async () => {
      const mockRatings = [
        { anime_id: 1, rating: 8 },
        { anime_id: 1, rating: 9 },
        { anime_id: 2, rating: 7 },
        { anime_id: 2, rating: 8 },
      ];

      const mockSelect = vi.fn().mockResolvedValue({ data: mockRatings, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      vi.spyOn(ratingsService as any, 'getGlobalAverage').mockResolvedValue(7.5);

      const result = await ratingsService.getTopRatedAnime(2);

      expect(result).toHaveLength(2);
      expect(result[0].weighted).toBeGreaterThanOrEqual(result[1].weighted);
    });
  });
});
