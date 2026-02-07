import { useState, useEffect } from 'react';
import type { SearchFilters } from '../../types/anime';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
  mode?: 'inline' | 'drawer';
}

// Доступные жанры аниме (основные)
const GENRES = [
  { id: '1', name: 'Экшен', value: '1' },
  { id: '2', name: 'Приключения', value: '2' },
  { id: '4', name: 'Комедия', value: '4' },
  { id: '8', name: 'Драма', value: '8' },
  { id: '10', name: 'Фэнтези', value: '10' },
  { id: '14', name: 'Ужасы', value: '14' },
  { id: '22', name: 'Романтика', value: '22' },
  { id: '24', name: 'Фантастика', value: '24' },
  { id: '36', name: 'Повседневность', value: '36' },
  { id: '37', name: 'Сверхъестественное', value: '37' },
];

// Типы аниме
const KINDS = [
  { value: 'tv', label: 'TV Сериал' },
  { value: 'movie', label: 'Фильм' },
  { value: 'ova', label: 'OVA' },
  { value: 'ona', label: 'ONA' },
  { value: 'special', label: 'Спешл' },
];

// Статусы аниме
const STATUSES = [
  { value: 'ongoing', label: 'Онгоинг' },
  { value: 'released', label: 'Завершено' },
  { value: 'anons', label: 'Анонсировано' },
];

/**
 * Компонент панели фильтров для поиска аниме
 */
export function FilterPanel({ filters, onChange, onClear, mode = 'inline' }: FilterPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Синхронизируем локальные фильтры с внешними
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Обработчик изменения жанров
  const handleGenreChange = (genreId: string, checked: boolean) => {
    const currentGenres = localFilters.genres || [];
    const newGenres = checked
      ? [...currentGenres, genreId]
      : currentGenres.filter((id) => id !== genreId);

    const newFilters = {
      ...localFilters,
      genres: newGenres.length > 0 ? newGenres : undefined,
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  // Обработчик изменения года (от)
  const handleYearFromChange = (value: string) => {
    const year = value ? parseInt(value, 10) : undefined;
    const newFilters = {
      ...localFilters,
      year: {
        ...localFilters.year,
        from: year,
      },
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  // Обработчик изменения года (до)
  const handleYearToChange = (value: string) => {
    const year = value ? parseInt(value, 10) : undefined;
    const newFilters = {
      ...localFilters,
      year: {
        ...localFilters.year,
        to: year,
      },
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  // Обработчик изменения типа
  const handleKindChange = (kind: string, checked: boolean) => {
    const currentKinds = localFilters.kind || [];
    const newKinds = checked
      ? [...currentKinds, kind]
      : currentKinds.filter((k) => k !== kind);

    const newFilters = {
      ...localFilters,
      kind: newKinds.length > 0 ? newKinds : undefined,
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  // Обработчик изменения статуса
  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = localFilters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter((s) => s !== status);

    const newFilters = {
      ...localFilters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  // Обработчик очистки фильтров
  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  // Контент панели фильтров
  const filterContent = (
    <div className="space-y-6">
      {/* Жанры */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Жанры
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {GENRES.map((genre) => (
            <label
              key={genre.id}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={localFilters.genres?.includes(genre.value) || false}
                onChange={(e) => handleGenreChange(genre.value, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {genre.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Год выпуска */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Год выпуска
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              От
            </label>
            <input
              type="number"
              min="1960"
              max={new Date().getFullYear() + 1}
              value={localFilters.year?.from || ''}
              onChange={(e) => handleYearFromChange(e.target.value)}
              placeholder="1990"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              До
            </label>
            <input
              type="number"
              min="1960"
              max={new Date().getFullYear() + 1}
              value={localFilters.year?.to || ''}
              onChange={(e) => handleYearToChange(e.target.value)}
              placeholder={new Date().getFullYear().toString()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Тип аниме */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Тип
        </h3>
        <div className="space-y-2">
          {KINDS.map((kind) => (
            <label
              key={kind.value}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={localFilters.kind?.includes(kind.value) || false}
                onChange={(e) => handleKindChange(kind.value, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {kind.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Статус */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Статус
        </h3>
        <div className="space-y-2">
          {STATUSES.map((status) => (
            <label
              key={status.value}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={localFilters.status?.includes(status.value) || false}
                onChange={(e) => handleStatusChange(status.value, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Кнопка очистки */}
      <button
        onClick={handleClear}
        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
      >
        Очистить фильтры
      </button>
    </div>
  );

  // Режим drawer (для мобильных устройств)
  if (mode === 'drawer') {
    return (
      <>
        {/* Кнопка открытия drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-4 right-4 z-40 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Фильтры</span>
        </button>

        {/* Overlay */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Фильтры
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      </>
    );
  }

  // Режим inline (для десктопа)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        Фильтры
      </h2>
      {filterContent}
    </div>
  );
}
