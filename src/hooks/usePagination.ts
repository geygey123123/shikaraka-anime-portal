import { useState, useCallback } from 'react';

/**
 * Hook для управления пагинацией
 * @param initialPage - Начальная страница (по умолчанию 1)
 * @returns Объект с текущей страницей и функциями навигации
 */
export const usePagination = (initialPage: number = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  /**
   * Перейти на следующую страницу
   */
  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  /**
   * Перейти на предыдущую страницу
   */
  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  /**
   * Перейти на конкретную страницу
   * @param page - Номер страницы
   */
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  /**
   * Сбросить на первую страницу
   */
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    nextPage,
    previousPage,
    goToPage,
    resetPage,
    setCurrentPage,
  };
};
