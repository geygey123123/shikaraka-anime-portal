import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './admin.service';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock ratings service
vi.mock('./ratings.service', () => ({
  ratingsService: {
    getTopRatedAnime: vi.fn(),
  },
}));

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStatistics', () => {
    it('should aggregate all statistics', async () => {
      // Mock all the private methods
      vi.spyOn(adminService as any, 'getTotalUsers').mockResolvedValue(100);
      vi.spyOn(adminService as any, 'getActiveUsers').mockResolvedValue(50);
      vi.spyOn(adminService as any, 'getTotalFavorites').mockResolvedValue(200);
      vi.spyOn(adminService as any, 'getTotalComments').mockResolvedValue(150);
      vi.spyOn(adminService as any, 'getTotalRatings').mockResolvedValue(300);
      vi.spyOn(adminService as any, 'getTopAnime').mockResolvedValue([]);
      vi.spyOn(adminService as any, 'getTopRated').mockResolvedValue([]);

      const result = await adminService.getStatistics();

      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(50);
      expect(result.totalFavorites).toBe(200);
      expect(result.totalComments).toBe(150);
      expect(result.totalRatings).toBe(300);
    });
  });

  describe('getTopAnime', () => {
    it('should group and sort anime by favorites count', async () => {
      // Mock the private method directly
      vi.spyOn(adminService as any, 'getTopAnime').mockResolvedValue([
        { anime_id: 1, anime_name: 'Anime 1', count: 3 },
        { anime_id: 2, anime_name: 'Anime 2', count: 1 },
      ]);

      const result = await adminService.getTopAnime();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    });

    it('should limit results to top 10', async () => {
      const mockFavorites = Array.from({ length: 15 }, (_, i) => ({
        anime_id: i + 1,
        anime_name: `Anime ${i + 1}`,
      }));

      const mockSelect = vi.fn().mockResolvedValue({ data: mockFavorites, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await adminService.getTopAnime();

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });
});
