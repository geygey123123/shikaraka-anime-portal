import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voiceStatsService } from './voiceStats.service';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('VoiceStatsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordVoiceSelection', () => {
    it('should record voice selection for authenticated user', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      await voiceStatsService.recordVoiceSelection({
        user_id: 'user123',
        anime_id: 1,
        voice_name: 'AniLibria',
      });

      expect(supabase.from).toHaveBeenCalledWith('voice_stats');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user123',
          anime_id: 1,
          voice_name: 'AniLibria',
        }),
        { onConflict: 'user_id,anime_id' }
      );
    });

    it('should throw error for anonymous user', async () => {
      // This error should not trigger retries since it's a client error
      await expect(
        voiceStatsService.recordVoiceSelection({
          user_id: null,
          anime_id: 1,
          voice_name: 'AniLibria',
        })
      ).rejects.toThrow('Войдите в систему, чтобы сохранить выбор озвучки.');
    });

    it('should throw error on database failure', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({
        error: { message: 'Database error' },
      });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      await expect(
        voiceStatsService.recordVoiceSelection({
          user_id: 'user123',
          anime_id: 1,
          voice_name: 'AniLibria',
        })
      ).rejects.toThrow('Не удалось сохранить выбор озвучки: Database error');
      
      // Should have retried 3 times (initial + 3 retries = 4 total calls)
      expect(mockUpsert).toHaveBeenCalledTimes(4);
    }, 15000); // Increase timeout for retry logic
  });

  describe('getVoiceStats', () => {
    it('should return empty array for anime with no selections', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      const result = await voiceStatsService.getVoiceStats(1);

      expect(result).toEqual([]);
    });

    it('should aggregate stats correctly with single voice', async () => {
      const mockData = [
        { voice_name: 'AniLibria' },
        { voice_name: 'AniLibria' },
        { voice_name: 'AniLibria' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      const result = await voiceStatsService.getVoiceStats(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        voice_name: 'AniLibria',
        count: 3,
        percentage: 100,
      });
    });

    it('should aggregate stats correctly with multiple voices', async () => {
      const mockData = [
        { voice_name: 'AniLibria' },
        { voice_name: 'AniLibria' },
        { voice_name: 'AniLibria' },
        { voice_name: 'AniDUB' },
        { voice_name: 'AniDUB' },
        { voice_name: 'Субтитры' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      const result = await voiceStatsService.getVoiceStats(1);

      expect(result).toHaveLength(3);
      
      // Should be sorted by count descending
      expect(result[0].voice_name).toBe('AniLibria');
      expect(result[0].count).toBe(3);
      expect(result[0].percentage).toBe(50);

      expect(result[1].voice_name).toBe('AniDUB');
      expect(result[1].count).toBe(2);
      expect(result[1].percentage).toBeCloseTo(33.33, 1);

      expect(result[2].voice_name).toBe('Субтитры');
      expect(result[2].count).toBe(1);
      expect(result[2].percentage).toBeCloseTo(16.67, 1);
    });

    it('should sort stats by popularity descending', async () => {
      const mockData = [
        { voice_name: 'Субтитры' },
        { voice_name: 'AniLibria' },
        { voice_name: 'AniLibria' },
        { voice_name: 'AniLibria' },
        { voice_name: 'AniDUB' },
        { voice_name: 'AniDUB' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      const result = await voiceStatsService.getVoiceStats(1);

      // Verify descending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });

    it('should throw error on database failure', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      } as any);

      await expect(voiceStatsService.getVoiceStats(1)).rejects.toThrow(
        'Не удалось загрузить статистику озвучек: Database error'
      );
      
      // Should have retried 3 times (initial + 3 retries = 4 total calls)
      expect(mockEq).toHaveBeenCalledTimes(4);
    }, 15000); // Increase timeout for retry logic
  });

  describe('getUserVoiceSelection', () => {
    it('should return user voice selection', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { voice_name: 'AniLibria' },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any);

      const result = await voiceStatsService.getUserVoiceSelection('user123', 1);

      expect(result).toBe('AniLibria');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockEq).toHaveBeenCalledWith('anime_id', 1);
    });

    it('should return null when no selection found', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any);

      const result = await voiceStatsService.getUserVoiceSelection('user123', 1);

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' },
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any);

      await expect(
        voiceStatsService.getUserVoiceSelection('user123', 1)
      ).rejects.toThrow('Не удалось загрузить выбор озвучки: Database error');
      
      // Should have retried 3 times (initial + 3 retries = 4 total calls)
      expect(mockSingle).toHaveBeenCalledTimes(4);
    }, 15000); // Increase timeout for retry logic
  });
});
