import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters } from '../types/anime';

interface UseFiltersResult {
  filters: SearchFilters;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

/**
 * Encode filters to URL query parameters
 */
function encodeFiltersToURL(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.genres && filters.genres.length > 0) {
    params.set('genres', filters.genres.join(','));
  }

  if (filters.year) {
    if (filters.year.from !== undefined) {
      params.set('yearFrom', filters.year.from.toString());
    }
    if (filters.year.to !== undefined) {
      params.set('yearTo', filters.year.to.toString());
    }
  }

  if (filters.kind && filters.kind.length > 0) {
    params.set('kind', filters.kind.join(','));
  }

  if (filters.status && filters.status.length > 0) {
    params.set('status', filters.status.join(','));
  }

  return params;
}

/**
 * Decode URL query parameters to filters
 */
function decodeFiltersFromURL(params: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {};

  const genres = params.get('genres');
  if (genres) {
    filters.genres = genres.split(',').filter(Boolean);
  }

  const yearFrom = params.get('yearFrom');
  const yearTo = params.get('yearTo');
  if (yearFrom || yearTo) {
    filters.year = {};
    if (yearFrom) {
      filters.year.from = parseInt(yearFrom, 10);
    }
    if (yearTo) {
      filters.year.to = parseInt(yearTo, 10);
    }
  }

  const kind = params.get('kind');
  if (kind) {
    filters.kind = kind.split(',').filter(Boolean) as SearchFilters['kind'];
  }

  const status = params.get('status');
  if (status) {
    filters.status = status.split(',').filter(Boolean) as SearchFilters['status'];
  }

  return filters;
}

/**
 * Hook для управления фильтрами поиска аниме с URL persistence
 * @param initialFilters - начальные значения фильтров
 * @returns объект с текущими фильтрами и функциями управления
 */
export function useFilters(initialFilters: SearchFilters = {}): UseFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL on mount, fallback to initialFilters
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const urlFilters = decodeFiltersFromURL(searchParams);
    // Merge URL filters with initial filters, URL takes precedence
    return Object.keys(urlFilters).length > 0 ? urlFilters : initialFilters;
  });

  // Sync filters to URL whenever they change
  useEffect(() => {
    const params = encodeFiltersToURL(filters);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const setFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const applyFilters = useCallback(() => {
    // Эта функция может быть использована для триггера применения фильтров
    // В текущей реализации фильтры применяются автоматически через useSearch
    // Но функция оставлена для возможности будущего расширения
  }, []);

  return {
    filters,
    setFilter,
    clearFilters,
    applyFilters,
  };
}
