import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentsService } from './comments.service';
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

describe('CommentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getComments', () => {
    it('should fetch comments with pagination', async () => {
      const mockComments = [
        { id: '1', user_id: 'user1', anime_id: 1, content: 'Great anime!', is_deleted: false, created_at: '2024-01-01' },
      ];
      const mockProfiles = [{ id: 'user1', username: 'TestUser', avatar_url: 'avatar.jpg' }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockRange = vi.fn().mockResolvedValue({ data: mockComments, error: null });
      const mockIn = vi.fn().mockResolvedValue({ data: mockProfiles, error: null });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'comments') {
          return {
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
            range: mockRange,
          } as any;
        } else if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              in: mockIn,
            }),
          } as any;
        }
        return {} as any;
      });

      const result = await commentsService.getComments(1, 1);

      expect(result).toHaveLength(1);
      expect(result[0].profiles?.username).toBe('TestUser');
      expect(mockRange).toHaveBeenCalledWith(0, 19);
    });
  });

  describe('addComment', () => {
    it('should validate comment length', async () => {
      await expect(
        commentsService.addComment(1, 'short', 'user1')
      ).rejects.toThrow('Комментарий должен содержать от 10 до 1000 символов');
    });

    it('should add valid comment', async () => {
      const mockComment = { id: '1', content: 'Valid comment text here', user_id: 'user1' };
      const mockProfile = { username: 'TestUser', avatar_url: null };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockComment, error: null });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'comments') {
          return {
            insert: mockInsert,
            select: mockSelect,
            single: mockSingle,
          } as any;
        } else if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          } as any;
        }
        return {} as any;
      });

      const result = await commentsService.addComment(1, 'Valid comment text here', 'user1');

      expect(result.content).toBe('Valid comment text here');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete for moderators', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any);

      await commentsService.deleteComment('comment1', 'mod1', true);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ is_deleted: true, deleted_by: 'mod1' })
      );
    });

    it('should hard delete for authors', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      await commentsService.deleteComment('comment1', 'user1', false);

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
