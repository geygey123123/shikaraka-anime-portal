import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageService } from './storage.service';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock rate limit service
vi.mock('./rateLimit.service', () => ({
  checkRateLimit: vi.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadAvatar', () => {
    it('should reject files larger than 2MB', async () => {
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      await expect(
        storageService.uploadAvatar('user1', largeFile)
      ).rejects.toThrow('Файл слишком большой');
    });

    it('should reject unsupported file types', async () => {
      const invalidFile = new File(['data'], 'file.gif', {
        type: 'image/gif',
      });

      await expect(
        storageService.uploadAvatar('user1', invalidFile)
      ).rejects.toThrow('Неподдерживаемый формат');
    });

    it('should upload valid file and update profile', async () => {
      const validFile = new File(['data'], 'avatar.jpg', {
        type: 'image/jpeg',
      });

      const mockList = vi.fn().mockResolvedValue({ data: [] });
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/avatar.jpg' },
      });
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.storage.from).mockReturnValue({
        list: mockList,
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any);

      const result = await storageService.uploadAvatar('user1', validFile);

      expect(result).toContain('https://example.com/avatar.jpg');
      expect(mockUpload).toHaveBeenCalledWith(
        'user1.jpg',
        validFile,
        expect.objectContaining({ upsert: true })
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ avatar_url: expect.stringContaining('avatar.jpg') })
      );
    });

    it('should handle different file extensions', async () => {
      const pngFile = new File(['data'], 'avatar.png', {
        type: 'image/png',
      });

      const mockList = vi.fn().mockResolvedValue({ data: [] });
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/avatar.png' },
      });
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.storage.from).mockReturnValue({
        list: mockList,
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any);

      await storageService.uploadAvatar('user1', pngFile);

      expect(mockUpload).toHaveBeenCalledWith(
        'user1.png',
        pngFile,
        expect.any(Object)
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and update profile', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { avatar_url: 'https://example.com/user1.jpg' },
        error: null,
      });
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnThis();

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
      } as any);

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      await storageService.deleteAvatar('user1');

      expect(mockRemove).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: null });
    });

    it('should handle missing avatar gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { avatar_url: null },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any);

      await expect(storageService.deleteAvatar('user1')).resolves.not.toThrow();
    });
  });
});
