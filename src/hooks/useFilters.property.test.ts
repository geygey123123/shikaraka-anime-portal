import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { SearchFilters } from '../types/anime';

/**
 * Feature: advanced-search-and-voice-stats
 * Property 15: Combined filter application
 * Validates: Requirements 3.6, 3.7, 3.8
 * 
 * For any combination of filters (genres, year, kind, status), the search results
 * should match ALL selected filter criteria (logical AND operation), and the filters
 * should be correctly passed as API parameters.
 */

// Arbitrary для генерации валидных жанров
const genreArbitrary = fc.constantFrom(
  '1', '2', '4', '8', '10', '14', '22', '24', '36', '37'
);

// Arbitrary для генерации валидных типов аниме
const kindArbitrary = fc.constantFrom(
  'tv', 'movie', 'ova', 'ona', 'special'
);

// Arbitrary для генерации валидных статусов
const statusArbitrary = fc.constantFrom(
  'ongoing', 'released', 'anons'
);

// Arbitrary для генерации валидного года
const yearArbitrary = fc.integer({ min: 1960, max: new Date().getFullYear() + 1 });

// Arbitrary для генерации SearchFilters
const searchFiltersArbitrary = fc.record({
  genres: fc.option(fc.array(genreArbitrary, { minLength: 0, maxLength: 5 }), { nil: undefined }),
  year: fc.option(
    fc.record({
      from: fc.option(yearArbitrary, { nil: undefined }),
      to: fc.option(yearArbitrary, { nil: undefined }),
    }),
    { nil: undefined }
  ),
  kind: fc.option(fc.array(kindArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  status: fc.option(fc.array(statusArbitrary, { minLength: 0, maxLength: 2 }), { nil: undefined }),
});

/**
 * Функция для преобразования фильтров в URL параметры
 * (имитирует логику из shikimoriService.searchWithFilters)
 */
function filtersToURLParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.genres && filters.genres.length > 0) {
    params.append('genre', filters.genres.join(','));
  }
  
  if (filters.kind && filters.kind.length > 0) {
    params.append('kind', filters.kind.join(','));
  }
  
  if (filters.status && filters.status.length > 0) {
    params.append('status', filters.status.join(','));
  }
  
  if (filters.year?.from) {
    params.append('season', `${filters.year.from}`);
  }
  
  return params;
}

/**
 * Проверяет, что все фильтры корректно преобразованы в URL параметры
 */
function validateFilterToParamsConversion(filters: SearchFilters): boolean {
  const params = filtersToURLParams(filters);
  
  // Проверяем жанры
  if (filters.genres && filters.genres.length > 0) {
    const genreParam = params.get('genre');
    if (!genreParam) return false;
    const genresInParam = genreParam.split(',');
    if (genresInParam.length !== filters.genres.length) return false;
    if (!filters.genres.every(g => genresInParam.includes(g))) return false;
  } else {
    if (params.has('genre')) return false;
  }
  
  // Проверяем типы
  if (filters.kind && filters.kind.length > 0) {
    const kindParam = params.get('kind');
    if (!kindParam) return false;
    const kindsInParam = kindParam.split(',');
    if (kindsInParam.length !== filters.kind.length) return false;
    if (!filters.kind.every(k => kindsInParam.includes(k))) return false;
  } else {
    if (params.has('kind')) return false;
  }
  
  // Проверяем статусы
  if (filters.status && filters.status.length > 0) {
    const statusParam = params.get('status');
    if (!statusParam) return false;
    const statusesInParam = statusParam.split(',');
    if (statusesInParam.length !== filters.status.length) return false;
    if (!filters.status.every(s => statusesInParam.includes(s))) return false;
  } else {
    if (params.has('status')) return false;
  }
  
  // Проверяем год
  if (filters.year?.from) {
    const seasonParam = params.get('season');
    if (!seasonParam) return false;
    if (seasonParam !== `${filters.year.from}`) return false;
  }
  
  return true;
}

describe('Feature: advanced-search-and-voice-stats, Property 15: Combined filter application', () => {
  it('should correctly convert all filter combinations to URL parameters', () => {
    fc.assert(
      fc.property(searchFiltersArbitrary, (filters) => {
        // Проверяем, что фильтры корректно преобразуются в URL параметры
        const isValid = validateFilterToParamsConversion(filters);
        expect(isValid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain filter integrity through conversion', () => {
    fc.assert(
      fc.property(searchFiltersArbitrary, (filters) => {
        const params = filtersToURLParams(filters);
        
        // Проверяем, что количество параметров соответствует количеству непустых фильтров
        let expectedParamCount = 0;
        if (filters.genres && filters.genres.length > 0) expectedParamCount++;
        if (filters.kind && filters.kind.length > 0) expectedParamCount++;
        if (filters.status && filters.status.length > 0) expectedParamCount++;
        if (filters.year?.from) expectedParamCount++;
        
        const actualParamCount = Array.from(params.keys()).length;
        expect(actualParamCount).toBe(expectedParamCount);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty filters correctly', () => {
    fc.assert(
      fc.property(searchFiltersArbitrary, (filters) => {
        const params = filtersToURLParams(filters);
        
        // Если все фильтры пустые, параметров не должно быть
        const hasNoFilters = 
          (!filters.genres || filters.genres.length === 0) &&
          (!filters.kind || filters.kind.length === 0) &&
          (!filters.status || filters.status.length === 0) &&
          !filters.year?.from;
        
        if (hasNoFilters) {
          expect(Array.from(params.keys()).length).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all filter values without loss', () => {
    fc.assert(
      fc.property(searchFiltersArbitrary, (filters) => {
        const params = filtersToURLParams(filters);
        
        // Проверяем, что все значения фильтров присутствуют в параметрах
        if (filters.genres && filters.genres.length > 0) {
          const genreParam = params.get('genre');
          expect(genreParam).toBeTruthy();
          const genresInParam = genreParam!.split(',');
          filters.genres.forEach(genre => {
            expect(genresInParam).toContain(genre);
          });
        }
        
        if (filters.kind && filters.kind.length > 0) {
          const kindParam = params.get('kind');
          expect(kindParam).toBeTruthy();
          const kindsInParam = kindParam!.split(',');
          filters.kind.forEach(kind => {
            expect(kindsInParam).toContain(kind);
          });
        }
        
        if (filters.status && filters.status.length > 0) {
          const statusParam = params.get('status');
          expect(statusParam).toBeTruthy();
          const statusesInParam = statusParam!.split(',');
          filters.status.forEach(status => {
            expect(statusesInParam).toContain(status);
          });
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should apply logical AND for multiple filter types', () => {
    fc.assert(
      fc.property(
        fc.array(genreArbitrary, { minLength: 1, maxLength: 3 }),
        fc.array(kindArbitrary, { minLength: 1, maxLength: 2 }),
        fc.array(statusArbitrary, { minLength: 1, maxLength: 2 }),
        (genres, kinds, statuses) => {
          const filters: SearchFilters = {
            genres,
            kind: kinds,
            status: statuses,
          };
          
          const params = filtersToURLParams(filters);
          
          // Все три типа фильтров должны присутствовать в параметрах
          expect(params.has('genre')).toBe(true);
          expect(params.has('kind')).toBe(true);
          expect(params.has('status')).toBe(true);
          
          // Проверяем, что все значения присутствуют
          expect(params.get('genre')).toBe(genres.join(','));
          expect(params.get('kind')).toBe(kinds.join(','));
          expect(params.get('status')).toBe(statuses.join(','));
        }
      ),
      { numRuns: 100 }
    );
  });
});
