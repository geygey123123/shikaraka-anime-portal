import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { shikimoriService } from '../services/shikimori';
import type { GroupedAnime, SearchFilters, RelatedAnime } from '../types/anime';

interface UseSearchOptions {
  debounceMs?: number;
  pageSize?: number;
}

interface SearchResult {
  results: GroupedAnime[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  expandGroup: (animeId: number) => Promise<void>;
  toggleGroup: (animeId: number) => void;
  refetch: () => void;
}

/**
 * Hook для поиска аниме с группировкой и фильтрами
 * @param query - поисковый запрос
 * @param filters - фильтры для поиска
 * @param options - опции (debounceMs, pageSize)
 * @returns результат поиска с группированными аниме
 */
export function useSearch(
  query: string,
  filters: SearchFilters = {},
  options: UseSearchOptions = {}
): SearchResult {
  const { pageSize = 20 } = options;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // Основной запрос поиска с кэшированием
  const {
    data: searchData,
    isLoading,
    error,
    refetch,
  } = useQuery<GroupedAnime[], Error>({
    queryKey: ['search', query, filters, page],
    queryFn: async () => {
      if (!query && Object.keys(filters).length === 0) {
        return [];
      }

      const animes = await shikimoriService.searchWithFilters(
        query,
        filters,
        pageSize * page
      );

      // Группируем результаты
      const grouped = await shikimoriService.groupAnimeWithRelated(animes);
      return grouped;
    },
    enabled: query.length > 0 || Object.keys(filters).length > 0,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Функция для загрузки связанных аниме
  const expandGroup = useCallback(
    async (animeId: number) => {
      if (expandedGroups.has(animeId)) {
        return;
      }

      try {
        // Загружаем связанные аниме
        const related = await shikimoriService.getRelatedAnime(animeId);
        
        // Сортируем хронологически
        const sortedRelated = shikimoriService.sortRelatedChronologically(related);

        // Обновляем кэш с загруженными связанными аниме
        queryClient.setQueryData<GroupedAnime[]>(
          ['search', query, filters, page],
          (oldData) => {
            if (!oldData) return oldData;

            return oldData.map((group) => {
              if (group?.main?.id === animeId) {
                return {
                  ...group,
                  related: sortedRelated,
                  isExpanded: true,
                };
              }
              return group;
            });
          }
        );

        // Кэшируем связанные аниме отдельно
        queryClient.setQueryData<RelatedAnime[]>(
          ['relatedAnime', animeId],
          sortedRelated
        );

        setExpandedGroups((prev) => new Set(prev).add(animeId));
      } catch (error) {
        console.error('[expandGroup] Failed to load related anime:', error);
        
        // Все равно помечаем как раскрытое, чтобы показать пустое состояние
        queryClient.setQueryData<GroupedAnime[]>(
          ['search', query, filters, page],
          (oldData) => {
            if (!oldData) return oldData;

            return oldData.map((group) => {
              if (group?.main?.id === animeId) {
                return {
                  ...group,
                  related: [],
                  isExpanded: true,
                };
              }
              return group;
            });
          }
        );
        
        setExpandedGroups((prev) => new Set(prev).add(animeId));
      }
    },
    [expandedGroups, queryClient, query, filters, page]
  );

  // Функция для переключения раскрытия группы
  const toggleGroup = useCallback(
    async (animeId: number) => {
      // Сначала получаем текущее состояние
      const currentData = queryClient.getQueryData<GroupedAnime[]>(['search', query, filters, page]);
      if (!currentData) {
        return;
      }

      const group = currentData.find((g) => g?.main?.id === animeId);
      if (!group || !group.main) {
        return;
      }

      const newIsExpanded = !group.isExpanded;

      // Если закрываем - убираем из expandedGroups
      if (!newIsExpanded) {
        setExpandedGroups((prev) => {
          const next = new Set(prev);
          next.delete(animeId);
          return next;
        });
      }

      // Если раскрываем и еще не загружали связанные аниме
      if (newIsExpanded && group.related.length === 0) {
        // Сначала загружаем связанные аниме
        await expandGroup(animeId);
      } else {
        // Просто переключаем состояние
        queryClient.setQueryData<GroupedAnime[]>(
          ['search', query, filters, page],
          (oldData) => {
            if (!oldData) return oldData;

            return oldData.map((g) => {
              if (g?.main?.id === animeId) {
                return {
                  ...g,
                  isExpanded: newIsExpanded,
                };
              }
              return g;
            });
          }
        );
      }
    },
    [queryClient, query, filters, page, expandGroup]
  );

  // Функция для загрузки следующей страницы
  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  // Определяем, есть ли еще результаты
  const hasMore = (searchData?.length || 0) >= pageSize * page;

  return {
    results: searchData || [],
    isLoading,
    error,
    hasMore,
    loadMore,
    expandGroup,
    toggleGroup,
    refetch,
  };
}
