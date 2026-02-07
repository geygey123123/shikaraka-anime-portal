/**
 * Утилита для парсинга BBCode из Shikimori API
 */

/**
 * Конвертирует BBCode в обычный текст
 * @param text - текст с BBCode тегами
 * @returns текст без BBCode тегов
 */
export function parseBBCode(text: string): string {
  if (!text) return '';

  let result = text;

  // Удаляем [character=id]текст[/character]
  result = result.replace(/\[character=\d+\](.*?)\[\/character\]/g, '$1');

  // Удаляем [person=id]текст[/person]
  result = result.replace(/\[person=\d+\](.*?)\[\/person\]/g, '$1');

  // Удаляем [[текст]]
  result = result.replace(/\[\[(.*?)\]\]/g, '$1');

  // Удаляем [текст]
  result = result.replace(/\[(.*?)\]/g, '$1');

  // Удаляем оставшиеся теги
  result = result.replace(/\[\/?\w+(?:=\d+)?\]/g, '');

  return result.trim();
}

/**
 * Конвертирует рейтинг из кода в читаемый формат
 * @param rating - код рейтинга (например, 'pg_13')
 * @returns читаемый рейтинг (например, 'PG-13')
 */
export function formatRating(rating: string): string {
  if (!rating) return 'Не указан';

  const ratingMap: Record<string, string> = {
    'none': 'Нет рейтинга',
    'g': 'G - Для всех',
    'pg': 'PG - Рекомендуется присутствие родителей',
    'pg_13': 'PG-13 - Детям до 13 лет просмотр не желателен',
    'r': 'R - Лицам до 17 лет обязательно присутствие взрослого',
    'r_plus': 'R+ - Лицам до 17 лет просмотр запрещён',
    'rx': 'Rx - Хентай',
  };

  return ratingMap[rating] || rating.toUpperCase().replace('_', '-');
}
