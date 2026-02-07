# Финальные исправления

## Исправлено

### 1. ✅ 406 ошибка в voice_stats

**Проблема:** 
```
jpbuefpldspvdltdeoub.supabase.co/rest/v1/voice_stats?select=voice_name&user_id=eq.14387225-5ffa-4b4c-9091-918deddc0bc3&anime_id=eq.1535:1
Failed to load resource: the server responded with a status of 406 ()
```

**Причина:** Использование `.single()` в Supabase запросе. Метод `.single()` ожидает ровно одну запись и возвращает 406 если записей 0 или больше 1.

**Решение:** Заменили `.single()` на `.maybeSingle()` в методе `getUserVoiceSelection()`:

```typescript
// Было:
.single();

// Стало:
.maybeSingle(); // Обрабатывает 0 или 1 результат без ошибки
```

**Файл:** `src/services/voiceStats.service.ts`

### 2. ✅ Кнопка "Показать связанные" не работала

**Проблема:** При нажатии на кнопку ничего не происходило.

**Причины:**
1. `toggleGroup` вызывал `expandGroup` асинхронно, но не ждал результата
2. Race condition между обновлением состояния и загрузкой данных
3. Отсутствие индикатора загрузки

**Решение:**

#### 1. Исправлен `toggleGroup` в `useSearch.ts`:
```typescript
// Теперь async и правильно обрабатывает последовательность:
const toggleGroup = useCallback(
  async (animeId: number) => {
    // 1. Получаем текущее состояние
    const currentData = queryClient.getQueryData<GroupedAnime[]>(...);
    const group = currentData.find((g) => g.main.id === animeId);
    
    const newIsExpanded = !group.isExpanded;

    // 2. Если раскрываем и нет данных - загружаем
    if (newIsExpanded && group.related.length === 0) {
      await expandGroup(animeId); // Ждем загрузки!
    } else {
      // 3. Просто переключаем состояние
      queryClient.setQueryData(...);
    }
  },
  [queryClient, query, filters, page, expandGroup]
);
```

#### 2. Упрощен `handleToggleGroup` в `SearchComponent.tsx`:
```typescript
const handleToggleGroup = useCallback(
  async (animeId: number) => {
    setLoadingGroups((prev) => new Set(prev).add(animeId));
    try {
      await toggleGroup(animeId); // Просто вызываем и ждем
    } finally {
      setLoadingGroups((prev) => {
        const next = new Set(prev);
        next.delete(animeId);
        return next;
      });
    }
  },
  [toggleGroup]
);
```

#### 3. Добавлен индикатор загрузки:
```typescript
// Состояние загрузки
const [loadingGroups, setLoadingGroups] = React.useState<Set<number>>(new Set());

// В кнопке:
{loadingGroups.has(group.main.id) ? (
  <>
    <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
    Загрузка...
  </>
) : group.isExpanded ? (
  // Скрыть связанные
) : (
  // Показать связанные
)}
```

## Как это работает теперь

### Кнопка "Показать связанные":

1. **Клик** → `handleToggleGroup(animeId)` вызывается
2. **Добавляем в loadingGroups** → Кнопка показывает "Загрузка..."
3. **Вызываем toggleGroup** → Проверяет нужно ли загружать данные
4. **Если нужно** → `expandGroup` загружает связанные аниме из Shikimori API
5. **Обновляем кэш** → React Query обновляет данные
6. **Убираем из loadingGroups** → Кнопка показывает "Скрыть связанные"
7. **Рендер** → Связанные аниме отображаются

### Voice Stats:

1. **Загрузка статистики** → `getUserVoiceSelection()` использует `.maybeSingle()`
2. **Если записи нет** → Возвращает `null` без ошибки 406
3. **Если запись есть** → Возвращает `voice_name`
4. **Отображение** → Tooltip показывает статистику и выделяет выбор пользователя

## Тестирование

### Проверьте:

1. **Поиск аниме** (например, "Naruto")
2. **Нажмите "Показать связанные"**
   - Должен появиться спиннер "Загрузка..."
   - Через 1-2 секунды должны загрузиться связанные аниме
   - Кнопка изменится на "Скрыть связанные"
3. **Нажмите "Скрыть связанные"**
   - Связанные аниме должны скрыться мгновенно
4. **Voice Stats**
   - Откройте страницу аниме
   - Наведите на "Какую озвучку выбрать?"
   - Должна появиться статистика (или "Пока нет данных")
   - Ошибки 406 больше не должно быть

## Файлы изменены

- `src/services/voiceStats.service.ts` - `.single()` → `.maybeSingle()`
- `src/hooks/useSearch.ts` - async `toggleGroup` с правильной последовательностью
- `src/components/anime/SearchComponent.tsx` - индикатор загрузки для кнопки

## Сборка

✅ Сборка успешна без ошибок
✅ TypeScript проверки пройдены
✅ Все предупреждения исправлены
