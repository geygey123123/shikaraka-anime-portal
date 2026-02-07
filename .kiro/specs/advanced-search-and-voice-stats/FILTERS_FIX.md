# Исправление работы фильтров в реальном времени

## Проблема

Фильтры не работали в реальном времени. При изменении фильтров (жанры, год, тип, статус) результаты поиска не обновлялись. Например:
- Поиск "Naruto"
- Выбор жанров которые не подходят под Naruto
- Naruto все равно остается в результатах

## Причина

Проблема была в архитектуре передачи фильтров:

```typescript
// Home.tsx
const { filters } = useFilters(); // Фильтры из Home

<SearchComponent
  initialFilters={filters} // ❌ Передавались как initialFilters
/>

// SearchComponent.tsx
const { filters } = useFilters(initialFilters); // ❌ Создавался НОВЫЙ экземпляр useFilters
```

**Что происходило:**
1. `Home.tsx` создавал свой экземпляр `useFilters()`
2. `SearchComponent` создавал СВОЙ экземпляр `useFilters(initialFilters)`
3. Когда пользователь менял фильтры в `FilterPanel`, обновлялся экземпляр из `Home.tsx`
4. Но `SearchComponent` использовал СВОЙ экземпляр, который не обновлялся!

## Решение

Передавать фильтры напрямую как prop, без создания нового экземпляра:

### 1. Изменен интерфейс SearchComponent

```typescript
// Было:
interface SearchComponentProps {
  initialFilters?: SearchFilters; // ❌
}

// Стало:
interface SearchComponentProps {
  filters?: SearchFilters; // ✅ Прямая передача
}
```

### 2. Убран useFilters из SearchComponent

```typescript
// Было:
const { filters } = useFilters(initialFilters); // ❌ Создавал новый экземпляр

// Стало:
// Просто используем filters из props ✅
const { results, isLoading, error, toggleGroup, refetch } = useSearch(
  debouncedQuery,
  filters, // ✅ Используем напрямую из props
  { pageSize: 20 }
);
```

### 3. Обновлен Home.tsx

```typescript
// Было:
<SearchComponent
  initialFilters={filters} // ❌
/>

// Стало:
<SearchComponent
  filters={filters} // ✅ Прямая передача
/>
```

## Как это работает теперь

### Поток данных:

1. **useFilters в Home.tsx** → Единственный источник истины для фильтров
2. **FilterPanel** → Изменяет фильтры через `onChange`
3. **Home.tsx** → Получает обновленные фильтры
4. **SearchComponent** → Получает фильтры как prop
5. **useSearch** → Использует фильтры для запроса к API
6. **React Query** → Автоматически перезапрашивает данные при изменении фильтров

### Пример работы:

1. **Поиск "Naruto"** → Показываются все Naruto аниме
2. **Выбор жанра "Романтика"** → 
   - FilterPanel вызывает `onChange(newFilters)`
   - Home.tsx обновляет `filters`
   - SearchComponent получает новые `filters` через props
   - useSearch видит изменение в `filters`
   - React Query автоматически делает новый запрос
   - Результаты обновляются в реальном времени
3. **Результат** → Показываются только Naruto аниме с жанром "Романтика"

## Тестирование

### Проверьте:

1. **Поиск аниме** (например, "Naruto")
2. **Выберите жанр** который НЕ подходит (например, "Романтика")
   - ✅ Результаты должны обновиться
   - ✅ Naruto должен исчезнуть если не подходит под фильтр
3. **Выберите год** (например, 2020-2024)
   - ✅ Должны остаться только аниме из этого диапазона
4. **Выберите тип** (например, "Фильм")
   - ✅ Должны остаться только фильмы
5. **Очистите фильтры**
   - ✅ Должны вернуться все результаты по запросу

## Файлы изменены

- `src/components/anime/SearchComponent.tsx` - убран useFilters, фильтры из props
- `src/pages/Home.tsx` - передача filters вместо initialFilters

## Сборка

✅ Сборка успешна без ошибок
✅ TypeScript проверки пройдены
✅ Все предупреждения исправлены

## Статус

✅ **ИСПРАВЛЕНО** - Фильтры теперь работают в реальном времени
