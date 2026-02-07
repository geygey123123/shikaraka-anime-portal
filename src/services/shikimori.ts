import type { Anime, RelatedAnime, SearchFilters, GroupedAnime } from '../types/anime';
import { logError, APIError, retryWithBackoff } from '../utils/errorHandling';

const SHIKIMORI_BASE_URL = 'https://shikimori.one/api';

class ShikimoriService {
  /**
   * Получить популярные аниме
   * @param page - номер страницы (по умолчанию 1)
   * @param limit - количество результатов (по умолчанию 24)
   * @returns Promise с массивом аниме
   */
  async getPopularAnime(page: number = 1, limit: number = 24): Promise<Anime[]> {
    return retryWithBackoff(async () => {
      try {
        const response = await fetch(
          `${SHIKIMORI_BASE_URL}/animes?page=${page}&limit=${limit}&order=popularity`
        );

        if (!response.ok) {
          throw new APIError(
            `Shikimori API error: ${response.status} ${response.statusText}`,
            response.status,
            '/animes'
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        logError('getPopularAnime', error);
        
        if (error instanceof APIError) {
          throw error;
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        }
        
        throw error;
      }
    });
  }

  /**
   * Поиск аниме по запросу
   * @param query - поисковый запрос
   * @param limit - количество результатов (по умолчанию 24)
   * @returns Promise с массивом найденных аниме
   */
  async searchAnime(query: string, limit: number = 24): Promise<Anime[]> {
    return retryWithBackoff(async () => {
      try {
        const response = await fetch(
          `${SHIKIMORI_BASE_URL}/animes?search=${encodeURIComponent(query)}&limit=${limit}`
        );

        if (!response.ok) {
          throw new APIError(
            `Shikimori API error: ${response.status} ${response.statusText}`,
            response.status,
            '/animes'
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        logError('searchAnime', error);
        
        if (error instanceof APIError) {
          throw error;
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        }
        
        throw error;
      }
    });
  }

  /**
   * Получить детальную информацию об аниме по ID
   * @param id - ID аниме в Shikimori
   * @returns Promise с детальной информацией об аниме
   */
  async getAnimeById(id: number): Promise<Anime> {
    return retryWithBackoff(async () => {
      try {
        const response = await fetch(`${SHIKIMORI_BASE_URL}/animes/${id}`);

        if (!response.ok) {
          throw new APIError(
            response.status === 404 ? 'Аниме не найдено' : `Shikimori API error: ${response.status} ${response.statusText}`,
            response.status,
            `/animes/${id}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        logError('getAnimeById', error);
        
        if (error instanceof APIError) {
          throw error;
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        }
        
        throw error;
      }
    });
  }

  /**
   * Получить связанные аниме (сезоны, сиквелы, приквелы)
   * @param animeId - ID аниме в Shikimori
   * @returns Promise с массивом связанных аниме
   */
  async getRelatedAnime(animeId: number): Promise<RelatedAnime[]> {
    return retryWithBackoff(async () => {
      try {
        const response = await fetch(`${SHIKIMORI_BASE_URL}/animes/${animeId}/related`);

        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new APIError(
            `Shikimori API error: ${response.status} ${response.statusText}`,
            response.status,
            `/animes/${animeId}/related`
          );
        }

        const data = await response.json();
        
        // Проверяем что data это массив
        if (!Array.isArray(data)) {
          return [];
        }
        
        // Фильтруем только аниме (не манга и т.д.)
        const animeOnly = data.filter((item: any) => {
          return item.anime && typeof item.anime === 'object';
        });
        
        return animeOnly;
      } catch (error) {
        logError('getRelatedAnime', error);
        
        if (error instanceof APIError) {
          throw error;
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        }
        
        throw error;
      }
    });
  }

  /**
   * Поиск аниме с фильтрами
   * @param query - поисковый запрос
   * @param filters - фильтры для поиска
   * @param limit - количество результатов (по умолчанию 20)
   * @returns Promise с массивом найденных аниме
   */
  async searchWithFilters(query: string, filters: SearchFilters = {}, limit: number = 20): Promise<Anime[]> {
    return retryWithBackoff(async () => {
      try {
        const params = new URLSearchParams();
        
        if (query) {
          params.append('search', query);
        }
        
        params.append('limit', limit.toString());
        
        // Добавляем фильтры
        if (filters.genres && filters.genres.length > 0) {
          params.append('genre', filters.genres.join(','));
        }
        
        if (filters.kind && filters.kind.length > 0) {
          params.append('kind', filters.kind.join(','));
        }
        
        if (filters.status && filters.status.length > 0) {
          params.append('status', filters.status.join(','));
        }
        
        if (filters.year) {
          if (filters.year.from) {
            params.append('season', `${filters.year.from}`);
          }
        }

        const response = await fetch(`${SHIKIMORI_BASE_URL}/animes?${params.toString()}`);

        if (!response.ok) {
          throw new APIError(
            `Shikimori API error: ${response.status} ${response.statusText}`,
            response.status,
            '/animes'
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        logError('searchWithFilters', error);
        
        if (error instanceof APIError) {
          throw error;
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        }
        
        throw error;
      }
    });
  }

  /**
   * Определить корневое аниме в группе связанных аниме
   * @param animeList - список аниме для анализа
   * @returns корневое аниме
   */
  determineRootAnime(animeList: Anime[]): Anime {
    if (animeList.length === 0) {
      throw new Error('Cannot determine root anime from empty list');
    }

    if (animeList.length === 1) {
      return animeList[0];
    }

    // Выбираем аниме с наивысшим score
    return animeList.reduce((root, current) => {
      const rootScore = parseFloat(root.score) || 0;
      const currentScore = parseFloat(current.score) || 0;

      if (currentScore > rootScore) {
        return current;
      }
      
      if (currentScore === rootScore) {
        // Если score равны, выбираем более раннее по дате выхода
        const rootDate = new Date(root.aired_on || '9999-12-31');
        const currentDate = new Date(current.aired_on || '9999-12-31');
        
        if (currentDate < rootDate) {
          return current;
        }
      }
      
      return root;
    });
  }

  /**
   * Группировать аниме со связанными (сезоны, сиквелы, приквелы)
   * @param animeList - список аниме для группировки
   * @returns Promise с массивом сгруппированных аниме
   */
  async groupAnimeWithRelated(animeList: Anime[]): Promise<GroupedAnime[]> {
    const grouped: GroupedAnime[] = [];
    const processedIds = new Set<number>();

    for (const anime of animeList) {
      if (processedIds.has(anime.id)) {
        continue;
      }

      // Создаем группу для текущего аниме
      const group: GroupedAnime = {
        main: anime,
        related: [],
        isExpanded: false,
        isRoot: true, // По умолчанию считаем корневым
      };

      processedIds.add(anime.id);
      grouped.push(group);
    }

    return grouped;
  }

  /**
   * Сортировать связанные аниме в хронологическом порядке
   * @param related - массив связанных аниме
   * @returns отсортированный массив
   */
  sortRelatedChronologically(related: RelatedAnime[]): RelatedAnime[] {
    return [...related].sort((a, b) => {
      const dateA = new Date(a.anime.aired_on || '9999-12-31');
      const dateB = new Date(b.anime.aired_on || '9999-12-31');
      return dateA.getTime() - dateB.getTime();
    });
  }
}

export const shikimoriService = new ShikimoriService();
