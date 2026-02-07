# Улучшения поиска связанных аниме

## Проблема

Кнопка "Показать связанные" работала, но для некоторых аниме не находила связанные тайтлы, хотя они должны были быть. Пользователь не понимал, есть ли связанные аниме или просто произошла ошибка.

## Причины

1. **API возвращает пустой массив** - Shikimori API может не иметь информации о связанных аниме для некоторых тайтлов
2. **API возвращает не только аниме** - В ответе могут быть манга, ранобэ и другие типы контента
3. **Отсутствие обратной связи** - Пользователь не видел, что связанных аниме нет
4. **Недостаточное логирование** - Сложно было отладить проблему

## Решения

### 1. Улучшено логирование в `expandGroup` (useSearch.ts)

```typescript
console.log(`[expandGroup] Loading related anime for ID: ${animeId}`);
const related = await shikimoriService.getRelatedAnime(animeId);
console.log(`[expandGroup] Found ${related.length} related anime:`, related);
```

**Что это дает:**
- Видно какой ID запрашивается
- Видно сколько связанных аниме найдено
- Можно отследить весь процесс загрузки

### 2. Обработка ошибок с показом пустого состояния

```typescript
catch (error) {
  console.error('[expandGroup] Failed to load related anime:', error);
  
  // Все равно помечаем как раскрытое, чтобы показать пустое состояние
  queryClient.setQueryData<GroupedAnime[]>(
    ['search', query, filters, page],
    (oldData) => {
      if (!oldData) return oldData;
      return oldData.map((group) => {
        if (group?.main?.id === animeId) {
          return { ...group, related: [], isExpanded: true };
        }
        return group;
      });
    }
  );
  
  setExpandedGroups((prev) => new Set(prev).add(animeId));
}
```

**Что это дает:**
- Даже при ошибке пользователь видит результат
- Группа раскрывается и показывает "Связанные аниме не найдены"
- Не нужно повторно нажимать кнопку

### 3. Фильтрация только аниме в `getRelatedAnime` (shikimori.ts)

```typescript
// Проверяем что data это массив
if (!Array.isArray(data)) {
  console.warn(`[Shikimori] Expected array but got:`, typeof data);
  return [];
}

// Фильтруем только аниме (не манга и т.д.)
const animeOnly = data.filter((item: any) => {
  const isAnime = item.anime && typeof item.anime === 'object';
  if (!isAnime) {
    console.log(`[Shikimori] Skipping non-anime item:`, item);
  }
  return isAnime;
});

console.log(`[Shikimori] Filtered ${animeOnly.length} anime from ${data.length} total items`);
```

**Что это дает:**
- Показываем только аниме, не манга/ранобэ
- Логируем что было отфильтровано
- Защита от некорректных данных API

### 4. Показ сообщения когда связанных нет (SearchComponent.tsx)

```typescript
{group.isExpanded && (
  <div className="ml-8 pl-4 border-l-2 border-gray-700">
    {group.related.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Карточки связанных аниме */}
      </div>
    ) : (
      <div className="py-4 text-center text-gray-500 text-sm">
        Связанные аниме не найдены
      </div>
    )}
  </div>
)}
```

**Что это дает:**
- Пользователь видит что поиск выполнен
- Понятно что связанных аниме действительно нет
- Не создается впечатление что кнопка не работает

## Как это работает теперь

### Успешный сценарий:

1. **Клик** → "Показать связанные"
2. **Загрузка** → Спиннер "Загрузка..."
3. **API запрос** → Shikimori API `/animes/{id}/related`
4. **Фильтрация** → Оставляем только аниме
5. **Отображение** → Карточки связанных аниме

### Сценарий без связанных:

1. **Клик** → "Показать связанные"
2. **Загрузка** → Спиннер "Загрузка..."
3. **API запрос** → Shikimori API возвращает `[]`
4. **Отображение** → "Связанные аниме не найдены"

### Сценарий с ошибкой:

1. **Клик** → "Показать связанные"
2. **Загрузка** → Спиннер "Загрузка..."
3. **Ошибка** → Сеть/API недоступен
4. **Отображение** → "Связанные аниме не найдены"
5. **Консоль** → Детальная информация об ошибке

## Отладка

Теперь в консоли браузера можно увидеть:

```
[expandGroup] Loading related anime for ID: 1535
[Shikimori] Fetching related anime for ID: 1535
[Shikimori] Related anime response for 1535: [...]
[Shikimori] Filtered 5 anime from 7 total items
[expandGroup] Found 5 related anime: [...]
```

Или если связанных нет:

```
[expandGroup] Loading related anime for ID: 12345
[Shikimori] Fetching related anime for ID: 12345
[Shikimori] Related anime response for 12345: []
[Shikimori] Filtered 0 anime from 0 total items
[expandGroup] Found 0 related anime: []
```

## Тестирование

### Проверьте:

1. **Аниме с связанными** (например, "Naruto" - ID 20)
   - Должны загрузиться сиквелы, приквелы
   - В консоли видно количество найденных

2. **Аниме без связанных** (например, standalone фильм)
   - Должно показать "Связанные аниме не найдены"
   - Не должно быть ошибок

3. **Проверка консоли**
   - Откройте DevTools (F12)
   - Нажмите "Показать связанные"
   - Проверьте логи с префиксом `[expandGroup]` и `[Shikimori]`

## Файлы изменены

- `src/hooks/useSearch.ts` - улучшено логирование и обработка ошибок
- `src/services/shikimori.ts` - фильтрация только аниме, детальное логирование
- `src/components/anime/SearchComponent.tsx` - показ сообщения когда связанных нет

## Сборка

✅ Сборка успешна без ошибок
✅ TypeScript проверки пройдены
✅ Все предупреждения исправлены

## Статус

✅ **УЛУЧШЕНО** - Поиск связанных аниме работает лучше с детальным логированием и обратной связью
