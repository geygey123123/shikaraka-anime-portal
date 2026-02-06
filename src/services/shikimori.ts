import type { Anime } from '../types/anime';
import { logError } from '../utils/errorHandling';

const SHIKIMORI_BASE_URL = 'https://shikimori.one/api';

class ShikimoriService {
  /**
   * Получить популярные аниме
   * @param page - номер страницы (по умолчанию 1)
   * @param limit - количество результатов (по умолчанию 24)
   * @returns Promise с массивом аниме
   */
  async getPopularAnime(page: number = 1, limit: number = 24): Promise<Anime[]> {
    try {
      const response = await fetch(
        `${SHIKIMORI_BASE_URL}/animes?page=${page}&limit=${limit}&order=popularity`
      );

      if (!response.ok) {
        const errorMessage = `Shikimori API error: ${response.status} ${response.statusText}`;
        logError('getPopularAnime', new Error(errorMessage));
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logError('getPopularAnime', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
      }
      
      throw error;
    }
  }

  /**
   * Поиск аниме по запросу
   * @param query - поисковый запрос
   * @param limit - количество результатов (по умолчанию 24)
   * @returns Promise с массивом найденных аниме
   */
  async searchAnime(query: string, limit: number = 24): Promise<Anime[]> {
    try {
      const response = await fetch(
        `${SHIKIMORI_BASE_URL}/animes?search=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        const errorMessage = `Shikimori API error: ${response.status} ${response.statusText}`;
        logError('searchAnime', new Error(errorMessage));
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logError('searchAnime', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
      }
      
      throw error;
    }
  }

  /**
   * Получить детальную информацию об аниме по ID
   * @param id - ID аниме в Shikimori
   * @returns Promise с детальной информацией об аниме
   */
  async getAnimeById(id: number): Promise<Anime> {
    try {
      const response = await fetch(`${SHIKIMORI_BASE_URL}/animes/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          const errorMessage = 'Аниме не найдено';
          logError('getAnimeById', new Error(errorMessage));
          throw new Error(errorMessage);
        }
        const errorMessage = `Shikimori API error: ${response.status} ${response.statusText}`;
        logError('getAnimeById', new Error(errorMessage));
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logError('getAnimeById', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
      }
      
      throw error;
    }
  }
}

export const shikimoriService = new ShikimoriService();
