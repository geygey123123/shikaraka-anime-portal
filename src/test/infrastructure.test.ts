/**
 * Infrastructure Verification Tests
 * Проверяет базовую структуру и экспорты инфраструктурных компонентов
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { shikimoriService } from '../services/shikimori';

// Устанавливаем mock переменные окружения для тестов
beforeAll(() => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    // @ts-expect-error - Mocking env var for tests
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    // @ts-expect-error - Mocking env var for tests
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';
  }
});

describe('Infrastructure - Supabase', () => {
  it('should export supabase client with proper structure', async () => {
    // Динамический импорт после установки env переменных
    const { supabase } = await import('../services/supabase');
    
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should have auth methods', async () => {
    const { supabase } = await import('../services/supabase');
    
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
    expect(typeof supabase.auth.getSession).toBe('function');
  });

  it('should have database query methods', async () => {
    const { supabase } = await import('../services/supabase');
    
    expect(typeof supabase.from).toBe('function');
  });
});

describe('Infrastructure - Shikimori Service', () => {
  it('should export shikimoriService', () => {
    expect(shikimoriService).toBeDefined();
  });

  it('should have getPopularAnime method', () => {
    expect(typeof shikimoriService.getPopularAnime).toBe('function');
  });

  it('should have searchAnime method', () => {
    expect(typeof shikimoriService.searchAnime).toBe('function');
  });

  it('should have getAnimeById method', () => {
    expect(typeof shikimoriService.getAnimeById).toBe('function');
  });
});

describe('Infrastructure - React Query Hooks', () => {
  it('should export anime hooks', async () => {
    const { usePopularAnime, useSearchAnime, useAnimeDetails } = await import('../hooks/useAnime');
    
    expect(usePopularAnime).toBeDefined();
    expect(typeof usePopularAnime).toBe('function');
    
    expect(useSearchAnime).toBeDefined();
    expect(typeof useSearchAnime).toBe('function');
    
    expect(useAnimeDetails).toBeDefined();
    expect(typeof useAnimeDetails).toBe('function');
  });

  it('should export auth hook', async () => {
    const { useAuth } = await import('../hooks/useAuth');
    
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });

  it('should export favorites hooks', async () => {
    const { useFavorites, useAddFavorite, useRemoveFavorite, useIsFavorite } = await import('../hooks/useFavorites');
    
    expect(useFavorites).toBeDefined();
    expect(typeof useFavorites).toBe('function');
    
    expect(useAddFavorite).toBeDefined();
    expect(typeof useAddFavorite).toBe('function');
    
    expect(useRemoveFavorite).toBeDefined();
    expect(typeof useRemoveFavorite).toBe('function');
    
    expect(useIsFavorite).toBeDefined();
    expect(typeof useIsFavorite).toBe('function');
  });
});

describe('Infrastructure - TypeScript Types', () => {
  it('should export anime types', async () => {
    const types = await import('../types/anime');
    
    // Проверяем, что модуль загружается без ошибок
    expect(types).toBeDefined();
  });
});
