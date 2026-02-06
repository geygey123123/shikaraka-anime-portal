import { useQuery } from '@tanstack/react-query';
import { shikimoriService } from '../services/shikimori';
import type { Anime } from '../types/anime';

/**
 * Hook для получения популярных аниме
 * @param page - номер страницы (по умолчанию 1)
 * @returns React Query результат с массивом популярных аниме
 */
export const usePopularAnime = (page: number = 1) => {
  return useQuery<Anime[], Error>({
    queryKey: ['anime', 'popular', page],
    queryFn: () => shikimoriService.getPopularAnime(page),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
  });
};

/**
 * Hook для поиска аниме по запросу
 * @param query - поисковый запрос
 * @returns React Query результат с массивом найденных аниме
 */
export const useSearchAnime = (query: string) => {
  return useQuery<Anime[], Error>({
    queryKey: ['anime', 'search', query],
    queryFn: () => shikimoriService.searchAnime(query),
    enabled: query.length > 0, // Условная активация: запрос выполняется только если query не пустой
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

/**
 * Hook для получения детальной информации об аниме
 * @param id - ID аниме в Shikimori
 * @returns React Query результат с детальной информацией об аниме
 */
export const useAnimeDetails = (id: number) => {
  return useQuery<Anime, Error>({
    queryKey: ['anime', 'details', id],
    queryFn: () => shikimoriService.getAnimeById(id),
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    enabled: id > 0, // Условная активация: запрос выполняется только если id валидный
  });
};
