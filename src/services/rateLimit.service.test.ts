import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimitService } from './rateLimit.service';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('RateLimitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should create new rate limit record for first action', async () => {
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

      await rateLimitService.checkRateLimit('user1', 'comment');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user1',
          action_type: 'comment',
          action_count: 1,
        })
      );
    });

    it('should throw error when user is blocked', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const mockData = {
        id: 'limit1',
        user_id: 'user1',
        action_type: 'comment',
        action_count: 30,
        window_start: new Date().toISOString(),
        is_blocked: true,
        blocked_until: futureDate,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any);

      await expect(
        rateLimitService.checkRateLimit('user1', 'comment')
      ).rejects.toThrow('Слишком много действий');
    });

    it('should reset window when expired', async () => {
      const pastDate = new Date(Date.now() - 7200000).toISOString(); // 2 hours ago
      const mockData = {
        id: 'limit1',
        user_id: 'user1',
        action_type: 'comment',
        action_count: 5,
        window_start: pastDate,
        is_blocked: false,
        blocked_until: null,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({
        eq: mockEqUpdate,
      } as any);

      await rateLimitService.checkRateLimit('user1', 'comment');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          action_count: 1,
          is_blocked: false,
        })
      );
    });

    it('should increment count within window', async () => {
      const recentDate = new Date(Date.now() - 1800000).toISOString(); // 30 minutes ago
      const mockData = {
        id: 'limit1',
        user_id: 'user1',
        action_type: 'comment',
        action_count: 5,
        window_start: recentDate,
        is_blocked: false,
        blocked_until: null,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({
        eq: mockEqUpdate,
      } as any);

      await rateLimitService.checkRateLimit('user1', 'comment');

      expect(mockUpdate).toHaveBeenCalledWith({ action_count: 6 });
    });

    it('should block user when limit exceeded', async () => {
      const recentDate = new Date(Date.now() - 1800000).toISOString();
      const mockData = {
        id: 'limit1',
        user_id: 'user1',
        action_type: 'comment',
        action_count: 30, // At the limit
        window_start: recentDate,
        is_blocked: false,
        blocked_until: null,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({
        eq: mockEqUpdate,
      } as any);

      await expect(
        rateLimitService.checkRateLimit('user1', 'comment')
      ).rejects.toThrow('Слишком много действий');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_blocked: true,
        })
      );
    });
  });
});
