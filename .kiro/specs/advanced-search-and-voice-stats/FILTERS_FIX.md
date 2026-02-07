# Исправление работы фильтров в реальном времени

## Проблема

Фильтры не работали в реальном времени. При изменении фильтров (жанры, год, тип, статус) результаты поиска не обновлялись. Например:
- Поиск "Naruto"
- Выбор жанров которые не подходят под Naruto
- Naruto все равно остается в результатах

## Причины

Было ДВЕ проблемы:

### Проблема 1: Дублирование useFilters

```typescript
// Home.tsx
const { filters } = useFilters(); // Фильтры из Home

<SearchComponent
  initialFilters={filters} // ❌ Передавались как initialFilters
/>

// SearchComponent.tsx
const { filters } = useFilters(initialFilters); // ❌ Создавался НОВЫЙ экземпляр useFilters
```

### Проблема 2: Пустой handleFilterChange

```typescript
// Home.tsx
const handleFilterChange = useCallback(() => {
  // Filters are already updated via useFilters hook
  // ❌ НО НА САМОМ ДЕЛЕ НЕ ОБНОВЛЯЛИСЬ!
}, []);
```

**Что происходило:**
1. `FilterPanel` вызывал `onChange(newFilters)`
2. `Home.tsx` получал вызов `handleFilterChange()` - но функция пустая!
3. Фильтры в `useFilters` НЕ обновлялись
4. `SearchComponent` продолжал использовать старые фильтры

## Решение

### 1. Убран дублирующий useFilters из SearchComponent

```typescript
// SearchComponent.tsx - Было:
const { filters } = useFilters(initialFilters); // ❌

// Стало:
// Просто используем filters из props ✅
const { results, isLoading, error } = useSearch(
  debouncedQuery,
  filters, // ✅ Из props
  { pageSize: 20 }
);
```

### 2. Реализован handleFilterChange в Home.tsx

```typescript
// Home.tsx - Было:
const { filters, clearFilters } = useFilters(); // ❌ Нет setFilter

const handleFilterChange = useCallback(() => {
  // Пустая функция ❌
}, []);

// Стало:
const { filters, setFilter, clearFilters } = useFilters(); // ✅ Добавлен setFilter

const handleFilterChange = useCallback((newFilters: SearchFilters) => {
  // Обновляем все фильтры ✅
  Object.keys(newFilters).forEach((key) => {
    setFilter(key as keyof SearchFilters, newFilters[key as keyof SearchFilters]);
  });
}, [setFilter]);
```

### 3. Передача filters как prop

```typescript
// Home.tsx
<SearchComponent
  filters={filters} // ✅ Прямая передача
/>
```

## Как это работает теперь

### Поток данных:

1. **FilterPanel** → Пользователь выбирает жанр "Романтика"
2. **FilterPanel** → Вызывает `onChange(newFilters)` с новыми фильтрами
3. **Home.tsx** → `handleFilterChange` получает `newFilters`
4. **Home.tsx** → Вызывает `setFilter` для каждого ключа
5. **useFilters** → Обновляет состояние `filters`
6. **Home.tsx** → Передает обновленные `filters` в `SearchComponent`
7. **SearchComponent** → Получает новые `filters` через props
8. **useSearch** → Видит изменение в `filters` (React Query dependency)
9. **React Query** → Автоматически делает новый запрос к API
10. **Результаты** → Обновляются в реальном времени!

### Пример работы:

1. **Поиск "Naruto"** → Показываются все Naruto аниме
2. **Выбор жанра "Романтика"** → 
   - FilterPanel: `onChange({ genres: ['22'] })`
   - Home: `setFilter('genres', ['22'])`
   - useFilters: обновляет `filters = { genres: ['22'] }`
   - SearchComponent: получает новые `filters`
   - useSearch: делает запрос с `?genre=22`
   - API: возвращает только аниме с жанром "Романтика"
3. **Результат** → Naruto исчезает (если нет жанра "Романтика")

## Тестирование

### Проверьте:

1. **Поиск аниме** (например, "Naruto")
2. **Выберите жанр** который НЕ подходит (например, "Романтика")
   - ✅ Результаты должны обновиться
   - ✅ Naruto должен исчезнуть
3. **Выберите год** (например, 2020-2024)
   - ✅ Должны остаться только аниме из этого диапазона
4. **Выберите тип** (например, "Фильм")
   - ✅ Должны остаться только фильмы
5. **Очистите фильтры**
   - ✅ Должны вернуться все результаты по запросу

## Файлы изменены

- `src/components/anime/SearchComponent.tsx` - убран useFilters, фильтры из props
- `src/pages/Home.tsx` - реализован handleFilterChange с setFilter

## Сборка

✅ Сборка успешна без ошибок
✅ TypeScript проверки пройдены
✅ Все предупреждения исправлены

## Статус

✅ **ИСПРАВЛЕНО** - Фильтры теперь работают в реальном времени
