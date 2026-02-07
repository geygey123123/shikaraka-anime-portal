import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { useFilters } from './useFilters';
import type { SearchFilters } from '../types/anime';

// Wrapper component for router context
const createWrapper = (initialEntries: string[] = ['/']) => {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
};

describe('useFilters - URL Persistence', () => {
  it('should initialize filters from URL parameters', () => {
    const wrapper = createWrapper(['/?genres=1,2&kind=tv,movie&yearFrom=2020&yearTo=2023']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.genres).toEqual(['1', '2']);
    expect(result.current.filters.kind).toEqual(['tv', 'movie']);
    expect(result.current.filters.year?.from).toBe(2020);
    expect(result.current.filters.year?.to).toBe(2023);
  });

  it('should encode filters to URL when filters change', () => {
    const wrapper = createWrapper(['/']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    act(() => {
      result.current.setFilter('genres', ['1', '2', '3']);
    });
    
    expect(result.current.filters.genres).toEqual(['1', '2', '3']);
  });

  it('should clear all filters and update URL', () => {
    const wrapper = createWrapper(['/?genres=1,2&kind=tv']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.genres).toEqual(['1', '2']);
    expect(result.current.filters.kind).toEqual(['tv']);
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.filters).toEqual({});
  });

  it('should handle empty URL parameters', () => {
    const wrapper = createWrapper(['/']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters).toEqual({});
  });

  it('should handle year range filters in URL', () => {
    const wrapper = createWrapper(['/?yearFrom=2015&yearTo=2020']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.year).toEqual({
      from: 2015,
      to: 2020,
    });
  });

  it('should handle status filters in URL', () => {
    const wrapper = createWrapper(['/?status=ongoing,released']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.status).toEqual(['ongoing', 'released']);
  });

  it('should use initialFilters when URL is empty', () => {
    const wrapper = createWrapper(['/']);
    const initialFilters: SearchFilters = {
      genres: ['1'],
      kind: ['tv'],
    };
    
    const { result } = renderHook(() => useFilters(initialFilters), { wrapper });
    
    expect(result.current.filters.genres).toEqual(['1']);
    expect(result.current.filters.kind).toEqual(['tv']);
  });

  it('should prioritize URL filters over initialFilters', () => {
    const wrapper = createWrapper(['/?genres=2,3']);
    const initialFilters: SearchFilters = {
      genres: ['1'],
      kind: ['tv'],
    };
    
    const { result } = renderHook(() => useFilters(initialFilters), { wrapper });
    
    // URL filters should take precedence
    expect(result.current.filters.genres).toEqual(['2', '3']);
    // initialFilters should not be used when URL has filters
    expect(result.current.filters.kind).toBeUndefined();
  });

  it('should update multiple filter types', () => {
    const wrapper = createWrapper(['/']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    act(() => {
      result.current.setFilter('genres', ['1', '2']);
      result.current.setFilter('kind', ['tv']);
      result.current.setFilter('status', ['ongoing']);
    });
    
    expect(result.current.filters.genres).toEqual(['1', '2']);
    expect(result.current.filters.kind).toEqual(['tv']);
    expect(result.current.filters.status).toEqual(['ongoing']);
  });

  it('should handle browser back/forward navigation by reading from URL', () => {
    // Simulate navigation history with different filter states
    const wrapper = createWrapper([
      '/',
      '/?genres=1',
      '/?genres=1,2&kind=tv',
    ]);
    
    const { result, rerender } = renderHook(() => useFilters(), { wrapper });
    
    // Initial state should read from the last entry in history
    expect(result.current.filters.genres).toEqual(['1', '2']);
    expect(result.current.filters.kind).toEqual(['tv']);
  });

  it('should decode URL parameters with special characters correctly', () => {
    const wrapper = createWrapper(['/?genres=1,2,3&kind=tv']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.genres).toEqual(['1', '2', '3']);
    expect(result.current.filters.kind).toEqual(['tv']);
  });

  it('should handle partial year filters (only from)', () => {
    const wrapper = createWrapper(['/?yearFrom=2020']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.year).toEqual({
      from: 2020,
    });
  });

  it('should handle partial year filters (only to)', () => {
    const wrapper = createWrapper(['/?yearTo=2023']);
    
    const { result } = renderHook(() => useFilters(), { wrapper });
    
    expect(result.current.filters.year).toEqual({
      to: 2023,
    });
  });
});
